import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str, html: bool = True):
        """Send email via SMTP"""
        
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print("⚠️ Email not configured, skipping email send")
            print(f"Would send to {to_email}: {subject}")
            print(f"Body: {body}")
            return
        
        message = MIMEMultipart("alternative")
        message["From"] = settings.SMTP_FROM
        message["To"] = to_email
        message["Subject"] = subject
        
        if html:
            message.attach(MIMEText(body, "html"))
        else:
            message.attach(MIMEText(body, "plain"))
        
        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
            )
            print(f"✅ Email sent to {to_email}")
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            raise
    
    @staticmethod
    async def send_otp_email(to_email: str, otp: str, purpose: str = "login"):
        """Send OTP code via email"""
        
        subject = "Your Verification Code"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .otp-box {{ background: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }}
                .otp-code {{ font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Verification Code</h2>
                <p>Your verification code for {purpose} is:</p>
                <div class="otp-box">
                    <div class="otp-code">{otp}</div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© 2024 SEO-GEO Optimizer. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailService.send_email(to_email, subject, body, html=True)
    
    @staticmethod
    async def send_welcome_email(to_email: str, name: str):
        """Send welcome email to new user"""
        
        subject = "Welcome to SEO-GEO Optimizer!"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome, {name}!</h2>
                <p>Thank you for joining SEO-GEO Optimizer.</p>
                <p>You can now start creating amazing SEO and GEO optimized content!</p>
                <a href="{settings.FRONTEND_URL}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Get Started</a>
            </div>
        </body>
        </html>
        """
        
        await EmailService.send_email(to_email, subject, body, html=True)