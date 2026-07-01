import React from "react";

export default function EmployeeCard({ employee }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const tasks = employee.tasks || [];
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="employee-card glass-panel">
      <div className="employee-header">
        <div className="employee-avatar">
          {getInitials(employee.name)}
        </div>
        <div className="employee-meta">
          <h4 className="employee-name">{employee.name}</h4>
          <span className="employee-role">{employee.role || "Team Member"}</span>
        </div>
      </div>

      <div className="employee-details">
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value" style={{ wordBreak: "break-all" }}>{employee.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Department:</span>
          <span className="detail-value">{employee.department || "General"}</span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
        textAlign: "center",
        marginTop: "0.25rem"
      }}>
        <div style={{
          padding: "0.5rem",
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.1)",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Completed</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--status-completed)" }}>{completedTasks}</div>
        </div>
        <div style={{
          padding: "0.5rem",
          background: "rgba(59, 130, 246, 0.05)",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Pending</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--status-assigned)" }}>{pendingTasks}</div>
        </div>
      </div>

      <div style={{ marginTop: "0.25rem" }}>
        <div style={{
          fontSize: "0.8rem",
          fontWeight: "600",
          color: "var(--text-secondary)",
          marginBottom: "0.5rem"
        }}>
          Current Tasks ({tasks.length})
        </div>
        {tasks.length === 0 ? (
          <div style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            padding: "0.25rem 0"
          }}>
            No tasks assigned.
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            maxHeight: "100px",
            overflowY: "auto",
            paddingRight: "0.2rem"
          }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  padding: "0.3rem 0.5rem",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "4px",
                  borderLeft: `3px solid ${
                    task.status === "Completed" ? "var(--status-completed)" : 
                    task.status === "Updated" ? "var(--status-updated)" : 
                    "var(--status-assigned)"
                  }`
                }}
              >
                <span style={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "150px",
                  color: task.status === "Completed" ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: task.status === "Completed" ? "line-through" : "none"
                }}>
                  {task.title}
                </span>
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  color: 
                    task.status === "Completed" ? "var(--status-completed)" : 
                    task.status === "Updated" ? "var(--status-updated)" : 
                    "var(--status-assigned)"
                }}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
