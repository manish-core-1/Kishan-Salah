from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MandiRecord(BaseModel):
    id: str
    state: str
    district: str
    market: str
    commodity: str
    commodity_hi: Optional[str] = ""
    variety: Optional[str] = ""
    grade: Optional[str] = ""
    arrival_date: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str = "₹/Quintal"
    price_change: Optional[float] = 0.0
    trend: Optional[str] = "stable"

class SchemeRecord(BaseModel):
    id: str
    name: Dict[str, str]
    category: str
    summary: Dict[str, str]
    benefits: Dict[str, List[str]]
    eligibility: Dict[str, List[str]]
    documents: Dict[str, List[str]]
    official_portal: str
    helpline: str
    badge: Optional[str] = None

class WeatherDay(BaseModel):
    date: str
    iso_date: Optional[str] = ""
    day: str
    temp_max: float
    temp_min: float
    condition: str
    condition_hi: str
    rain_probability: int
    precipitation_sum: Optional[float] = 0.0
    humidity: Optional[int] = 50
    wind_speed: float
    icon: str

class WeatherResponse(BaseModel):
    location: str
    district: Optional[str] = None
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_temp: float
    feels_like: float
    condition: str
    condition_hi: str
    humidity: int
    wind_speed: float
    rain_prob: int
    precipitation_sum: Optional[float] = 0.0
    source: str = "Open-Meteo API"
    fetched_at: Optional[str] = None
    cached: Optional[bool] = False
    advisory: Dict[str, List[str]]
    forecast: List[WeatherDay]

class AdvisorRequest(BaseModel):
    query: str
    language: str = "hi"
    location: Optional[str] = None

class MarketRecommendationRequest(BaseModel):
    commodity: str
    state: Optional[str] = None
    district: Optional[str] = None
    location: Optional[str] = None
    language: str = "hi"

class MarketRecommendationResponse(BaseModel):
    action: str  # "SELL NOW" | "WAIT" | "SELL ELSEWHERE"
    action_hi: str  # "अभी बेचें (SELL NOW)" | "कुछ दिन रुकें (WAIT)" | "दूसरी मंडी में बेचें (SELL ELSEWHERE)"
    commodity: str
    commodity_hi: str
    local_market: Optional[str] = None
    local_price: Optional[float] = None
    best_market: Optional[str] = None
    best_price: Optional[float] = None
    price_diff: Optional[float] = 0.0
    weather_risk: bool = False
    reasons: List[str]
    explanation: str
    speech_text: Optional[str] = None
    provider: Optional[str] = None
    cached: Optional[bool] = False

class VoiceToTextResponse(BaseModel):
    transcript: str
    language: str
    provider: str

class VoiceToTextBase64Request(BaseModel):
    audio_base64: str
    language: Optional[str] = "hi"
    filename: Optional[str] = "audio.webm"

class AdvisorResponse(BaseModel):
    answer: str
    speech_text: str
    language: str
    related_topics: List[str]
    suggested_actions: List[str]
    verdict: Optional[str] = None
    provider: Optional[str] = None
    cached: Optional[bool] = False
    recommendation: Optional[MarketRecommendationResponse] = None
