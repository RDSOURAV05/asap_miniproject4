import React from "react";

export default function Timeline({ logs }) {
  const getActionIcon = (action) => {
    switch (action) {
      case "employee_added": return "👤";
      case "task_assigned": return "📋";
      case "task_updated": return "✏️";
      case "task_completed": return "✅";
      case "task_deleted": return "❌";
      default: return "🔔";
    }
  };

  const getActionLabel = (action) => {
    return action.replace("_", " ");
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "2rem" }}>
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-title">No Activity Yet</div>
        <div className="empty-state-desc">Actions will log here when you manage employees and tasks.</div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {logs.map((log) => (
        <div key={log.id} className="timeline-item">
          <div className={`timeline-dot dot-${log.action}`} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={`timeline-action act-${log.action}`}>
              {getActionIcon(log.action)} {getActionLabel(log.action)}
            </span>
            <span className="timeline-time">{formatTime(log.timestamp)}</span>
          </div>
          <div className="timeline-text">
            {log.details}
          </div>
        </div>
      ))}
    </div>
  );
}
