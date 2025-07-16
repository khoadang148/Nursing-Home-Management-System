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

// Import residents data from centralized mockData
import { residents } from '../../api/mockData';

// Mock data cho residents của family member hiện tại (Trần Lê Chi Bảo)
const familyResidents = residents.map(resident => ({
  _id: resident._id,
  name: resident.full_name,
  room: `${resident.room_number}-${resident.bed_number}`,
  avatar: resident.avatar,
}));

// Import staff data from centralized mockData
import { staff } from '../../api/mockData';

// Create staff lookup object for easy access with online status
const mockStaffData = staff.reduce((acc, staffMember) => {
  acc[staffMember._id] = {
    ...staffMember,
    online: Math.random() > 0.3 // Random online status for demo
  };
  return acc;
}, {});

// Mapping staff đã chăm sóc từng resident (sử dụng ID từ database schema)
const residentStaffMapping = {
  'res_001': ['staff_001', 'staff_002', 'staff_003'], // Nguyễn Văn Nam được chăm sóc bởi cả 3 staff
  'res_002': ['staff_001', 'staff_002', 'staff_003'], // Lê Thị Hoa được chăm sóc bởi cả 3 staff  
  'res_003': ['staff_001', 'staff_003'], // Trần Văn Bình được chăm sóc bởi staff_001 và staff_003
};

// Mock data cho tin nhắn theo resident và staff (sử dụng ID từ database schema)
const mockConversations = [
  {
    id: '1',
    staffId: 'staff_002',
    staffName: 'Phạm Thị Doctor',
    role: 'Bác sĩ',
    position: 'Bác sĩ',
    residentId: 'res_001',
    residentName: 'Nguyễn Văn Nam',
    lastMessage: 'Tình trạng sức khỏe của cụ ổn định. Tiểu đường được kiểm soát tốt.',
    timestamp: '2024-03-01T10:30:00.000Z',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    online: true,
  },
  {
    id: '2',
    staffId: 'staff_001',
    staffName: 'Lê Văn Nurse',
    role: 'Điều dưỡng',
    position: 'Điều dưỡng',
    residentId: 'res_001',
    residentName: 'Nguyễn Văn Nam',
    lastMessage: 'Cụ đã ăn đầy đủ bữa sáng và tham gia hoạt động thể dục nhẹ.',
    timestamp: '2024-03-01T08:45:00.000Z',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    online: true,
  },
  {
    id: '3',
    staffId: 'staff_001',
    staffName: 'Lê Văn Nurse',
    role: 'Điều dưỡng',
    position: 'Điều dưỡng',
    residentId: 'res_002',
    residentName: 'Lê Thị Hoa',
    lastMessage: 'Vết thương đang lành tốt, không có dấu hiệu nhiễm trùng.',
    timestamp: '2024-02-29T16:20:00.000Z',
    unread: 1,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    online: true,
  },
  {
    id: '4',
    staffId: 'staff_003',
    staffName: 'Hoàng Văn Caregiver',
    role: 'Nhân viên chăm sóc',
    position: 'Nhân viên chăm sóc',
    residentId: 'res_003',
    residentName: 'Trần Văn Bình',
    lastMessage: 'Cụ tham gia vật lý trị liệu rất tích cực, khả năng vận động cải thiện.',
    timestamp: '2024-03-01T14:15:00.000Z',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    online: false,
  },
];

const mockMessages = {
  '1': [
      { 
        id: '1', 
      senderId: 'staff_002',
      senderName: 'Phạm Thị Doctor',
      message: 'Chào anh/chị. Tôi là bác sĩ Phạm Thị Doctor, đang chăm sóc cho cụ Nguyễn Văn Nam.',
      timestamp: '2024-03-01T09:00:00.000Z',
      isStaff: true,
      },
      { 
        id: '2', 
      senderId: 'family_1',
      senderName: 'Trần Lê Chi Bảo',
      message: 'Chào bác sĩ! Tình trạng sức khỏe của bố tôi thế nào ạ?',
      timestamp: '2024-03-01T09:15:00.000Z',
      isStaff: false,
      },
      {
        id: '3',
      senderId: 'staff_002',
      senderName: 'Phạm Thị Doctor',
      message: 'Tình trạng sức khỏe của cụ ổn định. Tiểu đường được kiểm soát tốt. Cụ cũng có tinh thần vui vẻ và ăn uống đều đặn.',
      timestamp: '2024-03-01T10:30:00.000Z',
      isStaff: true,
    },
  ],
  '2': [
    {
      id: '4',
      senderId: 'staff_001',
      senderName: 'Lê Văn Nurse',
      message: 'Xin chào! Cụ Nam hôm nay ăn uống và sinh hoạt bình thường.',
      timestamp: '2024-03-01T08:00:00.000Z',
      isStaff: true,
    },
    {
      id: '5',
      senderId: 'family_1',
      senderName: 'Trần Lê Chi Bảo',
      message: 'Cảm ơn chị đã chăm sóc bố tôi chu đáo!',
      timestamp: '2024-03-01T08:30:00.000Z',
      isStaff: false,
    },
    {
      id: '6',
      senderId: 'staff_001',
      senderName: 'Lê Văn Nurse',
      message: 'Cụ đã ăn đầy đủ bữa sáng và tham gia hoạt động thể dục nhẹ.',
      timestamp: '2024-03-01T08:45:00.000Z',
      isStaff: true,
    },
  ],
  '3': [
    {
      id: '7',
      senderId: 'staff_001',
      senderName: 'Lê Văn Nurse',
      message: 'Chào anh/chị. Tình trạng vết thương của cụ Hoa đang tiến triển tốt.',
      timestamp: '2024-02-29T15:00:00.000Z',
      isStaff: true,
    },
    {
      id: '8',
      senderId: 'family_1',
      senderName: 'Trần Lê Chi Bảo',
      message: 'Cảm ơn chị! Khi nào thì vết thương sẽ lành hoàn toàn ạ?',
      timestamp: '2024-02-29T15:30:00.000Z',
      isStaff: false,
    },
    {
      id: '9',
      senderId: 'staff_001',
      senderName: 'Lê Văn Nurse',
      message: 'Vết thương đang lành tốt, không có dấu hiệu nhiễm trùng. Dự kiến khoảng 1-2 tuần nữa sẽ lành hoàn toàn.',
      timestamp: '2024-02-29T16:20:00.000Z',
      isStaff: true,
    },
  ],
  '4': [
    {
      id: '10',
      senderId: 'staff_003',
      senderName: 'Hoàng Văn Caregiver',
      message: 'Xin chào! Cụ Bình hôm nay tham gia vật lý trị liệu rất tích cực.',
      timestamp: '2024-03-01T14:00:00.000Z',
      isStaff: true,
    },
    {
      id: '11',
      senderId: 'staff_003',
      senderName: 'Hoàng Văn Caregiver',
      message: 'Cụ tham gia vật lý trị liệu rất tích cực, khả năng vận động cải thiện.',
      timestamp: '2024-03-01T14:15:00.000Z',
      isStaff: true,
    },
  ],
};

const FamilyCommunicationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // New message creation states
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [createMessageStep, setCreateMessageStep] = useState(1); // 1: resident, 2: doctor, 3: message
  const [initialMessage, setInitialMessage] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
    setConversations(mockConversations);
      setMessages(mockMessages);
    setLoading(false);
    }, 1000);
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

  const handleConversationPress = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
    
    // Mark conversation as read
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    );
    setConversations(updatedConversations);
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'family_1',
      senderName: 'Trần Lê Chi Bảo',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isStaff: false,
    };

    const conversationMessages = messages[selectedConversation.id] || [];
    setMessages({
      ...messages,
      [selectedConversation.id]: [...conversationMessages, message],
    });

    // Update last message in conversation
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage.trim(), timestamp: new Date().toISOString() }
        : conv
    );
    setConversations(updatedConversations);

    setNewMessage('');
  };

  // New message creation functions
  const handleCreateNewMessage = () => {
    setShowCreateMessage(true);
    setCreateMessageStep(1);
    setSelectedResident(null);
    setSelectedDoctor(null);
    setAvailableDoctors([]);
    setInitialMessage('');
  };

  const handleSelectResident = (resident) => {
    setSelectedResident(resident);
    // Lấy danh sách staff đã chăm sóc resident này
    const staffIds = residentStaffMapping[resident._id] || [];
    const availableStaff = staffIds.map(staffId => mockStaffData[staffId]).filter(Boolean);
    setAvailableDoctors(availableStaff);
    setCreateMessageStep(2);
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCreateMessageStep(3);
  };

  const handleCreateConversation = () => {
    if (!initialMessage.trim() || !selectedDoctor || !selectedResident) {
      Alert.alert('Lỗi', 'Vui lòng nhập tin nhắn');
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.staffId === selectedDoctor._id && 
              conv.residentId === selectedResident._id
    );

    if (existingConversation) {
      // Add message to existing conversation
      const newMessage = {
        id: Date.now().toString(),
        senderId: 'family_1',
        senderName: 'Trần Lê Chi Bảo',
        message: initialMessage.trim(),
        timestamp: new Date().toISOString(),
        isStaff: false,
      };

              setMessages(prev => ({
                ...prev,
        [existingConversation.id]: [...(prev[existingConversation.id] || []), newMessage]
      }));
              
      // Update last message in conversation
      setConversations(prev => prev.map(conv => 
        conv.id === existingConversation.id 
          ? { ...conv, lastMessage: initialMessage.trim(), timestamp: new Date().toISOString() }
          : conv
      ));

      setSelectedConversation(existingConversation);
      setShowChat(true);
    } else {
      // Create new conversation
      const newConversation = {
        id: Date.now().toString(),
        staffId: selectedDoctor._id,
        staffName: selectedDoctor.full_name,
        role: selectedDoctor.position,
        position: selectedDoctor.position,
        residentId: selectedResident._id,
        residentName: selectedResident.name,
        lastMessage: initialMessage.trim(),
        timestamp: new Date().toISOString(),
        unread: 0,
        avatar: selectedDoctor.avatar,
        online: selectedDoctor.online,
    };

      const newMessage = {
        id: Date.now().toString(),
        senderId: 'family_1',
        senderName: 'Trần Lê Chi Bảo',
        message: initialMessage.trim(),
      timestamp: new Date().toISOString(),
        isStaff: false,
      };

      setConversations(prev => [newConversation, ...prev]);
      setMessages(prev => ({
        ...prev,
        [newConversation.id]: [newMessage]
      }));

      setSelectedConversation(newConversation);
      setShowChat(true);
    }

    // Reset form
    setShowCreateMessage(false);
    setSelectedResident(null);
    setSelectedDoctor(null);
    setInitialMessage('');
    setCreateMessageStep(1);
  };

  const renderConversationItem = (conversation) => (
      <TouchableOpacity
      key={conversation.id}
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar.Image size={48} source={{ uri: conversation.avatar }} />
        {conversation.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.staffName}>{conversation.staffName}</Text>
          <Text style={styles.timestamp}>{formatTime(conversation.timestamp)}</Text>
        </View>
        <Text style={styles.role}>{conversation.role}</Text>
        <Text style={styles.residentInfo}>Chăm sóc: {conversation.residentName}</Text>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {conversation.lastMessage}
              </Text>
          </View>
      {conversation.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unread}</Text>
        </View>
      )}
      </TouchableOpacity>
    );

  const renderMessage = (message) => (
      <View
      key={message.id}
        style={[
          styles.messageContainer,
        message.isStaff ? styles.staffMessage : styles.familyMessage,
      ]}
    >
      <Text
        style={[
        styles.messageText,
        message.isStaff ? styles.staffMessageText : styles.familyMessageText,
        ]}
      >
        {message.message}
      </Text>
      <Text
        style={[
        styles.messageTime,
        message.isStaff ? styles.staffMessageTime : styles.familyMessageTime,
        ]}
      >
        {formatTime(message.timestamp)}
          </Text>
        </View>
  );

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
            {familyResidents.map((resident) => (
              <TouchableOpacity
                key={resident._id}
                style={styles.selectionItem}
                onPress={() => handleSelectResident(resident)}
              >
                <Avatar.Image size={48} source={{ uri: resident.avatar }} />
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionName}>{resident.name}</Text>
                  <Text style={styles.selectionDetails}>Phòng: {resident.room}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {createMessageStep === 2 && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.selectedInfo}>
              <Avatar.Image size={32} source={{ uri: selectedResident?.avatar }} />
              <Text style={styles.selectedText}>Người thân: {selectedResident?.name}</Text>
            </View>
            <Text style={styles.stepDescription}>Chọn bác sĩ chăm sóc:</Text>
            {availableDoctors.map((staff) => (
              <TouchableOpacity
                key={staff._id}
                style={styles.selectionItem}
                onPress={() => handleSelectDoctor(staff)}
              >
                <View style={styles.doctorAvatarContainer}>
                  <Avatar.Image size={48} source={{ uri: staff.avatar }} />
                  {staff.online && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionName}>{staff.full_name}</Text>
                  <Text style={styles.selectionDetails}>{staff.position}</Text>
                  <Text style={styles.selectionSpecialization}>{staff.qualification}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {createMessageStep === 3 && (
          <View style={styles.modalContent}>
            <View style={styles.selectedInfo}>
              <Avatar.Image size={32} source={{ uri: selectedResident?.avatar }} />
              <Text style={styles.selectedText}>Người thân: {selectedResident?.name}</Text>
            </View>
            <View style={styles.selectedInfo}>
              <Avatar.Image size={32} source={{ uri: selectedDoctor?.avatar }} />
              <Text style={styles.selectedText}>Bác sĩ: {selectedDoctor?.full_name}</Text>
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

  if (showChat && selectedConversation) {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Avatar.Image size={40} source={{ uri: selectedConversation.avatar }} />
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatHeaderName}>{selectedConversation.staffName}</Text>
              <Text style={styles.chatHeaderRole}>
                {selectedConversation.role} • {selectedConversation.residentName}
              </Text>
            </View>
          </View>
        </View>

          <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            ref={(ref) => {
              this.scrollView = ref;
            }}
            onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
          >
            {(messages[selectedConversation.id] || []).map(renderMessage)}
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

        {/* Conversations List */}
        <Card style={styles.conversationsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Cuộc trò chuyện</Title>
            {conversations.length > 0 ? conversations.map(renderConversationItem) : (
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
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
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  staffMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  familyMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 20,
  },
  staffMessageText: {
    color: '#1a1a1a',
  },
  familyMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  staffMessageTime: {
    color: '#888',
  },
  familyMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
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
});

export default FamilyCommunicationScreen; 