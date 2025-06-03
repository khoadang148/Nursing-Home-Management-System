import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Divider,
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

const SupportScreen = ({ navigation }) => {
  const handleCall = (phoneNumber) => {
    Alert.alert(
      'Gọi điện thoại',
      `Bạn có muốn gọi ${phoneNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gọi', onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
      ]
    );
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const supportOptions = [
    {
      id: '1',
      title: 'Gọi Hotline 24/7',
      description: 'Liên hệ ngay với đội ngũ hỗ trợ',
      icon: 'phone',
      action: () => handleCall('1900123456'),
      color: COLORS.primary,
    },
    {
      id: '2',
      title: 'Gửi Email',
      description: 'Gửi câu hỏi qua email',
      icon: 'email',
      action: () => handleEmail('support@nursinghome.com'),
      color: COLORS.accent,
    },
    {
      id: '3',
      title: 'Nhắn Tin Trực Tiếp',
      description: 'Chat với nhân viên chăm sóc',
      icon: 'chat',
      action: () => navigation.navigate('TabsChính', { screen: 'TinNhan' }),
      color: COLORS.secondary,
    },
    {
      id: '4',
      title: 'Hướng Dẫn Sử Dụng',
      description: 'Xem hướng dẫn chi tiết',
      icon: 'help-outline',
      action: () => Alert.alert('Hướng dẫn', 'Chức năng đang được phát triển'),
      color: COLORS.info,
    },
  ];

  const faqData = [
    {
      question: 'Làm sao để thay đổi gói dịch vụ?',
      answer: 'Bạn có thể thay đổi gói dịch vụ trong phần "Gói Dịch Vụ" hoặc liên hệ với chúng tôi để được tư vấn.',
    },
    {
      question: 'Cách đặt lịch thăm viếng?',
      answer: 'Vào phần "Lịch Thăm" để chọn ngày giờ phù hợp. Lịch thăm cần được xác nhận trước khi có hiệu lực.',
    },
    {
      question: 'Làm sao để xem hóa đơn và thanh toán?',
      answer: 'Tất cả hóa đơn có thể xem trong phần "Hóa Đơn". Bạn có thể thanh toán trực tuyến hoặc tại cơ sở.',
    },
    {
      question: 'Cách nhận thông báo về tình hình sức khỏe?',
      answer: 'Thông báo sẽ được gửi tự động. Bạn có thể điều chỉnh cài đặt thông báo trong "Hồ Sơ Cá Nhân".',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hỗ Trợ</Text>
          <Text style={styles.headerSubtitle}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </Text>
        </View>

        {/* Support Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Liên Hệ Hỗ Trợ</Title>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportOption}
                onPress={option.action}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}> 
                  <MaterialIcons name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* FAQ Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Câu Hỏi Thường Gặp</Title>
            {faqData.map((faq, index) => (
              <View key={index}>
                <List.Item
                  title={faq.question}
                  titleStyle={styles.faqQuestion}
                  description={faq.answer}
                  descriptionStyle={styles.faqAnswer}
                  left={(props) => (
                    <MaterialIcons name="help-outline" size={20} color={COLORS.primary} {...props} />
                  )}
                />
                {index < faqData.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Emergency Contact */}
        <Card style={[styles.card, styles.emergencyCard]}>
          <Card.Content>
            <View style={styles.emergencyHeader}>
              <MaterialIcons name="emergency" size={24} color={COLORS.error} />
              <Title style={[styles.cardTitle, { color: COLORS.error }]}>Liên Hệ Khẩn Cấp</Title>
            </View>
            <Text style={styles.emergencyText}>
              Trong trường hợp khẩn cấp, vui lòng gọi ngay:
            </Text>
            <Button
              mode="contained"
              onPress={() => handleCall('115')}
              style={[styles.emergencyButton, { backgroundColor: COLORS.error }]}
              icon="phone"
            >
              Gọi 115 - Cấp Cứu
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleCall('0123456789')}
              style={styles.emergencyButton}
              icon="local-hospital"
            >
              Gọi Trực Viện Sĩ
            </Button>
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Thông Tin Ứng Dụng</Title>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Phiên bản:</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Cập nhật lần cuối:</Text>
              <Text style={styles.appInfoValue}>01/01/2024</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Nhà phát triển:</Text>
              <Text style={styles.appInfoValue}>Nursing Home Management</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6c757d',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6c757d',
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  emergencyButton: {
    marginBottom: 8,
  },
  appInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
});

export default SupportScreen; 