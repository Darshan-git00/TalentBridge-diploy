// Base API configuration and utilities
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Import error handler
import { errorHandler, ErrorType, AppError } from '@/utils/errorHandler';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('talentbridge_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic HTTP client wrapper
export const apiClient = {
  get: async <T>(url: string, config?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        ...config,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  },

  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  },

  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          ...errorData,
          status: response.status,
          url: `${API_BASE_URL}${url}`,
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  }
};

// Password reset service
export const authService = {
  forgotPassword: async (email: string, role: string): Promise<ApiResponse<{ resetToken?: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const token = localStorage.getItem('talentbridge_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const appError = errorHandler.handleApiError({
          status: response.status,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          response: { data: errorData }
        });
        throw appError;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof ApiError) throw error;
      throw errorHandler.handleApiError(error);
    }
  }
};

