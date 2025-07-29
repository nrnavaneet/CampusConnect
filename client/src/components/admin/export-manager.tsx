import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileSpreadsheet, 
  Users, 
  Building2, 
  Calendar,
  Filter,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  company: string;
  deadline: string;
  isActive: boolean;
  _count?: {
    applications: number;
  };
}

export function ExportManager() {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [exportType, setExportType] = useState<"applications" | "students" | "overview">("applications");
  const { toast } = useToast();

  // Fetch jobs for export selection
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: () => apiRequest("/api/jobs"),
  });

  const jobs = jobsData?.jobs || [];

  // Export applications for specific job
  const exportApplicationsMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/export/applications/${jobId}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export applications");
      }
      
      return response.blob();
    },
    onSuccess: (blob, jobId) => {
      const job = jobs.find((j: Job) => j.id === jobId);
      const filename = `applications_${job?.company || 'job'}_${job?.title?.replace(/\s+/g, '_') || jobId}.csv`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete!",
        description: `Applications data downloaded as ${filename}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  // Export all students data
  const exportStudentsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/students", {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export students data");
      }
      
      return response.blob();
    },
    onSuccess: (blob) => {
      const filename = `all_students_${format(new Date(), "yyyy-MM-dd")}.csv`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete!",
        description: `Students data downloaded as ${filename}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export students data",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    if (exportType === "applications" && selectedJob) {
      exportApplicationsMutation.mutate(selectedJob);
    } else if (exportType === "students") {
      exportStudentsMutation.mutate();
    } else if (exportType === "overview") {
      // Create overview report with all jobs and stats
      const overviewData = jobs.map((job: Job) => ({
        jobTitle: job.title,
        company: job.company,
        deadline: format(new Date(job.deadline), "yyyy-MM-dd"),
        isActive: job.isActive ? "Yes" : "No",
        applications: job._count?.applications || 0,
      }));
      
      const csvContent = [
        ["Job Title", "Company", "Deadline", "Active", "Applications"].join(","),
        ...overviewData.map(row => [
          `"${row.jobTitle}"`,
          `"${row.company}"`,
          row.deadline,
          row.isActive,
          row.applications
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement_overview_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Overview Export Complete!",
        description: "Placement overview downloaded successfully",
      });
    }
  };

  const isExportDisabled = () => {
    if (exportType === "applications" && !selectedJob) return true;
    return exportApplicationsMutation.isPending || exportStudentsMutation.isPending;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Data Export Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Export placement data in CSV format organized by job and overall statistics
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Export Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Type</label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applications">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Job Applications (by specific job)
                  </div>
                </SelectItem>
                <SelectItem value="students">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Students Data
                  </div>
                </SelectItem>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Placement Overview (all jobs summary)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Selection (only for applications export) */}
          {exportType === "applications" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job to export applications" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job: Job) => (
                    <SelectItem key={job.id} value={job.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {job.company} • {format(new Date(job.deadline), "MMM dd, yyyy")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job._count?.applications && (
                            <Badge variant="secondary" className="text-xs">
                              {job._count.applications} apps
                            </Badge>
                          )}
                          <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                            {job.isActive ? "Active" : "Closed"}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={isExportDisabled()}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportApplicationsMutation.isPending || exportStudentsMutation.isPending 
              ? "Exporting..." 
              : `Export ${exportType === "applications" ? "Applications" : exportType === "students" ? "Students" : "Overview"} Data`
            }
          </Button>

          {/* Export Information */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Export Details
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {exportType === "applications" && (
                <>
                  <p>• Exports all applications for the selected job</p>
                  <p>• Includes student details, resume links, and application status</p>
                  <p>• Data organized by application date and current stage</p>
                  <p>• File format: CSV with resume URLs for easy download</p>
                </>
              )}
              {exportType === "students" && (
                <>
                  <p>• Exports all registered students in the system</p>
                  <p>• Includes academic details, contact information, and resume links</p>
                  <p>• Organized by branch and registration number</p>
                  <p>• File format: CSV with comprehensive student profiles</p>
                </>
              )}
              {exportType === "overview" && (
                <>
                  <p>• Exports summary of all placement activities</p>
                  <p>• Includes job statistics and application counts</p>
                  <p>• Overview of active vs closed positions</p>
                  <p>• File format: CSV summary report</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobs.slice(0, 3).map((job: Job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{job.title}</h4>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                  {job.isActive ? "Active" : "Closed"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(job.deadline), "MMM dd")}
                </span>
                {job._count?.applications && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {job._count.applications} applications
                  </span>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => {
                  setExportType("applications");
                  setSelectedJob(job.id);
                  exportApplicationsMutation.mutate(job.id);
                }}
                disabled={exportApplicationsMutation.isPending}
              >
                <Download className="w-3 h-3 mr-1" />
                Quick Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resume Download Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Resume Download Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              All CSV exports include resume URLs. To download resumes in bulk:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Export the applications data for your desired job</li>
              <li>Open the CSV file in Excel or Google Sheets</li>
              <li>The "Resume URL" column contains direct links to student resumes</li>
              <li>Use browser extensions or download managers to bulk download from URLs</li>
              <li>Resumes are organized by branch: /placements/resumes/{`{branch}`}/{`{reg_no}`}.pdf</li>
            </ol>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Resumes are stored in Supabase storage and can be accessed directly via the URLs in the CSV export.
                For bulk operations, consider using the Supabase dashboard or API for direct storage access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}