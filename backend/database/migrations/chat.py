import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from backend.database.db import Base
import uuid

class ChatHistory(Base):
    __tablename__ = "chat_history"
    uuid = Column(
        String, 
        primary_key=True, 
        index=True, 
        default=lambda: str(uuid.uuid4())
    )
    document_uuid = Column(
        String, 
        ForeignKey("documents.uuid"), 
        nullable=False
    )  
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
