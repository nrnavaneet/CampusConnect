import { ApplicationsTable } from "@/components/admin/applications-table";

export default function AdminApplications() {
  // Get job ID from URL query params if provided
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("job");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Application Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage student applications
          </p>
        </div>

        <ApplicationsTable jobId={jobId || undefined} />
      </div>
    </div>
  );
}
