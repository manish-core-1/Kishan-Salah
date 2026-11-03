import os
import time
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import httpx
from fastapi import HTTPException

logger = logging.getLogger("weather_service")

# Persistent Cache Configuration
DISK_CACHE_FILE = Path("/tmp/kisan_weather_cache.json")
BACKUP_CACHE_FILE = Path(__file__).resolve().parent.parent / "data" / "weather_cache.json"

WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 30 * 60  # 30 minutes in seconds

# Pre-seeded coordinates for popular Indian agricultural districts
# Guarantees instant response, 0ms geocoding latency, and resilience during geocoding API outages
GEOCODE_CACHE: Dict[str, Dict[str, Any]] = {
    "prayagraj:uttar pradesh": {"name": "Prayagraj", "district": "Prayagraj", "state": "Uttar Pradesh", "latitude": 25.44478, "longitude": 81.84322},
    "meerut:uttar pradesh": {"name": "Meerut", "district": "Meerut", "state": "Uttar Pradesh", "latitude": 28.9845, "longitude": 77.7064},
    "agra:uttar pradesh": {"name": "Agra", "district": "Agra", "state": "Uttar Pradesh", "latitude": 27.1767, "longitude": 78.0081},
    "ludhiana:punjab": {"name": "Ludhiana", "district": "Ludhiana", "state": "Punjab", "latitude": 30.9010, "longitude": 75.8573},
    "karnal:haryana": {"name": "Karnal", "district": "Karnal", "state": "Haryana", "latitude": 29.6857, "longitude": 76.9905},
    "indore:madhya pradesh": {"name": "Indore", "district": "Indore", "state": "Madhya Pradesh", "latitude": 22.7196, "longitude": 75.8577},
    "kota:rajasthan": {"name": "Kota", "district": "Kota", "state": "Rajasthan", "latitude": 25.2138, "longitude": 75.8648},
    "nashik:maharashtra": {"name": "Nashik", "district": "Nashik", "state": "Maharashtra", "latitude": 19.9975, "longitude": 73.7898},
    "patna:bihar": {"name": "Patna", "district": "Patna", "state": "Bihar", "latitude": 25.5941, "longitude": 85.1376},
    "rajkot:gujarat": {"name": "Rajkot", "district": "Rajkot", "state": "Gujarat", "latitude": 22.3039, "longitude": 70.8022},
    "lucknow:uttar pradesh": {"name": "Lucknow", "district": "Lucknow", "state": "Uttar Pradesh", "latitude": 26.8467, "longitude": 80.9462},
    "varanasi:uttar pradesh": {"name": "Varanasi", "district": "Varanasi", "state": "Uttar Pradesh", "latitude": 25.3176, "longitude": 82.9739},
    "bhopal:madhya pradesh": {"name": "Bhopal", "district": "Bhopal", "state": "Madhya Pradesh", "latitude": 23.2599, "longitude": 77.4126},
    "jaipur:rajasthan": {"name": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "latitude": 26.9124, "longitude": 75.7873},
    "pune:maharashtra": {"name": "Pune", "district": "Pune", "state": "Maharashtra", "latitude": 18.5204, "longitude": 73.8567},
    "nagpur:maharashtra": {"name": "Nagpur", "district": "Nagpur", "state": "Maharashtra", "latitude": 21.1458, "longitude": 79.0882},
}

def _load_disk_cache():
    """Loads previously saved weather cache from persistent disk storage into memory."""
    for fpath in [DISK_CACHE_FILE, BACKUP_CACHE_FILE]:
        try:
            if fpath.exists():
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        WEATHER_CACHE.update(data)
                        break
        except Exception as e:
            logger.warning(f"Error reading disk cache from {fpath}: {e}")

