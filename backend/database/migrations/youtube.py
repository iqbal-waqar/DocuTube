import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, JSON
from backend.database.db import Base
import uuid

class YouTubeSummary(Base):
    __tablename__ = "youtube_summaries"
    uuid = Column(
        String, 
        primary_key=True, 
        index=True, 
        default=lambda: str(uuid.uuid4())
    )
    url = Column(String, nullable=False)
    video_id = Column(String, nullable=True) 
    title = Column(String, nullable=True)
    author = Column(String, nullable=True)
    channel_id = Column(String, nullable=True)  
    description = Column(Text, nullable=True)  
    published_at = Column(String, nullable=True)  
    duration = Column(Integer, nullable=True) 
    view_count = Column(Integer, nullable=True) 
    like_count = Column(Integer, nullable=True) 
    comment_count = Column(Integer, nullable=True)  
    tags = Column(JSON, nullable=True)  
    category_id = Column(String, nullable=True)  
    thumbnail_url = Column(String, nullable=True)  
    summary = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
