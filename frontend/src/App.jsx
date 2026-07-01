import React, { useState, useEffect } from "react";
import { api, checkBackendStatus } from "./api";
import Navbar from "./components/Navbar";
import Timeline from "./components/Timeline";
import Modal from "./components/Modal";
import EmployeeCard from "./components/EmployeeCard";
import TaskCard from "./components/TaskCard";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // System states
  const [serverOnline, setServerOnline] = useState(false);
  const [apiMode, setApiMode] = useState("localstorage");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal open states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    department: "",
    role: ""
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    employee_id: "",
    priority: "Medium",
    due_date: "",
    status: "Assigned"
  });

  // Filter states
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Check backend server availability and fetch data
  const initApp = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    try {
      const status = await checkBackendStatus();
      setServerOnline(status.online);
      setApiMode(status.mode);
      
      // Load all data
      const emps = await api.getEmployees();
      const tsks = await api.getTasks();
      const activityLogs = await api.getActivityLogs();
      
      setEmployees(emps);
      setTasks(tsks);
      setLogs(activityLogs);
    } catch (err) {
      showError("Connection error. Fetching data from local storage instead.");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  useEffect(() => {
    initApp(true);

    // Periodic status pinger
    const interval = setInterval(async () => {
      const status = await checkBackendStatus();
      const prevMode = apiMode;
      
      setServerOnline(status.online);
      setApiMode(status.mode);
      
      // If server came back online, sync data
      if (status.mode === "server" && prevMode === "localstorage") {
        showSuccess("Connected to FastAPI Backend Server!");
        // Re-load data from server
        const emps = await api.getEmployees();
        const tsks = await api.getTasks();
        const activityLogs = await api.getActivityLogs();
        setEmployees(emps);
        setTasks(tsks);
        setLogs(activityLogs);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [apiMode]);

  // Operations
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email) {
      showError("Please provide name and email.");
      return;
    }

    try {
      await api.createEmployee(employeeForm);
      showSuccess(`Employee "${employeeForm.name}" added successfully.`);
      setIsEmployeeModalOpen(false);
      setEmployeeForm({ name: "", email: "", department: "", role: "" });
      initApp(); // Refresh lists
    } catch (err) {
      showError(err.message || "Failed to add employee.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.employee_id) {
      showError("Please specify a task title and assign an employee.");
      return;
    }

    try {
      await api.createTask({
        ...taskForm,
        employee_id: Number(taskForm.employee_id)
      });
      showSuccess(`Task "${taskForm.title}" assigned successfully.`);
      setIsTaskModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        employee_id: "",
        priority: "Medium",
        due_date: "",
        status: "Assigned"
      });
      initApp(); // Refresh lists
    } catch (err) {
      showError(err.message || "Failed to create task.");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      showSuccess(`Task status updated to ${newStatus}.`);
      initApp();
    } catch (err) {
      showError(err.message || "Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      showSuccess("Task deleted successfully.");
      initApp();
    } catch (err) {
      showError(err.message || "Failed to delete task.");
    }
  };

  // Dashboard calculations
  const totalEmployees = employees.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const searchLower = employeeSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchLower) ||
      (emp.role && emp.role.toLowerCase().includes(searchLower)) ||
      (emp.department && emp.department.toLowerCase().includes(searchLower))
    );
  });

  // Filter tasks for Board
  const filteredTasks = tasks.filter(task => {
    const matchesAssignee = taskAssigneeFilter === "all" || task.employee_id === Number(taskAssigneeFilter);
    const matchesPriority = taskPriorityFilter === "all" || task.priority === taskPriorityFilter;
    return matchesAssignee && matchesPriority;
  });

  const tasksByStatus = {
    Assigned: filteredTasks.filter(t => t.status === "Assigned"),
    Updated: filteredTasks.filter(t => t.status === "Updated"),
    Completed: filteredTasks.filter(t => t.status === "Completed")
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiMode={apiMode} 
        serverOnline={serverOnline}
      />

      <main className="main-content">
        {/* Banner Messages */}
        {errorMsg && (
          <div className="alert-banner alert-error">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
        )}
        {successMsg && (
          <div className="alert-banner alert-success">
            <span>✨ {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", flexDirection: "column", gap: "1rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255, 255, 255, 0.1)",
              borderTop: "4px solid var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <span style={{ color: "var(--text-secondary)" }}>Initializing workspace...</span>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div>
                <h1 style={{ marginBottom: "0.25rem" }}>Work Space Overview</h1>
                <p className="subtitle">Real-time team performance metrics and audit trails.</p>

                {/* Stats cards */}
                <div className="stats-grid">
                  <div className="glass-panel stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <span className="stat-label">Total Team</span>
                      <span className="stat-value">{totalEmployees}</span>
                    </div>
                  </div>
                  <div className="glass-panel stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <span className="stat-label">Tasks Created</span>
                      <span className="stat-value">{totalTasks}</span>
                    </div>
                  </div>
                  <div className="glass-panel stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                      <span className="stat-label">Pending</span>
                      <span className="stat-value">{pendingTasks}</span>
                    </div>
                  </div>
                  <div className="glass-panel stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <span className="stat-label">Completion</span>
                      <span className="stat-value">{completionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard layout split */}
                <div className="dashboard-layout">
                  {/* Left Column: Quick Actions & Overview */}
                  <div className="glass-panel section-card">
                    <h3 className="section-title">🚀 Welcome to ASAP Workspace</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                      Manage operations, allocate assignments, track task states, and audit employee workflows.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setIsEmployeeModalOpen(true)}
                      >
                        ➕ Add Employee
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setIsTaskModalOpen(true)}
                        disabled={employees.length === 0}
                      >
                        ✏️ Assign Task
                      </button>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      <h4 style={{ fontSize: "0.95rem", marginBottom: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Task State Allocations
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                            <span>Assigned (New)</span>
                            <span>{tasks.filter(t => t.status === "Assigned").length} tasks</span>
                          </div>
                          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                            <div style={{
                              height: "100%",
                              background: "var(--status-assigned)",
                              borderRadius: "3px",
                              width: `${totalTasks > 0 ? (tasks.filter(t => t.status === "Assigned").length / totalTasks) * 100 : 0}%`
                            }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                            <span>Updated (In Progress)</span>
                            <span>{tasks.filter(t => t.status === "Updated").length} tasks</span>
                          </div>
                          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                            <div style={{
                              height: "100%",
                              background: "var(--status-updated)",
                              borderRadius: "3px",
                              width: `${totalTasks > 0 ? (tasks.filter(t => t.status === "Updated").length / totalTasks) * 100 : 0}%`
                            }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                            <span>Completed</span>
                            <span>{completedTasks} tasks</span>
                          </div>
                          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                            <div style={{
                              height: "100%",
                              background: "var(--status-completed)",
                              borderRadius: "3px",
                              width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timeline Log */}
                  <div className="glass-panel section-card" style={{ maxHeight: "560px" }}>
                    <h3 className="section-title">⏱️ Activity Audit Log</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                      Chronological history tracking the employee-to-task workflow sequence.
                    </p>
                    <Timeline logs={logs} />
                  </div>
                </div>
              </div>
            )}

            {/* 2. EMPLOYEES GRID VIEW */}
            {activeTab === "employees" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                  <div>
                    <h1>Team Members</h1>
                    <p className="subtitle">Register and oversee your staff roster.</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEmployeeModalOpen(true)}
                  >
                    ➕ Add Employee
                  </button>
                </div>

                <div className="header-actions">
                  <input
                    type="text"
                    placeholder="🔍 Search name, role, department..."
                    className="search-input"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{ width: "300px" }}
                  />
                </div>

                {filteredEmployees.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No Employees Found</div>
                    <div className="empty-state-desc">
                      {employeeSearch ? "No matches for your search term." : "Start by adding a new employee to your organization."}
                    </div>
                  </div>
                ) : (
                  <div className="employee-grid">
                    {filteredEmployees.map(emp => (
                      <EmployeeCard key={emp.id} employee={emp} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. KANBAN TASK BOARD */}
            {activeTab === "tasks" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
                  <div>
                    <h1>Task Space Board</h1>
                    <p className="subtitle">Assign and follow-up on specific deliverables.</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsTaskModalOpen(true)}
                    disabled={employees.length === 0}
                    title={employees.length === 0 ? "Add employees first" : "Create new task"}
                  >
                    ➕ Assign Task
                  </button>
                </div>

                {/* Filters */}
                <div className="header-actions" style={{ flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Filter by Assignee</span>
                    <select
                      className="form-select"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.03)" }}
                      value={taskAssigneeFilter}
                      onChange={(e) => setTaskAssigneeFilter(e.target.value)}
                    >
                      <option value="all">All Assignees</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Filter by Priority</span>
                    <select
                      className="form-select"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.03)" }}
                      value={taskPriorityFilter}
                      onChange={(e) => setTaskPriorityFilter(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {employees.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No Assignees Registered</div>
                    <div className="empty-state-desc">You must register at least one employee in the "Employees" tab before assigning tasks.</div>
                  </div>
                ) : (
                  <div className="kanban-board">
                    {/* Column 1: Assigned */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <div className="column-title">
                          <div className="column-dot col-assigned" />
                          <span>Assigned</span>
                        </div>
                        <span className="column-count">{tasksByStatus.Assigned.length}</span>
                      </div>
                      <div className="column-cards-container">
                        {tasksByStatus.Assigned.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0", fontStyle: "italic" }}>
                            No new tasks.
                          </div>
                        ) : (
                          tasksByStatus.Assigned.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              employees={employees}
                              onUpdateStatus={handleUpdateTaskStatus}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Column 2: Updated (In Progress) */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <div className="column-title">
                          <div className="column-dot col-updated" />
                          <span>Updated (In Progress)</span>
                        </div>
                        <span className="column-count">{tasksByStatus.Updated.length}</span>
                      </div>
                      <div className="column-cards-container">
                        {tasksByStatus.Updated.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0", fontStyle: "italic" }}>
                            No tasks in progress.
                          </div>
                        ) : (
                          tasksByStatus.Updated.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              employees={employees}
                              onUpdateStatus={handleUpdateTaskStatus}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Column 3: Completed */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <div className="column-title">
                          <div className="column-dot col-completed" />
                          <span>Completed</span>
                        </div>
                        <span className="column-count">{tasksByStatus.Completed.length}</span>
                      </div>
                      <div className="column-cards-container">
                        {tasksByStatus.Completed.length === 0 ? (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0", fontStyle: "italic" }}>
                            No completed tasks.
                          </div>
                        ) : (
                          tasksByStatus.Completed.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              employees={employees}
                              onUpdateStatus={handleUpdateTaskStatus}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD EMPLOYEE MODAL */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddEmployee}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. John Doe"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. john.doe@asap.org"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Engineering, Sales"
              value={employeeForm.department}
              onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Frontend Engineer"
              value={employeeForm.role}
              onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsEmployeeModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TASK MODAL */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Assign Deliverable"
      >
        <form onSubmit={handleAddTask}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Design Landing Page"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Detail the expectations and goals..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select
              required
              className="form-select"
              value={taskForm.employee_id}
              onChange={(e) => setTaskForm({ ...taskForm, employee_id: e.target.value })}
            >
              <option value="" disabled>Select Team Member</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department || "General"})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
