from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.auth import get_optional_current_user
from app.services.llm_service import chat_with_assistant
from app.services.report_service import get_report_for_user

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question for the health assistant")
    report_id: str | None = Field(default=None, description="Optional ID of active report for context")
    context: dict[str, Any] | None = Field(default=None, description="Optional client-side analysis context")
    history: list[ChatMessage] | None = Field(default=None, description="Recent conversation turns")


class ChatResponse(BaseModel):
    answer: str
    report_id: str | None = None


@router.post("/chat", response_model=ChatResponse)
async def assistant_chat(
    payload: ChatRequest,
    user: dict | None = Depends(get_optional_current_user),
):
    """
    Intelligent HealthLens conversational AI assistant powered by OpenRouter LLM.
    Answers questions grounded in the user's specific health screening data and clinical findings.
    Supports authenticated users and guest sessions with client-provided context.
    """
    active_context = payload.context or {}

    # Only the report's authenticated owner may load it for context.
    # Guests rely on client-provided context instead.
    if payload.report_id and user and "user_id" in user:
        report = get_report_for_user(payload.report_id, user["user_id"])

        if report:
            active_context = {
                **active_context,
                "report_id": report.get("report_id"),
                "prediction": report.get("prediction"),
                "extracted_features": report.get("extracted_features"),
                "user_features": report.get("user_features"),
                "final_features": report.get("final_features"),
                "summary": report.get("summary"),
            }

    history_dicts = (
        [{"role": msg.role, "content": msg.content} for msg in payload.history]
        if payload.history
        else None
    )

    answer = chat_with_assistant(
        question=payload.question,
        context=active_context if active_context else None,
        history=history_dicts,
    )

    return ChatResponse(
        answer=answer,
        report_id=payload.report_id,
    )
