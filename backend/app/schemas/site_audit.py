from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional, Dict

class LeadInfo(BaseModel):
    name: str
    role: str
    email: EmailStr

class SiteAuditRequest(BaseModel):
    url: HttpUrl
    depth: int = 5  # Max pages to crawl
    include_screenshot: bool = True
    # Lead capture fields
    user_name: str
    user_role: str
    user_email: EmailStr

class IssueItem(BaseModel):
    severity: str  # "critical", "warning", "info"
    category: str  # "seo", "design", "content"
    title: str
    description: str

class SuggestionItem(BaseModel):
    priority: str  # "high", "medium", "low"
    title: str
    description: str
    impact: str  # Expected improvement

class PageAnalysis(BaseModel):
    url: str
    title: Optional[str] = None
    status_code: int
    load_time_ms: float

class SiteAuditResponse(BaseModel):
    success: bool
    domain: str
    pages_analyzed: int

    # Overall scores
    overall_score: int  # 0-100
    seo_score: int
    design_score: int
    content_score: int

    # Issues found
    total_issues: int
    critical_issues: int
    warnings: int
    issues: List[IssueItem]

    # Detailed analysis
    seo_analysis: Dict
    design_analysis: Dict
    content_analysis: Dict

    # AI suggestions
    suggestions: List[SuggestionItem]

    # Screenshot
    screenshot_url: Optional[str] = None

    # Pages analyzed
    pages: List[PageAnalysis]

    # API integrations
    lighthouse_score: Optional[Dict] = None
    pagespeed_score: Optional[Dict] = None

    # Timestamps
    analyzed_at: str
    analysis_duration_seconds: float
