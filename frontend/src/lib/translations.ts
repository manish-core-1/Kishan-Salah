export type Language = "hi" | "en" | "pa" | "mr";

export interface Translations {
  appName: string;
  appTagline: string;
  helpline: string;
  navMandi: string;
  navWeather: string;
  navSchemes: string;
  navAdvisor: string;
  greetingTitle: string;
  greetingSubtitle: string;
  heroBadge: string;
  btnVoiceAdvisor: string;
  btnViewMandi: string;
  statMandiTitle: string;
  statMandiValue: string;
  statMandiDesc: string;
  statWeatherTitle: string;
  statWeatherValue: string;
  statWeatherDesc: string;
  statSchemesTitle: string;
  statSchemesValue: string;
  statSchemesDesc: string;
  statAdvisorTitle: string;
  statAdvisorValue: string;
  statAdvisorDesc: string;
  askKisanAI: string;
  advisorSubtitle: string;
  askPlaceholder: string;
  voiceSearch: string;
  listening: string;
  recordingActive: string;
  transcribing: string;
  thinking: string;
  advisorSuggestion: string;
  relatedTopics: string;
  stopListeningBtn: string;
  speakAudioBtn: string;
  stopAudioBtn: string;
  recSellNow: string;
  recWait: string;
  recSellElsewhere: string;
  quickChips: Array<{ label: string; query: string }>;
  speakAdvice: string;
  stopAudio: string;
  weatherTitle: string;
  weatherSubtitle: string;
  temp: string;
  humidity: string;
  wind: string;
  rainProb: string;
  agriAdvisory: string;
  mandiTitle: string;
  mandiSubtitle: string;
  allStates: string;
  allCrops: string;
  filterState: string;
  filterCrop: string;
  searchMandi: string;
  market: string;
  crop: string;
  variety: string;
  modalPrice: string;
  priceRange: string;
  trend: string;
  schemesTitle: string;
  schemesSubtitle: string;
  viewDetails: string;
  applyNow: string;
  benefits: string;
  eligibility: string;
  documents: string;
  close: string;
  loading: string;
  // Footer translations
  footerDesc: string;
  footerHelplineTitle: string;
  footerKcc: string;
  footerKccHours: string;
  footerPmKisanHelp: string;
  footerPmfbyHelp: string;
  footerQuickLinksTitle: string;
  footerLinkMandi: string;
  footerLinkWeather: string;
  footerLinkSchemes: string;
  footerLinkAdvisor: string;
  footerPortalsTitle: string;
  footerAgmarknet: string;
  footerPmKisanPortal: string;
  footerPmfbyPortal: string;
  footerCopyright: string;
}

