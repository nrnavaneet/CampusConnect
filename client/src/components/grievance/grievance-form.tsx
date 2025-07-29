import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowDown, Minus, ArrowUp } from "lucide-react";

const grievanceSchema = z.object({
  type: z.string().min(1, "Please select issue type"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactEmail: z.string().email("Invalid email address"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type GrievanceFormData = z.infer<typeof grievanceSchema>;

export function GrievanceForm() {
  const [error, setError] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const issueTypes = [
    { value: "application", label: "Application Related" },
    { value: "technical", label: "Technical Issues" },
    { value: "placement", label: "Placement Process" },
    { value: "discrimination", label: "Discrimination/Bias" },
    { value: "communication", label: "Communication Issues" },
    { value: "other", label: "Other" },
  ];

  const priority = watch("priority");

  const submitGrievanceMutation = useMutation({
    mutationFn: async (data: GrievanceFormData) => {
      const response = await apiRequest("POST", "/api/grievances", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Grievance submitted successfully!",
        description: "Your issue has been reported and will be reviewed by our team.",
      });
      reset();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to submit grievance. Please try again.");
    },
  });

  const onSubmit = (data: GrievanceFormData) => {
    setError("");
    submitGrievanceMutation.mutate(data);
  };

  const getPriorityIcon = (priorityLevel: string) => {
    switch (priorityLevel) {
      case "low": return ArrowDown;
      case "medium": return Minus;
      case "high": return ArrowUp;
      default: return Minus;
    }
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-yellow-500";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="border border-gray-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <CardTitle className="text-3xl font-bold">Grievance & Issue Reporting</CardTitle>
              <p className="opacity-90 mt-2">We're here to help resolve any concerns you may have</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Type of Issue *</Label>
              <Select onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Issue Type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of the issue"
                {...register("subject")}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Please provide a detailed explanation of your issue..."
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="your.email@example.com"
                {...register("contactEmail")}
                className={errors.contactEmail ? "border-red-500" : ""}
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Priority Level</Label>
              <RadioGroup
                value={priority}
                onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high")}
                className="grid grid-cols-3 gap-3"
              >
                {["low", "medium", "high"].map((priorityLevel) => {
                  const IconComponent = getPriorityIcon(priorityLevel);
                  const colorClass = getPriorityColor(priorityLevel);
                  
                  return (
                    <div key={priorityLevel}>
                      <RadioGroupItem
                        value={priorityLevel}
                        id={priorityLevel}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={priorityLevel}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          priority === priorityLevel
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-slate-600 hover:border-primary/50"
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 mb-2 ${colorClass}`} />
                        <span className="font-medium capitalize">{priorityLevel}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-[1.02] shadow-lg"
              disabled={submitGrievanceMutation.isPending}
            >
              {submitGrievanceMutation.isPending ? "Submitting..." : "Submit Grievance"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
