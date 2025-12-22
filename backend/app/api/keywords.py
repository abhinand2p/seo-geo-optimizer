from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.keyword_service import KeywordService

router = APIRouter()
keyword_service = KeywordService()

class KeywordRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200, description="Main topic or niche")
    industry: str = Field(..., min_length=2, max_length=100, description="Industry or category")
    optimization_type: str = Field(default="both", pattern="^(seo|geo|both)$")
    keyword_count: int = Field(default=30, ge=5, le=100)

class KeywordAnalysis(BaseModel):
    keyword: str
    word_count: int
    intent: str
    difficulty: str
    character_length: int

class KeywordResponse(BaseModel):
    success: bool
    topic: str
    industry: str
    seed_keywords: List[str]
    geo_keywords: Optional[List[str]] = None
    analysis: List[KeywordAnalysis]
    total_keywords: int

@router.post("/generate", response_model=KeywordResponse)
async def generate_keywords(request: KeywordRequest):
    """
    Generate comprehensive keyword list for SEO and/or GEO optimization
    """
    try:
        # Generate SEO keywords
        seed_keywords = await keyword_service.generate_seed_keywords(
            topic=request.topic,
            industry=request.industry,
            count=request.keyword_count
        )
        
        if not seed_keywords:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate keywords. Check your OpenAI API key."
            )
        
        # Analyze keywords
        analysis = [
            keyword_service.analyze_keyword(kw) 
            for kw in seed_keywords[:15]  # Analyze top 15
        ]
        
        # Generate GEO keywords if requested
        geo_keywords = None
        if request.optimization_type in ["geo", "both"]:
            geo_keywords = await keyword_service.generate_geo_keywords(
                topic=request.topic,
                count=20
            )
        
        total_count = len(seed_keywords) + (len(geo_keywords) if geo_keywords else 0)
        
        return KeywordResponse(
            success=True,
            topic=request.topic,
            industry=request.industry,
            seed_keywords=seed_keywords,
            geo_keywords=geo_keywords,
            analysis=analysis,
            total_keywords=total_count
        )

    except Exception as e:
        import traceback
        error_detail = str(e) or "Unknown error"
        print(f"❌ Error in generate_keywords: {error_detail}")
        print(f"Error type: {type(e).__name__}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {error_detail}")

@router.post("/expand/{keyword}")
async def expand_keyword(keyword: str, variations: int = 5):
    """
    Expand a single keyword with variations
    """
    try:
        expanded = await keyword_service.expand_keyword(keyword, variations)
        
        return {
            "success": True,
            "original_keyword": keyword,
            "variations": expanded,
            "count": len(expanded)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")