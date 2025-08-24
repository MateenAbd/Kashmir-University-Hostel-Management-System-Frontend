import apiClient from '@/lib/api';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  StudentRegistrationRequest,
  RegistrationRequestResponse,
  AbsenceRequestSubmission,
  AbsenceRequest,
  Attendance,
  StudentDashboardResponse,
  PaymentRequest,
  MonthlyExpenseRequest,
  DeletionRequest,
  SystemSettingResponse,
  SystemSettingRequest,
  StudentListResponse,
  Student
} from '@/types';


// Authentication API
export const authApi = {
  login: (credentials: LoginRequest) => 
    apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', credentials),
};


// Student API
export const studentApi = {
  register: (data: FormData) => 
    apiClient.post<ApiResponse<null>>('/api/students/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  submitAbsenceRequest: (data: AbsenceRequestSubmission) =>
    apiClient.post<ApiResponse<null>>('/api/students/absence-request', data),
  
  getAttendanceHistory: (months?: number) =>
    apiClient.get<ApiResponse<Attendance[]>>('/api/students/attendance-history', {
      params: { months }
    }),
  
  getDashboard: () =>
    apiClient.get<ApiResponse<StudentDashboardResponse>>('/api/students/dashboard'),
};


// Admin API
export const adminApi = {
  addFormNumbers: (formNumbers: string[]) =>
    apiClient.post<ApiResponse<null>>('/api/admin/form-numbers', formNumbers),
  
  getRegistrationRequests: () =>
    apiClient.get<ApiResponse<RegistrationRequestResponse[]>>('/api/admin/registration-requests'),
  
  approveRegistration: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/admin/registration-requests/${id}/approve`),
  
  rejectRegistration: (id: number, comments: string) =>
    apiClient.put<ApiResponse<null>>(`/api/admin/registration-requests/${id}/reject`, null, {
      params: { comments }
    }),
  
  getStudents: () => 
    apiClient.get<ApiResponse<StudentListResponse[]>>('/api/admin/students'),
  
  assignMonitor: (studentId: number) =>
    apiClient.post<ApiResponse<null>>(`/api/admin/monitor/${studentId}`),
  
  enterExpense: (monthYear: string, totalAmount: number) =>
    apiClient.post<ApiResponse<null>>('/api/admin/expenses', null, {
      params: { monthYear, totalAmount }
    }),
    
  requestDeletion: (studentId: number, reason: string) =>
    apiClient.post<ApiResponse<null>>(`/api/admin/deletion-request/${studentId}`, null, {
      params: { reason }
    }),


  getStudentsWithSearch: (query: string) =>
    apiClient.get<ApiResponse<StudentListResponse[]>>("/api/admin/students", {
      params: query ? { query } : {},
    }),


  recordPayment: (data: PaymentRequest) =>
    apiClient.post<ApiResponse<null>>('/api/admin/payments', data),

  // New method for fetching student photo as blob (handles auth for protected endpoint)
  getStudentPhoto: (filename: string) =>
    apiClient.get(`/api/admin/files/student-photo/${filename}`, { responseType: 'blob' }),
};


// Warden API
export const wardenApi = {
  getDeletionRequests: () =>
    apiClient.get<ApiResponse<DeletionRequest[]>>('/api/warden/deletion-requests'),
  
  approveDeletion: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/warden/deletion-requests/${id}/approve`),
  
  rejectDeletion: (id: number, reason: string) =>
    apiClient.put<ApiResponse<null>>(`/api/warden/deletion-requests/${id}/reject`, null, {
      params: { reason }
    }),
  
  getExpenses: () =>
    apiClient.get<ApiResponse<any[]>>('/api/warden/expenses'),
  
  getExpensesByMonth: (monthYear: string) =>
    apiClient.get<ApiResponse<any>>(`/api/warden/expenses/${monthYear}`),
  
  getLateAbsenceRequests: () =>
    apiClient.get<ApiResponse<AbsenceRequest[]>>('/api/warden/absence-requests/late'),
  
  approveAbsenceRequest: (id: number, comments?: string) =>
    apiClient.put<ApiResponse<null>>(`/api/warden/absence-requests/${id}/approve`, null, {
      params: { comments }
    }),
  
  rejectAbsenceRequest: (id: number, reason: string) =>
    apiClient.put<ApiResponse<null>>(`/api/warden/absence-requests/${id}/reject`, null, {
      params: { reason }
    }),
  
  getAllSettings: () =>
    apiClient.get<ApiResponse<SystemSettingResponse[]>>('/api/warden/settings'),
  
  getCutoffTime: () =>
    apiClient.get<ApiResponse<string>>('/api/warden/settings/absence-cutoff-time'),
  
  updateCutoffTime: (cutoffTime: string) =>
    apiClient.put<ApiResponse<null>>('/api/warden/settings/absence-cutoff-time', { cutoffTime }),
};


// Monitor API
export const monitorApi = {
  getEarlyAbsenceRequests: () =>
    apiClient.get<ApiResponse<AbsenceRequest[]>>('/api/monitor/absence-requests/early'),
  
  approveAbsenceRequest: (id: number, comments?: string) =>
    apiClient.put<ApiResponse<null>>(`/api/monitor/absence-requests/${id}/approve`, null, {
      params: { comments }
    }),
  
  rejectAbsenceRequest: (id: number, reason: string) =>
    apiClient.put<ApiResponse<null>>(`/api/monitor/absence-requests/${id}/reject`, null, {
      params: { reason }
    }),
};
