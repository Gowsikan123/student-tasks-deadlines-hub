from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StudySessionBase(BaseModel):
    session_date: date
    duration_minutes: int = Field(ge=1, le=1440)
    notes: Optional[str] = None
    module_id: Optional[int] = None


class StudySessionCreate(StudySessionBase):
    pass


class StudySessionUpdate(BaseModel):
    session_date: Optional[date] = None
    duration_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    notes: Optional[str] = None
    module_id: Optional[int] = None


class StudySessionRead(StudySessionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)