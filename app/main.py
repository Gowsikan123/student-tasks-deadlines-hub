from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes.auth import router as auth_router
from app.api.routes.deadlines import router as deadlines_router
from app.api.routes.modules import router as modules_router
from app.api.routes.tasks import router as tasks_router
from app.db.init_db import init_db

app = FastAPI(title="Student Tasks & Deadlines Hub")

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.include_router(auth_router)
app.include_router(modules_router)
app.include_router(tasks_router)
app.include_router(deadlines_router)


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "title": "Student Tasks & Deadlines Hub"
        }
    )


@app.get("/health")
def health():
    return {"status": "ok"}