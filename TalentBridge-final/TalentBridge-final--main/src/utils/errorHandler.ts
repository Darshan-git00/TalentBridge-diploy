import { toast } from 'sonner';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// Custom error class
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error handler utility
export const errorHandler = {
  // Handle API errors
  handleApiError: (error: any): AppError => {
    // Handle network errors
    if (!navigator.onLine) {
      return new AppError(
        'No internet connection. Please check your network and try again.',
        ErrorType.NETWORK
      );
    }

    // Handle fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new AppError(
        'Network error. Please check your connection and try again.',
        ErrorType.NETWORK
      );
    }

    // Handle HTTP status errors
    if (error.status || error.response?.status) {
      const status = error.status || error.response?.status;
      const message = error.message || error.response?.data?.message || 'Request failed';

      switch (status) {
        case 400:
          return new AppError(
            message || 'Invalid request. Please check your input.',
            ErrorType.VALIDATION,
            status
          );
        case 401:
          return new AppError(
            'Your session has expired. Please log in again.',
            ErrorType.AUTHENTICATION,
            status
          );
        case 403:
          return new AppError(
            'You don\'t have permission to perform this action.',
            ErrorType.AUTHORIZATION,
            status
          );
        case 404:
          return new AppError(
            'The requested resource was not found.',
            ErrorType.NOT_FOUND,
            status
          );
        case 422:
          return new AppError(
            error.response?.data?.message || 'Validation failed. Please check your input.',
            ErrorType.VALIDATION,
            status,
            error.response?.data?.errors
          );
        case 429:
          return new AppError(
            'Too many requests. Please try again later.',
            ErrorType.NETWORK,
            status
          );
        case 500:
        case 502:
        case 503:
        case 504:
          return new AppError(
            'Server error. Please try again later.',
            ErrorType.SERVER,
            status
          );
        default:
          return new AppError(
            message || 'Something went wrong. Please try again.',
            ErrorType.UNKNOWN,
            status
          );
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return new AppError(
        error.message || 'Validation failed. Please check your input.',
        ErrorType.VALIDATION
      );
    }

    // Handle unknown errors
    return new AppError(
      error.message || 'An unexpected error occurred. Please try again.',
      ErrorType.UNKNOWN
    );
  },

  // Show user-friendly error message
  showError: (error: AppError, options?: { toast?: boolean; duration?: number }) => {
    const { toast: showToast = true, duration = 5000 } = options || {};

    if (showToast) {
      const icon = this.getErrorIcon(error.type);
      toast.error(error.message, {
        duration,
        icon,
      });
    }

    // Log error for debugging
    console.error('🚨 App Error:', {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
  },

  // Get appropriate icon for error type
  getErrorIcon: (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return '🌐';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.AUTHENTICATION:
        return '🔐';
      case ErrorType.AUTHORIZATION:
        return '🚫';
      case ErrorType.NOT_FOUND:
        return '🔍';
      case ErrorType.SERVER:
        return '🔥';
      default:
        return '❌';
    }
  },

  // Get user-friendly action suggestion
  getActionSuggestion: (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Check your internet connection and try again.';
      case ErrorType.VALIDATION:
        return 'Please review your input and correct any errors.';
      case ErrorType.AUTHENTICATION:
        return 'Please log in again to continue.';
      case ErrorType.AUTHORIZATION:
        return 'Contact your administrator if you need access.';
      case ErrorType.NOT_FOUND:
        return 'The resource you\'re looking for may have been moved or deleted.';
      case ErrorType.SERVER:
        return 'Please try again in a few minutes.';
      default:
        return 'If the problem persists, please contact support.';
    }
  },
};

// React Query error wrapper
export const handleQueryError = (error: any, queryKey?: string[]) => {
  const appError = errorHandler.handleApiError(error);
  
  // Add query context for debugging
  console.error('🚨 Query Error:', {
    queryKey,
    error: appError,
  });

  errorHandler.showError(appError);
};

// Form validation error helper
export const handleFormError = (error: any, fieldName?: string) => {
  if (error?.details?.errors) {
    // Handle Laravel-style validation errors
    const fieldErrors = error.details.errors;
    const firstError = fieldName 
      ? fieldErrors[fieldName]?.[0] 
      : Object.values(fieldErrors)[0]?.[0] || '';
    
    if (firstError) {
      return new AppError(firstError, ErrorType.VALIDATION);
    }
  }

  return errorHandler.handleApiError(error);
};
