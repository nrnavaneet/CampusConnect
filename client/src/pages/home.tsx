import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Search, UserPlus, Briefcase, Users, Handshake, Building, Star, Trophy, Target } from "lucide-react";
import { ScrollAnimatedSection } from "@/components/ui/smooth-scroll";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Career Journey
              <span className="block text-yellow-300 gradient-text">Starts Here</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Connect with top companies, track your applications, and land your dream job through our comprehensive placement portal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/student/dashboard">
                <Button className="bg-white text-primary font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg btn-animate pulse-on-hover">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-primary transition-all transform hover:scale-105 shadow-lg btn-animate pulse-on-hover">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <ScrollAnimatedSection>
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Your Placement Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to secure your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center card-hover hover-lift">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 float-animation">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Job Opportunities</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Browse hundreds of job openings from top companies across various industries.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover hover-lift">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 float-animation" style={{ animationDelay: '0.5s' }}>
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Application Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track your application status in real-time with detailed timeline views.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover hover-lift">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 float-animation" style={{ animationDelay: '1s' }}>
                  <Handshake className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Career Support</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get guidance and support throughout your placement journey.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover hover-lift">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 float-animation" style={{ animationDelay: '1.5s' }}>
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Top Companies</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect with leading companies looking for talented graduates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollAnimatedSection>

      {/* CTA Section */}
      <ScrollAnimatedSection>
        <section className="bg-gray-100 dark:bg-slate-800 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of students who have found their dream jobs through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg btn-animate pulse-on-hover">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Get Started Today
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="px-8 py-4 rounded-xl font-semibold hover-lift">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollAnimatedSection>
    </div>
  );
}
