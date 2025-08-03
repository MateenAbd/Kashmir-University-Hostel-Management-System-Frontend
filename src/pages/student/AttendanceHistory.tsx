import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/services/api-services';
import { Attendance } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const AttendanceHistory = () => {
  const [selectedMonths, setSelectedMonths] = useState<number>(3);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance-history', selectedMonths],
    queryFn: async () => {
      const response = await studentApi.getAttendanceHistory(selectedMonths);
      return response.data.data || [];
    }
  });

  // Calculate statistics
  const stats = attendance?.reduce((acc, record: Attendance) => {
    if (record.status === 'PRESENT') acc.present++;
    else acc.absent++;
    acc.total++;
    return acc;
  }, { present: 0, absent: 0, total: 0 }) || { present: 0, absent: 0, total: 0 };

  const attendancePercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  // Group attendance by month for calendar view
  const attendanceByMonth = attendance?.reduce((acc: any, record: Attendance) => {
    const monthKey = format(new Date(record.date), 'yyyy-MM');
    if (!acc[monthKey]) acc[monthKey] = {};
    acc[monthKey][record.date] = record;
    return acc;
  }, {}) || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-success/10 text-success border-success/20';
      case 'ABSENT':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            {/* <Button onClick={async () => {
          try {
            const response = await studentApi.getAttendanceHistory();
            console.log('Manual test - Full response:', response);
            console.log('Manual test - Data:', response.data);
            console.log('Manual test - Requests:', response.data.data);
          } catch (error) {
            console.error('Manual test - Error:', error);
            console.error('Manual test - Error response:', error.response);
            console.error('Manual test - Error data:', error.response?.data);
            console.error('Manual test - Error message:', error.response?.data?.message);
          }
        }}>
          Test Attendance History API Call
        </Button> */}
            <h1 className="text-3xl font-bold">Attendance History</h1>
            <p className="text-muted-foreground">View your attendance records</p>
          </div>
        </div>
        
        <Select 
          value={selectedMonths.toString()} 
          onValueChange={(value) => setSelectedMonths(parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 1 Month</SelectItem>
            <SelectItem value="3">Last 3 Months</SelectItem>
            <SelectItem value="6">Last 6 Months</SelectItem>
            <SelectItem value="12">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-success">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance %</p>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                parseFloat(attendancePercentage.toString()) >= 75 ? 'bg-success text-success-foreground' : 
                parseFloat(attendancePercentage.toString()) >= 50 ? 'bg-warning text-warning-foreground' : 
                'bg-destructive text-destructive-foreground'
              }`}>
                {attendancePercentage}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar Views */}
      <div className="space-y-6">
        {Object.entries(attendanceByMonth).map(([monthKey, monthAttendance]: [string, any]) => {
          const monthDate = new Date(monthKey + '-01');
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

          return (
            <Card key={monthKey}>
              <CardHeader>
                <CardTitle>{format(monthDate, 'MMMM yyyy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayAttendance = monthAttendance[dateStr];
                    
                    return (
                      <div
                        key={dateStr}
                        className={`
                          aspect-square p-2 rounded-lg border text-center text-sm font-medium
                          ${dayAttendance ? getStatusColor(dayAttendance.status) : 'bg-muted/50 text-muted-foreground'}
                        `}
                      >
                        <div className="text-xs">{format(day, 'd')}</div>
                        {dayAttendance && (
                          <div className="mt-1 flex justify-center">
                            {getStatusIcon(dayAttendance.status)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendance?.slice(0, 10).map((record: Attendance) => (
              <div key={record.attendanceId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">{format(new Date(record.date), 'PPPP')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(record.createdAt), 'p')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={record.status === 'PRESENT' ? 'secondary' : 'destructive'}>
                    {record.status}
                  </Badge>
                  {record.approvedBy && (
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Approved by</p>
                      <p>{record.approvedBy.email}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {attendance?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No attendance records found for the selected period
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;