import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  GraduationCap, 
  Users, 
  CheckCircle, 
  Clock,
  Eye,
  FileText,
  Send
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  packageRange: string;
  minUGPercentage: number;
  allowBacklogs: boolean;
  eligibleBranches: string[];
  skills: string[];
  deadline: string;
  isActive: boolean;
  countsAsOffer: boolean;
  timeline: any;
  createdAt: string;
}

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

interface JobCardProps {
  job: Job;
  student?: Student;
  hasApplied?: boolean;
  applicationStatus?: string;
  onApplicationSuccess?: () => void;
}

export function JobCard({ job, student, hasApplied = false, applicationStatus, onApplicationSuccess }: JobCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/applications", "POST", { jobId: job.id });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been successfully submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/student"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onApplicationSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const checkEligibility = () => {
    if (!student) return { eligible: true, reasons: [] };
    
    const reasons = [];
    
    if (job.minUGPercentage && student.ugPercentage < job.minUGPercentage) {
      reasons.push(`Minimum ${job.minUGPercentage}% required (You have ${student.ugPercentage}%)`);
    }
    
    if (!job.allowBacklogs && student.hasActiveBacklogs) {
      reasons.push("Active backlogs not allowed");
    }
    
    if (job.eligibleBranches && job.eligibleBranches.length > 0 && !job.eligibleBranches.includes(student.branch)) {
      reasons.push(`Branch ${student.branch} not eligible`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  const eligibility = checkEligibility();
  const isDeadlinePassed = new Date(job.deadline) < new Date();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "applied": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "under_review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "shortlisted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "selected": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatStatus = (status?: string) => {
    switch (status) {
      case "applied": return "Applied";
      case "under_review": return "Under Review";
      case "shortlisted": return "Shortlisted";
      case "selected": return "Selected";
      case "rejected": return "Rejected";
      default: return "Unknown";
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">{job.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
          
          {hasApplied && applicationStatus && (
            <Badge className={getStatusColor(applicationStatus)}>
              {formatStatus(applicationStatus)}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {job.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.packageRange && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IndianRupee className="w-3 h-3" />
              <span>{job.packageRange}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Key Requirements */}
          <div className="flex flex-wrap gap-2">
            {job.minUGPercentage && (
              <Badge variant="outline" className="text-xs">
                <GraduationCap className="w-3 h-3 mr-1" />
                {job.minUGPercentage}%+ CGPA
              </Badge>
            )}
            
            {job.allowBacklogs ? (
              <Badge variant="outline" className="text-xs text-green-600">
                Backlogs OK
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-red-600">
                No Backlogs
              </Badge>
            )}
          </div>

          {/* Eligible Branches */}
          {job.eligibleBranches && job.eligibleBranches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Branches:</span>
              {job.eligibleBranches.slice(0, 3).map((branch) => (
                <Badge key={branch} variant="secondary" className="text-xs">
                  {branch}
                </Badge>
              ))}
              {job.eligibleBranches.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.eligibleBranches.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className={isDeadlinePassed ? "text-red-600" : "text-muted-foreground"}>
              Deadline: {format(new Date(job.deadline), "MMM dd, yyyy")}
            </span>
            {isDeadlinePassed && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>

          {/* Eligibility Status */}
          {student && !eligibility.eligible && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm font-medium mb-1">
                <CheckCircle className="w-4 h-4" />
                Not Eligible
              </div>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {eligibility.reasons.map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">{job.title}</DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Job Description */}
                  {job.description && (
                    <div>
                      <h4 className="font-medium mb-2">Job Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Minimum CGPA:</span>
                          <span className="font-medium">{job.minUGPercentage || "Not specified"}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backlogs:</span>
                          <span className={job.allowBacklogs ? "text-green-600" : "text-red-600"}>
                            {job.allowBacklogs ? "Allowed" : "Not Allowed"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Counts as Offer:</span>
                          <span className={job.countsAsOffer ? "text-green-600" : "text-yellow-600"}>
                            {job.countsAsOffer ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
                        {job.location && (
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{job.location}</span>
                          </div>
                        )}
                        {job.packageRange && (
                          <div className="flex justify-between">
                            <span>Package:</span>
                            <span className="font-medium">{job.packageRange}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Deadline:</span>
                          <span className="font-medium">
                            {format(new Date(job.deadline), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Eligible Branches */}
                  {job.eligibleBranches && job.eligibleBranches.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Eligible Branches</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.eligibleBranches.map((branch) => (
                            <Badge key={branch} variant="outline">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Student Profile Preview for Application */}
                  {student && !hasApplied && eligibility.eligible && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Your Profile Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-medium">{student.firstName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reg No:</span>
                            <span className="ml-2 font-medium">{student.collegeRegNo}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="ml-2 font-medium">{student.branch}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CGPA:</span>
                            <span className="ml-2 font-medium">{student.ugPercentage}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2 font-medium">{student.collegeEmail}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mobile:</span>
                            <span className="ml-2 font-medium">{student.mobileNumber}</span>
                          </div>
                        </div>
                        
                        {student.resumeUrl && (
                          <div className="mt-3">
                            <a 
                              href={student.resumeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              View Resume
                            </a>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* One-Click Apply Button */}
            {!hasApplied && student && eligibility.eligible && !isDeadlinePassed && job.isActive && (
              <Button 
                size="sm" 
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="flex-1"
              >
                {applyMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </>
                )}
              </Button>
            )}

            {hasApplied && applicationStatus && (
              <div className="flex-1">
                <Badge className={`w-full justify-center ${getStatusColor(applicationStatus)}`}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {formatStatus(applicationStatus)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}