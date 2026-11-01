"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { VoiceAdvisor } from "@/components/VoiceAdvisor";
import { WeatherWidget } from "@/components/WeatherWidget";
import { MandiWidget } from "@/components/MandiWidget";
import { SchemesWidget } from "@/components/SchemesWidget";
import { Language, translations } from "@/lib/translations";
import {
  Sprout,
  Store,
  CloudSun,
  Landmark,
  Bot
} from "lucide-react";

export default function Home() {
  const [currentLang, setCurrentLang] = useState<Language>("hi");
  const [activeSection, setActiveSection] = useState<string>("home");

  const t = translations[currentLang];

  const quickStats = [
    {
      title: t.statMandiTitle,
      value: t.statMandiValue,
      desc: t.statMandiDesc,
      icon: <Store className="w-5 h-5 text-amber-600" />,
      target: "mandi",
      color: "border-amber-200 bg-amber-50/50"
    },
    {
      title: t.statWeatherTitle,
      value: t.statWeatherValue,
      desc: t.statWeatherDesc,
      icon: <CloudSun className="w-5 h-5 text-sky-600" />,
      target: "weather",
      color: "border-sky-200 bg-sky-50/50"
    },
    {
      title: t.statSchemesTitle,
      value: t.statSchemesValue,
      desc: t.statSchemesDesc,
      icon: <Landmark className="w-5 h-5 text-emerald-600" />,
      target: "schemes",
      color: "border-emerald-200 bg-emerald-50/50"
    },
    {
      title: t.statAdvisorTitle,
      value: t.statAdvisorValue,
      desc: t.statAdvisorDesc,
      icon: <Bot className="w-5 h-5 text-teal-600" />,
      target: "advisor",
      color: "border-teal-200 bg-teal-50/50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-xs">
                <Sprout className="w-4 h-4 text-amber-400" />
                <span>{t.heroBadge}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                {t.greetingTitle}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
                {t.greetingSubtitle}
              </p>

              {/* Quick Jump Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => setActiveSection("advisor")}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>{t.btnVoiceAdvisor}</span>
                </button>
                <button
                  onClick={() => setActiveSection("mandi")}
                  className="px-5 py-2.5 bg-emerald-900/80 hover:bg-emerald-900 text-white font-semibold rounded-xl border border-emerald-500/80 transition-all text-sm cursor-pointer"
                >
                  <span>{t.btnViewMandi}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              {quickStats.map((stat, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSection(stat.target)}
                  className={`p-4 rounded-2xl border ${stat.color} bg-white/95 text-slate-800 shadow-lg cursor-pointer hover:scale-102 hover:shadow-xl transition-all`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 inline-block mb-2 shadow-xs">
                    {stat.icon}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{stat.title}</h3>
                  <p className="text-base font-black text-emerald-800">{stat.value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 space-y-10">
        {/* Voice AI Advisor */}
        {(activeSection === "home" || activeSection === "advisor") && (
          <section id="advisor" className="scroll-mt-20">
            <VoiceAdvisor currentLang={currentLang} />
          </section>
        )}

        {/* Weather Forecast & Agri-Advisory */}
        {(activeSection === "home" || activeSection === "weather") && (
          <section id="weather" className="scroll-mt-20">
            <WeatherWidget currentLang={currentLang} />
          </section>
        )}

        {/* Live APMC Mandi Rates */}
        {(activeSection === "home" || activeSection === "mandi") && (
          <section id="mandi" className="scroll-mt-20">
            <MandiWidget currentLang={currentLang} />
          </section>
        )}

        {/* Government Schemes & Subsidies */}
        {(activeSection === "home" || activeSection === "schemes") && (
          <section id="schemes" className="scroll-mt-20">
            <SchemesWidget currentLang={currentLang} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-700 rounded-lg text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">{t.appName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerDesc}
            </p>
          </div>

          {/* Emergency Farmer Helplines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {t.footerHelplineTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <strong className="text-amber-400 block">{t.footerKcc}</strong>
                <a href="tel:18001801551" className="hover:text-white">
                  {t.footerKccHours}
                </a>
              </li>
              <li>
                <strong className="text-amber-400 block">{t.footerPmKisanHelp}</strong>
                <a href="tel:155261" className="hover:text-white">
                  155261 / 011-24300606
                </a>
              </li>
              <li>
                <strong className="text-amber-400 block">{t.footerPmfbyHelp}</strong>
                <a href="tel:14447" className="hover:text-white">
                  14447
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {t.footerQuickLinksTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveSection("mandi")} className="hover:text-amber-400 cursor-pointer">
                  {t.footerLinkMandi}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("weather")}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.footerLinkWeather}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("schemes")}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.footerLinkSchemes}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("advisor")}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.footerLinkAdvisor}
                </button>
              </li>
            </ul>
          </div>

          {/* Government Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {t.footerPortalsTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://agmarknet.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white cursor-pointer"
                >
                  {t.footerAgmarknet} ↗
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white cursor-pointer"
                >
                  {t.footerPmKisanPortal} ↗
                </a>
              </li>
              <li>
                <a
                  href="https://pmfby.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white cursor-pointer"
                >
                  {t.footerPmfbyPortal} ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>{t.footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
}
