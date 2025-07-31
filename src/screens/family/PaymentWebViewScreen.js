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

  // Handle navigation state changes
  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    
    // Check for payment completion URLs
    const currentUrl = navState.url;
    console.log('🔄 WebView URL changed:', currentUrl);
    
    // Kiểm tra URL PayOS success/cancel
    if (currentUrl.includes('payos.vn/payment/success') || 
        currentUrl.includes('payment/success') || 
        currentUrl.includes('success')) {
      console.log('✅ Payment success detected');
      setPaymentStatus('success');
      handlePaymentComplete('success');
    } else if (currentUrl.includes('payos.vn/payment/cancel') || 
               currentUrl.includes('payment/cancel') || 
               currentUrl.includes('cancel')) {
      console.log('❌ Payment cancelled');
      setPaymentStatus('cancel');
      handlePaymentComplete('cancel');
    } else if (currentUrl.includes('payment-error') || 
               currentUrl.includes('error')) {
      console.log('💥 Payment error detected');
      setPaymentStatus('error');
      handlePaymentComplete('error');
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (status) => {
    setTimeout(() => {
      if (onPaymentComplete) {
        onPaymentComplete(status, billData);
      } else {
        // Navigate to payment result screen
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
    }, 1000); // Reduced delay
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
    setShowExitModal(false);
    navigation.goBack();
  };

  // Handle continue payment
  const handleContinuePayment = () => {
    setShowExitModal(false);
  };

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
      {paymentStatus && (
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
               paymentStatus === 'cancel' ? 'Bạn đã hủy thanh toán' :
               'Có lỗi xảy ra trong quá trình thanh toán'}
            </Text>
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
            <Text style={styles.exitTitle}>Thoát Thanh Toán?</Text>
            <Text style={styles.exitMessage}>
              Bạn có chắc chắn muốn thoát khỏi trang thanh toán? 
              Quá trình thanh toán sẽ bị hủy.
            </Text>
            
            <View style={styles.exitButtons}>
              <TouchableOpacity
                style={styles.exitButtonContinue}
                onPress={handleContinuePayment}
              >
                <Text style={styles.exitButtonContinueText}>Tiếp Tục</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exitButtonExit}
                onPress={handleExitPayment}
              >
                <Text style={styles.exitButtonExitText}>Thoát</Text>
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