#!/bin/bash
# Kishaan Salah - Full Stack Launcher

echo "=========================================="
echo "🌱 Starting Kishaan Salah (किसान सलाह) 🌱"
echo "=========================================="

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Start FastAPI Backend
echo "Starting FastAPI Backend on http://localhost:8000 ..."
cd "$DIR/backend"
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start Next.js Frontend
echo "Starting Next.js Frontend on http://localhost:3000 ..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "=========================================="
echo "🚀 Kishaan Salah is running!"
echo "👉 Frontend: http://localhost:3000"
echo "👉 Backend API & Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop both servers."
echo "=========================================="

trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM EXIT
wait
