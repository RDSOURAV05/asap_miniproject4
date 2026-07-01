import React from "react";

export default function Navbar({ activeTab, setActiveTab, apiMode, serverOnline }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "employees", label: "Employees", icon: "👥" },
    { id: "tasks", label: "Tasks & Board", icon: "📋" }
  ];

  return (
    <header className="glass-panel" style={{
      margin: "1.5rem 1.5rem 0 1.5rem",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 100,
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          fontSize: "1.8rem",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "800",
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: "-0.03em"
        }}>
          ASAP
        </div>
        <div style={{
          height: "20px",
          width: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.15)"
        }} />
        <span style={{
          fontSize: "0.85rem",
          fontWeight: "500",
          color: "var(--text-secondary)",
          letterSpacing: "0.05em",
          textTransform: "uppercase"
        }}>
          Task Space
        </span>
      </div>

      <nav style={{ display: "flex", gap: "0.5rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              background: activeTab === tab.id ? "rgba(255,255,255,0.06)" : "transparent",
              border: activeTab === tab.id ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              transition: "all 0.2s"
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <a 
          href="https://github.com/RDSOURAV05/asap_miniproject4" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderRadius: "20px",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.08)",
            height: "fit-content"
          }}
        >
          <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </a>

        <div className="status-widget" style={{ position: "static" }}>
          <div className={`status-indicator ${serverOnline ? "online" : "offline"}`} />
          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>
            {apiMode === "server" ? "Live Server" : "Local Demo (Offline)"}
          </span>
        </div>
      </div>
    </header>
  );
}
