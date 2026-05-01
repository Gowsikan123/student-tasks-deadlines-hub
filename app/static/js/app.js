console.log("Student hub frontend loaded");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

let activeStudySessionStart = null;
let activeStudySessionTimer = null;

function getToken() {
  return localStorage.getItem("access_token");
}

function clearAuthAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  window.location.href = "/login-page";
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login-page";
    return null;
  }
  return token;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatDateTime(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDateOnly(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatElapsed(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remainingSeconds}`;
}

async function apiFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthAndRedirect();
    return null;
  }

  return response;
}

/* =========================
   LOGIN
========================= */

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

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        alert(data?.detail || "Login failed");
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

/* =========================
   REGISTER
========================= */

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

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        alert(data?.detail || "Registration failed");
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

/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {
  const token = requireAuth();
  if (!token) return;

  try {
    const response = await apiFetch("/dashboard/summary");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load dashboard summary");
      return;
    }

    const data = await parseJsonSafe(response);

    const todoCount = document.getElementById("tasks-todo-count");
    const inProgressCount = document.getElementById("tasks-in-progress-count");
    const doneCount = document.getElementById("tasks-done-count");
    const studyMinutesWeek = document.getElementById("study-minutes-week");
    const deadlinesList = document.getElementById("upcoming-deadlines-list");

    if (todoCount) todoCount.textContent = data?.task_counts?.todo ?? 0;
    if (inProgressCount) inProgressCount.textContent = data?.task_counts?.in_progress ?? 0;
    if (doneCount) doneCount.textContent = data?.task_counts?.done ?? 0;
    if (studyMinutesWeek) studyMinutesWeek.textContent = data?.study_minutes_this_week ?? 0;

    if (deadlinesList) {
      deadlinesList.innerHTML = "";

      if (data?.upcoming_deadlines?.length) {
        data.upcoming_deadlines.forEach((deadline) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${escapeHtml(deadline.title)}</strong>
            <br>Type: ${escapeHtml(deadline.deadline_type)}
            <br>Due: ${escapeHtml(formatDateTime(deadline.due_at))}
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

/* =========================
   MODULES
========================= */

async function loadModulesPage() {
  const token = requireAuth();
  if (!token) return;

  const modulesList = document.getElementById("modules-list");
  const form = document.getElementById("create-module-form");

  async function refreshModules() {
    const response = await apiFetch("/modules/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load modules");
      return;
    }

    const modules = await parseJsonSafe(response);

    if (!modulesList) return;

    modulesList.innerHTML = "";

    if (!modules || modules.length === 0) {
      modulesList.innerHTML = "<li>No modules yet.</li>";
      return;
    }

    modules.forEach((module) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${escapeHtml(module.name)}</strong>
        ${module.code ? ` – ${escapeHtml(module.code)}` : ""}
        ${module.description ? `<br>${escapeHtml(module.description)}` : ""}
      `;
      modulesList.appendChild(li);
    });
  }

  try {
    await refreshModules();

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

        const response = await apiFetch("/modules/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            code: code || null,
            description: description || null,
            color: null,
          }),
        });

        if (!response) return;

        const data = await parseJsonSafe(response);

        if (!response.ok) {
          alert(data?.detail || "Could not create module");
          return;
        }

        form.reset();
        await refreshModules();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   TASKS
========================= */

