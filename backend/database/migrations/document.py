import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from backend.database.db import Base
import uuid

class Document(Base):
    __tablename__ = "documents"
    uuid = Column(
        String, 
        primary_key=True, 
        unique=True, 
        index=True, 
        default=lambda: str(uuid.uuid4())
    )  
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  
    file_extension = Column(String, nullable=False) 
    mime_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) 
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    vector_db_type = Column(String, nullable=True, default="pinecone")
    namespace = Column(String, nullable=True)  # Renamed from pinecone_namespace to be generic
    processing_status = Column(String, default="pending")  
    error_message = Column(Text, nullable=True)