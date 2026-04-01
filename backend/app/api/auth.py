from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
)
from app.core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()


# ─── Auth dependency ──────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UserResponse:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token payload")

    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(int(user_id))

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found or deactivated")

    return UserResponse.model_validate(user)


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    auth_service = AuthService(db)

    try:
        user = auth_service.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    access_token = auth_service.create_access_token_for_user(user)
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    access_token = auth_service.create_access_token_for_user(user)
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


# ─── Me ───────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


# ─── Logout ───────────────────────────────────────────────────────────────────

@router.post("/logout", response_model=MessageResponse)
async def logout():
    # JWT is stateless — client must delete the token
    return MessageResponse(message="Logged out successfully")


# ─── Forgot password ──────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    token = auth_service.create_reset_token(data.email)

    # Always return 200 so we don't leak whether the email exists,
    # but include the token only when the email was found.
    if not token:
        # Generic message — doesn't reveal if email exists
        return ForgotPasswordResponse(
            message="If that email is registered you'll see a reset link below.",
            reset_token="",
            reset_url="",
            expires_in_minutes=60,
        )

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    return ForgotPasswordResponse(
        message="Password reset link generated. Copy the link below to reset your password.",
        reset_token=token,
        reset_url=reset_url,
        expires_in_minutes=60,
    )


# ─── Reset password ───────────────────────────────────────────────────────────

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    success = auth_service.reset_password(data.token, data.new_password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired. Please request a new one.",
        )

    return MessageResponse(message="Password updated successfully. You can now log in.")
