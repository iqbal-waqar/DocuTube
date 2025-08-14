from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatResponse(BaseModel):
    chat_uuid: str  
    document_uuid: str 
    question: str
    answer: str
    timestamp: datetime
    document_info: dict 

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is this document about?"
            }
        }
