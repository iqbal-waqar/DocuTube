import os
import uuid
import shutil
import tempfile
from pathlib import Path
from sqlalchemy.orm import Session
from backend.database.models.document import DocumentModel
from backend.database.migrations.document import Document
from backend.services.document import DocumentService
from backend.services.vectordb import VectorDBService
from backend.services.exceptions import AppExceptions

class DocumentInteractor:

    def __init__(self, db: Session):
        self.db = db
        self.document_model = DocumentModel(db)
        self.document_service = DocumentService()

    def upload_and_process_document(self, file, vector_db_type: str = "pinecone") -> dict:
        # Validate vector database type
        if vector_db_type not in VectorDBService.get_supported_databases():
            AppExceptions.raise_invalid_vector_db_type(
                vector_db_type, 
                VectorDBService.get_supported_databases()
            )
        
        file_path = None
        try:
            file_extension = Path(file.filename).suffix
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
            try:
                shutil.copyfileobj(file.file, temp_file)
                temp_file.flush()
                file_path = temp_file.name
            finally:
                temp_file.close()
            
            extension, mime_type = self.document_service.get_file_type(file_path)
            if not self.document_service.is_supported_file(file_path):
                os.remove(file_path)
                AppExceptions.raise_unsupported_file_type(extension)
            
            # Initialize vector database service with selected type
            vector_service = VectorDBService(db_type=vector_db_type)
            
            namespace = f"doc_{uuid.uuid4().hex}"
            file_type = self.document_service.get_supported_formats().get(extension, 'Unknown')
            doc_record = self.document_model.create_document_record(
                filename=file.filename,
                file_type=file_type,
                file_extension=extension,
                mime_type=mime_type,
                file_size=Path(file_path).stat().st_size,
                namespace=namespace,
                vector_db_type=vector_db_type
            )
            
            try:
                document_chunks = self.document_service.load_and_split_documents(file_path)
                
                if not document_chunks:
                    self.document_model.mark_processing_failed(doc_record, "No content extracted from document")
                else:
                    vector_service.store_documents(document_chunks, namespace=doc_record.namespace)
                    self.document_model.mark_processing_completed(doc_record)
                    
            except Exception as e:
                self.document_model.mark_processing_failed(doc_record, str(e))
                AppExceptions.raise_document_processing_error(str(e))
            
            return {
                "uuid": doc_record.uuid,
                "filename": doc_record.filename,
                "file_type": doc_record.file_type,
                "file_extension": doc_record.file_extension,
                "mime_type": doc_record.mime_type,
                "file_size": doc_record.file_size,
                "vector_db_type": doc_record.vector_db_type,
                "namespace": doc_record.namespace,
                "processing_status": doc_record.processing_status,
                "uploaded_at": doc_record.uploaded_at.isoformat() if doc_record.uploaded_at else None,
                "error_message": doc_record.error_message,
                "message": f"Document '{doc_record.filename}' uploaded and processed successfully using {vector_db_type}!"
            }
            
        except Exception as e:
            AppExceptions.raise_document_upload_error(str(e))
        finally:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)

def upload_document_interactor(db, file, vector_db_type: str = "pinecone"):
    interactor = DocumentInteractor(db)
    return interactor.upload_and_process_document(file, vector_db_type)