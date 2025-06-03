import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Text, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { COLORS, FONTS } from '../../constants/theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const VitalDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vitalId } = route.params;

  // Lấy danh sách sinh hiệu từ Redux (giả sử state.residents.vitals)
  const allVitals = useSelector(state => {
    if (Array.isArray(state.residents.vitals)) return state.residents.vitals;
    if (Array.isArray(state.residents.vitals?.data)) return state.residents.vitals.data;
    return [];
  });
  const [vital, setVital] = useState(null);

  useEffect(() => {
    const found = allVitals.find(v => v.id === vitalId);
    if (!found) {
      Alert.alert('Lỗi', 'Không tìm thấy dữ liệu sinh hiệu', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      setVital(found);
    }
  }, [vitalId, allVitals, navigation]);

  if (!vital) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const date = new Date(vital.date);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chi Tiết Sinh Hiệu" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Thông tin ghi nhận" />
          <Card.Content>
            <Text style={styles.label}>Ngày giờ ghi nhận:</Text>
            <Text style={styles.value}>
              {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Người ghi nhận:</Text>
            <Text style={styles.value}>{vital.recordedBy || '---'}</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Huyết áp:</Text>
            <Text style={styles.value}>{vital.bloodPressure || '---'}</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Nhịp tim:</Text>
            <Text style={styles.value}>{vital.heartRate || '---'} bpm</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Nhiệt độ:</Text>
            <Text style={styles.value}>{vital.temperature || '---'} °C</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Nhịp thở:</Text>
            <Text style={styles.value}>{vital.respiratoryRate || '---'} lần/phút</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>SpO2:</Text>
            <Text style={styles.value}>{vital.oxygenSaturation || '---'} %</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Cân nặng:</Text>
            <Text style={styles.value}>{vital.weight || '---'} kg</Text>
            <Divider style={styles.divider} />

            <Text style={styles.label}>Ghi chú:</Text>
            <Text style={styles.value}>{vital.notes || '---'}</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  appbar: { backgroundColor: COLORS.primary },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  label: { ...FONTS.body3, color: COLORS.textSecondary, marginTop: 8 },
  value: { ...FONTS.body2, color: COLORS.text, marginBottom: 4 },
  divider: { marginVertical: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default VitalDetailScreen;