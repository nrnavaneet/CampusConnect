import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { uploadResume } from "@/lib/supabase";

// Enhanced schema for MSRuas college email format
const registerSchema = z.object({
  // Step 1: Basic Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select gender" }),
  collegeRegNo: z.string()
    .min(10, "Registration number must be at least 10 characters")
    .regex(/^22[A-Z]{2,4}\d{6}$/, "Registration number must start with '22' followed by branch code and 6 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // Step 2: Contact Information
  collegeEmail: z.string()
    .email("Invalid email format")
    .refine((email) => {
      const pattern = /^22[a-zA-Z]{2,4}\d{6}@msruas\.ac\.in$/;
      return pattern.test(email);
    }, "Email must be in format: 22xxxxx@msruas.ac.in (starting with 22)"),
  personalEmail: z.string().email("Invalid personal email format"),
  mobileNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  
  // Step 3: Academic Information
  isPWD: z.boolean(),
  branch: z.enum([
    "CSE", "ISE", "MC", "AIML", "Aerospace", "Automotive", "EEE", "ECE", "Civil", "Mechanical", "Robotics"
  ], { required_error: "Please select your branch" }),
  ugPercentage: z.string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Enter valid percentage (0-100)"),
  hasActiveBacklogs: z.boolean(),
  
  // Step 4: Authentication
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  
  // Resume upload (optional)
  resume: z.any().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      isPWD: false,
      hasActiveBacklogs: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      let uploadedResumeUrl = "";
      
      // Upload resume if provided (optional)
      if (resumeFile) {
        try {
          uploadedResumeUrl = await uploadResume(resumeFile, data.collegeRegNo, data.branch);
        } catch (error) {
          console.warn("Resume upload failed, proceeding without resume:", error);
          // Continue registration without resume
        }
      }

      // Register student
      return apiRequest("/api/auth/register", "POST", {
        firstName: data.firstName,
        gender: data.gender,
        collegeRegNo: data.collegeRegNo,
        dateOfBirth: data.dateOfBirth,
        collegeEmail: data.collegeEmail,
        personalEmail: data.personalEmail,
        mobileNumber: data.mobileNumber,
        isPWD: data.isPWD,
        branch: data.branch,
        ugPercentage: parseFloat(data.ugPercentage),
        hasActiveBacklogs: data.hasActiveBacklogs,
        password: data.password,
        resumeUrl: uploadedResumeUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. You can upload your resume later from the dashboard.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file only",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const nextStep = () => {
    const fieldsToValidate = getCurrentStepFields();
    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    });
  };

  const getCurrentStepFields = (): (keyof RegisterFormData)[] => {
    switch (currentStep) {
      case 1:
        return ["firstName", "gender", "collegeRegNo", "dateOfBirth"];
      case 2:
        return ["collegeEmail", "personalEmail", "mobileNumber"];
      case 3:
        return ["branch", "ugPercentage"];
      case 4:
        return ["password", "confirmPassword"];
      default:
        return [];
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep} of 4
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  placeholder="Enter your first name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(value) => form.setValue("gender", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.gender.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="collegeRegNo">College Registration Number *</Label>
                <Input
                  id="collegeRegNo"
                  {...form.register("collegeRegNo")}
                  placeholder="e.g., 22CSE001234"
                  className="uppercase"
                />
                {form.formState.errors.collegeRegNo && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.collegeRegNo.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div>
                <Label htmlFor="collegeEmail">College Email *</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  {...form.register("collegeEmail")}
                  placeholder="22xxxxx@msruas.ac.in"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be in format: 22xxxxx@msruas.ac.in
                </p>
                {form.formState.errors.collegeEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.collegeEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="personalEmail">Personal Email *</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  {...form.register("personalEmail")}
                  placeholder="your.email@gmail.com"
                />
                {form.formState.errors.personalEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.personalEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  {...form.register("mobileNumber")}
                  placeholder="9876543210"
                  maxLength={10}
                />
                {form.formState.errors.mobileNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.mobileNumber.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Academic Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              
              <div>
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={form.watch("branch")}
                  onValueChange={(value) => form.setValue("branch", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">Computer Science and Engineering</SelectItem>
                    <SelectItem value="ISE">Information Science and Engineering</SelectItem>
                    <SelectItem value="MC">Mathematics and Computing</SelectItem>
                    <SelectItem value="AIML">AI and Machine Learning</SelectItem>
                    <SelectItem value="Aerospace">Aerospace Engineering</SelectItem>
                    <SelectItem value="Automotive">Automotive Engineering</SelectItem>
                    <SelectItem value="EEE">Electrical and Electronics Engineering</SelectItem>
                    <SelectItem value="ECE">Electronics and Communication Engineering</SelectItem>
                    <SelectItem value="Civil">Civil Engineering</SelectItem>
                    <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                    <SelectItem value="Robotics">Robotics Engineering</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.branch && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.branch.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ugPercentage">UG Percentage *</Label>
                <Input
                  id="ugPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register("ugPercentage")}
                  placeholder="85.5"
                />
                {form.formState.errors.ugPercentage && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.ugPercentage.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPWD"
                    checked={form.watch("isPWD")}
                    onCheckedChange={(checked) => form.setValue("isPWD", !!checked)}
                  />
                  <Label htmlFor="isPWD" className="text-sm">
                    I am a Person with Disability (PWD)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasActiveBacklogs"
                    checked={form.watch("hasActiveBacklogs")}
                    onCheckedChange={(checked) => form.setValue("hasActiveBacklogs", !!checked)}
                  />
                  <Label htmlFor="hasActiveBacklogs" className="text-sm">
                    I have active backlogs
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="resume">Resume Upload (Optional)</Label>
                <div className="mt-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {resumeFile && (
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <Check className="w-4 h-4 mr-2" />
                      {resumeFile.name} selected
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF format only, max 5MB. You can upload later from your profile.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Authentication */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Password</h3>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter strong password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must contain uppercase, lowercase, and number. Min 8 characters.
                </p>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder="Confirm your password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please ensure all information is accurate. You can update your profile and upload resume after registration.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="space-x-2">
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="min-w-[120px]"
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}