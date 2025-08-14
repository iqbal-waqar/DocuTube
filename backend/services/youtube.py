from typing import Dict, Any
from backend.services.youtube_api import YouTubeAPIService
from backend.services.transcript import TranscriptService
from backend.utils.validators import APIValidators

class YouTubeService:
    def __init__(self):
        self.api_service = YouTubeAPIService()
        self.transcript_service = TranscriptService()
    
    def get_video_info(self, url: str) -> Dict[str, Any]:
        try:
            video_id = self.api_service.extract_video_id(url)
            video_id_error = APIValidators.ensure_video_id_or_error_dict(video_id)
            if video_id_error:
                return video_id_error
    
            api_result = self.api_service.get_video_metadata(video_id)
            if "error" not in api_result:
                return api_result
            
            return {
                "id": video_id,
                "title": f"YouTube Video {video_id}",
                "author": "YouTube Creator",
                "channel_id": "",
                "description": f"Video ID: {video_id}",
                "published_at": "",
                "duration": 0,
                "view_count": 0,
                "like_count": 0,
                "comment_count": 0,
                "tags": [],
                "category_id": "",
                "thumbnail_url": ""
            }
            
        except Exception as e:
            return {"error": f"Error getting video info: {str(e)}"}
    
    def get_transcript(self, url: str) -> str:
        try:
            video_id = self.api_service.extract_video_id(url)
            video_id_error = APIValidators.ensure_video_id_or_error_dict(video_id)
            if video_id_error:
                return video_id_error["error"]
            
            return self.transcript_service.get_transcript(video_id)
            
        except Exception as e:
            return f"Error getting transcript: {str(e)}"
    
    def get_video_content(self, url: str) -> Dict[str, Any]:
        info = self.get_video_info(url)
        
        if "error" in info:
            return {"error": info["error"]}
        
        transcript = self.get_transcript(url)
        
        if transcript.startswith("Error") or transcript.startswith("Could not"):
            transcript = "Transcript unavailable."
        
        return {
            "info": info,
            "transcript": transcript
        }
    

