# Student Study Planner

A full-stack FastAPI web application for students to manage modules, tasks, deadlines, and study sessions in one place.

## Features

- User registration and login
- Dashboard overview
- Module management
- Task management
- Deadline tracking
- Study session tracking
- Weekly study minutes summary

## Tech Stack

- FastAPI
- Python
- SQLAlchemy
- SQLite
- Jinja2 templates
- HTML, CSS, JavaScript

## Pages

- Dashboard
- Modules
- Tasks
- Deadlines
- Study Sessions
- Login
- Register

## How to Run

1. Clone the repository
2. Create and activate a virtual environment
3. Install dependencies
4. Run the app with uvicorn

Example:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

## Project Purpose

This project was built as a student planner system to help users organise academic work, track deadlines, and log study time.

## Future Improvements

- Edit modules, tasks, and deadlines
- Better dashboard analytics
- Timetable page
- Notifications and reminders