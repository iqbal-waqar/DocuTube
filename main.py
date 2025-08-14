from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from backend.routes import document, chat, youtube

app = FastAPI(
    title="RAG Chatbot",
    description="A simple RAG chatbot with 3 main features: Document Upload, Chat with Documents, and YouTube Video Summarization",
    version="2.0.0"
)

app.include_router(document.router, prefix="/documents", tags=["📄 Document Upload"])
app.include_router(chat.router, prefix="/chat", tags=["💬 Chat"])
app.include_router(youtube.router, prefix="/youtube", tags=["🎥 YouTube Summarizer"])

# Serve static frontend
frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

@app.get("/", tags=["🏠 Home"])
def read_home():
    return {
        "message": "Welcome to the RAG Chatbot API!",
        "version": "2.0.0",
        "features": [
            "📄 Upload and process documents",
            "💬 Chat with your uploaded documents using AI",
            "🎥 Summarize YouTube videos"
        ],
    }

@app.get("/health", tags=["🏠 Home"])
def health_check():
    return {"status": "healthy", "message": "DocuTube AI Backend is running!"}
