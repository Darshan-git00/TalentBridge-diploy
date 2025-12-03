import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QueryProvider } from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Welcome from "@/pages/Welcome";
import CollegeAuth from "@/pages/auth/CollegeAuth";
import StudentAuth from "@/pages/auth/StudentAuth";
import StudentSignupSuccess from "@/pages/auth/StudentSignupSuccess";
import RecruiterAuth from "@/pages/auth/RecruiterAuth";
import RecruiterSignupSuccess from "@/pages/auth/RecruiterSignupSuccess";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import CollegeIdGenerated from "@/pages/auth/CollegeIdGenerated";

// College Pages
import CollegeDashboard from "@/pages/college/CollegeDashboard";
import StudentsList from "@/pages/college/StudentsList";
import CollegeDrives from "@/pages/college/CollegeDrives";
import CreateDrive from "@/pages/college/CreateDrive";
import CollegeCompanies from "@/pages/college/CollegeCompanies";
import CollegeProfile from "@/pages/college/CollegeProfile";
import CollegeSettings from "@/pages/college/CollegeSettings";
import CollegeApplications from "@/pages/college/CollegeApplications";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentDrives from "@/pages/student/StudentDrives";
import StudentApplications from "@/pages/student/StudentApplications";
import StudentProfile from "@/pages/student/StudentProfile";
import StudentSettings from "@/pages/student/StudentSettings";
import AIInterview from "@/pages/student/AIInterview";

// Recruiter Pages
import RecruiterDashboard from "@/pages/recruiter/RecruiterDashboard";
import RecruiterDrives from "@/pages/recruiter/RecruiterDrives";
import RecruiterStudents from "@/pages/recruiter/RecruiterStudents";
import RecruiterProfile from "@/pages/recruiter/RecruiterProfile";
import RecruiterSettings from "@/pages/recruiter/RecruiterSettings";

import NotFound from "@/pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Welcome />} />
                
                {/* Auth Routes */}
                <Route path="/auth/college" element={<CollegeAuth />} />
                <Route path="/auth/student" element={<StudentAuth />} />
                <Route path="/auth/recruiter" element={<RecruiterAuth />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/college-success" element={<CollegeIdGenerated />} />
                <Route path="/auth/student-success" element={<StudentSignupSuccess />} />
                <Route path="/auth/recruiter-success" element={<RecruiterSignupSuccess />} />
                
                {/* College Routes - Protected */}
                <Route path="/college/dashboard" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/college/students" element={
                  <ProtectedRoute requiredRole="college">
                    <StudentsList />
                  </ProtectedRoute>
                } />
                <Route path="/college/drives" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeDrives />
                  </ProtectedRoute>
                } />
                <Route path="/college/drives/create" element={
                  <ProtectedRoute requiredRole="college">
                    <CreateDrive />
                  </ProtectedRoute>
                } />
                <Route path="/college/companies" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeCompanies />
                  </ProtectedRoute>
                } />
                <Route path="/college/applications" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeApplications />
                  </ProtectedRoute>
                } />
                <Route path="/college/profile" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeProfile />
                  </ProtectedRoute>
                } />
                <Route path="/college/settings" element={
                  <ProtectedRoute requiredRole="college">
                    <CollegeSettings />
                  </ProtectedRoute>
                } />
                
                {/* Student Routes - Protected */}
                <Route path="/student/dashboard" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/drives" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDrives />
                  </ProtectedRoute>
                } />
                <Route path="/student/applications" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentApplications />
                  </ProtectedRoute>
                } />
                <Route path="/student/ai-interview" element={
                  <ProtectedRoute requiredRole="student">
                    <AIInterview />
                  </ProtectedRoute>
                } />
                <Route path="/student/profile" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } />
                <Route path="/student/profile/edit" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } />
                <Route path="/student/settings" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentSettings />
                  </ProtectedRoute>
                } />
                
                {/* Recruiter Routes - Protected */}
                <Route path="/recruiter/dashboard" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/drives" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterDrives />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/drives/create" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <CreateDrive />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/students" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterStudents />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/profile" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterProfile />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/settings" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterSettings />
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  </ErrorBoundary>
);

export default App;
