import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Building2,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  BarChart3,
  UserCheck,
  MessageSquare
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ExportManager } from "@/components/admin/export-manager";
import { JobForm } from "@/components/admin/job-form";
import { Link } from "wouter";
import { useState } from "react";

interface DashboardStats {
  totalStudents: number;
  totalJobs: number;
  totalApplications: number;
  placedStudents: number;
  pendingApplications: number;
}

interface RecentActivity {
  id: string;
  type: "application" | "job_created" | "job_closed" | "student_placed";
  description: string;
  timestamp: string;
  metadata?: any;
}

export default function AdminDashboard() {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  
  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats");
      return response.json();
    },
  });

  // Fetch recent activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/activities");
      return response.json();
    },
  });

  // Fetch upcoming deadlines
  const { data: deadlinesData, isLoading: deadlinesLoading } = useQuery({
    queryKey: ["/api/jobs", { deadline: "upcoming" }],
    queryFn: async () => {
      const response = await apiRequest("/api/jobs?deadline=upcoming");
      return response.json();
    },
  });

  const stats: DashboardStats = statsData?.stats || {
    totalStudents: 0,
    totalJobs: 0,
    totalApplications: 0,
    placedStudents: 0,
    pendingApplications: 0
  };

  const recentActivities: RecentActivity[] = activitiesData?.activities || [];
  const upcomingDeadlines = deadlinesData?.jobs || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "job_created":
        return <Briefcase className="w-4 h-4 text-green-600" />;
      case "job_closed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "student_placed":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Campus Placement Portal Administration
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Plus className="w-5 h-5" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
              <JobForm onSuccess={() => setIsJobDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        <Link href="/admin/dashboard">
          <Button variant="default" size="sm" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs
          </Button>
        </Link>
        <Link href="/admin/applications">
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Applications
          </Button>
        </Link>
        <Link href="/admin/students">
          <Button variant="ghost" size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            Students
          </Button>
        </Link>
        <Link href="/admin/grievances">
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Grievances
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Total Students</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Total Jobs</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Applications</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Placed</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats.placedStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            const date = new Date(activity.timestamp);
                            return isNaN(date.getTime()) 
                              ? "Just now" 
                              : format(date, "MMM dd, yyyy 'at' HH:mm");
                          } catch {
                            return "Just now";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recent activities</p>
                <p className="text-sm">Activities will appear here when they occur</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 border rounded-lg">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : upcomingDeadlines.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingDeadlines.map((job: any) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm line-clamp-2 flex-1">{job.title}</h4>
                      <Badge variant="outline" className="text-xs ml-2 shrink-0">
                        {job.company}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {format(new Date(job.deadline), "MMM dd, yyyy")}
                      </span>
                      <span className="text-red-600 font-medium">
                        {Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No upcoming deadlines</p>
                <p className="text-sm">Job deadlines will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Manager */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExportManager />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex-col gap-3 hover:shadow-md transition-all">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Add New Job</span>
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Link href="/admin/students">
              <Button variant="outline" className="h-24 flex-col gap-3 hover:shadow-md transition-all w-full">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">View All Students</span>
              </Button>
            </Link>
            
            <Link href="/admin/applications">
              <Button variant="outline" className="h-24 flex-col gap-3 hover:shadow-md transition-all w-full">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium">Review Applications</span>
              </Button>
            </Link>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex-col gap-3 hover:shadow-md transition-all">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Export Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <ExportManager />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}