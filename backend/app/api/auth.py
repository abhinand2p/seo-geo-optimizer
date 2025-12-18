from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    VerifyOTP,
    ResendOTP,
    Token,
    UserResponse,
    MessageResponse,
    OTPResponse
)
from app.core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

# Dependency to get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(int(user_id))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)

# ===== ENDPOINTS =====

@router.post("/register", response_model=MessageResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user"""
    print("="*50)
    print("🟢 REGISTER ENDPOINT HIT")
    print(f"Email: {user_data.email}")
    print(f"Password length: {len(user_data.password)}")
    print("="*50)
    
    try:
        auth_service = AuthService(db)
        print("✅ Auth service created")
        
        user = auth_service.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        print(f"✅ User created with ID: {user.id}")
        
        otp_code = await auth_service.create_otp(user.id, purpose="verification")
        print(f"✅ OTP generated: {otp_code}")
        
        await EmailService.send_otp_email(user.email, otp_code, purpose="email verification")
        print("✅ Email service called")
        
        return MessageResponse(
            message="Registration successful! Please check your email for verification code.",
            success=True
        )
    
    except Exception as e:
        print(f"❌❌❌ ERROR: {type(e).__name__}")
        print(f"❌❌❌ Message: {str(e)}")
        import traceback
        print("❌❌❌ Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    - If 2FA enabled: Returns requires_2fa=true, user must verify OTP
    - If 2FA disabled: Returns access token immediately
    """
    auth_service = AuthService(db)
    
    # Authenticate user
    user = auth_service.authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_verified:
        # Resend verification OTP
        otp_code = await auth_service.create_otp(user.id, purpose="verification")
        await EmailService.send_otp_email(user.email, otp_code, purpose="email verification")
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. We've sent a new verification code to your email."
        )
    
    # Check if 2FA is enabled
    if user.is_2fa_enabled:
        # Generate and send OTP
        otp_code = await auth_service.create_otp(user.id, purpose="login")
        await EmailService.send_otp_email(user.email, otp_code, purpose="login")
        
        return Token(
            access_token="",
            requires_2fa=True
        )
    
    # Generate access token
    access_token = auth_service.create_access_token_for_user(user)
    user_response = UserResponse.from_orm(user)
    
    return Token(
        access_token=access_token,
        requires_2fa=False,
        user=user_response
    )

@router.post("/verify-otp", response_model=Token)
async def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):
    """
    Verify OTP code
    
    - For 2FA login
    - For email verification
    - Returns access token on success
    """
    auth_service = AuthService(db)
    
    user = auth_service.get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Try login OTP first
    if auth_service.verify_otp(user.id, data.otp, purpose="login"):
        access_token = auth_service.create_access_token_for_user(user)
        user_response = UserResponse.from_orm(user)
        
        return Token(
            access_token=access_token,
            user=user_response
        )
    
    # Try verification OTP
    if auth_service.verify_otp(user.id, data.otp, purpose="verification"):
        # Mark user as verified
        user.is_verified = True
        db.commit()
        
        # Send welcome email
        await EmailService.send_welcome_email(user.email, user.full_name or "there")
        
        access_token = auth_service.create_access_token_for_user(user)
        user_response = UserResponse.from_orm(user)
        
        return Token(
            access_token=access_token,
            user=user_response
        )
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired OTP code"
    )

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(data: ResendOTP, db: Session = Depends(get_db)):
    """
    Resend OTP code to user's email
    """
    auth_service = AuthService(db)
    
    user = auth_service.get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Determine purpose
    purpose = "verification" if not user.is_verified else "login"
    
    # Generate and send OTP
    otp_code = await auth_service.create_otp(user.id, purpose=purpose)
    await EmailService.send_otp_email(user.email, otp_code, purpose=purpose)
    
    return OTPResponse(
        message="OTP code sent to your email",
        email=user.email
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return current_user

@router.post("/enable-2fa", response_model=MessageResponse)
async def enable_2fa(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enable 2FA for current user
    """
    auth_service = AuthService(db)
    success = auth_service.enable_2fa(current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to enable 2FA")
    
    return MessageResponse(message="2FA enabled successfully")

@router.post("/disable-2fa", response_model=MessageResponse)
async def disable_2fa(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable 2FA for current user
    """
    auth_service = AuthService(db)
    success = auth_service.disable_2fa(current_user.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to disable 2FA")
    
    return MessageResponse(message="2FA disabled successfully")

@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout (client should clear token)
    """
    return MessageResponse(message="Logged out successfully")