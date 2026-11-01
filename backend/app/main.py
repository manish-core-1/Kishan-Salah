from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mandi, weather, schemes, advisory

app = FastAPI(
    title="Kishaan Salah API (किसान सलाह)",
    description="Full Stack Agro-Advisory API: Live Mandi Bhav, Govt Schemes, Weather Forecast, and Multilingual AI Kisan Advisor",
    version="1.0.0"
)

# Enable CORS for frontend Next.js application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(mandi.router)
app.include_router(weather.router)
app.include_router(schemes.router)
app.include_router(advisory.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Kishaan Salah Backend API",
        "version": "1.0.0",
        "endpoints": {
            "mandi": "/api/mandi",
            "mandi_summary": "/api/mandi/summary",
            "weather": "/api/weather?location=Meerut",
            "schemes": "/api/schemes",
            "advisor": "/api/advisor/query (POST)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
