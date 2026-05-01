from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.module import Module
from app.models.study_session import StudySession
from app.models.user import User
from app.schemas.study_session import (
    StudySessionCreate,
    StudySessionRead,
    StudySessionUpdate,
)

router = APIRouter(prefix="/study-sessions", tags=["study-sessions"])


@router.get("/", response_model=List[StudySessionRead])
def list_study_sessions(
    module_id: Optional[int] = Query(default=None),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)

    if module_id:
        query = query.filter(StudySession.module_id == module_id)

    if date_from:
        query = query.filter(StudySession.session_date >= date_from)

    if date_to:
        query = query.filter(StudySession.session_date <= date_to)

    sessions = query.order_by(StudySession.session_date.desc(), StudySession.id.desc()).all()
    return sessions


@router.post("/", response_model=StudySessionRead, status_code=status.HTTP_201_CREATED)
def create_study_session(
    payload: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.module_id is not None:
        module = (
            db.query(Module)
            .filter(Module.id == payload.module_id, Module.user_id == current_user.id)
            .first()
        )
        if not module:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid module_id for this user",
            )

    session = StudySession(
        user_id=current_user.id,
        module_id=payload.module_id,
        session_date=payload.session_date,
        duration_minutes=payload.duration_minutes,
        notes=payload.notes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=StudySessionRead)
def get_study_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.id == session_id, StudySession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")
    return session


@router.put("/{session_id}", response_model=StudySessionRead)
def update_study_session(
    session_id: int,
    payload: StudySessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.id == session_id, StudySession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "module_id" in update_data and update_data["module_id"] is not None:
        module = (
            db.query(Module)
            .filter(Module.id == update_data["module_id"], Module.user_id == current_user.id)
            .first()
        )
        if not module:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid module_id for this user",
            )

    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.id == session_id, StudySession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found")

    db.delete(session)
    db.commit()
    return None