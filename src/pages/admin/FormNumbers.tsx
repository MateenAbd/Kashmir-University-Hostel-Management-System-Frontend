import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/services/api-services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const FormNumbers = () => {
  const [formNumbers, setFormNumbers] = useState<string[]>(['']);
  const [bulkFormNumbers, setBulkFormNumbers] = useState('');
  const { toast } = useToast();

  const addFormNumbersMutation = useMutation({
    mutationFn: (numbers: string[]) => adminApi.addFormNumbers(numbers),
    onSuccess: () => {
      toast({ title: "Success", description: "Form numbers added successfully" });
      setFormNumbers(['']);
      setBulkFormNumbers('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add form numbers", variant: "destructive" });
    }
  });

  const addFormNumberField = () => {
    setFormNumbers([...formNumbers, '']);
  };

  const removeFormNumberField = (index: number) => {
    if (formNumbers.length > 1) {
      setFormNumbers(formNumbers.filter((_, i) => i !== index));
    }
  };

  const updateFormNumber = (index: number, value: string) => {
    const updated = [...formNumbers];
    updated[index] = value;
    setFormNumbers(updated);
  };

  const handleSubmitIndividual = () => {
    const validNumbers = formNumbers.filter(num => num.trim() !== '');
    if (validNumbers.length === 0) {
      toast({ title: "Error", description: "Please enter at least one form number", variant: "destructive" });
      return;
    }
    addFormNumbersMutation.mutate(validNumbers);
  };

  const handleSubmitBulk = () => {
    const numbers = bulkFormNumbers
      .split('\n')
      .map(num => num.trim())
      .filter(num => num !== '');
    
    if (numbers.length === 0) {
      toast({ title: "Error", description: "Please enter form numbers", variant: "destructive" });
      return;
    }
    addFormNumbersMutation.mutate(numbers);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Form Numbers Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Individual Form Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formNumbers.map((formNumber, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`form-${index}`}>Form Number {index + 1}</Label>
                  <Input
                    id={`form-${index}`}
                    placeholder="HM2024001"
                    value={formNumber}
                    onChange={(e) => updateFormNumber(index, e.target.value)}
                  />
                </div>
                {formNumbers.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFormNumberField(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={addFormNumberField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another
              </Button>
              <Button 
                onClick={handleSubmitIndividual}
                disabled={addFormNumbersMutation.isPending}
              >
                Submit Form Numbers
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Add Form Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bulk-numbers">Form Numbers (one per line)</Label>
              <Textarea
                id="bulk-numbers"
                placeholder="HM2024001&#10;HM2024002&#10;HM2024003"
                rows={10}
                value={bulkFormNumbers}
                onChange={(e) => setBulkFormNumbers(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSubmitBulk}
              disabled={addFormNumbersMutation.isPending}
              className="w-full"
            >
              Submit Bulk Form Numbers
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Form numbers should follow the format: HM2024XXX (e.g., HM2024001)</p>
            <p>• Students will need a valid form number to register</p>
            <p>• Each form number can only be used once</p>
            <p>• Use individual entry for small batches or bulk entry for large batches</p>
            <p>• Duplicate form numbers will be automatically filtered out</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormNumbers;