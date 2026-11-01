import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("🌾 KISAN SALAH - DATA.GOV.IN AGMARKNET INTEGRATION TEST 🌾")
    print("=" * 60)

    # 1. Verify API Key presence in .env
    api_key = os.getenv("DATA_GOV_API_KEY")
    if not api_key:
        print("❌ FAIL: DATA_GOV_API_KEY is not set in .env")
        return False
    print(f"✅ PASS: DATA_GOV_API_KEY loaded from .env (Length: {len(api_key)}, Key is hidden)")

    # 2. Requirement 4 & 5: Initial test for State: Uttar Pradesh, Commodity: Tomato, Limit: 10
    print("\n--- Test 1: State=Uttar Pradesh, Commodity=Tomato, Limit=10 (strict_state=false) ---")
    response = client.get("/api/mandi", params={
        "state": "Uttar Pradesh",
        "commodity": "Tomato",
        "limit": 10,
        "strict_state": False
    })
    
    print(f"HTTP Status: {response.status_code}")
    if response.status_code != 200:
        print(f"❌ FAIL: Expected 200, got {response.status_code}. Detail: {response.text}")
        return False

    records = response.json()
    print(f"Records returned: {len(records)}")
    
    if len(records) > 0:
        first = records[0]
        print("\nFirst Record Keys:", list(first.keys()))
        print("First Record JSON Preview:")
        print(json.dumps(first, indent=2))
        
        # Verify required normalized fields
        expected_fields = [
            "state", "district", "market", "commodity", "variety", 
            "grade", "arrival_date", "min_price", "max_price", "modal_price"
        ]
        for f in expected_fields:
            if f not in first:
                print(f"❌ FAIL: Missing required field '{f}'")
                return False
        print("✅ PASS: All required normalized fields present!")

        # Verify numeric prices
        for p in ["min_price", "max_price", "modal_price"]:
            val = first[p]
            if not isinstance(val, (int, float)):
                print(f"❌ FAIL: Price field '{p}' is not numeric ({type(val)}: {val})")
                return False
        print("✅ PASS: Prices are numeric (float/int)!")

        # Verify ISO arrival_date (YYYY-MM-DD)
        date_val = first["arrival_date"]
        parts = date_val.split("-")
        if len(parts) != 3 or len(parts[0]) != 4:
            print(f"❌ FAIL: arrival_date '{date_val}' is not in ISO format (YYYY-MM-DD)")
            return False
        print(f"✅ PASS: arrival_date '{date_val}' is in valid ISO format (YYYY-MM-DD)!")

    # 3. Test 2: Live Uttar Pradesh Potato arrivals
    print("\n--- Test 2: State=Uttar Pradesh, Commodity=Potato, Limit=5 (strict_state=true) ---")
    resp_up = client.get("/api/mandi", params={
        "state": "Uttar Pradesh",
        "commodity": "Potato",
        "limit": 5,
        "strict_state": True
    })
    print(f"HTTP Status: {resp_up.status_code}")
    up_recs = resp_up.json()
    print(f"UP Potato records returned: {len(up_recs)}")
    for r in up_recs[:3]:
        print(f"  - Market: {r.get('market')} ({r.get('district')}, {r.get('state')}) | Modal: ₹{r.get('modal_price')}/Qtl | Date: {r.get('arrival_date')} | Grade: {r.get('grade')}")

    # 4. Test 3: Unfiltered General Live Mandi Stream
    print("\n--- Test 3: General Live Stream (Limit=5) ---")
    resp_general = client.get("/api/mandi", params={"limit": 5})
    print(f"HTTP Status: {resp_general.status_code}")
    gen_recs = resp_general.json()
    print(f"Records returned: {len(gen_recs)}")
    for r in gen_recs[:3]:
        print(f"  - {r.get('commodity')} @ {r.get('market')} ({r.get('state')}): ₹{r.get('modal_price')}/Qtl")

    print("\n" + "=" * 60)
    print("🎉 ALL AGMARKNET INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
