import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Briefcase, 
  Search, 
  Filter, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { JobCard } from "@/components/student/job-card";

interface Student {
  id: string;
  firstName: string;
  branch: string;
  ugPercentage: number;
  hasActiveBacklogs: boolean;
  resumeUrl?: string;
  collegeRegNo: string;
  collegeEmail: string;
  mobileNumber: string;
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  currentStage: string;
  appliedAt: string;
  job?: any;
}

export default function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch student profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/student/profile"],
    queryFn: () => apiRequest("/api/student/profile"),
  });

  // Fetch available jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", { active: true }],
    queryFn: () => apiRequest("/api/jobs?active=true"),
  });

  // Fetch student applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications/student"],
    queryFn: () => apiRequest("/api/applications/student"),
  });

  const student: Student = profileData?.student;
  const jobs = jobsData?.jobs || [];
  const applications: Application[] = applicationsData?.applications || [];

  // Create a map of applied job IDs for quick lookup
  const appliedJobIds = new Set(applications.map(app => app.jobId));
  const applicationsByJobId = applications.reduce((acc, app) => {
    acc[app.jobId] = app;
    return acc;
  }, {} as Record<string, Application>);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = filterBranch === "all" || 
                         !job.eligibleBranches || 
                         job.eligibleBranches.length === 0 || 
                         job.eligibleBranches.includes(filterBranch);
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "applied" && appliedJobIds.has(job.id)) ||
                         (filterStatus === "not_applied" && !appliedJobIds.has(job.id));

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === "applied" || app.status === "under_review").length,
    shortlisted: applications.filter(app => app.status === "shortlisted").length,
    selected: applications.filter(app => app.status === "selected").length,
  };

  const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AERO", "CHEM", "IT", "AIDS", "CSAI", "CSBS"];

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {student?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore job opportunities and manage your applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            My Applications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foregrounde">Shortlisted</p>
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{stats.selected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="not_applied">Not Applied</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterBranch || filterStatus !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterBranch("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Available Opportunities ({filteredJobs.length})
          </h2>
          {filterStatus === "applied" && (
            <Badge variant="secondary">
              Showing your applications
            </Badge>
          )}
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job: any) => (
              <JobCard
                key={job.id}
                job={job}
                student={student}
                hasApplied={appliedJobIds.has(job.id)}
                applicationStatus={applicationsByJobId[job.id]?.status}
                onApplicationSuccess={() => {
                  // The query cache will be invalidated by the mutation
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterBranch || filterStatus !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "No job opportunities are currently available"}
                </p>
                {(searchTerm || filterBranch || filterStatus !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterBranch("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Completion Reminder */}
      {student && (!student.resumeUrl) && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Complete Your Profile
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Upload your resume to improve your chances of getting noticed by recruiters.
                </p>
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900">
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}