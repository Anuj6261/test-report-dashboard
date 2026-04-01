import { useMemo } from "react";
import { LayoutDashboard, Grid, List } from "lucide-react";
import "./TopBar.css";

function TopBar({ currentDirectoryPath, onDirectoryNavigate, viewMode, onViewToggle }) {
  const isRoot = currentDirectoryPath === "/";

  // Safely split breadcrumbs on both OS trajectory mappings
  const breadcrumbs = useMemo(() => {
    const parts = (currentDirectoryPath || "/").split(/[\/\\]/).filter(Boolean);
    return [
      { label: "Home", path: "/" },
      ...parts.map((part, index) => ({
        label: part,
        path: "/" + parts.slice(0, index + 1).join("/"),
      })),
    ];
  }, [currentDirectoryPath]);

  function handleBack() {
    const parts = (currentDirectoryPath || "/").split(/[\/\\]/).filter(Boolean);
    parts.pop(); // Pop top boundary
    const parentPath = parts.length === 0 ? "/" : "/" + parts.join("/");
    onDirectoryNavigate(parentPath);
  }

  function handleToggle() {
    onViewToggle(viewMode === "grid" ? "list" : "grid");
  }

  return (
    <nav className="topbar">
      <div className="topbar-left">
        {/* PREMIUM BRANDING LOGO & TITLE */}
        <div className="brand" onClick={() => onDirectoryNavigate("/")} title="Return to Root" style={{ cursor: 'pointer' }}>
          <LayoutDashboard className="brand-logo" size={24} color="#3182ce" />
          <span className="brand-title">Test Reports</span>
        </div>

        {/* OVERFLOW-SAFE SCROLLING WRAPPER */}
        <div className="breadcrumb-wrapper">
          {!isRoot && (
            <button className="back-btn" onClick={handleBack} title="Go up one folder">
              ← Back
            </button>
          )}
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator"> / </span>}

                {index === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current">{crumb.label}</span>
                ) : (
                   <button
                     className="breadcrumb-link"
                     onClick={() => onDirectoryNavigate(crumb.path)}
                   >
                     {crumb.label}
                   </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="view-toggle-btn" onClick={handleToggle} aria-label="Toggle View">
        {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
        <span className="view-toggle-text">{viewMode === "grid" ? "List View" : "Grid View"}</span>
      </button>
    </nav>
  );
}

export default TopBar;
