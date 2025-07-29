import { useState } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Building2 } from "lucide-react";
import { useLocation } from "wouter";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, setLocation] = useLocation();

  const handleRegisterSuccess = () => {
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setLocation("/")}
            >
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation("/")}
              >
                Campus Placement Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                M.S. Ramaiah University of Applied Sciences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Access your placement portal to explore opportunities and manage your applications
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 m-2 h-12">
                  <TabsTrigger value="login" className="text-sm font-medium">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-sm font-medium">
                    Register
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="login" className="mt-0">
                    <LoginForm 
                      onSuccess={onAuthSuccess}
                      onSwitchToRegister={() => setActiveTab("register")}
                    />
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <RegisterForm 
                      onSuccess={handleRegisterSuccess}
                      onSwitchToLogin={() => setActiveTab("login")}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-4 border">
              <h3 className="font-medium text-sm mb-2">Need Help?</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>📧 Students: Use college email (22xxxxx@msruas.ac.in)</p>
                <p>🔑 Admin: Use admin@msruas.ac.in</p>
                <p>💬 Support: placement@msruas.ac.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 M.S. Ramaiah University of Applied Sciences. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}