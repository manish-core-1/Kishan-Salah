from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import MandiRecord
from app.services.agmarknet import fetch_agmarknet_data

router = APIRouter(tags=["Mandi Bhav"])

@router.get("", response_model=List[MandiRecord])
@router.get("/", response_model=List[MandiRecord], include_in_schema=False)
def get_mandi_prices(
    state: Optional[str] = Query(None, description="Filter by State (e.g., 'Uttar Pradesh', 'Punjab')"),
    commodity: Optional[str] = Query(None, description="Filter by Commodity (e.g., 'Tomato', 'Wheat')"),
    search: Optional[str] = Query(None, description="Search term for market, district or crop"),
    limit: int = Query(50, ge=1, le=200, description="Number of records to fetch"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    strict_state: bool = Query(True, description="Strictly match the requested state")
):
    """
    Fetch real-time daily mandi prices directly from Data.gov.in Agmarknet API.
    Normalizes all fields, converts prices to numeric values and arrival_date to ISO format.
    No mock data or fabricated responses.
    """
    records = fetch_agmarknet_data(
        state=state,
        commodity=commodity,
        limit=limit,
        offset=offset,
        search=search,
        strict_state=strict_state
    )
    return records

@router.get("/filters")
@router.get("/filters/", include_in_schema=False)
def get_filters():
    """
    Returns available standard states and popular commodities for UI dropdowns.
    """
    states = [
        "All",
        "Andhra Pradesh",
        "Bihar",
        "Chattisgarh",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Karnataka",
        "Keralam",
        "Madhya Pradesh",
        "Maharashtra",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Tamil Nadu",
        "Telangana",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal"
    ]
    commodities = [
        "All",
        "Tomato",
        "Potato",
        "Onion",
        "Wheat",
        "Mustard",
        "Paddy(Basmati)",
        "Paddy(Common)",
        "Cotton",
        "Soyabean",
        "Maize",
        "Bengal Gram(Gram)(Whole)",
        "Apple",
        "Banana",
        "Brinjal",
        "Cabbage",
        "Cauliflower",
        "Carrot",
        "Bhindi(Ladies Finger)",
        "Garlic"
    ]
    return {
        "states": states,
        "commodities": commodities
    }

@router.get("/summary")
@router.get("/summary/", include_in_schema=False)
def get_mandi_summary():
    """
    Returns high-level summary of live commodities from Data.gov.in.
    """
    records = fetch_agmarknet_data(limit=100)
    if not records:
        return {
            "total_active_mandis": 0,
            "top_gainers": [],
            "high_value_crops": [],
            "last_updated": "Aaj"
        }
    
    highest_priced = sorted(records, key=lambda x: x.get("modal_price", 0), reverse=True)[:5]
    
    return {
        "total_active_mandis": len(records),
        "high_value_crops": highest_priced,
        "last_updated": "Live Data.gov.in Agmarknet"
    }
