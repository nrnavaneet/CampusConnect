import { useQuery } from "@tanstack/react-query";
import { ApplicationTimeline } from "@/components/student/application-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { Application, Job } from "@shared/schema";

export default function StudentApplications() {
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ["/api/applications/student"],
  });

  const { data: jobsData } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const applications = (applicationsData?.applications || []) as Application[];
  const jobs = (jobsData?.jobs || []) as Job[];

  // Create a map of job ID to job for quick lookup
  const jobsMap = new Map(jobs.map(job => [job.id, job]));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Application Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your application progress in real-time
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't applied to any jobs yet. Start exploring opportunities!
              </p>
              <a 
                href="/student/jobs" 
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Jobs
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {applications.map((application) => {
              const job = jobsMap.get(application.jobId);
              if (!job) return null;

              return (
                <ApplicationTimeline
                  key={application.id}
                  application={application}
                  job={job}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
