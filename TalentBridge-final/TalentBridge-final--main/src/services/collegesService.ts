import { ApiResponse, apiClient } from './api';
import { College, Student, Drive, Application, PaginatedResponse, PaginationParams } from './types';

// Colleges service
export const collegesService = {
  // Get college profile
  getProfile: async (collegeId: string): Promise<ApiResponse<College>> => {
    try {
      const response = await apiClient.get(`/colleges/${collegeId}`);
      return response.data as ApiResponse<College>;
    } catch (error) {
      console.error('❌ Get college profile error:', error);
      throw error;
    }
  },

  // Update college profile
  updateProfile: async (collegeId: string, data: Partial<College>): Promise<ApiResponse<College>> => {
    try {
      const response = await apiClient.put(`/colleges/${collegeId}`, data);
      return response.data as ApiResponse<College>;
    } catch (error) {
      console.error('❌ Update college profile error:', error);
      throw error;
    }
  },

  // Get college students
  getStudents: async (collegeId: string, params?: PaginationParams & {
    search?: string;
    course?: string;
    branch?: string;
    year?: string;
    minCGPA?: number;
    skills?: string[];
  }): Promise<{ students: Student[], pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.course) queryParams.append('course', params.course);
      if (params?.branch) queryParams.append('branch', params.branch);
      if (params?.year) queryParams.append('year', params.year);
      if (params?.minCGPA) queryParams.append('minCGPA', params.minCGPA.toString());
      if (params?.skills) queryParams.append('skills', params.skills.join(','));

      const response = await apiClient.get(`/colleges/${collegeId}/students?${queryParams.toString()}`);
      return response.data as { students: Student[], pagination: any };
    } catch (error) {
      console.error('❌ Get college students error:', error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (collegeId: string, studentId: string): Promise<ApiResponse<Student>> => {
    try {
      const response = await apiClient.get(`/colleges/${collegeId}/students/${studentId}`);
      return response.data as ApiResponse<Student>;
    } catch (error) {
      console.error('❌ Get college student by ID error:', error);
      throw error;
    }
  },

  // Add student
  addStudent: async (collegeId: string, studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> => {
    try {
      const response = await apiClient.post(`/colleges/${collegeId}/students`, studentData);
      return response.data as ApiResponse<Student>;
    } catch (error) {
      console.error('❌ Add college student error:', error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (collegeId: string, studentId: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
    try {
      const response = await apiClient.put(`/colleges/${collegeId}/students/${studentId}`, studentData);
      return response.data as ApiResponse<Student>;
    } catch (error) {
      console.error('❌ Update college student error:', error);
      throw error;
    }
  },

  // Get college drives
  getDrives: async (collegeId: string, params?: PaginationParams & {
    search?: string;
    status?: string;
    type?: string;
    location?: string;
  }): Promise<{ drives: Drive[], pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.location) queryParams.append('location', params.location);

      const response = await apiClient.get(`/colleges/${collegeId}/drives?${queryParams.toString()}`);
      return response.data as { drives: Drive[], pagination: any };
    } catch (error) {
      console.error('❌ Get college drives error:', error);
      throw error;
    }
  },

  // Get college applications
  getApplications: async (collegeId: string, params?: PaginationParams & {
    status?: string;
    driveId?: string;
    studentId?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Application>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.driveId) queryParams.append('driveId', params.driveId);
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      if (params?.search) queryParams.append('search', params.search);

      const response = await apiClient.get(`/colleges/${collegeId}/applications?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Application>>;
    } catch (error) {
      console.error('❌ Get college applications error:', error);
      throw error;
    }
  },

  // Get college dashboard stats
  getDashboardStats: async (collegeId: string): Promise<ApiResponse<{
    totalStudents: number;
    activeDrives: number;
    totalApplications: number;
    pendingApplications: number;
    shortlistedApplications: number;
    scheduledInterviews: number;
    placementRate: number;
    averagePackage: number;
  }>> => {
    try {
      const response = await apiClient.get(`/colleges/${collegeId}/dashboard/stats`);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Get college dashboard stats error:', error);
      throw error;
    }
  },

  // Get placement report
  getPlacementReport: async (collegeId: string, params?: {
    year?: string;
    branch?: string;
    company?: string;
  }): Promise<ApiResponse<{
    totalPlacements: number;
    averagePackage: number;
    highestPackage: number;
    lowestPackage: number;
    companies: Array<{
      name: string;
      placements: number;
      averagePackage: number;
    }>;
    branches: Array<{
      name: string;
      placements: number;
      averagePackage: number;
    }>;
  }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.year) queryParams.append('year', params.year);
      if (params?.branch) queryParams.append('branch', params.branch);
      if (params?.company) queryParams.append('company', params.company);

      const response = await apiClient.get(`/colleges/${collegeId}/placements/report?${queryParams.toString()}`);
      return response.data as ApiResponse<any>;
    } catch (error) {
      console.error('❌ Get placement report error:', error);
      throw error;
    }
  },

  // Bulk update students
  bulkUpdateStudents: async (collegeId: string, studentIds: string[], data: Partial<Student>): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await apiClient.put(`/colleges/${collegeId}/students/bulk`, {
        studentIds,
        data
      });
      return response.data as ApiResponse<Student[]>;
    } catch (error) {
      console.error('❌ Bulk update students error:', error);
      throw error;
    }
  },

  // Export students
  exportStudents: async (collegeId: string, params?: {
    format?: 'csv' | 'excel';
    branch?: string;
    year?: string;
    course?: string;
  }): Promise<ApiResponse<Blob>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format);
      if (params?.branch) queryParams.append('branch', params.branch);
      if (params?.year) queryParams.append('year', params.year);
      if (params?.course) queryParams.append('course', params.course);

      const response = await apiClient.get(`/colleges/${collegeId}/students/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data as ApiResponse<Blob>;
    } catch (error) {
      console.error('❌ Export students error:', error);
      throw error;
    }
  },

  // Get filtered students (advanced filtering)
  getFilteredStudents: async (collegeId: string, filters: {
    search?: string;
    courses?: string[];
    branches?: string[];
    years?: string[];
    minCGPA?: number;
    maxCGPA?: number;
    skills?: string[];
    hasBacklogs?: boolean;
    isPlaced?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Student>>> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.courses) queryParams.append('courses', filters.courses.join(','));
      if (filters.branches) queryParams.append('branches', filters.branches.join(','));
      if (filters.years) queryParams.append('years', filters.years.join(','));
      if (filters.minCGPA) queryParams.append('minCGPA', filters.minCGPA.toString());
      if (filters.maxCGPA) queryParams.append('maxCGPA', filters.maxCGPA.toString());
      if (filters.skills) queryParams.append('skills', filters.skills.join(','));
      if (filters.hasBacklogs !== undefined) queryParams.append('hasBacklogs', filters.hasBacklogs.toString());
      if (filters.isPlaced !== undefined) queryParams.append('isPlaced', filters.isPlaced.toString());

      const response = await apiClient.get(`/colleges/${collegeId}/students/filtered?${queryParams.toString()}`);
      return response.data as ApiResponse<PaginatedResponse<Student>>;
    } catch (error) {
      console.error('❌ Get filtered students error:', error);
      throw error;
    }
  }
};
