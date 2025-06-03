import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { 
  Appbar, 
  Card, 
  Avatar, 
  IconButton, 
  FAB,
  Chip,
  Divider,
  Button
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Mock data for family contacts
const mockFamilyData = [
  {
    id: '1',
    name: 'Nguyễn Văn Nam',
    relationship: 'Con trai',
    phone: '+84 901 234 567',
    email: 'nam.nguyen@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    isPrimary: true,
    emergencyContact: true,
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    notes: 'Liên hệ chính, có thể gọi bất cứ lúc nào'
  },
  {
    id: '2',
    name: 'Trần Thị Hoa',
    relationship: 'Con gái',
    phone: '+84 902 345 678',
    email: 'hoa.tran@email.com',
    address: '456 Đường DEF, Quận 3, TP.HCM',
    isPrimary: false,
    emergencyContact: true,
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    notes: 'Thường đến thăm vào cuối tuần'
  },
  {
    id: '3',
    name: 'Nguyễn Minh Anh',
    relationship: 'Cháu nội',
    phone: '+84 903 456 789',
    email: 'minhanh@email.com',
    address: '789 Đường GHI, Quận 7, TP.HCM',
    isPrimary: false,
    emergencyContact: false,
    photo: 'https://randomuser.me/api/portraits/women/25.jpg',
    notes: 'Sinh viên, có thể liên hệ sau 5h chiều'
  }
];

const ResidentFamilyScreen = ({ navigation, route }) => {
  const [familyContacts, setFamilyContacts] = useState(mockFamilyData);
  const residentName = route?.params?.residentName || 'Cư dân';

  const handleCall = (phoneNumber) => {
    Alert.alert(
      'Gọi điện thoại',
      `Bạn có muốn gọi cho ${phoneNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Gọi', 
          onPress: () => Linking.openURL(`tel:${phoneNumber}`)
        }
      ]
    );
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleAddContact = () => {
    // Navigate to add contact screen
    Alert.alert('Thông báo', 'Chức năng thêm liên hệ sẽ được phát triển');
  };

  const handleEditContact = (contactId) => {
    Alert.alert('Thông báo', 'Chức năng chỉnh sửa liên hệ sẽ được phát triển');
  };

  const renderContactCard = (contact) => (
    <Card key={contact.id} style={styles.contactCard}>
      <Card.Content>
        <View style={styles.contactHeader}>
          <View style={styles.contactInfo}>
            <Avatar.Image 
              size={60} 
              source={{ uri: contact.photo }}
              style={styles.avatar}
            />
            <View style={styles.contactDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.isPrimary && (
                  <Chip 
                    icon="star" 
                    mode="outlined" 
                    compact
                    style={styles.primaryChip}
                    textStyle={styles.chipText}
                  >
                    Chính
                  </Chip>
                )}
              </View>
              <Text style={styles.relationship}>{contact.relationship}</Text>
              {contact.emergencyContact && (
                <Chip 
                  icon="alert" 
                  mode="outlined" 
                  compact
                  style={styles.emergencyChip}
                  textStyle={styles.emergencyChipText}
                >
                  Liên hệ khẩn cấp
                </Chip>
              )}
            </View>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            iconColor={COLORS.primary}
            onPress={() => handleEditContact(contact.id)}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.contactActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCall(contact.phone)}
          >
            <MaterialIcons name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>{contact.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEmail(contact.email)}
          >
            <MaterialIcons name="email" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>{contact.email}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressContainer}>
          <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
          <Text style={styles.address}>{contact.address}</Text>
        </View>

        {contact.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Ghi chú:</Text>
            <Text style={styles.notesText}>{contact.notes}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Gia đình - ${residentName}`} />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông tin liên hệ gia đình</Text>
          <Text style={styles.headerSubtitle}>
            {familyContacts.length} người liên hệ
          </Text>
        </View>

        {familyContacts.map(renderContactCard)}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddContact}
        label="Thêm liên hệ"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    marginBottom: SIZES.large,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  headerSubtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  contactCard: {
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  contactInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SIZES.medium,
  },
  contactDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  contactName: {
    ...FONTS.h4,
    color: COLORS.text,
    marginRight: SIZES.small,
  },
  relationship: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
  primaryChip: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
  },
  emergencyChip: {
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error,
  },
  emergencyChipText: {
    fontSize: SIZES.body3,
    color: COLORS.error,
  },
  divider: {
    marginVertical: SIZES.medium,
  },
  contactActions: {
    marginBottom: SIZES.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    marginBottom: SIZES.small / 2,
  },
  actionText: {
    ...FONTS.body2,
    color: COLORS.primary,
    marginLeft: SIZES.small,
    textDecorationLine: 'underline',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  address: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginLeft: SIZES.small / 2,
    flex: 1,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    marginTop: SIZES.small,
  },
  notesLabel: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  notesText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: SIZES.medium,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpace: {
    height: 100,
  },
});

export default ResidentFamilyScreen; 