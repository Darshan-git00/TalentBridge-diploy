import { ApiResponse, apiClient } from './api';
import { Student, Drive, Application, Interview, Notification, PaginatedResponse, PaginationParams } from './types';

// Student service
export const studentService = {
  // Get student profile
  getProfile: async (studentId: string): Promise<ApiResponse<Student>> => {
    try {
      // Use /me endpoint for getting current user's profile
      const response = await apiClient.get('/students/me');
      return response.data as ApiResponse<Student>;
    } catch (error) {
      console.error('❌ Get student profile error:', error);
      throw error;
    }
  },

  // Update student profile
  updateProfile: async (studentId: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
    try {
      // Use /me endpoint for updating current user's profile
      const response = await apiClient.put('/students/me', data);
      return response.data as ApiResponse<Student>;
    } catch (error) {
      console.error('❌ Update student profile error:', error);
      throw error;
    }
  },

  // Get available drives
  getDrives: async (params?: PaginationParams & {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
  }): Promise<ApiResponse<PaginatedResponse<Drive>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) queryParams.append('location', params.location);

      const response = await apiClient.get(`/public/drives?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Drive>>;
    } catch (error) {
      console.error('❌ Get drives error:', error);
      throw error;
    }
  },

  // Get drive by ID
  getDriveById: async (driveId: string): Promise<ApiResponse<Drive>> => {
    try {
      const response = await apiClient.get(`/drives/${driveId}`);
      return response.data as ApiResponse<Drive>;
    } catch (error) {
      console.error('❌ Get drive by ID error:', error);
      throw error;
    }
  },

  // Get student applications
  getApplications: async (studentId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/students/${studentId}/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get student applications error:', error);
      throw error;
    }
  },

  // Apply to drive
  applyToDrive: async (driveId: string, data?: any): Promise<ApiResponse<Application>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.post(`/applications`, {
        driveId,
        ...data
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Apply to drive error:', error);
      throw error;
    }
  },

  // Update application
  updateApplication: async (applicationId: string, data: Partial<Application>): Promise<ApiResponse<Application>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.put(`/applications/${applicationId}`, data);
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Update application error:', error);
      throw error;
    }
  },

  // Withdraw application
  withdrawApplication: async (applicationId: string): Promise<ApiResponse<void>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.delete(`/applications/${applicationId}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('❌ Withdraw application error:', error);
      throw error;
    }
  },

  // Get student interviews
  getInterviews: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Interview>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.get(`/interviews?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Interview>>;
    } catch (error) {
      console.error('❌ Get student interviews error:', error);
      throw error;
    }
  },

  // Get interview by ID
  getInterviewById: async (interviewId: string): Promise<ApiResponse<Interview>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.get(`/interviews/${interviewId}`);
      return response.data as ApiResponse<Interview>;
    } catch (error) {
      console.error('❌ Get interview by ID error:', error);
      throw error;
    }
  },

  // Get student notifications
  getNotifications: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Notification>>;
    } catch (error) {
      console.error('❌ Get student notifications error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data as ApiResponse<Notification>;
    } catch (error) {
      console.error('❌ Mark notification read error:', error);
      throw error;
    }
  },

  // Start AI interview
  startAIInterview: async (applicationId: string): Promise<ApiResponse<Interview>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.post(`/interviews/ai`, {
        applicationId
      });
      return response.data as ApiResponse<Interview>;
    } catch (error) {
      console.error('❌ Start AI interview error:', error);
      throw error;
    }
  },

  // Submit AI interview
  submitAIInterview: async (interviewId: string, data: any): Promise<ApiResponse<any>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.post(`/interviews/${interviewId}/submit`, data);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Submit AI interview error:', error);
      throw error;
    }
  }
};
