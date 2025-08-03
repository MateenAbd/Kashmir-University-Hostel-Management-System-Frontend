import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Building,
  UserCheck,
  Clock,
  FileText
} from 'lucide-react';
import Logo from '@/components/ui/logo';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student registration and profile management for hostel residents"
    },
    {
      icon: Calendar,
      title: "Attendance Tracking",
      description: "Daily attendance monitoring with leave request system and warden approval"
    },
    {
      icon: DollarSign,
      title: "Fee Management",
      description: "Hostel fee calculation based on attendance with payment tracking and receipts"
    },
    {
      icon: Shield,
      title: "Role-based Access",
      description: "Admin, Warden, Student, and Monitor roles with appropriate permissions"
    },
    {
      icon: Clock,
      title: "Configurable Settings",
      description: "Customizable leave request timings and hostel-specific configurations"
    },
    {
      icon: FileText,
      title: "Request Management",
      description: "Digital workflow for registrations, leave applications, and administrative requests"
    }
  ];

  const roles = [
    {
      title: "Admin",
      description: "Manage student registrations, fee payments, and hostel administration",
      features: ["Approve registrations", "Record fee payments", "Manage expenses", "Assign monitors"],
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      title: "Warden", 
      description: "Oversee hostel operations, approve requests, and manage students",
      features: ["Approve late leave requests", "Handle student matters", "Configure hostel settings", "Generate reports"],
      color: "bg-warning/10 text-warning border-warning/20"
    },
    {
      title: "Student",
      description: "Submit requests and access personal hostel information",
      features: ["Submit leave requests", "View attendance record", "Check fee balance", "Access receipts"],
      color: "bg-success/10 text-success border-success/20"
    },
    {
      title: "Monitor",
      description: "Senior students with additional responsibilities to assist hostel management",
      features: ["All student privileges", "Approve routine requests", "Assist in administration", "Support fellow students"],
      color: "bg-purple-100 text-purple-700 border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '50px 50px',
          opacity: 0.1
        }} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20">
            North Campus, University of Kashmir
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Digital Hostel
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Management System
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Modernizing hostel administration at North Campus, University of Kashmir with 
            digital student management, attendance tracking, and streamlined administrative processes.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 h-12 px-8"
              onClick={() => navigate('/login')}
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8"
              onClick={() => navigate('/register')}
            >
              Request Registration
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Complete Hostel Solution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for university hostel management with all essential features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              User Roles & Permissions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured access control for efficient hostel management with appropriate permissions for each role
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <Badge variant="outline" className={role.color}>
                      {role.title}
                    </Badge>
                  </div>
                  <CardDescription>
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-success mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the digital transformation of hostel management at University of Kashmir North Campus
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 h-12 px-8"
              onClick={() => navigate('/register')}
            >
              Start Registration
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8"
              onClick={() => navigate('/login')}
            >
              Access Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2025 North Campus, University of Kashmir
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;