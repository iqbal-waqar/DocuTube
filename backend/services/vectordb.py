from typing import List, Optional
from langchain_core.documents import Document as LangChainDocument
from backend.services.pinecone import PineconeService
from backend.services.milvus import MilvusService
from backend.utils.config import config

class VectorDBService:
    def __init__(self, db_type: str = None):
        self.db_type = db_type or config.vector_db_type()
        self.vectorstore_service = self._initialize_vectorstore()
    
    def _initialize_vectorstore(self):
        if self.db_type == "pinecone":
            return PineconeService()
        elif self.db_type == "milvus":
            return MilvusService()
        else:
            raise ValueError(f"Unsupported vector database type: {self.db_type}. Supported types: 'pinecone', 'milvus'")
    
    def store_documents(self, documents: List[LangChainDocument], namespace: str = None) -> List[str]:
        return self.vectorstore_service.store_documents(documents, namespace)
    
    def get_namespace_stats(self, namespace: str = None) -> Optional[dict]:
        return self.vectorstore_service.get_namespace_stats(namespace)
    
    def as_retriever(self, namespace: str = None, search_kwargs: dict = None):
        return self.vectorstore_service.as_retriever(namespace, search_kwargs)
    
    def get_db_type(self) -> str:
        return self.db_type
    
    def get_supported_databases() -> List[str]:
        return ["pinecone", "milvus"]