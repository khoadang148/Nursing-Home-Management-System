import { useState, useEffect } from 'react';
import messageService from '../api/services/messageService';
import { useMessageContext } from '../contexts/MessageContext';

const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { refreshTrigger } = useMessageContext();

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await messageService.getUserConversations();
      if (response.success) {
        const totalUnread = response.data.reduce((total, conversation) => {
          return total + (conversation.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      } else {
        console.error('Failed to fetch unread count:', response.error);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [refreshTrigger]);

  useEffect(() => {
    // Temporarily disabled automatic refresh due to API errors
    // const interval = setInterval(fetchUnreadCount, 30000);
    
    // return () => clearInterval(interval);
  }, []);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};

export default useUnreadMessages;
