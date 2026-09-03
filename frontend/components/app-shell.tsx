"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardPlus,
  UploadCloud,
  FileText,
  Activity,
  BrainCircuit,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navSections = [
  {
    title: "Clinical Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "New Assessment", href: "/new-analysis", icon: ClipboardPlus },
      { name: "Upload Report", href: "/upload", icon: UploadCloud },
      { name: "Medical Reports", href: "/reports", icon: FileText },
      { name: "Health History", href: "/history", icon: Activity },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { name: "AI Health Assistant", href: "/assistant", icon: BrainCircuit },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Settings & Profile", href: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, isSignedIn, loading: authLoading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace("/login");
    }
  }, [authLoading, isSignedIn, router]);

  if (authLoading || !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Checking your session…
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Patient";

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* Desktop Medical Dark Navy Sidebar */}
      <aside className="app-sidebar">
        <Link href="/dashboard" className="brand-mark">
          <span className="brand-logo-icon">✚</span>
          <div>
            <div style={{ lineHeight: 1.15, fontSize: "1.1rem" }}>HealthLens AI</div>
            <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "#94A3B8" }}>
              Clinical Intelligence
            </div>
          </div>
        </Link>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = path === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`side-link ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User profile & Sign out */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{userInitial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">Patient Portal</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="app-main-wrapper">
        {/* Mobile Header */}
        <header className="mobile-app-header">
          <Link href="/dashboard" className="brand-mark" style={{ color: "#FFFFFF" }}>
            <span className="brand-logo-icon" style={{ width: 28, height: 28, fontSize: "0.95rem" }}>
              ✚
            </span>
            <span style={{ fontSize: "1rem" }}>HealthLens AI</span>
          </Link>
          <button
            aria-label="Toggle navigation menu"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {open && (
          <div className="mobile-app-drawer">
            {navSections.map((section) => (
              <div key={section.title} style={{ marginBottom: 12 }}>
                <div className="sidebar-section-title" style={{ padding: "4px 0" }}>
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = path === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`side-link ${isActive ? "active" : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <button
              onClick={handleSignOut}
              className="button button-danger"
              style={{ width: "100%", marginTop: 8 }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}

        {/* Main Workspace Content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
