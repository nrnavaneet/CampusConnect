import { ProfileForm } from "@/components/student/profile-form";

export default function StudentProfile() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your profile information and manage your resume
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
}
