import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  MaterialIcons, 
  FontAwesome5, 
  Ionicons 
} from '@expo/vector-icons';
import { 
  Card, 
  Title, 
  List, 
  Divider, 
  Button,
  Avatar,
} from 'react-native-paper';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

// Mock data for family contacts
const mockFamilyContacts = [
  {
    id: '1',
    name: 'Nguyễn Thị Mai',
    relationship: 'Con gái',
    phone: '0123456789',
    email: 'mai.nguyen@email.com',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    residentName: 'Nguyễn Văn An',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    id: '2',
    name: 'Trần Văn Bình',
    relationship: 'Con trai',
    phone: '0987654321',
    email: 'binh.tran@email.com',
    address: '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
    residentName: 'Trần Thị Lan',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    id: '3',
    name: 'Lê Thị Cúc',
    relationship: 'Cháu gái',
    phone: '0369852147',
    email: 'cuc.le@email.com',
    address: '789 Đường Pasteur, Quận 1, TP.HCM',
    residentName: 'Lê Văn Minh',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
  }
];

const FamilyContactScreen = () => {
  const navigation = useNavigation();
  const [familyContacts] = useState(mockFamilyContacts);

  const handleCall = (phone) => {
    // In a real app, this would open the phone dialer
    console.log('Calling:', phone);
  };

  const handleEmail = (email) => {
    // In a real app, this would open the email app
    console.log('Emailing:', email);
  };

  const handleViewDetails = (contact) => {
    // Navigate to contact details
    console.log('View details for:', contact.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Liên Hệ Người Nhà</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tổng quan</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{familyContacts.length}</Text>
                <Text style={styles.summaryLabel}>Liên hệ</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>3</Text>
                <Text style={styles.summaryLabel}>Cư dân</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>5</Text>
                <Text style={styles.summaryLabel}>Cuộc gọi</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Family Contacts List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Danh sách liên hệ</Title>
            
            {familyContacts.map((contact, index) => (
              <View key={contact.id}>
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleViewDetails(contact)}
                >
                  <View style={styles.contactLeft}>
                    <Avatar.Image
                      source={{ uri: contact.avatar }}
                      size={50}
                      style={styles.contactAvatar}
                    />
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactRelationship}>
                        {contact.relationship} của {contact.residentName}
                      </Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <MaterialIcons name="phone" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEmail(contact.email)}
                    >
                      <MaterialIcons name="email" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
                
                {index < familyContacts.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Thao tác nhanh</Title>
            
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <MaterialIcons name="person-add" size={24} color={COLORS.primary} />
                <Text style={styles.quickActionText}>Thêm liên hệ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <MaterialIcons name="history" size={24} color={COLORS.primary} />
                <Text style={styles.quickActionText}>Lịch sử liên lạc</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
                <Text style={styles.quickActionText}>Nhắc nhở</Text>
              </TouchableOpacity>
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
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    ...FONTS.h4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactRelationship: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactPhone: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  divider: {
    marginVertical: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FamilyContactScreen; 