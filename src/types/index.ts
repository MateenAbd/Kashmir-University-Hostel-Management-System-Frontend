// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

// User types
export interface User {
  userId: number;
  email: string;
  role: 'ADMIN' | 'WARDEN' | 'STUDENT';
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  isMonitor: boolean;
  fullName?: string;
}

// Student types
export interface Student {
  studentId: number;
  user: User;
  enrollmentNo: string;
  fullName: string;
  phone: string;
  department: string;
  batch: string;
  pincode: string;
  district: string;
  tehsil: string;
  guardianPhone: string;
  photoUrl: string;
  isMonitor: boolean;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentListResponse {
  studentId: number;
  enrollmentNo: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  district: string;
  isMonitor: boolean;
  currentBalance: number;
  createdAt: string;
}

// Student registration types
export interface StudentRegistrationRequest {
  formNumber: string;
  email: string;
  password: string;
  enrollmentNo: string;
  fullName: string;
  phone: string;
  department: string;
  batch: string;
  pincode: string;
  district: string;
  tehsil: string;
  guardianPhone: string;
  photo: File;
}

export interface RegistrationRequestResponse {
  requestId: number;
  formNumber: string;
  email: string;
  enrollmentNo: string;
  fullName: string;
  phone: string;
  department: string;
  batch: string;
  pincode: string;
  district: string;
  tehsil: string;
  guardianPhone: string;
  photoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Attendance types
export interface Attendance {
  attendanceId: number;
  student?: {
    studentId: number;
    fullName: string;
  };
  date: string;
  status: 'PRESENT' | 'ABSENT';
  approvedBy?: {
    userId: number;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
}

// Absence request types
export interface AbsenceRequest {
  requestId: number;
  student: {
    studentId: number;
    fullName: string;
    enrollmentNo: string;
  };
  requestDate: string;
  absenceDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: {
    userId: number;
    email: string;
  };
  comments?: string;
  submittedAt: string;
  approvedAt?: string;
  isLateRequest: boolean;
  createdAt: string;
}

export interface AbsenceRequestSubmission {
  absenceDate: string;
  reason: string;
}

// Bill types
export interface Bill {
  billId: number;
  student: {
    studentId: number;
    fullName: string;
  };
  monthYear: string;
  amountDue: number;
  amountPaid: number;
  presentDays: number;
  totalDays: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'FULLY_PAID';
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface PaymentRequest {
  studentId: number;
  amount: number;
  method: 'CASH' | 'ONLINE' | 'CHEQUE';
  transactionId?: string;
}

// Dashboard types
export interface StudentDashboardResponse {
  currentBalance: number;
  pendingBillAmount: number;
  netBalance: number;
  monthlyExpenses: number;
  presentDaysThisMonth: number;
  totalDaysThisMonth: number;
  isMonitor: boolean;
  fullName: string;
}

// System settings types
export interface SystemSettingResponse {
  settingId: number;
  settingKey: string;
  settingValue: string;
  description: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface SystemSettingRequest {
  cutoffTime: string; // HH:mm format
}

// Deletion request types
export interface DeletionRequest {
  requestId: number;
  student: {
    studentId: number;
    fullName: string;
    enrollmentNo: string;
  };
  requestedBy: {
    email: string;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

// Monthly expense types
export interface MonthlyExpenseRequest {
  monthYear: string; // YYYY-MM format
  totalAmount: number;
}

export interface MonthlyExpenseResponse {
  expenseId: number;
  monthYear: string;
  totalAmount: number;
  createdAt: string;
}