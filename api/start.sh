#!/bin/sh
# Script de démarrage pour Railway
# Railway définit PORT comme variable d'environnement

PORT="${PORT:-8000}"
echo "Starting uvicorn on port $PORT"
exec uvicorn core.main:app --host 0.0.0.0 --port "$PORT"
