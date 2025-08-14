from typing import List
from langchain_huggingface import HuggingFaceEmbeddings
from backend.utils.config import config
from backend.utils.validators import TextValidators

class EmbeddingService:
    def __init__(self, model_name: str = None):
        self.model_name = model_name or config.embedding_model()
        self.embeddings = HuggingFaceEmbeddings(model_name=self.model_name)
    
    def embed_query(self, text: str) -> List[float]:
        text = TextValidators.ensure_text_or_raise(text, "Text cannot be empty")
        
        embedding = self.embeddings.embed_query(text)
        
        if len(embedding) == 0:
            raise ValueError("Generated embedding has 0 dimensions")
        return embedding
