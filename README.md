# Student Tasks & Deadlines Hub

> A web-based task and deadline management system built for students — powered by FastAPI and Jinja2.

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20Jinja2%20%7C%20SQLite-informational)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)

---

## What It Does

A focused productivity tool built specifically for the rhythm of student life — assignments, coursework deadlines, revision sessions, and exam dates all in one place. Designed to be lightweight and self-hosted, with no accounts or cloud services required.

Built as a personal project to practise full-stack Python development with FastAPI and server-side rendering.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI | Fast async Python framework with clean routing |
| Templating | Jinja2 | Server-rendered pages — no JavaScript framework needed |
| Database | SQLite | Portable, zero-config file-based storage |
| Styling | CSS | Custom styling without third-party UI dependencies |

---

## Key Features

- **Task management** — Create, edit, and delete tasks with titles, descriptions, and due dates
- **Priority levels** — Mark tasks as Low / Medium / High priority
- **Status tracking** — Toggle tasks between To Do, In Progress, and Completed
- **Deadline view** — Chronological list of upcoming deadlines at a glance
- **Subject tagging** — Organise tasks by module or subject area
- **Overdue detection** — Tasks past their deadline are automatically flagged

---

## Local Setup

```bash
git clone https://github.com/Gowsikan123/student-tasks-deadlines-hub.git
cd student-tasks-deadlines-hub
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# Open http://localhost:8000
```

---

## Project Structure

```
student-tasks-deadlines-hub/
├── main.py              # FastAPI app, routes
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response schemas
├── database.py          # DB connection and session setup
├── templates/           # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html
│   └── task_detail.html
├── static/              # CSS and assets
└── requirements.txt
```

---

## What I Learned

- Structuring a Python web app following separation of concerns (routes, models, schemas)
- Using Pydantic for input validation and FastAPI's dependency injection for DB sessions
- Rendering dynamic HTML server-side with Jinja2 template inheritance
- Modelling relational data with SQLAlchemy and SQLite

---

## Author

**Gowsikan** — [GitHub](https://github.com/Gowsikan123)