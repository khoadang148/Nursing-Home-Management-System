import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Appbar, Chip, Surface, Button, Divider, Menu } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Mock data imports - in a real app would come from API
import { residents, carePlans, medications, vitals } from '../../api/mockData';

const ResidentDetailScreen = ({ route, navigation }) => {
  const { residentId } = route.params;
  const [resident, setResident] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, care, meds, vitals

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      // Simulate API call delay
      setTimeout(() => {
        const foundResident = residents.find(r => r.id === residentId);
        setResident(foundResident);
        setLoading(false);
      }, 500);
    };

    fetchData();
  }, [residentId]);

  if (loading || !resident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const residentCarePlans = carePlans.filter(cp => cp.residentId === residentId);
  const residentMedications = medications.filter(m => m.residentId === residentId);
  const residentVitals = vitals.filter(v => v.residentId === residentId);

  const renderOverviewTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Surface style={styles.infoBox}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Room Number</Text>
              <Text style={styles.infoValue}>{resident.roomNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {new Date(resident.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Admission Date</Text>
              <Text style={styles.infoValue}>
                {new Date(resident.admissionDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Care Level</Text>
              <Chip
                style={[
                  styles.careChip,
                  {
                    backgroundColor:
                      resident.careLevel === 'High'
                        ? COLORS.error
                        : resident.careLevel === 'Medium'
                        ? COLORS.warning
                        : COLORS.success,
                  },
                ]}
                textStyle={{ color: COLORS.surface }}
              >
                {resident.careLevel}
              </Chip>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoFullItem}>
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>{resident.doctor}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoFullItem}>
              <Text style={styles.infoLabel}>Dietary Restrictions</Text>
              <Text style={styles.infoValue}>{resident.dietaryRestrictions || 'None'}</Text>
            </View>
          </View>
        </Surface>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        <Surface style={styles.infoBox}>
          <View style={styles.conditionsContainer}>
            {resident.medicalConditions.map((condition, index) => (
              <Chip key={index} style={styles.conditionChip}>
                {condition}
              </Chip>
            ))}
          </View>
          
          <Text style={[styles.infoLabel, { marginTop: 16 }]}>Allergies</Text>
          <View style={styles.conditionsContainer}>
            {resident.allergies.length > 0 ? (
              resident.allergies.map((allergy, index) => (
                <Chip
                  key={index}
                  style={[styles.conditionChip, { backgroundColor: COLORS.error + '20' }]}
                  textStyle={{ color: COLORS.error }}
                >
                  {allergy}
                </Chip>
              ))
            ) : (
              <Text style={styles.infoValue}>No known allergies</Text>
            )}
          </View>
        </Surface>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <Surface style={styles.infoBox}>
          <View style={styles.infoRow}>
            <View style={styles.infoFullItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{resident.contactInfo.emergency.name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Relationship</Text>
              <Text style={styles.infoValue}>{resident.contactInfo.emergency.relationship}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{resident.contactInfo.emergency.phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoFullItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{resident.contactInfo.emergency.email}</Text>
            </View>
          </View>
        </Surface>
      </View>
    </>
  );

  const renderCareTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Care Plans</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('AddCarePlan', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Add
          </Button>
        </View>
        
        {residentCarePlans.length > 0 ? (
          residentCarePlans.map(plan => (
            <Surface key={plan.id} style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('CarePlanDetail', { planId: plan.id })}
              >
                <View style={styles.carePlanHeader}>
                  <View>
                    <Text style={styles.carePlanTitle}>{plan.title}</Text>
                    <Text style={styles.carePlanDate}>
                      Created: {new Date(plan.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          plan.status === 'Active' ? COLORS.success + '20' : COLORS.error + '20',
                      },
                    ]}
                    textStyle={{
                      color: plan.status === 'Active' ? COLORS.success : COLORS.error,
                    }}
                  >
                    {plan.status}
                  </Chip>
                </View>
                <Text style={styles.carePlanDescription}>{plan.description}</Text>
                
                <View style={styles.goalsContainer}>
                  <Text style={styles.goalsTitle}>Goals:</Text>
                  {plan.goals.slice(0, 2).map((goal, index) => (
                    <View key={index} style={styles.goalItem}>
                      <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
                      <Text style={styles.goalText}>{goal}</Text>
                    </View>
                  ))}
                  {plan.goals.length > 2 && (
                    <Text style={styles.moreText}>
                      +{plan.goals.length - 2} more goals
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No care plans found</Text>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => navigation.navigate('AddCarePlan', { residentId })}
              style={{ marginTop: 10 }}
            >
              Create Care Plan
            </Button>
          </View>
        )}
      </View>
    </>
  );

  const renderMedicationsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('AddMedication', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Add
          </Button>
        </View>
        
        {residentMedications.length > 0 ? (
          residentMedications.map(med => (
            <Surface key={med.id} style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MedicationDetail', { medicationId: med.id })}
              >
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          med.status === 'Active' ? COLORS.success + '20' : COLORS.error + '20',
                      },
                    ]}
                    textStyle={{
                      color: med.status === 'Active' ? COLORS.success : COLORS.error,
                    }}
                  >
                    {med.status}
                  </Chip>
                </View>
                
                <View style={styles.medicationDetails}>
                  <View style={styles.medicationDetail}>
                    <Text style={styles.medicationLabel}>Dosage:</Text>
                    <Text style={styles.medicationValue}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medicationDetail}>
                    <Text style={styles.medicationLabel}>Route:</Text>
                    <Text style={styles.medicationValue}>{med.route}</Text>
                  </View>
                  <View style={styles.medicationDetail}>
                    <Text style={styles.medicationLabel}>Frequency:</Text>
                    <Text style={styles.medicationValue}>{med.frequency}</Text>
                  </View>
                </View>
                
                <View style={styles.medicationSchedule}>
                  <Text style={styles.medicationScheduleTitle}>
                    Administration Times:
                  </Text>
                  <View style={styles.timeContainer}>
                    {med.timeOfAdministration.map((time, index) => (
                      <Chip key={index} style={styles.timeChip}>
                        {time}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                {med.notes && <Text style={styles.medicationNotes}>Notes: {med.notes}</Text>}
              </TouchableOpacity>
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No medications found</Text>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => navigation.navigate('AddMedication', { residentId })}
              style={{ marginTop: 10 }}
            >
              Add Medication
            </Button>
          </View>
        )}
      </View>
    </>
  );

  const renderVitalsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('RecordVitals', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Record
          </Button>
        </View>
        
        {residentVitals.length > 0 ? (
          residentVitals.map(vital => {
            const vitalDate = new Date(vital.date);
            return (
              <Surface key={vital.id} style={styles.cardContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('VitalDetail', { vitalId: vital.id })}
                >
                  <View style={styles.vitalHeader}>
                    <Text style={styles.vitalDate}>
                      {vitalDate.toLocaleDateString()} {vitalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.vitalRecorded}>
                      By: {vital.recordedBy}
                    </Text>
                  </View>
                  
                  <View style={styles.vitalGrid}>
                    <View style={styles.vitalItem}>
                      <MaterialIcons name="favorite" size={18} color={COLORS.error} />
                      <Text style={styles.vitalLabel}>BP</Text>
                      <Text style={styles.vitalValue}>{vital.bloodPressure}</Text>
                    </View>
                    
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="heart-pulse" size={18} color={COLORS.primary} />
                      <Text style={styles.vitalLabel}>Heart Rate</Text>
                      <Text style={styles.vitalValue}>{vital.heartRate}</Text>
                    </View>
                    
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="lungs" size={18} color={COLORS.info} />
                      <Text style={styles.vitalLabel}>Resp Rate</Text>
                      <Text style={styles.vitalValue}>{vital.respiratoryRate}</Text>
                    </View>
                    
                    <View style={styles.vitalItem}>
                      <FontAwesome5 name="temperature-high" size={18} color={COLORS.warning} />
                      <Text style={styles.vitalLabel}>Temp</Text>
                      <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                    </View>
                    
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="percent" size={18} color={COLORS.accent} />
                      <Text style={styles.vitalLabel}>O2 Sat</Text>
                      <Text style={styles.vitalValue}>{vital.oxygenSaturation}%</Text>
                    </View>
                    
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="scale" size={18} color={COLORS.secondary} />
                      <Text style={styles.vitalLabel}>Weight</Text>
                      <Text style={styles.vitalValue}>{vital.weight} kg</Text>
                    </View>
                  </View>
                  
                  {vital.notes && <Text style={styles.vitalNotes}>Notes: {vital.notes}</Text>}
                </TouchableOpacity>
              </Surface>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vital signs recorded</Text>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => navigation.navigate('RecordVitals', { residentId })}
              style={{ marginTop: 10 }}
            >
              Record Vitals
            </Button>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${resident.firstName} ${resident.lastName}`} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('EditResident', { residentId });
            }}
            title="Edit Resident"
            icon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentNotes', { residentId });
            }}
            title="Notes"
            icon="notebook"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentFamily', { residentId });
            }}
            title="Family Contacts"
            icon="account-group"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: resident.photo }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{`${resident.firstName} ${resident.lastName}`}</Text>
            </View>
            <View style={styles.roomBadge}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomText}>Room {resident.roomNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={activeTab === 'overview' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'care' && styles.activeTabButton]}
            onPress={() => setActiveTab('care')}
          >
            <MaterialIcons
              name="assignment"
              size={24}
              color={activeTab === 'care' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'care' && styles.activeTabText,
              ]}
            >
              Care
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'meds' && styles.activeTabButton]}
            onPress={() => setActiveTab('meds')}
          >
            <FontAwesome5
              name="pills"
              size={20}
              color={activeTab === 'meds' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'meds' && styles.activeTabText,
              ]}
            >
              Meds
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vitals' && styles.activeTabButton]}
            onPress={() => setActiveTab('vitals')}
          >
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color={activeTab === 'vitals' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'vitals' && styles.activeTabText,
              ]}
            >
              Vitals
            </Text>
          </TouchableOpacity>
        </View>

        <Divider />

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'care' && renderCareTab()}
        {activeTab === 'meds' && renderMedicationsTab()}
        {activeTab === 'vitals' && renderVitalsTab()}
      </ScrollView>
    </View>
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
  },
  appbar: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 4,
  },
  name: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoBox: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoFullItem: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  careChip: {
    alignSelf: 'flex-start',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  conditionChip: {
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    ...FONTS.body3,
    color: COLORS.surface,
  },
  cardContainer: {
    padding: SIZES.padding,
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carePlanTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  carePlanDate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  carePlanDescription: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 12,
  },
  goalsContainer: {
    marginTop: 8,
  },
  goalsTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
  },
  moreText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginTop: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  medicationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  medicationDetail: {
    marginRight: 16,
    marginBottom: 8,
  },
  medicationLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  medicationValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  medicationSchedule: {
    marginBottom: 12,
  },
  medicationScheduleTitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeChip: {
    backgroundColor: COLORS.primary + '20',
    marginRight: 8,
    marginBottom: 8,
  },
  medicationNotes: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  vitalHeader: {
    marginBottom: 12,
  },
  vitalDate: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  vitalRecorded: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  vitalItem: {
    width: '33%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  vitalLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vitalValue: {
    ...FONTS.body1,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  vitalNotes: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
});

export default ResidentDetailScreen; 