"""
Sécurité API - Protection des endpoints admin
"""
import os
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

# Header pour l'API key
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_api_key():
    """Récupère l'API key depuis les variables d'environnement"""
    return os.getenv("ADMIN_API_KEY", "")


async def verify_admin_api_key(api_key: str = Security(API_KEY_HEADER)):
    """
    Vérifie que la requête contient une API key admin valide.
    
    Usage:
        @router.get("/admin-endpoint")
        async def admin_endpoint(api_key: str = Depends(verify_admin_api_key)):
            ...
    """
    expected_key = get_api_key()
    
    if not expected_key:
        # Si pas d'API key configurée, on refuse l'accès en production
        if os.getenv("DEBUG", "false").lower() != "true":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admin API key not configured"
            )
        # En mode debug, on autorise sans key
        return "debug-mode"
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
            headers={"WWW-Authenticate": "API-Key"}
        )
    
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return api_key
