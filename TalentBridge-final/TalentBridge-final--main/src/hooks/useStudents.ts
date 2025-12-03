import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services';
import { Student, PaginationParams } from '@/services/types';

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: PaginationParams) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  drives: (id: string) => [...studentKeys.detail(id), 'drives'] as const,
  applications: (id: string) => [...studentKeys.detail(id), 'applications'] as const,
  interviews: (id: string) => [...studentKeys.detail(id), 'interviews'] as const,
  notifications: (id: string) => [...studentKeys.detail(id), 'notifications'] as const,
};

// Student profile hooks
export const useStudentProfile = (studentId?: string, collegeId?: string) => {
  return useQuery({
    queryKey: studentKeys.detail('me'), // Always use 'me' for consistency
    queryFn: () => studentService.getProfile('me'), // Use /me endpoint instead of studentId
    select: (response) => response.data,
    enabled: !!studentId, // Only run query if studentId exists
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Student> }) =>
      studentService.updateProfile('me', data),
    onSuccess: (response) => {
      // Force refetch the profile data and update cache
      queryClient.refetchQueries({ queryKey: studentKeys.detail('me') });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (error: any) => {
      console.error('Failed to update student profile:', error);
    },
  });
};

// Student drives hooks
export const useStudentDrives = (params?: PaginationParams, collegeId?: string) => {
  return useQuery({
    queryKey: studentKeys.drives('current'), // Using 'current' as placeholder for current student
    queryFn: () => studentService.getDrives(params), // TODO: Add collegeId when service supports filtering
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes for drives data
  });
};

export const useStudentDriveById = (driveId: string) => {
  return useQuery({
    queryKey: ['drive', driveId],
    queryFn: () => studentService.getDriveById(driveId),
    select: (response) => response.data,
    enabled: !!driveId,
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (applicationId: string) => studentService.withdrawApplication(applicationId),
    onSuccess: (response, applicationId) => {
      // Invalidate applications queries
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to withdraw application:', error);
    },
  });
};

// Student interviews hooks
export const useStudentInterviews = (studentId?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...studentKeys.interviews(studentId || ''), params],
    queryFn: () => studentService.getInterviews(params),
    select: (response) => response.data,
    enabled: !!studentId,
  });
};

export const useStudentInterviewById = (interviewId: string) => {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => studentService.getInterviewById(interviewId),
    select: (response) => response.data,
    enabled: !!interviewId,
  });
};

// Student notifications hooks
export const useStudentNotifications = (studentId?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...studentKeys.notifications(studentId || ''), params],
    queryFn: () => studentService.getNotifications(params),
    select: (response) => response.data,
    enabled: !!studentId,
    staleTime: 30 * 1000, // 30 seconds for notifications
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => studentService.markNotificationRead(notificationId),
    onSuccess: (response, notificationId) => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
    },
  });
};

// AI Interview hooks
export const useStartAIInterview = (studentId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (applicationId: string) => studentService.startAIInterview(applicationId),
    onSuccess: (response, variables) => {
      // Invalidate interviews queries
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: studentKeys.interviews(studentId) });
      }
    },
    onError: (error: any) => {
      console.error('Failed to start AI interview:', error);
    },
  });
};

export const useSubmitAIInterview = (studentId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, responses }: { interviewId: string; responses: any }) =>
      studentService.submitAIInterview(interviewId, responses),
    onSuccess: (response, variables) => {
      // Invalidate interviews queries
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: studentKeys.interviews(studentId) });
      }
    },
    onError: (error: any) => {
      console.error('Failed to submit AI interview:', error);
    },
  });
};
