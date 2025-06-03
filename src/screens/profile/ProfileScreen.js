import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

// Base64 encoded placeholder image
const DEFAULT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAyLTIwVDEzOjQ1OjM4KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHN0RXZ0OndoZW49IjIwMjAtMDItMjBUMTM6NDU6MzgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4En6MDAAABT0lEQVR42u3dMU4DMRRF0U/BHpJGFLACKhqWQMXSWAXrQayADiQKFtBFARIFBTWKRoPnTHEL6e7i/JG8hD/JsOL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeIcJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJM6N0wcZ1LdDdnLbJPdN8tIkD01yU/TZ9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHiHCROfyDXH4/nwMZ8Z8OsAAAAAElFTkSuQmCC';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      "Đăng Xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng Xuất",
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: DEFAULT_AVATAR }} 
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userRole}>Y Tá</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('ChinhSuaHoSo')}
        >
          <Text style={styles.editButtonText}>Chỉnh Sửa Hồ Sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('CaiDat')}
        >
          <Text style={styles.menuItemText}>Cài Đặt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('DanhBaNhanVien')}
        >
          <Text style={styles.menuItemText}>Danh Bạ Nhân Viên</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>Đăng Xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#e1e1e1',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: '500',
  },
});

export default ProfileScreen; 