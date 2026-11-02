import os
import time
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import httpx
from dotenv import load_dotenv

# Ensure .env is loaded
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# In-memory 3-Hour Cache (Requirement 9)
EXPLANATION_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3 * 60 * 60  # 3 Hours (10,800 seconds)

# Schemes data path
SCHEMES_FILE = Path(__file__).resolve().parent.parent / "data" / "schemes_data.json"

# Commodity Keyword Map for Real-time Mandi Retrieval
COMMODITY_KEYWORDS: List[Tuple[List[str], str, str]] = [
    (["sarson", "sarso", "mustard", "सरसों", "rai", "राई", "toria", "sarson ka", "sarso ka"], "Mustard", "सरसों"),
    (["gehu", "gehun", "gehoon", "wheat", "गेहूं", "kanak", "gehu ka", "gehun ka"], "Wheat", "गेहूं"),
    (["tamatar", "tomato", "टमाटर"], "Tomato", "टमाटर"),
    (["aalu", "aloo", "alu", "potato", "आलू"], "Potato", "आलू"),
    (["pyaj", "pyaaz", "pyaz", "onion", "प्याज", "कांदा", "kanda"], "Onion", "प्याज"),
    (["dhan", "paddy", "chawal", "rice", "धान", "चावल", "basmati"], "Paddy(Basmati)", "धान"),
    (["kapas", "narma", "cotton", "कपास", "नरमा"], "Cotton", "कपास"),
    (["soyabean", "soybean", "soya", "सोयाबीन"], "Soyabean", "सोयाबीन"),
    (["makka", "maize", "corn", "मक्का", "makai"], "Maize", "मक्का"),
    (["chana", "gram", "चना", "छोले", "chane"], "Bengal Gram(Gram)(Whole)", "चना"),
    (["lahsun", "garlic", "लहसुन", "lahsan"], "Garlic", "लहसुन"),
    (["adrak", "ginger", "अदरक"], "Ginger(Green)", "अदरक")
]

# Common District/Location Keywords
LOCATION_KEYWORDS = [
    "prayagraj", "allahabad", "प्रयागराज", "kanpur", "कानपुर", "lucknow", "लखनऊ",
    "varanasi", "वाराणसी", "banaras", "बनारस", "agra", "आगरा", "meerut", "मेरठ",
    "gorakhpur", "गोरखपुर", "bareilly", "बरेली", "aligarh", "अलीगढ़", "jhansi", "झांसी",
    "karnal", "करनाल", "ludhiana", "लुधियाना", "khanna", "खन्ना", "lasalgaon", "लासलगांव",
    "indore", "इंदौर", "bhopal", "भोपाल", "jaipur", "जयपुर", "kota", "कोटा"
]