export const translations: Record<Language, Translations> = {
  hi: {
    appName: "किसान सलाह",
    appTagline: "स्मार्ट खेती, समृद्ध किसान",
    helpline: "किसान कॉल सेंटर: 1800-180-1551",
    navMandi: "मंडी भाव",
    navWeather: "मौसम व सलाह",
    navSchemes: "सरकारी योजनाएं",
    navAdvisor: "किसान AI सलाहकार",
    greetingTitle: "राम-राम किसान भाइयों!",
    greetingSubtitle: "आज के ताजा मंडी भाव, 7-दिन का सटीक कृषि मौसम पूर्वानुमान और सरकारी योजनाओं की पूरी जानकारी एक ही जगह।",
    heroBadge: "डिजिटल कृषि भारत • राष्ट्रीय किसान सेवा",
    btnVoiceAdvisor: "बोलकर सलाह पूछें (AI Advisor)",
    btnViewMandi: "आज का मंडी भाव देखें →",
    statMandiTitle: "ताजा मंडी भाव",
    statMandiValue: "50+ प्रमुख मंडियां",
    statMandiDesc: "गेहूं, सरसों, धान, आलू आदि",
    statWeatherTitle: "सटीक मौसम व सलाह",
    statWeatherValue: "7 दिन का पूर्वानुमान",
    statWeatherDesc: "सिंचाई व छिड़काव विंडो",
    statSchemesTitle: "सरकारी योजनाएं",
    statSchemesValue: "₹6,000 / वर्ष",
    statSchemesDesc: "PM किसान, KCC, फसल बीमा",
    statAdvisorTitle: "किसान AI सलाहकार",
    statAdvisorValue: "24x7 बोलकर पूछें",
    statAdvisorDesc: "हिंदी, पंजाबी, मराठी में",
    askKisanAI: "किसान AI से सलाह पूछें (बोलकर या लिखकर)",
    advisorSubtitle: "बोलकर या लिखकर खेती, लाइव भाव या योजनाओं का तुरंत सटीक समाधान पाएं",
    askPlaceholder: "बोलें या लिखें: सरसों का भाव क्या है? आलू में झुलसा रोग में क्या डालें?",
    voiceSearch: "बोलकर पूछें (Voice)",
    listening: "आपकी आवाज़ सुनी जा रही है... बोलिए",
    recordingActive: "🔴 आवाज़ रिकॉर्ड हो रही है... बोलिए (बोलना पूरा होने पर 'सलाह देखें' दबाएं)",
    transcribing: "⚡ AI आवाज़ को टेक्स्ट में बदल रहा है...",
    thinking: "कृषि विशेषज्ञ से परामर्श तैयार हो रहा है...",
    advisorSuggestion: "किसान सलाहकार का परामर्श",
    relatedTopics: "संबंधित विषय:",
    stopListeningBtn: "रोकें",
    speakAudioBtn: "आवाज़ में सुनें",
    stopAudioBtn: "आवाज़ बंद करें",
    recSellNow: "अभी फसल बेचें (SELL NOW)",
    recWait: "कुछ दिन रुकें (WAIT)",
    recSellElsewhere: "दूसरी मंडी में बेचें (SELL ELSEWHERE)",
    quickChips: [
      { label: "💰 सरसों का ताजा मंडी भाव", query: "सरसों का आज का लाइव मंडी भाव क्या है और क्या मुझे बेचना चाहिए?" },
      { label: "🌤️ 7-दिन मौसम व स्प्रे विंडो", query: "आज का मौसम कैसा रहेगा और क्या कीटनाशक छिड़काव कर सकते हैं?" },
      { label: "🌾 गेहूं की बुवाई और सिंचाई", query: "गेहूं की बुवाई का सही समय, खाद और पहली सिंचाई कब करनी चाहिए?" },
      { label: "📋 PM किसान सम्मान निधि ₹6000", query: "पीएम किसान सम्मान निधि की अगली किस्त और e-KYC की जानकारी दें" },
      { label: "🐛 आलू व टमाटर में रोग व कीड़ा", query: "आलू और टमाटर में झुलसा रोग या कीड़ा लगने पर कौन सी दवा का छिड़काव करें?" },
      { label: "💳 KCC लोन 4% ब्याज", query: "किसान क्रेडिट कार्ड पर लोन 4% ब्याज पर कैसे मिलता है?" }
    ],
    speakAdvice: "सलाह सुनें",
    stopAudio: "रोकें",
    weatherTitle: "मौसम पूर्वानुमान एवं कृषि सलाह",
    weatherSubtitle: "आपके क्षेत्र के अनुसार 7 दिनों की सिंचाई, बुवाई व कीटनाशक छिड़काव की वैज्ञानिक सलाह",
    temp: "तापमान",
    humidity: "नमी",
    wind: "हवा की गति",
    rainProb: "बारिश की संभावना",
    agriAdvisory: "विशेष कृषि परामर्श",
    mandiTitle: "लाइव मंडी भाव (APMC)",
    mandiSubtitle: "देश की प्रमुख मंडियों के आज के ताजा न्यूनतम, अधिकतम और मॉडल भाव",
    allStates: "सभी राज्य",
    allCrops: "सभी फसलें",
    filterState: "राज्य चुनें",
    filterCrop: "फसल चुनें",
    searchMandi: "मंडी, जिला या फसल खोजें...",
    market: "मंडी",
    crop: "फसल",
    variety: "किस्म",
    modalPrice: "मॉडल भाव (₹/क्विंटल)",
    priceRange: "न्यूनतम - अधिकतम",
    trend: "रुझान",
    schemesTitle: "प्रमुख सरकारी योजनाएं एवं अनुदान",
    schemesSubtitle: "केंद्र और राज्य सरकार की योजनाओं के लाभ, पात्रता और आवेदन की सरल जानकारी",
    viewDetails: "पूरी जानकारी देखें",
    applyNow: "आधिकारिक पोर्टल पर जाएं",
    benefits: "योजना के लाभ",
    eligibility: "पात्रता (Eligibility)",
    documents: "आवश्यक दस्तावेज",
    close: "बंद करें",
    loading: "लोड हो रहा है...",
    // Footer
    footerDesc: "भारतीय किसानों को सटीक मौसम, आधुनिक वैज्ञानिक कृषि सलाह, ताजा मंडी भाव और सरकारी योजनाओं की सीधी जानकारी प्रदान करने वाला आधुनिक डिजिटल मंच।",
    footerHelplineTitle: "महत्वपूर्ण किसान हेल्पलाइन",
    footerKcc: "किसान कॉल सेंटर:",
    footerKccHours: "1800-180-1551 (टोल फ्री - 24 घंटे)",
    footerPmKisanHelp: "पीएम किसान हेल्पलाइन:",
    footerPmfbyHelp: "फसल बीमा हेल्पलाइन (PMFBY):",
    footerQuickLinksTitle: "त्वरित नेविगेशन",
    footerLinkMandi: "• आज का लाइव मंडी भाव",
    footerLinkWeather: "• 7-दिन का मौसम व छिड़काव विंडो",
    footerLinkSchemes: "• सरकारी योजनाएं व सब्सिडी",
    footerLinkAdvisor: "• किसान AI वॉइस असिस्टेंट",
    footerPortalsTitle: "आधिकारिक पोर्टल",
    footerAgmarknet: "Agmarknet (कृषि विपणन)",
    footerPmKisanPortal: "PM Kisan Portal",
    footerPmfbyPortal: "PMFBY (फसल बीमा)",
    footerCopyright: "© 2026 किसान सलाह (Kishaan Salah) • जय जवान, जय किसान"
  },
  en: {
    appName: "Kishaan Salah",
    appTagline: "Smart Farming, Prosperous Farmers",
    helpline: "Kisan Call Center: 1800-180-1551",
    navMandi: "Mandi Rates",
    navWeather: "Weather & Advisory",
    navSchemes: "Govt Schemes",
    navAdvisor: "Kisan AI Advisor",
    greetingTitle: "Welcome, Respected Farmers!",
    greetingSubtitle: "Get live mandi prices, 7-day precision agri-weather advisories, and official government schemes in one portal.",
    heroBadge: "Digital Agri India • National Farmer Service",
    btnVoiceAdvisor: "Ask Voice AI Advisor",
    btnViewMandi: "View Today's Mandi Rates →",
    statMandiTitle: "Live Mandi Rates",
    statMandiValue: "50+ Major Mandis",
    statMandiDesc: "Wheat, Mustard, Paddy, Potato",
    statWeatherTitle: "Agri Weather & Advisory",
    statWeatherValue: "7-Day Forecast",
    statWeatherDesc: "Irrigation & Spray Window",
    statSchemesTitle: "Govt Schemes",
    statSchemesValue: "₹6,000 / Year",
    statSchemesDesc: "PM Kisan, KCC, Crop Insurance",
    statAdvisorTitle: "Kisan AI Advisor",
    statAdvisorValue: "24x7 Voice Query",
    statAdvisorDesc: "Hindi, Punjabi, Marathi",
    askKisanAI: "Ask Kisan AI Advisor",
    advisorSubtitle: "Ask by voice or typing to get instant smart advice on crops, mandi rates, and schemes",
    askPlaceholder: "e.g., When should I irrigate wheat? What is today's mustard price?",
    voiceSearch: "Voice Query",
    listening: "Listening... Speak now",
    recordingActive: "🔴 Recording voice... Speak now (tap mic again when finished)",
    transcribing: "⚡ Groq Whisper AI transcribing your voice to text...",
    thinking: "Preparing smart agro-advisory consultation...",
    advisorSuggestion: "Kisan AI Advisory Verdict",
    relatedTopics: "Related Topics:",
    stopListeningBtn: "Stop",
    speakAudioBtn: "Listen Audio",
    stopAudioBtn: "Stop Audio",
    recSellNow: "Sell Now (SELL NOW)",
    recWait: "Wait a few days (WAIT)",
    recSellElsewhere: "Sell in Another Mandi (SELL ELSEWHERE)",
    quickChips: [
      { label: "💰 Today's Mustard Mandi Price", query: "What is today's mustard mandi price and should I sell now?" },
      { label: "🌤️ 7-Day Weather & Spray Window", query: "What is the weather forecast and is it suitable for spraying?" },
      { label: "🌾 Wheat Sowing & Irrigation", query: "When to sow wheat, fertilizer dosage and first irrigation schedule?" },
      { label: "📋 PM Kisan Samman Nidhi ₹6,000", query: "How to check PM Kisan installment and e-KYC status?" },
      { label: "🐛 Pest Control & Leaf Yellowing", query: "What should I spray for pest control and crop yellowing?" },
      { label: "💳 Kisan Credit Card (KCC) 4% Loan", query: "How to apply for Kisan Credit Card loan at 4% interest?" }
    ],
    speakAdvice: "Listen Audio",
    stopAudio: "Stop",
    weatherTitle: "Weather Forecast & Agri Advisory",
    weatherSubtitle: "7-Day scientific advisories for irrigation, sowing, and spraying tailored to your locale",
    temp: "Temperature",
    humidity: "Humidity",
    wind: "Wind Speed",
    rainProb: "Rain Probability",
    agriAdvisory: "Precision Agri Advisory",
    mandiTitle: "Live APMC Mandi Rates",
    mandiSubtitle: "Daily updated minimum, maximum and modal commodity prices across key markets",
    allStates: "All States",
    allCrops: "All Crops",
    filterState: "Select State",
    filterCrop: "Select Crop",
    searchMandi: "Search mandi, district or commodity...",
    market: "Market",
    crop: "Commodity",
    variety: "Variety",
    modalPrice: "Modal Price (₹/Qtl)",
    priceRange: "Min - Max",
    trend: "Trend",
    schemesTitle: "Key Government Schemes & Subsidies",
    schemesSubtitle: "Direct income support, subsidized farm loans, crop insurance, and equipment incentives",
    viewDetails: "View Details",
    applyNow: "Official Portal",
    benefits: "Key Benefits",
    eligibility: "Eligibility Criteria",
    documents: "Required Documents",
    close: "Close",
    loading: "Loading...",
    // Footer
    footerDesc: "A modern digital agro-platform empowering Indian farmers with precision 7-day weather advisories, live APMC mandi prices, and direct government schemes.",
    footerHelplineTitle: "Important Farmer Helplines",
    footerKcc: "Kisan Call Center:",
    footerKccHours: "1800-180-1551 (Toll-Free - 24x7)",
    footerPmKisanHelp: "PM Kisan Helpline:",
    footerPmfbyHelp: "Crop Insurance Helpline (PMFBY):",
    footerQuickLinksTitle: "Quick Navigation",
    footerLinkMandi: "• Live APMC Mandi Rates",
    footerLinkWeather: "• 7-Day Weather & Spray Window",
    footerLinkSchemes: "• Government Schemes & Subsidies",
    footerLinkAdvisor: "• Kisan AI Voice Assistant",
    footerPortalsTitle: "Official Portals",
    footerAgmarknet: "Agmarknet (Agri Marketing)",
    footerPmKisanPortal: "PM Kisan Portal",
    footerPmfbyPortal: "PMFBY (Crop Insurance)",
    footerCopyright: "© 2026 Kishaan Salah • Empowering Indian Agriculture"
  },
  pa: {
    appName: "ਕਿਸਾਨ ਸਲਾਹ",
    appTagline: "ਸਮਾਰਟ ਖੇਤੀ, ਖੁਸ਼ਹਾਲ ਕਿਸਾਨ",
    helpline: "ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ: 1800-180-1551",
    navMandi: "ਮੰਡੀ ਭਾਅ",
    navWeather: "ਮੌਸਮ ਤੇ ਸਲਾਹ",
    navSchemes: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ",
    navAdvisor: "ਕਿਸਾਨ AI ਸਲਾਹਕਾਰ",
    greetingTitle: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ!",
    greetingSubtitle: "ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ, 7 ਦਿਨਾਂ ਦਾ ਸਟੀਕ ਖੇਤੀ ਮੌਸਮ ਅਨੁਮਾਨ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ।",
    heroBadge: "ਡਿਜੀਟਲ ਖੇਤੀ ਭਾਰਤ • ਰਾਸ਼ਟਰੀ ਕਿਸਾਨ ਸੇਵਾ",
    btnVoiceAdvisor: "ਬੋਲ ਕੇ ਸਲਾਹ ਲਵੋ (AI Advisor)",
    btnViewMandi: "ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਦੇਖੋ →",
    statMandiTitle: "ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ",
    statMandiValue: "50+ ਪ੍ਰਮੁੱਖ ਮੰਡੀਆਂ",
    statMandiDesc: "ਕਣਕ, ਸਰ੍ਹੋਂ, ਝੋਨਾ, ਆਲੂ ਆਦਿ",
    statWeatherTitle: "ਸਹੀ ਮੌਸਮ ਅਤੇ ਸਲਾਹ",
    statWeatherValue: "7 ਦਿਨਾਂ ਦਾ ਪੂਰਵ ਅਨੁਮਾਨ",
    statWeatherDesc: "ਸਿੰਚਾਈ ਤੇ ਸਪਰੇਅ ਵਿੰਡੋ",
    statSchemesTitle: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ",
    statSchemesValue: "₹6,000 / ਸਾਲ",
    statSchemesDesc: "ਪੀਐਮ ਕਿਸਾਨ, ਕੇਸੀਸੀ, ਫ਼ਸਲ ਬੀਮਾ",
    statAdvisorTitle: "ਕਿਸਾਨ AI ਸਲਾਹਕਾਰ",
    statAdvisorValue: "24x7 ਬੋਲ ਕੇ ਪੁੱਛੋ",
    statAdvisorDesc: "ਹਿੰਦੀ, ਪੰਜਾਬੀ, ਮਰਾਠੀ ਵਿੱਚ",
    askKisanAI: "ਕਿਸਾਨ AI ਤੋਂ ਸਲਾਹ ਲਵੋ",
    advisorSubtitle: "ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਖੇਤੀ, ਮੰਡੀ ਭਾਅ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦਾ ਤੁਰੰਤ ਹੱਲ ਪ੍ਰਾਪਤ ਕਰੋ",
    askPlaceholder: "ਜਿਵੇਂ: ਕਣਕ ਦੀ ਪਹਿਲੀ ਸਿੰਚਾਈ ਕਦੋਂ ਕਰੀਏ? ਸਰ੍ਹੋਂ ਦਾ ਭਾਅ ਕੀ ਹੈ?",
    voiceSearch: "ਬੋਲ ਕੇ ਪੁੱਛੋ",
    listening: "ਸੁਣ ਰਹੇ ਹਾਂ... ਬੋਲੋ",
    recordingActive: "🔴 ਆਵਾਜ਼ ਰਿਕਾਰਡ ਹੋ ਰਹੀ ਹੈ... ਬੋਲੋ (ਬੋਲਣਾ ਪੂਰਾ ਹੋਣ 'ਤੇ ਦੁਬਾਰਾ ਮਾਈਕ ਦਬਾਓ)",
    transcribing: "⚡ Groq Whisper AI ਆਵਾਜ਼ ਨੂੰ ਸ਼ਬਦਾਂ ਵਿੱਚ ਬਦਲ ਰਿਹਾ ਹੈ...",
    thinking: "ਖੇਤੀ ਮਾਹਿਰਾਂ ਤੋਂ ਸਲਾਹ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    advisorSuggestion: "ਕਿਸਾਨ ਸਲਾਹਕਾਰ ਦਾ ਸੁਝਾਅ",
    relatedTopics: "ਸਬੰਧਤ ਵਿਸ਼ੇ:",
    stopListeningBtn: "ਰੋਕੋ",
    speakAudioBtn: "ਸਲਾਹ ਸੁਣੋ",
    stopAudioBtn: "ਆਵਾਜ਼ ਬੰਦ ਕਰੋ",
    recSellNow: "ਹੁਣੇ ਫ਼ਸਲ ਵੇਚੋ (SELL NOW)",
    recWait: "ਕੁਝ ਦਿਨ ਰੁਕੋ (WAIT)",
    recSellElsewhere: "ਦੂਜੀ ਮੰਡੀ ਵਿੱਚ ਵੇਚੋ (SELL ELSEWHERE)",
    quickChips: [
      { label: "💰 ਸਰ੍ਹੋਂ ਦਾ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ", query: "ਅੱਜ ਸਰ੍ਹੋਂ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ ਅਤੇ ਕੀ ਮੈਨੂੰ ਵੇਚਣਾ ਚਾਹੀਦਾ ਹੈ?" },
      { label: "🌤️ 7-ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਤੇ ਸਪਰੇਅ ਵਿੰਡੋ", query: "ਅੱਜ ਮੌਸਮ ਕਿਹੋ ਜਿਹਾ ਰਹੇਗਾ ਅਤੇ ਕੀ ਕੀਟਨਾਸ਼ਕ ਸਪਰੇਅ ਕਰ ਸਕਦੇ ਹਾਂ?" },
      { label: "🌾 ਕਣਕ ਦੀ ਬਿਜਾਈ ਤੇ ਸਿੰਚਾਈ", query: "ਕਣਕ ਦੀ ਬਿਜਾਈ ਦਾ ਸਹੀ ਸਮਾਂ, ਖਾਦ ਅਤੇ ਪਹਿਲੀ ਸਿੰਚਾਈ ਕਦੋਂ ਕਰੀਏ?" },
      { label: "📋 ਪੀਐਮ ਕਿਸਾਨ ਸਨਮਾਨ ਨਿਧੀ", query: "ਪੀਐਮ ਕਿਸਾਨ ਕਿਸ਼ਤ ਅਤੇ ਈ-ਕੇਵਾਈਸੀ ਕਿਵੇਂ ਚੈੱਕ ਕਰੀਏ?" },
      { label: "🐛 ਫ਼ਸਲ ਵਿੱਚ ਕੀੜੇ ਅਤੇ ਪੀਲਾਪਣ", query: "ਫ਼ਸਲ ਵਿੱਚ ਕੀੜਾ ਜਾਂ ਪੀਲਾਪਣ ਆਉਣ 'ਤੇ ਕਿਹੜੀ ਸਪਰੇਅ ਕਰੀਏ?" },
      { label: "💳 ਕੇਸੀਸੀ ਲੋਨ 4% ਵਿਆਜ", query: "ਕਿਸਾਨ ਕ੍ਰੈਡਿਟ ਕਾਰਡ 'ਤੇ 4% ਵਿਆਜ 'ਤੇ ਲੋਨ ਕਿਵੇਂ ਮਿਲਦਾ ਹੈ?" }
    ],
    speakAdvice: "ਸਲਾਹ ਸੁਣੋ",
    stopAudio: "ਰੋਕੋ",
    weatherTitle: "ਮੌਸਮ ਪੂਰਵ ਅਨੁਮਾਨ ਅਤੇ ਖੇਤੀ ਸਲਾਹ",
    weatherSubtitle: "7 ਦਿਨਾਂ ਦੀ ਸਿੰਚਾਈ, ਬਿਜਾਈ ਅਤੇ ਕੀਟਨਾਸ਼ਕ ਸਪਰੇਅ ਲਈ ਮਾਹਿਰਾਂ ਦੀ ਸਲਾਹ",
    temp: "ਤਾਪਮਾਨ",
    humidity: "ਨਮੀ",
    wind: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ",
    rainProb: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
    agriAdvisory: "ਖੇਤੀਬਾੜੀ ਸਲਾਹ",
    mandiTitle: "ਲਾਈਵ ਮੰਡੀ ਭਾਅ",
    mandiSubtitle: "ਪੰਜਾਬ ਅਤੇ ਗੁਆਂਢੀ ਰਾਜਾਂ ਦੀਆਂ ਮੰਡੀਆਂ ਦੇ ਤਾਜ਼ਾ ਭਾਅ",
    allStates: "ਸਾਰੇ ਰਾਜ",
    allCrops: "ਸਾਰੀਆਂ ਫ਼ਸਲਾਂ",
    filterState: "ਰਾਜ ਚੁਣੋ",
    filterCrop: "ਫ਼ਸਲ ਚੁਣੋ",
    searchMandi: "ਮੰਡੀ, ਜ਼ਿਲ੍ਹਾ ਜਾਂ ਫ਼ਸਲ ਖੋਜੋ...",
    market: "ਮੰਡੀ",
    crop: "ਫ਼ਸਲ",
    variety: "ਕਿਸਮ",
    modalPrice: "ਮਾਡਲ ਭਾਅ (₹/ਕੁਇੰਟਲ)",
    priceRange: "ਘੱਟੋ-ਘੱਟ - ਵੱਧ ਤੋਂ ਵੱਧ",
    trend: "ਰੁਝਾਨ",
    schemesTitle: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਸਬਸਿਡੀਆਂ",
    schemesSubtitle: "ਕਿਸਾਨਾਂ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ ਅਤੇ ਮਸ਼ੀਨਰੀ 'ਤੇ ਛੋਟ ਦੀ ਜਾਣਕਾਰੀ",
    viewDetails: "ਵੇਰਵੇ ਦੇਖੋ",
    applyNow: "ਸਰਕਾਰੀ ਪੋਰਟਲ",
    benefits: "ਸਕੀਮ ਦੇ ਲਾਭ",
    eligibility: "ਯੋਗਤਾ",
    documents: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼",
    close: "ਬੰਦ ਕਰੋ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    // Footer
    footerDesc: "ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਨੂੰ ਸਟੀਕ ਮੌਸਮ, ਆਧੁਨਿਕ ਵਿਗਿਆਨਕ ਖੇਤੀ ਸਲਾਹ, ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਸਿੱਧੀ ਜਾਣਕਾਰੀ ਦੇਣ ਵਾਲਾ ਆਧੁਨਿਕ ਡਿਜੀਟਲ ਮੰਚ।",
    footerHelplineTitle: "ਮਹੱਤਵਪੂਰਨ ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ",
    footerKcc: "ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ:",
    footerKccHours: "1800-180-1551 (ਟੋਲ ਫ੍ਰੀ - 24 ਘੰਟੇ)",
    footerPmKisanHelp: "ਪੀਐਮ ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ:",
    footerPmfbyHelp: "ਫ਼ਸਲ ਬੀਮਾ ਹੈਲਪਲਾਈਨ (PMFBY):",
    footerQuickLinksTitle: "ਤੁਰੰਤ ਨੇਵੀਗੇਸ਼ਨ",
    footerLinkMandi: "• ਅੱਜ ਦਾ ਲਾਈਵ ਮੰਡੀ ਭਾਅ",
    footerLinkWeather: "• 7-ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਤੇ ਸਪਰੇਅ ਵਿੰਡੋ",
    footerLinkSchemes: "• ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਸਬਸਿਡੀਆਂ",
    footerLinkAdvisor: "• ਕਿਸਾਨ AI ਵੌਇਸ ਅਸਿਸਟੈਂਟ",
    footerPortalsTitle: "ਅਧਿਕਾਰਤ ਪੋਰਟਲ",
    footerAgmarknet: "Agmarknet (ਖੇਤੀਬਾੜੀ ਮੰਡੀਕਰਨ)",
    footerPmKisanPortal: "PM Kisan Portal",
    footerPmfbyPortal: "PMFBY (ਫ਼ਸਲ ਬੀਮਾ)",
    footerCopyright: "© 2026 ਕਿਸਾਨ ਸਲਾਹ (Kishaan Salah) • ਜੈ ਜਵਾਨ, ਜੈ ਕਿਸਾਨ"
  },
  mr: {
    appName: "किसान सल्ला",
    appTagline: "स्मार्ट शेती, समृद्ध शेतकरी",
    helpline: "किसान कॉल सेंटर: १८००-१८०-१५५१",
    navMandi: "बाजार भाव",
    navWeather: "हवामान व सल्ला",
    navSchemes: "शासकीय योजना",
    navAdvisor: "किसान AI सल्लागार",
    greetingTitle: "राम राम शेतकरी बांधवांनो!",
    greetingSubtitle: "आजचे ताजे बाजार भाव, ७ दिवसांचा अचूक हवामान अंदाज आणि शासकीय योजनांची परिपूर्ण माहिती.",
    heroBadge: "डिजिटल कृषी भारत • राष्ट्रीय शेतकरी सेवा",
    btnVoiceAdvisor: "आवाजाद्वारे सल्ला विचारा (AI Advisor)",
    btnViewMandi: "आजचे बाजार भाव पहा →",
    statMandiTitle: "ताजे बाजार भाव",
    statMandiValue: "५०+ प्रमुख बाजार समित्या",
    statMandiDesc: "गहू, मोहरी, भात, बटाटा इ.",
    statWeatherTitle: "अचूक हवामान व सल्ला",
    statWeatherValue: "७ दिवसांचा अंदाज",
    statWeatherDesc: "सिंचन व फवारणी वेळ",
    statSchemesTitle: "शासकीय योजना",
    statSchemesValue: "₹६,००० / वर्ष",
    statSchemesDesc: "पीएम किसान, केसीसी, पीक विमा",
    statAdvisorTitle: "किसान AI सल्लागार",
    statAdvisorValue: "२४x७ आवाजाद्वारे विचारा",
    statAdvisorDesc: "हिंदी, पंजाबी, मराठी भाषेत",
    askKisanAI: "किसान AI ला प्रश्न विचारा",
    advisorSubtitle: "आवाजाद्वारे किंवा लिहून शेती, बाजार भाव किंवा शासकीय योजनांचे तत्काळ अचूक मार्गदर्शन मिळवा",
    askPlaceholder: "उदा: गव्हाला पहिले पाणी कधी द्यावे? आज कांद्याचे भाव काय आहेत?",
    voiceSearch: "आवाजाद्वारे विचारा",
    listening: "ऐकत आहे... बोला",
    recordingActive: "🔴 आवाज रेकॉर्ड होत आहे... बोला (बोलणे पूर्ण झाल्यावर पुन्हा माईक दाबा)",
    transcribing: "⚡ Groq Whisper AI आवाजाचे मजकुरात रूपांतर करत आहे...",
    thinking: "कृषी तज्ज्ञांकडून मार्गदर्शन तयार होत आहे...",
    advisorSuggestion: "किसान सल्लागाराचा निर्णय",
    relatedTopics: "संबंधित विषय:",
    stopListeningBtn: "थांबवा",
    speakAudioBtn: "आवाजात ऐका",
    stopAudioBtn: "आवाज बंद करा",
    recSellNow: "आत्ताच पीक विका (SELL NOW)",
    recWait: "काही दिवस थांबा (WAIT)",
    recSellElsewhere: "दुसऱ्या बाजार समितीत विका (SELL ELSEWHERE)",
    quickChips: [
      { label: "💰 सोयाबीन व मोहरीचे ताजे भाव", query: "आज सोयाबीन व मोहरीचे बाजार भाव काय आहेत आणि विक्री करावी का?" },
      { label: "🌤️ ७ दिवसांचा हवामान अंदाज व फवारणी", query: "आज हवामान कसे राहील आणि कीटकनाशक फवारणी करावी का?" },
      { label: "🌾 गव्हाची पेरणी आणि सिंचन", query: "गव्हाची पेरणी, खतांचे प्रमाण आणि पहिले पाणी कधी द्यावे?" },
      { label: "📋 पीएम किसान सन्मान निधी ₹६०००", query: "पीएम किसान योजनेचा हप्ता आणि ई-केवायसी कसे तपासावे?" },
      { label: "🐛 पिकावरील रोग व कीड नियंत्रण", query: "पिकावर कीड पडल्यास व पाने पिवळी पडल्यास कोणती फवारणी करावी?" },
      { label: "💳 केसीसी कर्ज ४% व्याजदर", query: "किसान क्रेडिट कार्डवर ४% व्याजदराने कर्ज कसे मिळवायचे?" }
    ],
    speakAdvice: "सल्ला ऐका",
    stopAudio: "थांबवा",
    weatherTitle: "हवामान अंदाज व कृषी सल्ला",
    weatherSubtitle: "७ दिवसांचे सिंचन, पेरणी आणि कीटकनाशक फवारणीसाठी तज्ज्ञ सल्ला",
    temp: "तापमान",
    humidity: "आर्द्रता",
    wind: "वाऱ्याचा वेग",
    rainProb: "पावसाची शक्यता",
    agriAdvisory: "विशेष कृषी सल्ला",
    mandiTitle: "थेट कृषी उत्पन्न बाजार समिती भाव",
    mandiSubtitle: "महाराष्ट्रातील व देशातील प्रमुख बाजार समित्यांचे आजचे दर",
    allStates: "सर्व राज्ये",
    allCrops: "सर्व पिके",
    filterState: "राज्य निवडा",
    filterCrop: "पीक निवडा",
    searchMandi: "बाजार समिती किंवा पीक शोधा...",
    market: "बाजार समिती",
    crop: "पीक",
    variety: "जात",
    modalPrice: "सरासरी भाव (₹/क्विंटल)",
    priceRange: "किमान - कमाल",
    trend: "कल",
    schemesTitle: "शासकीय योजना व अनुदान",
    schemesSubtitle: "शेतकऱ्यांसाठी आर्थिक सहाय्य, पीक विमा व सिंचन अनुदानाची माहिती",
    viewDetails: "सविस्तर माहिती",
    applyNow: "अधिकृत पोर्टल",
    benefits: "योजनेचे फायदे",
    eligibility: "पात्रता",
    documents: "आवश्यक कागदपत्रे",
    close: "बंद करा",
    loading: "लोड होत आहे...",
    // Footer
    footerDesc: "भारतीय शेतकऱ्यांना अचूक हवामान, आधुनिक वैज्ञानिक कृषी सल्ला, ताजे बाजार भाव आणि शासकीय योजनांची थेट माहिती देणारे आधुनिक डिजिटल व्यासपीठ.",
    footerHelplineTitle: "महत्त्वाच्या शेतकरी हेल्पलाईन",
    footerKcc: "किसान कॉल सेंटर:",
    footerKccHours: "१८००-१८०-१५५१ (टोल फ्री - २४ तास)",
    footerPmKisanHelp: "पीएम किसान हेल्पलाईन:",
    footerPmfbyHelp: "पीक विमा हेल्पलाईन (PMFBY):",
    footerQuickLinksTitle: "जलद नेव्हिगेशन",
    footerLinkMandi: "• आजचे थेट बाजार भाव",
    footerLinkWeather: "• ७ दिवसांचा हवामान अंदाज व फवारणी वेळ",
    footerLinkSchemes: "• शासकीय योजना व अनुदान",
    footerLinkAdvisor: "• किसान AI व्हॉईस असिस्टंट",
    footerPortalsTitle: "अधिकृत पोर्टल",
    footerAgmarknet: "Agmarknet (कृषी पणन)",
    footerPmKisanPortal: "PM Kisan Portal",
    footerPmfbyPortal: "PMFBY (पीक विमा)",
    footerCopyright: "© २०२६ किसान सल्ला (Kishaan Salah) • जय जवान, जय किसान"
  }
};
