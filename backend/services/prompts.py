from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from typing import Dict, Any

class PromptService:
    def __init__(self):
        self._prompts = self._initialize_prompts()
    
    def _initialize_prompts(self) -> Dict[str, Dict[str, Any]]:
        return {
            "document_qa": {
                "system": (
                    "You are a helpful AI assistant specialized in answering questions based on document content. "
                    "Analyze the provided context carefully and answer the user's question clearly and concisely. "
                    "If the context doesn't contain relevant information to answer the question, "
                    "politely explain that the information is not available in the provided document."
                ),
                "human": "Context: {context}\n\nQuestion: {question}\n\nAnswer:",
                "description": "Template for document-based question answering"
            },
            
            "youtube_summary": {
                "system": (
                    "You are an expert content summarizer specialized in creating comprehensive summaries "
                    "of YouTube videos based on their transcripts and metadata. "
                    "Provide clear, structured summaries that capture the main points and key takeaways."
                ),
                "human": (
                    "Please provide a comprehensive summary of this YouTube video based on the following content:\n\n"
                    "{context}\n\n"
                    "Include the main topics discussed, key points, and important takeaways. "
                    "Structure your summary in a clear and organized manner."
                ),
                "description": "Template for YouTube video summarization"
            },
            
            "youtube_no_transcript": {
                "system": (
                    "You are a helpful assistant that provides informative messages about video processing limitations."
                ),
                "human": (
                    "This is a YouTube video with ID {video_id}. "
                    "The transcript is unavailable for this video. "
                    "Please provide a helpful message explaining that we couldn't retrieve the transcript "
                    "and suggest that the user try a different video or check if the video has captions enabled. "
                    "Be polite and offer alternative suggestions."
                ),
                "description": "Template for handling videos without transcripts"
            },
            
            "general_qa": {
                "system": (
                    "You are a helpful AI assistant. Answer the user's question based on the provided context. "
                    "Be accurate, concise, and helpful in your response."
                ),
                "human": "Context: {context}\n\nQuestion: {question}\n\nAnswer:",
                "description": "General purpose question answering template"
            }
        }
    
    def get_prompt_template(self, prompt_name: str) -> ChatPromptTemplate:
        if prompt_name not in self._prompts:
            raise ValueError(f"Prompt '{prompt_name}' not found. Available prompts: {list(self._prompts.keys())}")
        
        prompt_config = self._prompts[prompt_name]
        
        return ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(prompt_config["system"]),
            HumanMessagePromptTemplate.from_template(prompt_config["human"])
        ])
    
    def get_youtube_summary_prompt(self) -> ChatPromptTemplate:
        return self.get_prompt_template("youtube_summary")
    
    def get_youtube_no_transcript_prompt(self) -> ChatPromptTemplate:
        return self.get_prompt_template("youtube_no_transcript")
    
    def format_youtube_summary_context(self, content: dict) -> str:
        video_info = content.get("info", {})
        transcript = content.get("transcript", "")
        
        formatted_context = f"""
Video Information:
- Title: {video_info.get('title', 'N/A')}
- Author: {video_info.get('author', 'N/A')}
- Duration: {video_info.get('duration', 'N/A')}
- Published: {video_info.get('published_at', 'N/A')}
- Description: {video_info.get('description', 'N/A')[:500]}{'...' if len(video_info.get('description', '')) > 500 else ''}

Transcript:
{transcript}
        """.strip()
        
        return formatted_context