import { ApplicationsTable } from "@/components/admin/applications-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Building, Briefcase, Download, Filter } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminApplications() {
  // Get job ID from URL query params if provided
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("job");

  // Fetch applications stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/applications/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/applications/stats");
      return response.json();
    },
  });

  const stats = statsData?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Application Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review and manage student applications
            {jobId && <span className="ml-2 text-primary">• Filtered by specific job</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="gap-2">
            <Filter className="w-5 h-5" />
            Filter Applications
          </Button>
          <Button size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <Building className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs
          </Button>
        </Link>
        <Button variant="default" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Applications
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Applications
            {jobId && <Badge variant="outline" className="ml-2">Filtered by Job</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationsTable jobId={jobId || undefined} />
        </CardContent>
      </Card>
    </div>
  );
}
