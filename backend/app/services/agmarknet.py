import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

# Ensure .env is loaded
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

HINDI_COMMODITY_MAP = {
    "tomato": "टमाटर",
    "potato": "आलू",
    "onion": "प्याज",
    "onion green": "हरा प्याज",
    "wheat": "गेहूं",
    "mustard": "सरसों / राई",
    "paddy(basmati)": "बासमती धान",
    "paddy(common)": "साधारण धान",
    "cotton": "कपास (नरमा)",
    "soyabean": "सोयाबीन",
    "soybean": "सोयाबीन",
    "maize": "मक्का",
    "bengal gram(gram)(whole)": "चना (देसी)",
    "apple": "सेब",
    "banana": "केला",
    "brinjal": "बैंगन",
    "cabbage": "पत्तागोभी",
    "cauliflower": "फूलगोभी",
    "carrot": "गाजर",
    "bhindi(ladies finger)": "भिंडी",
    "bottle gourd": "लौकी",
    "bitter gourd": "करेला",
    "garlic": "लहसुन",
    "ginger(green)": "अदरक"
}

COMMODITY_QUERY_MAP = {
    "basmati paddy": "Paddy(Basmati)",
    "paddy": "Paddy(Basmati)",
    "wheat": "Wheat",
    "mustard": "Mustard",
    "cotton": "Cotton",
    "potato": "Potato",
    "onion": "Onion",
    "soybean": "Soyabean",
    "tomato": "Tomato",
    "maize": "Maize",
    "gram (chana)": "Bengal Gram(Gram)(Whole)",
    "chana": "Bengal Gram(Gram)(Whole)"
}

def get_api_key() -> str:
    key = os.getenv("DATA_GOV_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=500,
            detail="DATA_GOV_API_KEY is not configured. Please add DATA_GOV_API_KEY in Vercel Environment Variables or your .env file."
        )
    return key

def parse_iso_date(date_str: str) -> str:
    if not date_str:
        return ""
    try:
        dt = datetime.strptime(date_str.strip(), "%d/%m/%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        try:
            dt = datetime.fromisoformat(date_str.strip())
            return dt.strftime("%Y-%m-%d")
        except Exception:
            return date_str.strip()

AGMARKNET_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_AGMARKNET = 15 * 60  # 15 minutes

def to_numeric(val: Any) -> float:
    if val is None or val == "":
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0

def fetch_agmarknet_data(
    state: Optional[str] = None,
    commodity: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    strict_state: bool = True
) -> List[Dict[str, Any]]:
    import time
    cache_key = f"{str(state).strip().lower()}:{str(commodity).strip().lower()}:{limit}:{offset}:{str(search).strip().lower()}"
    now = time.time()
    if cache_key in AGMARKNET_CACHE:
        entry = AGMARKNET_CACHE[cache_key]
        if now - entry["cached_at"] < CACHE_TTL_AGMARKNET:
            return list(entry["data"])

    api_key = get_api_key()

    params: Dict[str, Any] = {
        "api-key": api_key,
        "format": "json",
        "offset": offset,
        "limit": min(limit, 200)
    }

    if state and state.strip().lower() != "all":
        params["filters[state]"] = state.strip()

    if commodity and commodity.strip().lower() != "all":
        comm_clean = commodity.strip().lower()
        query_comm = COMMODITY_QUERY_MAP.get(comm_clean, commodity.strip())
        params["filters[commodity]"] = query_comm

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }

    try:
        with httpx.Client(headers=headers, timeout=25.0) as client:
            response = client.get(BASE_URL, params=params)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Data.gov.in Agmarknet API timed out. Please try again shortly."
        )
    except httpx.RequestError as e:
        # Sanitize error message to prevent any key leakage
        clean_msg = str(e).replace(api_key, "[REDACTED]")
        raise HTTPException(
            status_code=502,
            detail=f"Network error communicating with Data.gov.in: {clean_msg}"
        )

    if response.status_code == 429:
        raise HTTPException(
            status_code=429,
            detail="Data.gov.in API rate limit exceeded. Please try again after a few seconds."
        )
    elif response.status_code in (401, 403):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: Please verify that DATA_GOV_API_KEY is valid."
        )
    elif response.status_code >= 500:
        raise HTTPException(
            status_code=502,
            detail=f"Data.gov.in upstream server error (HTTP {response.status_code})."
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Data.gov.in returned HTTP {response.status_code} error."
        )

    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Data.gov.in returned an invalid JSON response."
        )

    raw_records = data.get("records", [])
    if not raw_records:
        return []

    normalized_list = []
    search_lower = search.strip().lower() if search else None
    target_state_lower = state.strip().lower() if (state and state.strip().lower() != "all") else None

    for idx, r in enumerate(raw_records):
        st = str(r.get("state", "")).strip()
        dist = str(r.get("district", "")).strip()
        mkt = str(r.get("market", "")).strip()
        comm = str(r.get("commodity", "")).strip()
        var = str(r.get("variety", "")).strip()
        grd = str(r.get("grade", "")).strip()

        # Strict state filter if user specified a state and API's token match returned other states
        if strict_state and target_state_lower:
            if st.lower() != target_state_lower:
                continue

        # Optional keyword search
        if search_lower:
            text = f"{st} {dist} {mkt} {comm} {var} {grd}".lower()
            if search_lower not in text:
                continue

        comm_lower = comm.lower()
        hindi_name = HINDI_COMMODITY_MAP.get(comm_lower, comm)

        min_p = to_numeric(r.get("min_price"))
        max_p = to_numeric(r.get("max_price"))
        mod_p = to_numeric(r.get("modal_price"))
        mid_p = (min_p + max_p) / 2.0 if (min_p > 0 and max_p > 0) else mod_p

        if mod_p > mid_p and (max_p - min_p) > 0:
            trend_val = "up"
            change_val = round(mod_p - mid_p, 1)
        elif mod_p < mid_p and (max_p - min_p) > 0:
            trend_val = "down"
            change_val = round(mod_p - mid_p, 1)
        else:
            trend_val = "stable"
            change_val = 0.0

        norm = {
            "id": f"gov-{st[:3]}-{dist[:3]}-{idx}-{abs(hash(mkt + comm)) % 10000}",
            "state": st,
            "district": dist,
            "market": mkt,
            "commodity": comm,
            "commodity_hi": hindi_name,
            "variety": var,
            "grade": grd,
            "arrival_date": parse_iso_date(r.get("arrival_date", "")),
            "min_price": min_p,
            "max_price": max_p,
            "modal_price": mod_p,
            "unit": "₹/Quintal",
            "price_change": change_val,
            "trend": trend_val
        }
        normalized_list.append(norm)

    if normalized_list:
        AGMARKNET_CACHE[cache_key] = {"cached_at": now, "data": normalized_list}

    return normalized_list
