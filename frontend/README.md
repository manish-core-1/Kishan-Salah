# 🌾 Kisan Salah - Frontend Client

This is the Next.js 14 frontend dashboard for **Kisan Salah (किसान सलाह)**. It features a modern, responsive user interface tailored for Indian farmers with multilingual support, live voice input via Groq Whisper, audio speech synthesis, and real-time data widgets.

---

## 🚀 Key Features

* **🎙️ Voice AI Advisor:** Voice-to-Text powered by Groq Whisper (`whisper-large-v3-turbo`) with real-time audio wave feedback, timer, and TTS playback.
* **📊 Live Mandi Bhav:** Agmarknet daily price tables with state, district, and commodity search, price range spreads, and modal price trends.
* **🚚 3-Way Sell Recommendation:** AI-driven `SELL NOW`, `WAIT`, or `SELL ELSEWHERE` decision card with weather risk analysis and APMC price comparison.
* **🌦️ 7-Day Precision Weather:** Open-Meteo weather forecast with dynamic geocoding, rain probability, and actionable spray/irrigation windows.
* **🏛️ Government Schemes:** Comprehensive subsidy details (PM-Kisan, KCC, PMFBY, etc.) with e-KYC eligibility checklists and official `.gov.in` portals.
* **🌐 Multilingual Support:** Seamless toggling between **Hindi (हिन्दी)**, **English**, **Punjabi (ਪੰਜਾਬੀ)**, and **Marathi (मराठी)**.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Speech Engine:** HTML5 MediaRecorder + Web Audio API + SpeechSynthesis API

---

## 💻 Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure `NEXT_PUBLIC_API_URL` points to your backend instance (default: `http://localhost:8000`).

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```
