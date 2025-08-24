import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicRegister from "./pages/PublicRegister";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminRegistrationRequests from "./pages/admin/RegistrationRequests";
import AdminFormNumbers from "./pages/admin/FormNumbers";
import AdminStudentManagement from "./pages/admin/StudentManagement";
import AdminPaymentManagement from "./pages/admin/PaymentManagement";
import AdminExpenseManagement from "./pages/admin/ExpenseManagement";

// Warden Pages
import WardenDeletionRequests from "./pages/warden/DeletionRequests";
import WardenLateAbsenceRequests from "./pages/warden/LateAbsenceRequests";
import WardenSystemSettings from "./pages/warden/SystemSettings";

// Student Pages
import StudentAttendanceHistory from "./pages/student/AttendanceHistory";
import StudentAbsenceRequests from "./pages/student/AbsenceRequests";

// Monitor Pages
import MonitorEarlyAbsenceRequests from "./pages/monitor/EarlyAbsenceRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PublicRegister />} />
            
            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Admin routes */}
              <Route path="admin/registrations" element={<ProtectedRoute requiredRole="ADMIN"><AdminRegistrationRequests /></ProtectedRoute>} />
              <Route path="admin/form-numbers" element={<ProtectedRoute requiredRole="ADMIN"><AdminFormNumbers /></ProtectedRoute>} />
              <Route path="admin/students" element={<ProtectedRoute requiredRole="ADMIN"><AdminStudentManagement /></ProtectedRoute>} />
              <Route path="admin/payments" element={<ProtectedRoute requiredRole="ADMIN"><AdminPaymentManagement /></ProtectedRoute>} />
              <Route path="admin/expenses" element={<ProtectedRoute requiredRole="ADMIN"><AdminExpenseManagement /></ProtectedRoute>} />
              
              {/* Warden routes */}
              <Route path="warden/deletions" element={<ProtectedRoute requiredRole="WARDEN"><WardenDeletionRequests /></ProtectedRoute>} />
              <Route path="warden/absence-requests" element={<ProtectedRoute requiredRole="WARDEN"><WardenLateAbsenceRequests /></ProtectedRoute>} />
              <Route path="warden/settings" element={<ProtectedRoute requiredRole="WARDEN"><WardenSystemSettings /></ProtectedRoute>} />
              
              {/* Student routes */}
              <Route path="student/attendance" element={<ProtectedRoute requiredRole="STUDENT"><StudentAttendanceHistory /></ProtectedRoute>} />
              <Route path="student/absence-requests" element={<ProtectedRoute requiredRole="STUDENT"><StudentAbsenceRequests /></ProtectedRoute>} />
              
              {/* Monitor routes */}
              <Route path="monitor/absence-requests" element={<ProtectedRoute requiredRole="STUDENT" requireMonitor={true}><MonitorEarlyAbsenceRequests /></ProtectedRoute>} />
              
            </Route> 
            
            {/* Unauthorized page */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">403</h1>
                  <p className="text-xl text-muted-foreground mb-4">Access Denied</p>
                  <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
              </div>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
