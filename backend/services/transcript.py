from typing import Optional
from youtube_transcript_api import YouTubeTranscriptApi

class TranscriptService:
    def __init__(self):
        self.api = YouTubeTranscriptApi()
    
    def get_transcript(self, video_id: str) -> str:
        try:
            transcript_data = self.fetch_transcript(video_id, ['en'])
            if transcript_data:
                return self.format_transcript(transcript_data)
            
            transcript_data = self.fetch_transcript(video_id, ['en-US', 'en-GB'])
            if transcript_data:
                return self.format_transcript(transcript_data)
            
            transcript_data = self.fetch_any_available_transcript(video_id)
            if transcript_data:
                return self.format_transcript(transcript_data)
            
            return "Could not retrieve transcript: No transcripts available"
            
        except Exception as e:
            return f"Error getting transcript: {str(e)}"
    
    def fetch_transcript(self, video_id: str, languages: list) -> Optional[list]:
        try:
            return self.api.fetch(video_id, languages=languages)
        except Exception:
            return None
    
    def fetch_any_available_transcript(self, video_id: str):
        try:
            transcript_list = self.api.list(video_id)
            # Try to find any available transcript
            for transcript in transcript_list:
                try:
                    return transcript.fetch()
                except Exception:
                    continue
            return None
        except Exception:
            return None
    
    def format_transcript(self, transcript_data) -> str:
        # Handle both FetchedTranscript and list of FetchedTranscriptSnippet objects
        if hasattr(transcript_data, '__iter__'):
            # It's iterable (FetchedTranscript or list)
            return " ".join([snippet.text if hasattr(snippet, 'text') else snippet['text'] for snippet in transcript_data])
        else:
            return str(transcript_data)