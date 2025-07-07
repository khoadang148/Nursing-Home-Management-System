import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const TermsOfServiceScreen = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const termsData = [
    {
      id: 'services',
      title: '1. Dịch Vụ Chăm Sóc',
      icon: 'medical-services',
      content: [
        {
          subtitle: 'Gói dịch vụ chăm sóc',
          text: 'Viện cung cấp các gói dịch vụ chăm sóc khác nhau phù hợp với tình trạng sức khỏe của người cao tuổi. Mỗi gói bao gồm dịch vụ ăn uống, thuốc men cơ bản, và các hoạt động giải trí.'
        },
        {
          subtitle: 'Dịch vụ bao gồm',
          text: 'Tất cả dịch vụ ăn uống, thuốc men theo đơn bác sĩ, và các hoạt động sinh hoạt đã được bao gồm trong gói dịch vụ mà không tính phí thêm.'
        },
        {
          subtitle: 'Dịch vụ bổ sung',
          text: 'Người nhà có thể tự do mang thuốc, thực phẩm chức năng hoặc thức ăn cho người thân. Các yêu cầu thêm thuốc từ bệnh viện sẽ được tính phí riêng.'
        }
      ]
    },
    {
      id: 'pricing',
      title: '2. Chính Sách Tính Phí',
      icon: 'attach-money',
      content: [
        {
          subtitle: 'Cơ sở tính phí',
          text: 'Chi phí được tính dựa trên gói dịch vụ chăm sóc và loại phòng được chọn. Giá cả tính theo số ngày thực tế người cao tuổi lưu trú tại viện.'
        },
        {
          subtitle: 'Công thức tính',
          text: 'Phí tháng = (Tổng phí gói dịch vụ ÷ 30 ngày) × Số ngày thực tế ở viện'
        },
        {
          subtitle: 'Đăng ký lần đầu',
          text: 'Khi đăng ký, người nhà cần thanh toán cọc trước 1 tháng cộng với tiền phí tháng đầu tiên.'
        }
      ]
    },
    {
      id: 'payment',
      title: '3. Thanh Toán',
      icon: 'payment',
      content: [
        {
          subtitle: 'Chu kỳ thanh toán',
          text: 'Thanh toán được thực hiện hàng tháng từ ngày 1 đến ngày 5 của mỗi tháng.'
        },
        {
          subtitle: 'Phương thức thanh toán',
          text: 'Đợt đăng ký đầu tiên: Thanh toán tại quầy nhân viên bằng chuyển khoản. Các tháng tiếp theo: Có thể thanh toán online hoặc tại quầy.'
        },
        {
          subtitle: 'Quá hạn thanh toán',
          text: 'Nếu quá ngày 5 mà chưa thanh toán, viện sẽ thông báo và trao đổi với người nhà để đưa người cao tuổi về nhà.'
        }
      ]
    },
    {
      id: 'service_change',
      title: '4. Thay Đổi Gói Dịch Vụ',
      icon: 'swap-horizontal-circle',
      content: [
        {
          subtitle: 'Điều kiện thay đổi',
          text: 'Khi người cao tuổi có thay đổi về tình trạng sức khỏe và cần chuyển sang gói dịch vụ khác, việc thay đổi sẽ có hiệu lực từ tháng tiếp theo.'
        },
        {
          subtitle: 'Quy trình thay đổi',
          text: 'Hoàn thành hợp đồng hiện tại đến hết tháng, sau đó đăng ký gói dịch vụ mới cho tháng tiếp theo.'
        }
      ]
    },
    {
      id: 'termination',
      title: '5. Chấm Dứt Dịch Vụ',
      icon: 'exit-to-app',
      content: [
        {
          subtitle: 'Do người nhà yêu cầu',
          text: 'Nếu người nhà muốn đón người cao tuổi về, phí sẽ được tính theo công thức: (Tổng phí gói ÷ 30 ngày) × Số ngày thực tế ở viện.'
        },
        {
          subtitle: 'Hoàn tiền',
          text: 'Số tiền dư sẽ được hoàn lại cho người nhà vì tiền được thu trước vào đầu mỗi tháng.'
        },
        {
          subtitle: 'Do vi phạm thanh toán',
          text: 'Khi không thanh toán đúng hạn sau thông báo, viện có quyền chấm dứt dịch vụ và yêu cầu người nhà đón về.'
        }
      ]
    },
    {
      id: 'responsibilities',
      title: '6. Trách Nhiệm Các Bên',
      icon: 'handshake',
      content: [
        {
          subtitle: 'Trách nhiệm của viện',
          text: 'Cung cấp dịch vụ chăm sóc chất lượng, đảm bảo an toàn và sức khỏe cho người cao tuổi theo gói dịch vụ đã đăng ký.'
        },
        {
          subtitle: 'Trách nhiệm của người nhà',
          text: 'Thanh toán đúng hạn, cung cấp thông tin sức khỏe chính xác, tuân thủ các quy định của viện.'
        },
        {
          subtitle: 'Thăm viếng',
          text: 'Người nhà được quyền thăm viếng theo lịch đã đăng ký và phải tuân thủ các quy định về giờ thăm viếng.'
        }
      ]
    },
    {
      id: 'privacy',
      title: '7. Bảo Mật Thông Tin',
      icon: 'privacy-tip',
      content: [
        {
          subtitle: 'Thu thập thông tin',
          text: 'Viện chỉ thu thập thông tin cần thiết để cung cấp dịch vụ chăm sóc tốt nhất.'
        },
        {
          subtitle: 'Bảo vệ thông tin',
          text: 'Mọi thông tin cá nhân và y tế của người cao tuổi được bảo mật tuyệt đối và chỉ chia sẻ với nhân viên y tế có liên quan.'
        },
        {
          subtitle: 'Quyền truy cập',
          text: 'Người nhà có quyền truy cập và yêu cầu cập nhật thông tin của người thân mình.'
        }
      ]
    },
    {
      id: 'emergency',
      title: '8. Tình Huống Khẩn Cấp',
      icon: 'local-hospital',
      content: [
        {
          subtitle: 'Xử lý khẩn cấp',
          text: 'Trong trường hợp khẩn cấp, viện sẽ liên hệ ngay với người nhà và thực hiện các biện pháp cấp cứu cần thiết.'
        },
        {
          subtitle: 'Chi phí phát sinh',
          text: 'Chi phí cấp cứu và điều trị đặc biệt ngoài gói dịch vụ sẽ được thông báo và tính riêng.'
        }
      ]
    }
  ];

  const ContactSection = () => (
    <Card style={styles.contactCard} mode="outlined">
      <Card.Content>
        <Title style={styles.contactTitle}>Thông Tin Liên Hệ</Title>
        <View style={styles.contactItem}>
          <MaterialIcons name="phone" size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>Hotline: 1900-1234</Text>
        </View>
        <View style={styles.contactItem}>
          <MaterialIcons name="email" size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>Email: support@nursinghome.com</Text>
        </View>
        <View style={styles.contactItem}>
          <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>
            Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
          </Text>
        </View>
        <Paragraph style={styles.contactNote}>
          Nếu có bất kỳ thắc mắc nào về điều khoản dịch vụ, vui lòng liên hệ với chúng tôi.
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Title style={styles.headerTitle}>Điều Khoản Dịch Vụ</Title>
        </View>

        {/* Introduction */}
        <Card style={styles.introCard} mode="elevated">
          <Card.Content>
            <Title style={styles.introTitle}>
              Điều Khoản Sử Dụng Dịch Vụ Chăm Sóc Người Cao Tuổi
            </Title>
            <Paragraph style={styles.introText}>
              Chào mừng bạn đến với hệ thống quản lý viện dưỡng lão. 
              Vui lòng đọc kỹ các điều khoản dưới đây để hiểu rõ quyền lợi 
              và nghĩa vụ khi sử dụng dịch vụ của chúng tôi.
            </Paragraph>
            <Text style={styles.lastUpdated}>
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </Text>
          </Card.Content>
        </Card>

        {/* Terms Sections */}
        {termsData.map((section) => (
          <Card key={section.id} style={styles.sectionCard} mode="outlined">
            <TouchableOpacity
              onPress={() => toggleSection(section.id)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons 
                  name={section.icon} 
                  size={24} 
                  color={COLORS.primary} 
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <MaterialIcons
                name={expandedSections[section.id] ? "expand-less" : "expand-more"}
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            
            {expandedSections[section.id] && (
              <Card.Content style={styles.sectionContent}>
                {section.content.map((item, index) => (
                  <View key={index} style={styles.contentItem}>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    <Text style={styles.contentText}>{item.text}</Text>
                    {index < section.content.length - 1 && (
                      <Divider style={styles.contentDivider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            )}
          </Card>
        ))}

        {/* Contact Information */}
        <ContactSection />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bằng cách sử dụng dịch vụ, bạn đã đồng ý với các điều khoản trên.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  introCard: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionContent: {
    paddingTop: 0,
  },
  contentItem: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  contentDivider: {
    marginTop: 12,
    backgroundColor: COLORS.border,
  },
  contactCard: {
    marginBottom: 20,
    backgroundColor: '#e3f2fd',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  contactNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen; 