from typing import List, Optional, Any, Dict
from langchain_core.documents import Document as LangChainDocument

class ValidationUtils:

    def validate_documents_not_empty(documents: List[LangChainDocument]) -> bool:
        return bool(documents)
    
    def validate_text_not_empty(text: str) -> bool:
        return bool(text and text.strip())
    
    def validate_video_id(video_id: str) -> bool:
        return bool(video_id and video_id.strip())
    
    def validate_api_key(api_key: Optional[str]) -> bool:
        return bool(api_key and api_key.strip())
    
    def validate_search_kwargs(search_kwargs: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if search_kwargs is None:
            return {"k": 5}
        return search_kwargs

    def validate_context_and_question(context: str, question: str) -> tuple[bool, str]:
        if not ValidationUtils.validate_text_not_empty(context):
            return False, "No context provided to answer the question."
        
        if not ValidationUtils.validate_text_not_empty(question):
            return False, "No question provided."
        
        return True, ""

class DocumentValidators:

    def ensure_documents_or_empty_list(documents: List[LangChainDocument]) -> List[LangChainDocument]:
        if not ValidationUtils.validate_documents_not_empty(documents):
            return []
        return documents

    def ensure_documents_or_raise(documents: List[LangChainDocument], error_message: str = "No documents provided") -> List[LangChainDocument]:
        if not ValidationUtils.validate_documents_not_empty(documents):
            raise ValueError(error_message)
        return documents

class TextValidators:    
    def ensure_text_or_empty_string(text: str) -> str:
        if not ValidationUtils.validate_text_not_empty(text):
            return ""
        return text.strip()
    
    def ensure_text_or_raise(text: str, error_message: str = "Text cannot be empty") -> str:
        if not ValidationUtils.validate_text_not_empty(text):
            raise ValueError(error_message)
        return text.strip()

class APIValidators:
    def ensure_api_key_or_error_dict(api_key: Optional[str], service_name: str = "API") -> Optional[Dict[str, str]]:
        if not ValidationUtils.validate_api_key(api_key):
            return {"error": f"{service_name} key not configured"}
        return None
    
    def ensure_video_id_or_error_dict(video_id: str) -> Optional[Dict[str, str]]:
        if not ValidationUtils.validate_video_id(video_id):
            return {"error": "Invalid YouTube URL"}
        return None