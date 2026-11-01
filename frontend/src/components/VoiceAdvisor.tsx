"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, Square, Sparkles, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { VoiceAssistant, AudioVoiceRecorder } from "@/lib/speech";
import { queryAdvisor, transcribeAudio, AdvisorResponse } from "@/lib/api";

interface VoiceAdvisorProps {
  currentLang: Language;
}

export const VoiceAdvisor: React.FC<VoiceAdvisorProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);

  const recorderRef = useRef<AudioVoiceRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const latestQueryRef = useRef("");

  useEffect(() => {
    latestQueryRef.current = query;
  }, [query]);

  // Clean up timers and audio on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current && recorderRef.current.isRecording()) {
        recorderRef.current.stopRecording().catch(() => {});
      }
      VoiceAssistant.stop();
    };
  }, []);

  const handleAsk = async (textToAsk?: string) => {
    const text = (textToAsk !== undefined ? textToAsk : latestQueryRef.current).trim();
    if (!text) return;

    setLoading(true);
    setMicError(null);
    try {
      const data = await queryAdvisor(text, currentLang);
      setResponse(data);
      if (data.speech_text || data.answer) {
        VoiceAssistant.speak(data.speech_text || data.answer, currentLang, () => setIsSpeaking(false));
        setIsSpeaking(true);
      }
    } catch (err) {
      console.error("Advisor query error:", err);
      setMicError("सलाह प्राप्त करने में समस्या आई। कृपया दोबारा प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  const stopAllListening = () => {
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startListening = async () => {
    VoiceAssistant.stop();
    setIsSpeaking(false);
    setMicError(null);
    setRecordingSeconds(0);

    if (!recorderRef.current) {
      recorderRef.current = new AudioVoiceRecorder();
    }

    const started = await recorderRef.current.startRecording();
    if (!started) {
      setMicError("माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र एड्रेस बार में 🔒 या 🎙️ पर क्लिक करके 'Allow' करें।");
      return;
    }

    setIsListening(true);

    // Visual seconds counter & 8-second auto-stop
    let sec = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      sec += 1;
      setRecordingSeconds(sec);
      if (sec >= 8) {
        stopListeningAndSearch();
      }
    }, 1000);
  };

  const stopListeningAndSearch = async () => {
    stopAllListening();

    if (recorderRef.current && recorderRef.current.isRecording()) {
      setIsTranscribing(true);
      setMicError(null);
      try {
        const audioBlob = await recorderRef.current.stopRecording();
        if (audioBlob && audioBlob.size > 500) {
          const res = await transcribeAudio(audioBlob, currentLang);
          if (res.transcript && res.transcript.trim()) {
            const cleanText = res.transcript.trim();
            setQuery(cleanText);
            latestQueryRef.current = cleanText;
            await handleAsk(cleanText);
          } else {
            setMicError("आवाज़ साफ़ रिकॉर्ड नहीं हो सकी। कृपया माइक के पास आकर स्पष्ट बोलें या लिखकर पूछें।");
          }
        } else {
          setMicError("आवाज़ रिकॉर्ड नहीं हो सकी। कृपया दोबारा माइक दबाकर बोलें।");
        }
      } catch (err) {
        console.warn("Groq Whisper error:", err);
        setMicError("आवाज़ पहचानने में समस्या आई। कृपया लिखकर प्रश्न पूछें।");
      } finally {
        setIsTranscribing(false);
      }
    } else {
      const current = latestQueryRef.current.trim();
      if (current.length > 1) {
        handleAsk(current);
      }
    }
  };

  const cancelListening = () => {
    stopAllListening();
    if (recorderRef.current && recorderRef.current.isRecording()) {
      recorderRef.current.stopRecording().catch(() => {});
    }
    setIsTranscribing(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListeningAndSearch();
    } else {
      startListening();
    }
  };

  const handleSpeakAudio = () => {
    if (isSpeaking) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
    } else if (response) {
      VoiceAssistant.speak(response.speech_text || response.answer, currentLang, () =>
        setIsSpeaking(false)
      );
      setIsSpeaking(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-emerald-950 rounded-xl shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{t.askKisanAI}</h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                {t.advisorSubtitle}
              </p>
            </div>
          </div>
          {response && (
            <button
              onClick={handleSpeakAudio}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-700/80 hover:bg-emerald-600 text-white"
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>{t.stopAudioBtn}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.speakAudioBtn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="p-6 space-y-4">
        {/* Mic Permission / Feedback Warning */}
        {micError && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs sm:text-sm font-semibold flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Live Audio Status Banners */}
        {isListening && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-rose-50 border-2 border-rose-400 rounded-xl text-rose-900 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1 items-center">
                <span className="w-2.5 h-5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2.5 h-7 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2.5 h-4 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-rose-800">
                  🔴 0{recordingSeconds}s • {t.listening}
                </span>
                <p className="text-[11px] text-rose-700">बोलिए, आपकी आवाज़ रिकॉर्ड हो रही है। पूरा होने पर तुरंत &apos;सलाह देखें&apos; दबाएं</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => stopListeningAndSearch()}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>सलाह देखें</span>
              </button>
              <button
                onClick={cancelListening}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center space-x-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 shadow-sm animate-pulse">
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs sm:text-sm font-bold">⚡ Groq Whisper आवाज़ को पहचान रहा है...</span>
          </div>
        )}

        {/* Input area */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder={isListening ? "आपकी आवाज़ सुनी जा रही है, बोलिए..." : t.askPlaceholder}
            className={`w-full pl-4 pr-32 py-3.5 sm:py-4 rounded-xl border-2 text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
              isListening
                ? "border-rose-500 bg-rose-50/40 shadow-inner font-semibold text-rose-950"
                : "border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
            }`}
          />

          <div className="absolute right-2 flex items-center space-x-1.5">
            {/* Mic button (Voice-to-Text) */}
            <button
              type="button"
              onClick={toggleMic}
              title={t.voiceSearch}
              className={`p-2.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                isListening
                  ? "bg-rose-600 text-white animate-bounce shadow-md"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-emerald-700" />
              )}
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={loading || !query.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Question Chips (Multilingual) */}
        <div className="flex flex-wrap gap-2 pt-1">
          {t.quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(chip.query);
                latestQueryRef.current = chip.query;
                handleAsk(chip.query);
              }}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-4 p-5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-center space-x-3 text-emerald-800">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-sm">{t.thinking}</span>
          </div>
        )}

        {/* Answer section */}
        {response && !loading && (
          <div className="mt-4 p-6 bg-gradient-to-br from-amber-50/60 to-emerald-50/60 rounded-xl border border-amber-200/80 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2 text-emerald-900 font-bold mb-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <span className="text-base sm:text-lg">{t.advisorSuggestion}</span>
                </div>
                {response.provider && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ⚡ {response.provider}
                  </span>
                )}
              </div>
              <button
                onClick={handleSpeakAudio}
                className="text-xs flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-semibold bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isSpeaking ? t.stopAudioBtn : t.speakAudioBtn}</span>
              </button>
            </div>

            {/* 3-Way Market Recommendation Banner (ONLY if user asked a selling decision question) */}
            {response.recommendation && (
              <div
                className={`my-3 p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  response.recommendation.action === "SELL NOW"
                    ? "bg-rose-50 border-rose-300 text-rose-950"
                    : response.recommendation.action === "WAIT"
                    ? "bg-sky-50 border-sky-300 text-sky-950"
                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl shrink-0">
                    {response.recommendation.action === "SELL NOW"
                      ? "🚨"
                      : response.recommendation.action === "WAIT"
                      ? "⏳"
                      : "🚚"}
                  </span>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                      <span>{response.recommendation.action_hi}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-white ${
                          response.recommendation.action === "SELL NOW"
                            ? "bg-rose-600"
                            : response.recommendation.action === "WAIT"
                            ? "bg-sky-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        {response.recommendation.action}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {response.recommendation.action === "SELL ELSEWHERE"
                        ? `${response.recommendation.best_market} में ₹${response.recommendation.price_diff?.toLocaleString("en-IN")}/Qtl अधिक भाव मिल रहा है`
                        : response.recommendation.action === "SELL NOW"
                        ? "खराब मौसम या मूल्य चरम के कारण तुरंत बिक्री की सलाह"
                        : "सुरक्षित मौसम, आगे बेहतर दाम मिलने की संभावना"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-800 leading-relaxed text-sm sm:text-base whitespace-pre-line mt-1">
              {response.answer}
            </p>

            {/* Related topics */}
            {response.related_topics && response.related_topics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-emerald-900">{t.relatedTopics}</span>
                {response.related_topics.map((topic, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      setQuery(topic);
                      latestQueryRef.current = topic;
                      handleAsk(topic);
                    }}
                    className="text-xs bg-white text-emerald-700 hover:text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md cursor-pointer hover:bg-emerald-50 font-medium"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