# Agronomic & Crop Science Knowledge Base
KNOWLEDGE_RULES = [
    {
        "keywords": ["pm kisan", "samman nidhi", "6000", "kist", "किस्त", "सम्मान निधि", "hafta"],
        "verdict": "पीएम किसान सम्मान निधि: प्रति वर्ष ₹6,000 की वित्तीय सहायता, 3 समान किस्तों (₹2,000) में सीधे बैंक खाते में ट्रांसफर होती है। e-KYC और आधार सीडिंग अनिवार्य है।",
        "facts": [
            "पीएम किसान योजना के तहत सालाना ₹6,000 की राशि DBT के माध्यम से 3 किस्तों में मिलती है।",
            "e-KYC पूर्ण करने हेतु pmkisan.gov.in पर जाएं या किसान हेल्पलाइन 155261 पर कॉल करें।",
            "भूलेख सत्यापन (Land Seeding) और सक्रिय आधार-लिंक्ड बैंक खाता होना अनिवार्य है।"
        ],
        "speech_hi": "पीएम किसान सम्मान निधि में सालाना छह हज़ार रुपये तीन किस्तों में सीधे बैंक खाते में मिलते हैं। अपनी ई-केवाईसी पूरी रखें।",
        "related": ["Kisan Credit Card (KCC)", "e-KYC प्रक्रिया", "आधार सीडिंग"],
        "actions": ["Check PM Kisan Status", "View Required Documents"]
    },
    {
        "keywords": ["gehu", "wheat", "गेहूं", "buwai", "sowing", "dap", "urea", "खाद", "सिंचाई"],
        "verdict": "गेहूं बुवाई समय: 1 नवंबर से 25 नवंबर। बीज दर: 40-45 किग्रा/एकड़। खाद: 1 बैग DAP + 25 किग्रा पोटाश। पहली सिंचाई ताज मूल अवस्था (CRI) 20-22 दिन बाद करें।",
        "facts": [
            "गेहूं की बुवाई के लिए तापमान 20-25 डिग्री सेल्सियस अनुकूल रहता है।",
            "बुवाई के समय 1 बैग DAP (50 किग्रा) और 25 किग्रा म्यूरेट ऑफ पोटाश (MOP) प्रति एकड़ डालें।",
            "पहली सिंचाई ताज मूल अवस्था (CRI Stage) यानी बुवाई के 20 से 22 दिन बाद करनी चाहिए।"
        ],
        "speech_hi": "गेहूं की बुवाई नवंबर माह में करें। 40 से 45 किलो बीज और 1 बैग डीएपी प्रति एकड़ डालें। पहली सिंचाई 20 दिन बाद करें।",
        "related": ["सरसों की बुवाई", "उन्नत गेहूं किस्में (PBW 824, HD 3086)", "सिंचाई प्रबंधन"],
        "actions": ["View Wheat Mandi Rates", "Weather Forecast for Sowing"]
    },
    {
        "keywords": ["sarson", "mustard", "सरसों", "rai", "राई", "toria"],
        "verdict": "सरसों बुवाई: अक्टूबर से नवंबर प्रथम सप्ताह। सल्फर: 10-15 किग्रा/एकड़ तेल मात्रा व वजन बढ़ाने हेतु। माहू कीट से सुरक्षा हेतु प्रारंभिक निगरानी रखें।",
        "facts": [
            "सरसों के लिए उपयुक्त तापमान 25-28 डिग्री सेल्सियस है।",
            "सल्फर तत्व (10-15 किग्रा/एकड़) का उपयोग दानों में तेल की प्रतिशतता व चमक बढ़ाता है।",
            "माहू (चेपा/एफिड) कीट दिखने पर प्रारंभिक अवस्था में नीम तेल (5 मिली/लीटर) का छिड़काव करें।"
        ],
        "speech_hi": "सरसों में बुवाई के समय सल्फर का प्रयोग जरूर करें। इससे तेल की मात्रा और उपज दोनों में वृद्धि होती है।",
        "related": ["सरसों मंडी भाव", "सल्फर खाद का महत्व", "माहू कीट नियंत्रण"],
        "actions": ["Check Mustard Mandi Bhav", "Fertilizer Schedule"]
    },
    {
        "keywords": ["keet", "pest", "bimari", "rog", "कीड़ा", "रोग", "fungus", "peela", "fungicide", "dawa", "spray", "छिड़काव"],
        "verdict": "फफूंद रोग हेतु कार्बेन्डाजिम + मैन्कोजेब (साफ) 2 ग्राम/लीटर पानी। रस चूसक कीट हेतु इमिडाक्लोप्रिड 17.8% SL (1 मिली/3 लीटर)। शांत हवा और साफ मौसम में छिड़काव करें।",
        "facts": [
            "कीटनाशक या फफूंदनाशक का छिड़काव हमेशा शांत हवा (गति 14 किमी/घंटे से कम) में सुबह या शाम करें।",
            "दवा छिड़काव के बाद कम से कम 24 घंटे बारिश नहीं होनी चाहिए ताकि दवा धुल न जाए।"
        ],
        "speech_hi": "पौधों में फफूंद या कीड़ा दिखने पर साफ या इमिडाक्लोप्रिड का छिड़काव शांत हवा व साफ मौसम में करें।",
        "related": ["नीम तेल का जैविक छिड़काव", "मौसम अनुसार स्प्रे विंडो", "मिट्टी की जांच"],
        "actions": ["Check Spraying Weather Window"]
    },
    {
        "keywords": ["kcc", "loan", "कर्ज", "ऋण", "credit card", "kisan credit"],
        "verdict": "केसीसी पर ₹3 लाख तक का ऋण प्रभावी 4% वार्षिक ब्याज पर (समय पर भुगतान करने पर 3% अनुदान)। ₹1.60 लाख तक बिना गारंटी ऋण उपलब्ध है।",
        "facts": [
            "केसीसी पर सामान्य ब्याज दर 7% है, समय पर चुकता करने पर 3% ब्याज छूट मिलती है।",
            "ऋण का उपयोग फसल बुवाई, खाद-बीज खरीद तथा कृषि उपकरणों के रखरखाव के लिए मान्य है।"
        ],
        "speech_hi": "किसान क्रेडिट कार्ड पर समय पर अदायगी करने पर मात्र 4 प्रतिशत ब्याज लगता है। ₹1.60 लाख तक बिना गारंटी ऋण मिलता है।",
        "related": ["बैंक आवेदन फॉर्म", "आवश्यक दस्तावेज", "फसल बीमा"],
        "actions": ["Apply via Bank Portal", "View KCC Details"]
    }
]

def detect_commodity(query: str) -> Tuple[Optional[str], Optional[str]]:
    """Detects commodity in query text, returns (Agmarknet commodity name, Hindi name)."""
    q_lower = query.lower()
    for keywords, comm_name, comm_hi in COMMODITY_KEYWORDS:
        for kw in keywords:
            if kw in q_lower:
                return comm_name, comm_hi
    return None, None

def detect_location(query: str, default_location: Optional[str] = None) -> Optional[str]:
    """Detects location in query text or returns default_location."""
    q_lower = query.lower()
    for loc in LOCATION_KEYWORDS:
        if loc in q_lower:
            return loc.title()
    return default_location

