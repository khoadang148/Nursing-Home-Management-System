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
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

// Mock data cho tin nhắn
const mockConversations = [
  {
    id: '1',
    staffName: 'Bác sĩ Nguyễn Thị Lan',
    role: 'Bác sĩ',
    lastMessage: 'Tình trạng sức khỏe của bà ổn định. Huyết áp đã được kiểm soát tốt.',
    timestamp: '2024-01-15T10:30:00.000Z',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    online: true,
  },
  {
    id: '2',
    staffName: 'Y tá Trần Văn Minh',
    role: 'Y tá',
    lastMessage: 'Bà đã ăn đầy đủ bữa sáng và tham gia hoạt động thể dục nhẹ.',
    timestamp: '2024-01-15T08:45:00.000Z',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    online: false,
  },
  {
    id: '3',
    staffName: 'Điều dưỡng Lê Thị Hoa',
    role: 'Điều dưỡng viên',
    lastMessage: 'Cảm ơn gia đình đã quan tâm. Tôi sẽ cập nhật thường xuyên.',
    timestamp: '2024-01-14T16:20:00.000Z',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    online: true,
  },
];

const mockMessages = {
  '1': [
      { 
        id: '1', 
      senderId: 'staff_1',
      senderName: 'Bác sĩ Nguyễn Thị Lan',
      message: 'Chào anh/chị. Tôi là bác sĩ Lan, đang chăm sóc cho bà.',
      timestamp: '2024-01-15T09:00:00.000Z',
      isStaff: true,
      },
      { 
        id: '2', 
      senderId: 'family_1',
      senderName: 'Gia đình',
      message: 'Chào bác sĩ! Tình trạng sức khỏe của mẹ tôi thế nào ạ?',
      timestamp: '2024-01-15T09:15:00.000Z',
      isStaff: false,
      },
      {
        id: '3',
      senderId: 'staff_1',
      senderName: 'Bác sĩ Nguyễn Thị Lan',
      message: 'Tình trạng sức khỏe của bà ổn định. Huyết áp đã được kiểm soát tốt. Bà cũng có tinh thần vui vẻ và ăn uống đều đặn.',
      timestamp: '2024-01-15T10:30:00.000Z',
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
      senderName: 'Gia đình',
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

  const handleQuickAction = (type) => {
    // Find conversation by staff type
    let targetConversation = null;
    
    switch (type) {
      case 'doctor':
        targetConversation = conversations.find(conv => 
          conv.role.toLowerCase().includes('bác sĩ') || conv.role.toLowerCase().includes('doctor')
        );
        break;
      case 'nurse':
        targetConversation = conversations.find(conv => 
          conv.role.toLowerCase().includes('y tá') || conv.role.toLowerCase().includes('nurse')
        );
        break;
      case 'support':
        targetConversation = conversations.find(conv => 
          conv.role.toLowerCase().includes('điều dưỡng') || conv.role.toLowerCase().includes('hỗ trợ')
        );
        break;
    }

    if (targetConversation) {
      handleConversationPress(targetConversation);
    } else {
      // Create new conversation if not exists
      Alert.alert(
        'Tạo cuộc hội thoại mới',
        `Bạn có muốn bắt đầu cuộc hội thoại với ${getStaffTypeName(type)}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Bắt đầu', 
            onPress: () => {
              const newConversation = createNewConversation(type);
              const updatedConversations = [...conversations, newConversation];
              setConversations(updatedConversations);
              
              // Initialize empty messages array for new conversation
              setMessages(prev => ({
                ...prev,
                [newConversation.id]: []
              }));
              
              handleConversationPress(newConversation);
              
              // Show success message
              setTimeout(() => {
                Alert.alert(
                  'Thành công',
                  `Đã tạo cuộc hội thoại với ${newConversation.staffName}. Bạn có thể bắt đầu nhắn tin ngay!`,
                  [{ text: 'OK' }]
                );
              }, 500);
            }
          }
        ]
      );
    }
  };

  const getStaffTypeName = (type) => {
    switch (type) {
      case 'doctor': return 'Bác sĩ';
      case 'nurse': return 'Y tá';
      case 'support': return 'Nhân viên hỗ trợ';
      default: return 'Nhân viên';
    }
  };

  const createNewConversation = (type) => {
    const staffData = {
      doctor: {
        staffName: 'Bác sĩ Nguyễn Văn An',
        role: 'Bác sĩ',
        avatar: 'https://randomuser.me/api/portraits/men/50.jpg',
      },
      nurse: {
        staffName: 'Y tá Lê Thị Mai',
        role: 'Y tá',
        avatar: 'https://randomuser.me/api/portraits/women/60.jpg',
      },
      support: {
        staffName: 'Nhân viên Hỗ trợ',
        role: 'Hỗ trợ khách hàng',
        avatar: 'https://randomuser.me/api/portraits/women/70.jpg',
      },
    };

    const staff = staffData[type];
    const newId = (conversations.length + 1).toString();

    return {
      id: newId,
      staffName: staff.staffName,
      role: staff.role,
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unread: 0,
      avatar: staff.avatar,
      online: true,
    };
  };

  const renderConversationItem = (conversation) => (
      <TouchableOpacity
      key={conversation.id}
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
    >
      <View style={styles.avatarContainer}>
        <Avatar.Image source={{ uri: conversation.avatar }} size={50} />
        {conversation.online && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.staffName}>{conversation.staffName}</Text>
          <Text style={styles.timestamp}>{formatTime(conversation.timestamp)}</Text>
        </View>
        
        <Text style={styles.role}>{conversation.role}</Text>
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
      <Text style={[
        styles.messageText,
        message.isStaff ? styles.staffMessageText : styles.familyMessageText,
      ]}>
        {message.message}
      </Text>
      <Text style={[
        styles.messageTime,
        message.isStaff ? styles.staffMessageTime : styles.familyMessageTime,
      ]}>
        {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
          </Text>
        </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </SafeAreaView>
    );
  }

  if (showChat && selectedConversation) {
    const conversationMessages = messages[selectedConversation.id] || [];
  
  return (
    <SafeAreaView style={styles.container}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => setShowChat(false)}
          />
          <View style={styles.chatHeaderInfo}>
            <Avatar.Image source={{ uri: selectedConversation.avatar }} size={40} />
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatHeaderName}>{selectedConversation.staffName}</Text>
              <Text style={styles.chatHeaderRole}>{selectedConversation.role}</Text>
            </View>
          </View>
          <IconButton icon="phone" size={24} onPress={() => {}} />
        </View>

        {/* Messages */}
          <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {conversationMessages.map(renderMessage)}
          </ScrollView>
            
            {/* Message Input */}
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
                placeholder="Nhập tin nhắn..."
                multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
                onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <MaterialIcons name="send" size={24} color={COLORS.surface} />
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

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Liên hệ nhanh</Title>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('doctor')}>
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <MaterialIcons name="local-hospital" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.quickActionText}>Bác sĩ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('nurse')}>
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.accent + '20' }]}>
                  <FontAwesome5 name="user-nurse" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.quickActionText}>Y tá</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('support')}>
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                  <MaterialIcons name="support-agent" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.quickActionText}>Hỗ trợ</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Conversations List */}
        <Card style={styles.conversationsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Cuộc trò chuyện</Title>
            {conversations.map(renderConversationItem)}
          </Card.Content>
        </Card>
      </ScrollView>
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
    paddingBottom: 80,
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
  quickActionsCard: {
    marginBottom: 20,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  quickAction: {
    alignItems: 'center',
    padding: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
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
});

export default FamilyCommunicationScreen; 