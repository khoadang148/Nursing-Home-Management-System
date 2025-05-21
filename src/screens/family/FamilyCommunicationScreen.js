import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  TextInput, 
  Button, 
  Avatar, 
  Divider,
  IconButton,
  Menu,
  Badge,
} from 'react-native-paper';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Mock conversations data - in a real app this would come from an API
const mockConversations = [
  {
    id: '1',
    participants: [
      { id: 'f1', name: 'Jane Doe', role: 'family', photo: 'https://randomuser.me/api/portraits/women/11.jpg' },
      { id: 's1', name: 'Dr. Sarah Johnson', role: 'doctor', photo: 'https://randomuser.me/api/portraits/women/21.jpg' }
    ],
    messages: [
      { 
        id: '1', 
        senderId: 's1', 
        text: 'Hello Ms. Doe, I wanted to update you on your father\'s health status following his check-up yesterday.',
        timestamp: '2023-11-10T09:30:00Z',
        read: true
      },
      { 
        id: '2', 
        senderId: 'f1', 
        text: 'Thank you, Dr. Johnson. How is he doing?', 
        timestamp: '2023-11-10T10:15:00Z',
        read: true 
      },
      { 
        id: '3', 
        senderId: 's1', 
        text: 'His blood pressure has improved and he\'s responding well to the new medication. We\'ll continue to monitor him closely.',
        timestamp: '2023-11-10T10:30:00Z',
        read: true
      },
      { 
        id: '4', 
        senderId: 'f1', 
        text: 'That\'s great news! Thank you for the update. I\'ll visit him this weekend.',
        timestamp: '2023-11-10T10:35:00Z',
        read: true
      },
    ],
    lastMessage: {
      text: 'That\'s great news! Thank you for the update. I\'ll visit him this weekend.',
      timestamp: '2023-11-10T10:35:00Z',
      senderId: 'f1'
    },
    unreadCount: 0
  },
  {
    id: '2',
    participants: [
      { id: 'f1', name: 'Jane Doe', role: 'family', photo: 'https://randomuser.me/api/portraits/women/11.jpg' },
      { id: 's2', name: 'Nurse Williams', role: 'nurse', photo: 'https://randomuser.me/api/portraits/men/22.jpg' }
    ],
    messages: [
      { 
        id: '1', 
        senderId: 's2', 
        text: 'Hello Ms. Doe, just letting you know that your father has been participating well in the group activities today.',
        timestamp: '2023-11-12T14:20:00Z',
        read: false
      },
    ],
    lastMessage: {
      text: 'Hello Ms. Doe, just letting you know that your father has been participating well in the group activities today.',
      timestamp: '2023-11-12T14:20:00Z',
      senderId: 's2'
    },
    unreadCount: 1
  },
  {
    id: '3',
    participants: [
      { id: 'f1', name: 'Jane Doe', role: 'family', photo: 'https://randomuser.me/api/portraits/women/11.jpg' },
      { id: 's3', name: 'Amy Chen', role: 'social worker', photo: 'https://randomuser.me/api/portraits/women/23.jpg' }
    ],
    messages: [
      { 
        id: '1', 
        senderId: 'f1', 
        text: 'Hi Amy, I was wondering if we could discuss some additional activities for my father? He mentioned he used to enjoy gardening.',
        timestamp: '2023-11-08T11:45:00Z',
        read: true
      },
      { 
        id: '2', 
        senderId: 's3', 
        text: 'That\'s a great idea, Jane! We actually have a gardening program on Thursdays. I can make sure he\'s included in the next session.',
        timestamp: '2023-11-08T13:15:00Z',
        read: true
      },
      {
        id: '3',
        senderId: 'f1',
        text: 'That would be wonderful, thank you!',
        timestamp: '2023-11-08T13:30:00Z',
        read: true
      },
    ],
    lastMessage: {
      text: 'That would be wonderful, thank you!',
      timestamp: '2023-11-08T13:30:00Z',
      senderId: 'f1'
    },
    unreadCount: 0
  }
];

