import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { JobForm } from "@/components/admin/job-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye, Calendar, MapPin, IndianRupee, Briefcase, Building } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Job } from "@shared/schema";

interface JobWithTypedBranches extends Omit<Job, 'eligibleBranches'> {
  eligibleBranches?: string[] | null;
}

export default function AdminJobs() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await apiRequest("/api/jobs");
      return response.json();
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest(`/api/jobs/${jobId}`, "DELETE", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job deleted!",
        description: "The job posting has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
      });
    },
  });

  const toggleJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      const response = await apiRequest(`/api/jobs/${jobId}`, "PUT", { isActive });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job status updated!",
        description: "The job status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    },
  });

  const jobs = (jobsData?.jobs || []) as JobWithTypedBranches[];

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleToggleStatus = (jobId: string, currentStatus: boolean) => {
    toggleJobStatusMutation.mutate({ jobId, isActive: !currentStatus });
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Job Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Create and manage job postings for campus placements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Plus className="w-5 h-5" />
              Create New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <Building className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <Button variant="default" size="sm" className="gap-2">
          <Briefcase className="w-4 h-4" />
          Jobs
        </Button>
        <Link href="/admin/applications">
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Applications
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-xl font-bold">{jobs.filter(job => job.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Building className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-xl font-bold">{new Set(jobs.map(job => job.company)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No Jobs Created</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by creating your first job posting to connect students with opportunities
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Job
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200 flex flex-col h-full">
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{job.title}</CardTitle>
                    <p className="text-muted-foreground font-medium text-sm">
                      {job.company}
                    </p>
                  </div>
                  <Badge 
                    variant={job.isActive ? "default" : "secondary"}
                    className={job.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Deadline: {format(new Date(job.deadline), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {job.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                  
                  {job.packageRange && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IndianRupee className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.packageRange}</span>
                    </div>
                  )}
                </div>

                {job.eligibleBranches && Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.eligibleBranches.slice(0, 3).map((branch, index) => (
                      <Badge key={`branch-${index}`} variant="outline" className="text-xs">
                        {branch}
                      </Badge>
                    ))}
                    {job.eligibleBranches.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.eligibleBranches.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleToggleStatus(job.id, job.isActive || false)}
                      disabled={toggleJobStatusMutation.isPending}
                    >
                      {job.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deleteJobMutation.isPending}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Link href={`/admin/applications?job=${job.id}`}>
                    <Button size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      View Applications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