async function loadTasksPage() {
  const token = requireAuth();
  if (!token) return;

  const tasksList = document.getElementById("tasks-list");
  const taskForm = document.getElementById("create-task-form");
  const moduleSelect = document.getElementById("task_module_id");
  const filterStatus = document.getElementById("filter_status");
  const filterModule = document.getElementById("filter_module");

  async function loadModulesIntoTaskSelect() {
    const response = await apiFetch("/modules/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load modules");
      return;
    }

    const modules = await parseJsonSafe(response);

    if (moduleSelect) {
      moduleSelect.innerHTML = '<option value="">No module</option>';

      (modules || []).forEach((module) => {
        const option = document.createElement("option");
        option.value = module.id;
        option.textContent = module.code
          ? `${module.name} (${module.code})`
          : module.name;
        moduleSelect.appendChild(option);
      });
    }

    if (filterModule) {
      filterModule.innerHTML = '<option value="">All modules</option>';

      (modules || []).forEach((module) => {
        const option = document.createElement("option");
        option.value = module.id;
        option.textContent = module.code
          ? `${module.name} (${module.code})`
          : module.name;
        filterModule.appendChild(option);
      });
    }
  }

  async function refreshTasks() {
    const response = await apiFetch("/tasks/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load tasks");
      return;
    }

    const tasks = await parseJsonSafe(response);

    if (!tasksList) return;

    let visibleTasks = tasks || [];

    const statusValue = filterStatus ? filterStatus.value : "";
    const moduleValue = filterModule ? filterModule.value : "";

    if (statusValue) {
      visibleTasks = visibleTasks.filter((task) => task.status === statusValue);
    }

    if (moduleValue) {
      const moduleIdNum = Number(moduleValue);
      visibleTasks = visibleTasks.filter((task) => task.module_id === moduleIdNum);
    }

    tasksList.innerHTML = "";

    if (!visibleTasks || visibleTasks.length === 0) {
      tasksList.innerHTML = "<li>No tasks found.</li>";
      return;
    }

    visibleTasks.forEach((task) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${escapeHtml(task.title)}</strong>
        ${task.description ? `<br>${escapeHtml(task.description)}` : ""}
        <br>Status: ${escapeHtml(task.status)}
        <br>Priority: ${escapeHtml(task.priority)}
        ${task.due_date ? `<br>Due: ${escapeHtml(formatDateOnly(task.due_date))}` : ""}
        ${task.is_exam ? `<br>Exam task: Yes` : ""}
        <div class="task-actions">
          ${
            task.status !== "done"
              ? `<button class="complete-btn" data-action="complete" data-task-id="${task.id}">Mark complete</button>`
              : `<button class="reopen-btn" data-action="reopen" data-task-id="${task.id}">Reopen</button>`
          }
          <button class="delete-btn" data-action="delete" data-task-id="${task.id}">Delete</button>
        </div>
      `;

      tasksList.appendChild(li);
    });

    tasksList.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const taskId = button.getAttribute("data-task-id");
        const action = button.getAttribute("data-action");

        try {
          let response;

          if (action === "complete") {
            response = await apiFetch(`/tasks/${taskId}/complete`, {
              method: "PATCH",
            });
          }

          if (action === "reopen") {
            response = await apiFetch(`/tasks/${taskId}/reopen`, {
              method: "PATCH",
            });
          }

          if (action === "delete") {
            const confirmed = window.confirm("Delete this task?");
            if (!confirmed) return;

            response = await apiFetch(`/tasks/${taskId}`, {
              method: "DELETE",
            });
          }

          if (!response) return;

          if (!response.ok) {
            const data = await parseJsonSafe(response);
            alert(data?.detail || "Could not update task");
            return;
          }

          await refreshTasks();
        } catch (error) {
          console.error(error);
          alert("Something went wrong updating the task");
        }
      });
    });
  }

  try {
    await loadModulesIntoTaskSelect();
    await refreshTasks();

    if (filterStatus) {
      filterStatus.addEventListener("change", refreshTasks);
    }

    if (filterModule) {
      filterModule.addEventListener("change", refreshTasks);
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

        const response = await apiFetch("/tasks/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

        if (!response) return;

        const data = await parseJsonSafe(response);

        if (!response.ok) {
          alert(data?.detail || "Could not create task");
          return;
        }

        taskForm.reset();
        await refreshTasks();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   DEADLINES
========================= */

async function loadDeadlinesPage() {
  const token = requireAuth();
  if (!token) return;

  const deadlinesList = document.getElementById("deadlines-list");
  const deadlineForm = document.getElementById("create-deadline-form");
  const moduleSelect = document.getElementById("deadline_module_id");

  async function loadModulesIntoDeadlineSelect() {
    if (!moduleSelect) return;

    const response = await apiFetch("/modules/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load modules");
      return;
    }

    const modules = await parseJsonSafe(response);

    moduleSelect.innerHTML = '<option value="">No module</option>';

    (modules || []).forEach((module) => {
      const option = document.createElement("option");
      option.value = module.id;
      option.textContent = module.code
        ? `${module.name} (${module.code})`
        : module.name;
      moduleSelect.appendChild(option);
    });
  }

  async function refreshDeadlines() {
    const response = await apiFetch("/deadlines/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load deadlines");
      return;
    }

    const deadlines = await parseJsonSafe(response);

    if (!deadlinesList) return;

    deadlinesList.innerHTML = "";

    if (!deadlines || deadlines.length === 0) {
      deadlinesList.innerHTML = "<li>No deadlines found.</li>";
      return;
    }

    deadlines.forEach((deadline) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${escapeHtml(deadline.title)}</strong>
        <br>Type: ${escapeHtml(deadline.deadline_type)}
        <br>Due: ${escapeHtml(formatDateTime(deadline.due_at))}
        ${deadline.notes ? `<br>${escapeHtml(deadline.notes)}` : ""}
        <div class="task-actions">
          <button class="delete-btn" data-deadline-id="${deadline.id}">Delete</button>
        </div>
      `;

      deadlinesList.appendChild(li);
    });

    deadlinesList.querySelectorAll("button[data-deadline-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const deadlineId = button.getAttribute("data-deadline-id");
        const confirmed = window.confirm("Delete this deadline?");
        if (!confirmed) return;

        try {
          const response = await apiFetch(`/deadlines/${deadlineId}`, {
            method: "DELETE",
          });

          if (!response) return;

          if (!response.ok) {
            const data = await parseJsonSafe(response);
            alert(data?.detail || "Could not delete deadline");
            return;
          }

          await refreshDeadlines();
        } catch (error) {
          console.error(error);
          alert("Something went wrong deleting the deadline");
        }
      });
    });
  }

  try {
    await loadModulesIntoDeadlineSelect();
    await refreshDeadlines();

    if (deadlineForm) {
      deadlineForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.getElementById("deadline_title").value.trim();
        const deadlineType = document.getElementById("deadline_type").value;
        const dueAt = document.getElementById("deadline_due_at").value;
        const moduleId = document.getElementById("deadline_module_id").value;
        const notes = document.getElementById("deadline_notes").value.trim();

        if (!title || !dueAt) {
          alert("Title and due date are required");
          return;
        }

        const dueAtIso = new Date(dueAt).toISOString();

        const response = await apiFetch("/deadlines/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            deadline_type: deadlineType,
            due_at: dueAtIso,
            notes: notes || null,
            module_id: moduleId ? Number(moduleId) : null,
          }),
        });

        if (!response) return;

        const data = await parseJsonSafe(response);

        if (!response.ok) {
          alert(data?.detail || "Could not create deadline");
          return;
        }

        deadlineForm.reset();
        await refreshDeadlines();
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   STUDY SESSIONS
========================= */

