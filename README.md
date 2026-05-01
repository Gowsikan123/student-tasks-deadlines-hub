# 📚 Student Study Planner

A full-stack web application built for students to organise academic work in one place — manage modules, track tasks, monitor deadlines, and log study sessions with a live timer.

Built with **FastAPI**, **SQLite**, and **Jinja2** as a portfolio project demonstrating full-stack Python web development.

---

## ✨ Features

- 🔐 **User authentication** — register, login, and session-based access control
- 📊 **Dashboard** — summary of active tasks, upcoming deadlines, and weekly study minutes
- 📦 **Modules** — create and manage your academic modules
- ✅ **Tasks** — create, filter, complete, reopen, and delete tasks per module
- 📅 **Deadlines** — track upcoming assignment and exam deadlines
- ⏱️ **Study Sessions** — log sessions with a built-in timer, view total study time
- 🗃️ **SQLite database** — persistent storage with SQLAlchemy ORM

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | SQLite + SQLAlchemy |
| Auth | Session-based with password hashing |
| Templating | Jinja2 |
| Frontend | HTML, CSS, JavaScript |
| Server | Uvicorn (ASGI) |

---

## 📁 Project Structure

```
student-tasks-deadlines-hub/
├── app/
│   ├── main.py           # App entry point and router registration
│   ├── api/              # Route handlers (tasks, deadlines, sessions, etc.)
│   ├── models/           # SQLAlchemy database models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── db/               # Database setup and session management
│   ├── core/             # Config and security utilities
│   ├── dependencies/     # Auth and shared dependencies
│   ├── templates/        # Jinja2 HTML templates
│   └── static/           # CSS and JavaScript files
├── tests/                # Test suite
├── requirements.txt
└── .env.example
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Gowsikan123/student-tasks-deadlines-hub.git
cd student-tasks-deadlines-hub
```

### 2. Create and activate a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 5. Run the app

```bash
uvicorn app.main:app --reload
```

Then open: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🧪 Running Tests

```bash
pytest tests/
```

---

## 📄 Pages

| Page | Description |
|---|---|
| `/` | Dashboard with summary stats |
| `/modules` | View and manage academic modules |
| `/tasks` | Create, filter, and complete tasks |
| `/deadlines` | Track upcoming deadlines |
| `/study-sessions` | Log and time study sessions |
| `/register` | Create a new account |
| `/login` | Log in to your account |

---

## 🔮 Planned Improvements

- Edit existing modules, tasks, and deadlines
- Timetable / weekly schedule page
- Email reminders for upcoming deadlines
- Better dashboard analytics and charts
- Dark mode support

---

## 👤 Author

**Gowsikan** — [GitHub](https://github.com/Gowsikan123)
