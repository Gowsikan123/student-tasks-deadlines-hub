from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.user import User
from app.models.task import Task
from app.models.deadline import Deadline
from app.models.study_session import StudySession
from app.schemas.dashboard import DashboardSummary, UpcomingDeadlineItem, TaskCounts

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # Task counts
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

    # Upcoming deadlines in next 7 days
    upcoming_deadlines_raw = (
        db.query(Deadline)
        .filter(
            Deadline.user_id == current_user.id,
            Deadline.due_date >= now,
            Deadline.due_date <= now + timedelta(days=7),
        )
        .order_by(Deadline.due_date.asc())
        .limit(5)
        .all()
    )

    upcoming_deadlines = [
        UpcomingDeadlineItem(
            id=d.id,
            title=d.title,
            deadline_type="exam" if d.is_exam else "assignment",
            due_at=d.due_date,
            module_id=d.module_id,
        )
        for d in upcoming_deadlines_raw
    ]

    # Study minutes in the last 7 days
    week_ago_date = week_ago.date()
    today_date = now.date()

    study_sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.session_date >= week_ago_date,
            StudySession.session_date <= today_date,
        )
        .all()
    )

    study_minutes_this_week = sum(
        s.duration_minutes for s in study_sessions
    )

    return DashboardSummary(
        task_counts=TaskCounts(
            todo=todo_count,
            in_progress=in_progress_count,
            done=done_count,
        ),
        upcoming_deadlines=upcoming_deadlines,
        study_minutes_this_week=study_minutes_this_week,
    )