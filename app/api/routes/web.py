from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

from app.db.session import SessionLocal

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/login-page")
def login_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"request": request},
    )


@router.get("/register-page")
def register_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={"request": request},
    )


@router.get("/")
def dashboard_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request},
    )


@router.get("/tasks-page")
def tasks_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="tasks.html",
        context={"request": request},
    )

@router.get("/modules-page")
def modules_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="modules.html",
        context={"request": request},
    )

@router.get("/deadlines-page")
def deadlines_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="deadlines.html",
        context={"request": request},
    )

@router.get("/study-sessions-page")
def study_sessions_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="study_sessions.html",
        context={"request": request},
    )