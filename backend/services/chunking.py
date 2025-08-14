from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LangChainDocument
from backend.utils.config import config
from backend.utils.validators import DocumentValidators

class ChunkingService:
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or config.chunk_size()
        self.chunk_overlap = chunk_overlap or config.chunk_overlap()
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def chunk_documents(self, documents: List[LangChainDocument]) -> List[LangChainDocument]:
        documents = DocumentValidators.ensure_documents_or_empty_list(documents)
        if not documents:
            return []
        
        try:
            chunked_docs = self.text_splitter.split_documents(documents)
            
            for i, chunk in enumerate(chunked_docs):
                chunk.metadata.update({
                    "chunk_id": i,
                    "chunk_size": len(chunk.page_content),
                    "total_chunks": len(chunked_docs)
                })
            
            return chunked_docs
            
        except Exception as e:
            raise RuntimeError(f"Failed to chunk documents: {e}") from e
    
