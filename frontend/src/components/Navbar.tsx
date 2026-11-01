"use client";

import React from "react";
import { Sprout, PhoneCall, Globe } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeSection,
  onSelectSection
}) => {
  const t = translations[currentLang];

  const languages: { code: Language; label: string }[] = [
    { code: "hi", label: "हिन्दी" },
    { code: "en", label: "English" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
    { code: "mr", label: "मराठी" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-800 text-white shadow-md border-b border-emerald-700">
      {/* Top emergency ribbon */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-1.5 px-4 flex justify-between items-center border-b border-emerald-900">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t.appTagline}</span>
        </div>
        <a
          href="tel:18001801551"
          className="flex items-center space-x-1.5 font-medium hover:text-amber-300 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.helpline}</span>
        </a>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => onSelectSection("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="bg-emerald-700 group-hover:bg-amber-500 transition-colors p-2 rounded-xl shadow-inner">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white block leading-tight">
                {t.appName}
              </span>
              <span className="text-xs text-emerald-200 hidden sm:block">
                Kishaan Salah • Agro Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {[
              { id: "mandi", label: t.navMandi },
              { id: "weather", label: t.navWeather },
              { id: "schemes", label: t.navSchemes },
              { id: "advisor", label: t.navAdvisor }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? "bg-amber-500 text-emerald-950 shadow-sm"
                    : "text-emerald-100 hover:bg-emerald-700 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-emerald-900/80 p-1 rounded-lg border border-emerald-700/60">
              <Globe className="w-4 h-4 text-emerald-300 ml-1.5 mr-1" />
              <div className="flex space-x-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                      currentLang === lang.code
                        ? "bg-amber-400 text-emerald-950 font-bold shadow-sm"
                        : "text-emerald-200 hover:text-white hover:bg-emerald-800"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav buttons */}
      <div className="md:hidden flex overflow-x-auto py-2 px-3 space-x-2 bg-emerald-850 border-t border-emerald-700">
        {[
          { id: "mandi", label: t.navMandi },
          { id: "weather", label: t.navWeather },
          { id: "schemes", label: t.navSchemes },
          { id: "advisor", label: t.navAdvisor }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSection(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeSection === item.id
                ? "bg-amber-500 text-emerald-950"
                : "bg-emerald-900/60 text-emerald-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
