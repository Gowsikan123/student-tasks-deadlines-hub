from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class ModuleBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: Optional[str] = Field(default=None, max_length=30)
    description: Optional[str] = None
    color: Optional[str] = Field(default=None, max_length=20)


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    code: Optional[str] = Field(default=None, max_length=30)
    description: Optional[str] = None
    color: Optional[str] = Field(default=None, max_length=20)


class ModuleRead(ModuleBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)