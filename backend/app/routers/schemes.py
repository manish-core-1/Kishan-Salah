from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import json
from pathlib import Path
from app.models.schemas import SchemeRecord

router = APIRouter(tags=["Govt Schemes"])

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "schemes_data.json"

def load_data() -> List[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[SchemeRecord])
@router.get("/", response_model=List[SchemeRecord], include_in_schema=False)
def get_schemes(
    category: Optional[str] = Query(None, description="Category filter"),
    search: Optional[str] = Query(None, description="Keyword search in any language")
):
    data = load_data()
    filtered = []
    
    category_lower = category.lower().strip() if category else None
    search_lower = search.lower().strip() if search else None

    for item in data:
        if category_lower and category_lower != "all" and item["category"].lower() != category_lower:
            continue
            
        if search_lower:
            # Check title in all languages
            title_match = any(search_lower in str(v).lower() for v in item["name"].values())
            summary_match = any(search_lower in str(v).lower() for v in item["summary"].values())
            category_match = search_lower in item["category"].lower()
            
            if not (title_match or summary_match or category_match):
                continue

        filtered.append(item)

    return filtered

@router.get("/categories")
@router.get("/categories/", include_in_schema=False)
def get_categories():
    data = load_data()
    cats = sorted(list(set(d["category"] for d in data)))
    return ["All"] + cats

@router.get("/{scheme_id}", response_model=SchemeRecord)
@router.get("/{scheme_id}/", response_model=SchemeRecord, include_in_schema=False)
def get_scheme_by_id(scheme_id: str):
    data = load_data()
    for item in data:
        if item["id"].lower() == scheme_id.lower():
            return item
    raise HTTPException(status_code=404, detail="Scheme not found")
