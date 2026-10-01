import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, TextInput, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Package, ClientMetric, TanitaReport, WorkoutTemplate, Workout, NutritionTemplate, Diet } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { formatDisplayDate, getTodayDisplayDate, toISODate } from '../utils/date';



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
  const [tanitaModalVisible, setTanitaModalVisible] = useState(false);
  
  const [customText, setCustomText] = useState('');
  const [paymentAmountStr, setPaymentAmountStr] = useState('');

  // Quick Communication & Phone State
  const [clientPhone, setClientPhone] = useState(client.phone || '');
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [tempPhone, setTempPhone] = useState(client.phone || '');

  // Tanita Reports Vault State
  const [tanitaReports, setTanitaReports] = useState<TanitaReport[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [clientWorkouts, setClientWorkouts] = useState<Workout[]>([]);
  const [assignDate, setAssignDate] = useState(getTodayDisplayDate());
  const [selectedDocument, setSelectedDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [tanitaForm, setTanitaForm] = useState({
    date: getTodayDisplayDate(),
    clinic_name: '',
    note: '',
  });
  const [uploadingReport, setUploadingReport] = useState(false);

  // 9-Point Metric Form State
  const [metricForm, setMetricForm] = useState({
    weight: '', height: '', body_fat: '',
    shoulder: '', chest: '', biceps: '',
    waist: '', hips: '', thigh: '', calf: '', notes: ''
  });

  // Nutrition & Diet State
  const [nutritionTemplates, setNutritionTemplates] = useState<NutritionTemplate[]>([]);
  const [clientDiet, setClientDiet] = useState<Diet | null>(null);

  const loadData = async () => {
    try {
      let currentTrainerId = 'trainer-1';
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) currentTrainerId = user.id;
      }
      
      const [pkg, metricsData, reportsData, templatesData, workoutsData, nTemplatesData, dietData, clientProfile] = await Promise.all([
        api.getClientPackage(client.id),
        api.getMetrics(client.id),
        api.getTanitaReports(client.id),
        api.getWorkoutTemplates(currentTrainerId),
        api.getWorkouts(client.id),
        api.getNutritionTemplates(currentTrainerId),
        api.getLatestDiet(client.id),
        api.getProfile(client.id),
      ]);
      setActivePackage(pkg);
      if (metricsData && metricsData.length > 0) {
        setLatestMetric(metricsData[0]); // newest is first
      }
      if (clientProfile?.phone) {
        setClientPhone(clientProfile.phone);
      }
      setTanitaReports(reportsData || []);
      setWorkoutTemplates(templatesData || []);
      setClientWorkouts(workoutsData || []);
      setNutritionTemplates(nTemplatesData || []);
      setClientDiet(dietData || null);
    } catch (error) {
      console.warn('Error loading client detail data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAssignNutritionTemplate = async (template: NutritionTemplate) => {
    try {
      setLoading(true);
      const assigned = await api.assignNutritionPlan(client.id, {
        trainer_id: 'trainer-1',
        date: getTodayDisplayDate(),
        target_calories: template.target_calories,
        target_protein_g: template.target_protein_g,
        target_carbs_g: template.target_carbs_g,
        target_fat_g: template.target_fat_g,
        meals: template.meals.map(m => ({ ...m, is_completed: false })),
        trainer_notes: 'Öğün saatlerine uymaya ve yeterli su tüketmeye özen göster.',
      });
      setClientDiet(assigned);
      setDietModalVisible(false);
      Alert.alert('Başarılı', `"${template.title}" beslenme planı danışana başarıyla atandı.`);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Diyet atanamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDocument(result.assets[0]);
      }
    } catch (err) {
      console.warn('Error picking document:', err);
    }
  };

  const handleOpenReport = async (report: TanitaReport) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && report.file_url.startsWith('file://')) {
        await Sharing.shareAsync(report.file_url, {
          mimeType: 'application/pdf',
          dialogTitle: `${report.file_name} Görüntüle`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        const canOpen = await Linking.canOpenURL(report.file_url);
        if (canOpen) {
          await Linking.openURL(report.file_url);
        } else {
          Alert.alert(
            'Tanita Klinik Raporu',
            `Klinik: ${report.clinic_name || 'Tanita Analizi'}\nTarih: ${report.date}\nDosya: ${report.file_name}\nNot: ${report.note || 'Özel not girilmemiş.'}`
          );
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Tanita Klinik Raporu',
        `Klinik: ${report.clinic_name || 'Tanita Analizi'}\nTarih: ${report.date}\nDosya: ${report.file_name}\nNot: ${report.note || 'Özel not girilmemiş.'}`
      );
    }
  };

  const handleSaveTanitaReport = async () => {
    if (!selectedDocument && !tanitaForm.clinic_name) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir PDF dosyası seçin veya klinik/analiz adı girin.');
      return;
    }

    try {
      setUploadingReport(true);
      const isoDate = toISODate(tanitaForm.date);
      const newReport: Omit<TanitaReport, 'id' | 'created_at'> = {
        client_id: client.id,
        trainer_id: 'trainer-1',
        date: isoDate,
        file_name: selectedDocument ? selectedDocument.name : `${client.full_name || client.name || 'Danisan'}_Tanita_Raporu_${isoDate}.pdf`,
        file_url: selectedDocument ? selectedDocument.uri : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        clinic_name: tanitaForm.clinic_name || 'Klinik Vücut Analizi',
        file_size: selectedDocument?.size ? `${(selectedDocument.size / (1024 * 1024)).toFixed(1)} MB` : '1.1 MB',
        note: tanitaForm.note,
      };

      await api.addTanitaReport(newReport);
      Alert.alert('Başarılı 🎉', 'Tanita klinik raporu arşive eklendi.');
      setTanitaModalVisible(false);
      setSelectedDocument(null);
      setTanitaForm({ date: getTodayDisplayDate(), clinic_name: '', note: '' });
      await loadData();
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Rapor eklenemedi.');
    } finally {
      setUploadingReport(false);
    }
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

  const handleOpenWhatsApp = () => {
    if (!clientPhone) {
      setTempPhone('');
      setPhoneModalVisible(true);
      return;
    }
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'WhatsApp uygulaması açılamadı. Cihazınızda WhatsApp yüklü olduğundan emin olun.');
    });
  };

  const handleOpenPhone = () => {
    if (!clientPhone) {
      setTempPhone('');
      setPhoneModalVisible(true);
      return;
    }
    const cleanPhone = clientPhone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'Arama başlatılamadı.');
    });
  };

  const handleOpenSMS = () => {
    if (!clientPhone) {
      setTempPhone('');
      setPhoneModalVisible(true);
      return;
    }
    const cleanPhone = clientPhone.replace(/[^0-9+]/g, '');
    const url = `sms:${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'SMS uygulaması açılamadı.');
    });
  };

  const handleSavePhone = async () => {
    if (!tempPhone.trim()) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir telefon numarası girin.');
      return;
    }
    try {
      setLoading(true);
      await api.updateClientPhone(client.id, tempPhone.trim());
      setClientPhone(tempPhone.trim());
      client.phone = tempPhone.trim();
      setPhoneModalVisible(false);
      Alert.alert('Başarılı', 'Telefon numarası güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Telefon numarası kaydedilemedi.');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    return formatDisplayDate(dateStr);
  };

  const handleSaveAsTemplate = async (workout: Workout) => {
    try {
      setLoading(true);
      await api.createWorkoutTemplate({
        trainer_id: workout.trainer_id || 'trainer-1',
        title: `${workout.title} (Kopya)`,
        target_focus: 'Karma',
        description: `${client.full_name || client.name} kişisinden kaydedilen şablon`,
      }, (workout.exercises || []).map(ex => ({
        exercise_name: ex.exercise_name,
        order_index: ex.order_index || 0,
        default_sets: ex.sets || 3,
        default_reps: typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps || '10', 10) || 10,
        default_rest_sec: ex.rest_time_sec || 60,
      })));
      Alert.alert('Başarılı', 'Şablon başarıyla kütüphanenize eklendi.');
      await loadData();
    } catch (e) {
      Alert.alert('Hata', 'Şablon olarak kaydedilemedi.');
    } finally {
      setLoading(false);
    }
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.clientName, { color: colors.text }]}>{client.full_name || client.name}</Text>
              <Text style={[styles.clientGoal, { color: colors.textMuted }]}>{client.email}</Text>
              <TouchableOpacity 
                onPress={() => { setTempPhone(clientPhone); setPhoneModalVisible(true); }}
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={14} color={colors.primary} style={{ marginRight: 5 }} />
                <Text style={{ color: clientPhone ? colors.text : colors.textMuted, fontSize: 13, fontWeight: '500' }}>
                  {clientPhone || 'Telefon ekle'}
                </Text>
                <Ionicons name="pencil" size={13} color={colors.primary} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
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

        {/* Quick Communication Actions (WhatsApp, Ara, SMS) */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: '#25D36618', borderColor: '#25D366' }]} 
            onPress={handleOpenWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: '#2196F318', borderColor: '#2196F3' }]} 
            onPress={handleOpenPhone}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={17} color="#2196F3" style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: '#2196F3' }]}>Ara</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: '#AB47BC18', borderColor: '#AB47BC' }]} 
            onPress={handleOpenSMS}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={17} color="#AB47BC" style={{ marginRight: 6 }} />
            <Text style={[styles.quickActionText, { color: '#AB47BC' }]}>SMS</Text>
          </TouchableOpacity>
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

            {/* Session Progress Bar (PT-App Standard 6px Linear Progress) */}
            <View style={{ marginTop: 4, marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>Paket İlerlemesi</Text>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  {activePackage.remaining_sessions} / {activePackage.total_sessions || 20} Ders Kalan
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                <View 
                  style={{ 
                    height: 6, 
                    width: `${Math.min(100, Math.max(0, ((activePackage.remaining_sessions || 0) / (activePackage.total_sessions || 20)) * 100))}%`, 
                    backgroundColor: '#FF6B00', 
                    borderRadius: 3 
                  }} 
                />
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

        {/* Tanita & Klinik Analiz Raporları (PDF Vault) */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={[styles.financeHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="document-text" size={20} color="#E53935" />
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>
                Tanita & Klinik Raporlar
              </Text>
            </View>
            <View style={[styles.miniCountBadge, { backgroundColor: 'rgba(229, 57, 53, 0.15)' }]}>
              <Text style={{ color: '#E53935', fontSize: 12, fontWeight: '700' }}>
                {tanitaReports.length} Rapor
              </Text>
            </View>
          </View>

          {tanitaReports.length > 0 ? (
            <View style={styles.tanitaList}>
              {tanitaReports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={[styles.tanitaItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleOpenReport(report)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tanitaIconCol}>
                    <View style={styles.pdfBadge}>
                      <Ionicons name="document-attach" size={22} color="#E53935" />
                    </View>
                  </View>
                  <View style={styles.tanitaInfoCol}>
                    <View style={styles.tanitaHeaderRow}>
                      <Text style={[styles.tanitaClinic, { color: colors.text }]} numberOfLines={1}>
                        {report.clinic_name || 'Vücut Analizi'}
                      </Text>
                      <Text style={[styles.tanitaDate, { color: colors.textMuted }]}>{formatDate(report.date)}</Text>
                    </View>
                    <Text style={[styles.tanitaFileName, { color: colors.textMuted }]} numberOfLines={1}>
                      {report.file_name} {report.file_size ? `• ${report.file_size}` : ''}
                    </Text>
                    {report.note ? (
                      <Text style={[styles.tanitaNote, { color: colors.textMuted }]} numberOfLines={2}>
                        💬 {report.note}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.primary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
              Kayıtlı Tanita veya klinik PDF raporu bulunmuyor.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.financeBtn, { backgroundColor: '#E53935', borderRadius: radius.button, marginTop: 12 }]}
            onPress={() => setTanitaModalVisible(true)}
          >
            <Ionicons name="cloud-upload" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.financeBtnText}>Yeni PDF Raporu Yükle</Text>
          </TouchableOpacity>
        </View>

        {/* Atanmış Antrenmanlar */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={styles.financeHeader}>
            <Ionicons name="barbell-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>Atanmış Antrenmanlar</Text>
          </View>
          
          {clientWorkouts.length > 0 ? (
            <View style={styles.tanitaList}>
              {clientWorkouts.slice(0, 3).map((w) => (
                <View key={w.id} style={[styles.tanitaItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={[styles.pdfBadge, { backgroundColor: w.status === 'completed' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 107, 0, 0.15)' }]}>
                    <Ionicons name={w.status === 'completed' ? 'checkmark-circle' : 'time'} size={22} color={w.status === 'completed' ? '#4CAF50' : colors.primary} />
                  </View>
                  <View style={styles.tanitaInfoCol}>
                    <View style={styles.tanitaHeaderRow}>
                      <Text style={[styles.tanitaClinic, { color: colors.text }]} numberOfLines={1}>{w.title}</Text>
                      <Text style={[styles.tanitaDate, { color: colors.textMuted }]}>{formatDate(w.date)}</Text>
                    </View>
                    <Text style={[styles.tanitaFileName, { color: colors.textMuted }]} numberOfLines={1}>
                      {w.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
              Henüz atanmış bir antrenman bulunmuyor.
            </Text>
          )}
        </View>

        {/* Beslenme & Diyet Planı Kartı */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={styles.financeHeader}>
            <Ionicons name="restaurant-outline" size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>Beslenme & Diyet Planı</Text>
          </View>
          
          {clientDiet ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255, 107, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Ionicons name="flame" size={16} color="#FF6B00" />
                  <Text style={{ color: '#FF6B00', fontSize: 13, fontWeight: '700' }}>{clientDiet.target_calories} kcal / Gün</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
                  {clientDiet.meals?.length || 0} Saatli Öğün
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={[styles.macroBadge, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Text style={[styles.macroLabel, { color: '#3B82F6' }]}>PROTEİN</Text>
                  <Text style={[styles.macroValue, { color: '#3B82F6' }]}>{clientDiet.target_protein_g}g</Text>
                </View>
                <View style={[styles.macroBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Text style={[styles.macroLabel, { color: '#10B981' }]}>KARB</Text>
                  <Text style={[styles.macroValue, { color: '#10B981' }]}>{clientDiet.target_carbs_g}g</Text>
                </View>
                <View style={[styles.macroBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Text style={[styles.macroLabel, { color: '#F59E0B' }]}>YAĞ</Text>
                  <Text style={[styles.macroValue, { color: '#F59E0B' }]}>{clientDiet.target_fat_g}g</Text>
                </View>
              </View>

              {clientDiet.trainer_notes ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14, fontStyle: 'italic' }}>
                  💬 {clientDiet.trainer_notes}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[styles.financeBtn, { backgroundColor: '#10B981', borderRadius: radius.button, marginTop: 4 }]}
                onPress={() => setDietModalVisible(true)}
              >
                <Ionicons name="refresh" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.financeBtnText}>Planı Değiştir / Güncelle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 14 }}>
                Henüz bu danışana atanmış bir beslenme planı bulunmuyor.
              </Text>
              <TouchableOpacity
                style={[styles.financeBtn, { backgroundColor: '#10B981', borderRadius: radius.button }]}
                onPress={() => setDietModalVisible(true)}
              >
                <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.financeBtnText}>Şablondan Diyet Ata</Text>
              </TouchableOpacity>
            </View>
          )}
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
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}
            onPress={() => navigation.navigate('ProgressGallery', { clientId: client.id })}
          >
            <Ionicons name="images" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Gelişim Galerisi</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Collect Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setPaymentModalVisible(false)}
          />
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
      <Modal
        visible={metricModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMetricModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setMetricModalVisible(false)}
          />
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

      {/* Tanita Report Upload Modal */}
      <Modal
        visible={tanitaModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTanitaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setTanitaModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxHeight: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document-text" size={22} color="#E53935" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Tanita / Klinik Raporu Yükle</Text>
              </View>
              <TouchableOpacity onPress={() => setTanitaModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Document Picker Box */}
              <Text style={[styles.fLabel, { color: colors.textMuted }]}>PDF Dosyası Seç</Text>
              {selectedDocument ? (
                <View style={[styles.selectedDocBox, { backgroundColor: colors.background, borderColor: '#4CAF50' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedDocName, { color: colors.text }]} numberOfLines={1}>{selectedDocument.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {selectedDocument.size ? `${(selectedDocument.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF Belgesi'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handlePickDocument} style={styles.changeDocBtn}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.docPickerBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={handlePickDocument}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} style={{ marginBottom: 6 }} />
                  <Text style={[styles.docPickerTitle, { color: colors.text }]}>Cihazdan PDF Dosyası Seç</Text>
                  <Text style={[styles.docPickerSubtitle, { color: colors.textMuted }]}>Tanita, InBody veya tahlil çıktısı (.pdf)</Text>
                </TouchableOpacity>
              )}

              {/* Date Input */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Analiz Tarihi (GG-AA-YYYY)</Text>
                <TextInput
                  style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]}
                  placeholder="29-09-2026"
                  placeholderTextColor={colors.textMuted}
                  value={tanitaForm.date}
                  onChangeText={t => setTanitaForm({ ...tanitaForm, date: t })}
                />
              </View>

              {/* Clinic / Machine Name */}
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Klinik / Laboratuvar / Cihaz Adı</Text>
                <TextInput
                  style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button }]}
                  placeholder="Örn: Acıbadem Sports Tanita MC-780"
                  placeholderTextColor={colors.textMuted}
                  value={tanitaForm.clinic_name}
                  onChangeText={t => setTanitaForm({ ...tanitaForm, clinic_name: t })}
                />
              </View>

              {/* Trainer Notes */}
              <View style={{ marginTop: 12, marginBottom: 20 }}>
                <Text style={[styles.fLabel, { color: colors.textMuted }]}>Antrenör Klinik Değerlendirme Notu</Text>
                <TextInput
                  style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderRadius: radius.button, height: 80, textAlignVertical: 'top' }]}
                  placeholder="Örn: Visseral yağ seviyesi 4'e geriledi, kas kütlesi dengeli..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={tanitaForm.note}
                  onChangeText={t => setTanitaForm({ ...tanitaForm, note: t })}
                />
              </View>

              <TouchableOpacity
                style={[styles.customSubmitBtn, { backgroundColor: '#E53935', borderRadius: radius.button }]}
                onPress={handleSaveTanitaReport}
                disabled={uploadingReport}
              >
                {uploadingReport ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Raporu Arşive Kaydet</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal
        visible={workoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setWorkoutModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Antrenman Şablonu Ata</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textMuted, marginBottom: 8, fontSize: 14 }}>Hangi Tarih İçin? (GG-AA-YYYY)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={assignDate}
                onChangeText={setAssignDate}
                placeholder="GG-AA-YYYY"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {workoutTemplates.length > 0 ? workoutTemplates.map(w => (
                <TouchableOpacity key={w.id} style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={async () => {
                  try {
                    await api.assignTemplateToClient(w.id, client.id, toISODate(assignDate));
                    Alert.alert('Başarılı', `${w.title} şablonu atandı.`);
                    setWorkoutModalVisible(false);
                    setAssignDate(getTodayDisplayDate());
                    loadData(); // Refresh to show the assigned workout
                  } catch (e) {
                    Alert.alert('Hata', 'Şablon atanamadı.');
                  }
                }}>
                  <View>
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>{w.title}</Text>
                    {w.target_focus && <Text style={{ color: colors.primary, fontSize: 12 }}>{w.target_focus}</Text>}
                  </View>
                </TouchableOpacity>
              )) : (
                <Text style={{ color: colors.textMuted, textAlign: 'center', marginVertical: 20 }}>Kütüphanede şablon bulunmuyor. Şablon Kütüphanesi'nden yeni şablonlar ekleyebilirsiniz.</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setWorkoutModalVisible(false)}>
              <Text style={styles.closeModalText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Diet Modal */}
      <Modal
        visible={dietModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDietModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDietModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Beslenme Şablonu Ata</Text>
              <TouchableOpacity onPress={() => setDietModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 14 }}>
              Kütüphanenizden hazır bir makro şablonu seçip danışanın bugünkü planı olarak atayın:
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {nutritionTemplates.map(tmpl => (
                <TouchableOpacity
                  key={tmpl.id}
                  style={[styles.modalOption, { borderBottomColor: colors.border, paddingVertical: 14 }]}
                  onPress={() => handleAssignNutritionTemplate(tmpl)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.modalOptionText, { color: colors.text, fontWeight: '700' }]}>{tmpl.title}</Text>
                    <Text style={{ color: '#FF6B00', fontWeight: '800', fontSize: 13 }}>{tmpl.target_calories} kcal</Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                    🥩 {tmpl.target_protein_g}g P  •  🍚 {tmpl.target_carbs_g}g C  •  🥑 {tmpl.target_fat_g}g F  •  {tmpl.meals?.length || 0} Öğün
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.customSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button, marginTop: 14 }]}
              onPress={() => {
                setDietModalVisible(false);
                navigation.navigate('NutritionTemplates');
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+ Yeni Şablon Oluştur / Kütüphane</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDietModalVisible(false)}>
              <Text style={styles.closeModalText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Phone Number Modal */}
      <Modal visible={phoneModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Telefon Numarası</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
              Hızlı arama, WhatsApp ve SMS iletişimi için danışanın telefon numarasını girin.
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, marginBottom: 20 }]}
              placeholder="+90 5XX XXX XX XX"
              placeholderTextColor={colors.textMuted}
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.customSubmitBtn, { backgroundColor: colors.primary, borderRadius: radius.button }]}
              onPress={handleSavePhone}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPhoneModalVisible(false)}>
              <Text style={styles.closeModalText}>Vazgeç</Text>
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
  
  // Quick Actions (WhatsApp, Ara, SMS)
  quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: { fontSize: 13, fontWeight: '700' },
  
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

  miniCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tanitaList: { marginBottom: 8 },
  tanitaItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 10 },
  tanitaIconCol: { marginRight: 12 },
  pdfBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(229, 57, 53, 0.15)', alignItems: 'center', justifyContent: 'center' },
  tanitaInfoCol: { flex: 1 },
  tanitaHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  tanitaClinic: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  tanitaDate: { fontSize: 12, fontWeight: '500' },
  tanitaFileName: { fontSize: 12, marginBottom: 4 },
  tanitaNote: { fontSize: 12, lineHeight: 16 },

  docPickerBtn: { borderWidth: 1.5, borderStyle: 'dashed', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  docPickerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  docPickerSubtitle: { fontSize: 12 },
  selectedDocBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.5, borderRadius: 12, marginTop: 6 },
  selectedDocName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  changeDocBtn: { paddingHorizontal: 12, paddingVertical: 6 },

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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 15, fontWeight: '500' },
  customLabel: { marginTop: 20, marginBottom: 8, fontSize: 13 },
  customInput: { borderWidth: 1, padding: 14, marginBottom: 4 },
  customSubmitBtn: { padding: 14, alignItems: 'center', marginBottom: 10 },
  closeModalBtn: { paddingVertical: 16, alignItems: 'center' },
  closeModalText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },

  macroBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
});
