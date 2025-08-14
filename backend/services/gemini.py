from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from backend.utils.config import config

class GeminiLLMService:
    def __init__(self, model: str = "gemini-1.5-flash", temperature: float = 0.3):
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            google_api_key=config.gemini_api_key(),
            convert_system_message_to_human=True
        )
        self.output_parser = StrOutputParser()
    
    def generate_response(self, prompt: ChatPromptTemplate, **kwargs) -> str:
        try:
            chain = prompt | self.llm | self.output_parser
            response = chain.invoke(kwargs)
            return response.strip()
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
