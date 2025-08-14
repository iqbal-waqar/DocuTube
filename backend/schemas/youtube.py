from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List

class YouTubeLinkRequest(BaseModel):
    url: HttpUrl

class YouTubeSummaryResponse(BaseModel):
    uuid: str
    url: str
    video_id: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    channel_id: Optional[str] = None
    description: Optional[str] = None
    published_at: Optional[str] = None
    duration: Optional[int] = 0
    view_count: Optional[int] = 0
    like_count: Optional[int] = 0
    comment_count: Optional[int] = 0
    tags: Optional[List[str]] = []
    category_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    summary: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
