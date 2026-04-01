from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


# ─── Request schemas ──────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None

    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        return v[:72]


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        return v[:72]


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

    @field_validator('new_password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        return v[:72]


# ─── Response schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ForgotPasswordResponse(BaseModel):
    """
    Returns the reset token directly (no email configured yet).
    The frontend shows the reset link to the user on-screen.
    """
    message: str
    reset_token: str
    reset_url: str
    expires_in_minutes: int = 60