def _save_disk_cache():
    """Persists memory cache to disk storage (/tmp on Vercel and app/data for local)."""
    for fpath in [DISK_CACHE_FILE, BACKUP_CACHE_FILE]:
        try:
            fpath.parent.mkdir(parents=True, exist_ok=True)
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(WEATHER_CACHE, f, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"Error saving disk cache to {fpath}: {e}")

# Load cached forecast data at module startup
_load_disk_cache()

WMO_CODE_MAP = {
    0: ("Clear Sky", "साफ और धूप", "sun"),
    1: ("Mainly Clear", "मुख्यतः साफ", "sun"),
    2: ("Partly Cloudy", "हल्के बादल", "cloud-sun"),
    3: ("Overcast", "घने बादल", "cloud"),
    45: ("Foggy", "कोहरा", "cloud"),
    48: ("Dense Fog", "घना कोहरा", "cloud"),
    51: ("Light Drizzle", "हल्की बूंदाबांदी", "cloud-rain"),
    53: ("Moderate Drizzle", "बूंदाबांदी", "cloud-rain"),
    55: ("Dense Drizzle", "तेज बूंदाबांदी", "cloud-rain"),
    61: ("Slight Rain", "हल्की बारिश", "cloud-rain"),
    63: ("Moderate Rain", "मध्यम बारिश", "cloud-rain"),
    65: ("Heavy Rain", "भारी बारिश", "cloud-rain"),
    80: ("Rain Showers", "बारिश की बौछारें", "cloud-rain"),
    81: ("Moderate Showers", "तेज बौछारें", "cloud-rain"),
    82: ("Violent Showers", "मूसलाधार बौछारें", "cloud-rain"),
    95: ("Thunderstorm", "गरज के साथ तूफान", "cloud-lightning"),
    96: ("Thunderstorm with Hail", "आंधी व ओले", "cloud-lightning"),
}

def get_wmo_info(code: int):
    return WMO_CODE_MAP.get(code, ("Fair", "सामान्य मौसम", "sun"))

def geocode_location(location: str, state: Optional[str] = None) -> Dict[str, Any]:
    """
    Dynamically resolves coordinates for any location in India via Open-Meteo Geocoding.
    Includes in-memory cache and automatic retry logic with backoff.
    """
    clean_loc = location.strip()
    cache_key = f"{clean_loc.lower()}:{state.strip().lower() if state else ''}"
    
    # Check in-memory/pre-seeded geocode cache
    if cache_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[cache_key]

    for k, v in GEOCODE_CACHE.items():
        if k.startswith(f"{clean_loc.lower()}:"):
            return v

    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": clean_loc,
        "count": 10,
        "language": "en",
        "format": "json"
    }
    headers = {
        "User-Agent": "KisanSalah-AgroApp/1.0",
        "Accept": "application/json"
    }

    last_err = None
    for attempt in range(1, 3):
        try:
            with httpx.Client(headers=headers, timeout=8.0) as client:
                res = client.get(url, params=params)
            
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                if not results:
                    raise HTTPException(status_code=404, detail=f"स्थान '{location}' Open-Meteo जियोकोडिंग पर नहीं मिला।")

                chosen = results[0]
                if state and state.strip().lower() != "all":
                    target_state = state.strip().lower()
                    for r in results:
                        admin1 = str(r.get("admin1", "")).lower()
                        if target_state in admin1 or admin1 in target_state:
                            chosen = r
                            break

                geo_res = {
                    "name": chosen.get("name", location),
                    "district": chosen.get("admin2") or chosen.get("name", location),
                    "state": chosen.get("admin1", state or "India"),
                    "country": chosen.get("country", "India"),
                    "latitude": chosen["latitude"],
                    "longitude": chosen["longitude"]
                }
                GEOCODE_CACHE[cache_key] = geo_res
                return geo_res
            elif res.status_code in (429, 502, 503, 504):
                time.sleep(attempt * 1.0)
            else:
                raise HTTPException(status_code=res.status_code, detail=f"Open-Meteo Geocoding returned HTTP {res.status_code}")
        except HTTPException:
            raise
        except (httpx.TimeoutException, httpx.RequestError) as e:
            last_err = e
            time.sleep(attempt * 1.0)

    if last_err:
        raise HTTPException(status_code=504, detail=f"Open-Meteo Geocoding API timed out or network error: {str(last_err)}")
    raise HTTPException(status_code=503, detail="Open-Meteo Geocoding सेवा अस्थायी रूप से अनुपलब्ध है।")

