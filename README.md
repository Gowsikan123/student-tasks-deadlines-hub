***
# Student Study Planner (FastAPI)
A web app to help students manage modules, tasks, deadlines, and study sessions using a FastAPI backend with JWT authentication.
## Features
- User registration and login with hashed passwords and JWT tokens. [fastapi.tiangolo](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- CRUD APIs for modules, tasks, deadlines, and study sessions. [github](https://github.com/Cheater121/task_manager_fastapi)
- Interactive API docs via Swagger UI. [fastapi.tiangolo](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- Basic HTML templates for core pages, ready to be expanded. [fastapi.tiangolo](https://fastapi.tiangolo.com/advanced/templates/)
## Tech stack
- FastAPI, Pydantic, SQLAlchemy. [fastapi.tiangolo](https://fastapi.tiangolo.com/project-generation/)
- SQLite for local development. [geeksforgeeks](https://www.geeksforgeeks.org/python/to-do-list-app-using-fastapi/)
- OAuth2 password flow with Bearer JWT tokens. [fastapi.tiangolo](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- Jinja2 templates and simple CSS for the UI. [fastapi.tiangolo](https://fastapi.tiangolo.com/advanced/templates/)
## Setup
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

```bash
uvicorn app.main:app --reload
```

Then open:

- Swagger UI: http://127.0.0.1:8000/docs  
- ReDoc (optional): http://127.0.0.1:8000/redoc  

Short, clear setup instructions are a key part of a good README. [freecodecamp](https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/)
## How to use
1. Register via `POST /auth/register` (use Swagger UI). [fastapi.tiangolo](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
2. Log in with `POST /auth/login` and copy the access token.  
3. Click “Authorize” in Swagger and enter `Bearer <your_token>`.  
4. Use the authenticated endpoints to create and manage modules, tasks, deadlines, and study sessions.
## Future ideas
- Cookie-based login for HTML pages. [geeksforgeeks](https://www.geeksforgeeks.org/python/to-do-list-app-using-fastapi/)
- Improved dashboard UI with charts. [fastapi.tiangolo](https://fastapi.tiangolo.com/advanced/templates/)
- Filters, search, and reminders for upcoming deadlines. [dev](https://dev.to/ravigupta97/building-a-production-ready-task-management-api-with-fastapi-complete-architecture-guide-25a)

