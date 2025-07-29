import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/student/job-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, SortAsc } from "lucide-react";
import type { Job, StudentDetails, Application } from "@shared/schema";

export default function StudentJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [filterBranch, setFilterBranch] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ["/api/student/profile"],
  });

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["/api/applications/student"],
  });

  const student = profileData?.student as StudentDetails;
  const jobs = (jobsData?.jobs || []) as Job[];
  const applications = (applicationsData?.applications || []) as Application[];

  const appliedJobIds = new Set(applications.map(app => app.jobId));

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("/api/applications", "POST", { jobId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/student"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (job: Job) => {
    // TODO: Implement job details modal
    console.log("View details for job:", job.id);
  };

  const handleApply = (job: Job) => {
    if (!student) {
      toast({
        title: "Profile required",
        description: "Please complete your profile before applying.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate(job.id);
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = filterBranch === "all" || 
                           !job.eligibleBranches || 
                           (job.eligibleBranches as string[]).includes(filterBranch);
      return matchesSearch && matchesBranch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "company":
          return a.company.localeCompare(b.company);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Categorize jobs
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const activeJobs = filteredJobs.filter(job => 
    job.isActive && new Date(job.deadline) > now
  );
  
  const recentJobs = filteredJobs.filter(job => 
    job.isActive && new Date(job.deadline) <= now && new Date(job.deadline) >= thirtyDaysAgo
  );
  
  const ongoingJobs = filteredJobs.filter(job => {
    // Jobs with applications in progress
    return applications.some(app => app.jobId === job.id && 
      ['applied', 'under_review', 'shortlisted', 'interviewed'].includes(app.status));
  });
  
  const upcomingJobs = filteredJobs.filter(job => {
    // Jobs with future deadlines (more than 7 days from now)
    return new Date(job.deadline) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

  const branches = [
    { value: "CSE", label: "Computer Science Engineering" },
    { value: "ECE", label: "Electronics and Communication" },
    { value: "EEE", label: "Electrical and Electronics" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "CE", label: "Civil Engineering" },
    { value: "IT", label: "Information Technology" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job & Internship Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and apply to opportunities from top companies
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Sort by Deadline</SelectItem>
                <SelectItem value="company">Sort by Company</SelectItem>
                <SelectItem value="title">Sort by Job Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <Tabs defaultValue="active" className="w-full">
            <div className="border-b border-gray-200 dark:border-slate-700">
              <TabsList className="grid w-full grid-cols-4 bg-transparent">
                <TabsTrigger value="active" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Active ({activeJobs.length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Recent ({recentJobs.length})
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Applied ({ongoingJobs.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Upcoming ({upcomingJobs.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="p-6">
              {isLoading ? (
                <div className="text-center py-12">Loading jobs...</div>
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg mb-2">No active jobs found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      student={student}
                      onViewDetails={handleViewDetails}
                      onApply={handleApply}
                      hasApplied={appliedJobIds.has(job.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="p-6">
              {recentJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg mb-2">No recent jobs found</p>
                  <p className="text-sm">Recently closed jobs will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      student={student}
                      onViewDetails={handleViewDetails}
                      onApply={handleApply}
                      hasApplied={appliedJobIds.has(job.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="p-6">
              {ongoingJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No ongoing applications</p>
                  <p className="text-sm">Jobs you've applied to will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ongoingJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      student={student}
                      onViewDetails={handleViewDetails}
                      onApply={handleApply}
                      hasApplied={appliedJobIds.has(job.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="p-6">
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No upcoming jobs</p>
                  <p className="text-sm">Future opportunities will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      student={student}
                      onViewDetails={handleViewDetails}
                      onApply={handleApply}
                      hasApplied={appliedJobIds.has(job.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
