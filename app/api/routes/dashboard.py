from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.deadline import Deadline
from app.models.study_session import StudySession
from app.models.task import Task
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, TaskCounts, UpcomingDeadlineItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status_rows = (
        db.query(Task.status, func.count(Task.id))
        .filter(Task.user_id == current_user.id)
        .group_by(Task.status)
        .all()
    )

    counts = {"todo": 0, "in_progress": 0, "done": 0}
    for status, count in status_rows:
        if status in counts:
            counts[status] = count

    now = datetime.utcnow()
    next_7_days = now + timedelta(days=7)

    upcoming_deadlines = (
        db.query(Deadline)
        .filter(
            Deadline.user_id == current_user.id,
            Deadline.due_at >= now,
            Deadline.due_at <= next_7_days,
        )
        .order_by(Deadline.due_at.asc())
        .all()
    )

    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())

    study_minutes_this_week = (
        db.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.session_date >= week_start,
            StudySession.session_date <= today,
        )
        .scalar()
    )

    return DashboardSummary(
        task_counts=TaskCounts(
            todo=counts["todo"],
            in_progress=counts["in_progress"],
            done=counts["done"],
        ),
        upcoming_deadlines=[
            UpcomingDeadlineItem(
                id=deadline.id,
                title=deadline.title,
                deadline_type=deadline.deadline_type,
                due_at=deadline.due_at,
                module_id=deadline.module_id,
            )
            for deadline in upcoming_deadlines
        ],
        study_minutes_this_week=study_minutes_this_week or 0,
    )