from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

class DocumentUploadRequest(BaseModel):
    vector_db: Optional[Literal["pinecone", "milvus"]] = "pinecone"
    
    class Config:
        json_schema_extra = {
            "example": {
                "vector_db": "pinecone"
            }
        }

class DocumentUploadResponse(BaseModel):
    uuid: str
    filename: str
    file_type: str
    file_extension: str
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: Optional[datetime] = None
    vector_db_type: Optional[str] = None
    namespace: Optional[str] = None
    processing_status: str = "pending"
    error_message: Optional[str] = None

    class Config:
        from_attributes = True