async function loadStudySessionsPage() {
  const token = requireAuth();
  if (!token) return;

  const form = document.getElementById("create-study-session-form");
  const sessionsList = document.getElementById("study-sessions-list");
  const moduleSelect = document.getElementById("study_session_module_id");
  const titleInput = document.getElementById("study_session_title");
  const notesInput = document.getElementById("study_session_notes");
  const statusText = document.getElementById("study-session-status");
  const elapsedText = document.getElementById("study-session-elapsed");
  const startButton = document.getElementById("start-study-session-btn");
  const stopButton = document.getElementById("stop-study-session-btn");

  function updateStudyTimerDisplay() {
    if (!elapsedText) return;

    if (!activeStudySessionStart) {
      elapsedText.textContent = "00:00:00";
      return;
    }

    const now = new Date();
    const elapsedSeconds = Math.floor((now - activeStudySessionStart) / 1000);
    elapsedText.textContent = formatElapsed(elapsedSeconds);
  }

  function setStudySessionRunningState(isRunning) {
    if (statusText) {
      statusText.textContent = isRunning ? "Running" : "Not running";
    }

    if (startButton) {
      startButton.disabled = isRunning;
    }

    if (stopButton) {
      stopButton.disabled = !isRunning;
    }
  }

  function startStudyTimer() {
    if (activeStudySessionTimer) {
      clearInterval(activeStudySessionTimer);
    }

    activeStudySessionTimer = setInterval(updateStudyTimerDisplay, 1000);
    updateStudyTimerDisplay();
  }

  function stopStudyTimer() {
    if (activeStudySessionTimer) {
      clearInterval(activeStudySessionTimer);
      activeStudySessionTimer = null;
    }
  }

  async function loadModulesIntoStudySessionSelect() {
    if (!moduleSelect) return;

    const response = await apiFetch("/modules/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load modules");
      return;
    }

    const modules = await parseJsonSafe(response);

    moduleSelect.innerHTML = '<option value="">No module</option>';

    (modules || []).forEach((module) => {
      const option = document.createElement("option");
      option.value = module.id;
      option.textContent = module.code
        ? `${module.name} (${module.code})`
        : module.name;
      moduleSelect.appendChild(option);
    });
  }

  async function refreshStudySessions() {
    const response = await apiFetch("/study-sessions/");

    if (!response) return;

    if (!response.ok) {
      console.error("Failed to load study sessions");
      return;
    }

    const sessions = await parseJsonSafe(response);

    if (!sessionsList) return;

    sessionsList.innerHTML = "";

    if (!sessions || sessions.length === 0) {
      sessionsList.innerHTML = "<li>No study sessions yet.</li>";
      return;
    }

    sessions.forEach((session) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${escapeHtml(session.title)}</strong>
        <br>Duration: ${escapeHtml(String(session.duration_minutes))} minute(s)
        <br>Started: ${escapeHtml(formatDateTime(session.started_at))}
        <br>Ended: ${escapeHtml(formatDateTime(session.ended_at))}
        ${session.notes ? `<br>${escapeHtml(session.notes)}` : ""}
        <div class="task-actions">
          <button class="delete-btn" data-study-session-id="${session.id}">Delete</button>
        </div>
      `;

      sessionsList.appendChild(li);
    });

    sessionsList.querySelectorAll("button[data-study-session-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const sessionId = button.getAttribute("data-study-session-id");
        const confirmed = window.confirm("Delete this study session?");
        if (!confirmed) return;

        try {
          const response = await apiFetch(`/study-sessions/${sessionId}`, {
            method: "DELETE",
          });

          if (!response) return;

          if (!response.ok) {
            const data = await parseJsonSafe(response);
            alert(data?.detail || "Could not delete study session");
            return;
          }

          await refreshStudySessions();
        } catch (error) {
          console.error(error);
          alert("Something went wrong deleting the study session");
        }
      });
    });
  }

  try {
    await loadModulesIntoStudySessionSelect();
    await refreshStudySessions();

    setStudySessionRunningState(false);
    updateStudyTimerDisplay();

    if (startButton) {
      startButton.addEventListener("click", () => {
        const title = titleInput ? titleInput.value.trim() : "";

        if (!title) {
          alert("Enter a session title before starting");
          return;
        }

        if (activeStudySessionStart) {
          return;
        }

        activeStudySessionStart = new Date();
        setStudySessionRunningState(true);
        startStudyTimer();
      });
    }

    if (stopButton) {
      stopButton.addEventListener("click", async () => {
        if (!activeStudySessionStart) {
          alert("Start a session first");
          return;
        }

        const endedAt = new Date();
        const startedAt = activeStudySessionStart;

        const title = titleInput ? titleInput.value.trim() : "";
        const notes = notesInput ? notesInput.value.trim() : "";
        const moduleId = moduleSelect ? moduleSelect.value : "";

        if (!title) {
          alert("Session title is required");
          return;
        }

        try {
          const response = await apiFetch("/study-sessions/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              notes: notes || null,
              module_id: moduleId ? Number(moduleId) : null,
              started_at: startedAt.toISOString(),
              ended_at: endedAt.toISOString(),
            }),
          });

          if (!response) return;

          const data = await parseJsonSafe(response);

          if (!response.ok) {
            alert(data?.detail || "Could not save study session");
            return;
          }

          activeStudySessionStart = null;
          stopStudyTimer();
          setStudySessionRunningState(false);
          updateStudyTimerDisplay();

          if (form) {
            form.reset();
          }

          await loadModulesIntoStudySessionSelect();
          await refreshStudySessions();
        } catch (error) {
          console.error(error);
          alert("Something went wrong saving the study session");
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   PAGE ROUTING
========================= */

if (window.location.pathname === "/") {
  loadDashboard();
}

if (window.location.pathname === "/tasks-page") {
  loadTasksPage();
}

if (window.location.pathname === "/modules-page") {
  loadModulesPage();
}

if (window.location.pathname === "/deadlines-page") {
  loadDeadlinesPage();
}

if (window.location.pathname === "/study-sessions-page") {
  loadStudySessionsPage();
}