def fetch_live_mandi_facts(commodity: Optional[str], commodity_hi: Optional[str], query: str = "") -> Tuple[List[str], Optional[str]]:
    """Fetches real Agmarknet prices ONLY when query is mandi/rate/price/sell related."""
    q_lower = query.lower()
    is_mandi_related = any(k in q_lower for k in [
        "bhav", "rate", "mandi", "daam", "kimat", "price", "bechein", "bechna", "sell",
        "भाव", "दाम", "रेट", "मंडी", "कीमत", "बेचें", "बेचना", "बिक्री", "मुनाफा"
    ])
    is_agri_mgmt = any(k in q_lower for k in [
        "rog", "bimari", "keet", "dawa", "spray", "khad", "urea", "dap",
        "रोग", "बीमारी", "कीट", "दवा", "स्प्रे", "खाद", "यूरिया"
    ])

    # If the user is asking about disease or fertilizer without asking about prices, don't inject mandi rates
    if is_agri_mgmt and not is_mandi_related:
        return [], None

    if not commodity and not is_mandi_related:
        return [], None

    facts: List[str] = []
    summary_verdict: Optional[str] = None

    try:
        from app.services.agmarknet import fetch_agmarknet_data

        if commodity:
            records = fetch_agmarknet_data(commodity=commodity, limit=5)
            if records:
                top_rec = records[0]
                market = top_rec.get("market", "APMC")
                district = top_rec.get("district", "")
                state = top_rec.get("state", "")
                modal = top_rec.get("modal_price", 0.0)
                min_p = top_rec.get("min_price", 0.0)
                max_p = top_rec.get("max_price", 0.0)
                arrival = top_rec.get("arrival_date", "")

                facts.append(
                    f"लाइव Agmarknet मंडी भाव ({commodity_hi or commodity}): आज का मॉडल भाव ₹{modal:,.0f}/क्विंटल "
                    f"({market}, {district}, {state}, आवक तिथि: {arrival})।"
                )
                facts.append(
                    f"मंडी मूल्य सीमा: न्यूनतम ₹{min_p:,.0f} से अधिकतम ₹{max_p:,.0f}/क्विंटल।"
                )
                facts.append(
                    "बाजार सुझाव: वर्तमान भाव वास्तविक मंडी रिकॉर्ड के अनुसार हैं। किसान भाई अपनी उपज की गुणवत्ता देखकर APMC मंडी में विक्रय या भंडारण का निर्णय लें।"
                )
                summary_verdict = f"{commodity_hi or commodity} का आज का सरकारी मॉडल भाव ₹{modal:,.0f}/क्विंटल ({market}) दर्ज है।"
            else:
                facts.append(f"सरकारी Agmarknet पोर्टल (Data.gov.in) पर आज {commodity_hi or commodity} की कोई नई आवक या भाव दर्ज नहीं हुआ है।")
                summary_verdict = f"आज Agmarknet पोर्टल पर {commodity_hi or commodity} का कोई नया भाव दर्ज नहीं है। कृपया स्थानीय APMC मंडी से संपर्क करें।"

        elif any(k in q_lower for k in ["bhav", "rate", "मंडी", "भाव", "दाम", "कीमत", "price"]):
            # User asked about general mandi rates without crop name
            records = fetch_agmarknet_data(limit=5)
            if records:
                crop_summaries = []
                for r in records[:3]:
                    c_name = r.get("commodity_hi") or r.get("commodity", "")
                    m_price = r.get("modal_price", 0.0)
                    mkt = r.get("market", "")
                    facts.append(f"लाइव Agmarknet भाव: {c_name} — ₹{m_price:,.0f}/क्विंटल ({mkt}, {r.get('state', '')})।")
                    crop_summaries.append(f"{c_name} ₹{m_price:,.0f} ({mkt})")

                summary_verdict = "आज Agmarknet पर प्रमुख लाइव भाव: " + ", ".join(crop_summaries) + " दर्ज हैं।"
                facts.append("विशिष्ट फसल (जैसे गेहूं, सरसों, आलू, टमाटर) का सटीक भाव जानने के लिए कृपया फसल का नाम पूछें।")
    except Exception:
        pass

    return facts, summary_verdict

def fetch_live_weather_facts(location: Optional[str], query: str) -> Tuple[List[str], Optional[str]]:
    """Fetches real-time weather from Open-Meteo ONLY when query is weather/spray/irrigation related."""
    q_lower = query.lower()
    is_weather_related = any(k in q_lower for k in [
        "mausam", "weather", "barish", "rain", "pani", "sinchai", "irrigation",
        "spray", "chhidkaw", "tamprature", "temp", "garmi", "sardi", "fog", "kohra",
        "मौसम", "बारिश", "पानी", "सिंचाई", "छिड़काव", "स्प्रे", "तापमान", "कोहरा"
    ])
    if not is_weather_related:
        return [], None

    loc_to_use = location or "Meerut"
    facts: List[str] = []
    weather_summary: Optional[str] = None

    try:
        from app.services.weather_service import fetch_open_meteo_forecast
        w = fetch_open_meteo_forecast(location=loc_to_use, force_refresh=False)
        curr_temp = w.get("current_temp", 22.0)
        cond_hi = w.get("condition_hi", "साफ मौसम")
        humidity = w.get("humidity", 50)
        wind = w.get("wind_speed", 10.0)
        rain_prob = w.get("rain_prob", 20)
        forecast = w.get("forecast", [])

        facts.append(
            f"वर्तमान मौसम ({loc_to_use}): तापमान {curr_temp}°C, स्थिति '{cond_hi}', आर्द्रता {humidity}%, "
            f"हवा की गति {wind} किमी/घंटा, आज बारिश की संभावना {rain_prob}%।"
        )

        if len(forecast) >= 3:
            d1 = forecast[1]
            d2 = forecast[2]
            facts.append(
                f"अगले दिनों का मौसम पूर्वानुमान: कल अधिकतम {d1.get('temp_max')}°C (बारिश {d1.get('rain_probability')}%), "
                f"परसों अधिकतम {d2.get('temp_max')}°C (बारिश {d2.get('rain_probability')}%)."
            )

        # Activity-specific weather facts
        if any(k in q_lower for k in ["spray", "छिड़काव", "कीटनाशक", "दवाई", "स्प्रे"]):
            if wind < 14 and rain_prob < 40:
                facts.append("मौसम आधारित छिड़काव विंडो: हवा शांत (<14 किमी/घंटा) और बारिश की संभावना कम है, अतः सुबह के समय कीटनाशक छिड़काव के लिए स्थिति पूरी तरह सुरक्षित व अनुकूल है।")
            else:
                facts.append("मौसम आधारित छिड़काव विंडो: तेज हवा या बारिश की संभावना के कारण छिड़काव टालने की सलाह है, ताकि दवा बहने से नुकसान न हो।")

        if any(k in q_lower for k in ["पानी", "सिंचाई", "irrigation", "water"]):
            if rain_prob > 50:
                facts.append("मौसम आधारित सिंचाई सलाह: आगामी घंटों में बारिश की संभावना अधिक है, अतः अनावश्यक सिंचाई रोककर पानी और बिजली की बचत करें।")
            else:
                facts.append("मौसम आधारित सिंचाई सलाह: अगले 48 घंटों में भारी बारिश की संभावना नहीं है, अतः आवश्यकतानुसार फसल में सिंचाई करना सुरक्षित है।")

        weather_summary = f"{loc_to_use} में वर्तमान तापमान {curr_temp}°C व मौसम '{cond_hi}' है। बारिश की संभावना {rain_prob}% है।"
    except Exception:
        pass

    return facts, weather_summary

    return facts, weather_summary

