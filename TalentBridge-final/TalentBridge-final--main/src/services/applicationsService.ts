import { ApiResponse, apiClient } from './api';
import { Application, Drive, Interview, PaginatedResponse, PaginationParams } from './types';

// Applications service
export const applicationsService = {
  // Get all applications
  getApplications: async (params?: PaginationParams & {
    search?: string;
    status?: string;
    driveId?: string;
    studentId?: string;
    collegeId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.driveId) queryParams.append('driveId', params.driveId);
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      if (params?.collegeId) queryParams.append('collegeId', params.collegeId);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get applications error:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (applicationId: string): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Get application by ID error:', error);
      throw error;
    }
  },

  // Create application
  createApplication: async (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.post('/applications', applicationData);
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Create application error:', error);
      throw error;
    }
  },

  // Update application
  updateApplication: async (applicationId: string, applicationData: Partial<Application>): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.put(`/applications/${applicationId}`, applicationData);
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Update application error:', error);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId: string, status: Application['status'], feedback?: string): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.put(`/applications/${applicationId}/status`, {
        status,
        feedback
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Update application status error:', error);
      throw error;
    }
  },

  // Add application feedback
  addApplicationFeedback: async (applicationId: string, feedback: string): Promise<ApiResponse<Application>> => {
    try {
      const response = await apiClient.post(`/applications/${applicationId}/feedback`, {
        feedback
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Add application feedback error:', error);
      throw error;
    }
  },

  // Get application feedback
  getApplicationFeedback: async (applicationId: string): Promise<ApiResponse<string[]>> => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/feedback`);
      return response.data as ApiResponse<string[]>;
    } catch (error) {
      console.error('❌ Get application feedback error:', error);
      throw error;
    }
  },

  // Get application statistics
  getApplicationsStats: async (params?: {
    driveId?: string;
    collegeId?: string;
    studentId?: string;
  }): Promise<ApiResponse<{
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    rejected: number;
    scheduled: number;
    completed: number;
  }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.driveId) queryParams.append('driveId', params.driveId);
      if (params?.collegeId) queryParams.append('collegeId', params.collegeId);
      if (params?.studentId) queryParams.append('studentId', params.studentId);

      const response = await apiClient.get(`/applications/stats?${queryParams.toString()}`);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Get applications stats error:', error);
      throw error;
    }
  },

  // Get application interviews
  getApplicationInterviews: async (applicationId: string): Promise<ApiResponse<Interview[]>> => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/interviews`);
      return response.data as ApiResponse<Interview[]>;
    } catch (error) {
      console.error('❌ Get application interviews error:', error);
      throw error;
    }
  },

  // Update interview status
  updateInterviewStatus: async (applicationId: string, interviewId: string, status: Interview['status']): Promise<ApiResponse<Interview>> => {
    try {
      const response = await apiClient.put(`/applications/${applicationId}/interviews/${interviewId}`, {
        status
      });
      return response.data as ApiResponse<Interview>;
    } catch (error) {
      console.error('❌ Update interview status error:', error);
      throw error;
    }
  },

  // Apply to drive (student action)
  applyToDrive: async (driveId: string, applicationData?: {
    resume?: string;
    coverLetter?: string;
  }): Promise<ApiResponse<Application>> => {
    try {
      // The backend will get studentId from the authenticated JWT token
      const response = await apiClient.post(`/applications`, {
        driveId,
        ...applicationData
      });
      return response.data as ApiResponse<Application>;
    } catch (error) {
      console.error('❌ Apply to drive error:', error);
      throw error;
    }
  },

  // Get student applications
  getStudentApplications: async (studentId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Application>>> => {
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

  // Get drive applications (recruiter/college view)
  getDriveApplications: async (driveId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/drives/${driveId}/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get drive applications error:', error);
      throw error;
    }
  },

  // Schedule interview
  scheduleInterview: async (applicationId: string, interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Interview>> => {
    try {
      const response = await apiClient.post(`/applications/${applicationId}/interviews`, interviewData);
      return response.data as ApiResponse<Interview>;
    } catch (error) {
      console.error('❌ Schedule interview error:', error);
      throw error;
    }
  },

  // Withdraw application
  withdrawApplication: async (applicationId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/applications/${applicationId}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('❌ Withdraw application error:', error);
      throw error;
    }
  }
};
