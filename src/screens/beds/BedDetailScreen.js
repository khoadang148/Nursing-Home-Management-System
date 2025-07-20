import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotification } from '../../components/NotificationSystem';
import { getBedById, deleteBed, clearBedState } from '../../redux/slices/bedSlice';

const BedDetailScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { bedId } = route.params;
  const { showSuccess, showError, showWarning, confirmAction } = useNotification();
  
  const { currentBed, isLoading, error, message } = useSelector((state) => state.beds);

  // Load bed details on mount
  useEffect(() => {
    if (bedId) {
      loadBedDetails();
    }
  }, [bedId]);

  // Handle messages
  useEffect(() => {
    if (message) {
      showSuccess(message);
      dispatch(clearBedState());
      if (message.includes('Xóa')) {
        navigation.goBack();
      }
    }
  }, [message, showSuccess, dispatch, navigation]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearBedState());
    }
  }, [error, showError, dispatch]);

  const loadBedDetails = async () => {
    try {
      await dispatch(getBedById(bedId)).unwrap();
    } catch (error) {
      console.log('Load bed details error:', error);
    }
  };

  const handleDeleteBed = async () => {
    const confirmed = await confirmAction(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa giường ${currentBed?.bed_number}?`,
      'Xóa',
      'Hủy'
    );

    if (confirmed) {
      try {
        await dispatch(deleteBed(bedId)).unwrap();
      } catch (error) {
        console.log('Delete bed error:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'occupied':
        return '#F44336';
      case 'maintenance':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Đã sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getBedTypeText = (bedType) => {
    switch (bedType) {
      case 'standard':
        return 'Tiêu chuẩn';
      case 'premium':
        return 'Cao cấp';
      case 'vip':
        return 'VIP';
      default:
        return bedType;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải thông tin giường...</Text>
      </View>
    );
  }

  if (!currentBed) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={64} color="#F44336" />
        <Text style={styles.errorText}>Không tìm thấy thông tin giường</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.bedInfo}>
              <Text style={styles.bedNumber}>{currentBed.bed_number}</Text>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(currentBed.status) }}
                style={[styles.statusChip, { borderColor: getStatusColor(currentBed.status) }]}
              >
                {getStatusText(currentBed.status)}
              </Chip>
            </View>
            <MaterialCommunityIcons 
              name="bed" 
              size={48} 
              color={getStatusColor(currentBed.status)} 
            />
          </View>
        </Card.Content>
      </Card>

      {/* Details Card */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="bed" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Loại giường</Text>
              <Text style={styles.detailValue}>
                {getBedTypeText(currentBed.bed_type)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <MaterialIcons name="room" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ID Phòng</Text>
              <Text style={styles.detailValue}>{currentBed.room_id}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày tạo</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentBed.created_at)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <MaterialIcons name="update" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Cập nhật lần cuối</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentBed.updated_at)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Actions Card */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Thao tác</Text>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditBed', { bed: currentBed })}
              style={styles.actionButton}
              icon="pencil"
            >
              Chỉnh sửa
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('BedHistory', { bedId: currentBed._id })}
              style={styles.actionButton}
              icon="history"
            >
              Lịch sử
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('BedAssignments', { bedId: currentBed._id })}
              style={styles.actionButton}
              icon="account-multiple"
            >
              Người sử dụng
            </Button>
          </View>

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            onPress={handleDeleteBed}
            style={styles.deleteButton}
            buttonColor="#F44336"
            icon="delete"
          >
            Xóa giường
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedInfo: {
    flex: 1,
  },
  bedNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    height: 28,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  deleteButton: {
    marginTop: 8,
  },
});

export default BedDetailScreen; 