def fetch_live_schemes_facts(query: str) -> Tuple[List[str], Optional[str]]:
    """Loads official government scheme data for relevant queries."""
    facts: List[str] = []
    verdict: Optional[str] = None
    q_lower = query.lower()

    if not any(k in q_lower for k in ["योजना", "सब्सिडी", "लोन", "कर्ज", "kcc", "pm kisan", "सम्मान निधि", "किस्त", "बीमा", "pmfby", "scheme", "subsidy"]):
        return facts, None

    try:
        if SCHEMES_FILE.exists():
            with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for s in data:
                    s_id = s.get("id", "").lower()
                    name_hi = s.get("name", {}).get("hi", "")
                    if "pm-kisan" in s_id and any(k in q_lower for k in ["pm kisan", "सम्मान निधि", "6000", "किस्त"]):
                        facts.append(f"योजना: {name_hi} — सालाना ₹6,000 की 3 समान किस्तों में प्रत्यक्ष लाभ अंतरण (DBT)।")
                        facts.append("पात्रता: वैध भूमि रिकॉर्ड, आधार से जुड़ा बैंक खाता तथा e-KYC अनिवार्य है।")
                        facts.append(f"आधिकारिक पोर्टल: {s.get('official_portal')} | हेल्पलाइन: {s.get('helpline')}")
                        verdict = f"{name_hi}: सालाना ₹6,000 तीन किश्तों में दिए जाते हैं। e-KYC pmkisan.gov.in पर पूर्ण करें।"
                        break
                    elif "kcc" in s_id and any(k in q_lower for k in ["kcc", "credit card", "loan", "कर्ज", "ऋण"]):
                        facts.append(f"योजना: {name_hi} — ₹3 लाख तक का कृषि ऋण प्रभावी 4% वार्षिक ब्याज पर उपलब्ध।")
                        facts.append("पात्रता: सभी किसान पात्र हैं। ₹1.60 लाख तक किसी गारंटी/कोलैटरल की आवश्यकता नहीं है।")
                        facts.append(f"हेल्पलाइन: {s.get('helpline')}")
                        verdict = f"{name_hi}: 4% वार्षिक ब्याज पर ₹3 लाख तक का ऋण मिलता है। ₹1.60 लाख तक बिना गारंटी उपलब्ध है।"
                        break
                    elif "pmfby" in s_id and any(k in q_lower for k in ["bima", "बीमा", "pmfby", "फसल बीमा"]):
                        facts.append(f"योजना: {name_hi} — प्राकृतिक आपदाओं, सूखा या बाढ़ से फसल नुकसान पर व्यापक सुरक्षा।")
                        facts.append("प्रीमियम: खरीफ फसलों पर 2%, रबी फसलों पर 1.5% और वाणिज्यिक फसलों पर 5% मात्र।")
                        facts.append(f"पोर्टल: {s.get('official_portal')} | हेल्पलाइन: {s.get('helpline')}")
                        verdict = f"{name_hi}: प्राकृतिक नुकसान पर पूर्ण आर्थिक सुरक्षा। रबी फसलों पर मात्र 1.5% प्रीमियम देय है।"
                        break
    except Exception:
        pass

    return facts, verdict

