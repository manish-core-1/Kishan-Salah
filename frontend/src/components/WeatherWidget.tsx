"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Volume2,
  Square,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
  RefreshCw
} from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { VoiceAssistant } from "@/lib/speech";
import { fetchWeather, WeatherData } from "@/lib/api";

interface WeatherWidgetProps {
  currentLang: Language;
}

const PRESET_DISTRICTS = [
  { key: "prayagraj", name: "Prayagraj (प्रयागराज)", location: "Prayagraj", state: "Uttar Pradesh" },
  { key: "meerut", name: "Meerut (मेरठ)", location: "Meerut", state: "Uttar Pradesh" },
  { key: "agra", name: "Agra (आगरा)", location: "Agra", state: "Uttar Pradesh" },
  { key: "ludhiana", name: "Ludhiana (लुधियाना)", location: "Ludhiana", state: "Punjab" },
  { key: "karnal", name: "Karnal (करनाल)", location: "Karnal", state: "Haryana" },
  { key: "indore", name: "Indore (इंदौर)", location: "Indore", state: "Madhya Pradesh" },
  { key: "kota", name: "Kota (कोटा)", location: "Kota", state: "Rajasthan" },
  { key: "nashik", name: "Nashik (नासिक)", location: "Nashik", state: "Maharashtra" },
  { key: "patna", name: "Patna (पटना)", location: "Patna", state: "Bihar" },
  { key: "rajkot", name: "Rajkot (राजकोट)", location: "Rajkot", state: "Gujarat" }
];

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [selectedKey, setSelectedKey] = useState("prayagraj");
  const [customSearch, setCustomSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loadWeather = useCallback((locName: string, stateName?: string) => {
    setLoading(true);
    setErrorMsg(null);
    fetchWeather(locName, stateName)
      .then((data) => {
        setWeather(data);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Open-Meteo मौसम डेटा लोड करने में समस्या आई।";
        setErrorMsg(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const item = PRESET_DISTRICTS.find((p) => p.key === selectedKey);
    if (item) {
      loadWeather(item.location, item.state);
    }
  }, [selectedKey, loadWeather]);

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    loadWeather(customSearch.trim());
  };

  const handleReadAdvisory = () => {
    if (isSpeaking) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      return;
    }

    if (!weather) return;
    const advisories = weather.advisory[currentLang] || weather.advisory["hi"] || [];
    const textToRead = `आज ${weather.location} के लिए ओपन-मेटियो कृषि मौसम सलाह: ` + advisories.join("। ");

    VoiceAssistant.speak(textToRead, currentLang, () => setIsSpeaking(false));
    setIsSpeaking(true);
  };

  const currentAdvisories =
    weather?.advisory[currentLang] || weather?.advisory["hi"] || weather?.advisory["en"] || [];

  const renderWeatherIcon = (iconName: string, className = "w-7 h-7") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${className} text-amber-500`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-400`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-400`} />;
      case "cloud-rain":
        return <CloudRain className={`${className} text-sky-500`} />;
      case "cloud-lightning":
        return <CloudLightning className={`${className} text-indigo-500`} />;
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-green-800 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
            <CloudSun className="w-4 h-4" />
            <span>Open-Meteo API • Precision Agri Weather</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{t.weatherTitle}</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">{t.weatherSubtitle}</p>
        </div>

        {/* District Selector & Custom Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-300 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setCustomSearch("");
              }}
              className="bg-emerald-900/90 text-white pl-9 pr-8 py-2 rounded-xl text-sm font-semibold border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {PRESET_DISTRICTS.map((c) => (
                <option key={c.key} value={c.key} className="bg-emerald-950 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleCustomSearchSubmit} className="relative hidden sm:flex items-center">
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="अन्य जिला खोजें..."
              className="bg-emerald-950/70 text-white text-xs pl-3 pr-8 py-2 rounded-xl border border-emerald-600/80 focus:outline-none focus:ring-1 focus:ring-amber-300 placeholder-emerald-300/60 w-36"
            />
            <button type="submit" className="absolute right-2 text-emerald-300 hover:text-white cursor-pointer">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <button
            onClick={() => {
              const item = PRESET_DISTRICTS.find((p) => p.key === selectedKey);
              if (item) loadWeather(item.location, item.state);
            }}
            title="रिफ्रेश करें"
            className="p-2 bg-emerald-900 hover:bg-emerald-950 text-emerald-200 rounded-xl border border-emerald-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleReadAdvisory}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isSpeaking
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-amber-400 text-emerald-950 hover:bg-amber-300"
            }`}
          >
            {isSpeaking ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>{t.stopAudio}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.speakAdvice}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-emerald-800">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-medium text-sm">Open-Meteo से 7-दिन का मौसम व कृषि सलाह लोड हो रही है...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-6">
          <div className="py-6 px-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold text-sm">मौसम डेटा लोड करने में त्रुटि:</p>
              <p className="text-xs text-rose-700 mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      ) : !weather ? null : (
        <div className="p-6 space-y-6">
          {/* Metadata Ribbon (Source, Coordinates, 30m Cache Status) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-emerald-800 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>{weather.location}, {weather.state}</span>
                {weather.latitude && (
                  <span className="text-gray-400 font-normal">
                    ({weather.latitude.toFixed(2)}°N, {weather.longitude?.toFixed(2)}°E)
                  </span>
                )}
              </span>
              <span className="text-gray-300">•</span>
              <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                स्रोत: {weather.source || "Open-Meteo API"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400">
              {weather.cached && (
                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-200">
                  ⚡ 30m Cache Active
                </span>
              )}
              <span>अपडेट: {weather.fetched_at || "अभी"}</span>
            </div>
          </div>

          {/* Main Weather Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Temperature & Condition */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                  वर्तमान मौसम • {weather.location}
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900">
                    {Math.round(weather.current_temp)}°C
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    महसूस: {Math.round(weather.feels_like)}°C
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-800 mt-2 flex items-center space-x-1">
                  {currentLang === "en" ? weather.condition : weather.condition_hi}
                </p>
              </div>
              <div className="p-3 bg-amber-400/20 text-amber-600 rounded-2xl">
                {renderWeatherIcon(weather.forecast[0]?.icon || "sun", "w-12 h-12")}
              </div>
            </div>

            {/* Humidity & Rain */}
            <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wide block">
                  {t.rainProb} व वर्षा मात्रा
                </span>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <CloudRain className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      बारिश संभावना: <strong className="text-sky-700">{weather.rain_prob}%</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      हवा में नमी: <strong className="text-teal-700">{weather.humidity}%</strong>
                    </span>
                  </div>
                  {weather.precipitation_sum !== undefined && weather.precipitation_sum > 0 && (
                    <div className="text-xs text-sky-800 font-medium">
                      संभावित वर्षा: <strong>{weather.precipitation_sum} mm</strong>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3 bg-sky-200/40 text-sky-600 rounded-2xl">
                <Droplets className="w-10 h-10" />
              </div>
            </div>

            {/* Wind & Spraying Window */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                  {t.wind} व छिड़काव विंडो
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {weather.wind_speed} <span className="text-sm font-normal text-gray-600">km/h</span>
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {weather.wind_speed <= 14 && weather.rain_prob <= 25
                      ? "छिड़काव के लिए अनुकूल समय"
                      : "छिड़काव से बचें या सावधानी बरतें"}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-200/40 text-emerald-700 rounded-2xl">
                <Wind className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Actionable Agricultural Advisories */}
          <div className="bg-emerald-900/5 rounded-2xl p-5 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t.agriAdvisory} (Open-Meteo आधारित वैज्ञानिक परामर्श)</span>
              </h3>
              <button
                onClick={handleReadAdvisory}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? "आवाज़ बंद करें" : "सलाह सुनें"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentAdvisories.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl shadow-xs border border-emerald-100 text-gray-800 text-sm leading-relaxed"
                >
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Open-Meteo Forecast */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>7 दिनों का दैनिक मौसम पूर्वानुमान (7-Day Forecast)</span>
              </h4>
              <span className="text-xs text-gray-400">स्रोत: Open-Meteo API</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {weather.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/80 hover:bg-emerald-50/50 transition-colors p-3 rounded-xl border border-gray-200/80 text-center flex flex-col justify-between"
                >
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase">{day.day}</p>
                    <p className="text-xs font-semibold text-emerald-900 mb-1.5">{day.date}</p>
                    <div className="my-1 flex justify-center">
                      {renderWeatherIcon(day.icon, "w-7 h-7")}
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 line-clamp-1">
                      {currentLang === "en" ? day.condition : day.condition_hi}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200/60">
                    <div className="text-xs font-bold text-gray-900">
                      {Math.round(day.temp_max)}° /{" "}
                      <span className="text-gray-500 font-normal">{Math.round(day.temp_min)}°</span>
                    </div>
                    <div className="mt-1 text-[10px] text-sky-700 font-medium">
                      💧 {day.rain_probability}%
                      {day.precipitation_sum !== undefined && day.precipitation_sum > 0 ? ` (${day.precipitation_sum}mm)` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
