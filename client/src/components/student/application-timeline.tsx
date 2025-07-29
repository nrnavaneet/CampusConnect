import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Users, Eye, Trophy } from "lucide-react";
import type { Application, Job } from "@shared/schema";
import { format } from "date-fns";

interface ApplicationTimelineProps {
  application: Application;
  job: Job;
}

export function ApplicationTimeline({ application, job }: ApplicationTimelineProps) {
  const stages = [
    { key: "applied", label: "Applied", icon: CheckCircle },
    { key: "under_review", label: "Under Review", icon: Eye },
    { key: "shortlisted", label: "Shortlisted", icon: CheckCircle },
    { key: "interviewed", label: "Interview", icon: Users },
    { key: "selected", label: "Selected", icon: Trophy },
  ];

  const getStageStatus = (stageKey: string) => {
    const history = application.stageHistory as Array<{
      stage: string;
      timestamp: string;
      status: string;
    }>;

    const stageEntry = history.find(h => h.stage === stageKey);
    
    if (stageEntry) {
      if (stageEntry.status === "completed") return "completed";
      if (stageEntry.status === "pending") return "current";
    }
    
    if (application.currentStage === stageKey) return "current";
    if (application.status === "rejected") return "rejected";
    
    return "pending";
  };

  const getStageDate = (stageKey: string) => {
    const history = application.stageHistory as Array<{
      stage: string;
      timestamp: string;
      status: string;
    }>;

    const stageEntry = history.find(h => h.stage === stageKey);
    return stageEntry ? new Date(stageEntry.timestamp) : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "current": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 animate-pulse";
      case "rejected": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default: return "text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getStatusIcon = (status: string, IconComponent: any) => {
    if (status === "rejected") return XCircle;
    if (status === "current") return Clock;
    return IconComponent;
  };

  return (
    <Card className="border border-gray-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{job.company.charAt(0)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(application.status)}>
            {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <div className="flex items-center justify-between mb-8 relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
            
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.key);
              const date = getStageDate(stage.key);
              const Icon = getStatusIcon(status, stage.icon);
              
              return (
                <div key={stage.key} className="flex-1 relative z-10">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${getStatusColor(status)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <h4 className={`font-semibold text-sm ${status === 'completed' ? 'text-green-600' : status === 'current' ? 'text-blue-600' : status === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>
                        {stage.label}
                      </h4>
                      {date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(date, 'MMM dd, yyyy')}
                        </p>
                      )}
                      {status === 'current' && (
                        <p className="text-xs text-blue-600 mt-1">In Progress</p>
                      )}
                      {status === 'pending' && (
                        <p className="text-xs text-gray-400 mt-1">Pending</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps or Additional Info */}
        {application.status === "shortlisted" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-300">Next Steps</h5>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  Congratulations! You've been shortlisted. Please wait for further communication regarding the interview process.
                </p>
              </div>
            </div>
          </div>
        )}

        {application.status === "selected" && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <Trophy className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-semibold text-green-800 dark:text-green-300">Congratulations!</h5>
                <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                  You have been selected for this position. Please check your email for next steps and offer details.
                </p>
              </div>
            </div>
          </div>
        )}

        {application.status === "rejected" && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h5 className="font-semibold text-red-800 dark:text-red-300">Application Update</h5>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  Unfortunately, your application was not selected for this position. Keep applying to other opportunities!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
