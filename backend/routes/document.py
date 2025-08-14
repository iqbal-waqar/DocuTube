from fastapi import APIRouter, UploadFile, Depends, Form
from backend.utils.db_helper import get_db
from backend.interactors.document import upload_document_interactor
from backend.schemas.document import DocumentUploadResponse
from backend.services.vectordb import VectorDBService
from typing import Optional

router = APIRouter()

@router.get("/vector-databases")
def get_supported_vector_databases():
    return {
        "supported_databases": VectorDBService.get_supported_databases(),
        "default": "pinecone"
    }

@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile, 
    vector_db: Optional[str] = Form("pinecone"),
    db=Depends(get_db)
):
    return upload_document_interactor(db, file, vector_db)
