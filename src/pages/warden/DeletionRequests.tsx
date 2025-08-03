import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wardenApi } from '@/services/api-services';
import { DeletionRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const DeletionRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['deletion-requests'],
    queryFn: async () => {
      const response = await wardenApi.getDeletionRequests();
      return response.data.data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => wardenApi.approveDeletion(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Deletion request approved" });
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve deletion", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      wardenApi.rejectDeletion(id, reason),
    onSuccess: () => {
      toast({ title: "Success", description: "Deletion request rejected" });
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject deletion", variant: "destructive" });
    }
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide rejection reason", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ id: selectedRequest.requestId, reason: rejectionReason });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">Student Deletion Requests</h1>
          <p className="text-muted-foreground">Review and approve student deletion requests from admin</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No deletion requests found</p>
            </CardContent>
          </Card>
        ) : (
          requests?.map((request: DeletionRequest) => (
            <Card key={request.requestId} className="border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Delete: {request.student.fullName}
                  </CardTitle>
                  <Badge variant={request.status === 'PENDING' ? 'default' : 
                    request.status === 'APPROVED' ? 'secondary' : 'destructive'}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Student Name:</span> {request.student.fullName}</p>
                    <p><span className="font-medium">Enrollment No:</span> {request.student.enrollmentNo}</p>
                    <p><span className="font-medium">Requested By:</span> {request.requestedBy.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Request Date:</span> {format(new Date(request.createdAt), 'PPp')}</p>
                    <p><span className="font-medium">Reason:</span></p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {request.reason}
                    </p>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(request.requestId)}
                      disabled={approveMutation.isPending}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Deletion
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Deletion Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-destructive/10 rounded-lg">
                            <p className="text-sm">
                              <strong>Student:</strong> {request.student.fullName} ({request.student.enrollmentNo})
                            </p>
                            <p className="text-sm mt-1">
                              <strong>Requested by:</strong> {request.requestedBy.email}
                            </p>
                            <p className="text-sm mt-1">
                              <strong>Reason:</strong> {request.reason}
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
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Important Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Approving a deletion request will permanently remove all student data</p>
            <p>• This action cannot be undone once approved</p>
            <p>• All student records, bills, attendance, and balance information will be deleted</p>
            <p>• Only approve if you are certain the student should be removed from the system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequests;