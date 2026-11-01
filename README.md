# 🌱 किसान सलाह (Kisan Salah) - Smart AI Agro-Advisory Platform

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F05A28.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Kisan Salah (किसान सलाह)** is a production-ready, full-stack agricultural advisory web application designed specifically for Indian farmers. It eliminates middlemen exploitation and empowers farmers with:
1. **Live Daily Mandi Bhav** fetched directly from the official **Data.gov.in Agmarknet API** (zero dummy data).
2. **AI Market Decision Engine** that computes a 3-way selling verdict: `SELL NOW`, `WAIT`, or `SELL ELSEWHERE`.
3. **Hyperlocal Precision Weather & Agricultural Advisories** powered by the **Open-Meteo API** with dynamic geocoding.
4. **Voice-to-Text & Multilingual AI Advisor** powered by **Groq Whisper** and Groq LLMs (`qwen/qwen3.8-27b`).
5. **Verified Government Schemes** (PM-Kisan, KCC, PMFBY, etc.) with eligibility checklists and official `.gov.in` portal links.

---

## 🌟 Key Features

### 1. 🚚 3-Way Market Decision Engine (AI फसल बिक्री सलाहकार)
Helps farmers maximize crop profitability by analyzing live price spreads across APMC mandis and short-term weather risk:
* **🚨 SELL NOW (अभी बेचें):** When current market rates are at seasonal peaks or high rain/weather risk threatens crop storage.
* **⏳ WAIT (कुछ दिन रुकें):** When weather is dry and safe for on-farm storage, and market arrivals indicate higher future demand.
* **🚚 SELL ELSEWHERE (दूसरी मंडी में बेचें):** When a nearby APMC market offers significantly higher modal prices (> ₹180/Quintal net difference), accounting for transport distance.
* **Natural Hindi Audio Explanation:** Every decision is explained in respectful, plain Hindi with exact market names and rupee amounts.

### 2. 📊 Live Data.gov.in Agmarknet Mandi Rates (ताजा मंडी भाव)
* **Real-Time Government Data:** Directly queries the official Data.gov.in Agmarknet endpoint (`resource/9ef84268-d588-465a-a308-a864a43d0070`).
* **Zero Dummy Data:** Grounded in verified daily arrivals across 50+ APMC mandis.
* **Granular Filtering:** Filter by State, District, and Commodity (Tomato, Potato, Onion, Wheat, Mustard, Paddy, Cotton, Soybean, Maize, Gram, etc.).
* **Normalized Data Attributes:** State, District, Market Name, Variety, Grade, ISO Arrival Date (`YYYY-MM-DD`), Minimum, Maximum, and Modal Price (`₹/Quintal`), plus price change indicators.
* **Audio Readout:** Instant one-click spoken audio of any mandi rate card.

### 3. 🌦️ Open-Meteo Real-Time Weather & Spraying Windows (मौसम व कृषि सलाह)
* **Dynamic Geocoding:** Auto-resolves latitude and longitude for any Indian district without hardcoding.
* **7-Day Weather Forecast:** Daily maximum/minimum temperatures, rain probability (`%`), precipitation sum (`mm`), wind speed (`km/h`), and WMO weather condition descriptions.
* **Smart In-Memory Caching:** 30-minute caching layer to ensure lightning-fast responses and prevent upstream rate limits.
* **Scientific Agricultural Advisories:**
  * **💧 Irrigation Advisory (सिंचाई सलाह):** Recommends pausing irrigation during rain forecasts to prevent waterlogging and save electricity.
  * **💨 Spraying Window Advisory (कीटनाशक छिड़काव):** Advises spraying only when wind speeds are below 14 km/h and rain probability is low.
  * **🌱 Crop & Nursery Protection:** Night temperature drop alerts for tender vegetable seedlings.

### 4. 🎙️ Multilingual AI Advisor with Groq Whisper (किसान AI सलाहकार)
* **Voice-to-Text via Groq Whisper (`whisper-large-v3-turbo`):** High-speed transcription designed to accurately understand Hinglish, Hindi, and Indian rural dialects.
* **Dynamic AI Recommendations:** Powered by Groq's high-speed LPU inference (`qwen/qwen3.8-27b`) with exact chemical names, dosages (e.g. Carbendazim + Mancozeb 2g/L), and sowing guidelines.
* **Zero Static Repetition:** Every single query receives a custom, tailored response with no repetitive templates.
* **Multilingual UI:** Instant switching between **हिन्दी (Hindi)**, **English**, **ਪੰਜਾਬੀ (Punjabi)**, and **मराठी (Marathi)**.
* **Audio Voice Output (TTS):** Natural speech synthesis playback with clear Indian phonetics.

### 5. 🏛️ Central & State Government Schemes (सरकारी योजनाएं)
* Complete repository of key agricultural schemes:
  * **PM Kisan Samman Nidhi:** ₹6,000/year direct bank transfer (DBT) in 3 instalments.
  * **Kisan Credit Card (KCC):** Up to ₹3 Lakh at 4% subsidized interest rate; collateral-free up to ₹1.60 Lakh.
  * **PM Fasal Bima Yojana (PMFBY):** Comprehensive crop insurance against natural disasters.
  * **PM Krishi Sinchayee Yojana:** Up to 55-80% subsidy on drip and sprinkler irrigation systems.
* Direct official links to `pmkisan.gov.in`, `pmfby.gov.in`, and toll-free farmer helplines (`155261`, `1800-180-1551`).

---

## 🏗️ Architecture & Project Structure