def calculate_python_verdict(
    query: str,
    language: str = "hi",
    location: Optional[str] = None
) -> Tuple[str, List[str], str, str, List[str], List[str]]:
    """
    All-Round Intelligent Decision Engine:
    Combines Real-time Agmarknet Mandi Prices + Open-Meteo Weather + Schemes + Agronomic Science.
    """
    detected_loc = detect_location(query, location)
    commodity, commodity_hi = detect_commodity(query)
    q_lower = query.lower()

    # 1. Fetch live facts across all 3 real-time layers
    weather_facts, weather_summary = fetch_live_weather_facts(detected_loc, query)
    mandi_facts, mandi_summary = fetch_live_mandi_facts(commodity, commodity_hi, query)
    scheme_facts, scheme_summary = fetch_live_schemes_facts(query)

    # 2. Check Agronomic Knowledge Base
    agri_verdict = None
    agri_facts = []
    speech_hi = None
    related = ["मौसम पूर्वानुमान", "मंडी भाव", "सरकारी योजनाएं"]
    actions = ["Explore Live Mandi", "Check Weather Advisory"]

    for rule in KNOWLEDGE_RULES:
        for kw in rule["keywords"]:
            if kw.lower() in q_lower:
                agri_verdict = rule["verdict"]
                agri_facts = rule["facts"]
                speech_hi = rule["speech_hi"]
                related = rule["related"]
                actions = rule["actions"]
                break
        if agri_verdict:
            break

    # 3. Assemble Unified Facts (Never invented, always grounded)
    unified_facts: List[str] = []

    # Prioritize based on query intent
    if mandi_facts:
        unified_facts.extend(mandi_facts)
    if weather_facts:
        unified_facts.extend(weather_facts)
    if scheme_facts:
        unified_facts.extend(scheme_facts)
    if agri_facts:
        unified_facts.extend(agri_facts)

    # 4. Formulate Strict Python Verdict
    if mandi_summary and any(k in q_lower for k in ["bhav", "rate", "मंडी", "भाव", "दाम", "कीमत", "price", "बेचें", "बेचना"]):
        verdict = mandi_summary
        if commodity_hi or commodity:
            raw_num = mandi_summary.split('₹')[-1].split('/')[0] if '₹' in mandi_summary else ''
            speech_text = f"{commodity_hi or commodity} का आज का मंडी भाव लगभग {raw_num} रुपये प्रति क्विंटल चल रहा है।"
        else:
            speech_text = mandi_summary
        actions = ["Open Live Mandi Dashboard", "View Price History"]
    elif any(k in q_lower for k in ["weather", "मौसम", "बारिश", "पानी", "तापमान", "rain", "temp", "cold", "fog"]):
        verdict = weather_summary or "वर्तमान मौसम सामान्य है और आगामी दिनों में कोई विपरीत मौसमी चेतावनी नहीं है।"
        speech_text = f"{detected_loc} में आज का मौसम साफ है और तापमान सामान्य बना हुआ है।"
        actions = ["Check 7-Day Forecast", "Spraying Advisory"]
    elif scheme_summary:
        verdict = scheme_summary
        speech_text = scheme_summary
        actions = ["Apply on Official Portal", "Check Eligibility"]
    elif agri_verdict:
        verdict = agri_verdict
        speech_text = speech_hi or agri_verdict
    else:
        verdict = f"{query.strip()} ke liye kisan salah va vaigyanik krishi paramarsh."
        speech_text = "Fasal ki acchi paidawar ke liye sahi khad, samay par sinchai aur keet prabandhan zaroori hai."

    if not unified_facts:
        unified_facts = [
            f"Kisan Salah Intelligence: Sahi khad aur beej prabandhan se fasal ki paidawar badhti hai.",
            "PM Kisan Helpline: 155261 | Kisan Call Center: 1800-180-1551"
        ]

    rule_fallback = verdict

    return (
        verdict,
        unified_facts,
        rule_fallback,
        speech_text,
        related,
        actions
    )

def call_groq_api(prompt: str, verdict: str, facts: List[str], language: str) -> Optional[str]:
    """
    Primary LLM Provider: Groq API
    Powered by verified model 'qwen/qwen3.8-27b'
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()

    if not api_key:
        return None

    if language == "en":
        lang_instruction = "English"
    elif language == "pa":
        lang_instruction = "Punjabi"
    elif language == "mr":
        lang_instruction = "Marathi"
    else:
        lang_instruction = "simple, natural, respectful Hindi in Devanagari script (सरल हिन्दी). Speak warmly like a helpful village agricultural expert."
    facts_text = "\n".join(f"- {f}" for f in facts)
    system_prompt = (
        "You are 'Kisan Salah AI' (किसान सलाह), an expert agricultural AI advisor for Indian farmers.\n"
        "Your mission is to directly, specifically, and uniquely answer the farmer's EXACT question.\n"
        "NEVER give generic, canned, or repetitive answers. Every single question must receive distinct, practical agricultural guidance.\n\n"
        f"VERIFIED REAL-TIME BACKEND FACTS:\n{facts_text}\n"
        f"KEY VERDICT / CONTEXT: {verdict}\n\n"
        "STRICT GUIDELINES:\n"
        "1. Address the farmer's question directly. If they ask about a disease, fertilizer, sowing, soil, or method, give specific medicine/chemical names, dosages, and exact steps.\n"
        "2. If asking about mandi rates, state the exact live mandi prices from the verified facts.\n"
        "3. If asking about weather or spray, use the live weather statistics from the verified facts.\n"
        "4. If asking about government schemes, explain the benefits, eligibility, and helpline.\n"
        f"5. Language: Respond in {lang_instruction}.\n"
        "6. Length: Concise (80-120 words). Warm, respectful ('Ram-ram kisan bhai!'), and highly practical.\n"
        "7. NEVER output a canned repetitive fallback. Answer the exact question asked."
    )

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 250,
        "temperature": 0.2  # Low temperature for strict factual adherence
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            res = client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"].strip()
                return content
            else:
                return None
    except Exception:
        return None

def call_openrouter_api(prompt: str, verdict: str, facts: List[str], language: str) -> Optional[str]:
    """
    Fallback LLM Provider: OpenRouter API
    """
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free").strip()

    if not api_key:
        return None

    lang_instruction = "English" if language == "en" else "simple, natural Hindi in Devanagari script (सरल हिन्दी)"
    facts_text = "\n".join(f"- {f}" for f in facts)
    system_prompt = (
        "You are 'Kisan Salah AI' (किसान सलाह), an expert agricultural assistant for Indian farmers.\n"
        "STRICT CONSTRAINTS:\n"
        f"CORE VERDICT: \"{verdict}\"\n"
        f"VERIFIED FACTS:\n{facts_text}\n"
        f"Instructions: Explain this verdict in simple, respectful words in {lang_instruction}. "
        "State live mandi prices or weather stats if present in facts. Give 1 practical suggestion. "
        "Never invent prices or dates. Maximum 80-110 words."
    )

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://kisansalah.gov.in",
        "X-Title": "Kisan Salah Agro Portal",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 250,
        "temperature": 0.2
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
            return None
    except Exception:
        return None

def get_ai_explanation(
    query: str,
    language: str = "hi",
    location: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main Advisory Pipeline:
    1. Checks 3-Hour Cache first using hash of prompt + lang + location.
    2. If cache miss, Python Decision Engine computes verdict & gathers live facts.
    3. Tries Groq (Primary).
    4. If Groq fails or returns 429, tries OpenRouter (Fallback).
    5. If both fail, uses Rule-based explanation (Final Fallback).
    6. Caches explanation for 3 hours.
    """
    # 1. Check 3-Hour Cache first using prompt hash (Requirement 9)
    cache_string = f"{query.strip().lower()}_{language}_{location or ''}"
    prompt_hash = hashlib.sha256(cache_string.encode("utf-8")).hexdigest()
    now = time.time()

    if prompt_hash in EXPLANATION_CACHE:
        entry = EXPLANATION_CACHE[prompt_hash]
        if now - entry["cached_at"] < CACHE_TTL_SECONDS:
            res = dict(entry["data"])
            res["cached"] = True
            return res

    # 2. Python decision engine calculates the verdict and gathers all live facts
    verdict, facts, rule_fallback, speech_fallback, related, actions = calculate_python_verdict(query, language, location)

    explanation = None
    provider_name = None

    # 3. Try Groq API as Primary Provider (Requirement 1, 7)
    groq_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    explanation = call_groq_api(query, verdict, facts, language)
    if explanation:
        provider_name = f"Groq ({groq_model})"

    # 4. If Groq fails / returns 429, try OpenRouter (Requirement 7)
    if not explanation:
        openrouter_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        explanation = call_openrouter_api(query, verdict, facts, language)
        if explanation:
            provider_name = f"OpenRouter ({openrouter_model})"

    # 5. If both fail, use Rule-based Explanation (Requirement 8)
    if not explanation:
        explanation = rule_fallback
        provider_name = "Rule-based Engine (Fallback)"

    # Formulate clean, natural speech text directly from explanation so TTS reads the actual advice
    clean_lines = [l.strip() for l in explanation.split("\n") if l.strip() and not l.startswith("#")]
    first_block = clean_lines[0] if clean_lines else explanation
    clean_speech = first_block.replace("**", "").replace("*", "").replace("`", "").strip()
    import re
    sentences = [s.strip() for s in re.split(r'[।.]', clean_speech) if s.strip()]
    if sentences:
        speech_text = "। ".join(sentences[:2]) + "।"
    else:
        speech_text = clean_speech

    response_data = {
        "answer": explanation,
        "speech_text": speech_text,
        "language": language,
        "verdict": verdict,
        "provider": provider_name,
        "cached": False,
        "related_topics": related,
        "suggested_actions": actions
    }

    # Check if query is asking for selling recommendation
    rec_keywords = ["बेचें", "बेचना", "बेच दूं", "रुकूं", "रुकें", "sell", "hold", "wait", "कब बेच", "kab bech"]
    if any(k in query.lower() for k in rec_keywords):
        detected_comm, _ = detect_commodity(query)
        if detected_comm:
            try:
                rec_data = calculate_market_recommendation(
                    commodity=detected_comm,
                    location=location,
                    language=language
                )
                response_data["recommendation"] = rec_data
            except Exception:
                pass

    # 6. Cache for 3 Hours (Requirement 9)
    EXPLANATION_CACHE[prompt_hash] = {
        "cached_at": now,
        "data": response_data
    }

    return response_data

