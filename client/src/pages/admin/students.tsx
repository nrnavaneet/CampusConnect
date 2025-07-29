import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Building, Briefcase, FileText, Search, Download, UserCheck, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students data
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["/api/admin/students"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/students");
      return response.json();
    },
  });

  const students = studentsData?.students || [];
  const filteredStudents = students.filter((student: any) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            View and manage student profiles and applications
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <Building className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs
          </Button>
        </Link>
        <Link href="/admin/applications">
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Applications
          </Button>
        </Link>
        <Button variant="default" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Students
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Placed Students</p>
                <p className="text-xl font-bold">{students.filter((s: any) => s.isPlaced).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-xl font-bold">{students.reduce((acc: number, s: any) => acc + (s.applicationCount || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Branches</p>
                <p className="text-xl font-bold">{new Set(students.map((s: any) => s.branch)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students by name, email, or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Building className="w-4 h-4" />
              Filter by Branch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              {searchTerm ? "No Students Found" : "No Students Registered"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm 
                ? "No students match your search criteria. Try adjusting your search terms."
                : "Students will appear here once they register for the placement portal."
              }
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} variant="outline">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student: any) => (
            <Card key={student.id} className="hover:shadow-lg transition-all hover:scale-105 duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 line-clamp-1">{student.name || "Unknown Student"}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {student.branch || "No Branch"} • Final Year
                    </p>
                  </div>
                  <Badge 
                    variant={student.isPlaced ? "default" : "secondary"}
                    className={student.isPlaced ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                  >
                    {student.isPlaced ? "Placed" : "Active"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{student.email || "No email"}</span>
                  </div>
                  
                  {student.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{student.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{student.applicationCount || 0} Applications</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserCheck className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Reg: {student.collegeRegNo || "N/A"}</span>
                  </div>
                </div>

                {student.skills && student.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{student.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-xs text-muted-foreground">UG %:</span>
                    <span className="text-xs font-medium">{student.ugPercentage || "N/A"}%</span>
                    <span className="text-xs text-muted-foreground">Branch:</span>
                    <span className="text-xs font-medium">{student.branch || "N/A"}</span>
                  </div>
                  
                  <Button size="sm" className="w-full gap-2 mt-2">
                    <Users className="w-4 h-4" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
