from sqlalchemy.orm import Session
from backend.database.models.chat import ChatModel
from backend.database.migrations.document import Document
from backend.services.vectordb import VectorDBService
from backend.services.llm import GeminiService
from backend.services.exceptions import AppExceptions

class ChatInteractor:
    def __init__(self, db: Session):
        self.db = db
        self.chat_model = ChatModel(db)
        self.gemini = GeminiService()

    def ask_question(self, question: str):
        try:
            document = self.get_most_recent_document()
            self.validate_document_ready(document)
            
            answer = self.get_answer_with_rag(question, document.namespace, document.vector_db_type)
            
            chat = self.chat_model.save_chat_history(document.uuid, question, answer)
            
            chat.document_info = self.create_document_info(document)
            chat.chat_uuid = chat.uuid
            
            return chat
            
        except Exception as e:
            AppExceptions.raise_question_processing_error(str(e))

    def get_answer_with_rag(self, question: str, namespace: str, vector_db_type: str) -> str:
        try:
            vector_service = VectorDBService(db_type=vector_db_type)
            stats = vector_service.get_namespace_stats(namespace)
            if not stats or stats.get('vector_count', 0) == 0:
                return "No relevant information found in the document to answer your question."

            retriever = vector_service.as_retriever(namespace=namespace, search_kwargs={"k": 5})
            answer = self.gemini.answer_with_retriever(question, retriever)
            return answer
            
        except Exception as e:
            return f"Error processing question: {str(e)}"

    def get_most_recent_document(self) -> Document:
        recent_documents = self.db.query(Document).filter(
            Document.processing_status == "completed"
        ).order_by(Document.uploaded_at.desc()).limit(10).all()
        
        if not recent_documents:
            AppExceptions.raise_no_processed_document()
            
        for document in recent_documents:
            if document.namespace:
                try:
                    vector_service = VectorDBService(db_type=document.vector_db_type or "pinecone")
                    stats = vector_service.get_namespace_stats(document.namespace)
                    if stats and stats.get('vector_count', 0) > 0:
                        return document
                except Exception:
                    continue

        return recent_documents[0]

    def validate_document_ready(self, document: Document) -> None:
        if document.processing_status != "completed":
            AppExceptions.raise_document_not_ready(document.processing_status)

    def create_document_info(self, document: Document) -> dict:
        return {
            "uuid": document.uuid,
            "filename": document.filename,
            "file_type": document.file_type,
            "uploaded_at": document.uploaded_at.isoformat() if document.uploaded_at else None,
            "processing_status": document.processing_status
        }

def ask_question_interactor(db, question):
    interactor = ChatInteractor(db)
    return interactor.ask_question(question)
