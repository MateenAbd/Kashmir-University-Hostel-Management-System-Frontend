import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api-services';
import { StudentListResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Trash2, Search, User, Phone, Mail, GraduationCap, MapPin, Calendar, Wallet } from 'lucide-react';
import { format } from 'date-fns';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentListResponse | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all students
  const { data: studentsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-students'],
    queryFn: adminApi.getStudents,
    select: (response) => response.data.data || [],
  });

  // Assign/Remove monitor role mutation
  const assignMonitorMutation = useMutation({
    mutationFn: (studentId: number) => adminApi.assignMonitor(studentId),
    onSuccess: (response, studentId) => {
      const student = studentsResponse?.find(s => s.studentId === studentId);
      const isCurrentlyMonitor = student?.isMonitor;
      toast({ 
        title: "Success", 
        description: isCurrentlyMonitor 
          ? "Monitor role removed successfully" 
          : "Monitor role assigned successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update monitor role", 
        variant: "destructive" 
      });
    }
  });

  // Request student deletion mutation
  const requestDeletionMutation = useMutation({
    mutationFn: ({ studentId, reason }: { studentId: number; reason: string }) => 
      adminApi.requestDeletion(studentId, reason),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Deletion request submitted successfully. Warden will review the request." 
      });
      setSelectedStudent(null);
      setDeletionReason('');
      setIsDeletionDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to submit deletion request", 
        variant: "destructive" 
      });
    }
  });

  // Filter students based on search term
  const filteredStudents = studentsResponse?.filter((student: StudentListResponse) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.district.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAssignMonitor = (student: StudentListResponse) => {
    assignMonitorMutation.mutate(student.studentId);
  };

  const handleRequestDeletion = () => {
    if (!selectedStudent || !deletionReason.trim()) {
      toast({ 
        title: "Error", 
        description: "Please provide a reason for deletion", 
        variant: "destructive" 
      });
      return;
    }
    requestDeletionMutation.mutate({ 
      studentId: selectedStudent.studentId, 
      reason: deletionReason 
    });
  };

  const openDeletionDialog = (student: StudentListResponse) => {
    setSelectedStudent(student);
    setDeletionReason('');
    setIsDeletionDialogOpen(true);
  };

  const closeDeletionDialog = () => {
    setSelectedStudent(null);
    setDeletionReason('');
    setIsDeletionDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="font-semibold mb-2">Failed to load students</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the student data.
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-students'] })}
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">
            Manage students, assign monitor roles, and request deletions
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, enrollment, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{studentsResponse?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monitors</p>
                <p className="text-2xl font-bold">
                  {studentsResponse?.filter(s => s.isMonitor)?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">
                  {new Set(studentsResponse?.map(s => s.department))?.size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">
                  ₹{studentsResponse?.reduce((sum, s) => sum + s.currentBalance, 0)?.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground">No students found matching "{searchTerm}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">No students found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Students will appear here after their registration requests are approved
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student: StudentListResponse) => (
            <Card key={student.studentId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{student.enrollmentNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {student.isMonitor && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Monitor
                      </Badge>
                    )}
                    <Badge variant="outline">Student</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{student.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Batch</p>
                        <p className="font-medium">{student.batch}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">District</p>
                        <p className="font-medium">{student.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className={`font-medium ${student.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{student.currentBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleAssignMonitor(student)}
                    disabled={assignMonitorMutation.isPending}
                    size="sm"
                    variant={student.isMonitor ? "secondary" : "outline"}
                  >
                    {student.isMonitor ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Monitor
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Assign Monitor
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openDeletionDialog(student)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Request Deletion
                  </Button>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Joined: {format(new Date(student.createdAt), 'PPP')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Deletion Dialog */}
      <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Student Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStudent && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 p-1 rounded-full">
                      <User className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedStudent.fullName}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.enrollmentNo}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This will send a deletion request to the warden for approval. 
                    Once approved by the warden, all student data will be permanently removed from the system.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for deletion *</label>
                  <Textarea
                    placeholder="Please provide a detailed reason for requesting deletion..."
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This reason will be visible to the warden when reviewing the request.
                  </p>
                </div>
              </>
            )}
            
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={closeDeletionDialog}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleRequestDeletion}
                disabled={requestDeletionMutation.isPending || !deletionReason.trim()}
              >
                {requestDeletionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
