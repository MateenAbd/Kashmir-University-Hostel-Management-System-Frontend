import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorApi, studentApi } from '@/services/api-services';
import { AbsenceRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const EarlyAbsenceRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['early-absence-requests'],
    queryFn: async () => {
      const response = await monitorApi.getEarlyAbsenceRequests();
      return response.data.data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) => 
      monitorApi.approveAbsenceRequest(id, comments),
    onSuccess: () => {
      toast({ title: "Success", description: "Absence request approved" });
      queryClient.invalidateQueries({ queryKey: ['early-absence-requests'] });
      setSelectedRequest(null);
      setComments('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      monitorApi.rejectAbsenceRequest(id, reason),
    onSuccess: () => {
      toast({ title: "Success", description: "Absence request rejected" });
      queryClient.invalidateQueries({ queryKey: ['early-absence-requests'] });
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    }
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({ 
      id: selectedRequest.requestId, 
      comments: comments.trim() || undefined 
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide rejection reason", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ id: selectedRequest.requestId, reason: rejectionReason });
  };

  const openDialog = (request: AbsenceRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogType(type);
    setComments('');
    setRejectionReason('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Early Absence Requests</h1>
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
  Test API Call
</Button> */}


          <p className="text-muted-foreground">
            Absence requests submitted before the cutoff time
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No early absence requests found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Early requests are those submitted before the configured cutoff time
              </p>
            </CardContent>
          </Card>
        ) : (
          requests?.map((request: AbsenceRequest) => (
            <Card key={request.requestId} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {request.student.fullName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-primary border-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Early Request
                    </Badge>
                    <Badge variant={request.status === 'PENDING' ? 'default' : 
                      request.status === 'APPROVED' ? 'secondary' : 'destructive'}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Student:</span> {request.student.fullName}</p>
                    <p><span className="font-medium">Enrollment No:</span> {request.student.enrollmentNo}</p>
                    <p><span className="font-medium">Absence Date:</span> {format(new Date(request.absenceDate), 'PP')}</p>
                    <p><span className="font-medium">Submitted:</span> {format(new Date(request.submittedAt), 'PPp')}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Reason:</span></p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {request.reason}
                    </p>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openDialog(request, 'approve')}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>

                    <Button 
                      onClick={() => openDialog(request, 'reject')}
                      variant="destructive" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {request.status !== 'PENDING' && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Approved by:</span> {request.approvedBy?.email}
                    </p>
                    {request.approvedAt && (
                      <p className="text-sm">
                        <span className="font-medium">Approved at:</span> {format(new Date(request.approvedAt), 'PPp')}
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

      {/* Approve Dialog */}
      <Dialog open={dialogType === 'approve' && selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Absence Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-sm">
                <strong>Student:</strong> {selectedRequest?.student.fullName}
              </p>
              <p className="text-sm mt-1">
                <strong>Absence Date:</strong> {selectedRequest && format(new Date(selectedRequest.absenceDate), 'PP')}
              </p>
              <p className="text-sm mt-1">
                <strong>Reason:</strong> {selectedRequest?.reason}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add any comments for the student..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-success hover:bg-success/90"
              >
                Approve Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogType === 'reject' && selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Absence Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm">
                <strong>Student:</strong> {selectedRequest?.student.fullName}
              </p>
              <p className="text-sm mt-1">
                <strong>Absence Date:</strong> {selectedRequest && format(new Date(selectedRequest.absenceDate), 'PP')}
              </p>
              <p className="text-sm mt-1">
                <strong>Reason:</strong> {selectedRequest?.reason}
              </p>
            </div>
            
            <Textarea
              placeholder="Please provide reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-l-4 border-l-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-info">
            <Clock className="h-5 w-5" />
            Monitor Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• As a monitor, you can approve early absence requests (before cutoff time)</p>
            <p>• Late requests (after cutoff time) must be handled by the warden</p>
            <p>• Review each request carefully and ensure the reason is valid</p>
            <p>• You can add comments when approving requests</p>
            <p>• Rejected requests require a clear reason for the student</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyAbsenceRequests;