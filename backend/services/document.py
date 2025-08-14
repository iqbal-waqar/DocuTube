import magic
from typing import List
from pathlib import Path
from langchain_core.documents import Document as LangChainDocument
from backend.services.loaders import DocumentLoaderService
from backend.services.chunking import ChunkingService
from backend.utils.validators import DocumentValidators

class DocumentService:
    def __init__(self):
        self.loader_service = DocumentLoaderService()
        self.chunking_service = ChunkingService()
    
    def get_file_type(self, file_path: str) -> tuple[str, str]:
        file_path = Path(file_path)
        extension = file_path.suffix.lower()
        
        try:
            mime_type = magic.from_file(str(file_path), mime=True)
        except:
            mime_type = "application/octet-stream"
            
        return extension, mime_type
    
    def load_and_split_documents(self, file_path: str) -> List[LangChainDocument]:
        file_path_obj = Path(file_path)
        extension, mime_type = self.get_file_type(file_path)
        
        if not self.loader_service.is_supported_extension(extension):
            raise ValueError(f"Unsupported file type: {extension}")
        
        try:
            loader = self.loader_service.get_appropriate_loader(file_path, extension)
            documents = loader.load()
            
            documents = DocumentValidators.ensure_documents_or_raise(documents, "No documents loaded from file")

            file_metadata = {
                'filename': file_path_obj.name,
                'file_extension': extension,
                'file_type': self.loader_service.get_file_type_description(extension),
                'mime_type': mime_type,
                'file_size': file_path_obj.stat().st_size,
                'source': str(file_path_obj)
            }

            for doc in documents:
                doc.metadata.update(file_metadata)

            split_documents = self.chunking_service.chunk_documents(documents)

            for i, doc in enumerate(split_documents):
                doc.metadata.update({
                    'chunk_index': i, 
                    'chunk_count': len(split_documents) 
                })
            
            return split_documents
            
        except Exception as e:
            raise Exception(f"Error processing file {file_path}: {str(e)}")
    
    def get_supported_formats(self) -> dict:
        return self.loader_service.get_supported_formats()
    
    def is_supported_file(self, file_path: str) -> bool:
        extension = Path(file_path).suffix.lower()
        return self.loader_service.is_supported_extension(extension)