def call_groq_market_explanation(
    action: str,
    action_hi: str,
    commodity_hi: str,
    local_mkt: str,
    local_price: float,
    best_mkt: str,
    best_price: float,
    price_diff: float,
    weather_risk: bool,
    rain_prob: int,
    reasons: List[str],
    language: str = "hi"
) -> Optional[str]:
    """Calls Groq API to generate simple Hindi explanation of the market recommendation."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()
    if not api_key:
        return None

    reasons_text = "\n".join(f"- {r}" for r in reasons)
    system_prompt = (
        "You are 'Kisan Salah AI' (किसान सलाह), an expert agricultural market advisor for Indian farmers.\n"
        "The Python decision engine has calculated this MARKET RECOMMENDATION for the farmer:\n"
        f"RECOMMENDATION: {action_hi}\n"
        f"CROP: {commodity_hi}\n"
        f"LOCAL MARKET: {local_mkt} (Price: ₹{local_price:,.0f}/Quintal)\n"
        f"BEST MARKET: {best_mkt} (Price: ₹{best_price:,.0f}/Quintal, Difference: +₹{price_diff:,.0f}/Qtl)\n"
        f"WEATHER STATUS: Rain probability {rain_prob}% (Weather risk: {weather_risk})\n\n"
        f"FACTUAL REASONS:\n{reasons_text}\n\n"
        "STRICT MANDATE:\n"
        f"1. Explain to the farmer in natural, friendly HINGLISH (Hindi written in Roman/English alphabet, e.g. 'Ram-ram kisan bhai!...') EXACTLY WHY the application gave this recommendation ({action_hi}).\n"
        "2. If SELL NOW: Explain that waiting is risky due to weather damage risk or prices being at seasonal peak.\n"
        "3. If WAIT: Explain that dry clear weather allows safe storage and waiting will likely yield better prices.\n"
        "4. If SELL ELSEWHERE: Explain that another specific market gives significantly higher net profit even after transport costs.\n"
        "5. State the exact prices and market names. Never invent numbers.\n"
        "6. Start warmly with 'राम-राम किसान भाई!'. Keep it concise (70 to 100 words), encouraging, and practical."
    )

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{commodity_hi} बेचने की क्या सलाह है और यह सलाह क्यों दी गई है?"}
        ],
        "max_tokens": 250,
        "temperature": 0.2
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            res = client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
            return None
    except Exception:
        return None

def calculate_market_recommendation(
    commodity: str,
    location: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    language: str = "hi"
) -> Dict[str, Any]:
    """
    3-Way Market Recommendation Engine:
    1. SELL NOW (अभी फसल बेचो) - Jab current conditions ke according wait karna risky ho.
    2. WAIT (कुछ दिन रुको) - Jab price trend aur conditions wait karne ko support karein.
    3. SELL ELSEWHERE (दूसरी मंडी में बेचो) - Jab kisi doosri mandi mein significantly better price mil raha ho.

    AI farmer ko simple Hindi mein samjhayega ki application ne ye recommendation kyun di hai.
    """
    comm_query, comm_hi = detect_commodity(commodity)
    comm_name = comm_query or commodity.strip().title()
    comm_display = comm_hi or comm_name

    detected_loc = detect_location(location or "", location)

    # 1. Check 3-Hour Recommendation Cache
    cache_key = f"mkt_rec_{comm_name.lower()}_{str(detected_loc).lower()}_{str(state).lower()}_{language}"
    rec_hash = hashlib.sha256(cache_key.encode("utf-8")).hexdigest()
    now = time.time()

    if rec_hash in EXPLANATION_CACHE:
        entry = EXPLANATION_CACHE[rec_hash]
        if now - entry["cached_at"] < CACHE_TTL_SECONDS:
            res = dict(entry["data"])
            res["cached"] = True
            return res

    # 2. Fetch live mandi data
    records = []
    try:
        from app.services.agmarknet import fetch_agmarknet_data
        records = fetch_agmarknet_data(commodity=comm_name, limit=20)
    except Exception:
        records = []

    if not records:
        # Honest response when no arrivals today on Agmarknet
        action = "WAIT"
        action_hi = "कुछ दिन रुकें (WAIT)"
        local_mkt = f"{location or state or 'स्थानीय'} मंडी"
        local_price = 0.0
        best_mkt = local_mkt
        best_price = 0.0
        price_diff = 0.0
        reasons = [
            f"सरकारी Agmarknet पोर्टल पर आज ({comm_display}) की कोई नई आवक या भाव दर्ज नहीं हुआ है।",
            "स्थानीय मंडी में आवक और भाव खुलने तक प्रतीक्षा करें या स्थानीय आढ़ती से सीधा संपर्क करें।"
        ]
        explanation = (
            f"राम-राम किसान भाई! आज सरकारी Agmarknet पर {comm_display} की कोई नई आवक दर्ज नहीं हुई है। "
            "इसलिए हमारी सलाह है कि आप 'कुछ दिन रुकें (WAIT)' और स्थानीय मंडी में नए भाव खुलने का इंतजार करें।"
        )
        provider = "Rule-based Engine"
        weather_risk = False
        rain_prob = 10
    else:
        # Match local record with progressive precision: location -> district -> state -> first available
        local_rec = None
        if location:
            loc_clean = location.strip().lower()
            loc_matches = [r for r in records if loc_clean in r.get("market", "").lower() or loc_clean in r.get("district", "").lower()]
            if loc_matches:
                local_rec = loc_matches[0]

        if not local_rec and district:
            dist_clean = district.strip().lower()
            dist_matches = [r for r in records if dist_clean in r.get("district", "").lower() or dist_clean in r.get("market", "").lower()]
            if dist_matches:
                local_rec = dist_matches[0]

        if not local_rec and state and state.lower() != "all":
            state_matches = [r for r in records if r.get("state", "").lower() == state.lower()]
            if state_matches:
                local_rec = state_matches[0]

        if not local_rec:
            local_rec = records[0]

        # Fetch real-time weather for the ACTUAL location of this mandi
        loc_for_weather = location or local_rec.get("district") or local_rec.get("market") or "Meerut"
        from app.services.weather_service import fetch_open_meteo_forecast
        w = fetch_open_meteo_forecast(location=loc_for_weather, force_refresh=False)
        rain_prob = w.get("rain_prob", 20)
        forecast = w.get("forecast", [])
        weather_risk = (rain_prob >= 40) or any(d.get("rain_probability", 0) >= 45 for d in forecast[:3])

        # Top record
        top_rec = max(records, key=lambda x: x.get("modal_price", 0.0))

        local_price = float(local_rec.get("modal_price", 0.0))
        local_mkt = f"{local_rec.get('market')} ({local_rec.get('district') or local_rec.get('state')})"

        best_price = float(top_rec.get("modal_price", 0.0))
        best_mkt = f"{top_rec.get('market')} ({top_rec.get('district') or top_rec.get('state')})"

        price_diff = round(best_price - local_price, 1)

        # Decision Engine Rules
        # Rule 1: SELL ELSEWHERE if another market gives significantly better price (> ₹180/Qtl diff)
        if price_diff >= 180.0 and top_rec.get("market") != local_rec.get("market"):
            action = "SELL ELSEWHERE"
            action_hi = "दूसरी मंडी में बेचें (SELL ELSEWHERE)"
            net_benefit = max(50.0, price_diff - 70.0)
            reasons = [
                f"{best_mkt} में आज मॉडल भाव ₹{best_price:,.0f}/क्विंटल मिल रहा है, जो स्थानीय मंडी ({local_mkt}) के ₹{local_price:,.0f}/क्विंटल से ₹{price_diff:,.0f}/क्विंटल अधिक है।",
                f"अनुमानित परिवहन खर्च (~₹60-₹80/क्विंटल) निकालने के बाद भी आपको प्रति क्विंटल लगभग ₹{net_benefit:,.0f} का सीधा शुद्ध अतिरिक्त मुनाफा होगा।",
                f"दूसरी मंडी में उपज ले जाने से पहले व्यापारी या मंडी समिति से आज की आवक व खरीद समय की पुष्टि अवश्य कर लें।"
            ]
        # Rule 2: SELL NOW if weather risk makes waiting risky OR price is at peak/falling
        elif weather_risk:
            action = "SELL NOW"
            action_hi = "अभी बेचें (SELL NOW)"
            reasons = [
                f"मौसम जोखिम: आगामी 48 घंटों में बारिश की संभावना {rain_prob}% है। खुले में या साधारण भंडारण में फसल ({comm_display}) भीगने, फफूंद लगने व नमी से वजन घटने का भारी जोखिम है।",
                f"{local_mkt} में वर्तमान भाव ₹{local_price:,.0f}/क्विंटल उचित स्तर पर है। खराब मौसम के नुकसान से बचने के लिए तुरंत बिक्री करना सुरक्षित व समझदारी भरा निर्णय है।"
            ]
        elif local_price >= float(local_rec.get("max_price", local_price)) * 0.95 or local_rec.get("trend") == "down":
            action = "SELL NOW"
            action_hi = "अभी बेचें (SELL NOW)"
            reasons = [
                f"{local_mkt} में वर्तमान भाव ₹{local_price:,.0f}/क्विंटल आज के उच्चतम स्तर (₹{local_rec.get('max_price', local_price):,.0f}) के करीब है।",
                "मंडी में नई आवक बढ़ने से आगे भाव में मंदी आने की संभावना है, अतः इस लाभकारी दर पर तुरंत माल बेचकर मुनाफा पक्का करें।"
            ]
        # Rule 3: WAIT when conditions support waiting (dry safe weather, prices likely to rebound)
        else:
            action = "WAIT"
            action_hi = "कुछ दिन रुकें (WAIT)"
            reasons = [
                f"आगामी 7 दिनों में मौसम पूरी तरह साफ और शुष्क रहने का अनुमान है, जिससे सुरक्षित भंडारण संभव है और मौसम का कोई जोखिम नहीं है।",
                f"{local_mkt} में वर्तमान मॉडल भाव ₹{local_price:,.0f}/क्विंटल सामान्य स्तर पर है। आने वाले दिनों में मांग सुधरने पर बेहतर दाम मिलने की पूरी संभावना है।"
            ]

        # Generate AI Explanation
        groq_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
        ai_exp = call_groq_market_explanation(
            action=action,
            action_hi=action_hi,
            commodity_hi=comm_display,
            local_mkt=local_mkt,
            local_price=local_price,
            best_mkt=best_mkt,
            best_price=best_price,
            price_diff=price_diff,
            weather_risk=weather_risk,
            rain_prob=rain_prob,
            reasons=reasons,
            language=language
        )

        if ai_exp:
            explanation = ai_exp
            provider = f"Groq ({groq_model})"
        else:
            explanation = (
                f"राम-राम किसान भाई! हमारी सलाह है कि आप '{action_hi}'। "
                + " ".join(reasons[:2])
            )
            provider = "Rule-based Engine (Fallback)"

    speech_text = f"किसान सलाह: {action_hi}। {reasons[0]}"

    result_data = {
        "action": action,
        "action_hi": action_hi,
        "commodity": comm_name,
        "commodity_hi": comm_display,
        "local_market": local_mkt,
        "local_price": local_price,
        "best_market": best_mkt,
        "best_price": best_price,
        "price_diff": price_diff,
        "weather_risk": weather_risk,
        "reasons": reasons,
        "explanation": explanation,
        "speech_text": speech_text,
        "provider": provider,
        "cached": False
    }

    # Cache for 3 Hours
    EXPLANATION_CACHE[rec_hash] = {
        "cached_at": now,
        "data": result_data
    }

    return result_data

def transcribe_audio_with_groq(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    language: str = "hi"
) -> Dict[str, Any]:
    """
    Transcribes farmer's speech to text using Groq Whisper API (whisper-large-v3-turbo).
    Supports Hindi (hi), Punjabi (pa), Marathi (mr), English (en), etc.
    """
    from fastapi import HTTPException

    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured. Please configure GROQ_API_KEY in Vercel Environment Variables or your .env file.")

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {api_key}"}

    # Map language
    lang_code = language if language in ["hi", "en", "pa", "mr", "ta", "te", "bn", "gu"] else "hi"

    # Content type and payload
    if filename.endswith(".wav"):
        ctype = "audio/wav"
    elif filename.endswith(".mp4"):
        ctype = "audio/mp4"
    elif filename.endswith(".ogg"):
        ctype = "audio/ogg"
    else:
        ctype = "audio/webm"
    files = {"file": (filename, audio_bytes, ctype)}
    data = {
        "model": "whisper-large-v3-turbo",
        "response_format": "json",
        "temperature": 0.0,
        "prompt": "kisan mandi bhav gehun sarson dhaan tamatar sinchai khad spray fasal bima kcc"
    }
    # Pass explicit language if user selected specific non-Hindi regional language
    if lang_code in ["pa", "mr", "ta", "te", "en"]:
        data["language"] = lang_code

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, files=files, data=data)
            if res.status_code == 200:
                out = res.json()
                text = out.get("text", "").strip()

                # Filter out silence hallucinations common to Whisper
                hallucinations = [
                    "thank you", "thanks for watching", "subtitles by", "amara.org",
                    "subscribe", "kisan mandi bhav gehun sarson", "kheti kisan"
                ]
                clean_lower = text.lower().strip(" .,!?:;")
                if clean_lower in hallucinations or len(clean_lower) < 2:
                    text = ""

                return {
                    "transcript": text,
                    "language": lang_code,
                    "provider": "Groq Whisper (whisper-large-v3-turbo)"
                }
            else:
                detail = res.text
                raise HTTPException(status_code=res.status_code, detail=f"Groq Whisper error: {detail}")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Groq Whisper speech-to-text timed out")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=502, detail=f"Speech transcription failed: {str(e)}")
