import os
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx
from fastapi import HTTPException

WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 30 * 60  # 30 minutes in seconds

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
    url = "https://geocoding-api.open-meteo.com/v1/search"
    clean_loc = location.strip()
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

    try:
        with httpx.Client(headers=headers, timeout=15.0) as client:
            res = client.get(url, params=params)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Open-Meteo Geocoding API timed out.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Network error with Open-Meteo Geocoding: {str(e)}")

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=f"Open-Meteo Geocoding returned HTTP {res.status_code}")

    data = res.json()
    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail=f"Location '{location}' not found on Open-Meteo Geocoding API.")

    chosen = results[0]
    if state and state.strip().lower() != "all":
        target_state = state.strip().lower()
        for r in results:
            admin1 = str(r.get("admin1", "")).lower()
            if target_state in admin1 or admin1 in target_state:
                chosen = r
                break

    return {
        "name": chosen.get("name", location),
        "district": chosen.get("admin2") or chosen.get("name", location),
        "state": chosen.get("admin1", state or "India"),
        "country": chosen.get("country", "India"),
        "latitude": chosen["latitude"],
        "longitude": chosen["longitude"]
    }

def fetch_open_meteo_forecast(
    location: str = "Prayagraj",
    state: Optional[str] = "Uttar Pradesh",
    force_refresh: bool = False
) -> Dict[str, Any]:
    cache_key = f"{location.strip().lower()}:{state.strip().lower() if state else ''}"
    now = time.time()

    if not force_refresh and cache_key in WEATHER_CACHE:
        cached_entry = WEATHER_CACHE[cache_key]
        if now - cached_entry["cached_at"] < CACHE_TTL:
            cached_data = dict(cached_entry["data"])
            cached_data["cached"] = True
            return cached_data

    # 1. Geocode dynamically (No hardcoded coordinates!)
    geo = geocode_location(location, state)
    lat, lon = geo["latitude"], geo["longitude"]

    # 2. Fetch 7-day forecast from Open-Meteo Forecast API
    forecast_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max"
        ],
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m"
        ],
        "timezone": "Asia/Kolkata",
        "forecast_days": 7
    }

    headers = {
        "User-Agent": "KisanSalah-AgroApp/1.0",
        "Accept": "application/json"
    }

    try:
        with httpx.Client(headers=headers, timeout=20.0) as client:
            res = client.get(forecast_url, params=params)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Open-Meteo Forecast API timed out.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Network error with Open-Meteo Forecast: {str(e)}")

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=f"Open-Meteo Forecast returned HTTP {res.status_code}")

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

    # Generate tailored Agri-Advisories based on actual Open-Meteo conditions
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
        "advisory": {
            "hi": [irrigation_hi, spray_hi, crop_prot_hi],
            "en": [irrigation_en, spray_en, crop_prot_en],
            "pa": [irrigation_hi, spray_hi, crop_prot_hi],
            "mr": [irrigation_hi, spray_hi, crop_prot_hi]
        },
        "forecast": forecast_days
    }

    # Save to 30-minute cache
    WEATHER_CACHE[cache_key] = {
        "cached_at": now,
        "data": response_data
    }

    return response_data
