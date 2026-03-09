from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.keyword_service import KeywordService

router = APIRouter()
keyword_service = KeywordService()


# ─── Shared Models ────────────────────────────────────────────────────────────

class KeywordAnalysis(BaseModel):
    keyword: str
    word_count: int
    intent: str
    difficulty: str
    character_length: int
    volume_estimate: str = "1K-10K"
    cpc_estimate: str = "$0.50-$1"
    trend: str = "Stable"
    competition_level: str = "Medium"


# ─── Generate Keywords ────────────────────────────────────────────────────────

class KeywordRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    industry: str = Field(..., min_length=2, max_length=100)
    optimization_type: str = Field(default="both", pattern="^(seo|geo|both)$")
    keyword_count: int = Field(default=30, ge=5, le=100)

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
    try:
        seed_keywords = await keyword_service.generate_seed_keywords(
            topic=request.topic,
            industry=request.industry,
            count=request.keyword_count
        )

        if not seed_keywords:
            raise HTTPException(status_code=500, detail="Failed to generate keywords.")

        # Batch AI analysis for top 15
        analysis_raw = await keyword_service.analyze_keywords_batch(
            keywords=seed_keywords[:15],
            industry=request.industry
        )
        analysis = [KeywordAnalysis(**a) for a in analysis_raw]

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

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ─── Question Keywords ────────────────────────────────────────────────────────

class QuestionsRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200)
    industry: str = Field(..., min_length=2, max_length=100)
    count: int = Field(default=20, ge=5, le=50)

class QuestionsResponse(BaseModel):
    success: bool
    topic: str
    questions: List[str]
    analysis: List[KeywordAnalysis]
    total: int

@router.post("/questions", response_model=QuestionsResponse)
async def generate_questions(request: QuestionsRequest):
    try:
        questions = await keyword_service.generate_question_keywords(
            topic=request.topic,
            industry=request.industry,
            count=request.count
        )

        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate question keywords.")

        analysis_raw = await keyword_service.analyze_keywords_batch(
            keywords=questions[:15],
            industry=request.industry
        )
        analysis = [KeywordAnalysis(**a) for a in analysis_raw]

        return QuestionsResponse(
            success=True,
            topic=request.topic,
            questions=questions,
            analysis=analysis,
            total=len(questions)
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ─── Competitor Keywords ──────────────────────────────────────────────────────

class CompetitorRequest(BaseModel):
    competitor_domain: str = Field(..., description="e.g. competitor.com or https://competitor.com")
    your_topic: str = Field(..., min_length=2, max_length=200)
    industry: str = Field(..., min_length=2, max_length=100)
    count: int = Field(default=25, ge=5, le=50)

class CompetitorResponse(BaseModel):
    success: bool
    competitor_domain: str
    inferred_keywords: List[str]
    analysis: List[KeywordAnalysis]
    content_gaps: List[str]
    total: int
    disclaimer: str

@router.post("/competitor", response_model=CompetitorResponse)
async def competitor_keywords(request: CompetitorRequest):
    try:
        result = await keyword_service.generate_competitor_keywords(
            competitor_domain=request.competitor_domain,
            your_topic=request.your_topic,
            industry=request.industry,
            count=request.count
        )

        inferred = result.get("inferred_keywords", [])
        gaps = result.get("content_gaps", [])

        if not inferred:
            raise HTTPException(status_code=500, detail="Failed to infer competitor keywords.")

        analysis_raw = await keyword_service.analyze_keywords_batch(
            keywords=inferred[:15],
            industry=request.industry
        )
        analysis = [KeywordAnalysis(**a) for a in analysis_raw]

        # Clean domain for display
        domain = request.competitor_domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]

        return CompetitorResponse(
            success=True,
            competitor_domain=domain,
            inferred_keywords=inferred,
            analysis=analysis,
            content_gaps=gaps,
            total=len(inferred),
            disclaimer="These keywords are AI-inferred based on the domain name only. No live crawling or real competitive data is used."
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ─── Keyword Clusters ─────────────────────────────────────────────────────────

class ClusterRequest(BaseModel):
    keywords: List[str] = Field(..., min_length=3)
    topic: str = Field(..., min_length=2, max_length=200)
    max_clusters: int = Field(default=5, ge=2, le=10)

class ClusterItem(BaseModel):
    cluster_name: str
    theme: str
    primary_keyword: str
    intent: str
    keywords: List[str]

class ClustersResponse(BaseModel):
    success: bool
    topic: str
    clusters: List[ClusterItem]
    unclustered: List[str]
    total_clusters: int

@router.post("/clusters", response_model=ClustersResponse)
async def cluster_keywords(request: ClusterRequest):
    try:
        result = await keyword_service.cluster_keywords(
            keywords=request.keywords,
            topic=request.topic,
            max_clusters=request.max_clusters
        )

        clusters = [ClusterItem(**c) for c in result.get("clusters", [])]

        return ClustersResponse(
            success=True,
            topic=request.topic,
            clusters=clusters,
            unclustered=result.get("unclustered", []),
            total_clusters=len(clusters)
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ─── Expand Keyword ───────────────────────────────────────────────────────────

@router.post("/expand/{keyword}")
async def expand_keyword(keyword: str, variations: int = 5):
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