// Mock staff data for new conversation
const mockStaff = [
  { id: 's1', name: 'Dr. Sarah Johnson', role: 'doctor', photo: 'https://randomuser.me/api/portraits/women/21.jpg' },
  { id: 's2', name: 'Nurse Williams', role: 'nurse', photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: 's3', name: 'Amy Chen', role: 'social worker', photo: 'https://randomuser.me/api/portraits/women/23.jpg' },
  { id: 's4', name: 'Michael Brown', role: 'caregiver', photo: 'https://randomuser.me/api/portraits/men/24.jpg' },
  { id: 's5', name: 'Lisa Wong', role: 'nutritionist', photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
];

const FamilyCommunicationScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewConversationMenu, setShowNewConversationMenu] = useState(false);
  const [showStaffList, setShowStaffList] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would filter conversations by the user's ID
    setConversations(mockConversations);
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If the message is from today, only show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If the message is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const handleSelectConversation = (conversation) => {
    // Mark all messages as read
    const updatedConversation = {
      ...conversation,
      messages: conversation.messages.map(msg => ({ ...msg, read: true })),
      unreadCount: 0
    };
    
    // Update conversations list
    setConversations(
      conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    
    setSelectedConversation(updatedConversation);
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    // Create new message
    const newMessage = {
      id: (selectedConversation.messages.length + 1).toString(),
      senderId: user.id,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Update selected conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: {
        text: newMessage.text,
        timestamp: newMessage.timestamp,
        senderId: newMessage.senderId
      }
    };
    
    // Update conversations list
    setConversations(
      conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    
    // Update selected conversation
    setSelectedConversation(updatedConversation);
    
    // Clear input field
    setMessageText('');
  };
  
  const startNewConversation = (staff) => {
    // Create new conversation
    const newConversation = {
      id: (conversations.length + 1).toString(),
      participants: [
        { id: user.id, name: `${user.firstName} ${user.lastName}`, role: 'family', photo: user.photo },
        { id: staff.id, name: staff.name, role: staff.role, photo: staff.photo }
      ],
      messages: [],
      lastMessage: null,
      unreadCount: 0
    };
    
    // Add to conversations list
    setConversations([...conversations, newConversation]);
    
    // Select the new conversation
    setSelectedConversation(newConversation);
    
    // Hide staff list
    setShowStaffList(false);
  };
  
  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user.id);
  };
  
  const renderConversationItem = ({ item }) => {
    const otherParticipant = getOtherParticipant(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          selectedConversation?.id === item.id && styles.selectedConversation
        ]}
        onPress={() => handleSelectConversation(item)}
      >
        <View style={styles.conversationAvatar}>
          <Avatar.Image 
            source={{ uri: otherParticipant.photo }} 
            size={50} 
          />
          {item.unreadCount > 0 && (
            <Badge
              size={20}
              style={styles.unreadBadge}
            >
              {item.unreadCount}
            </Badge>
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>{otherParticipant.name}</Text>
            {item.lastMessage && (
              <Text style={styles.messageTime}>
                {formatTimestamp(item.lastMessage.timestamp)}
              </Text>
            )}
          </View>
          <Text style={styles.participantRole}>{otherParticipant.role}</Text>
          {item.lastMessage && (
            <Text 
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.senderId === user.id ? 'You: ' : ''}
              {item.lastMessage.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === user.id;
    const messageDate = new Date(item.timestamp);
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTimestamp}>
            {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderStaffItem = ({ item }) => (
    <TouchableOpacity
      style={styles.staffItem}
      onPress={() => startNewConversation(item)}
    >
      <Avatar.Image source={{ uri: item.photo }} size={40} />
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffRole}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Conversation List */}
        <View style={styles.conversationListContainer}>
          <View style={styles.conversationListHeader}>
            <Text style={styles.screenTitle}>Messages</Text>
            <TouchableOpacity 
              onPress={() => setShowStaffList(!showStaffList)}
              style={styles.newMessageButton}
            >
              <MaterialIcons name="edit" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Staff List for New Conversation */}
          {showStaffList && (
            <Card style={styles.staffListCard}>
              <Card.Content>
                <View style={styles.staffListHeader}>
                  <Text style={styles.staffListTitle}>New Message</Text>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setShowStaffList(false)}
                  />
                </View>
                <FlatList
                  data={mockStaff}
                  renderItem={renderStaffItem}
                  keyExtractor={item => item.id}
                  style={styles.staffList}
                />
              </Card.Content>
            </Card>
          )}
          
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.conversationList}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[COLORS.primary]} 
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="forum" size={60} color={COLORS.border} />
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Button 
                  mode="contained" 
                  onPress={() => setShowStaffList(true)}
                  style={styles.startConversationButton}
                >
                  Start a conversation
                </Button>
              </View>
            }
          />
        </View>
        
        {/* Chat Area */}
        <View style={styles.chatAreaContainer}>
          {selectedConversation ? (
            <KeyboardAvoidingView 
              style={styles.chatArea}
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={80}
            >
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderInfo}>
                  <Avatar.Image 
                    source={{ uri: getOtherParticipant(selectedConversation).photo }}
                    size={40}
                  />
                  <View style={styles.chatHeaderText}>
                    <Text style={styles.chatHeaderName}>
                      {getOtherParticipant(selectedConversation).name}
                    </Text>
                    <Text style={styles.chatHeaderRole}>
                      {getOtherParticipant(selectedConversation).role}
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="information-outline"
                  size={24}
                  onPress={() => {
                    /* Show more information about the contact */
                    Alert.alert(
                      'Contact Information',
                      `Name: ${getOtherParticipant(selectedConversation).name}\nRole: ${getOtherParticipant(selectedConversation).role}`,
                      [{ text: 'OK' }]
                    );
                  }}
                />
              </View>
              
              {/* Messages List */}
              <FlatList
                data={selectedConversation.messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                inverted={selectedConversation.messages.length > 0}
                ListEmptyComponent={
                  <View style={styles.emptyMessagesContainer}>
                    <MaterialIcons name="chat" size={60} color={COLORS.border} />
                    <Text style={styles.emptyMessagesText}>
                      No messages yet. Start the conversation!
                    </Text>
                  </View>
                }
              />
              
              {/* Message Input */}
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
                <IconButton
                  icon="send"
                  size={24}
                  color={COLORS.primary}
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                />
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.noChatSelectedContainer}>
              <FontAwesome name="comments" size={80} color={COLORS.border} />
              <Text style={styles.noChatSelectedText}>
                Select a conversation or start a new one
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowStaffList(true)}
                style={{ marginTop: 16 }}
              >
                New Message
              </Button>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationListContainer: {
    width: '38%',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  conversationListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  newMessageButton: {
    padding: 8,
  },
  conversationList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedConversation: {
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  conversationAvatar: {
    marginRight: 12,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: COLORS.primary,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    ...FONTS.body2,
    fontWeight: '500',
    color: COLORS.text,
  },
  messageTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  participantRole: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginBottom: 4,
  },
  lastMessage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  unreadMessage: {
    fontWeight: '500',
    color: COLORS.text,
  },
  chatAreaContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderText: {
    marginLeft: 12,
  },
  chatHeaderName: {
    ...FONTS.body2,
    fontWeight: '500',
  },
  chatHeaderRole: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
  },
  currentUserBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    ...FONTS.body2,
    color: COLORS.surface,
    marginBottom: 4,
  },
  messageTimestamp: {
    ...FONTS.body3,
    color: COLORS.surface + 'CC',
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: COLORS.surface,
  },
  sendButton: {
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  noChatSelectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  noChatSelectedText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  startConversationButton: {
    marginTop: 16,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMessagesText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  staffListCard: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 4,
  },
  staffListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  staffListTitle: {
    ...FONTS.h4,
  },
  staffList: {
    maxHeight: 300,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  staffInfo: {
    marginLeft: 12,
  },
  staffName: {
    ...FONTS.body2,
    fontWeight: '500',
  },
  staffRole: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
});

export default FamilyCommunicationScreen; 