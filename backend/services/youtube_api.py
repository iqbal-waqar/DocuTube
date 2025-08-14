import re
import requests
from typing import Dict, Any, Optional
from backend.utils.config import config
from backend.utils.validators import APIValidators

class YouTubeAPIService:    
    def __init__(self):
        self.api_key = config.youtube_api_key()
        self.base_url = "https://www.googleapis.com/youtube/v3"
        
    def extract_video_id(self, url: str) -> Optional[str]:
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    def parse_duration(self, duration_str: str) -> int:
        try:
            duration_str = duration_str.replace('PT', '')
            
            hours = 0
            minutes = 0
            seconds = 0
            
            h_match = re.search(r'(\d+)H', duration_str)
            if h_match:
                hours = int(h_match.group(1))
            
            m_match = re.search(r'(\d+)M', duration_str)
            if m_match:
                minutes = int(m_match.group(1))
            
            s_match = re.search(r'(\d+)S', duration_str)
            if s_match:
                seconds = int(s_match.group(1))
            
            return hours * 3600 + minutes * 60 + seconds
        except (ValueError, AttributeError):
            return 0
    
    def get_video_metadata(self, video_id: str) -> Dict[str, Any]:
        api_key_error = APIValidators.ensure_api_key_or_error_dict(self.api_key, "YouTube API")
        if api_key_error:
            return api_key_error
            
        try:
            url = f"{self.base_url}/videos"
            params = {
                'part': 'snippet,statistics,contentDetails',
                'id': video_id,
                'key': self.api_key
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('items'):
                return {"error": "Video not found or private"}
            
            video_data = data['items'][0]
            snippet = video_data['snippet']
            statistics = video_data.get('statistics', {})
            content_details = video_data.get('contentDetails', {})
            
            duration_str = content_details.get('duration', 'PT0S')
            duration_seconds = self.parse_duration(duration_str)
            
            return {
                "id": video_id,
                "title": snippet.get('title', f'YouTube Video {video_id}'),
                "author": snippet.get('channelTitle', 'Unknown Channel'),
                "channel_id": snippet.get('channelId', ''),
                "description": snippet.get('description', ''),
                "published_at": snippet.get('publishedAt', ''),
                "duration": duration_seconds,
                "view_count": int(statistics.get('viewCount', 0)),
                "like_count": int(statistics.get('likeCount', 0)),
                "comment_count": int(statistics.get('commentCount', 0)),
                "tags": snippet.get('tags', []),
                "category_id": snippet.get('categoryId', ''),
                "thumbnail_url": snippet.get('thumbnails', {}).get('high', {}).get('url', '')
            }
            
        except requests.exceptions.RequestException as e:
            return {"error": f"API request failed: {str(e)}"}
        except Exception as e:
            return {"error": f"Error getting video metadata: {str(e)}"}