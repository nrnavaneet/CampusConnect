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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  packageRange: z.string().optional(),
  minUGPercentage: z.number().min(0).max(100).optional(),
  allowBacklogs: z.boolean().default(false),
  eligibleBranches: z.array(z.string()).min(1, "Select at least one branch"),
  skills: z.array(z.string()).optional(),
  deadline: z.string().min(1, "Deadline is required"),
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
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      allowBacklogs: false,
      countsAsOffer: true,
      eligibleBranches: [],
    },
  });

  const branches = [
    { value: "CSE", label: "Computer Science Engineering" },
    { value: "ECE", label: "Electronics and Communication" },
    { value: "EEE", label: "Electrical and Electronics" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "CE", label: "Civil Engineering" },
    { value: "IT", label: "Information Technology" },
  ];

  const selectedBranches = watch("eligibleBranches") || [];

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const jobData = {
        ...data,
        skills: skills.length > 0 ? skills : undefined,
        deadline: new Date(data.deadline).toISOString(),
        minUGPercentage: data.minUGPercentage || null,
      };
      
      const response = await apiRequest("POST", "/api/jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job created successfully!",
        description: "The job posting has been created and is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      reset();
      setSkills([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to create job. Please try again.");
    },
  });

  const onSubmit = (data: JobFormData) => {
    setError("");
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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create New Job/Internship</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="Software Engineer"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="Google"
                {...register("company")}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Bangalore, India"
                {...register("location")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageRange">Package Range</Label>
              <Input
                id="packageRange"
                placeholder="15-20 LPA"
                {...register("packageRange")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minUGPercentage">Minimum UG Percentage</Label>
              <Input
                id="minUGPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="75"
                {...register("minUGPercentage", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register("deadline")}
                className={errors.deadline ? "border-red-500" : ""}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Eligible Branches *</Label>
            <div className="grid grid-cols-2 gap-2">
              {branches.map((branch) => (
                <div key={branch.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={branch.value}
                    checked={selectedBranches.includes(branch.value)}
                    onCheckedChange={(checked) => 
                      handleBranchChange(branch.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={branch.value} className="text-sm font-normal">
                    {branch.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.eligibleBranches && (
              <p className="text-sm text-red-500">{errors.eligibleBranches.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Required Skills</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowBacklogs"
                {...register("allowBacklogs")}
              />
              <Label htmlFor="allowBacklogs">Allow students with active backlogs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="countsAsOffer"
                {...register("countsAsOffer")}
              />
              <Label htmlFor="countsAsOffer">This counts as a placement offer</Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? "Creating Job..." : "Create Job Posting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
