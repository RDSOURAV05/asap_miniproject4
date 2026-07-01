const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Helper to determine if we should use local storage fallback
let useLocalStorageFallback = true;

// Mock initial data if localStorage is empty
const defaultEmployees = [];
const defaultTasks = [];
const defaultLogs = [];

// Initialize LocalStorage if needed
const initLocalStorage = () => {
  if (!localStorage.getItem("asap_employees")) {
    localStorage.setItem("asap_employees", JSON.stringify(defaultEmployees));
  }
  if (!localStorage.getItem("asap_tasks")) {
    localStorage.setItem("asap_tasks", JSON.stringify(defaultTasks));
  }
  if (!localStorage.getItem("asap_activity_logs")) {
    localStorage.setItem("asap_activity_logs", JSON.stringify(defaultLogs));
  }
};

// Check if backend is available
export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      useLocalStorageFallback = false;
      return { online: true, mode: "server" };
    }
  } catch (err) {
    // Fallback to local storage if offline
  }
  useLocalStorageFallback = true;
  initLocalStorage();
  return { online: false, mode: "localstorage" };
};

// Core LocalStorage CRUD Engines
const lsGet = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const lsSet = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const lsLogActivity = (employeeId, taskId, action, details) => {
  const logs = lsGet("asap_activity_logs");
  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    employee_id: employeeId,
    task_id: taskId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  lsSet("asap_activity_logs", [newLog, ...logs]);
  return newLog;
};

// API Methods
export const api = {
  // Check Mode
  isLocalStorageMode: () => useLocalStorageFallback,

  // Employees
  getEmployees: async () => {
    if (useLocalStorageFallback) {
      const employees = lsGet("asap_employees");
      const tasks = lsGet("asap_tasks");
      // Map tasks to employees
      return employees.map(emp => ({
        ...emp,
        tasks: tasks.filter(t => t.employee_id === emp.id)
      }));
    }
    const response = await fetch(`${API_BASE_URL}/employees/`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    return response.json();
  },

  createEmployee: async (employeeData) => {
    if (useLocalStorageFallback) {
      const employees = lsGet("asap_employees");
      // Check duplicate email
      if (employees.some(emp => emp.email.toLowerCase() === employeeData.email.toLowerCase())) {
        throw new Error("An employee with this email already exists.");
      }
      const newEmployee = {
        id: Date.now(),
        ...employeeData,
        created_at: new Date().toISOString(),
        tasks: []
      };
      lsSet("asap_employees", [...employees, newEmployee]);
      lsLogActivity(newEmployee.id, null, "employee_added", `Employee ${newEmployee.name} was added to the system.`);
      return newEmployee;
    }

    const response = await fetch(`${API_BASE_URL}/employees/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to create employee");
    }
    return response.json();
  },

  // Tasks
  getTasks: async () => {
    if (useLocalStorageFallback) {
      return lsGet("asap_tasks");
    }
    const response = await fetch(`${API_BASE_URL}/tasks/`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  createTask: async (taskData) => {
    if (useLocalStorageFallback) {
      const tasks = lsGet("asap_tasks");
      const employees = lsGet("asap_employees");
      const emp = employees.find(e => e.id === Number(taskData.employee_id));
      if (!emp) throw new Error("Assigned employee does not exist.");

      const newTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || "Assigned",
        priority: taskData.priority || "Medium",
        due_date: taskData.due_date || null,
        employee_id: Number(taskData.employee_id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      lsSet("asap_tasks", [...tasks, newTask]);
      lsLogActivity(
        newTask.employee_id,
        newTask.id,
        "task_assigned",
        `Task '${newTask.title}' was assigned to ${emp.name}.`
      );
      return newTask;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to create task");
    }
    return response.json();
  },

  updateTaskStatus: async (taskId, status) => {
    if (useLocalStorageFallback) {
      const tasks = lsGet("asap_tasks");
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      const oldStatus = tasks[taskIndex].status;
      if (oldStatus === status) return tasks[taskIndex];

      tasks[taskIndex].status = status;
      tasks[taskIndex].updated_at = new Date().toISOString();
      lsSet("asap_tasks", tasks);

      const action = status === "Completed" ? "task_completed" : "task_updated";
      const details = status === "Completed"
        ? `Task '${tasks[taskIndex].title}' was completed.`
        : `Task '${tasks[taskIndex].title}' status was updated to ${status}.`;

      lsLogActivity(tasks[taskIndex].employee_id, taskId, action, details);
      return tasks[taskIndex];
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to update task status");
    }
    return response.json();
  },

  updateTask: async (taskId, taskData) => {
    if (useLocalStorageFallback) {
      const tasks = lsGet("asap_tasks");
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) throw new Error("Task not found");

      const oldStatus = tasks[taskIndex].status;
      const updatedTask = {
        ...tasks[taskIndex],
        ...taskData,
        updated_at: new Date().toISOString()
      };

      tasks[taskIndex] = updatedTask;
      lsSet("asap_tasks", tasks);

      if (taskData.status && oldStatus !== taskData.status) {
        const action = taskData.status === "Completed" ? "task_completed" : "task_updated";
        const details = taskData.status === "Completed"
          ? `Task '${updatedTask.title}' was completed.`
          : `Task '${updatedTask.title}' status was updated to ${taskData.status}.`;
        lsLogActivity(updatedTask.employee_id, taskId, action, details);
      } else {
        lsLogActivity(updatedTask.employee_id, taskId, "task_updated", `Task '${updatedTask.title}' details were updated.`);
      }

      return updatedTask;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to update task");
    }
    return response.json();
  },

  deleteTask: async (taskId) => {
    if (useLocalStorageFallback) {
      const tasks = lsGet("asap_tasks");
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) throw new Error("Task not found");

      const filteredTasks = tasks.filter(t => t.id !== taskId);
      lsSet("asap_tasks", filteredTasks);

      lsLogActivity(
        taskToDelete.employee_id,
        null,
        "task_deleted",
        `Task '${taskToDelete.title}' was deleted from the system.`
      );
      return true;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to delete task");
    }
    return true;
  },

  // Activity Logs
  getActivityLogs: async () => {
    if (useLocalStorageFallback) {
      return lsGet("asap_activity_logs");
    }
    const response = await fetch(`${API_BASE_URL}/activity-logs/`);
    if (!response.ok) throw new Error("Failed to fetch activity logs");
    return response.json();
  }
};
