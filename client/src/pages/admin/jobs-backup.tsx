import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { JobForm } from "@/components/admin/job-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye, Calendar, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { Job } from "@shared/schema";

export default function AdminJobs() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
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

  const jobs = (jobsData?.jobs || []) as Job[];

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage job postings
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <JobForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Jobs Created</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by creating your first job posting
              </p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <JobForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {job.company}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={job.isActive ? "default" : "secondary"}
                        className={job.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {format(new Date(job.deadline), 'MMM dd, yyyy - hh:mm a')}
                    </div>
                    
                    {job.location && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </div>
                    )}
                    
                    {job.packageRange && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {job.packageRange}
                      </div>
                    )}

                    {job.eligibleBranches && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(job.eligibleBranches as string[]).map((branch, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {job.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-2">
                        {job.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(job.id, job.isActive)}
                          disabled={toggleJobStatusMutation.isPending}
                        >
                          {job.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deleteJobMutation.isPending}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button size="sm" asChild>
                        <a href={`/admin/applications?job=${job.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Applications
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
