import { Linking } from 'react-native';

class DeepLinkHandler {
  constructor() {
    this.navigation = null;
    this.isInitialized = false;
  }

  // Khởi tạo deep link handler
  init(navigation) {
    if (this.isInitialized) return;
    
    this.navigation = navigation;
    this.isInitialized = true;

    // Xử lý deep link khi app đang chạy
    Linking.addEventListener('url', this.handleDeepLink.bind(this));

    // Xử lý deep link khi app được mở từ deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink({ url });
      }
    });
  }

  // Xử lý deep link
  handleDeepLink(event) {
    const { url } = event;
    console.log('Deep link received:', url);

    if (!url) return;

    try {
      const urlObj = new URL(url);
      
      // Xử lý deep link cho payment
      if (urlObj.protocol === 'nhms:') {
        this.handlePaymentDeepLink(urlObj);
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  }

  // Xử lý deep link cho payment
  handlePaymentDeepLink(urlObj) {
    const path = urlObj.pathname;
    const searchParams = new URLSearchParams(urlObj.search);
    
    // Lấy thông tin từ query parameters
    const orderCode = searchParams.get('orderCode');
    const transactionId = searchParams.get('transactionId');
    const amount = searchParams.get('amount');
    const paymentMethod = searchParams.get('paymentMethod');
    const billId = searchParams.get('billId');

    if (path === '/payment/success') {
      // Thanh toán thành công
      this.navigation.navigate('HoaDon', {
        screen: 'PaymentResult',
        params: {
          billId: billId,
          paymentStatus: 'success',
          paymentData: {
            orderCode,
            transactionId,
            amount,
            paymentMethod
          }
        }
      });
    } else if (path === '/payment/cancel') {
      // Thanh toán bị hủy
      this.navigation.navigate('HoaDon', {
        screen: 'PaymentResult',
        params: {
          billId: billId,
          paymentStatus: 'cancelled',
          paymentData: {
            orderCode
          }
        }
      });
    } else if (path === '/payment/failed') {
      // Thanh toán thất bại
      this.navigation.navigate('HoaDon', {
        screen: 'PaymentResult',
        params: {
          billId: billId,
          paymentStatus: 'failed',
          paymentData: {
            orderCode
          }
        }
      });
    }
  }

  // Cleanup khi component unmount
  cleanup() {
    if (this.isInitialized) {
      Linking.removeAllListeners('url');
      this.isInitialized = false;
      this.navigation = null;
    }
  }
}

export default new DeepLinkHandler();