```
kishaan salah/
├── .env.example              # Root template for environment variables
├── .gitignore                # Comprehensive Git exclusion rules
├── README.md                 # Project documentation
├── start.sh                  # One-click full-stack launcher
│
├── backend/                  # FastAPI Python Backend
│   ├── .env.example          # Backend environment variables template
│   ├── requirements.txt      # Python dependencies
│   ├── test_integration.py   # Agmarknet Mandi integration test suite
│   ├── test_weather_integration.py # Open-Meteo Weather test suite
│   ├── test_ai_integration.py# AI Advisor & Decision engine test suite
│   └── app/
│       ├── main.py           # FastAPI entrypoint & CORS middleware
│       ├── models/
│       │   └── schemas.py    # Pydantic schemas for data validation
│       ├── routers/
│       │   ├── mandi.py      # /api/mandi endpoints
│       │   ├── weather.py    # /api/weather endpoints
│       │   ├── schemes.py    # /api/schemes endpoints
│       │   └── advisory.py   # /api/advisor & voice-to-text endpoints
│       ├── services/
│       │   ├── agmarknet.py  # Data.gov.in API fetcher & normalizer
│       │   ├── weather_service.py # Open-Meteo forecast & geocoding
│       │   └── ai_service.py # Groq LLM & Whisper speech integration
│       └── data/
│           └── schemes_data.json # Multilingual government schemes data
│
└── frontend/                 # Next.js 14 Frontend Application
    ├── .env.example          # Frontend environment variables template
    ├── package.json          # Node.js dependencies & scripts
    ├── tsconfig.json         # TypeScript configuration
    ├── tailwind.config.ts    # Tailwind styling configuration
    └── src/
        ├── app/              # Next.js App Router (page.tsx, layout.tsx, not-found.tsx)
        ├── components/       # Reusable React components
        │   ├── Navbar.tsx        # Top navigation with multilingual switcher
        │   ├── VoiceAdvisor.tsx  # Voice-to-Text & AI conversation card
        │   ├── MandiWidget.tsx   # Live Mandi rates & 3-way recommendation card
        │   ├── WeatherWidget.tsx # 7-Day weather forecast & spraying advisory
        │   └── SchemesWidget.tsx # Government schemes & eligibility modals
        └── lib/              # Client utilities
            ├── api.ts            # Typed HTTP client for backend endpoints
            ├── speech.ts         # MediaRecorder & browser speech synthesis
            └── translations.ts   # Multilingual UI dictionary (hi, en, pa, mr)
```

---

## ⚙️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18 | High-performance, server-rendered dashboard |
| **Language** | TypeScript (Frontend), Python 3.9+ (Backend) | End-to-end type safety |
| **Styling** | Tailwind CSS, Lucide React Icons | Modern, accessible responsive design |
| **Backend** | FastAPI, Uvicorn, Pydantic v2, HTTPX | High-concurrency async REST API |
| **AI / STT** | Groq Whisper (`whisper-large-v3-turbo`) | Real-time voice-to-text transcription (~300ms) |
| **AI Advisory** | Groq (`qwen/qwen3.8-27b`) | Tailored agricultural diagnosis & recommendation |
| **Mandi Data** | Data.gov.in Agmarknet API | Official live APMC wholesale crop prices |
| **Weather** | Open-Meteo Geocoding & Weather Forecast API | Hyperlocal coordinates & 7-day agricultural forecast |

---

## 🚀 Quickstart Guide

### Prerequisites
* **Python:** 3.9 or higher
* **Node.js:** 18.17 or higher
* **npm:** 9.0 or higher
* **API Keys:**
  * [Data.gov.in API Key](https://data.gov.in) (Free)
  * [Groq Cloud API Key](https://console.groq.com) (Free)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/kisan-salah.git
cd kisan-salah
```

---

### Step 2: Configure Environment Variables

1. **Backend Configuration:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and insert your credentials:
   ```env
   DATA_GOV_API_KEY=your_actual_data_gov_in_api_key
   GROQ_API_KEY=your_actual_groq_api_key
   GROQ_MODEL=qwen/qwen3.8-27b
   OPENROUTER_API_KEY=
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```

2. **Frontend Configuration:**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   Default `NEXT_PUBLIC_API_URL=http://localhost:8000` works out of the box for local development.

---

### Step 3: Setup & Run Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run integration test suites
python test_integration.py
python test_weather_integration.py
python test_ai_integration.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health:** [http://localhost:8000/](http://localhost:8000/)

---

### Step 4: Setup & Run Frontend

Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
* **Frontend Web Dashboard:** [http://localhost:3000](http://localhost:3000)

---

### Step 5: One-Click Full-Stack Launcher (macOS / Linux)

Alternatively, run both servers with a single command from the root directory:
```bash
chmod +x start.sh
./start.sh
```

---

## 🧪 Automated Test Suites

The project includes automated integration tests to ensure upstream APIs and AI models function reliably:

```bash
# 1. Agmarknet Mandi API integration test
python backend/test_integration.py

# 2. Open-Meteo Weather & Geocoding test
python backend/test_weather_integration.py

# 3. AI Decision Engine & Groq Whisper test
python backend/test_ai_integration.py
```

---

## 🔒 Security & Privacy Practices

* **No Hardcoded Secrets:** All credentials, keys, and tokens are stored strictly in untracked `.env` files.
* **Strict `.gitignore` Policy:** `.env`, `.env.*`, `venv/`, `node_modules/`, `.next/`, `__pycache__/`, build artifacts, and OS files are completely ignored.
* **Data Privacy:** Farmer audio is processed in-memory directly with Groq Whisper and never stored permanently on disk.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please open an issue or submit a pull request.
