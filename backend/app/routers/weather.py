from fastapi import APIRouter, Query
from typing import Optional, List, Dict
from app.models.schemas import WeatherResponse
from app.services.weather_service import fetch_open_meteo_forecast

router = APIRouter(tags=["Weather Advisory"])

POPULAR_AGRI_DISTRICTS = [
    {"name": "Prayagraj", "state": "Uttar Pradesh", "label": "Prayagraj (प्रयागराज)"},
    {"name": "Meerut", "state": "Uttar Pradesh", "label": "Meerut (मेरठ)"},
    {"name": "Agra", "state": "Uttar Pradesh", "label": "Agra (आगरा)"},
    {"name": "Ludhiana", "state": "Punjab", "label": "Ludhiana (लुधियाना)"},
    {"name": "Karnal", "state": "Haryana", "label": "Karnal (करनाल)"},
    {"name": "Indore", "state": "Madhya Pradesh", "label": "Indore (इंदौर)"},
    {"name": "Kota", "state": "Rajasthan", "label": "Kota (कोटा)"},
    {"name": "Nashik", "state": "Maharashtra", "label": "Nashik (नासिक)"},
    {"name": "Patna", "state": "Bihar", "label": "Patna (पटना)"},
    {"name": "Rajkot", "state": "Gujarat", "label": "Rajkot (राजकोट)"}
]

@router.get("", response_model=WeatherResponse)
@router.get("/", response_model=WeatherResponse, include_in_schema=False)
def get_weather(
    location: str = Query("Prayagraj", description="District or city name (e.g., 'Prayagraj')"),
    state: Optional[str] = Query("Uttar Pradesh", description="State name (e.g., 'Uttar Pradesh')"),
    force_refresh: bool = Query(False, description="Bypass 30-minute cache and fetch fresh from Open-Meteo")
):
    """
    Fetches real-time weather and 7-day agricultural forecast from Open-Meteo API.
    Dynamically resolves coordinates using Open-Meteo Geocoding API.
    Cached for 30 minutes.
    """
    data = fetch_open_meteo_forecast(
        location=location,
        state=state,
        force_refresh=force_refresh
    )
    return data

@router.get("/locations")
@router.get("/locations/", include_in_schema=False)
def get_popular_locations():
    """
    Returns popular agricultural districts list for the UI selector.
    """
    return POPULAR_AGRI_DISTRICTS
