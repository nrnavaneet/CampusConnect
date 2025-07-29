import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Application, Job, StudentDetails } from "@shared/schema";

interface ApplicationsTableProps {
  jobId?: string;
}

export function ApplicationsTable({ jobId }: ApplicationsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: jobId ? ["/api/applications/job", jobId] : ["/api/applications"],
    enabled: !!jobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, stage }: { applicationId: string; status: string; stage: string }) => {
      const response = await apiRequest("PUT", `/api/applications/${applicationId}/status`, { status, stage });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated!",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const applications = applicationsData?.applications || [];

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    const stageMap: Record<string, string> = {
      "under_review": "under_review",
      "shortlisted": "shortlisted",
      "interviewed": "interviewed",
      "selected": "selected",
      "rejected": "rejected",
    };

    updateStatusMutation.mutate({
      applicationId,
      status: newStatus,
      stage: stageMap[newStatus] || newStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "under_review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "shortlisted": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "interviewed": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "selected": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const filteredApplications = applications.filter((app: Application) => 
    selectedStatus === "all" || app.status === selectedStatus
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Job Applications</CardTitle>
          <div className="flex space-x-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No applications found for the selected criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Registration No</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application: Application & { student?: StudentDetails }) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {application.student?.firstName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="font-medium">{application.student?.firstName || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {application.student?.collegeRegNo || "N/A"}
                  </TableCell>
                  <TableCell>{application.student?.branch || "N/A"}</TableCell>
                  <TableCell>{application.student?.ugPercentage || "N/A"}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {application.student?.resumeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(application.student.resumeUrl, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {application.status !== "selected" && application.status !== "rejected" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              const nextStatus = application.status === "applied" ? "shortlisted" : 
                                               application.status === "shortlisted" ? "selected" : "selected";
                              handleStatusUpdate(application.id, nextStatus);
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleStatusUpdate(application.id, "rejected")}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
