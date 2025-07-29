import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Building2, IndianRupee, GraduationCap, Clock, Users, Code } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal("")),
  location: z.string().optional(),
  packageRange: z.string().optional(),
  minUGPercentage: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, "Percentage must be between 0 and 100"),
  allowBacklogs: z.boolean().default(false),
  eligibleBranches: z.array(z.string()).min(1, "Select at least one eligible branch"),
  skills: z.array(z.string()).optional(),
  deadline: z.string().min(1, "Application deadline is required"),
  countsAsOffer: z.boolean().default(true),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  onSuccess?: () => void;
}

export function JobForm({ onSuccess }: JobFormProps) {
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      allowBacklogs: false,
      countsAsOffer: true,
      eligibleBranches: [],
      minUGPercentage: "",
    },
  });

  const branches = [
    { value: "CSE", label: "Computer Science and Engineering" },
    { value: "ISE", label: "Information Science and Engineering" },
    { value: "MC", label: "Mathematics and Computing" },
    { value: "AIML", label: "AI and Machine Learning" },
    { value: "Aerospace", label: "Aerospace Engineering" },
    { value: "Automotive", label: "Automotive Engineering" },
    { value: "EEE", label: "Electrical and Electronics Engineering" },
    { value: "ECE", label: "Electronics and Communication Engineering" },
    { value: "Civil", label: "Civil Engineering" },
    { value: "Mechanical", label: "Mechanical Engineering" },
    { value: "Robotics", label: "Robotics Engineering" },
  ];

  const selectedBranches = watch("eligibleBranches") || [];

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      // Prepare job data with proper transformations
            const jobData = {
        title: data.title,
        company: data.company,
        description: data.description || null,
        location: data.location || null,
        packageRange: data.packageRange || null,
        minUGPercentage: data.minUGPercentage || null,
        allowBacklogs: data.allowBacklogs,
        eligibleBranches: data.eligibleBranches,
        skills,
        deadline: new Date(data.deadline).toISOString(),
        countsAsOffer: data.countsAsOffer,
        isActive: true, // Default to active
      };
      
      console.log("Sending job data:", jobData); // Debug log
      
      const response = await apiRequest("/api/jobs", "POST", jobData);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Job created successfully:", result); // Debug log
      toast({
        title: "Success! 🎉",
        description: "Job posting has been created and is now live.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      reset();
      setSkills([]);
      setError("");
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Job creation failed:", error); // Debug log
      const errorMessage = error.message || "Failed to create job. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    setError("");
    console.log("Form submitted with data:", data); // Debug log
    createJobMutation.mutate(data);
  };

  const handleBranchChange = (branchValue: string, checked: boolean) => {
    const current = selectedBranches;
    if (checked) {
      setValue("eligibleBranches", [...current, branchValue]);
    } else {
      setValue("eligibleBranches", current.filter(b => b !== branchValue));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Create New Job/Internship Opportunity
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to post a new job opportunity. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-1">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Engineer, Data Scientist"
                    {...register("title")}
                    className={`h-11 ${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium flex items-center gap-1">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Amazon"
                    {...register("company")}
                    className={`h-11 ${errors.company ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500">{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  Job Description <span className="text-gray-500">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
                  rows={5}
                  {...register("description")}
                  className={`resize-none ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Job Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bangalore, Mumbai, Remote"
                    {...register("location")}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageRange" className="text-sm font-medium flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    Package Range <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="packageRange"
                    placeholder="e.g., 15-20 LPA, 8-12 LPA"
                    {...register("packageRange")}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minUGPercentage" className="text-sm font-medium flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Minimum UG Percentage <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="minUGPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 75.00"
                    {...register("minUGPercentage")}
                    className={`h-11 ${errors.minUGPercentage ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.minUGPercentage && (
                    <p className="text-sm text-red-500">{errors.minUGPercentage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    min={minDate}
                    {...register("deadline")}
                    className={`h-11 ${errors.deadline ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-4">
                    Eligible Branches <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {branches.map((branch) => (
                      <div key={branch.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={branch.value}
                          checked={selectedBranches.includes(branch.value)}
                          onCheckedChange={(checked) => 
                            handleBranchChange(branch.value, checked as boolean)
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={branch.value} className="text-sm font-normal cursor-pointer flex-1">
                          {branch.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.eligibleBranches && (
                    <p className="text-sm text-red-500 mt-2">{errors.eligibleBranches.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    Required Skills <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Add a skill (e.g., JavaScript, Python, React)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="h-11 flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addSkill} 
                      variant="outline" 
                      size="default"
                      className="h-11 px-6"
                      disabled={!skillInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                      {skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-primary/70 hover:text-primary text-lg leading-none"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Additional Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50/50">
                  <Checkbox
                    id="allowBacklogs"
                    {...register("allowBacklogs")}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <Label htmlFor="allowBacklogs" className="text-sm font-medium cursor-pointer">
                      Allow students with active backlogs
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check this if students with pending subjects can apply
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50/50">
                  <Checkbox
                    id="countsAsOffer"
                    {...register("countsAsOffer")}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <Label htmlFor="countsAsOffer" className="text-sm font-medium cursor-pointer">
                      This counts as a placement offer
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check this if selection in this role counts towards placement statistics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                disabled={isSubmitting || createJobMutation.isPending}
              >
                {isSubmitting || createJobMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Job...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Create Job Posting
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
