from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.deadline import Deadline
from app.models.user import User
from app.schemas.deadline import DeadlineCreate, DeadlineRead

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


@router.post("/", response_model=DeadlineRead, status_code=status.HTTP_201_CREATED)
def create_deadline(
    deadline_in: DeadlineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_exam = deadline_in.deadline_type.lower() == "exam"

    db_deadline = Deadline(
        user_id=current_user.id,
        module_id=deadline_in.module_id,
        title=deadline_in.title,
        description=deadline_in.notes,
        due_date=deadline_in.due_at,
        is_exam=is_exam,
    )

    db.add(db_deadline)
    db.commit()
    db.refresh(db_deadline)

    return DeadlineRead(
        id=db_deadline.id,
        title=db_deadline.title,
        deadline_type="exam" if db_deadline.is_exam else "assignment",
        due_at=db_deadline.due_date,
        notes=db_deadline.description,
        module_id=db_deadline.module_id,
        created_at=db_deadline.created_at,
        updated_at=db_deadline.updated_at,
    )


@router.get("/", response_model=List[DeadlineRead])
def list_deadlines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deadlines = (
        db.query(Deadline)
        .filter(Deadline.user_id == current_user.id)
        .order_by(Deadline.due_date.asc())
        .all()
    )

    return [
        DeadlineRead(
            id=d.id,
            title=d.title,
            deadline_type="exam" if d.is_exam else "assignment",
            due_at=d.due_date,
            notes=d.description,
            module_id=d.module_id,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in deadlines
    ]


@router.get("/{deadline_id}", response_model=DeadlineRead)
def get_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = (
        db.query(Deadline)
        .filter(Deadline.user_id == current_user.id, Deadline.id == deadline_id)
        .first()
    )
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")

    return DeadlineRead(
        id=d.id,
        title=d.title,
        deadline_type="exam" if d.is_exam else "assignment",
        due_at=d.due_date,
        notes=d.description,
        module_id=d.module_id,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )


@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = (
        db.query(Deadline)
        .filter(Deadline.user_id == current_user.id, Deadline.id == deadline_id)
        .first()
    )
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")

    db.delete(d)
    db.commit()