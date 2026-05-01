from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.deadline import Deadline
from app.models.module import Module
from app.models.user import User
from app.schemas.deadline import DeadlineCreate, DeadlineRead, DeadlineUpdate

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


@router.get("/", response_model=List[DeadlineRead])
def list_deadlines(
    deadline_type: Optional[str] = Query(default=None),
    module_id: Optional[int] = Query(default=None),
    upcoming_days: Optional[int] = Query(default=None, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Deadline).filter(Deadline.user_id == current_user.id)

    if deadline_type:
        query = query.filter(Deadline.deadline_type == deadline_type)

    if module_id:
        query = query.filter(Deadline.module_id == module_id)

    if upcoming_days:
        now = datetime.utcnow()
        upper_bound = now + timedelta(days=upcoming_days)
        query = query.filter(Deadline.due_at >= now, Deadline.due_at <= upper_bound)

    deadlines = query.order_by(Deadline.due_at.asc()).all()
    return deadlines


@router.post("/", response_model=DeadlineRead, status_code=status.HTTP_201_CREATED)
def create_deadline(
    payload: DeadlineCreate,
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

    deadline = Deadline(
        user_id=current_user.id,
        module_id=payload.module_id,
        title=payload.title,
        deadline_type=payload.deadline_type,
        due_at=payload.due_at,
        notes=payload.notes,
    )
    db.add(deadline)
    db.commit()
    db.refresh(deadline)
    return deadline


@router.get("/{deadline_id}", response_model=DeadlineRead)
def get_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deadline = (
        db.query(Deadline)
        .filter(Deadline.id == deadline_id, Deadline.user_id == current_user.id)
        .first()
    )
    if not deadline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")
    return deadline


@router.put("/{deadline_id}", response_model=DeadlineRead)
def update_deadline(
    deadline_id: int,
    payload: DeadlineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deadline = (
        db.query(Deadline)
        .filter(Deadline.id == deadline_id, Deadline.user_id == current_user.id)
        .first()
    )
    if not deadline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")

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
        setattr(deadline, field, value)

    db.commit()
    db.refresh(deadline)
    return deadline


@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deadline = (
        db.query(Deadline)
        .filter(Deadline.id == deadline_id, Deadline.user_id == current_user.id)
        .first()
    )
    if not deadline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")

    db.delete(deadline)
    db.commit()
    return None