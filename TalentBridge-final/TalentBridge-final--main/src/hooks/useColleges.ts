import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegesService } from '@/services';
import { College, Student, Drive, Application, PaginationParams } from '@/services/types';

// Query keys
export const collegeKeys = {
  all: ['colleges'] as const,
  lists: () => [...collegeKeys.all, 'list'] as const,
  list: (filters: any) => [...collegeKeys.lists(), filters] as const,
  details: () => [...collegeKeys.all, 'detail'] as const,
  detail: (id: string) => [...collegeKeys.details(), id] as const,
  students: (id: string) => [...collegeKeys.detail(id), 'students'] as const,
  student: (id: string, studentId: string) => [...collegeKeys.students(id), studentId] as const,
  drives: (id: string) => [...collegeKeys.detail(id), 'drives'] as const,
  applications: (id: string) => [...collegeKeys.detail(id), 'applications'] as const,
  stats: (id: string) => [...collegeKeys.detail(id), 'stats'] as const,
  reports: (id: string) => [...collegeKeys.detail(id), 'reports'] as const,
};

// College profile hooks
export const useCollegeProfile = (collegeId: string) => {
  return useQuery({
    queryKey: collegeKeys.detail(collegeId),
    queryFn: () => collegesService.getProfile(collegeId),
    select: (response) => response.data,
    enabled: !!collegeId,
  });
};

export const useUpdateCollegeProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collegeId, data }: { collegeId: string; data: Partial<College> }) =>
      collegesService.updateProfile(collegeId, data),
    onSuccess: (response, variables) => {
      // Invalidate college profile
      queryClient.invalidateQueries({ queryKey: collegeKeys.detail(variables.collegeId) });
    },
    onError: (error: any) => {
      console.error('Failed to update college profile:', error);
    },
  });
};

// College students hooks
export const useCollegeStudents = (collegeId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  course?: string;
  branch?: string;
  year?: string;
  minCgpa?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: collegeKeys.students(collegeId),
    queryFn: () => collegesService.getStudents(collegeId, params),
    select: (response) => response.data,
    enabled: !!collegeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCollegeStudentById = (collegeId: string, studentId: string) => {
  return useQuery({
    queryKey: collegeKeys.student(collegeId, studentId),
    queryFn: () => collegesService.getStudentById(collegeId, studentId),
    select: (response) => response.data,
    enabled: !!collegeId && !!studentId,
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      collegeId, 
      studentData 
    }: { 
      collegeId: string; 
      studentData: Omit<Student, 'id' | 'collegeId' | 'collegeName' | 'createdAt' | 'updatedAt' | 'role'> 
    }) => collegesService.addStudent(collegeId, studentData),
    onSuccess: (response, variables) => {
      // Invalidate college students
      queryClient.invalidateQueries({ queryKey: collegeKeys.students(variables.collegeId) });
    },
    onError: (error: any) => {
      console.error('Failed to add student:', error);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      collegeId, 
      studentId, 
      studentData 
    }: { 
      collegeId: string; 
      studentId: string; 
      studentData: Partial<Student> 
    }) => collegesService.updateStudent(collegeId, studentId, studentData),
    onSuccess: (response, variables) => {
      // Invalidate specific student and students list
      queryClient.invalidateQueries({ queryKey: collegeKeys.student(variables.collegeId, variables.studentId) });
      queryClient.invalidateQueries({ queryKey: collegeKeys.students(variables.collegeId) });
    },
    onError: (error: any) => {
      console.error('Failed to update student:', error);
    },
  });
};

// College drives hooks
export const useCollegeDrives = (collegeId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: collegeKeys.drives(collegeId),
    queryFn: () => collegesService.getDrives(collegeId, params),
    select: (response) => response.data,
    enabled: !!collegeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// College dashboard stats hooks
export const useCollegeDashboardStats = (collegeId: string) => {
  return useQuery({
    queryKey: collegeKeys.stats(collegeId),
    queryFn: () => collegesService.getDashboardStats(collegeId),
    select: (response) => response.data,
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes for dashboard stats
  });
};

// Placement report hooks
export const usePlacementReport = (collegeId: string, params?: {
  academicYear?: string;
  department?: string;
  format?: 'json' | 'csv' | 'pdf';
}) => {
  return useQuery({
    queryKey: collegeKeys.reports(collegeId),
    queryFn: () => collegesService.getPlacementReport(collegeId, params),
    select: (response) => response.data,
    enabled: !!collegeId,
    staleTime: 10 * 60 * 1000, // 10 minutes for reports
  });
};

// Bulk operations hooks
export const useBulkUpdateStudents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      collegeId, 
      studentIds, 
      data 
    }: { 
      collegeId: string; 
      studentIds: string[]; 
      data: Partial<Student> 
    }) => collegesService.bulkUpdateStudents(collegeId, studentIds, data),
    onSuccess: (response, variables) => {
      // Invalidate college students
      queryClient.invalidateQueries({ queryKey: collegeKeys.students(variables.collegeId) });
    },
    onError: (error: any) => {
      console.error('Failed to bulk update students:', error);
    },
  });
};

// Export functionality hooks
export const useExportStudents = () => {
  return useMutation({
    mutationFn: ({ 
      collegeId, 
      format, 
      filters 
    }: { 
      collegeId: string; 
      format: 'csv' | 'excel' | 'pdf';
      filters?: {
        course?: string;
        branch?: string;
        year?: string;
        minCgpa?: number;
      };
    }) => collegesService.exportStudents(collegeId, format, filters),
    onError: (error: any) => {
      console.error('Failed to export students:', error);
    },
  });
};

// Skill-first filtering hook
export const useFilteredStudents = (collegeId: string, filters: import('@/services/types').StudentFilters) => {
  return useQuery({
    queryKey: [...collegeKeys.students(collegeId), filters], // Include filters in query key for proper caching
    queryFn: () => collegesService.getFilteredStudents(collegeId, filters),
    select: (response) => response.data,
    enabled: !!collegeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
