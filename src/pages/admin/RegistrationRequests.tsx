import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api-services';
import { RegistrationRequestResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, Search } from 'lucide-react';
import { format } from 'date-fns';

const RegistrationRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestResponse | null>(null);
  const [rejectComments, setRejectComments] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['registration-requests'],
    queryFn: async () => {
      const response = await adminApi.getRegistrationRequests();
      return response.data.data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveRegistration(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Registration request approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve registration", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) => 
      adminApi.rejectRegistration(id, comments),
    onSuccess: () => {
      toast({ title: "Success", description: "Registration request rejected" });
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] });
      setSelectedRequest(null);
      setRejectComments('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject registration", variant: "destructive" });
    }
  });

  const filteredRequests = requests?.filter((request: RegistrationRequestResponse) =>
    request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectComments.trim()) {
      toast({ title: "Error", description: "Please provide rejection comments", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ id: selectedRequest.requestId, comments: rejectComments });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Registration Requests</h1>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or enrollment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No registration requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request: RegistrationRequestResponse) => (
            <Card key={request.requestId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{request.fullName}</CardTitle>
                  <Badge variant={request.status === 'PENDING' ? 'default' : 
                    request.status === 'APPROVED' ? 'secondary' : 'destructive'}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {request.email}</p>
                    <p><span className="font-medium">Form Number:</span> {request.formNumber}</p>
                    <p><span className="font-medium">Enrollment No:</span> {request.enrollmentNo}</p>
                    <p><span className="font-medium">Department:</span> {request.department}</p>
                    <p><span className="font-medium">Batch:</span> {request.batch}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Phone:</span> {request.phone}</p>
                    <p><span className="font-medium">Guardian Phone:</span> {request.guardianPhone}</p>
                    <p><span className="font-medium">District:</span> {request.district}</p>
                    <p><span className="font-medium">Tehsil:</span> {request.tehsil}</p>
                    <p><span className="font-medium">Submitted:</span> {format(new Date(request.createdAt), 'PPp')}</p>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Registration Details - {request.fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Form Number</label>
                                <p className="text-sm text-muted-foreground">{request.formNumber}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm text-muted-foreground">{request.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <p className="text-sm text-muted-foreground">{request.fullName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Enrollment Number</label>
                                <p className="text-sm text-muted-foreground">{request.enrollmentNo}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-sm text-muted-foreground">{request.phone}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Department</label>
                                <p className="text-sm text-muted-foreground">{request.department}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Batch</label>
                                <p className="text-sm text-muted-foreground">{request.batch}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Guardian Phone</label>
                                <p className="text-sm text-muted-foreground">{request.guardianPhone}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">District</label>
                                <p className="text-sm text-muted-foreground">{request.district}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Tehsil</label>
                                <p className="text-sm text-muted-foreground">{request.tehsil}</p>
                              </div>
                            </div>
                          </div>
                          
                          {request.photoUrl && (
                            <div>
                              <label className="text-sm font-medium">Photo</label>
                              <div className="mt-2">
                                <StudentPhotoLoader photoUrl={request.photoUrl} />
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      onClick={() => handleApprove(request.requestId)}
                      disabled={approveMutation.isPending}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Registration Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to reject <strong>{request.fullName}'s</strong> registration request?</p>
                          <Textarea
                            placeholder="Please provide reason for rejection..."
                            value={rejectComments}
                            onChange={(e) => setRejectComments(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleReject}
                              disabled={rejectMutation.isPending || !rejectComments.trim()}
                            >
                              Reject Request
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {request.status !== 'PENDING' && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Reviewed by:</span> {request.reviewedBy}
                    </p>
                    {request.reviewedAt && (
                      <p className="text-sm">
                        <span className="font-medium">Reviewed at:</span> {format(new Date(request.reviewedAt), 'PPp')}
                      </p>
                    )}
                    {request.comments && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Comments:</span> {request.comments}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// New component for loading student photo with auth (uses blob fetching to avoid 401)
const StudentPhotoLoader: React.FC<{ photoUrl: string }> = ({ photoUrl }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await adminApi.getStudentPhoto(photoUrl);
        const blob = response.data;
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      } catch (err) {
        console.error('Failed to load photo:', err);
        setError('Unable to load photo');
      }
    };

    loadImage();

    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [photoUrl]);

  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!imageSrc) return <p className="text-muted-foreground text-sm">Loading photo...</p>;

  return (
    <img 
      src={imageSrc} 
      alt="Student Photo"
      className="w-32 h-32 object-cover rounded-lg border"
    />
  );
};

export default RegistrationRequests;
