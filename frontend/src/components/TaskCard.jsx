import React from "react";

export default function TaskCard({ task, employees, onUpdateStatus, onDelete }) {
  // Find employee name
  const employee = employees.find(emp => emp.id === task.employee_id);
  const assigneeName = employee ? employee.name : "Unassigned";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={`task-card glass-panel card-${task.status.toLowerCase()}`}>
      <div className="task-card-header">
        <h4 className="task-title" style={{
          color: task.status === "Completed" ? "var(--text-secondary)" : "var(--text-primary)",
          textDecoration: task.status === "Completed" ? "line-through" : "none"
        }}>
          {task.title}
        </h4>
        <span className={`priority-badge prio-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      <p className="task-desc" style={{
        color: task.status === "Completed" ? "var(--text-muted)" : "var(--text-secondary)"
      }}>
        {task.description || "No description provided."}
      </p>

      <div className="task-footer">
        <div className="task-assignee">
          <div className="assignee-avatar-mini">
            {getInitials(assigneeName)}
          </div>
          <span>{assigneeName}</span>
        </div>

        <div className="task-date">
          <span>📅</span>
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "0.5rem",
        paddingTop: "0.5rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.04)"
      }}>
        {/* Status Stepper Controls */}
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {task.status !== "Assigned" && (
            <button
              onClick={() => onUpdateStatus(task.id, "Assigned")}
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "4px" }}
              title="Mark as Assigned"
            >
              🔄 Reopen
            </button>
          )}
          {task.status === "Assigned" && (
            <button
              onClick={() => onUpdateStatus(task.id, "Updated")}
              className="btn btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: "4px",
                borderColor: "rgba(245, 158, 11, 0.3)",
                color: "var(--status-updated)"
              }}
              title="Mark as In Progress"
            >
              ⚡ Start
            </button>
          )}
          {task.status !== "Completed" && (
            <button
              onClick={() => onUpdateStatus(task.id, "Completed")}
              className="btn btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: "4px",
                borderColor: "rgba(16, 185, 129, 0.3)",
                color: "var(--status-completed)"
              }}
              title="Mark as Completed"
            >
              ✓ Complete
            </button>
          )}
        </div>

        {/* Delete Record Control */}
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
              onDelete(task.id);
            }
          }}
          className="btn btn-danger"
          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "4px" }}
          title="Delete Task Record"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
