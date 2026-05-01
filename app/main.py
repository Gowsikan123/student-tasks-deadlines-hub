from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    auth,
    dashboard,
    modules,
    tasks,
    deadlines,
    study_sessions,
    web,
)

app = FastAPI(
    title="Student Study Planner",
    version="0.1.0",
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth.router, tags=["auth"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(modules.router, tags=["modules"])
app.include_router(tasks.router, tags=["tasks"])
app.include_router(deadlines.router, tags=["deadlines"])
app.include_router(study_sessions.router, tags=["study-sessions"])
app.include_router(web.router, tags=["default"])