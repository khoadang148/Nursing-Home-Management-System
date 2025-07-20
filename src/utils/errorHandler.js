// Error handling utility to hide technical errors from users

/**
 * Sanitize error message to remove technical details
 * @param {string|object} error - The error object or message
 * @returns {string} - User-friendly error message
 */
export const sanitizeErrorMessage = (error) => {
  if (!error) {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  let errorMessage = '';
  
  // Extract message from different error formats
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.error) {
    errorMessage = error.error;
  } else {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  // Remove technical error patterns
  const technicalPatterns = [
    /AxiosError.*/i,
    /Request failed with status code \d+/i,
    /Network Error/i,
    /Timeout of \d+ms exceeded/i,
    /ECONNREFUSED/i,
    /ENOTFOUND/i,
    /Check auth error.*/i,
    /API Error.*/i,
    /Login error.*/i,
    /\[.*Error.*\]/i,
    /Error:.*/i,
    /Exception:.*/i,
    /at .*\(.*\)/i,
    /\.js:\d+:\d+/i,
    /\.ts:\d+:\d+/i,
    /\.tsx:\d+:\d+/i,
    /\.jsx:\d+:\d+/i,
    /console\.log.*/i,
    /console\.error.*/i,
  ];

  let sanitizedMessage = errorMessage;

  // Remove technical patterns
  technicalPatterns.forEach(pattern => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '');
  });

  // Remove multiple spaces and trim
  sanitizedMessage = sanitizedMessage.replace(/\s+/g, ' ').trim();

  // If message is empty after sanitization, return default message
  if (!sanitizedMessage) {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  // If message is too long, truncate it
  if (sanitizedMessage.length > 100) {
    sanitizedMessage = sanitizedMessage.substring(0, 97) + '...';
  }

  return sanitizedMessage;
};

/**
 * Get user-friendly error message based on error type
 * @param {string|object} error - The error object or message
 * @returns {string} - User-friendly error message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  // Handle specific error types
  if (typeof error === 'string') {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('401') || errorLower.includes('unauthorized')) {
      return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
    }
    if (errorLower.includes('404') || errorLower.includes('user not found')) {
      return 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
    }
    if (errorLower.includes('network') || errorLower.includes('timeout')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    if (errorLower.includes('password') || errorLower.includes('credentials')) {
      return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
    }
  }

  if (error && typeof error === 'object') {
    const status = error.status || error.statusCode;
    
    switch (status) {
      case 401:
        return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      case 404:
        return 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
      case 422:
        return 'Dữ liệu đăng nhập không hợp lệ.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      default:
        if (error.message) {
          const errorMsg = error.message.toLowerCase();
          if (errorMsg.includes('unauthorized') || errorMsg.includes('invalid credentials')) {
            return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
          }
          if (errorMsg.includes('user not found')) {
            return 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
          }
          if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
            return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
          }
        }
    }
  }

  // Default fallback
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

/**
 * Log error for debugging without exposing to user
 * @param {string|object} error - The error to log
 * @param {string} context - Context where error occurred
 */
export const logErrorForDebugging = (error, context = 'Unknown') => {
  console.log(`[${context}] Error occurred:`, {
    type: typeof error,
    hasResponse: error?.response ? 'Yes' : 'No',
    hasRequest: error?.request ? 'Yes' : 'No',
    status: error?.response?.status || error?.status || 'N/A',
    message: error?.message ? 'Present' : 'None',
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle error and return user-friendly message
 * @param {string|object} error - The error to handle
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
export const handleError = (error, context = 'Unknown') => {
  // Log error for debugging
  logErrorForDebugging(error, context);
  
  // Return user-friendly message
  return getFriendlyErrorMessage(error);
}; 