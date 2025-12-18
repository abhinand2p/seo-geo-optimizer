from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

# Request schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)  # Remove max_length
    full_name: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        """Truncate password to 72 characters for bcrypt"""
        if len(v) > 72:
            return v[:72]
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        """Truncate password to 72 characters for bcrypt"""
        if len(v) > 72:
            return v[:72]
        return v

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)

class ResendOTP(BaseModel):
    email: EmailStr

# Response schemas
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_2fa_enabled: bool
    is_verified: bool
    oauth_provider: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    requires_2fa: bool = False
    user: Optional[UserResponse] = None

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class OTPResponse(BaseModel):
    message: str
    email: str
    expires_in_minutes: int = 10