from typing import List, Optional
from langchain_core.documents import Document as LangChainDocument
from langchain_milvus import Milvus
from backend.services.embeddings import EmbeddingService
from backend.utils.config import config
from backend.utils.validators import DocumentValidators, ValidationUtils

class MilvusService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.initialize_vectorstore()
    
    def initialize_vectorstore(self):
        milvus_uri = config.milvus_uri()
        milvus_token = config.milvus_token()
        milvus_collection_name = config.milvus_collection_name()
        
        try:
            connection_args = {
                "uri": milvus_uri,
            }
            
            if milvus_token and "localhost" not in milvus_uri:
                connection_args["token"] = milvus_token
            
            self.vectorstore = Milvus(
                embedding_function=self.embedding_service.embeddings,
                collection_name=milvus_collection_name,
                connection_args=connection_args,
                auto_id=True,
            )
        except Exception as e:
            if "localhost" in milvus_uri:
                raise RuntimeError(
                    f"Failed to connect to local Milvus at {milvus_uri}. "
                    f"Make sure Milvus is running locally or update MILVUS_URI to your Zilliz Cloud endpoint. "
                    f"Error: {e}"
                ) from e
            else:
                raise RuntimeError(
                    f"Failed to connect to Milvus/Zilliz Cloud at {milvus_uri}. "
                    f"Please check your MILVUS_URI and MILVUS_TOKEN configuration. "
                    f"Error: {e}"
                ) from e
    
    def store_documents(self, documents: List[LangChainDocument], namespace: str = None) -> List[str]:
        documents = DocumentValidators.ensure_documents_or_empty_list(documents)
        if not documents:
            return []
        
        try:
            if namespace:
                for doc in documents:
                    doc.metadata["namespace"] = namespace
            
            document_ids = self.vectorstore.add_documents(documents=documents)
            return document_ids
            
        except Exception as e:
            raise RuntimeError(f"Failed to store documents in Milvus: {e}") from e
    
    def get_namespace_stats(self, namespace: str = None) -> Optional[dict]:
        try:
            collection_stats = self.vectorstore.col.describe()
            return {
                "vector_count": collection_stats.get("num_entities", 0)
            }
        except Exception as e:
            raise RuntimeError(f"Failed to get namespace stats: {e}") from e
    
    def as_retriever(self, namespace: str = None, search_kwargs: dict = None):
        search_kwargs = ValidationUtils.validate_search_kwargs(search_kwargs)
        
        if namespace:
            search_kwargs["expr"] = f'namespace == "{namespace}"'
        
        return self.vectorstore.as_retriever(search_kwargs=search_kwargs)