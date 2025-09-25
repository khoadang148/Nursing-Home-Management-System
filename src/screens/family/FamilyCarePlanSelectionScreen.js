import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import carePlanService from '../../api/services/carePlanService';
import DropDownPicker from 'react-native-dropdown-picker';

const FamilyCarePlanSelectionScreen = ({ route, navigation }) => {
  const { resident, admissionDateISO } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedMainPlan, setSelectedMainPlan] = useState(null);
  const [selectedSupplementaryPlans, setSelectedSupplementaryPlans] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [roomDropdownValue, setRoomDropdownValue] = useState(null);
  const [bedDropdownOpen, setBedDropdownOpen] = useState(false);
  const [bedDropdownValue, setBedDropdownValue] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [endDateDisplay, setEndDateDisplay] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('custom');
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  const formatDateVN = (dateObj) => {
    const d = new Date(dateObj);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const convertDisplayDateToISO = (display) => {
    if (!display) return '';
    const [day, month, year] = display.split('/');
    const local = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 23, 59, 59, 999);
    return local.toISOString();
  };

  const calculateEndDateFromAdmission = (duration) => {
    try {
      const base = admissionDateISO ? new Date(admissionDateISO) : new Date();
      const today = new Date(base);
      let end = new Date(today);
      if (duration === '6months') {
        // Inclusive counting: count current month as 1, so add 5 more months
        end.setMonth(today.getMonth() + 5);
        end.setMonth(end.getMonth() + 1, 0); // last day of that month
      } else if (duration === '1year') {
        // Inclusive counting: 12 months total => add 11 months
        end.setMonth(today.getMonth() + 11);
        end.setMonth(end.getMonth() + 1, 0);
      } else {
        return null;
      }
      end.setHours(23, 59, 59, 999);
      return end;
    } catch {
      return null;
    }
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    if (duration === 'custom') {
      // keep current selection, user will pick manually
      return;
    }
    const calculated = calculateEndDateFromAdmission(duration);
    if (calculated) {
      setSelectedEndDate(calculated);
      setEndDateDisplay(formatDateVN(calculated));
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [plans, rooms] = await Promise.all([
          carePlanService.getCarePlans(),
          carePlanService.getRoomTypes(),
        ]);
        setCarePlans(plans || []);
        setRoomTypes(rooms || []);
      } catch (e) {
        console.error('Load data error', e);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mainCarePlans = useMemo(() => (carePlans || []).filter(p => p?.category === 'main').sort((a,b)=>(a.monthly_price||0)-(b.monthly_price||0)), [carePlans]);
  const supplementaryCarePlans = useMemo(() => (carePlans || []).filter(p => p?.category === 'supplementary').sort((a,b)=>(a.monthly_price||0)-(b.monthly_price||0)), [carePlans]);

  // Reset room and bed selections when main plan changes
  useEffect(() => {
    if (selectedMainPlan) {
      setSelectedRoom(null);
      setSelectedBed(null);
      setRoomDropdownValue(null);
      setBedDropdownValue(null);
      setAvailableRooms([]);
      setAvailableBeds([]);
      setRoomDropdownOpen(false);
      setBedDropdownOpen(false);
    }
  }, [selectedMainPlan]);

  useEffect(() => {
    const loadRooms = async () => {
      if (selectedMainPlan && selectedRoomType && resident?.gender) {
        try {
          setLoadingRooms(true);
          const filters = {
            room_type: selectedRoomType.room_type,
            main_care_plan_id: selectedMainPlan._id,
            gender: resident.gender,
            status: 'available',
          };
          const rooms = await carePlanService.getRoomsByFilter(filters);
          setAvailableRooms(rooms || []);
        } catch (e) {
          console.error('Load rooms error', e);
          setAvailableRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      } else {
        setAvailableRooms([]);
      }
    };
    loadRooms();
  }, [selectedMainPlan, selectedRoomType, resident?.gender]);

  // Reset bed selections when room type changes
  useEffect(() => {
    if (selectedRoomType) {
      setSelectedBed(null);
      setBedDropdownValue(null);
      setAvailableBeds([]);
      setBedDropdownOpen(false);
    }
  }, [selectedRoomType]);

  useEffect(() => {
    const loadBeds = async () => {
      if (selectedRoom) {
        try {
          setLoadingBeds(true);
          const beds = await carePlanService.getAvailableBedsByRoom(selectedRoom._id);
          // Filter out beds reserved by completed or pending assignments
          const filtered = [];
          for (const bed of beds || []) {
            try {
              const assignments = await carePlanService.getBedAssignmentsByBedId(bed._id);
              const hasReservation = (assignments || []).some(a => a.status === 'completed' || a.status === 'pending');
              if (!hasReservation) filtered.push(bed);
            } catch (e) {
              // If API fails for a bed, keep it to avoid over-filtering
              filtered.push(bed);
            }
          }
          setAvailableBeds(filtered);
        } catch (e) {
          console.error('Load beds error', e);
          setAvailableBeds([]);
        } finally {
          setLoadingBeds(false);
        }
      } else {
        setAvailableBeds([]);
      }
    };
    loadBeds();
  }, [selectedRoom]);

  const roomDropdownItems = useMemo(() => availableRooms.map(r => ({ label: `Phòng ${r.room_number} - Tầng ${r.floor}`, value: r._id })), [availableRooms]);
  const bedDropdownItems = useMemo(() => {
    const sorted = [...(availableBeds || [])].sort((a, b) =>
      (a?.bed_number || '').localeCompare(b?.bed_number || '', 'vi', { numeric: true, sensitivity: 'base' })
    );
    return sorted.map(b => ({ label: `Giường ${b.bed_number} (${b.bed_type})`, value: b._id }));
  }, [availableBeds]);

  const toggleSupplementary = (plan) => {
    setSelectedSupplementaryPlans(prev => prev.find(p => p._id === plan._id) ? prev.filter(p => p._id !== plan._id) : [...prev, plan]);
  };

  const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format((n||0)*10000) + ' VNĐ';

  const totalCost = useMemo(() => {
    try {
      return carePlanService.calculateTotalCost(
        [selectedMainPlan, ...selectedSupplementaryPlans].filter(Boolean),
        selectedRoomType,
        roomTypes
      );
    } catch {
      return { totalCost: 0, roomCost: 0, carePlansCost: 0 };
    }
  }, [selectedMainPlan, selectedSupplementaryPlans, selectedRoomType, roomTypes]);

  const onNext = () => {
    if (!resident) { Alert.alert('Lỗi', 'Thiếu thông tin cư dân'); return; }
    if (!selectedMainPlan) { Alert.alert('Lỗi', 'Vui lòng chọn gói dịch vụ chính'); return; }
    if (!selectedRoomType) { Alert.alert('Lỗi', 'Vui lòng chọn loại phòng'); return; }
    if (!selectedRoom) { Alert.alert('Lỗi', 'Vui lòng chọn phòng'); return; }
    if (!selectedBed) { Alert.alert('Lỗi', 'Vui lòng chọn giường'); return; }
    if (!endDateDisplay) { Alert.alert('Lỗi', 'Vui lòng chọn ngày kết thúc dịch vụ'); return; }

    navigation.replace('FamilyRegistrationReview', {
      resident,
      admissionDateISO,
      selectedMainPlan,
      selectedSupplementaryPlans,
      selectedRoomType,
      selectedRoom,
      selectedBed,
      pricing: totalCost,
      endDateISO: convertDisplayDateToISO(endDateDisplay),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={{marginTop:8}}>Đang tải dữ liệu...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký gói dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>
      {/* Progress Indicator - compact */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleActive]}>
            <Text style={[styles.progressNumber, styles.progressNumberActive]}>1</Text>
          </View>
          <Text style={[styles.progressLabel, styles.progressLabelActive]}>Thông tin</Text>
        </View>
        <View style={[styles.progressLine, styles.progressLineActive]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleActive]}>
            <Text style={[styles.progressNumber, styles.progressNumberActive]}>2</Text>
          </View>
          <Text style={[styles.progressLabel, styles.progressLabelActive]}>Gói & Phòng</Text>
        </View>
        <View style={[styles.progressLine, styles.progressLineInactive]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.progressCircleInactive]}>
            <Text style={[styles.progressNumber, styles.progressNumberInactive]}>3</Text>
          </View>
          <Text style={[styles.progressLabel, styles.progressLabelInactive]}>Thanh toán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: (roomDropdownOpen || bedDropdownOpen) ? 340 : 40 }}>
        <Text style={styles.sectionTitle}>1. Gói dịch vụ chính</Text>
        {(mainCarePlans).map((p) => (
          <TouchableOpacity key={p._id} style={[styles.card, selectedMainPlan?._id===p._id && styles.cardActive]} onPress={()=>setSelectedMainPlan(p)}>
            <Text style={styles.cardTitle}>{p.plan_name}</Text>
            <Text style={styles.cardPrice}>{formatPrice(p.monthly_price)}</Text>
            {p.description ? <Text style={styles.cardDesc}>{p.description}</Text> : null}
          </TouchableOpacity>
        ))}
        <Text style={styles.sectionTitle}>2. Gói dịch vụ phụ (tuỳ chọn)</Text>
        {(supplementaryCarePlans).map((p) => {
          const on = !!selectedSupplementaryPlans.find(x=>x._id===p._id);
          return (
            <TouchableOpacity key={p._id} style={[styles.card, on && styles.cardActive]} onPress={()=>toggleSupplementary(p)}>
              <Text style={styles.cardTitle}>{p.plan_name}</Text>
              <Text style={styles.cardPrice}>{formatPrice(p.monthly_price)}</Text>
              {p.description ? <Text style={styles.cardDesc}>{p.description}</Text> : null}
            </TouchableOpacity>
          );
        })}
        <Text style={styles.sectionTitle}>3. Loại phòng</Text>
        {(roomTypes||[]).sort((a,b)=>(a.monthly_price||0)-(b.monthly_price||0)).map(rt => (
          <TouchableOpacity key={rt._id} style={[styles.card, selectedRoomType?._id===rt._id && styles.cardActive]} onPress={()=>{
            setSelectedRoomType(rt); 
            setSelectedRoom(null); 
            setSelectedBed(null); 
            setRoomDropdownValue(null); 
            setBedDropdownValue(null);
            setAvailableRooms([]);
            setAvailableBeds([]);
            setRoomDropdownOpen(false);
            setBedDropdownOpen(false);
          }}>
            <Text style={styles.cardTitle}>{rt.type_name}</Text>
            <Text style={styles.cardPrice}>{formatPrice(rt.monthly_price)}</Text>
            {rt.description ? <Text style={styles.cardDesc}>{rt.description}</Text> : null}
          </TouchableOpacity>
        ))}
        {selectedRoomType && (
          <View style={[{ marginTop: 12 }, roomDropdownOpen && { zIndex: 3000 }]}>
            <Text style={styles.sectionTitle}>4. Chọn phòng</Text>
            {loadingRooms ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (availableRooms || []).length === 0 ? (
              <Text style={{ color: '#dc3545', marginBottom: 10 }}>Không có phòng phù hợp còn trống.</Text>
            ) : (
              <View style={[styles.dropdownWrapper, roomDropdownOpen && styles.dropdownSpacer]}>
                <DropDownPicker
                  open={roomDropdownOpen}
                  value={roomDropdownValue}
                  items={roomDropdownItems}
                  setOpen={setRoomDropdownOpen}
                  setValue={(fn)=>{ 
                    const v = fn(); 
                    setRoomDropdownValue(v); 
                    const room = availableRooms.find(r=>r._id===v); 
                    setSelectedRoom(room); 
                    setSelectedBed(null); 
                    setBedDropdownValue(null);
                    setAvailableBeds([]);
                    setBedDropdownOpen(false);
                  }}
                  setItems={()=>{}}
                  placeholder="Chọn phòng..."
                  style={{ borderColor: '#e0e0e0', backgroundColor: 'white', marginBottom: 10 }}
                  dropDownContainerStyle={{ borderColor: '#e0e0e0', maxHeight: 320 }}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  dropDownDirection="BOTTOM"
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>
            )}
          </View>
        )}
        {selectedRoom && (
          <View style={[{ marginTop: 12 }, bedDropdownOpen && { zIndex: 2500 }]}>
            <Text style={styles.sectionTitle}>5. Chọn giường</Text>
            {loadingBeds ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (availableBeds || []).length === 0 ? (
              <Text style={{ color: '#dc3545', marginBottom: 10 }}>Không còn giường trống trong phòng này.</Text>
            ) : (
              <View style={[styles.dropdownWrapper, bedDropdownOpen && styles.dropdownSpacer]}>
                <DropDownPicker
                  open={bedDropdownOpen}
                  value={bedDropdownValue}
                  items={bedDropdownItems}
                  setOpen={setBedDropdownOpen}
                  setValue={(fn)=>{ const v = fn(); setBedDropdownValue(v); const bed = availableBeds.find(b=>b._id===v); setSelectedBed(bed); }}
                  setItems={()=>{}}
                  placeholder="Chọn giường..."
                  style={{ borderColor: '#e0e0e0', backgroundColor: 'white', marginBottom: 10 }}
                  dropDownContainerStyle={{ borderColor: '#e0e0e0', maxHeight: 320 }}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  dropDownDirection="BOTTOM"
                  zIndex={2500}
                  zIndexInverse={1000}
                />
              </View>
            )}
          </View>
        )}

        {/* End date selection (contract end) */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>6. Ngày kết thúc dịch vụ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelText}>Ngày bắt đầu:</Text>
            <Text style={styles.infoValueText}>{admissionDateISO ? formatDateVN(new Date(admissionDateISO)) : '-'}</Text>
          </View>
          <View style={styles.durationOptionsContainer}>
            <TouchableOpacity
              style={[styles.durationOption, selectedDuration === '6months' && styles.durationSelected]}
              onPress={() => handleDurationSelect('6months')}
            >
              <Text style={[styles.durationText, selectedDuration === '6months' && styles.durationTextSelected]}>6 tháng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.durationOption, selectedDuration === '1year' && styles.durationSelected]}
              onPress={() => handleDurationSelect('1year')}
            >
              <Text style={[styles.durationText, selectedDuration === '1year' && styles.durationTextSelected]}>1 năm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.durationOption, selectedDuration === 'custom' && styles.durationSelected]}
              onPress={() => { handleDurationSelect('custom'); setShowEndDatePicker(true); }}
            >
              <Text style={[styles.durationText, selectedDuration === 'custom' && styles.durationTextSelected]}>Tùy chỉnh</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => selectedDuration === 'custom' && setShowEndDatePicker(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Text style={[styles.endDateField, selectedDuration !== 'custom' && { color: '#9e9e9e' }]}>{endDateDisplay || 'Chọn ngày kết thúc...'}</Text>
            </View>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={selectedEndDate}
              mode="date"
              display="spinner"
              minimumDate={admissionDateISO ? new Date(admissionDateISO) : new Date()}
              onChange={(e, d) => {
                setShowEndDatePicker(false);
                if (d) {
                  setSelectedEndDate(d);
                  setEndDateDisplay(formatDateVN(d));
                }
              }}
            />
          )}
        </View>
        {/* Summary before total */}
        {(selectedMainPlan || selectedSupplementaryPlans.length || selectedRoomType || selectedRoom || selectedBed) && (
          <View style={styles.summaryCard}>
            {selectedMainPlan && (
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#212529' }}>Gói dịch vụ chính:</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatPrice(selectedMainPlan?.monthly_price||0)}</Text>
                </View>
                <Text style={{ color: '#6c757d', marginTop: 2 }}>• {selectedMainPlan?.plan_name || 'Chưa chọn'}</Text>
              </View>
            )}
            {selectedSupplementaryPlans.map(p => (
              <View key={p._id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#212529' }}>Gói dịch vụ phụ:</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatPrice(p?.monthly_price||0)}</Text>
                </View>
                <Text style={{ color: '#6c757d', marginTop: 2 }}>• {p.plan_name}</Text>
              </View>
            ))}
            {selectedRoomType && (
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#212529' }}>Loại phòng:</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatPrice(selectedRoomType?.monthly_price||0)}</Text>
                </View>
                <Text style={{ color: '#6c757d', marginTop: 2 }}>• {selectedRoomType?.type_name || 'Chưa chọn'}</Text>
              </View>
            )}
            {selectedRoom && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#212529' }}>Phòng:</Text>
                <Text style={{ color: '#212529', fontWeight: '600' }}>{`Phòng ${selectedRoom.room_number} - Tầng ${selectedRoom.floor}`}</Text>
              </View>
            )}
            {selectedBed && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#212529' }}>Giường:</Text>
                <Text style={{ color: '#212529', fontWeight: '600' }}>{`Giường ${selectedBed.bed_number} (${selectedBed.bed_type})`}</Text>
              </View>
            )}
            {endDateDisplay ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ color: '#212529' }}>Ngày kết thúc:</Text>
                <Text style={{ color: '#212529', fontWeight: '600' }}>{endDateDisplay}</Text>
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatPrice(totalCost.totalCost)}</Text>
        </View>
        <TouchableOpacity style={[styles.submitButton, (!selectedMainPlan||!selectedRoomType||!selectedRoom||!selectedBed)&&{backgroundColor:'#c8dad1'}]} disabled={!selectedMainPlan||!selectedRoomType||!selectedRoom||!selectedBed} onPress={onNext}>
          <Text style={styles.submitText}>Tiếp tục: Xác nhận và thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#212529', flex: 1, textAlign: 'center', marginRight: 40 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 8, marginTop: 12 },
  card: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', padding: 12, marginBottom: 8 },
  cardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#212529' },
  cardPrice: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 4 },
  cardDesc: { fontSize: 13, color: '#6c757d', marginTop: 6 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { fontSize: 16, color: '#212529', fontWeight: '600' },
  totalValue: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
  submitButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  submitText: { color: 'white', fontWeight: '700' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Progress compact styles
  progressContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  progressCircleActive: { backgroundColor: COLORS.primary },
  progressCircleInactive: { backgroundColor: '#E0E0E0' },
  progressNumber: { fontSize: 11, fontWeight: 'bold' },
  progressNumberActive: { color: 'white' },
  progressNumberInactive: { color: '#9E9E9E' },
  progressLabel: { fontSize: 10, textAlign: 'center' },
  progressLabelActive: { color: COLORS.primary },
  progressLabelInactive: { color: '#9E9E9E' },
  progressLine: { height: 2, flex: 1, marginHorizontal: 6, marginBottom: 14 },
  progressLineActive: { backgroundColor: COLORS.primary },
  progressLineInactive: { backgroundColor: '#E0E0E0' },
  dropdownWrapper: {
    zIndex: 1,
  },
  dropdownSpacer: {
    paddingBottom: 300,
  },
  summaryCard: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  durationOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  durationOption: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  durationSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  durationText: {
    color: '#212529',
    fontWeight: '600',
  },
  durationTextSelected: {
    color: COLORS.primary,
  },
  endDateField: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    color: '#212529',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabelText: {
    color: '#666',
    fontSize: 14,
  },
  infoValueText: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FamilyCarePlanSelectionScreen;








