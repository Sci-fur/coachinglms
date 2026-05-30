import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Video,
  FileCheck,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/enrollments", icon: CreditCard, label: "Enrollments" },
  { to: "/admin/batches", icon: FolderKanban, label: "Batches" },
  { to: "/admin/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/admin/courses", icon: GraduationCap, label: "Courses" },
  { to: "/admin/live-classes", icon: Video, label: "Live Classes" },
  { to: "/admin/exams", icon: FileCheck, label: "Exams" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  return (
    <div className="h-screen flex flex-col bg-[#F4F6F8]">
      {/* Full-width top header */}
      <header className="h-14 shrink-0 bg-white border-b border-[#E8ECF0] flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden -ml-1 text-slate-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base hidden sm:inline text-slate-800">LMS Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="text-xs h-8 border-[#E8ECF0] text-slate-600">
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Student view
          </Button>
          <div className="flex items-center gap-2 pl-3 border-l border-[#E8ECF0]">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium leading-tight text-slate-800">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <Avatar className="h-7 w-7 ring-2 ring-[#E8ECF0]">
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-700" onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-slate-900 overflow-y-auto transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto sidebar-scroll ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-12 px-4 border-b border-slate-800 lg:hidden">
            <span className="font-bold text-sm text-slate-300">Navigation</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3 pt-4 pb-2 border-b border-slate-800 hidden lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
          </div>

          <nav className="p-3 pt-2 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary/15 text-primary-foreground border-l-2 border-primary pl-[10px]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 mt-2 border-t border-slate-800">
            <div className="rounded-lg bg-slate-800/50 p-3">
              <p className="text-xs text-slate-500 font-medium">Need help?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Contact support anytime</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
