from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StudySessionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None
    module_id: Optional[int] = None
    started_at: datetime
    ended_at: datetime


class StudySessionRead(BaseModel):
    id: int
    title: str
    notes: Optional[str] = None
    module_id: Optional[int] = None
    started_at: datetime
    ended_at: datetime
    duration_minutes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True