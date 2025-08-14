from typing import List, Optional
from langchain_core.documents import Document as LangChainDocument
from langchain_pinecone import PineconeVectorStore
from backend.services.embeddings import EmbeddingService
from backend.utils.config import config
from backend.utils.validators import DocumentValidators, ValidationUtils

class PineconeService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.initialize_vectorstore()
    
    def initialize_vectorstore(self):
        try:
            self.vectorstore = PineconeVectorStore(
                index_name=config.pinecone_index(),
                embedding=self.embedding_service.embeddings,
                pinecone_api_key=config.pinecone_api_key()
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Pinecone VectorStore: {e}") from e
    
    def store_documents(self, documents: List[LangChainDocument], namespace: str = None) -> List[str]:
        documents = DocumentValidators.ensure_documents_or_empty_list(documents)
        if not documents:
            return []
        
        try:
            document_ids = self.vectorstore.add_documents(
                documents=documents,
                namespace=namespace
            )
            return document_ids
            
        except Exception as e:
            raise RuntimeError(f"Failed to store documents in Pinecone: {e}") from e
    
    def get_namespace_stats(self, namespace: str = None) -> Optional[dict]:
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=config.pinecone_api_key())
            index = pc.Index(config.pinecone_index())
            
            stats = index.describe_index_stats()
            
            if namespace and 'namespaces' in stats:
                return stats['namespaces'].get(namespace)
            
            return stats
            
        except Exception as e:
            raise RuntimeError(f"Failed to get namespace stats: {e}") from e
    
    def as_retriever(self, namespace: str = None, search_kwargs: dict = None):
        search_kwargs = ValidationUtils.validate_search_kwargs(search_kwargs)
  
        if namespace:
            search_kwargs["namespace"] = namespace  
        return self.vectorstore.as_retriever(search_kwargs=search_kwargs)
