from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user, get_db
from app.models.module import Module
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleRead, ModuleUpdate

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("/", response_model=List[ModuleRead])
def list_modules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    modules = (
        db.query(Module)
        .filter(Module.user_id == current_user.id)
        .order_by(Module.created_at.desc())
        .all()
    )
    return modules


@router.post("/", response_model=ModuleRead, status_code=status.HTTP_201_CREATED)
def create_module(
    payload: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = Module(
        user_id=current_user.id,
        name=payload.name,
        code=payload.code,
        description=payload.description,
        color=payload.color,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get("/{module_id}", response_model=ModuleRead)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = (
        db.query(Module)
        .filter(Module.id == module_id, Module.user_id == current_user.id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@router.put("/{module_id}", response_model=ModuleRead)
def update_module(
    module_id: int,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = (
        db.query(Module)
        .filter(Module.id == module_id, Module.user_id == current_user.id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(module, field, value)

    db.commit()
    db.refresh(module)
    return module


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = (
        db.query(Module)
        .filter(Module.id == module_id, Module.user_id == current_user.id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    db.delete(module)
    db.commit()
    return None