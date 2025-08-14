import os
from typing import Optional, Union
from dotenv import load_dotenv

class ConfigManager:

    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            load_dotenv()
            self._initialized = True
    
    def database_url(self) -> Optional[str]:
        return os.getenv("DATABASE_URL")

    def gemini_api_key(self) -> Optional[str]:
        return os.getenv("GEMINI_API_KEY")

    def embedding_model(self) -> str:
        return os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

    def vector_db_type(self) -> str:
        return os.getenv("VECTOR_DB_TYPE", "pinecone").lower()

    def pinecone_api_key(self) -> Optional[str]:
        return os.getenv("PINECONE_API_KEY")

    def pinecone_index(self) -> str:
        return os.getenv("PINECONE_INDEX", "rag-index")
    
    def milvus_uri(self) -> str:
        return os.getenv("MILVUS_URI", "http://localhost:19530")
    
    def milvus_token(self) -> Optional[str]:
        return os.getenv("MILVUS_TOKEN")
    
    def milvus_collection_name(self) -> str:
        return os.getenv("MILVUS_COLLECTION_NAME", "rag_collection")
    
    def chunk_size(self) -> int:
        return int(os.getenv("CHUNK_SIZE", "1000"))
    
    def chunk_overlap(self) -> int:
        return int(os.getenv("CHUNK_OVERLAP", "200"))
    
    def youtube_api_key(self) -> Optional[str]:
        return os.getenv("YOUTUBE_API_KEY")
    
    def get(self, key: str, default: Union[str, int, None] = None) -> Union[str, int, None]:
        value = os.getenv(key, default)
        
        if isinstance(default, int) and value is not None:
            try:
                return int(value)
            except ValueError:
                return default
        
        return value

config = ConfigManager()
