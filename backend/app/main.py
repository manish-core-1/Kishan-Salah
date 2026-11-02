import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mandi, weather, schemes, advisory

app = FastAPI(
    title="Kisan Salah API (किसान सलाह)",
    description="Full Stack Agro-Advisory API: Live Mandi Bhav, Govt Schemes, Weather Forecast, and Multilingual AI Kisan Advisor",
    version="1.0.0"
)

# Configure CORS for Vercel, localhost, and custom frontend domains
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,  # Stateless REST API; setting to False ensures compatibility with wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def normalize_api_path(request, call_next):
    # Normalize duplicate /api prefixes, e.g. /api/api/mandi -> /api/mandi
    path = request.scope.get("path", "")
    while path.startswith("/api/api/"):
        path = path[4:]
        request.scope["path"] = path
    return await call_next(request)

# Register routers under both /api/... and direct /... prefixes
# This guarantees 100% compatibility regardless of whether Vercel or frontend prefixes with /api
app.include_router(mandi.router, prefix="/api/mandi", tags=["Mandi Bhav"])
app.include_router(mandi.router, prefix="/mandi", tags=["Mandi Bhav (Vercel Direct)"], include_in_schema=False)

app.include_router(weather.router, prefix="/api/weather", tags=["Weather Advisory"])
app.include_router(weather.router, prefix="/weather", tags=["Weather Advisory (Vercel Direct)"], include_in_schema=False)

app.include_router(schemes.router, prefix="/api/schemes", tags=["Govt Schemes"])
app.include_router(schemes.router, prefix="/schemes", tags=["Govt Schemes (Vercel Direct)"], include_in_schema=False)

app.include_router(advisory.router, prefix="/api/advisor", tags=["Kisan AI Advisor"])
app.include_router(advisory.router, prefix="/advisor", tags=["Kisan AI Advisor (Vercel Direct)"], include_in_schema=False)

@app.get("/")
@app.get("/api")
@app.get("/health")
@app.get("/api/health")
def root():
    return {
        "status": "online",
        "app": "Kisan Salah Backend API",
        "version": "1.0.0",
        "endpoints": {
            "mandi": "/api/mandi",
            "mandi_summary": "/api/mandi/summary",
            "weather": "/api/weather?location=Meerut",
            "schemes": "/api/schemes",
            "advisor": "/api/advisor/query (POST)",
            "voice_to_text": "/api/advisor/voice-to-text (POST)",
            "market_recommendation": "/api/advisor/market-recommendation (GET/POST)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
