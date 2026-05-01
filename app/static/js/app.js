console.log("Student hub frontend loaded");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

function requireAuth() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/login-page";
    return null;
  }
  return token;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "same-origin",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Something went wrong while logging in");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      alert("Account created successfully");
      window.location.href = "/login-page";
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating your account");
    }
  });
}

async function loadDashboard() {
  const token = requireAuth();
  if (!token) return;

  try {
    const response = await fetch("/dashboard/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login-page";
        return;
      }
      console.error("Failed to load dashboard summary");
      return;
    }

    const data = await response.json();

    const todoCount = document.getElementById("tasks-todo-count");
    const inProgressCount = document.getElementById("tasks-in-progress-count");
    const doneCount = document.getElementById("tasks-done-count");
    const studyMinutesWeek = document.getElementById("study-minutes-week");
    const deadlinesList = document.getElementById("upcoming-deadlines-list");

    if (todoCount) todoCount.textContent = data.task_counts?.todo ?? 0;
    if (inProgressCount) inProgressCount.textContent = data.task_counts?.in_progress ?? 0;
    if (doneCount) doneCount.textContent = data.task_counts?.done ?? 0;
    if (studyMinutesWeek) studyMinutesWeek.textContent = data.study_minutes_this_week ?? 0;

    if (deadlinesList) {
      deadlinesList.innerHTML = "";

      if (data.upcoming_deadlines && data.upcoming_deadlines.length > 0) {
        data.upcoming_deadlines.forEach((deadline) => {
          const li = document.createElement("li");

          const dueDate = deadline.due_at
            ? new Date(deadline.due_at).toLocaleString()
            : "No date";

          li.innerHTML = `
            <strong>${deadline.title}</strong>
            <br>Type: ${deadline.deadline_type}
            <br>Due: ${dueDate}
          `;

          deadlinesList.appendChild(li);
        });
      } else {
        deadlinesList.innerHTML = "<li>No upcoming deadlines.</li>";
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadModulesPage() {
  const token = requireAuth();
  if (!token) return;

  const modulesList = document.getElementById("modules-list");
  const form = document.getElementById("create-module-form");

  try {
    const response = await fetch("/modules/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login-page";
        return;
      }
      console.error("Failed to load modules");
      return;
    }

    const data = await response.json();

    if (modulesList) {
      modulesList.innerHTML = "";

      if (data.length === 0) {
        modulesList.innerHTML = "<li>No modules yet.</li>";
      } else {
        data.forEach((module) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${module.name}</strong>
            ${module.code ? ` – ${module.code}` : ""}
            ${module.description ? `<br>${module.description}` : ""}
          `;
          modulesList.appendChild(li);
        });
      }
    }

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("module_name").value.trim();
        const code = document.getElementById("module_code").value.trim();
        const description = document.getElementById("module_description").value.trim();

        if (!name) {
          alert("Module name is required");
          return;
        }

        const createResponse = await fetch("/modules/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            code: code || null,
            description: description || null,
            color: null,
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          alert(createData.detail || "Could not create module");
          return;
        }

        window.location.reload();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadTasksPage() {
  const token = requireAuth();
  if (!token) return;

  const tasksList = document.getElementById("tasks-list");
  const taskForm = document.getElementById("create-task-form");
  const moduleSelect = document.getElementById("task_module_id");

  try {
    const [tasksResponse, modulesResponse] = await Promise.all([
      fetch("/tasks/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch("/modules/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    if (!tasksResponse.ok || !modulesResponse.ok) {
      if (tasksResponse.status === 401 || modulesResponse.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login-page";
        return;
      }
      console.error("Failed to load tasks or modules");
      return;
    }

    const tasks = await tasksResponse.json();
    const modules = await modulesResponse.json();

    if (moduleSelect) {
      moduleSelect.innerHTML = '<option value="">No module</option>';
      modules.forEach((module) => {
        const option = document.createElement("option");
        option.value = module.id;
        option.textContent = module.code
          ? `${module.name} (${module.code})`
          : module.name;
        moduleSelect.appendChild(option);
      });
    }

    if (tasksList) {
      tasksList.innerHTML = "";

      if (tasks.length === 0) {
        tasksList.innerHTML = "<li>No tasks found.</li>";
      } else {
        tasks.forEach((task) => {
          const li = document.createElement("li");

          li.innerHTML = `
            <strong>${task.title}</strong>
            ${task.description ? `<br>${task.description}` : ""}
            <br>Status: ${task.status}
            <br>Priority: ${task.priority}
            ${task.due_date ? `<br>Due: ${task.due_date}` : ""}
            ${task.is_exam ? `<br>Exam task: Yes` : ""}
          `;

          tasksList.appendChild(li);
        });
      }
    }

    if (taskForm) {
      taskForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.getElementById("task_title").value.trim();
        const description = document.getElementById("task_description").value.trim();
        const moduleId = document.getElementById("task_module_id").value;
        const status = document.getElementById("task_status").value;
        const priority = document.getElementById("task_priority").value;
        const dueDate = document.getElementById("task_due_date").value;
        const isExam = document.getElementById("task_is_exam").value === "true";

        if (!title) {
          alert("Task title is required");
          return;
        }

        const createResponse = await fetch("/tasks/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description: description || null,
            status,
            priority,
            due_date: dueDate || null,
            is_exam: isExam,
            module_id: moduleId ? Number(moduleId) : null,
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          alert(createData.detail || "Could not create task");
          return;
        }

        window.location.reload();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

if (window.location.pathname === "/") {
  loadDashboard();
}

if (window.location.pathname === "/tasks-page") {
  loadTasksPage();
}

if (window.location.pathname === "/modules-page") {
  loadModulesPage();
}