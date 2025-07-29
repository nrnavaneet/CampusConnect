import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { MouseTrail, ParticleBackground } from "@/components/ui/mouse-trail";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { GraduationCap, Sun, Moon, User, LogOut, Briefcase, FileText, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import AuthPage from "@/pages/auth/auth-page";
import StudentDashboard from "@/pages/student/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminJobs from "@/pages/admin/jobs";
import AdminApplications from "@/pages/admin/applications";
import AdminStudents from "@/pages/admin/students";
import Grievance from "@/pages/grievance";

function Navigation() {
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = authData?.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      queryClient.clear();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Don't show navigation on auth pages
  if (location === "/auth") {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isAuthenticated ? (isAdmin ? "/admin/dashboard" : "/student/dashboard") : "/"}>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Campus Portal
              </span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              {isAdmin ? (
                <>
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/student/dashboard">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/grievance">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      <FileText className="w-4 h-4 mr-2" />
                      Grievance
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-700 dark:text-gray-300"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-3 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">
                    {isAdmin ? "Admin" : "Student"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = authData?.user;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth">
          {!isAuthenticated ? (
            <AuthPage onAuthSuccess={() => window.location.reload()} />
          ) : (
            <div>Redirecting...</div>
          )}
        </Route>
        <Route path="/student/dashboard">
          {isAuthenticated && !isAdmin ? (
            <StudentDashboard />
          ) : (
            <div>Access denied</div>
          )}
        </Route>
        <Route path="/admin/dashboard">
          {isAuthenticated && isAdmin ? (
            <AdminDashboard />
          ) : (
            <div>Access denied</div>
          )}
        </Route>
        <Route path="/admin/jobs">
          {isAuthenticated && isAdmin ? (
            <AdminJobs />
          ) : (
            <div>Access denied</div>
          )}
        </Route>
        <Route path="/admin/applications">
          {isAuthenticated && isAdmin ? (
            <AdminApplications />
          ) : (
            <div>Access denied</div>
          )}
        </Route>
        <Route path="/admin/students">
          {isAuthenticated && isAdmin ? (
            <AdminStudents />
          ) : (
            <div>Access denied</div>
          )}
        </Route>
        <Route path="/grievance" component={Grievance} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="campus-portal-theme">
        <TooltipProvider>
          <MouseTrail />
          <ParticleBackground />
          <Navigation />
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
