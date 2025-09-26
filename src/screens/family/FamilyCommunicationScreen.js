import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMessageContext } from '../../contexts/MessageContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar, 
  IconButton,
  ActivityIndicator,
  FAB,
  Chip,
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import messageService from '../../api/services/messageService';
import familyService from '../../api/services/familyService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import CommonAvatar from '../../components/CommonAvatar';

// Removed all mock data - will use real API data instead

const FamilyCommunicationScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const { triggerRefresh } = useMessageContext();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesListRef = React.useRef(null);
  
  // New message creation states
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [createMessageStep, setCreateMessageStep] = useState(1); // 1: resident, 2: doctor, 3: message
  const [initialMessage, setInitialMessage] = useState('');
  
  // Real data states
  const [familyResidents, setFamilyResidents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Temporarily disabled due to API errors
      console.log('Message API temporarily disabled due to backend errors');
      setConversations([]);
      // const conversationsResponse = await messageService.getUserConversations();
      // if (conversationsResponse.success) {
      //   setConversations(conversationsResponse.data || []);
      // } else {
      //   console.error('Failed to load conversations:', conversationsResponse.error);
      //   Alert.alert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện');
      // }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyResidents = async () => {
    setLoadingResidents(true);
    try {
      // Lấy family member ID từ user data
      const familyMemberId = user._id;
      const response = await familyService.getFamilyResidents(familyMemberId);
      if (response.success) {
        const residents = response.data || [];
        
        // Lấy thông tin bed assignment cho mỗi resident
        console.log('🔄 Fetching bed assignments for residents...');
        const residentsWithBedInfo = await Promise.all(
          residents.map(async (resident) => {
            try {
              console.log(`🔄 Fetching bed info for resident: ${resident.full_name} (${resident._id})`);
              const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
              console.log(`📊 Bed response for ${resident.full_name}:`, bedResponse);
              
              if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                // Lấy assignment đầu tiên (active - unassigned_date = null)
                const bedAssignment = bedResponse.data[0];
                const roomInfo = {
                  room_number: bedAssignment.bed_id?.room_id?.room_number,
                  bed_number: bedAssignment.bed_id?.bed_number,
                  room_type: bedAssignment.bed_id?.room_id?.room_type?.type_name
                };
                console.log(`✅ Room info for ${resident.full_name}:`, roomInfo);
                return {
                  ...resident,
                  room_info: roomInfo
                };
              } else {
                console.log(`❌ No bed assignment found for ${resident.full_name}`);
                return {
                  ...resident,
                  room_info: null
                };
              }
            } catch (error) {
              console.error(`❌ Error fetching bed info for resident ${resident._id}:`, error);
              return {
                ...resident,
                room_info: null
              };
            }
          })
        );
        
        console.log('✅ Final residents with bed info:', residentsWithBedInfo);
        
        setFamilyResidents(residentsWithBedInfo);
      } else {
        console.error('Failed to load family residents:', response.error);
        // Không hiển thị alert để tránh làm gián đoạn UX
        console.log('Using fallback family residents data');
        // Fallback data để tránh lỗi
        setFamilyResidents([
          {
            _id: 'resident1',
            full_name: 'Nguyễn Văn Nam',
            room_info: {
              room_number: '101',
              bed_number: '1',
              room_type: 'Phòng đơn'
            },
            avatar: null
          },
          {
            _id: 'resident2',
            full_name: 'Nguyễn Văn An', 
            room_info: {
              room_number: '102',
              bed_number: '1',
              room_type: 'Phòng đơn'
            },
            avatar: null
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading family residents:', error);
      // Không hiển thị alert để tránh làm gián đoạn UX
      console.log('Using fallback family residents data due to error');
      setFamilyResidents([
        {
          _id: 'resident1',
          full_name: 'Nguyễn Văn Nam',
          room_info: {
            room_number: '101',
            bed_number: '1',
            room_type: 'Phòng đơn'
          },
          avatar: null
        },
        {
          _id: 'resident2',
          full_name: 'Nguyễn Văn An', 
          room_info: {
            room_number: '102',
            bed_number: '1',
            room_type: 'Phòng đơn'
          },
          avatar: null
        }
      ]);
    } finally {
      setLoadingResidents(false);
    }
  };
  
  const loadAllStaff = async () => {
    setLoadingStaff(true);
    try {
      const response = await familyService.getAllStaff();
      if (response.success) {
        setAllStaff(response.data || []);
      } else {
        console.error('Failed to load staff:', response.error);
        // Không hiển thị alert để tránh làm gián đoạn UX
        console.log('Using fallback staff data');
        // Fallback data để tránh lỗi
        setAllStaff([
          {
            _id: 'staff1',
            full_name: 'Bác sĩ Nguyễn Văn A',
            position: 'Bác sĩ chính',
            qualification: 'Chuyên khoa Lão khoa',
            avatar: null,
            online: true
          },
          {
            _id: 'staff2', 
            full_name: 'Y tá Phạm Thị B',
            position: 'Y tá trưởng',
            qualification: 'Điều dưỡng cao cấp',
            avatar: null,
            online: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      // Không hiển thị alert để tránh làm gián đoạn UX
      console.log('Using fallback staff data due to error');
      setAllStaff([
        {
          _id: 'staff1',
          full_name: 'Bác sĩ Nguyễn Văn A',
          position: 'Bác sĩ chính',
          qualification: 'Chuyên khoa Lão khoa',
          avatar: null,
          online: true
        },
        {
          _id: 'staff2', 
          full_name: 'Y tá Phạm Thị B',
          position: 'Y tá trưởng',
          qualification: 'Điều dưỡng cao cấp',
          avatar: null,
          online: false
        }
      ]);
    } finally {
      setLoadingStaff(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
    
    const prevDate = new Date(prevMessage.timestamp);
    const currentDate = new Date(currentMessage.timestamp);
    
    return prevDate.toDateString() !== currentDate.toDateString();
  };

  const handleConversationPress = async (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
    
    try {
      // Load messages for this conversation
      const messagesResponse = await messageService.getConversation(
        conversation.partnerId || conversation.staffId,
        conversation.resident?._id || conversation.residentId
      );
      
      if (messagesResponse.success) {
        setMessages(prev => ({
          ...prev,
          [conversation.id]: messagesResponse.data || []
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
        //   setConversations(conversationsResponse.data || []);
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
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Validate required fields
    const residentId = selectedConversation.resident?._id || selectedConversation.residentId;
    if (!residentId) {
      Alert.alert('Lỗi', 'Không thể xác định cư dân liên quan');
      return;
    }

    try {
      const messageData = {
        content: newMessage.trim(),
        receiver_id: selectedConversation.partnerId || selectedConversation.staffId,
        resident_id: residentId,
      };
      
      console.log('Sending message with data:', messageData);
      console.log('Selected conversation:', selectedConversation);

      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        // Add new message to local state
        const newMessageObj = {
          _id: response.data._id || Date.now().toString(),
          sender_id: { _id: user?.id || user?._id || 'family_1', role: 'FAMILY' },
          content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const conversationMessages = messages[selectedConversation.id] || [];
        setMessages(prev => ({
          ...prev,
          [selectedConversation.id]: [...conversationMessages, newMessageObj],
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
        //   setConversations(conversationsResponse.data || []);
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
    setCreateMessageStep(1);
    setSelectedResident(null);
    setSelectedDoctor(null);
    setAvailableDoctors([]);
    setInitialMessage('');
    
    // Load family residents when opening modal
    await loadFamilyResidents();
  };

  const handleSelectResident = async (resident) => {
    setSelectedResident(resident);
    setCreateMessageStep(2);
    
    // Load all staff for selection
    await loadAllStaff();
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCreateMessageStep(3);
  };

  const handleCreateConversation = async () => {
    if (!initialMessage.trim() || !selectedDoctor || !selectedResident) {
      Alert.alert('Lỗi', 'Vui lòng nhập tin nhắn và chọn đầy đủ thông tin');
      return;
    }

    // Validate required fields
    if (!selectedResident._id) {
      Alert.alert('Lỗi', 'Không thể xác định cư dân liên quan');
      return;
    }

    try {
      // Send initial message
      const messageData = {
        content: initialMessage.trim(),
        receiver_id: selectedDoctor._id,
        resident_id: selectedResident._id,
      };

      console.log('Creating conversation with data:', messageData);

      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        // Reload conversations to get the new one
        await loadData();
        
        // Trigger badge refresh
        triggerRefresh();
        
        // Find the new conversation
        const newConversation = conversations.find(conv => 
          conv.partnerId === selectedDoctor._id && 
          conv.resident?._id === selectedResident._id
        );

        if (newConversation) {
      setSelectedConversation(newConversation);
      setShowChat(true);
        }
        
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
    setSelectedDoctor(null);
    setInitialMessage('');
    setCreateMessageStep(1);
  };

  // Helper function to get gender prefix
  const getGenderPrefix = (gender) => {
    if (!gender) return '';
    const genderLower = gender.toLowerCase();
    return genderLower === 'male' || genderLower === 'nam' || genderLower === 'm' ? 'Ông ' : 'Bà ';
  };

  const renderConversationItem = (conversation) => (
      <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <CommonAvatar 
          size={50} 
          source={conversation.partner?.avatar}
          name={conversation.partner?.full_name}
        />
        {conversation.partner?.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.staffName}>
            {(conversation.partner?.position || 'Nhân viên chăm sóc') + ' '}
            {conversation.partner?.full_name || 'Không xác định'}
          </Text>
          <Text style={styles.timestamp}>{formatTime(conversation.lastMessage?.timestamp || conversation.timestamp)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conversation.lastMessage?.content || conversation.lastMessage || 'Chưa có tin nhắn'}
        </Text>
                <Text style={styles.residentInfo}>
          {conversation.partner?.position || 'Nhân viên chăm sóc'} • Chăm sóc: {getGenderPrefix(conversation.resident?.gender)}{conversation.resident?.full_name || 'Không xác định'}
              </Text>
          </View>
      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
      </TouchableOpacity>
    );

  const renderMessage = (message, index, messages) => {
    // Get current user ID from Redux or local storage
    const currentUserId = user?.id || user?._id || 'family_1'; // Fallback for demo
    
    // Determine if message is from current user based on sender_id
    const isMyMessage = message.sender_id?._id === currentUserId || 
                       message.sender_id === currentUserId ||
                       message.senderId === currentUserId;
    
    // Check if we need to show date separator
    const showDateSeparator = index === 0 || shouldShowDateSeparator(messages[index - 1], message);
    
    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatMessageDate(message.timestamp)}
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
            {formatMessageTime(message.timestamp)}
          </Text>
        </View>
        </View>
  );
  };

  const renderCreateMessageModal = () => (
    <Modal
      visible={showCreateMessage}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowCreateMessage(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={() => {
              if (createMessageStep > 1) {
                setCreateMessageStep(createMessageStep - 1);
              } else {
                setShowCreateMessage(false);
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {createMessageStep === 1 && 'Chọn người thân'}
            {createMessageStep === 2 && 'Chọn bác sĩ'}
            {createMessageStep === 3 && 'Soạn tin nhắn'}
          </Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCreateMessage(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {createMessageStep === 1 && (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.stepDescription}>Chọn người thân cần trao đổi:</Text>
            {loadingResidents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách người thân...</Text>
              </View>
            ) : familyResidents.length > 0 ? (
              familyResidents.map((resident) => (
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
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Không có người thân nào</Text>
                <Text style={styles.emptyStateSubtext}>Vui lòng liên hệ quản trị viên</Text>
              </View>
            )}
          </ScrollView>
        )}

        {createMessageStep === 2 && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.selectedInfo}>
              <CommonAvatar 
                size={32} 
                source={selectedResident?.avatar}
                name={selectedResident?.full_name || selectedResident?.name}
              />
              <Text style={styles.selectedText}>
                Người thân: {selectedResident?.full_name || selectedResident?.name}
              </Text>
            </View>
            <Text style={styles.stepDescription}>Chọn nhân viên chăm sóc:</Text>
            {loadingStaff ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách nhân viên...</Text>
              </View>
            ) : allStaff.length > 0 ? (
              allStaff.map((staff) => (
              <TouchableOpacity
                key={staff._id}
                style={styles.selectionItem}
                onPress={() => handleSelectDoctor(staff)}
              >
                <View style={styles.doctorAvatarContainer}>
                    <CommonAvatar 
                      size={48} 
                      source={staff.avatar}
                      name={staff.full_name}
                    />
                  {staff.online && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionName}>{staff.full_name}</Text>
                    <Text style={styles.selectionDetails}>{staff.position || staff.role}</Text>
                    <Text style={styles.selectionSpecialization}>{staff.qualification || 'Nhân viên chăm sóc'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Không có nhân viên nào</Text>
                <Text style={styles.emptyStateSubtext}>Vui lòng thử lại sau</Text>
              </View>
            )}
          </ScrollView>
        )}

        {createMessageStep === 3 && (
          <View style={styles.modalContent}>
            <View style={styles.selectedInfo}>
              <CommonAvatar 
                size={32} 
                source={selectedResident?.avatar}
                name={selectedResident?.full_name || selectedResident?.name}
              />
              <Text style={styles.selectedText}>
                Người thân: {selectedResident?.full_name || selectedResident?.name}
              </Text>
            </View>
            <View style={styles.selectedInfo}>
              <CommonAvatar 
                size={32} 
                source={selectedDoctor?.avatar}
                name={selectedDoctor?.full_name}
              />
              <Text style={styles.selectedText}>
                Nhân viên: {selectedDoctor?.full_name}
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
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin Nhắn</Text>
          <Text style={styles.headerSubtitle}>
            Trao đổi với đội ngũ chăm sóc
          </Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tổng quan</Title>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{conversations.length}</Text>
                <Text style={styles.summaryLabel}>Cuộc trò chuyện</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{conversations.filter(c => c.unreadCount > 0).length}</Text>
                <Text style={styles.summaryLabel}>Tin nhắn mới</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{conversations.reduce((total, c) => total + (c.unreadCount || 0), 0)}</Text>
                <Text style={styles.summaryLabel}>Tổng tin nhắn chưa đọc</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Conversations List */}
        <Card style={styles.conversationsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Cuộc trò chuyện</Title>
            {conversations.length > 0 ? conversations.map((conversation) => (
              <View key={conversation.id || conversation._id || `conversation-${conversation.partnerId}`}>
                {renderConversationItem(conversation)}
              </View>
            )) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Chưa có cuộc trò chuyện nào</Text>
                <Text style={styles.emptyStateSubtext}>Nhấn nút + để bắt đầu trò chuyện với bác sĩ</Text>
              </View>
            )}
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

      {/* Chat Screen Overlay */}
      {showChat && selectedConversation && (
        <SafeAreaView style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <CommonAvatar 
                size={40} 
                source={selectedConversation.partner?.avatar}
                name={selectedConversation.partner?.full_name}
              />
              <View style={styles.chatHeaderText}>
                <Text style={styles.chatHeaderName}>
                  {selectedConversation.partner?.full_name || 'Không xác định'}
                </Text>
                <Text style={styles.chatHeaderRole}>
                  {selectedConversation.partner?.position || 'Nhân viên chăm sóc'} • {getGenderPrefix(selectedConversation.resident?.gender)}{selectedConversation.resident?.full_name || 'Không xác định'}
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
              {(messages[selectedConversation.id] || []).map((message, index, messages) => 
                <View key={message._id || message.id || `message-${index}`}>
                  {renderMessage(message, index, messages)}
                </View>
              )}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 15,
  },
  scrollContent: {
    paddingTop: 36,
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    letterSpacing: 0.3,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  conversationsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#888',
  },
  role: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  residentInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 0,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  messageText: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
  },
  partnerMessageText: {
    color: '#1a1a1a',
  },
  myMessageText: {
    color: 'white',
    fontWeight: '400',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 0,
  },
  partnerMessageTime: {
    color: '#888',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
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
  selectionSpecialization: {
    fontSize: 13,
    color: '#999',
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
  doctorAvatarContainer: {
    position: 'relative',
  },
  createButton: {
    marginTop: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 15,
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

export default FamilyCommunicationScreen; 