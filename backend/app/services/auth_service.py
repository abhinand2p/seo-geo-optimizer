from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.models.user import User
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_verification_token,
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # ── Lookups ────────────────────────────────────────────────────────────────

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    # ── Register ───────────────────────────────────────────────────────────────

    def create_user(
        self,
        email: str,
        password: str,
        full_name: Optional[str] = None,
    ) -> User:
        if self.get_user_by_email(email):
            raise ValueError("An account with this email already exists.")

        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=get_password_hash(password),
            is_verified=True,   # No email verification required
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    # ── Login ──────────────────────────────────────────────────────────────────

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_access_token_for_user(self, user: User) -> str:
        return create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "name": user.full_name,
        })

    # ── Forgot / Reset password ────────────────────────────────────────────────

    def create_reset_token(self, email: str) -> Optional[str]:
        """
        Generate a 1-hour password-reset token and persist it on the user row.
        Returns the token string, or None if the email isn't registered.
        """
        user = self.get_user_by_email(email)
        if not user:
            return None

        token = generate_verification_token()          # urlsafe 32-byte hex
        user.reset_token = token
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
        self.db.commit()
        return token

    def reset_password(self, token: str, new_password: str) -> bool:
        """
        Validate the reset token, update the password, and invalidate the token.
        Returns True on success, False if token is invalid or expired.
        """
        user = self.db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expires_at > datetime.utcnow(),
        ).first()

        if not user:
            return False

        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires_at = None
        self.db.commit()
        return True
