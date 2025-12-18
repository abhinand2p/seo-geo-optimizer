from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.content_service import ContentService

router = APIRouter()
content_service = ContentService()

class ContentRequest(BaseModel):
    topic: str
    keywords: List[str]
    tone: str = "neutral"
    optimization_type: str = "seo"
    content_type: str = "paragraph"
    word_count: int = 150

class ContentResponse(BaseModel):
    success: bool
    content: str
    content_type: str
    tone: str
    word_count: int
    optimization_type: str
    seo_score: Optional[int] = None
    citeability_score: Optional[int] = None
    primary_keyword: str
    keywords_used: Optional[dict] = None
    geo_optimized: Optional[bool] = None

class ContentAnalysisRequest(BaseModel):
    content: str
    target_keywords: Optional[List[str]] = None

class ContentOptimizationRequest(BaseModel):
    content: str
    target_keywords: List[str]
    optimization_type: str = "seo"
    preserve_meaning: bool = True
    tone: str = "neutral"

class AnalysisResponse(BaseModel):
    metrics: dict
    seo_issues: List[dict]
    geo_issues: List[dict]
    keyword_analysis: dict
    readability: dict
    suggestions: List[str]
    seo_score: int
    geo_score: int

class OptimizationResponse(BaseModel):
    success: bool
    original_content: str
    seo_optimized: Optional[str] = None
    geo_optimized: Optional[str] = None
    seo_improvements: Optional[List[str]] = None
    geo_improvements: Optional[List[str]] = None
    seo_score_before: Optional[int] = None
    geo_score_before: Optional[int] = None
    seo_score_after: Optional[int] = None
    geo_score_after: Optional[int] = None
    original_word_count: Optional[int] = None
    optimized_word_count: Optional[int] = None

class QuickOptimizeRequest(BaseModel):
    content: str
    keywords: str

# ===== ENDPOINTS =====

