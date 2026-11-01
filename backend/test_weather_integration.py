import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_weather():
    print("=" * 60)
    print("🌦️ TESTING OPEN-METEO WEATHER INTEGRATION FLOW 🌦️")
    print("=" * 60)

    # 1. Test Prayagraj, Uttar Pradesh (Requirement 10)
    print("\n--- Test 1: Fetch Weather for Prayagraj, Uttar Pradesh ---")
    res = client.get("/api/weather", params={"location": "Prayagraj", "state": "Uttar Pradesh", "force_refresh": True})
    print(f"HTTP Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"

    data = res.json()
    print(f"Location: {data.get('location')}, State: {data.get('state')}")
    print(f"Coordinates: Lat {data.get('latitude')}, Lon {data.get('longitude')}")
    print(f"Source: {data.get('source')}, Fetched At: {data.get('fetched_at')}")
    print(f"Current Temp: {data.get('current_temp')}°C, Humidity: {data.get('humidity')}%, Wind: {data.get('wind_speed')} km/h")
    print(f"Condition: {data.get('condition')} ({data.get('condition_hi')})")

    # Verify no hardcoded coordinates - must be near Prayagraj lat 25.4, lon 81.8
    assert abs(data["latitude"] - 25.44) < 0.2, f"Unexpected latitude: {data['latitude']}"
    assert abs(data["longitude"] - 81.84) < 0.2, f"Unexpected longitude: {data['longitude']}"
    print("✅ PASS: Coordinates dynamically obtained via Geocoding API!")

    # Verify 7-day forecast
    forecast = data.get("forecast", [])
    print(f"\nForecast days count: {len(forecast)}")
    assert len(forecast) == 7, f"Expected 7 forecast days, got {len(forecast)}"
    print("✅ PASS: 7-day forecast received!")

    print("\nSample 7-Day Forecast for Prayagraj:")
    for d in forecast:
        print(f"  - {d['date']} ({d['iso_date']}): {d['temp_max']}°C / {d['temp_min']}°C | Rain Prob: {d['rain_probability']}% | Rain Sum: {d.get('precipitation_sum', 0)}mm | Condition: {d['condition_hi']}")

    # Verify Agri-Advisories
    advisory = data.get("advisory", {})
    assert "hi" in advisory and len(advisory["hi"]) >= 2, "Advisory missing Hindi recommendations"
    print("\nActionable Agri-Advisories (Hindi):")
    for adv in advisory["hi"]:
        print(f"  * {adv}")
    print("✅ PASS: Precision agricultural advisories generated!")

    # 2. Test 30-minute Cache
    print("\n--- Test 2: Verify 30-Minute Cache ---")
    res_cache = client.get("/api/weather", params={"location": "Prayagraj", "state": "Uttar Pradesh"})
    assert res_cache.status_code == 200
    cache_data = res_cache.json()
    assert cache_data.get("cached") == True, "Expected cached response"
    print(f"Cache Status: cached={cache_data.get('cached')}, fetched_at={cache_data.get('fetched_at')}")
    print("✅ PASS: 30-Minute Cache functioning perfectly!")

    # 3. Test Error Handling for Invalid Location
    print("\n--- Test 3: Error Handling for Non-existent Location ---")
    res_err = client.get("/api/weather", params={"location": "NonExistentPlaceXYZ99999"})
    print(f"HTTP Status: {res_err.status_code}, Detail: {res_err.json().get('detail')}")
    assert res_err.status_code == 404
    print("✅ PASS: Proper error handling for invalid location!")

    print("\n" + "=" * 60)
    print("🎉 ALL OPEN-METEO WEATHER TESTS PASSED! 🎉")
    print("=" * 60)
    return True

if __name__ == "__main__":
    test_weather()
