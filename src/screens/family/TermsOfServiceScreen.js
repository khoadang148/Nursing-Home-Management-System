import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const TermsOfServiceScreen = ({ navigation }) => {
  const termsSections = [
    {
      id: '1',
      title: '1. Điều Khoản Chung',
      content: `Bằng việc sử dụng ứng dụng NHMS (Nursing Home Management System), bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Ứng dụng được cung cấp bởi [Tên Công Ty] và được thiết kế để hỗ trợ quản lý và chăm sóc người cao tuổi trong các cơ sở y tế.`
    },
    {
      id: '2',
      title: '2. Mục Đích Sử Dụng',
      content: `Ứng dụng NHMS được phát triển với mục đích:
• Cung cấp thông tin về tình trạng sức khỏe của người thân
• Hỗ trợ liên lạc giữa gia đình và nhân viên chăm sóc
• Quản lý lịch thăm và hoạt động
• Theo dõi hóa đơn và thanh toán
• Cập nhật thông tin về các hoạt động và dịch vụ`
    },
    {
      id: '3',
      title: '3. Bảo Mật Thông Tin',
      content: `Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn:
• Tất cả thông tin được mã hóa và bảo mật
• Chỉ những người được ủy quyền mới có thể truy cập
• Không chia sẻ thông tin với bên thứ ba mà không có sự đồng ý
• Tuân thủ các quy định về bảo vệ dữ liệu cá nhân`
    },
    {
      id: '4',
      title: '4. Trách Nhiệm Người Dùng',
      content: `Người dùng có trách nhiệm:
• Cung cấp thông tin chính xác và cập nhật
• Bảo mật thông tin đăng nhập
• Sử dụng ứng dụng đúng mục đích
• Tôn trọng quyền riêng tư của người khác
• Báo cáo các hoạt động bất thường`
    },
    {
      id: '5',
      title: '5. Giới Hạn Trách Nhiệm',
      content: `Chúng tôi không chịu trách nhiệm về:
• Các lỗi kỹ thuật ngoài tầm kiểm soát
• Mất mát dữ liệu do lỗi người dùng
• Các vấn đề về kết nối internet
• Thiệt hại gián tiếp phát sinh từ việc sử dụng ứng dụng`
    },
    {
      id: '6',
      title: '6. Cập Nhật Điều Khoản',
      content: `Chúng tôi có quyền cập nhật các điều khoản này khi cần thiết. Người dùng sẽ được thông báo trước khi có thay đổi quan trọng. Việc tiếp tục sử dụng ứng dụng sau khi cập nhật được coi là đồng ý với các điều khoản mới.`
    },
    {
      id: '7',
      title: '7. Liên Hệ Hỗ Trợ',
      content: `Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ:
• Email: support@nhms.com
• Điện thoại: 1900-xxxx
• Địa chỉ: [Địa chỉ công ty]
• Giờ làm việc: Thứ 2 - Thứ 6, 8:00 - 17:00`
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Điều Khoản Dịch Vụ</Text>
        <View style={styles.headerRight} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="description" size={48} color={COLORS.primary} />
            </View>
            <Title style={styles.headerTitle}>Điều Khoản Dịch Vụ</Title>
            <Paragraph style={styles.headerSubtitle}>
              Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng ứng dụng NHMS
            </Paragraph>
            <View style={styles.lastUpdatedContainer}>
              <MaterialIcons name="update" size={16} color={COLORS.textSecondary} />
              <Text style={styles.lastUpdatedText}>Cập nhật lần cuối: 01/01/2024</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Terms Sections */}
        {termsSections.map((section) => (
          <Card key={section.id} style={styles.termsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>{section.title}</Title>
              <Paragraph style={styles.sectionContent}>
                {section.content}
              </Paragraph>
              </Card.Content>
          </Card>
        ))}

        {/* Acceptance Section */}
        <Card style={styles.acceptanceCard}>
          <Card.Content>
            <Title style={styles.acceptanceTitle}>Xác Nhận Đồng Ý</Title>
            <Paragraph style={styles.acceptanceText}>
              Bằng việc sử dụng ứng dụng NHMS, bạn xác nhận rằng đã đọc, hiểu và đồng ý với tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
            </Paragraph>
            <View style={styles.acceptanceInfo}>
              <MaterialIcons name="info" size={20} color={COLORS.primary} />
              <Text style={styles.acceptanceInfoText}>
                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng ứng dụng và liên hệ với chúng tôi để được hỗ trợ.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.contactCard}>
          <Card.Content>
            <Title style={styles.contactTitle}>Thông Tin Liên Hệ</Title>
            <View style={styles.contactItem}>
              <MaterialIcons name="email" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>support@nhms.com</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>1900-xxxx</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>123 Đường ABC, Quận 1, TP.HCM</Text>
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
    backgroundColor: COLORS.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    marginBottom: 20,
    elevation: 2,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  termsCard: {
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  acceptanceCard: {
    marginBottom: 20,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  acceptanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  acceptanceText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  acceptanceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    padding: 12,
    borderRadius: 8,
  },
  acceptanceInfoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  contactCard: {
    marginBottom: 20,
    elevation: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
});

export default TermsOfServiceScreen; 