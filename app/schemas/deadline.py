from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DeadlineCreate(BaseModel):
    title: str
    deadline_type: str  # "assignment" or "exam"
    due_at: datetime
    notes: Optional[str] = None
    module_id: Optional[int] = None


class DeadlineRead(BaseModel):
    id: int
    title: str
    deadline_type: str
    due_at: datetime
    notes: Optional[str] = None
    module_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (use orm_mode=True for v1)