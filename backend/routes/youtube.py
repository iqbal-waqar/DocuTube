from fastapi import APIRouter, Depends
from backend.utils.db_helper import get_db
from backend.interactors.youtube import summarize_youtube_interactor
from backend.schemas.youtube import YouTubeLinkRequest, YouTubeSummaryResponse

router = APIRouter()

@router.post("/summarize", response_model=YouTubeSummaryResponse)
def summarize_youtube(youtube_link: YouTubeLinkRequest, db=Depends(get_db)):
    return summarize_youtube_interactor(db, str(youtube_link.url))
