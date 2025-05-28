import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Base64 encoded placeholder image
const DEFAULT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAyLTIwVDEzOjQ1OjM4KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHN0RXZ0OndoZW49IjIwMjAtMDItMjBUMTM6NDU6MzgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4En6MDAAABT0lEQVR42u3dMU4DMRRF0U/BHpJGFLACKhqWQMXSWAXrQayADiQKFtBFARIFBTWKRoPnTHEL6e7i/JG8hD/JsOL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeIcJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJM6N0wcZ1LdDdnLbJPdN8tIkD01yU/TZ9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHiHCROfyDXH4/nwMZ8Z8OsAAAAAElFTkSuQmCC';

// Dữ liệu mẫu cho danh bạ nhân viên
const STAFF_DATA = [
  { 
    id: '1', 
    name: 'Nguyễn Văn An', 
    role: 'Bác sĩ',
    department: 'Tim mạch',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '2', 
    name: 'Trần Thị Bình', 
    role: 'Y tá',
    department: 'Cấp cứu',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '3', 
    name: 'Lê Minh Cường', 
    role: 'Quản trị viên',
    department: 'Quản lý',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '4', 
    name: 'Phạm Thị Dung', 
    role: 'Y tá',
    department: 'Nhi khoa',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '5', 
    name: 'Hoàng Văn Em', 
    role: 'Bác sĩ',
    department: 'Thần kinh',
    image: { uri: DEFAULT_AVATAR }
  },
];

const StaffDirectoryScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(STAFF_DATA);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const filtered = STAFF_DATA.filter(item => {
        return item.name.toLowerCase().includes(text.toLowerCase()) || 
               item.role.toLowerCase().includes(text.toLowerCase()) ||
               item.department.toLowerCase().includes(text.toLowerCase());
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(STAFF_DATA);
    }
  };

  const renderStaffItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.staffItem}
      onPress={() => navigation.navigate('StaffDetails', { staffId: item.id })}
    >
            <Image         source={item.image}         style={styles.staffImage}      />
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffRole}>{item.role}</Text>
        <Text style={styles.staffDepartment}>{item.department}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh bạ nhân viên</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm kiếm nhân viên..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderStaffItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  staffItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  staffImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  staffInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  staffRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  staffDepartment: {
    fontSize: 14,
    color: '#888',
  },
});

export default StaffDirectoryScreen; 