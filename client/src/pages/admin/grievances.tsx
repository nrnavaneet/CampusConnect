import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Settings,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

interface Grievance {
  id: string;
  studentId?: string;
  type: string;
  subject: string;
  description: string;
  contactEmail: string;
  priority: string;
  status: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    firstName: string;
    collegeRegNo: string;
    branch: string;
  };
}

export default function AdminGrievances() {
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch grievances
  const { data: grievancesData, isLoading } = useQuery({
    queryKey: ["/api/grievances"],
    queryFn: async () => {
      const response = await apiRequest("/api/grievances");
      return response.json();
    },
  });

  const updateGrievanceMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response: string }) => {
      return apiRequest(`/api/grievances/${id}`, "PUT", { status, response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
      setIsResponseDialogOpen(false);
      setSelectedGrievance(null);
      setResponse("");
      setStatus("");
      toast({
        title: "Success",
        description: "Grievance updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grievance.",
        variant: "destructive",
      });
    },
  });

  const grievances: Grievance[] = grievancesData?.grievances || [];

  const filteredGrievances = grievances.filter(grievance => {
    const statusMatch = filterStatus === "all" || grievance.status === filterStatus;
    const priorityMatch = filterPriority === "all" || grievance.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleRespondToGrievance = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setResponse(grievance.response || "");
    setStatus(grievance.status);
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedGrievance && status) {
      updateGrievanceMutation.mutate({
        id: selectedGrievance.id,
        status,
        response: response.trim()
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "in_progress":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">New</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-600 border-green-600">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Grievance Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and respond to student grievances
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
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
          <Button variant="default" size="sm" className="gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Grievances</p>
                <p className="text-xl font-bold">{grievances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-xl font-bold">{grievances.filter(g => g.status === 'submitted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{grievances.filter(g => g.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{grievances.filter(g => g.status === 'resolved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="priority-filter">Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grievances Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            All Grievances ({filteredGrievances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading grievances...</div>
          ) : filteredGrievances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No grievances found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrievances.map((grievance) => (
                    <TableRow key={grievance.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {grievance.student?.firstName || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {grievance.student?.collegeRegNo || grievance.contactEmail}
                          </p>
                          {grievance.student?.branch && (
                            <p className="text-xs text-muted-foreground">
                              {grievance.student.branch}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{grievance.type}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{grievance.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {grievance.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(grievance.priority)}</TableCell>
                      <TableCell>{getStatusBadge(grievance.status)}</TableCell>
                      <TableCell>
                        {format(new Date(grievance.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRespondToGrievance(grievance)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {grievance.status === 'resolved' ? 'View' : 'Respond'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grievance Details & Response</DialogTitle>
          </DialogHeader>
          {selectedGrievance && (
            <div className="space-y-6">
              {/* Grievance Details */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Student</Label>
                    <p className="text-sm">
                      {selectedGrievance.student?.firstName || 'Unknown'} 
                      ({selectedGrievance.student?.collegeRegNo || selectedGrievance.contactEmail})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm capitalize">{selectedGrievance.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedGrievance.priority)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedGrievance.status)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm">{selectedGrievance.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{selectedGrievance.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <p className="text-sm">{selectedGrievance.contactEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted On</Label>
                  <p className="text-sm">{format(new Date(selectedGrievance.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="response">Response (Optional)</Label>
                  <Textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response to the student..."
                    rows={4}
                  />
                </div>

                {selectedGrievance.response && (
                  <div>
                    <Label className="text-sm font-medium">Previous Response</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                      {selectedGrievance.response}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={!status || updateGrievanceMutation.isPending}
                >
                  {updateGrievanceMutation.isPending ? "Updating..." : "Update Grievance"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
