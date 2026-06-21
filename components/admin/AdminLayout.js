import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { clearAdminSession } from "@/lib/adminSession";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Manage Posts" },
  { href: "/admin/posts/create", label: "Create Post" },
  { href: "/admin/visitors", label: "Site Visitors" },
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  const isActive = (href) => {
    if (href === "/admin/dashboard") return router.pathname === "/admin/dashboard";
    if (href === "/admin/posts/create") return router.pathname === "/admin/posts/create";
    if (href === "/admin/visitors") return router.pathname.startsWith("/admin/visitors");
    if (href === "/admin/users") return router.pathname.startsWith("/admin/users");
    if (href === "/admin/analytics") return router.pathname.startsWith("/admin/analytics");
    return false;
  };

  const navLinkStyle = (href) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    color: isActive(href) ? "#fff" : "rgba(255,255,255,0.8)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive(href) ? "600" : "400",
    backgroundColor: isActive(href) ? "rgba(255,255,255,0.1)" : "transparent",
    borderLeft: isActive(href) ? "3px solid #2563eb" : "3px solid transparent",
  });

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
        <Link
          href="/admin/dashboard"
          style={{ textDecoration: "none" }}
        >
          <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: "600", margin: 0 }}>
            Corp Crunch
          </h3>
          <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>Admin Panel</small>
        </Link>
      </div>
      <nav style={{ padding: "16px 0", flex: 1, minHeight: 0, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            style={navLinkStyle(item.href)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: "16px", flexShrink: 0, marginTop: "auto" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "6px",
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
      }}
    >
      {/* Desktop Sidebar - fixed so it doesn't scroll */}
      <aside
        className="d-none d-md-flex flex-column"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "240px",
          height: "100vh",
          backgroundColor: "#1e293b",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile header + overlay */}
      <div
        className="d-md-none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          backgroundColor: "#1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          ☰
        </button>
        <span style={{ color: "#fff", fontWeight: "600", fontSize: "16px" }}>Corp Crunch</span>
        <div style={{ width: "40px" }} />
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1001,
          }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className="d-md-none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "260px",
          backgroundColor: "#1e293b",
          zIndex: 1002,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
          padding: "70px 0 20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <SidebarContent />
      </div>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "20px",
          marginLeft: 0,
          minWidth: 0,
        }}
        className="admin-main-content admin-main-with-sidebar"
      >
        {(title || actions) && (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "15px 20px",
              borderRadius: "8px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {(title || subtitle) && (
              <div>
                {title && (
                  <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#333", margin: 0 }}>
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <small style={{ color: "#666", fontSize: "12px", display: "block" }}>
                    {subtitle}
                  </small>
                )}
              </div>
            )}
            {actions && <div className="d-flex gap-2 align-items-center flex-wrap">{actions}</div>}
          </div>
        )}
        {children}
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .admin-main-with-sidebar { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .admin-main-content { padding-top: 76px !important; }
        }
      `}} />
    </div>
  );
}
