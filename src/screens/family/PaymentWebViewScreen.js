import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZES } from '../../constants/theme';

const PaymentWebViewScreen = ({ route, navigation }) => {
  const { checkoutUrl, billData, onPaymentComplete } = route.params;
  const webViewRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'cancel', 'error'

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      } else {
        setShowExitModal(true);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle component unmount (user navigates away)
  useEffect(() => {
    return () => {
      // If user navigates away without completing payment, consider it cancelled
      if (!paymentStatus) {
        console.log('🚪 User navigated away - considering payment as cancelled');
        // Note: We can't navigate here as component is unmounting
        // The timeout will handle this case
      }
    };
  }, [paymentStatus]);

  // Handle navigation state changes
  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    
    // Check for payment completion URLs
    const currentUrl = navState.url;
    console.log('🔄 WebView URL changed:', currentUrl);
    
    // Prevent duplicate handling if payment status is already set
    if (paymentStatus) {
      console.log('⚠️ Payment status already set, skipping URL check');
      return;
    }
    
    // Kiểm tra URL PayOS success/cancel với nhiều pattern hơn
    if (currentUrl.includes('payos.vn/payment/success') || 
        currentUrl.includes('payment/success') || 
        currentUrl.includes('success') ||
        currentUrl.includes('thanh-toan-thanh-cong') ||
        currentUrl.includes('payment-complete')) {
      console.log('✅ Payment success detected');
      setPaymentStatus('success');
      handlePaymentComplete('success');
    } else if (currentUrl.includes('payos.vn/payment/cancel') || 
               currentUrl.includes('payment/cancel') || 
               currentUrl.includes('cancel') ||
               currentUrl.includes('huy-thanh-toan') ||
               currentUrl.includes('payment-cancelled') ||
               currentUrl.includes('payment-cancel') ||
               currentUrl.includes('thanh-toan-bi-huy') ||
               currentUrl.includes('user-cancelled') ||
               currentUrl.includes('user-cancel') ||
               currentUrl.includes('404') ||
               currentUrl.includes('page-not-found') ||
               currentUrl.includes('error') ||
               currentUrl.includes('not-found') ||
               currentUrl.includes('bad-link') ||
               currentUrl.includes('oops')) {
      console.log('❌ Payment cancelled or error page detected');
      setPaymentStatus('cancel');
      handlePaymentComplete('cancel');
    } else if (currentUrl.includes('payment-error') || 
               currentUrl.includes('payment-failed') ||
               currentUrl.includes('thanh-toan-that-bai') ||
               currentUrl.includes('payment-failure')) {
      console.log('💥 Payment error detected');
      setPaymentStatus('error');
      handlePaymentComplete('error');
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (status) => {
    console.log('🚀 Handling payment completion with status:', status);
    
    // Clear any existing modals
    setShowExitModal(false);
    
    // Force navigation immediately for cancelled payments
    if (status === 'cancel') {
      console.log('🧭 Immediately navigating to PaymentResult for cancelled payment');
      navigation.replace('PaymentResult', {
        billId: billData?.id,
        paymentStatus: status,
        paymentData: {
          transaction_id: billData?.orderCode || 'N/A',
          payment_method: 'PayOS',
          amount: billData?.amount || 0,
          timestamp: new Date().toISOString(),
        }
      });
      return;
    }
    
    setTimeout(() => {
      if (onPaymentComplete) {
        onPaymentComplete(status, billData);
      } else {
        // Navigate to payment result screen
        console.log('🧭 Navigating to PaymentResult with status:', status);
        navigation.replace('PaymentResult', {
          billId: billData?.id,
          paymentStatus: status,
          paymentData: {
            transaction_id: billData?.orderCode || 'N/A',
            payment_method: 'PayOS',
            amount: billData?.amount || 0,
            timestamp: new Date().toISOString(),
          }
        });
      }
    }, 1500); // Increased delay to ensure smooth transition
  };

  // Handle WebView load start
  const onLoadStart = () => {
    setLoading(true);
  };

  // Handle WebView load end
  const onLoadEnd = () => {
    setLoading(false);
  };

  // Handle WebView errors
  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setLoading(false);
    Alert.alert(
      'Lỗi Kết Nối',
      'Không thể kết nối đến trang thanh toán. Vui lòng thử lại.',
      [
        { text: 'Thử Lại', onPress: () => webViewRef.current?.reload() },
        { text: 'Thoát', onPress: () => navigation.goBack() }
      ]
    );
  };

  // Handle exit payment
  const handleExitPayment = () => {
    console.log('🚪 User confirmed exit payment');
    setShowExitModal(false);
    
    // Set payment status to prevent duplicate handling
    setPaymentStatus('cancel');
    
    // Navigate to payment result screen with cancelled status
    setTimeout(() => {
      console.log('🧭 Navigating to PaymentResult from exit payment');
      navigation.replace('PaymentResult', {
        billId: billData?.id,
        paymentStatus: 'cancel',
        paymentData: {
          transaction_id: billData?.orderCode || 'N/A',
          payment_method: 'PayOS',
          amount: billData?.amount || 0,
          timestamp: new Date().toISOString(),
        }
      });
    }, 500); // Short delay to ensure modal is closed
  };

  // Handle continue payment
  const handleContinuePayment = () => {
    console.log('✅ User chose to continue payment');
    setShowExitModal(false);
  };

  // Add timeout to detect payment cancellation
  useEffect(() => {
    const paymentTimeout = setTimeout(() => {
      // If no payment status is set after 5 minutes, consider it cancelled
      if (!paymentStatus) {
        console.log('⏰ Payment timeout - considering as cancelled');
        setPaymentStatus('cancel');
        handlePaymentComplete('cancel');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(paymentTimeout);
  }, [paymentStatus]);

  // Add timeout to detect stuck WebView (shorter timeout)
  useEffect(() => {
    const stuckTimeout = setTimeout(() => {
      // If WebView is still loading after 30 seconds, consider it stuck
      if (loading && !paymentStatus) {
        console.log('⚠️ WebView appears to be stuck, treating as cancelled');
        setPaymentStatus('cancel');
        handlePaymentComplete('cancel');
      }
    }, 30 * 1000); // 30 seconds

    return () => clearTimeout(stuckTimeout);
  }, [loading, paymentStatus]);

  // Add emergency timeout for any stuck state
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      // If no payment status after 2 minutes, force navigation
      if (!paymentStatus) {
        console.log('🚨 Emergency timeout - forcing navigation to PaymentResult');
        setPaymentStatus('cancel');
        navigation.replace('PaymentResult', {
          billId: billData?.id,
          paymentStatus: 'cancel',
          paymentData: {
            transaction_id: billData?.orderCode || 'N/A',
            payment_method: 'PayOS',
            amount: billData?.amount || 0,
            timestamp: new Date().toISOString(),
          }
        });
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearTimeout(emergencyTimeout);
  }, [paymentStatus]);

  // Render loading indicator
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (canGoBack) {
              webViewRef.current?.goBack();
            } else {
              setShowExitModal(true);
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Thanh Toán</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowExitModal(true)}
        >
          <Ionicons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webView}
          onNavigationStateChange={onNavigationStateChange}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={onError}
          startInLoadingState={true}
          renderLoading={renderLoading}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          userAgent="NHMS-Mobile-App"
        />
        
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
      </View>

      {/* Payment Status Overlay */}
      {paymentStatus && !showExitModal && (
        <View style={styles.statusOverlay}>
          <View style={styles.statusContainer}>
            <MaterialIcons 
              name={
                paymentStatus === 'success' ? 'check-circle' :
                paymentStatus === 'cancel' ? 'cancel' : 'error'
              }
              size={64}
              color={
                paymentStatus === 'success' ? COLORS.success :
                paymentStatus === 'cancel' ? COLORS.warning : COLORS.error
              }
            />
            <Text style={styles.statusText}>
              {paymentStatus === 'success' ? 'Thanh toán thành công!' :
               paymentStatus === 'cancel' ? 'Thanh toán đã hủy' :
               'Thanh toán thất bại'}
            </Text>
            <Text style={styles.statusSubText}>
              {paymentStatus === 'success' ? 'Đang chuyển hướng...' :
               paymentStatus === 'cancel' ? 'Đang chuyển hướng...' :
               'Có lỗi xảy ra trong quá trình thanh toán'}
            </Text>
            {paymentStatus === 'cancel' && (
              <ActivityIndicator 
                size="small" 
                color={COLORS.warning} 
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        </View>
      )}

      {/* Exit Confirmation Overlay */}
      {showExitModal && (
        <View style={styles.exitOverlay}>
          <View style={styles.exitContainer}>
            <MaterialIcons 
              name="exit-to-app" 
              size={48} 
              color={COLORS.warning} 
            />
            <Text style={styles.exitTitle}>Hủy Thanh Toán?</Text>
            <Text style={styles.exitMessage}>
              Bạn có chắc chắn muốn hủy thanh toán?{'\n'}
              Hóa đơn sẽ được đánh dấu là "Chưa thanh toán" và bạn có thể thanh toán lại sau.
            </Text>
            
            <View style={styles.exitButtons}>
              <TouchableOpacity
                style={styles.exitButtonContinue}
                onPress={handleContinuePayment}
              >
                <Text style={styles.exitButtonContinueText}>Tiếp Tục Thanh Toán</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exitButtonExit}
                onPress={handleExitPayment}
              >
                <Text style={styles.exitButtonExitText}>Hủy Thanh Toán</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // để cân bằng với back button
  },
  closeButton: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.white,
  },
  webView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  statusText: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  statusSubText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  exitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exitContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exitTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  exitMessage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  exitButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  exitButtonContinue: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonContinueText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '500',
  },
  exitButtonExit: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonExitText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '500',
  },
});

export default PaymentWebViewScreen;