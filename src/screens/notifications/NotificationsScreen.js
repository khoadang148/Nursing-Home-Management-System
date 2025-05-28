import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Text, Card, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { fetchNotifications, markAsRead, deleteNotification } from '../../redux/slices/notificationSlice';

const NotificationItem = ({ item, onRead, onDelete }) => {
  const getIconName = (type) => {
    switch (type) {
      case 'urgent':
        return 'priority-high';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'urgent':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
      default:
        return COLORS.info;
    }
  };

  return (
    <Card 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => onRead(item.id)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getIconName(item.type)}
            size={24}
            color={getIconColor(item.type)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        <IconButton
          icon="trash-can-outline"
          size={20}
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { notifications, isLoading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
    navigation.navigate('NotificationDetail', { id });
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Thông Báo" />
      </Appbar.Header>

      {isLoading && <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )}

      {!isLoading && notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-off" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Không có thông báo</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Divider />}
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
    backgroundColor: COLORS.surface,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  notificationCard: {
    marginVertical: 8,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  deleteButton: {
    margin: 0,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default NotificationsScreen; 