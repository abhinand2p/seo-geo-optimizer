from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict
from app.models.user import User, OTPCode
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_verification_token,
    generate_otp
)
from app.services.email_service import EmailService
import secrets

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email.lower()).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create_user(
        self,
        email: str,
        password: Optional[str] = None,
        full_name: Optional[str] = None,
        oauth_provider: Optional[str] = None,
        oauth_id: Optional[str] = None
    ) -> User:
        """Create new user"""
        
        # Check if user already exists
        existing_user = self.get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=get_password_hash(password) if password else None,  # Truncation happens in get_password_hash
            oauth_provider=oauth_provider,
            oauth_id=oauth_id,
            is_verified=True if oauth_provider else False,
            verification_token=generate_verification_token() if not oauth_provider else None
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_user_by_email(email)
        
        if not user:
            return None
        
        if not user.hashed_password:
            # This is an OAuth user
            return None
        
        # Truncation happens in verify_password
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    async def create_otp(self, user_id: int, purpose: str = "login") -> str:
        """Create OTP code for user"""
        
        # Invalidate old unused OTPs for this user and purpose
        self.db.query(OTPCode).filter(
            OTPCode.user_id == user_id,
            OTPCode.purpose == purpose,
            OTPCode.is_used == False
        ).update({"is_used": True})
        
        # Generate new OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        otp = OTPCode(
            user_id=user_id,
            code=otp_code,
            purpose=purpose,
            expires_at=expires_at
        )
        
        self.db.add(otp)
        self.db.commit()
        
        return otp_code
    
    def verify_otp(self, user_id: int, code: str, purpose: str = "login") -> bool:
        """Verify OTP code"""
        
        otp = self.db.query(OTPCode).filter(
            OTPCode.user_id == user_id,
            OTPCode.code == code,
            OTPCode.purpose == purpose,
            OTPCode.is_used == False,
            OTPCode.expires_at > datetime.utcnow()
        ).first()
        
        if not otp:
            return False
        
        # Mark as used
        otp.is_used = True
        self.db.commit()
        
        return True
    
    def enable_2fa(self, user_id: int) -> bool:
        """Enable 2FA for user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_2fa_enabled = True
        user.otp_secret = secrets.token_hex(16)
        self.db.commit()
        
        return True
    
    def disable_2fa(self, user_id: int) -> bool:
        """Disable 2FA for user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_2fa_enabled = False
        user.otp_secret = None
        self.db.commit()
        
        return True
    
    def create_access_token_for_user(self, user: User) -> str:
        """Create JWT access token for user"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.full_name
        }
        return create_access_token(token_data)
    
    def verify_user_email(self, token: str) -> bool:
        """Verify user email with verification token"""
        user = self.db.query(User).filter(
            User.verification_token == token,
            User.is_verified == False
        ).first()
        
        if not user:
            return False
        
        user.is_verified = True
        user.verification_token = None
        self.db.commit()
        
        return True
    
    def get_or_create_oauth_user(
        self,
        email: str,
        oauth_provider: str,
        oauth_id: str,
        full_name: Optional[str] = None
    ) -> User:
        """Get or create user from OAuth"""
        
        # Try to find existing user by OAuth ID
        user = self.db.query(User).filter(
            User.oauth_provider == oauth_provider,
            User.oauth_id == oauth_id
        ).first()
        
        if user:
            return user
        
        # Try to find existing user by email
        user = self.get_user_by_email(email)
        
        if user:
            # Link OAuth to existing account
            user.oauth_provider = oauth_provider
            user.oauth_id = oauth_id
            user.is_verified = True
            self.db.commit()
            return user
        
        # Create new user
        return self.create_user(
            email=email,
            full_name=full_name,
            oauth_provider=oauth_provider,
            oauth_id=oauth_id
        )