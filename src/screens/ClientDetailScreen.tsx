import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Package, ClientMetric } from '../types';

const WORKOUT_TYPES = [
  'Hipertrofi (Push/Pull/Legs)',
  'Güç (5x5 Powerlifting)',
  'Dayanıklılık (HIIT & Cardio)',
  'Mobilite & Yoga',
  'Definisyon (Yağ Yakım)'
];

const DIET_TYPES = [
  'Yüksek Protein / Düşük Karb',
  'Ketojenik Diyet',
  'Aralıklı Oruç (IF 16:8)',
  'Dengeli Makro (Zone)',
  'Vegan / Bitkisel Tabanlı'
];

export const ClientDetailScreen = ({ route, navigation }: any) => {
  const { client } = route.params;
  const { colors, radius, getStatusColor } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [latestMetric, setLatestMetric] = useState<ClientMetric | null>(null);

  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [metricModalVisible, setMetricModalVisible] = useState(false);
  
  const [customText, setCustomText] = useState('');
  const [paymentAmountStr, setPaymentAmountStr] = useState('');

  // 9-Point Metric Form State
  const [metricForm, setMetricForm] = useState({
    weight: '', height: '', body_fat: '',
    shoulder: '', chest: '', biceps: '',
    waist: '', hips: '', thigh: '', calf: '', notes: ''
  });

  const loadData = async () => {
    try {
      const [pkg, metricsData] = await Promise.all([
        api.getClientPackage(client.id),
        api.getMetrics(client.id)
      ]);
      setActivePackage(pkg);
      if (metricsData && metricsData.length > 0) {
        setLatestMetric(metricsData[0]); // newest is first
      }
    } catch (error) {
      console.warn('Error loading client detail data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAssign = (type: string, item: string) => {
    Alert.alert('Başarılı', `${type} atandı: ${item}`);
    setWorkoutModalVisible(false);
    setDietModalVisible(false);
    setCustomText('');
  };

  const handleCollectPayment = async () => {
    if (!activePackage) return;
    const amount = Number(paymentAmountStr);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar giriniz.');
      return;
    }

    try {
      setLoading(true);
      await api.collectPayment(activePackage.id, amount, activePackage.paid_amount);
      Alert.alert('Başarılı', `${formatMoney(amount)} tahsil edildi.`);
      setPaymentModalVisible(false);
      setPaymentAmountStr('');
      await loadData();
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Tahsilat başarısız.');
      setLoading(false);
    }
  };

  const handleRenewPackage = () => {
    if (!activePackage) return;
    Alert.alert(
      'Paket Yenile',
      'Danışanın paketine +20 Ders ve 15.000 ₺ ücret eklenecektir. Onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Yenile', 
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await api.renewPackage(activePackage.id, 20, 15000);
              Alert.alert('Başarılı', 'Paket yenilendi (+20 Ders eklendi).');
              await loadData();
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Yenileme başarısız.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddMetric = async () => {
    try {
      setLoading(true);
      const newMetric: Omit<ClientMetric, 'id'> = {
        client_id: client.id,
        date: new Date().toISOString().split('T')[0],
        weight: Number(metricForm.weight) || 0,
        height: Number(metricForm.height) || 0,
        body_fat: Number(metricForm.body_fat) || 0,
        shoulder: Number(metricForm.shoulder) || 0,
        chest: Number(metricForm.chest) || 0,
        biceps: Number(metricForm.biceps) || 0,
        waist: Number(metricForm.waist) || 0,
        hips: Number(metricForm.hips) || 0,
        thigh: Number(metricForm.thigh) || 0,
        calf: Number(metricForm.calf) || 0,
        notes: metricForm.notes
      };
      
      await api.addMetric(newMetric);
      Alert.alert('Başarılı', 'Yeni ölçümler kaydedildi.');
      setMetricModalVisible(false);
      setMetricForm({ weight: '', height: '', body_fat: '', shoulder: '', chest: '', biceps: '', waist: '', hips: '', thigh: '', calf: '', notes: '' });
      await loadData();
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Ölçüm kaydedilemedi.');
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  const packagePrice = activePackage ? Number(activePackage.package_price) : 0;
  const paidAmount = activePackage ? Number(activePackage.paid_amount) : 0;
  const debt = packagePrice - paidAmount > 0 ? packagePrice - paidAmount : 0;
  const statusInfo = getStatusColor(activePackage?.remaining_sessions || 0);

  if (loading && !refreshing && !activePackage) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderBadge = (label: string, value?: number, unit: string = '') => {
    if (!value) return null;
    return (
      <View style={[styles.miniBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.miniBadgeLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.miniBadgeValue, { color: colors.text }]}>{value} {unit}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header Profile Info */}
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.clientName, { color: colors.text }]}>{client.full_name || client.name}</Text>
              <Text style={[styles.clientGoal, { color: colors.textMuted }]}>{client.email}</Text>
            </View>
            {activePackage && (
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {activePackage.remaining_sessions} Ders {statusInfo.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Financial Status Card */}
        {activePackage ? (
          <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
            <View style={styles.financeHeader}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>Finansal Durum</Text>
            </View>

            <View style={styles.financeMetrics}>
              <View style={styles.fMetric}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Paket Ücreti</Text>
                <Text style={[styles.fValue, { color: colors.text }]}>{formatMoney(packagePrice)}</Text>
              </View>
              <View style={styles.fMetric}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Tahsil Edilen</Text>
                <Text style={[styles.fValue, { color: colors.success }]}>{formatMoney(paidAmount)}</Text>
              </View>
              <View style={styles.fMetric}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Kalan Borç</Text>
                <Text style={[styles.fValue, { color: debt > 0 ? colors.danger : colors.text }]}>{formatMoney(debt)}</Text>
              </View>
            </View>

            <View style={styles.financeActions}>
              <TouchableOpacity 
                style={[styles.financeBtn, { backgroundColor: colors.success, borderRadius: radius.button, flex: 2 }]}
                onPress={() => setPaymentModalVisible(true)}
              >
                <Ionicons name="cash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.financeBtnText}>Tahsilat Ekle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.financeBtn, { backgroundColor: colors.primaryGlow, borderColor: colors.primary, borderWidth: 1, borderRadius: radius.button, flex: 1.5 }]}
                onPress={handleRenewPackage}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.financeBtnText, { color: colors.primary }]}>+20 Yenile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.noPackageCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
            <Text style={{ color: colors.textMuted }}>Aktif paket bulunamadı.</Text>
          </View>
        )}

        {/* Son Ölçümler Card */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={[styles.financeHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="body" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>Son Ölçümler</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ClientMetricsHistory', { client })}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Geçmişi Gör</Text>
            </TouchableOpacity>
          </View>
          
          {latestMetric ? (
            <View style={styles.badgeContainer}>
              {renderBadge('Kilo', latestMetric.weight, 'kg')}
              {renderBadge('Yağ', latestMetric.body_fat, '%')}
              {renderBadge('Göğüs', latestMetric.chest, 'cm')}
              {renderBadge('Bel', latestMetric.waist, 'cm')}
              {renderBadge('Omuz', latestMetric.shoulder, 'cm')}
              {renderBadge('Kol', latestMetric.biceps, 'cm')}
              {renderBadge('Kalça', latestMetric.hips, 'cm')}
              {renderBadge('Bacak', latestMetric.thigh, 'cm')}
              {renderBadge('Kalf', latestMetric.calf, 'cm')}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>Henüz ölçüm girilmemiş.</Text>
          )}

          <TouchableOpacity 
            style={[styles.financeBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]}
            onPress={() => setMetricModalVisible(true)}
          >
            <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.financeBtnText}>Yeni Ölçüm Gir</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Assignment Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 4 }]}>Danışan İşlemleri</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}
            onPress={() => setWorkoutModalVisible(true)}
          >
            <Ionicons name="barbell" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Antrenman Ata</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}
            onPress={() => setDietModalVisible(true)}
          >
            <Ionicons name="restaurant" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Diyet Ata</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Collect Payment Modal */}
      <Modal visible={paymentModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Tahsilat Ekle</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.fLabel, { color: colors.textMuted, marginBottom: 8 }]}>Kalan Borç: <Text style={{ color: colors.danger, fontWeight: '700' }}>{formatMoney(debt)}</Text></Text>
            
            <TextInput 
              style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button, fontSize: 18, fontWeight: '600' }]} 
              placeholder="Örn: 5000" 
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={paymentAmountStr} 
              onChangeText={setPaymentAmountStr} 
            />
            
            <TouchableOpacity 
              style={[styles.customSubmitBtn, { backgroundColor: colors.success, borderRadius: radius.button }]} 
              onPress={handleCollectPayment}
            >
              <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 16}}>Ödemeyi Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Metric 9-Point Modal */}
      <Modal visible={metricModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, height: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>9 Bölge Ölçüm Gir</Text>
              <TouchableOpacity onPress={() => setMetricModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.metricFormRow}>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Kilo (kg)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.weight} onChangeText={t => setMetricForm({...metricForm, weight: t})} />
                </View>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Boy (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.height} onChangeText={t => setMetricForm({...metricForm, height: t})} />
                </View>
              </View>

              <View style={styles.metricFormRow}>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Yağ Oranı (%)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.body_fat} onChangeText={t => setMetricForm({...metricForm, body_fat: t})} />
                </View>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Omuz (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.shoulder} onChangeText={t => setMetricForm({...metricForm, shoulder: t})} />
                </View>
              </View>

              <View style={styles.metricFormRow}>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Göğüs (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.chest} onChangeText={t => setMetricForm({...metricForm, chest: t})} />
                </View>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Kol (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.biceps} onChangeText={t => setMetricForm({...metricForm, biceps: t})} />
                </View>
              </View>

              <View style={styles.metricFormRow}>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Bel (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.waist} onChangeText={t => setMetricForm({...metricForm, waist: t})} />
                </View>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Kalça (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.hips} onChangeText={t => setMetricForm({...metricForm, hips: t})} />
                </View>
              </View>

              <View style={styles.metricFormRow}>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Üst Bacak (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.thigh} onChangeText={t => setMetricForm({...metricForm, thigh: t})} />
                </View>
                <View style={styles.metricFormInput}>
                  <Text style={[styles.fLabel, { color: colors.textMuted }]}>Kalf (cm)</Text>
                  <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} keyboardType="numeric" value={metricForm.calf} onChangeText={t => setMetricForm({...metricForm, calf: t})} />
                </View>
              </View>

              <Text style={[styles.fLabel, { color: colors.textMuted }]}>Antrenör Notu (Opsiyonel)</Text>
              <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button, height: 80 }]} multiline value={metricForm.notes} onChangeText={t => setMetricForm({...metricForm, notes: t})} />

              <TouchableOpacity style={[styles.customSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button, marginTop: 10, marginBottom: 40 }]} onPress={handleAddMetric}>
                <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 16}}>Ölçümleri Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal visible={workoutModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Antrenman Şablonu Ata</Text>
            <ScrollView>
              {WORKOUT_TYPES.map(w => (
                <TouchableOpacity key={w} style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={() => handleAssign('Antrenman', w)}>
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{w}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.customLabel, { color: colors.textMuted }]}>Veya özel isim girin:</Text>
              <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} placeholder="Özel antrenman..." placeholderTextColor={colors.textMuted} value={customText} onChangeText={setCustomText} />
              <TouchableOpacity style={[styles.customSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]} onPress={() => handleAssign('Antrenman', customText || 'Özel Antrenman')}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setWorkoutModalVisible(false)}>
              <Text style={styles.closeModalText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Diet Modal */}
      <Modal visible={dietModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Beslenme Şablonu Ata</Text>
            <ScrollView>
              {DIET_TYPES.map(d => (
                <TouchableOpacity key={d} style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={() => handleAssign('Beslenme', d)}>
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{d}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.customLabel, { color: colors.textMuted }]}>Veya özel isim girin:</Text>
              <TextInput style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]} placeholder="Özel diyet..." placeholderTextColor={colors.textMuted} value={customText} onChangeText={setCustomText} />
              <TouchableOpacity style={[styles.customSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]} onPress={() => handleAssign('Beslenme', customText || 'Özel Diyet')}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDietModalVisible(false)}>
              <Text style={styles.closeModalText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { padding: 20, borderWidth: 1, marginBottom: 16 },
  clientName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  clientGoal: { fontSize: 14, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  
  financeCard: { padding: 20, borderWidth: 1, marginBottom: 16 },
  financeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  financeMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  fMetric: { flex: 1, alignItems: 'center' },
  fLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  fValue: { fontSize: 16, fontWeight: '700' },
  financeActions: { flexDirection: 'row', gap: 12 },
  financeBtn: { flexDirection: 'row', paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  financeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  miniBadge: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  miniBadgeLabel: { fontSize: 11, fontWeight: '600' },
  miniBadgeValue: { fontSize: 13, fontWeight: '800' },

  metricFormRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricFormInput: { flex: 1 },

  noPackageCard: { padding: 20, borderWidth: 1, alignItems: 'center', marginBottom: 20 },

  actionsContainer: { flexDirection: 'row', gap: 16 },
  actionButton: { flex: 1, paddingVertical: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontWeight: '600', fontSize: 14 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 15, fontWeight: '500' },
  customLabel: { marginTop: 20, marginBottom: 8, fontSize: 13 },
  customInput: { borderWidth: 1, padding: 14, marginBottom: 4 },
  customSubmitBtn: { padding: 14, alignItems: 'center', marginBottom: 10 },
  closeModalBtn: { paddingVertical: 16, alignItems: 'center' },
  closeModalText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
