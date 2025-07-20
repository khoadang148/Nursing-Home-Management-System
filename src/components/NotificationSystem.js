import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Portal, Button } from 'react-native-paper';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Helper function to sanitize error messages
const sanitizeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  // Remove technical error details
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
  ];

  let sanitizedMessage = message;

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

// Context for global notification system
const NotificationContext = createContext(null);

// Hook to use notification system
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Toast Component
const Toast = React.memo(({ visible, message, type, onHide, duration = 3000 }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [fadeAnim, slideAnim, onHide]);

  const toastStyle = useMemo(() => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderLeftColor: '#2E7D32',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          borderLeftColor: '#D32F2F',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          borderLeftColor: '#F57C00',
        };
      case 'info':
        return {
          backgroundColor: '#2196F3',
          borderLeftColor: '#1976D2',
        };
      default:
        return {
          backgroundColor: '#323232',
          borderLeftColor: '#616161',
        };
    }
  }, [type]);

  const icon = useMemo(() => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }, [type]);

  if (!visible) return null;

  return (
    <Portal>
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.toast, toastStyle]}
          onPress={hideToast}
          activeOpacity={0.9}
        >
          <Text style={styles.toastIcon}>{icon}</Text>
          <Text style={styles.toastMessage}>
            {type === 'error' ? sanitizeErrorMessage(message) : message}
          </Text>
          <TouchableOpacity onPress={hideToast} style={styles.toastCloseButton}>
            <Text style={styles.toastCloseText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Portal>
  );
});

Toast.displayName = 'Toast';

// Alert Dialog Component
const AlertDialog = React.memo(({ visible, title, message, buttons, onDismiss }) => {
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.alertOverlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.alertBackdrop}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.alertContent}>
            {title && <Text style={styles.alertTitle}>{title}</Text>}
            <Text style={styles.alertMessage}>
              {sanitizeErrorMessage(message)}
            </Text>
          </View>
          <View style={styles.alertActions}>
            {buttons?.map((button, index) => (
              <Button
                key={index}
                mode={button.style === 'primary' ? 'contained' : 'outlined'}
                onPress={() => {
                  button.onPress?.();
                  onDismiss();
                }}
                style={[
                  styles.alertButton,
                  button.style === 'destructive' && styles.destructiveButton,
                ]}
                textColor={
                  button.style === 'destructive' 
                    ? COLORS.error 
                    : button.style === 'primary' 
                    ? COLORS.surface 
                    : COLORS.primary
                }
              >
                {button.text}
              </Button>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

AlertDialog.displayName = 'AlertDialog';

// Loading Overlay Component  
const LoadingOverlay = React.memo(({ visible, message = 'Đang xử lý...', transparent = false }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <Animated.View
        style={[
          styles.loadingOverlay,
          {
            backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,0.5)',
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingMessage}>{message}</Text>
        </View>
      </Animated.View>
    </Portal>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export const NotificationProvider = React.memo(({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const [loading, setLoading] = useState({
    visible: false,
    message: 'Đang xử lý...',
    transparent: false,
  });

  // Toast methods
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Alert methods
  const showAlert = useCallback((title, message, buttons = []) => {
    const defaultButtons = buttons.length > 0 ? buttons : [
      {
        text: 'OK',
        onPress: () => {},
        style: 'primary',
      },
    ];

    setAlert({
      visible: true,
      title,
      message,
      buttons: defaultButtons,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  // Loading methods
  const showLoading = useCallback((message = 'Đang xử lý...', transparent = false) => {
    setLoading({
      visible: true,
      message,
      transparent,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(prev => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message) => {
    showToast(message, 'info');
  }, [showToast]);

  const confirmAction = useCallback((title, message, onConfirm, onCancel) => {
    showAlert(title, message, [
      {
        text: 'Hủy',
        onPress: onCancel || (() => {}),
        style: 'outlined',
      },
      {
        text: 'Xác nhận',
        onPress: onConfirm,
        style: 'primary',
      },
    ]);
  }, [showAlert]);

  const confirmDelete = useCallback((message, onConfirm) => {
    showAlert(
      'Xác nhận xóa',
      message || 'Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          onPress: () => {},
          style: 'outlined',
        },
        {
          text: 'Xóa',
          onPress: onConfirm,
          style: 'destructive',
        },
      ]
    );
  }, [showAlert]);

  const contextValue = useMemo(() => ({
    // Toast methods
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Alert methods
    showAlert,
    hideAlert,
    confirmAction,
    confirmDelete,
    
    // Loading methods
    showLoading,
    hideLoading,
  }), [
    showToast, hideToast, showSuccess, showError, showWarning, showInfo,
    showAlert, hideAlert, confirmAction, confirmDelete,
    showLoading, hideLoading
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
      
      <AlertDialog
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={hideAlert}
      />
      
      <LoadingOverlay
        visible={loading.visible}
        message={loading.message}
        transparent={loading.transparent}
      />
    </NotificationContext.Provider>
  );
});

NotificationProvider.displayName = 'NotificationProvider';

const styles = StyleSheet.create({
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  toastMessage: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  toastCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  toastCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Alert styles
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  alertContent: {
    padding: 24,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    borderRadius: 8,
  },
  destructiveButton: {
    borderColor: COLORS.error,
  },

  // Loading styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
  },
  loadingContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingMessage: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default NotificationProvider; 