import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api-services';
import { PaymentRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, User, DollarSign } from 'lucide-react';
import { StudentListResponse } from '@/types';

const PaymentManagement = () => {
  const [formData, setFormData] = useState<PaymentRequest>({
    studentId: 0,
    amount: 0,
    method: 'CASH',
    transactionId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Fetch all students (called once when searchTerm >= 2, then cached)
  const { data: allStudents = [], isLoading: isSearching } = useQuery({
    queryKey: ['students'], // Removed searchTerm to avoid refetching on every change
    queryFn: async () => {
      const response = await adminApi.getStudents(); // Assume adminApi.getStudents returns ApiResponse<StudentListResponse[]>
      return response.data.data || [];
    },
    enabled: searchTerm.length >= 2, // Only fetch if term is at least 2 characters
  });

  // Client-side filter based on searchTerm
  const filteredStudents = allStudents.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(term) ||
      student.enrollmentNo.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: PaymentRequest) => adminApi.recordPayment(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Payment recorded successfully" });
      setFormData({
        studentId: 0,
        amount: 0,
        method: 'CASH',
        transactionId: ''
      });
      setSearchTerm('');
      setShowResults(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.studentId <= 0) {
      toast({ title: "Error", description: "Please select a valid student", variant: "destructive" });
      return;
    }

    if (formData.amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (formData.method === 'ONLINE' && !formData.transactionId?.trim()) {
      toast({ title: "Error", description: "Transaction ID is required for online payments", variant: "destructive" });
      return;
    }

    recordPaymentMutation.mutate(formData);
  };

  const updateFormData = (field: keyof PaymentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectStudent = (student: StudentListResponse) => {
    updateFormData('studentId', student.studentId);
    setSearchTerm(`${student.fullName} (${student.enrollmentNo})`);
    setShowResults(false); // Hide dropdown after selection
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Record Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="student-search">Search Student</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="student-search"
                    type="text"
                    placeholder="Search by name, enrollment number, or email"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(true); // Show results on active typing/search
                    }}
                    className="pl-10"
                    required
                  />
                </div>
                {showResults && searchTerm.length >= 2 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-background">
                    {isSearching ? (
                      <p className="p-2 text-center text-muted-foreground">Searching...</p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="p-2 text-center text-muted-foreground">No students found</p>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.studentId}
                          onClick={() => handleSelectStudent(student)}
                          className="p-2 cursor-pointer hover:bg-muted"
                        >
                          {student.fullName} - {student.enrollmentNo} ({student.email})
                        </div>
                      ))
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Select a student from the search results
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5000.00"
                    value={formData.amount || ''}
                    onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value) => updateFormData('method', value as PaymentRequest['method'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.method !== 'CASH' && (
                <div>
                  <Label htmlFor="transaction-id">
                    {formData.method === 'ONLINE' ? 'Transaction ID' : 'Cheque Number'}
                  </Label>
                  <Input
                    id="transaction-id"
                    placeholder={formData.method === 'ONLINE' ? 'TXN123456789' : 'CHQ123456'}
                    value={formData.transactionId || ''}
                    onChange={(e) => updateFormData('transactionId', e.target.value)}
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={recordPaymentMutation.isPending}
                className="w-full"
              >
                {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">1</div>
                <p>Search for the student by name, enrollment number, or email</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">2</div>
                <p>Enter the exact amount received from the student</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</div>
                <p>Select the payment method used by the student</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">4</div>
                <p>For online payments or cheques, provide the transaction ID or cheque number</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Payment Methods:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Cash:</strong> Physical cash payment</li>
                <li><strong>Online:</strong> UPI, Net Banking, Card payments</li>
                <li><strong>Cheque:</strong> Bank cheque payments</li>
              </ul>
            </div>

            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm font-medium text-success-foreground mb-1">Note:</p>
              <p className="text-sm text-success-foreground/80">
                Recording a payment will automatically add the amount to the student's balance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Recent payment records will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;
