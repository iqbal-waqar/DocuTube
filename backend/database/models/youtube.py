from sqlalchemy.orm import Session
from backend.database.migrations.youtube import YouTubeSummary
import uuid

class YouTubeModel:
    def __init__(self, db: Session):
        self.db = db
    
    def save_youtube_summary(self, url: str, video_id: str, title: str, author: str,
                           channel_id: str, description: str, published_at: str,
                           duration: int, view_count: int, like_count: int,
                           comment_count: int, tags: str, category_id: str,
                           thumbnail_url: str, summary: str) -> YouTubeSummary:
        youtube_summary = YouTubeSummary(
            uuid=str(uuid.uuid4()),
            url=url,
            video_id=video_id,
            title=title,
            author=author,
            channel_id=channel_id,
            description=description,
            published_at=published_at,
            duration=duration,
            view_count=view_count,
            like_count=like_count,
            comment_count=comment_count,
            tags=tags,
            category_id=category_id,
            thumbnail_url=thumbnail_url,
            summary=summary
        )
        
        self.db.add(youtube_summary)
        self.db.commit()
        self.db.refresh(youtube_summary)
        
        return youtube_summary
