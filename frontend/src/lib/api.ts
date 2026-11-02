const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Ensure no trailing slash so path concatenation never forms invalid '//api'
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export interface MandiItem {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  commodity_hi?: string;
  variety: string;
  grade?: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  price_change?: number;
  trend?: "up" | "down" | "stable";
}

export interface SchemeItem {
  id: string;
  badge?: string;
  category: string;
  name: Record<string, string>;
  summary: Record<string, string>;
  benefits: Record<string, string[]>;
  eligibility: Record<string, string[]>;
  documents: Record<string, string[]>;
  official_portal: string;
  helpline: string;
}

export interface WeatherDay {
  date: string;
  iso_date?: string;
  day: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  condition_hi: string;
  rain_probability: number;
  precipitation_sum?: number;
  humidity?: number;
  wind_speed: number;
  icon: string;
}

export interface WeatherData {
  location: string;
  district?: string;
  state: string;
  latitude?: number;
  longitude?: number;
  current_temp: number;
  feels_like: number;
  condition: string;
  condition_hi: string;
  humidity: number;
  wind_speed: number;
  rain_prob: number;
  precipitation_sum?: number;
  source?: string;
  fetched_at?: string;
  cached?: boolean;
  advisory: Record<string, string[]>;
  forecast: WeatherDay[];
}

export interface MarketRecommendation {
  action: "SELL NOW" | "WAIT" | "SELL ELSEWHERE";
  action_hi: string;
  commodity: string;
  commodity_hi: string;
  local_market?: string;
  local_price?: number;
  best_market?: string;
  best_price?: number;
  price_diff?: number;
  weather_risk?: boolean;
  reasons: string[];
  explanation: string;
  speech_text?: string;
  provider?: string;
  cached?: boolean;
}

export interface AdvisorResponse {
  answer: string;
  speech_text: string;
  language: string;
  related_topics: string[];
  suggested_actions: string[];
  verdict?: string;
  provider?: string;
  cached?: boolean;
  recommendation?: MarketRecommendation;
}

export async function fetchMandiPrices(params?: {
  state?: string;
  commodity?: string;
  search?: string;
  limit?: number;
}): Promise<MandiItem[]> {
  const url = new URL(`${API_BASE_URL}/api/mandi`);
  if (params?.state && params.state !== "All") url.searchParams.append("state", params.state);
  if (params?.commodity && params.commodity !== "All") url.searchParams.append("commodity", params.commodity);
  if (params?.search) url.searchParams.append("search", params.search);
  if (params?.limit) url.searchParams.append("limit", params.limit.toString());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Server returned HTTP ${res.status}`;
    throw new Error(message);
  }
  return await res.json();
}

export async function fetchWeather(location: string = "Prayagraj", state?: string): Promise<WeatherData> {
  const url = new URL(`${API_BASE_URL}/api/weather`);
  url.searchParams.append("location", location);
  if (state && state !== "All") url.searchParams.append("state", state);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Weather server returned HTTP ${res.status}`;
    throw new Error(message);
  }
  return await res.json();
}

export async function fetchSchemes(category?: string, search?: string): Promise<SchemeItem[]> {
  const url = new URL(`${API_BASE_URL}/api/schemes`);
  if (category && category !== "All") url.searchParams.append("category", category);
  if (search) url.searchParams.append("search", search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch schemes");
  return await res.json();
}

export async function queryAdvisor(queryText: string, language: string = "hi", location?: string): Promise<AdvisorResponse> {
  const res = await fetch(`${API_BASE_URL}/api/advisor/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText, language, location })
  });
  if (!res.ok) throw new Error("Advisor API failed");
  return await res.json();
}

export async function fetchMarketRecommendation(params: {
  commodity: string;
  location?: string;
  state?: string;
  district?: string;
  language?: string;
}): Promise<MarketRecommendation> {
  const url = new URL(`${API_BASE_URL}/api/advisor/market-recommendation`);
  if (params.commodity) url.searchParams.append("commodity", params.commodity);
  if (params.location) url.searchParams.append("location", params.location);
  if (params.state && params.state !== "All") url.searchParams.append("state", params.state);
  if (params.district) url.searchParams.append("district", params.district);
  if (params.language) url.searchParams.append("language", params.language);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch market recommendation");
  return await res.json();
}

export async function transcribeAudio(
  audioBlob: Blob,
  language: string = "hi"
): Promise<{ transcript: string; language: string; provider: string }> {
  const formData = new FormData();
  const ext = audioBlob.type.includes("mp4")
    ? "mp4"
    : audioBlob.type.includes("wav")
    ? "wav"
    : audioBlob.type.includes("ogg")
    ? "ogg"
    : "webm";
  formData.append("file", audioBlob, `farmer_audio.${ext}`);
  formData.append("language", language);

  const res = await fetch(`${API_BASE_URL}/api/advisor/voice-to-text`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Voice-to-Text conversion failed");
  }

  return await res.json();
}
