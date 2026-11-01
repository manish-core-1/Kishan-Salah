"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Landmark,
  ShieldCheck,
  CheckCircle,
  FileText,
  ExternalLink,
  Phone,
  Volume2,
  X,
  Sparkles
} from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { fetchSchemes, SchemeItem } from "@/lib/api";
import { VoiceAssistant } from "@/lib/speech";

interface SchemesWidgetProps {
  currentLang: Language;
}

export const SchemesWidget: React.FC<SchemesWidgetProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<SchemeItem | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Financial Support", "Insurance", "Irrigation", "Equipment & Tech"];

  const loadData = useCallback(() => {
    setLoading(true);
    fetchSchemes(selectedCategory, searchTerm)
      .then((data) => setSchemes(data))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const speakScheme = (item: SchemeItem) => {
    const title = item.name[currentLang] || item.name["hi"];
    const summary = item.summary[currentLang] || item.summary["hi"];
    const text = `${title}। ${summary}`;
    VoiceAssistant.speak(text, currentLang);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 p-6 text-white">
        <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
          <Landmark className="w-4 h-4" />
          <span>Sarkari Kisan Yojnaayein</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">{t.schemesTitle}</h2>
        <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">{t.schemesSubtitle}</p>
      </div>

      {/* Categories & Search */}
      <div className="p-6 bg-emerald-50/40 border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-emerald-100/60 border border-gray-200"
              }`}
            >
              {cat === "All" ? "सभी योजनाएं" : cat}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            placeholder="योजना खोजें..."
            className="w-full sm:w-64 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="p-6">
        {loading ? (
          <div className="py-12 text-center text-emerald-800">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-medium text-sm">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => {
              const title = scheme.name[currentLang] || scheme.name["hi"] || scheme.name["en"];
              const summary = scheme.summary[currentLang] || scheme.summary["hi"] || scheme.summary["en"];

              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top badge & listen */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {scheme.badge || scheme.category}
                      </span>
                      <button
                        onClick={() => speakScheme(scheme)}
                        title="योजना सुनें"
                        className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveModal(scheme)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{t.viewDetails}</span>
                      <span>→</span>
                    </button>

                    <a
                      href={scheme.official_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{t.applyNow}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheme Detail Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-emerald-800 p-6 text-white sticky top-0 flex items-start justify-between">
              <div>
                <span className="text-xs text-amber-300 font-bold tracking-wide uppercase block mb-1">
                  {activeModal.category}
                </span>
                <h3 className="text-xl font-bold leading-snug">
                  {activeModal.name[currentLang] || activeModal.name["hi"]}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  योजना का परिचय
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {activeModal.summary[currentLang] || activeModal.summary["hi"]}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t.benefits}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {(
                    activeModal.benefits[currentLang] ||
                    activeModal.benefits["hi"] ||
                    activeModal.benefits["en"] ||
                    []
                  ).map((b, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility */}
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.eligibility}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {(
                    activeModal.eligibility[currentLang] ||
                    activeModal.eligibility["hi"] ||
                    activeModal.eligibility["en"] ||
                    []
                  ).map((el, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>{t.documents}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(
                    activeModal.documents[currentLang] ||
                    activeModal.documents["hi"] ||
                    activeModal.documents["en"] ||
                    []
                  ).map((doc, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-medium border border-gray-200"
                    >
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Helpline */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-900 text-xs">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>
                    <strong>हेल्पलाइन नंबर:</strong> {activeModal.helpline}
                  </span>
                </div>
                <a
                  href={`tel:${activeModal.helpline.split("/")[0].trim()}`}
                  className="text-xs font-bold text-amber-800 underline"
                >
                  कॉल करें
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => speakScheme(activeModal)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>योजना विवरण सुनें</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  {t.close}
                </button>
                <a
                  href={activeModal.official_portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <span>{t.applyNow}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
