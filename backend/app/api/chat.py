from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ChatSession
from app.schemas import ChatMessageOut, ChatRequest, ChatResponse
from app.services import rag

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        session_id, answer, products = rag.answer(db, req.message, req.session_id, req.filters)
    except RuntimeError as exc:  # e.g. missing API key
        raise HTTPException(503, str(exc)) from exc
    return ChatResponse(session_id=session_id, answer=answer, products=products)


@router.get("/{session_id}/messages", response_model=list[ChatMessageOut])
def history(session_id: int, db: Session = Depends(get_db)):
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session.messages
