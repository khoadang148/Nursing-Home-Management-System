import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../constants/theme';
import { markAsRead } from '../../redux/slices/notificationSlice';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  
  const notification = useSelector((state) =>
    state.notifications.notifications.find((n) => n.id === id)
  );
  
  const isLoading = useSelector((state) => state.notifications.isLoading);
  
  useEffect(() => {
    if (notification && !notification.isRead) {
      dispatch(markAsRead(id));
    }
  }, [dispatch, notification, id]);

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
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notification Details" />
      </Appbar.Header>

      {isLoading && (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
      )}

      {notification && !isLoading && (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerContainer}>
                <MaterialIcons
                  name={getIconName(notification.type)}
                  size={32}
                  color={getIconColor(notification.type)}
                  style={styles.icon}
                />
                <Text style={styles.title}>{notification.title}</Text>
              </View>
              
              <Text style={styles.timestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.message}>{notification.message}</Text>
              
              {notification.details && (
                <Text style={styles.details}>{notification.details}</Text>
              )}
              
              {notification.actionRequired && (
                <View style={styles.actionContainer}>
                  <Text style={styles.actionLabel}>Action Required:</Text>
                  <Text style={styles.actionText}>{notification.actionRequired}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
          
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            Back to Notifications
          </Button>
        </ScrollView>
      )}
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
  },
  loader: {
    flex: 1,
    alignSelf: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  details: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  actionContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
});

export default NotificationDetailScreen; 