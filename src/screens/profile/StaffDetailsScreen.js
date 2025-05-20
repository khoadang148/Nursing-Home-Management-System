import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Base64 encoded placeholder image
const DEFAULT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAyLTIwVDEzOjQ1OjM4KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMi0yMFQxMzo0NjoyOCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTE5YWQyZjgtZDAyNi0yNTQyLTg4YzktYmU0ZGI5MjJkNDJkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphMTlhZDJmOC1kMDI2LTI1NDItODhjOS1iZTRkYjkyMmQ0MmQiIHN0RXZ0OndoZW49IjIwMjAtMDItMjBUMTM6NDU6MzgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4En6MDAAABT0lEQVR42u3dMU4DMRRF0U/BHpJGFLACKhqWQMXSWAXrQayADiQKFtBFARIFBTWKRoPnTHEL6e7i/JG8hD/JsOL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeL0QeIcJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJE4fJM6N0wcZ1LdDdnLbJPdN8tIkD01yU/TZ9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHi9EHiHCROfyDXH4/nwMZ8Z8OsAAAAAElFTkSuQmCC';

// Mock data for staff details
const STAFF_DATA = [
  { 
    id: '1', 
    name: 'John Smith', 
    role: 'Doctor',
    department: 'Cardiology',
    email: 'john.smith@hospital.com',
    phone: '(123) 456-7890',
    specialization: 'Interventional Cardiology',
    experience: '15 years',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '2', 
    name: 'Sarah Johnson', 
    role: 'Nurse',
    department: 'Emergency',
    email: 'sarah.johnson@hospital.com',
    phone: '(123) 456-7891',
    specialization: 'Emergency Care',
    experience: '8 years',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '3', 
    name: 'Mike Wilson', 
    role: 'Administrator',
    department: 'Management',
    email: 'mike.wilson@hospital.com',
    phone: '(123) 456-7892',
    specialization: 'Hospital Administration',
    experience: '12 years',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '4', 
    name: 'Emily Davis', 
    role: 'Nurse',
    department: 'Pediatrics',
    email: 'emily.davis@hospital.com',
    phone: '(123) 456-7893',
    specialization: 'Pediatric Care',
    experience: '6 years',
    image: { uri: DEFAULT_AVATAR }
  },
  { 
    id: '5', 
    name: 'David Brown', 
    role: 'Doctor',
    department: 'Neurology',
    email: 'david.brown@hospital.com',
    phone: '(123) 456-7894',
    specialization: 'Neurosurgery',
    experience: '10 years',
    image: { uri: DEFAULT_AVATAR }
  },
];

const StaffDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { staffId } = route.params;
  
  // Find the staff member based on ID
  const staffMember = STAFF_DATA.find(staff => staff.id === staffId);

  if (!staffMember) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Staff member not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Details</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
                        source={staffMember.image}             style={styles.profileImage}
          />
        </View>
        <Text style={styles.staffName}>{staffMember.name}</Text>
        <Text style={styles.staffRole}>{staffMember.role}</Text>
        <Text style={styles.staffDepartment}>{staffMember.department}</Text>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{staffMember.email}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{staffMember.phone}</Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Specialization</Text>
          <Text style={styles.detailValue}>{staffMember.specialization}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Experience</Text>
          <Text style={styles.detailValue}>{staffMember.experience}</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Send Message</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#e1e1e1',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  staffName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  staffRole: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  staffDepartment: {
    fontSize: 16,
    color: '#888',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  actionsSection: {
    marginHorizontal: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StaffDetailsScreen; 