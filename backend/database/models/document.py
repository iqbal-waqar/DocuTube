import uuid
from sqlalchemy.orm import Session
from backend.database.migrations.document import Document

class DocumentModel:
    def __init__(self, db: Session):
        self.db = db

    def create_document_record(self, filename: str, file_type: str, file_extension: str, 
                             mime_type: str, file_size: int, namespace: str, vector_db_type: str = "pinecone") -> Document:
        doc_record = Document(
            uuid=str(uuid.uuid4()),
            filename=filename,
            file_type=file_type,
            file_extension=file_extension,
            mime_type=mime_type,
            file_size=file_size,
            vector_db_type=vector_db_type,
            namespace=namespace,
            processing_status="processing"
        )
        
        self.db.add(doc_record)
        self.db.commit()
        self.db.refresh(doc_record)
        return doc_record

    def mark_processing_completed(self, doc_record: Document) -> None:
        doc_record.processing_status = "completed"
        self.db.commit()

    def mark_processing_failed(self, doc_record: Document, error_message: str) -> None:
        doc_record.processing_status = "failed"
        doc_record.error_message = error_message
        self.db.commit()