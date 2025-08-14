from langchain_core.documents import Document as LangChainDocument
from typing import List
from backend.services.gemini import GeminiLLMService
from backend.services.prompts import PromptService
from backend.utils.validators import ValidationUtils, TextValidators


class GeminiService:
    def __init__(self, model: str = "gemini-1.5-flash", temperature: float = 0.3):
        self.gemini_llm = GeminiLLMService(model=model, temperature=temperature)
        self.prompt_service = PromptService()

    def generate_answer(self, context: str, question: str, prompt_type: str = "document_qa") -> str:
        context = context.strip()
        question = question.strip()

        is_valid, error_message = ValidationUtils.validate_context_and_question(context, question)
        if not is_valid:
            return error_message

        prompt = self.prompt_service.get_prompt_template(prompt_type)
        return self.gemini_llm.generate_response(prompt, context=context, question=question)

    def documents_to_context(self, documents: List[LangChainDocument]) -> str:
        if not ValidationUtils.validate_documents_not_empty(documents):
            return ""
        return "\n\n".join([doc.page_content for doc in documents])

    def answer_with_retriever(self, question: str, retriever) -> str:
        try:
            docs = retriever.get_relevant_documents(question)
            
            if not ValidationUtils.validate_documents_not_empty(docs):
                return "No relevant information found in the document to answer your question."
            
            context = self.documents_to_context(docs)
            return self.generate_answer(context, question, "document_qa")
            
        except Exception as e:
            return f"Error retrieving documents: {str(e)}"
    
    def summarize_youtube_video(self, content: dict) -> str:
        formatted_context = self.prompt_service.format_youtube_summary_context(content)
        has_transcript = content.get("transcript") != "Transcript unavailable."
        
        if not has_transcript:
            prompt = self.prompt_service.get_youtube_no_transcript_prompt()
            video_id = content.get("info", {}).get("id", "unknown")
            return self.gemini_llm.generate_response(prompt, video_id=video_id)
        else:
            prompt = self.prompt_service.get_youtube_summary_prompt()
            return self.gemini_llm.generate_response(prompt, context=formatted_context)
