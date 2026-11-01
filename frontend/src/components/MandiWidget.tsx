"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  Store,
  Volume2,
  Calendar,
  AlertCircle,
  Sparkles,
  Truck,
  AlertTriangle,
  Clock,
  Square,
  CheckCircle2
} from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { fetchMandiPrices, MandiItem, fetchMarketRecommendation, MarketRecommendation } from "@/lib/api";
import { VoiceAssistant } from "@/lib/speech";

interface MandiWidgetProps {
  currentLang: Language;
}

const STATES = [
  "All",
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Madhya Pradesh",
  "Maharashtra",
  "Gujarat",
  "Bihar",
  "Himachal Pradesh",
  "Andhra Pradesh",
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "Odisha",
  "West Bengal"
];

const COMMODITIES = [
  "All",
  "Tomato",
  "Potato",
  "Onion",
  "Wheat",
  "Mustard",
  "Paddy(Basmati)",
  "Paddy(Common)",
  "Cotton",
  "Soyabean",
  "Maize",
  "Bengal Gram(Gram)(Whole)",
  "Apple",
  "Banana",
  "Brinjal",
  "Cabbage",
  "Cauliflower",
  "Carrot",
  "Bhindi(Ladies Finger)",
  "Garlic"
];

export const MandiWidget: React.FC<MandiWidgetProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCommodity, setSelectedCommodity] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<MandiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Market Sell Recommendation state
  const [recCrop, setRecCrop] = useState<string>("Potato");
  const [recommendation, setRecommendation] = useState<MarketRecommendation | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recSpeaking, setRecSpeaking] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);
    fetchMandiPrices({
      state: selectedState,
      commodity: selectedCommodity,
      search: searchTerm,
      limit: 100
    })
      .then((data) => {
        setItems(data);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Data.gov.in से मंडी भाव लोड करने में समस्या आई।";
        setErrorMsg(msg);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [selectedState, selectedCommodity, searchTerm]);

  const loadRecommendation = useCallback((cropName?: string) => {
    const cropToUse = cropName || recCrop;
    setRecLoading(true);
    fetchMarketRecommendation({
      commodity: cropToUse,
      state: selectedState,
      language: currentLang
    })
      .then((data) => setRecommendation(data))
      .catch((err) => console.error("Rec error:", err))
      .finally(() => setRecLoading(false));
  }, [recCrop, selectedState, currentLang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const speakTopRate = (item: MandiItem) => {
    const text = `${item.market} में ${item.commodity_hi || item.commodity} का मॉडल भाव ₹${item.modal_price} प्रति क्विंटल है। न्यूनतम ₹${item.min_price} और अधिकतम ₹${item.max_price} रहा।`;
    VoiceAssistant.speak(text, currentLang);
  };

  const handleSpeakRecommendation = () => {
    if (recSpeaking) {
      VoiceAssistant.stop();
      setRecSpeaking(false);
    } else if (recommendation) {
      VoiceAssistant.speak(recommendation.explanation, currentLang, () => setRecSpeaking(false));
      setRecSpeaking(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
            <Store className="w-4 h-4" />
            <span>Data.gov.in Agmarknet API • Live Data</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{t.mandiTitle}</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">{t.mandiSubtitle}</p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 rounded-xl text-xs font-semibold border border-emerald-600 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>ताजा करें</span>
        </button>
      </div>

      {/* AI Market Sell Recommendation Section */}
      <div className="p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-b border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI फसल बिक्री निर्णय सलाहकार</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  3-Way Action Engine
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                मौसम जोखिम और 50+ APMC मंडियों के तुलनात्मक विश्लेषण पर आधारित सटीक बिक्री निर्णय
              </p>
            </div>
          </div>

          {/* Quick Crop Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-emerald-200 mr-1 hidden sm:inline">फसल चुनें:</span>
            {[
              { label: "आलू (Potato)", key: "Potato" },
              { label: "सरसों (Mustard)", key: "Mustard" },
              { label: "टमाटर (Tomato)", key: "Tomato" },
              { label: "गेहूं (Wheat)", key: "Wheat" },
              { label: "पत्तागोभी (Cabbage)", key: "Cabbage" }
            ].map((crop) => (
              <button
                key={crop.key}
                type="button"
                onClick={() => {
                  setRecCrop(crop.key);
                  loadRecommendation(crop.key);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  recCrop === crop.key
                    ? "bg-amber-400 text-slate-950 shadow-md font-bold"
                    : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60"
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Content */}
        {recLoading ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-emerald-800 flex items-center justify-center space-x-3 text-emerald-200">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">देश भर की मंडियों और मौसम जोखिम का विश्लेषण हो रहा है...</span>
          </div>
        ) : recommendation ? (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              recommendation.action === "SELL NOW"
                ? "bg-gradient-to-br from-rose-950/80 via-slate-900/90 to-rose-950/70 border-rose-500/60"
                : recommendation.action === "WAIT"
                ? "bg-gradient-to-br from-sky-950/80 via-slate-900/90 to-blue-950/70 border-sky-500/60"
                : "bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-teal-950/70 border-emerald-500/60"
            }`}
          >
            {/* Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl text-white shadow-md flex items-center justify-center ${
                    recommendation.action === "SELL NOW"
                      ? "bg-rose-600 animate-pulse"
                      : recommendation.action === "WAIT"
                      ? "bg-sky-600"
                      : "bg-emerald-600"
                  }`}
                >
                  {recommendation.action === "SELL NOW" ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : recommendation.action === "WAIT" ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <Truck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full text-white ${
                        recommendation.action === "SELL NOW"
                          ? "bg-rose-600"
                          : recommendation.action === "WAIT"
                          ? "bg-sky-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      {recommendation.action}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white">
                      {recommendation.action_hi}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {recommendation.action === "SELL NOW"
                      ? "वर्तमान परिस्थितियों (खराब मौसम या मूल्य चरम) के अनुसार रुकना जोखिम भरा है।"
                      : recommendation.action === "WAIT"
                      ? "मौसम पूरी तरह शुष्क व सुरक्षित है और मूल्य रुझान आगे बेहतर दाम मिलने का समर्थन करते हैं।"
                      : `दूसरी मंडी (${recommendation.best_market}) में परिवहन खर्च के बाद भी उल्लेखनीय रूप से बेहतर दाम मिल रहा है।`}
                  </p>
                </div>
              </div>

              {/* Audio Listen Button */}
              <button
                type="button"
                onClick={handleSpeakRecommendation}
                className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              >
                {recSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-rose-400" />
                    <span>आवाज़ रोकें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>सलाह सुनें (Audio)</span>
                  </>
                )}
              </button>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">स्थानीय मंडी (Local Market)</span>
                <span className="text-sm font-bold text-white truncate block mt-0.5">
                  {recommendation.local_market || "स्थानीय मंडी"}
                </span>
                <span className="text-base font-black text-amber-300">
                  {recommendation.local_price ? `₹${recommendation.local_price.toLocaleString("en-IN")}/Qtl` : "दर प्रतीक्षित"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">सर्वोत्तम मंडी (Best Market)</span>
                <span className="text-sm font-bold text-white truncate block mt-0.5">
                  {recommendation.best_market || "प्रमुख APMC"}
                </span>
                <span className="text-base font-black text-emerald-400">
                  {recommendation.best_price ? `₹${recommendation.best_price.toLocaleString("en-IN")}/Qtl` : "दर प्रतीक्षित"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">मूल्य अंतर / शुद्ध लाभ</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {recommendation.action === "SELL ELSEWHERE"
                    ? "परिवहन खर्च बाद अतिरिक्त लाभ"
                    : recommendation.weather_risk
                    ? "मौसम जोखिम (बारिश की संभावना)"
                    : "बाजार स्थिति"}
                </span>
                <span
                  className={`text-base font-black ${
                    recommendation.price_diff && recommendation.price_diff > 0
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  {recommendation.action === "SELL ELSEWHERE" && recommendation.price_diff
                    ? `+₹${Math.max(50, recommendation.price_diff - 70).toLocaleString("en-IN")}/Qtl`
                    : recommendation.weather_risk
                    ? "उच्च जोखिम 🌧️"
                    : "स्थिर / सामान्य"}
                </span>
              </div>
            </div>

            {/* Groq AI Explanation */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-3">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI सलाहकार का विस्तृत कारण (Why this recommendation):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                {recommendation.explanation}
              </p>
            </div>

            {/* Reasons Bullets */}
            {recommendation.reasons && recommendation.reasons.length > 0 && (
              <div className="space-y-1.5 text-xs text-slate-300">
                {recommendation.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 bg-emerald-50/40 border-b border-emerald-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* State Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t.filterState}</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? t.allStates : st}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t.filterCrop}</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? t.allCrops : c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">{t.searchMandi}</label>
            <div className="relative flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="उदा. खन्ना, टमाटर, गेहूं, आगरा..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-20 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                खोजें
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Mandi List Table & Mobile Cards */}
      <div className="p-6">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Data.gov.in से लाइव APMC भाव लोड हो रहे हैं...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="font-bold text-sm">{errorMsg}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              पुनः प्रयास करें
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">चुने गए राज्य/फसल के लिए आज कोई रिकॉर्ड उपलब्ध नहीं है।</p>
            <p className="text-xs text-gray-500 mt-1">कृपया अन्य फसल या &apos;सभी राज्य&apos; चुनकर देखें।</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    <th className="py-3 px-3">{t.market}</th>
                    <th className="py-3 px-3">{t.crop}</th>
                    <th className="py-3 px-3">{t.variety}</th>
                    <th className="py-3 px-3 text-right">{t.modalPrice}</th>
                    <th className="py-3 px-3 text-right">{t.priceRange}</th>
                    <th className="py-3 px-3 text-center">{t.trend}</th>
                    <th className="py-3 px-3 text-center">तारीख</th>
                    <th className="py-3 px-3 text-center">बोलें</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-gray-900 block">{item.market}</span>
                        <span className="text-xs text-gray-500">
                          {item.district}, {item.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-emerald-950 block">
                          {item.commodity_hi || item.commodity}
                        </span>
                        <span className="text-xs text-gray-500">{item.commodity}</span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-gray-600">
                        {item.variety || "सामान्य"} {item.grade && `(${item.grade})`}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-black text-emerald-800 text-base">
                          ₹{item.modal_price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-gray-500 block">प्रति क्विंटल</span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs text-gray-600">
                        ₹{item.min_price} - ₹{item.max_price}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {item.trend === "up" ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-0.5" /> तेज
                          </span>
                        ) : item.trend === "down" ? (
                          <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <TrendingDown className="w-3 h-3 mr-0.5" /> मंदा
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Minus className="w-3 h-3 mr-0.5" /> स्थिर
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs text-gray-500 font-mono">
                        {item.arrival_date}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => speakTopRate(item)}
                          title="भाव बोलकर सुनें"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-gray-900 block">{item.market}</span>
                      <span className="text-xs text-gray-500">
                        {item.district}, {item.state}
                      </span>
                    </div>
                    <button
                      onClick={() => speakTopRate(item)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2">
                    <div>
                      <span className="text-sm font-semibold text-emerald-950 block">
                        {item.commodity_hi || item.commodity}
                      </span>
                      <span className="text-xs text-gray-500">{item.variety || "सामान्य"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-800">
                        ₹{item.modal_price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-gray-400 block">/क्विंटल</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span>दायरा: ₹{item.min_price} - ₹{item.max_price}</span>
                    <span className="text-[11px] font-mono flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {item.arrival_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