@router.post("/generate", response_model=ContentResponse)
async def generate_content(request: ContentRequest):
    """
    Generate SEO/GEO optimized content with customizable tone
    
    **Tones Available:**
    - neutral: Professional, informative, straightforward
    - poetic: Creative, metaphorical, flowing
    - engaging: Conversational, relatable, captivating
    - attention_grabbing: Bold, impactful, hook-driven
    - professional: Formal, authoritative, business-oriented
    - casual: Friendly, relaxed, approachable
    - inspirational: Motivating, uplifting, aspirational
    - humorous: Witty, light-hearted, entertaining
    - urgent: Time-sensitive, action-driven, compelling
    - empathetic: Compassionate, understanding, supportive
    
    **Content Types:**
    - headline: SEO-optimized headlines (50-60 chars)
    - meta_description: Meta descriptions (150-160 chars)
    - paragraph: Single optimized paragraph
    - full_article: Complete article with structure
    - definition: GEO-optimized definition
    - explanation: Comprehensive explanation
    - comparison: Comparative analysis
    - guide: Comprehensive guide
    """
    try:
        if request.optimization_type == "seo":
            result = await content_service.generate_seo_content(
                topic=request.topic,
                keywords=request.keywords,
                tone=request.tone,
                content_type=request.content_type,
                word_count=request.word_count
            )
        elif request.optimization_type == "geo":
            result = await content_service.generate_geo_content(
                topic=request.topic,
                keywords=request.keywords,
                tone=request.tone,
                content_type=request.content_type,
                word_count=request.word_count
            )
        else:  # both
            # Generate SEO version first
            seo_result = await content_service.generate_seo_content(
                topic=request.topic,
                keywords=request.keywords,
                tone=request.tone,
                content_type=request.content_type,
                word_count=request.word_count
            )
            
            # Generate GEO version
            geo_result = await content_service.generate_geo_content(
                topic=request.topic,
                keywords=request.keywords,
                tone=request.tone,
                content_type=request.content_type,
                word_count=request.word_count
            )
            
            # Return combined with both scores
            result = seo_result
            result["citeability_score"] = geo_result.get("citeability_score", 0)
            result["content"] = f"**SEO Version:**\n\n{seo_result['content']}\n\n---\n\n**GEO Version:**\n\n{geo_result['content']}"
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Content generation failed"))
        
        return ContentResponse(
            success=result["success"],
            content=result["content"],
            content_type=result["content_type"],
            tone=result["tone"],
            word_count=result["word_count"],
            optimization_type=request.optimization_type,
            seo_score=result.get("seo_score"),
            citeability_score=result.get("citeability_score"),
            primary_keyword=result["primary_keyword"],
            keywords_used=result.get("keywords_used"),
            geo_optimized=result.get("geo_optimized", False)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/tones")
async def get_available_tones():
    """Get list of available content tones with descriptions"""
    return {
        "tones": [
            {"value": "neutral", "label": "Neutral", "description": "Professional, informative, and straightforward"},
            {"value": "poetic", "label": "Poetic", "description": "Creative, metaphorical, and flowing with literary elegance"},
            {"value": "engaging", "label": "Engaging", "description": "Conversational, relatable, and captivating"},
            {"value": "attention_grabbing", "label": "Attention Grabbing", "description": "Bold, impactful, and hook-driven"},
            {"value": "professional", "label": "Professional", "description": "Formal, authoritative, and business-oriented"},
            {"value": "casual", "label": "Casual", "description": "Friendly, relaxed, and approachable"},
            {"value": "inspirational", "label": "Inspirational", "description": "Motivating, uplifting, and aspirational"},
            {"value": "humorous", "label": "Humorous", "description": "Witty, light-hearted, and entertaining"},
            {"value": "urgent", "label": "Urgent", "description": "Time-sensitive, action-driven, and compelling"},
            {"value": "empathetic", "label": "Empathetic", "description": "Compassionate, understanding, and supportive"}
        ]
    }

@router.get("/content-types")
async def get_content_types():
    """Get list of available content types"""
    return {
        "seo_types": [
            {"value": "headline", "label": "Headline", "description": "SEO-optimized headlines (50-60 chars)"},
            {"value": "meta_description", "label": "Meta Description", "description": "Meta descriptions (150-160 chars)"},
            {"value": "paragraph", "label": "Paragraph", "description": "Single optimized paragraph"},
            {"value": "full_article", "label": "Full Article", "description": "Complete article with structure"}
        ],
        "geo_types": [
            {"value": "definition", "label": "Definition", "description": "Authoritative, cite-worthy definition"},
            {"value": "explanation", "label": "Explanation", "description": "Comprehensive explanation"},
            {"value": "comparison", "label": "Comparison", "description": "Comparative analysis"},
            {"value": "guide", "label": "Guide", "description": "Comprehensive reference guide"}
        ]
    }

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_content(request: ContentAnalysisRequest):
    """
    Analyze content for SEO and GEO optimization opportunities
    
    Returns detailed metrics, issues, and suggestions for improvement.
    """
    try:
        analysis = await content_service.analyze_content(
            content=request.content,
            target_keywords=request.target_keywords
        )
        
        return AnalysisResponse(**analysis)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/optimize", response_model=OptimizationResponse)
async def optimize_content(request: ContentOptimizationRequest):
    """
    Optimize existing content for SEO/GEO
    
    Takes user's rough content and transforms it into optimized versions:
    - SEO: Google-optimized with keyword focus
    - GEO: AI-citation worthy with authoritative structure
    - Both: Get both versions for comparison
    
    **preserve_meaning**: 
    - true: Keep original message intact (conservative optimization)
    - false: Allow significant rewriting for maximum optimization
    """
    try:
        result = await content_service.optimize_content(
            original_content=request.content,
            target_keywords=request.target_keywords,
            optimization_type=request.optimization_type,
            preserve_meaning=request.preserve_meaning,
            tone=request.tone
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Optimization failed"))
        
        # Build response based on optimization type
        if request.optimization_type == "both":
            return OptimizationResponse(
                success=True,
                original_content=request.content,
                seo_optimized=result["seo_optimized"],
                geo_optimized=result["geo_optimized"],
                seo_improvements=result["seo_improvements"],
                geo_improvements=result["geo_improvements"],
                seo_score_before=result["seo_score_before"],
                geo_score_before=result["geo_score_before"],
                seo_score_after=result["seo_score_after"],
                geo_score_after=result["geo_score_after"]
            )
        elif request.optimization_type == "seo":
            return OptimizationResponse(
                success=True,
                original_content=request.content,
                seo_optimized=result["optimized_content"],
                seo_improvements=result["improvements"],
                seo_score_before=result["score_before"],
                seo_score_after=result["score_after"],
                original_word_count=result["original_word_count"],
                optimized_word_count=result["optimized_word_count"]
            )
        else:  # geo
            return OptimizationResponse(
                success=True,
                original_content=request.content,
                geo_optimized=result["optimized_content"],
                geo_improvements=result["improvements"],
                geo_score_before=result["score_before"],
                geo_score_after=result["score_after"],
                original_word_count=result["original_word_count"],
                optimized_word_count=result["optimized_word_count"]
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

@router.post("/quick-optimize")
async def quick_optimize(request: QuickOptimizeRequest):
    """
    Quick optimization endpoint - simpler input format
    
    Just paste your content and keywords (comma-separated) and get optimized version.
    """
    try:
        keyword_list = [k.strip() for k in request.keywords.split(',') if k.strip()]
        
        result = await content_service.optimize_content(
            original_content=request.content,
            target_keywords=keyword_list,
            optimization_type="seo",
            preserve_meaning=True,
            tone="neutral"
        )
        
        return {
            "success": True,
            "original": request.content,
            "optimized": result["optimized_content"],
            "improvements": result["improvements"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))