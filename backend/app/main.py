from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import keywords, content, auth  # Add auth import
from app.core.database import init_db

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered SEO & GEO Optimization System"
)

# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    settings.FRONTEND_URL,  # Add production frontend URL
]

# Add any Vercel preview deployments
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Database initialized")

# Include routers
app.include_router(keywords.router, prefix="/api/keywords", tags=["Keywords"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])  # Add this

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}!",
        "version": settings.VERSION,
        "status": "🚀 Running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api"}