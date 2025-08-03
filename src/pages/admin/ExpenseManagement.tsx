import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/services/api-services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';


const ExpenseManagement = () => {
const [monthYear, setMonthYear] = useState(format(new Date(), 'yyyy-MM'));
const [totalAmount, setTotalAmount] = useState('');
const { toast } = useToast();


const enterExpenseMutation = useMutation({
mutationFn: ({ monthYear, totalAmount }: { monthYear: string; totalAmount: number }) =>
adminApi.enterExpense(monthYear, totalAmount),
onSuccess: () => {
toast({
title: "Success",
description: "Monthly expense entered and bills generated successfully"
});
setTotalAmount('');
},
onError: () => {
toast({
title: "Error",
description: "Failed to enter monthly expense",
variant: "destructive"
});
}
});


const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

const amount = parseFloat(totalAmount);
if (isNaN(amount) || amount <= 0) {
toast({
title: "Error",
description: "Please enter a valid amount",
variant: "destructive"
});
return;
}


if (!monthYear) {
toast({
title: "Error",
description: "Please select a month and year",
variant: "destructive"
});
return;
}


enterExpenseMutation.mutate({ monthYear, totalAmount: amount });
};


return (
<div className="space-y-6">
<h1 className="text-3xl font-bold">Monthly Expense Management</h1>


<div className="grid md:grid-cols-2 gap-6">
<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2">
<DollarSign className="h-5 w-5" />
Enter Monthly Expense
</CardTitle>
</CardHeader>
<CardContent>
<form onSubmit={handleSubmit} className="space-y-4">
<div>
<Label htmlFor="month-year">Month & Year</Label>
<div className="relative">
<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
id="month-year"
type="month"
value={monthYear}
onChange={(e) => setMonthYear(e.target.value)}
className="pl-10"
required
/>
</div>
</div>


<div>
<Label htmlFor="total-amount">Total Monthly Expense (₹)</Label>
<div className="relative">
<DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
id="total-amount"
type="number"
step="0.01"
min="0"
placeholder="25000.00"
value={totalAmount}
onChange={(e) => setTotalAmount(e.target.value)}
className="pl-10"
required
/>
</div>
</div>


<Button
type="submit"
disabled={enterExpenseMutation.isPending}
className="w-full"
>
{enterExpenseMutation.isPending ? 'Processing...' : 'Enter Expense & Generate Bills'}
</Button>
</form>
</CardContent>
</Card>


<Card>
<CardHeader>
<CardTitle>How It Works</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-3 text-sm text-muted-foreground">
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">1</div>
<p>Enter the total monthly expense for the hostel</p>
</div>
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">2</div>
<p>System automatically calculates each student's bill based on their attendance</p>
</div>
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</div>
<p>Bills are generated proportionally: (Student Present Days ÷ Total Present Days of All Students) × Total Monthly Expense</p>
</div>
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">4</div>
<p>Students can view their bills on their dashboard</p>
</div>
</div>


<div className="p-3 bg-muted rounded-lg mt-4">
<p className="text-sm font-medium mb-2">Important Notes:</p>
<ul className="text-sm text-muted-foreground space-y-1">
<li>• Bills are generated automatically for all active students</li>
<li>• Only students present in that month will be charged</li>
<li>• Fair distribution ensures sum of all bills equals total expense</li>
<li>• Existing bills for the same month will be updated</li>
</ul>
</div>
</CardContent>
</Card>
</div>


<Card>
<CardHeader>
<CardTitle>Recent Actions</CardTitle>
</CardHeader>
<CardContent>
<p className="text-muted-foreground text-center py-8">
Recent expense entries will appear here
</p>
</CardContent>
</Card>
</div>
);
};


export default ExpenseManagement;