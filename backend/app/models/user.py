from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)

    # OAuth (future use)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)

    # Account status — no email verification required, verified on signup
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)

    # Password reset
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OTPCode(Base):
    """Kept for potential future 2FA use."""
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    code = Column(String(6), nullable=False)
    purpose = Column(String(50), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
