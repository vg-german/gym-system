import os
from supabase import create_client, Client
from pydantic_settings import BaseSettings
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


class Settings(BaseSettings):
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")


settings = Settings()

if not settings.supabase_url or not settings.supabase_key:
    raise ValueError(
        "ERROR: SUPABASE_URL or SUPABASE_KEY are not configured in the .env file")

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

security = HTTPBearer()


def verify_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Validates if the JWT token corresponds to an active admin session in Supabase Auth.
    """
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token or expired session. Access denied to Administrator."
        )
