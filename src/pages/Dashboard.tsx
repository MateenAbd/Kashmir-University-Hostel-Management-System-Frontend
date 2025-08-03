import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi } from '@/services/api-services';
import { StudentDashboardResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, hasRole, isMonitor } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasRole('STUDENT')) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await studentApi.getDashboard();
      setDashboardData(response.data.data!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAttendancePercentage = () => {
    if (!dashboardData) return 0;
    return (dashboardData.presentDaysThisMonth / dashboardData.totalDaysThisMonth) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, {dashboardData?.fullName || user?.email}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your hostel management dashboard
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {user?.role}
          </Badge>
          {isMonitor && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              MONITOR
            </Badge>
          )}
        </div>
      </div>

      {/* Student Dashboard */}
      {hasRole('STUDENT') && dashboardData && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${dashboardData.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{dashboardData.netBalance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Net balance (after pending bills)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <DollarSign className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  ₹{dashboardData.pendingBillAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount due
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {getAttendancePercentage().toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.presentDaysThisMonth}/{dashboardData.totalDaysThisMonth} days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Progress */}
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Attendance
              </CardTitle>
              <CardDescription>
                Your attendance for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Present Days: {dashboardData.presentDaysThisMonth}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Total: {dashboardData.totalDaysThisMonth}
                  </span>
                </div>
                <Progress 
                  value={getAttendancePercentage()} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Maintain good attendance for lower monthly charges
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Expense Info */}
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Expenses
              </CardTitle>
              <CardDescription>
                Total hostel expenses for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                ₹{dashboardData.monthlyExpenses.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                This amount is distributed among all students based on their attendance
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Admin/Warden Dashboard */}
      {(hasRole('ADMIN') || hasRole('WARDEN')) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {hasRole('ADMIN') 
                  ? 'Manage student registrations, payments, and expenses'
                  : 'Review deletion requests, absence requests, and system settings'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the sidebar navigation to access your admin tools and reports
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {hasRole('ADMIN') 
                  ? 'Record payments and enter monthly expenses'
                  : 'View financial reports and expense summaries'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
