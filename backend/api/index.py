import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' package is always resolvable
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Expose app for ASGI runners (Vercel, Uvicorn, etc.)
__all__ = ["app"]
