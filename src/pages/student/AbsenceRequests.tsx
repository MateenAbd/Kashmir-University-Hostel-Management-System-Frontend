import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/services/api-services';
import { AbsenceRequestSubmission } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Send, Info, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AbsenceRequests = () => {
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRequestMutation = useMutation({
    mutationFn: async (data: AbsenceRequestSubmission) => {
      console.log('Submitting absence request:', data);
      const response = await studentApi.submitAbsenceRequest(data);
      console.log('Response:', response);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Today's absence request submitted successfully."
      });
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (error: any) => {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      let errorMessage = "Failed to submit absence request";

      const backendMessage =
        error.response?.data?.message ||           // Standard ApiResponse format
        error.response?.data?.error ||             // Alternative error format
        error.response?.data?.details ||           // Validation details
        error.message ||                           // Axios error message
        error.response?.statusText;                // HTTP status text

      console.log('Extracted backend message:', backendMessage);

      if (backendMessage) {
        if (backendMessage.includes("already exists for this date")) {
          errorMessage = "You have already submitted an absence request for today. Please check your previous requests.";
        } else if (backendMessage.includes("Cannot request absence for past dates")) {
          errorMessage = "Cannot submit absence request for past dates. Please check your system time.";
        } else if (backendMessage.includes("Invalid absence request data")) {
          errorMessage = "Invalid data provided. Please check all fields and try again.";
        } else if (backendMessage.includes("more than 30 days in advance")) {
          errorMessage = "Cannot request absence more than 30 days in advance.";
        } else if (backendMessage.includes("Student not found")) {
          errorMessage = "Student record not found. Please contact administrator.";
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.response?.status === 400) {
        errorMessage = "Bad request. Please check your input and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to perform this action.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for today's absence",
        variant: "destructive"
      });
      return;
    }

    const todayDate = format(new Date(), 'yyyy-MM-dd');

    submitRequestMutation.mutate({
      absenceDate: todayDate,
      reason: reason.trim()
    });
  };

  const today = format(new Date(), 'EEEE, MMMM do, yyyy');
  const currentTime = format(new Date(), 'h:mm a');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Submit Today's Absence Request</h1>
          <p className="text-muted-foreground">Request permission for absence on {today}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Request Absence for Today
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Current time: {currentTime}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Absence Date</span>
                </div>
                <p className="text-blue-800 font-medium">{today}</p>
                <p className="text-sm text-blue-600 mt-1">
                  You are requesting absence for today only
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Today's Absence *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason why you need to be absent today..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about your reason (e.g., feeling unwell, family emergency, medical appointment, etc.)
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">Processing Information:</p>
                    <p className="text-amber-700">
                      Your request will be automatically categorized as early or late based on the system's cutoff time.
                      Early requests are handled by monitors, while late requests require warden approval.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitRequestMutation.isPending}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitRequestMutation.isPending ? 'Submitting Request...' : 'Submit Today\'s Absence Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">1</div>
                  <div>
                    <p className="font-medium">Submit Request</p>
                    <p className="text-muted-foreground">Fill out the reason for today's absence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">2</div>
                  <div>
                    <p className="font-medium">Automatic Categorization</p>
                    <p className="text-muted-foreground">System determines if it's early or late based on cutoff time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-medium">3</div>
                  <div>
                    <p className="font-medium">Review Process</p>
                    <p className="text-muted-foreground">Monitor (early) or Warden (late) reviews your request</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-medium">4</div>
                  <div>
                    <p className="font-medium">Decision</p>
                    <p className="text-muted-foreground">Your attendance is updated based on approval/rejection</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div>
                    <p className="font-medium text-sm">Pending</p>
                    <p className="text-xs text-muted-foreground">Awaiting review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-sm">Approved</p>
                    <p className="text-xs text-muted-foreground">Marked as present</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-medium text-sm">Rejected</p>
                    <p className="text-xs text-muted-foreground">Marked as absent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AbsenceRequests;
