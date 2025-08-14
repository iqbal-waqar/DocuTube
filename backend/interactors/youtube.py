from sqlalchemy.orm import Session
from backend.database.models.youtube import YouTubeModel
from backend.database.migrations.youtube import YouTubeSummary
from backend.services.youtube import YouTubeService
from backend.services.llm import GeminiService
from backend.services.exceptions import AppExceptions

class YouTubeInteractor:
    def __init__(self, db: Session):
        self.db = db
        self.youtube_model = YouTubeModel(db)
        self.youtube_service = YouTubeService()
        self.gemini = GeminiService()
    
    def summarize_youtube_video(self, url: str) -> YouTubeSummary:
        try:
            content = self.youtube_service.get_video_content(url)
            if "error" in content:
                error_msg = content['error']
                if "Invalid YouTube URL" in error_msg:
                    AppExceptions.raise_invalid_youtube_url()
                else:
                    AppExceptions.raise_youtube_processing_error(error_msg)
            
            summary = self.gemini.summarize_youtube_video(content)
            
            video_info = content["info"]
            return self.youtube_model.save_youtube_summary(
                url=url,
                video_id=video_info.get("id"),
                title=video_info.get("title"),
                author=video_info.get("author"),
                channel_id=video_info.get("channel_id"),
                description=video_info.get("description"),
                published_at=video_info.get("published_at"),
                duration=video_info.get("duration"),
                view_count=video_info.get("view_count"),
                like_count=video_info.get("like_count"),
                comment_count=video_info.get("comment_count"),
                tags=video_info.get("tags"),
                category_id=video_info.get("category_id"),
                thumbnail_url=video_info.get("thumbnail_url"),
                summary=summary
            )
            
        except Exception as e:
            AppExceptions.raise_youtube_summarization_error(str(e))

def summarize_youtube_interactor(db, url):
    interactor = YouTubeInteractor(db)
    return interactor.summarize_youtube_video(url)
