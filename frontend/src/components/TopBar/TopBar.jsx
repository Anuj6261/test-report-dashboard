import { useMemo } from "react";
import "./TopBar.css";

function TopBar({ currentDirectoryPath, onDirectoryNavigate, viewMode, onViewToggle }) {
  const isRoot = currentDirectoryPath === "/";

  // Split safely on both / and \ to handle remote Windows-style network paths natively
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

  // Navigate directly to the parent directory container (one level up)
  function handleBack() {
    const parts = (currentDirectoryPath || "/").split(/[\/\\]/).filter(Boolean);
    parts.pop(); // Remove the deepest directory node
    const parentPath = parts.length === 0 ? "/" : "/" + parts.join("/");
    onDirectoryNavigate(parentPath);
  }

  function handleToggle() {
    onViewToggle(viewMode === "grid" ? "list" : "grid");
  }

  return (
    <nav className="topbar">
      <div className="topbar-left">
        {!isRoot && (
          <button className="back-btn" onClick={handleBack} title="Go up one folder">
            ← Back
          </button>
        )}
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}

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

      <button className="view-toggle-btn" onClick={handleToggle}>
        {viewMode === "grid" ? "☰ List View" : "⊞ Grid View"}
      </button>
    </nav>
  );
}

export default TopBar;
