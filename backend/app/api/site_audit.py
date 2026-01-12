from fastapi import APIRouter, HTTPException
from app.schemas.site_audit import SiteAuditRequest, SiteAuditResponse
from app.services.site_audit_service import SiteAuditService
import logging

router = APIRouter()
site_audit_service = SiteAuditService()

@router.post("/analyze", response_model=SiteAuditResponse)
async def analyze_site(request: SiteAuditRequest):
    """
    Analyze a website for SEO, design, and content quality.
    Requires user information (name, role, email) for lead capture.
    Returns comprehensive audit results with scores and suggestions.
    """
    try:
        # Log lead information for tracking
        logging.info(f"🔍 Audit requested by {request.user_name} ({request.user_email}) for {request.url}")

        # TODO: Optionally save lead info to database in future
        # This is where you would store the lead in your database:
        # await site_audit_service.save_lead({
        #     "name": request.user_name,
        #     "role": request.user_role,
        #     "email": request.user_email,
        #     "website": str(request.url)
        # })

        # Run the audit
        result = await site_audit_service.audit_website(
            url=str(request.url),
            depth=request.depth
        )

        logging.info(f"✅ Audit completed for {request.url} - Score: {result['overall_score']}/100")

        return SiteAuditResponse(**result)

    except Exception as e:
        logging.error(f"❌ Audit failed for {request.url}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze website: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for site audit service.
    """
    return {
        "status": "healthy",
        "service": "site-audit",
        "message": "Site Audit API is running"
    }
