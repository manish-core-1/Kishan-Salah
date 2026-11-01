from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from typing import Optional
import base64
from app.models.schemas import (
    AdvisorRequest,
    AdvisorResponse,
    MarketRecommendationRequest,
    MarketRecommendationResponse,
    VoiceToTextResponse,
    VoiceToTextBase64Request
)
from app.services.ai_service import (
    get_ai_explanation,
    calculate_market_recommendation,
    transcribe_audio_with_groq
)

router = APIRouter(prefix="/api/advisor", tags=["Kisan AI Advisor"])

@router.post("/query", response_model=AdvisorResponse)
def get_farmer_advice(payload: AdvisorRequest):
    """
    Kisan AI Advisor Endpoint:
    - Primary: Groq API
    - Fallback: OpenRouter API
    - Final Fallback: Rule-based Decision Engine
    - 3-Hour Cache on Prompt Hash
    """
    result = get_ai_explanation(
        query=payload.query,
        language=payload.language,
        location=payload.location
    )
    return AdvisorResponse(**result)

@router.post("/market-recommendation", response_model=MarketRecommendationResponse)
def get_post_market_recommendation(payload: MarketRecommendationRequest):
    """
    3-Way Market Sell Recommendation Engine (POST):
    1. SELL NOW (अभी फसल बेचें) - Jab wait karna risky ho (weather risk/storage ya price peak par ho).
    2. WAIT (कुछ दिन रुकें) - Jab price trend aur clear dry weather wait karne ko support karein.
    3. SELL ELSEWHERE (दूसरी मंडी में बेचें) - Jab kisi doosri mandi mein significantly better price mil raha ho.
    AI farmer ko simple Hindi mein samjhayega ki application ne ye recommendation kyun di hai.
    """
    res = calculate_market_recommendation(
        commodity=payload.commodity,
        location=payload.location,
        state=payload.state,
        district=payload.district,
        language=payload.language
    )
    return MarketRecommendationResponse(**res)

@router.get("/market-recommendation", response_model=MarketRecommendationResponse)
def get_market_recommendation_by_query(
    commodity: str = Query("Potato", description="Commodity name (e.g. 'Potato', 'Mustard', 'Wheat')"),
    location: Optional[str] = Query(None, description="Farmer's location or district"),
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    language: str = Query("hi", description="Language code (hi, en, pa, mr)")
):
    """
    3-Way Market Sell Recommendation Engine (GET):
    Quick one-click access for Mandi dashboard widgets.
    """
    res = calculate_market_recommendation(
        commodity=commodity,
        location=location,
        state=state,
        district=district,
        language=language
    )
    return MarketRecommendationResponse(**res)

@router.post("/voice-to-text", response_model=VoiceToTextResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("hi")
):
    """
    Voice-to-Text (Speech Recognition) Endpoint:
    Accepts farmer's audio (WebM, WAV, OGG, MP3) and transcribes using Groq Whisper.
    Supports Hindi (hi), Punjabi (pa), Marathi (mr), English (en).
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received")
    
    result = transcribe_audio_with_groq(
        audio_bytes=audio_bytes,
        filename=file.filename or "audio.webm",
        language=language
    )
    return VoiceToTextResponse(**result)

@router.post("/voice-to-text-base64", response_model=VoiceToTextResponse)
def speech_to_text_base64(payload: VoiceToTextBase64Request):
    """
    Base64 Voice-to-Text Endpoint:
    Accepts JSON payload with base64 encoded audio string.
    """
    try:
        raw_b64 = payload.audio_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        audio_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 audio data: {str(e)}")

    result = transcribe_audio_with_groq(
        audio_bytes=audio_bytes,
        filename=payload.filename or "audio.webm",
        language=payload.language or "hi"
    )
    return VoiceToTextResponse(**result)
