import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { LogOut, BookOpen } from "lucide-react";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">LMS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome, {user.name.split(" ")[0]}!</h2>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Email</CardDescription>
              <CardTitle className="text-base truncate">{user.email}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Phone</CardDescription>
              <CardTitle className="text-base">{user.phone || "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Class</CardDescription>
              <CardTitle className="text-base">Class {user.classLevel}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Group</CardDescription>
              <CardTitle className="text-base capitalize">{user.academicGroup === "n/a" ? "N/A" : user.academicGroup}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">Courses coming soon</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Your enrolled courses will appear here once the admin sets them up.
            </CardDescription>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
