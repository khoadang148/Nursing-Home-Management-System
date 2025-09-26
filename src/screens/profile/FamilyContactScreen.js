import React, { useState, useEffect } from 'react';
import {
  View,
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useMessageContext } from '../../contexts/MessageContext';
import { setUnreadMessageCount } from '../../redux/slices/messageSlice';
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
  ActivityIndicator,
  FAB,
} from 'react-native-paper';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';
import messageService from '../../api/services/messageService';
import familyService from '../../api/services/familyService';
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import CommonAvatar from '../../components/CommonAvatar';



const FamilyContactScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { triggerRefresh } = useMessageContext();
  const [familyContacts, setFamilyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const messagesListRef = React.useRef(null);
  
  // New message creation states
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [allResidents, setAllResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);

  useEffect(() => {
    loadFamilyContacts();
    
    // Thiết lập auto-refresh mỗi 30 giây để cập nhật message count
    const interval = setInterval(() => {
      loadFamilyContacts();
    }, 30000); // 30 giây
    
    return () => clearInterval(interval);
  }, []);

  const loadFamilyContacts = async () => {
    try {
      setLoading(true);
      // Temporarily disabled due to API errors
      console.log('Message API temporarily disabled due to backend errors');
      setFamilyContacts([]);
      dispatch(setUnreadMessageCount(0));
    } catch (error) {
      console.error('Error loading conversations:', error);
      setFamilyContacts([]);
      dispatch(setUnreadMessageCount(0));
    } finally {
      setLoading(false);
    }
  };

  const loadAllResidents = async () => {
    setLoadingResidents(true);
    try {
      // Lấy tất cả residents từ API
      // Kiểm tra role của user để sử dụng API phù hợp
      let response;
      if (user?.role === 'family') {
        // Family member chỉ có thể xem residents của mình
        response = await residentService.getResidentsByFamilyMember(user._id || user.id);
      } else {
        // Staff có thể xem tất cả residents
        response = await familyService.getAllResidents();
      }
      if (response.success) {
        const residents = response.data || [];
        
        // Lấy thông tin bed assignment cho mỗi resident
        const residentsWithBedInfo = await Promise.all(
          residents.map(async (resident) => {
            try {
              const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
              if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                // Lấy assignment đầu tiên (active - unassigned_date = null)
                const bedAssignment = bedResponse.data[0];
                return {
                  ...resident,
                  room_info: {
                    room_number: bedAssignment.bed_id?.room_id?.room_number,
                    bed_number: bedAssignment.bed_id?.bed_number,
                    room_type: bedAssignment.bed_id?.room_id?.room_type?.type_name
                  }
                };
              } else {
                return {
                  ...resident,
                  room_info: null
                };
              }
            } catch (error) {
              console.error(`Error fetching bed info for resident ${resident._id}:`, error);
              return {
                ...resident,
                room_info: null
              };
            }
          })
        );
        
        setAllResidents(residentsWithBedInfo);
      } else {
        console.error('Failed to load residents:', response.error);
        Alert.alert('Lỗi', response.error || 'Không thể tải danh sách cư dân');
        setAllResidents([]);
      }
    } catch (error) {
      console.error('Error loading residents:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      setAllResidents([]);
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleCall = (phone) => {
    // In a real app, this would open the phone dialer
    console.log('Calling:', phone);
  };

  const handleEmail = (email) => {
    // In a real app, this would open the email app
    console.log('Emailing:', email);
  };

  const handleViewDetails = async (contact) => {
    setSelectedContact(contact);
    setShowChat(true);
    
    try {
      // Load messages for this contact
      const partnerId = contact.partner?._id || contact.partner?.id;
      const messagesResponse = await messageService.getConversation(partnerId);
      
      if (messagesResponse.success) {
        setMessages(prev => ({
          ...prev,
          [partnerId]: messagesResponse.data || []
        }));

        // Auto scroll to bottom after messages are loaded
        setTimeout(() => {
          if (messagesListRef.current?.scrollToEnd) {
            messagesListRef.current.scrollToEnd({ animated: false });
          }
        }, 0);
        
        // Temporarily disabled due to API errors
        // const conversationsResponse = await messageService.getUserConversations();
        // if (conversationsResponse.success) {
        //   const familyConversations = conversationsResponse.data.filter(conversation => 
        //     conversation.partner?.role === 'family'
        //   );
        //   setFamilyContacts(familyConversations);
        //   
        //   // Cập nhật Redux với số tin nhắn chưa đọc mới
        //   const totalUnreadCount = familyConversations.reduce((total, conversation) => {
        //     return total + (conversation.unreadCount || 0);
        //   }, 0);
        //   dispatch(setUnreadMessageCount(totalUnreadCount));
        // }
        
        // Trigger badge refresh
        triggerRefresh();
      } else {
        console.error('Failed to load messages:', messagesResponse.error);
        Alert.alert('Lỗi', 'Không thể tải tin nhắn');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Lỗi', 'Không thể tải tin nhắn');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} phút`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ`;
    } else {
      return `${diffDays} ngày`;
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const shouldShowDateSeparator = (prevMessage, currentMessage) => {
    if (!prevMessage) return true;
    
    const prevDate = new Date(prevMessage.timestamp || prevMessage.createdAt);
    const currentDate = new Date(currentMessage.timestamp || currentMessage.createdAt);
    
    return prevDate.toDateString() !== currentDate.toDateString();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    // Validate required fields
    const residentId = selectedContact.resident?._id;
    if (!residentId) {
      Alert.alert('Lỗi', 'Không thể xác định cư dân liên quan');
      return;
    }

    try {
      const messageData = {
        content: newMessage.trim(),
        receiver_id: selectedContact.partner?._id || selectedContact.partner?.id,
        resident_id: residentId,
      };
      
      console.log('Sending message with data:', messageData);
      console.log('Selected contact:', selectedContact);

      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        // Add new message to local state
        const newMessageObj = {
          _id: response.data._id || Date.now().toString(),
          sender_id: { _id: user?.id || user?._id || 'staff_1', role: 'STAFF' },
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
        };

        const partnerId = selectedContact.partner?._id || selectedContact.partner?.id;
        const contactMessages = messages[partnerId] || [];
        setMessages(prev => ({
          ...prev,
          [partnerId]: [...contactMessages, newMessageObj],
        }));

        // Scroll to bottom after adding a new message
        setTimeout(() => {
          if (messagesListRef.current?.scrollToEnd) {
            messagesListRef.current.scrollToEnd({ animated: true });
          }
        }, 0);

        // Temporarily disabled due to API errors
        // const conversationsResponse = await messageService.getUserConversations();
        // if (conversationsResponse.success) {
        //   const familyConversations = conversationsResponse.data.filter(conversation => 
        //     conversation.partner?.role === 'family'
        //   );
        //   setFamilyContacts(familyConversations);
        // }
        
        // Trigger badge refresh
        triggerRefresh();

        setNewMessage('');
      } else {
        Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  // New message creation functions
  const handleCreateNewMessage = async () => {
    setShowCreateMessage(true);
    setSelectedResident(null);
    setInitialMessage('');
    
    // Load all residents when opening modal
    await loadAllResidents();
  };

  const handleSelectResident = (resident) => {
    setSelectedResident(resident);
  };

  const handleCreateConversation = async () => {
    if (!initialMessage.trim() || !selectedResident) {
      Alert.alert('Lỗi', 'Vui lòng nhập tin nhắn và chọn cư dân');
      return;
    }

    // Validate required fields
    if (!selectedResident._id) {
      Alert.alert('Lỗi', 'Không thể xác định cư dân liên quan');
      return;
    }

    // Get family member ID from resident data
    const familyMemberId = selectedResident.family_member_id?._id || selectedResident.family_member_id;
    if (!familyMemberId) {
      Alert.alert('Lỗi', 'Cư dân này chưa có người nhà được đăng ký');
      return;
    }

    console.log('Selected resident:', selectedResident);
    console.log('Family member ID:', familyMemberId);
    console.log('Resident ID:', selectedResident._id);

    try {
      // Send initial message
      const messageData = {
        content: initialMessage.trim(),
        receiver_id: familyMemberId,
        resident_id: selectedResident._id,
      };

      console.log('Creating conversation with data:', messageData);

      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        // Reload conversations to get the new one
        await loadFamilyContacts();
        
        // Trigger badge refresh
        triggerRefresh();
        
        Alert.alert('Thành công', 'Tin nhắn đã được gửi');
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
    }

    // Reset form
    setShowCreateMessage(false);
    setSelectedResident(null);
    setInitialMessage('');
  };

  const renderCreateMessageModal = () => (
    <Modal
      visible={showCreateMessage}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowCreateMessage(false)}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={() => setShowCreateMessage(false)}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Tạo tin nhắn mới</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCreateMessage(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {!selectedResident ? (
            <>
              <Text style={styles.stepDescription}>Chọn cư dân cần liên hệ:</Text>
              {loadingResidents ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải danh sách cư dân...</Text>
                </View>
              ) : allResidents.length > 0 ? (
                allResidents.map((resident) => (
                  <TouchableOpacity
                    key={resident._id}
                    style={styles.selectionItem}
                    onPress={() => handleSelectResident(resident)}
                  >
                    <CommonAvatar 
                      size={48} 
                      source={resident.avatar}
                      name={resident.full_name || resident.name}
                    />
                    <View style={styles.selectionInfo}>
                      <Text style={styles.selectionName}>{resident.full_name || resident.name}</Text>
                      <Text style={styles.selectionDetails}>
                        Phòng: {resident.room_info?.room_number || 'Chưa phân phòng'}
                        {resident.room_info?.bed_number && ` - Giường ${resident.room_info.bed_number}`}
                      </Text>
                      <Text style={styles.selectionDetails}>
                        Người nhà: {resident.family_member_id?.full_name || 'Chưa đăng ký'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Không có cư dân nào</Text>
                  <Text style={styles.emptyStateSubtext}>Vui lòng thử lại sau</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.selectedInfo}>
                <CommonAvatar 
                  size={32} 
                  source={selectedResident?.avatar}
                  name={selectedResident?.full_name || selectedResident?.name}
                />
                <Text style={styles.selectedText}>
                  Cư dân: {selectedResident?.full_name || selectedResident?.name}
                </Text>
              </View>
              <View style={styles.selectedInfo}>
                <CommonAvatar 
                  size={32} 
                  source={selectedResident?.family_member_id?.avatar}
                  name={selectedResident?.family_member_id?.full_name}
                />
                <Text style={styles.selectedText}>
                  Người nhà: {selectedResident?.family_member_id?.full_name || 'Chưa đăng ký'}
                </Text>
              </View>
              <Text style={styles.stepDescription}>Soạn tin nhắn:</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập nội dung tin nhắn..."
                value={initialMessage}
                onChangeText={setInitialMessage}
                multiline
                numberOfLines={4}
              />
              <Button
                mode="contained"
                onPress={handleCreateConversation}
                style={styles.createButton}
                disabled={!initialMessage.trim()}
              >
                Gửi tin nhắn
              </Button>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.customHeaderTitle}>Liên Hệ Người Nhà Cư Dân</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách liên hệ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
                  <Text style={styles.customHeaderTitle}>Liên Hệ Người Nhà Cư Dân</Text>
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
                <Text style={styles.summaryLabel}>Cuộc trò chuyện</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{new Set(familyContacts.map(c => c.resident?._id).filter(Boolean)).size}</Text>
                <Text style={styles.summaryLabel}>Cư dân</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{familyContacts.filter(c => c.unreadCount > 0).length}</Text>
                <Text style={styles.summaryLabel}>Tin nhắn mới</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Family Contacts List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Liên hệ với người nhà cư dân</Title>
            
            {familyContacts.map((contact, index) => (
              <View key={contact.partner?._id || contact.partner?.id || index}>
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleViewDetails(contact)}
                >
                  <View style={styles.contactLeft}>
                    <CommonAvatar
                      source={contact.partner?.avatar}
                      size={50}
                      name={contact.partner?.full_name}
                      style={styles.contactAvatar}
                    />
                    <View style={styles.contactInfo}>
                      <View style={styles.contactHeader}>
                        <Text style={styles.contactName}>{contact.partner?.full_name}</Text>
                        <Text style={styles.contactTime}>{formatTime(contact.lastMessage?.timestamp || contact.timestamp)}</Text>
                      </View>
                      <Text style={styles.contactRelationship}>
                        Người nhà của {contact.resident?.full_name || 'Không xác định'}
                      </Text>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {contact.lastMessage?.content || contact.lastMessage || 'Chưa có tin nhắn'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactActions}>
                    {contact.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{contact.unreadCount}</Text>
                      </View>
                    )}
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

      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateNewMessage}
        color="white"
      />

      {/* Create Message Modal */}
      {renderCreateMessageModal()}

      {/* Chat Screen */}
      {showChat && selectedContact && (
        <SafeAreaView style={styles.chatContainer} edges={['top']}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
                         <View style={styles.chatHeaderInfo}>
               <CommonAvatar 
                 size={40} 
                 source={selectedContact.partner?.avatar}
                 name={selectedContact.partner?.full_name}
               />
               <View style={styles.chatHeaderText}>
                 <Text style={styles.chatHeaderName}>{selectedContact.partner?.full_name}</Text>
                 <Text style={styles.chatHeaderRole}>
                   Người nhà của {selectedContact.resident?.full_name || 'Không xác định'}
                 </Text>
               </View>
             </View>
          </View>

          <KeyboardAvoidingView 
            style={styles.chatContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              ref={messagesListRef}
              onContentSizeChange={() => messagesListRef.current?.scrollToEnd?.({ animated: false })}
              onLayout={() => messagesListRef.current?.scrollToEnd?.({ animated: false })}
            >
                             {(messages[selectedContact.partner?._id || selectedContact.partner?.id] || []).map((message, index, messages) => {
                // Get current user ID from Redux
                const currentUserId = user?.id || user?._id || 'staff_1'; // Fallback for demo
                
                // Determine if message is from current user based on sender_id
                const isMyMessage = message.sender_id?._id === currentUserId || 
                                   message.sender_id === currentUserId ||
                                   message.senderId === currentUserId;
                
                // Check if we need to show date separator
                const showDateSeparator = index === 0 || shouldShowDateSeparator(messages[index - 1], message);
                
                return (
                  <View key={message._id || message.id}>
                    {showDateSeparator && (
                      <View style={styles.dateSeparator}>
                        <Text style={styles.dateSeparatorText}>
                          {formatMessageDate(message.createdAt || message.timestamp)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageContainer,
                        isMyMessage ? styles.myMessage : styles.partnerMessage,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMyMessage ? styles.myMessageText : styles.partnerMessageText,
                        ]}
                      >
                        {message.content || message.message}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isMyMessage ? styles.myMessageTime : styles.partnerMessageTime,
                        ]}
                      >
                        {formatMessageTime(message.createdAt || message.timestamp)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Nhập tin nhắn..."
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <MaterialIcons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
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
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  contactTime: {
    fontSize: 13,
    color: '#888',
  },
  contactRelationship: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    marginVertical: 8,
  },
  // Chat styles
  chatContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  chatHeaderText: {
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  chatHeaderRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatContent: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  partnerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 0,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
    fontWeight: '400',
  },
  partnerMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 0,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  partnerMessageTime: {
    color: '#888',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#65676b',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '500',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalBackButton: {
    padding: 8,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontWeight: '500',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    marginTop: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default FamilyContactScreen; 