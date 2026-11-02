const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
// Strip trailing slashes
let cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
// If the user configured NEXT_PUBLIC_API_URL with a trailing '/api', strip it
// so concatenating '/api/...' does not produce duplicate '/api/api/...'
if (cleanBaseUrl.endsWith("/api")) {
  cleanBaseUrl = cleanBaseUrl.slice(0, -4).replace(/\/+$/, "");
}
export const API_BASE_URL = cleanBaseUrl;

async function parseErrorResponse(res: Response, endpoint: string): Promise<Error> {
  let detail = "";
  try {
    const errorData = await res.json();
    if (typeof errorData === "string") {
      detail = errorData;
    } else if (errorData && typeof errorData.detail === "string") {
      detail = errorData.detail;
    } else if (errorData && typeof errorData.message === "string") {
      detail = errorData.message;
    }
  } catch {
    try {
      const text = await res.text();
      if (text && text.length < 150) {
        detail = text.trim();
      }
    } catch {
      // ignore
    }
  }

  const detailText = detail ? ` - ${detail}` : "";
  return new Error(`[HTTP ${res.status}] Endpoint ${endpoint} failed${detailText}`);
}

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
    throw await parseErrorResponse(res, "/api/mandi");
  }
  return await res.json();
}

export async function fetchWeather(location: string = "Prayagraj", state?: string): Promise<WeatherData> {
  const url = new URL(`${API_BASE_URL}/api/weather`);
  url.searchParams.append("location", location);
  if (state && state !== "All") url.searchParams.append("state", state);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw await parseErrorResponse(res, "/api/weather");
  }
  return await res.json();
}

export async function fetchSchemes(category?: string, search?: string): Promise<SchemeItem[]> {
  const url = new URL(`${API_BASE_URL}/api/schemes`);
  if (category && category !== "All") url.searchParams.append("category", category);
  if (search) url.searchParams.append("search", search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw await parseErrorResponse(res, "/api/schemes");
  }
  return await res.json();
}

export async function queryAdvisor(queryText: string, language: string = "hi", location?: string): Promise<AdvisorResponse> {
  const res = await fetch(`${API_BASE_URL}/api/advisor/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText, language, location })
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, "/api/advisor/query");
  }
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
  if (!res.ok) {
    throw await parseErrorResponse(res, "/api/advisor/market-recommendation");
  }
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
    throw await parseErrorResponse(res, "/api/advisor/voice-to-text");
  }

  return await res.json();
}
