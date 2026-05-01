from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.study_session import StudySession
from app.models.user import User
from app.schemas.study_session import StudySessionCreate, StudySessionRead


router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])


@router.post("/", response_model=StudySessionRead, status_code=status.HTTP_201_CREATED)
def create_study_session(
    session_in: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duration_seconds = (session_in.ended_at - session_in.started_at).total_seconds()

    if duration_seconds <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    duration_minutes = max(1, int(duration_seconds // 60))

    db_session = StudySession(
        user_id=current_user.id,
        module_id=session_in.module_id,
        title=session_in.title,
        notes=session_in.notes,
        started_at=session_in.started_at,
        ended_at=session_in.ended_at,
        duration_minutes=duration_minutes,
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return db_session


@router.get("/", response_model=List[StudySessionRead])
def list_study_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(StudySession.started_at.desc())
        .all()
    )
    return sessions


@router.get("/{session_id}", response_model=StudySessionRead)
def get_study_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found",
        )

    db.delete(session)
    db.commit()