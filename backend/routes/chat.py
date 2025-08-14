from fastapi import APIRouter, Depends
from backend.utils.db_helper import get_db
from backend.interactors.chat import ask_question_interactor
from backend.schemas.chat import ChatResponse, ChatRequest

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask_question(chat_request: ChatRequest, db=Depends(get_db)):
    return ask_question_interactor(db, chat_request.question)