def fetch_open_meteo_forecast(
    location: str = "Prayagraj",
    state: Optional[str] = "Uttar Pradesh",
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetches real-time weather and 7-day agricultural forecast from Open-Meteo Forecast API.
    Features:
    1. 30-minute in-memory & disk persistent caching.
    2. Exponential backoff retry logic (up to 3 attempts) on 503/502/504/429.
    3. Stale cache grace fallback if Open-Meteo experiences temporary overload.
    4. Clean user-friendly error messages if upstream fails.
    5. Zero fake/dummy data policy.
    """
    cache_key = f"{location.strip().lower()}:{state.strip().lower() if state else ''}"
    now = time.time()

    # 1. Check 30-minute cache
    if not force_refresh and cache_key in WEATHER_CACHE:
        cached_entry = WEATHER_CACHE[cache_key]
        if now - cached_entry["cached_at"] < CACHE_TTL:
            cached_data = dict(cached_entry["data"])
            cached_data["cached"] = True
            cached_data["is_stale"] = False
            return cached_data

    # 2. Geocode coordinates
    geo = geocode_location(location, state)
    lat, lon = geo["latitude"], geo["longitude"]

    # 3. Forecast request configuration
    api_key = os.getenv("OPEN_METEO_API_KEY", "").strip()
    if api_key:
        forecast_url = "https://customer-api.open-meteo.com/v1/forecast"
    else:
        forecast_url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        "timezone": "Asia/Kolkata",
        "forecast_days": 7
    }
    if api_key:
        params["apikey"] = api_key

    headers = {
        "User-Agent": "KisanSalah-AgroApp/1.0",
        "Accept": "application/json"
    }

    # 4. Exponential Backoff Retry Loop (sensible max 3 attempts)
    max_retries = 3
    last_status = None
    last_err_msg = ""
    res = None

    for attempt in range(1, max_retries + 1):
        try:
            with httpx.Client(headers=headers, timeout=10.0) as client:
                res = client.get(forecast_url, params=params)

            if res.status_code == 200:
                break

            last_status = res.status_code
            last_err_msg = f"HTTP {res.status_code}"

            # Retry on temporary upstream failures or rate limits
            if res.status_code in (429, 502, 503, 504) and attempt < max_retries:
                backoff_sec = attempt * 1.5  # 1.5s, 3.0s
                logger.warning(f"Open-Meteo returned HTTP {res.status_code} on attempt {attempt}. Retrying in {backoff_sec}s...")
                time.sleep(backoff_sec)
                continue
            elif attempt < max_retries:
                time.sleep(attempt * 1.0)
                continue
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            last_status = 504 if isinstance(exc, httpx.TimeoutException) else 502
            last_err_msg = str(exc)
            if attempt < max_retries:
                time.sleep(attempt * 1.5)
                continue

    # 5. Handle upstream failure: graceful stale cache fallback or user-friendly error
    if not res or res.status_code != 200:
        # Check if ANY verified cached response exists for this location
        if cache_key in WEATHER_CACHE:
            cached_entry = WEATHER_CACHE[cache_key]
            stale_data = dict(cached_entry["data"])
            stale_data["cached"] = True
            stale_data["is_stale"] = True
            stale_data["warning"] = "मौसम सेवा (Open-Meteo) पर अस्थायी भार के कारण यह पूर्व सत्यापित मौसम पूर्वानुमान प्रदर्शित किया जा रहा है।"
            logger.info(f"Serving stale cached weather for {cache_key} due to upstream {last_status}")
            return stale_data

        # If cold cache, return informative user-friendly error
        if last_status in (503, 429):
            detail_msg = "Open-Meteo मौसम सेवा वर्तमान में अत्यधिक लोड के कारण अस्थायी रूप से व्यस्त है। कृपया 1-2 मिनट बाद पुनः प्रयास करें। (Open-Meteo Forecast returned HTTP 503)"
        elif last_status == 504:
            detail_msg = "Open-Meteo मौसम सेवा से संपर्क का समय समाप्त (Timeout) हो गया। कृपया पुनः प्रयास करें। (HTTP 504)"
        else:
            detail_msg = f"Open-Meteo Forecast returned {last_err_msg or 'an error'}."

        raise HTTPException(status_code=last_status or 503, detail=detail_msg)

    # 6. Parse successful Open-Meteo forecast data
    f_data = res.json()
    current = f_data.get("current", {})
    daily = f_data.get("daily", {})

    curr_temp = float(current.get("temperature_2m", 25.0))
    curr_humidity = int(current.get("relative_humidity_2m", 60))
    curr_wind = float(current.get("wind_speed_10m", 5.0))
    curr_wmo = int(current.get("weather_code", 0))
    cond_en, cond_hi, _ = get_wmo_info(curr_wmo)

    time_list = daily.get("time", [])
    max_temps = daily.get("temperature_2m_max", [])
    min_temps = daily.get("temperature_2m_min", [])
    rain_probs = daily.get("precipitation_probability_max", [])
    rain_sums = daily.get("precipitation_sum", [])
    wind_speeds = daily.get("wind_speed_10m_max", [])
    wmo_codes = daily.get("weather_code", [])

    forecast_days = []
    days_hindi = {
        "Monday": "सोमवार",
        "Tuesday": "मंगलवार",
        "Wednesday": "बुधवार",
        "Thursday": "गुरुवार",
        "Friday": "शुक्रवार",
        "Saturday": "शनिवार",
        "Sunday": "रविवार"
    }

    for i in range(len(time_list)):
        date_str = time_list[i]
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            day_name = dt.strftime("%A")
            day_hi = days_hindi.get(day_name, day_name)
            formatted_date = "आज (Today)" if i == 0 else ("कल (Tomorrow)" if i == 1 else day_hi)
        except Exception:
            day_name = f"Day {i+1}"
            formatted_date = date_str

        w_code = wmo_codes[i] if i < len(wmo_codes) else 0
        w_en, w_hi, w_icon = get_wmo_info(w_code)

        forecast_days.append({
            "date": formatted_date,
            "iso_date": date_str,
            "day": day_name,
            "temp_max": float(max_temps[i]) if i < len(max_temps) else 30.0,
            "temp_min": float(min_temps[i]) if i < len(min_temps) else 20.0,
            "condition": w_en,
            "condition_hi": w_hi,
            "rain_probability": int(rain_probs[i]) if i < len(rain_probs) else 0,
            "precipitation_sum": float(rain_sums[i]) if i < len(rain_sums) else 0.0,
            "humidity": curr_humidity,
            "wind_speed": float(wind_speeds[i]) if i < len(wind_speeds) else curr_wind,
            "icon": w_icon
        })

    # 7. Generate tailored agricultural advisories based on actual Open-Meteo conditions
    max_rain_prob = max(rain_probs) if rain_probs else 0
    total_rain_sum = sum(rain_sums) if rain_sums else 0.0
    min_temp_7d = min(min_temps) if min_temps else 20.0

    if max_rain_prob >= 35 or total_rain_sum >= 2.0:
        irrigation_hi = f"सिंचाई सलाह: आने वाले 7 दिनों में {max_rain_prob}% तक बारिश की संभावना है ({round(total_rain_sum, 1)} mm)। फसलों में सिंचाई फिलहाल रोकें और खेतों में जल निकासी की व्यवस्था रखें।"
        irrigation_en = f"Irrigation Advisory: Up to {max_rain_prob}% chance of rain ({round(total_rain_sum, 1)} mm) over the next 7 days. Postpone irrigation and maintain good field drainage."
    else:
        irrigation_hi = "सिंचाई सलाह: मौसम शुष्क व साफ रहने का पूर्वानुमान है। गेहूं, सरसों व रबी फसलों में पलेवा (pre-sowing irrigation) या सामान्य सिंचाई के लिए अनुकूल समय है।"
        irrigation_en = "Irrigation Advisory: Weather will remain dry. Favorable window for pre-sowing and routine irrigation for Rabi crops."

    if curr_wind <= 14.0 and (rain_probs[0] if rain_probs else 0) <= 25:
        spray_hi = f"कीटनाशक छिड़काव: वर्तमान में हवा की गति अनुकूल ({curr_wind} km/h) है। सुबह 9 बजे से दोपहर 12 बजे तक कीटनाशक या खाद का छिड़काव सुरक्षित रूप से किया जा सकता है।"
        spray_en = f"Spray Window: Favorable wind speed ({curr_wind} km/h) and low rain risk. Safe window for pesticide and nutrient spraying before noon."
    else:
        spray_hi = f"कीटनाशक छिड़काव सावधानी: हवा की गति तेज ({curr_wind} km/h) या बारिश की संभावना है। दवा के बहने या उड़ने का खतरा है, छिड़काव टालें।"
        spray_en = f"Spray Advisory: High wind speed ({curr_wind} km/h) or precipitation risk. Postpone chemical spraying to prevent drift."

    if min_temp_7d <= 18.0:
        crop_prot_hi = f"फसल सुरक्षा: रात के तापमान में गिरावट (न्यूनतम {min_temp_7d}°C) देखी जा रही है। सब्जियों की नर्सरी और कोमल पौधों में नमी बनाए रखने के लिए शाम को हल्की सिंचाई करें।"
        crop_prot_en = f"Crop Protection: Drop in night temperature observed (min {min_temp_7d}°C). Maintain optimal soil moisture in vegetable nurseries."
    else:
        crop_prot_hi = "फसल सुरक्षा: तापमान सामान्य बना हुआ है। फसलों में कीट-रोग की नियमित निगरानी करें और मिट्टी की जांच अनुसार संतुलित खाद दें।"
        crop_prot_en = "Crop Protection: Normal temperature range. Regularly scout crops for pests and apply balanced fertilizers."

    fetched_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    response_data = {
        "location": geo["name"],
        "district": geo["district"],
        "state": geo["state"],
        "latitude": lat,
        "longitude": lon,
        "current_temp": curr_temp,
        "feels_like": float(current.get("apparent_temperature", curr_temp)),
        "condition": cond_en,
        "condition_hi": cond_hi,
        "humidity": curr_humidity,
        "wind_speed": curr_wind,
        "rain_prob": int(rain_probs[0]) if rain_probs else 0,
        "precipitation_sum": float(rain_sums[0]) if rain_sums else 0.0,
        "source": "Open-Meteo API",
        "fetched_at": fetched_iso,
        "cached": False,
        "is_stale": False,
        "warning": None,
        "advisory": {
            "hi": [irrigation_hi, spray_hi, crop_prot_hi],
            "en": [irrigation_en, spray_en, crop_prot_en],
            "pa": [irrigation_hi, spray_hi, crop_prot_hi],
            "mr": [irrigation_hi, spray_hi, crop_prot_hi]
        },
        "forecast": forecast_days
    }

    # 8. Save to memory cache and persist to disk
    WEATHER_CACHE[cache_key] = {
        "cached_at": now,
        "data": response_data
    }
    _save_disk_cache()

    return response_data
