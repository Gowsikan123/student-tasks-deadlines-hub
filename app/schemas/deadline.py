from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

DeadlineType = Literal["assignment", "exam", "other"]


class DeadlineBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    deadline_type: DeadlineType = "assignment"
    due_at: datetime
    notes: Optional[str] = None
    module_id: Optional[int] = None


class DeadlineCreate(DeadlineBase):
    pass


class DeadlineUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    deadline_type: Optional[DeadlineType] = None
    due_at: Optional[datetime] = None
    notes: Optional[str] = None
    module_id: Optional[int] = None


class DeadlineRead(DeadlineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)