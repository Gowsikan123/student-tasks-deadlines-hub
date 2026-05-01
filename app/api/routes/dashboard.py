from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.deadline import Deadline
from app.models.study_session import StudySession
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    week_ahead = now + timedelta(days=7)
    week_ago = now - timedelta(days=7)

    todo_count = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.status == "todo")
        .count()
    )

    in_progress_count = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.status == "in_progress")
        .count()
    )

    done_count = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.status == "done")
        .count()
    )

    upcoming_deadlines = (
        db.query(Deadline)
        .filter(
            Deadline.user_id == current_user.id,
            Deadline.due_date >= now,
            Deadline.due_date <= week_ahead,
        )
        .order_by(Deadline.due_date.asc())
        .all()
    )

    study_minutes_this_week = (
        db.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.started_at >= week_ago,
        )
        .scalar()
    )

    return {
        "task_counts": {
            "todo": todo_count,
            "in_progress": in_progress_count,
            "done": done_count,
        },
        "study_minutes_this_week": study_minutes_this_week,
        "upcoming_deadlines": [
            {
                "id": deadline.id,
                "title": deadline.title,
                "deadline_type": "exam" if deadline.is_exam else "assignment",
                "due_at": deadline.due_date,
                "module_id": deadline.module_id,
            }
            for deadline in upcoming_deadlines
        ],
    }