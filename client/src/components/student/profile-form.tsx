import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { uploadResume } from "@/lib/supabase";
import type { StudentDetails } from "@shared/schema";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  personalEmail: z.string().email("Invalid personal email"),
  branch: z.string().min(1, "Please select branch"),
  ugPercentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  hasActiveBacklogs: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/student/profile"],
  });

  const student = profileData?.student as StudentDetails;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: student ? {
      firstName: student.firstName,
      mobileNumber: student.mobileNumber,
      personalEmail: student.personalEmail,
      branch: student.branch,
      ugPercentage: Number(student.ugPercentage),
      hasActiveBacklogs: student.hasActiveBacklogs,
    } : {},
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { resumeUrl?: string }) => {
      const response = await apiRequest("PUT", "/api/student/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/profile"] });
    },
    onError: (error: Error) => {
      setError(error.message || "Update failed. Please try again.");
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError("");
    
    let resumeUrl = student?.resumeUrl;
    
    if (resumeFile) {
      try {
        setUploadingResume(true);
        resumeUrl = await uploadResume(resumeFile, student.collegeRegNo, student.branch);
      } catch (error) {
        setError("Failed to upload resume. Please try again.");
        return;
      } finally {
        setUploadingResume(false);
      }
    }

    updateMutation.mutate({ ...data, resumeUrl });
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB.");
        return;
      }
      setResumeFile(file);
      setError("");
    }
  };

  const branches = [
    { value: "CSE", label: "Computer Science Engineering" },
    { value: "ECE", label: "Electronics and Communication" },
    { value: "EEE", label: "Electrical and Electronics" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "CE", label: "Civil Engineering" },
    { value: "IT", label: "Information Technology" },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }

  if (!student) {
    return <div className="text-center p-8">Profile not found</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                {...register("mobileNumber")}
                className={errors.mobileNumber ? "border-red-500" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail">Personal Email</Label>
            <Input
              id="personalEmail"
              type="email"
              {...register("personalEmail")}
              className={errors.personalEmail ? "border-red-500" : ""}
            />
            {errors.personalEmail && (
              <p className="text-sm text-red-500">{errors.personalEmail.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                onValueChange={(value) => setValue("branch", value)}
                defaultValue={student.branch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>
                      {branch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch && (
                <p className="text-sm text-red-500">{errors.branch.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ugPercentage">UG Percentage</Label>
              <Input
                id="ugPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("ugPercentage", { valueAsNumber: true })}
                className={errors.ugPercentage ? "border-red-500" : ""}
              />
              {errors.ugPercentage && (
                <p className="text-sm text-red-500">{errors.ugPercentage.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Active Backlogs</Label>
            <Select
              onValueChange={(value) => setValue("hasActiveBacklogs", value === "true")}
              defaultValue={student.hasActiveBacklogs ? "true" : "false"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No backlogs</SelectItem>
                <SelectItem value="true">Yes, I have backlogs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume Upload</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              {student.resumeUrl && !resumeFile ? (
                <div className="text-center">
                  <div className="text-green-600 mb-2">✓ Resume uploaded</div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(student.resumeUrl!, '_blank')}
                    className="mb-2"
                  >
                    View Current Resume
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Label htmlFor="resume-upload" className="cursor-pointer text-primary hover:underline">
                      Upload New Resume
                    </Label>
                  </div>
                </div>
              ) : resumeFile ? (
                <div className="text-center">
                  <div className="text-blue-600 mb-2">📄 {resumeFile.name}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResumeFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 mb-4">📄 No resume uploaded</div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Label htmlFor="resume-upload" className="cursor-pointer bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                    Choose PDF File
                  </Label>
                  <div className="text-sm text-gray-500 mt-2">
                    PDF only, max 2MB
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending || uploadingResume}
          >
            {uploadingResume ? "Uploading Resume..." : updateMutation.isPending ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
