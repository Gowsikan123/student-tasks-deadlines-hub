from datetime import datetime
from pydantic import BaseModel


class TaskCounts(BaseModel):
    todo: int
    in_progress: int
    done: int


class UpcomingDeadlineItem(BaseModel):
    id: int
    title: str
    deadline_type: str
    due_at: datetime
    module_id: int | None = None


class DashboardSummary(BaseModel):
    task_counts: TaskCounts
    upcoming_deadlines: list[UpcomingDeadlineItem]
    study_minutes_this_week: int