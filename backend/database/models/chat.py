from sqlalchemy.orm import Session
from backend.database.migrations.chat import ChatHistory
import uuid

class ChatModel:
    def __init__(self, db: Session):
        self.db = db

    def save_chat_history(self, document_uuid: str, question: str, answer: str) -> ChatHistory:
        chat = ChatHistory(
            uuid=str(uuid.uuid4()),
            document_uuid=document_uuid,
            question=question,
            answer=answer
        )
        self.db.add(chat)
        self.db.commit()
        self.db.refresh(chat)
        return chat
    
