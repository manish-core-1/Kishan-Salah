// Web Speech API interfaces
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

export class VoiceAssistant {
  private static isSpeaking: boolean = false;

  private static getSynth(): SpeechSynthesis | null {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return window.speechSynthesis;
    }
    return null;
  }

  static speak(text: string, lang: string = "hi", onEnd?: () => void) {
    const synth = this.getSynth();
    if (!synth) return;

    // Cancel any previous speech
    synth.cancel();

    // Clean text: strip markdown bold, bullet stars, hashtags, URLs, and backticks
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/`+/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect if text contains Devanagari characters (Hindi/Marathi)
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const hasGurmukhi = /[\u0A00-\u0A7F]/.test(cleanText);

    let langCode = "hi-IN";
    if (hasGurmukhi || lang === "pa") {
      langCode = "pa-IN";
    } else if (lang === "mr" && hasDevanagari) {
      langCode = "mr-IN";
    } else if (hasDevanagari) {
      langCode = "hi-IN";
    } else {
      // Roman/English text -> use Indian English so English letters are pronounced clearly
      langCode = "en-IN";
    }

    utterance.lang = langCode;
    utterance.rate = 0.95; // Steady, natural pace for Indian farmers
    utterance.pitch = 1.0;

    // Try to find the best available voice in browser for this language
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Priority 1: Exact langCode match
        let bestVoice = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
        // Priority 2: Prefix match (e.g. 'hi')
        if (!bestVoice) {
          bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0, 2)));
        }
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.isSpeaking = true;
    synth.speak(utterance);
  }

  static stop() {
    const synth = this.getSynth();
    if (synth) {
      synth.cancel();
      this.isSpeaking = false;
    }
  }

  static isBrowserSupported(): boolean {
    if (typeof window === "undefined") return false;
    const windowObj = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition);
  }

  static startSpeechRecognition(
    lang: string = "hi",
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: unknown) => void,
    onEnd?: () => void
  ): SpeechRecognitionInstance | null {
    if (typeof window === "undefined") return null;

    const windowObj = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRecognition =
      windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError(new Error("Browser speech recognition not available"));
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Stay active to show live transcription
      recognition.interimResults = true; // Stream words LIVE into text box as user speaks!

      let langCode = "hi-IN";
      if (lang === "en") langCode = "en-IN";
      else if (lang === "mr") langCode = "mr-IN";
      else if (lang === "pa") langCode = "pa-IN";

      recognition.lang = langCode;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        const currentText = (finalText.trim() || interimText.trim());
        if (currentText) {
          onResult(currentText, Boolean(finalText.trim()));
        }
      };

      recognition.onerror = (event: unknown) => {
        if (onError) onError(event);
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      recognition.start();
      return recognition;
    } catch (e) {
      if (onError) onError(e);
      return null;
    }
  }
}

export class AudioVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.audioChunks = [];

      let mimeType = "";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn("Microphone access failed:", err);
      return false;
    }
  }

  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
        resolve(audioBlob);
      };

      if (this.mediaRecorder.state !== "inactive") {
        try {
          this.mediaRecorder.requestData();
        } catch {}
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}
