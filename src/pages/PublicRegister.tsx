import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Upload, FileImage, CheckCircle } from 'lucide-react';

import { studentApi } from '@/services/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';

const registrationSchema = z.object({
  formNumber: z.string().min(1, 'Form number is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  enrollmentNo: z.string().min(1, 'Enrollment number is required'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  department: z.string().min(1, 'Department is required'),
  batch: z.string().min(1, 'Batch is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  district: z.string().min(1, 'District is required'),
  tehsil: z.string().min(1, 'Tehsil is required'),
  guardianPhone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit guardian phone number'),
  photo: z.any().refine((files) => files?.length > 0, 'Photo is required'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const steps = [
  { title: 'Personal Information', fields: ['formNumber', 'email', 'password', 'enrollmentNo', 'fullName', 'phone'] },
  { title: 'Academic Information', fields: ['department', 'batch'] },
  { title: 'Address Information', fields: ['pincode', 'district', 'tehsil', 'guardianPhone'] },
  { title: 'Photo Upload', fields: ['photo'] },
];

const PublicRegister = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('photo', e.target.files);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentStep = async () => {
    const currentFields = steps[currentStep].fields;
    const result = await form.trigger(currentFields as any);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photo') {
          formData.append(key, value[0]);
        } else {
          formData.append(key, value as string);
        }
      });

      await studentApi.register(formData);

      toast({
        title: "Registration Submitted",
        description: "Your registration request has been submitted successfully. You will be notified once it's reviewed.",
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Registration</h1>
          <p className="text-muted-foreground">Join our hostel community</p>
        </div>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Step {currentStep + 1} of {steps.length}</CardTitle>
                <CardDescription>{steps[currentStep].title}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-primary">{Math.round(progress)}%</div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="formNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Form Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., HM2024001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enrollmentNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., EN2024001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="your.email@example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="Create a password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10-digit phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Academic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Computer Science" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="batch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Year</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 2024" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Address Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="6-digit pincode" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your district" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tehsil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tehsil</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your tehsil" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="guardianPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10-digit guardian phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 4: Photo Upload */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Photo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors relative" style={{ height: '220px', overflow: 'hidden' }}>
                                {photoPreview ? (
                                  <div className="space-y-4">
                                    <img
                                      src={photoPreview}
                                      alt="Preview"
                                      className="w-32 h-32 object-cover rounded-lg mx-auto border"
                                    />
                                    <p className="text-sm text-muted-foreground">Photo uploaded successfully</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <FileImage className="w-12 h-12 text-muted-foreground mx-auto" />
                                    <div>
                                      <p className="text-sm font-medium">Click to upload photo</p>
                                      <p className="text-xs text-muted-foreground">JPEG or PNG, max 2MB</p>
                                    </div>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={handlePhotoChange}
                                  className="opacity-0 absolute left-0 top-0 w-full h-full cursor-pointer"
                                  style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
                                  tabIndex={-1}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={18} />
                          Submit Registration
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicRegister;