import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { TanitaReport } from '../types';

export const MyMetricsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [metrics, setMetrics] = useState({
    weight: '75',
    height: '180',
    gender: 'Male',
    name: 'John Doe',
    birthDate: new Date('1990-01-01'),
    bodyFat: '15',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Tanita Vault State
  const [tanitaReports, setTanitaReports] = useState<TanitaReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTanitaReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.getTanitaReports('1'); // Default client ID
      setTanitaReports(data || []);
    } catch (err) {
      console.warn('Tanita raporları alınamadı:', err);
    } finally {
      setLoadingReports(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTanitaReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTanitaReports();
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

  const handleSave = () => {
    Alert.alert('Kaydedildi 🎉', 'Profil ve vücut ölçümleriniz başarıyla güncellendi.');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setMetrics({ ...metrics, birthDate: selectedDate });
  };

  // BMI Calculation
  const heightM = parseFloat(metrics.height) / 100;
  const weightKg = parseFloat(metrics.weight);
  const bmi = heightM > 0 && weightKg > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '-';

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profil & Ölçümlerim</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Vücut kompozisyonu ve klinik Tanita raporları
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Tanita Klinik Vücut Analiz Raporları (PDF Vault) */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithIcon}>
              <View style={[styles.iconCircle, { backgroundColor: '#E5393520' }]}>
                <Ionicons name="document-text" size={18} color="#E53935" />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Tanita Klinik Raporları</Text>
                <Text style={[styles.cardSubText, { color: colors.textMuted }]}>
                  PDF Vücut Analiz Arşivi
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: '#E5393515' }]}>
              <Text style={[styles.badgeText, { color: '#E53935' }]}>
                {tanitaReports.length} Belge
              </Text>
            </View>
          </View>

          {loadingReports ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Raporlar yükleniyor...</Text>
            </View>
          ) : tanitaReports.length > 0 ? (
            <View style={styles.tanitaList}>
              {tanitaReports.map((report) => (
                <View
                  key={report.id}
                  style={[styles.tanitaItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.tanitaTopRow}>
                    <View style={styles.pdfPill}>
                      <Ionicons name="document" size={12} color="#FFFFFF" />
                      <Text style={styles.pdfPillText}>PDF</Text>
                    </View>
                    <Text style={[styles.tanitaDate, { color: colors.textMuted }]}>
                      📅 {report.date}
                    </Text>
                    {report.file_size ? (
                      <Text style={[styles.tanitaSize, { color: colors.textMuted }]}>
                        {report.file_size}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={[styles.tanitaFileName, { color: colors.text }]} numberOfLines={1}>
                    {report.file_name}
                  </Text>

                  {report.clinic_name ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="business-outline" size={13} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {report.clinic_name}
                      </Text>
                    </View>
                  ) : null}

                  {report.note ? (
                    <View style={[styles.noteBox, { backgroundColor: isDark ? '#262626' : '#F3F4F6' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.primary} />
                      <Text style={[styles.noteText, { color: colors.text }]}>
                        {report.note}
                      </Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.openReportBtn, { backgroundColor: '#E53935' }]}
                    onPress={() => handleOpenReport(report)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.openReportBtnText}>Görüntüle / Paylaş</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyVaultBox}>
              <Ionicons name="folder-open-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyVaultTitle, { color: colors.text }]}>
                Henüz Klinik Rapor Yok
              </Text>
              <Text style={[styles.emptyVaultDesc, { color: colors.textMuted }]}>
                Antrenörünüz Tanita vücut analizi PDF raporunuzu yüklediğinde bu arşivde güvenle listelenecektir.
              </Text>
            </View>
          )}
        </View>

        {/* BMI & Quick Stats Banner */}
        <View style={[styles.statsBanner, { backgroundColor: isDark ? '#1F2937' : '#EFF6FF', borderColor: colors.border }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{metrics.weight} kg</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Kilo</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{metrics.bodyFat}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Yağ Oranı</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{bmi}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>BMI İndeksi</Text>
          </View>
        </View>

        {/* Body Metrics Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Vücut Ölçümleri</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Kilo (kg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#262626' : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
              value={metrics.weight}
              keyboardType="numeric"
              onChangeText={(t) => setMetrics({ ...metrics, weight: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Boy (cm)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#262626' : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
              value={metrics.height}
              keyboardType="numeric"
              onChangeText={(t) => setMetrics({ ...metrics, height: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Yağ Oranı (%)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#262626' : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
              value={metrics.bodyFat}
              keyboardType="numeric"
              onChangeText={(t) => setMetrics({ ...metrics, bodyFat: t })}
            />
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Kişisel Bilgiler</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Ad Soyad</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#262626' : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
              value={metrics.name}
              onChangeText={(t) => setMetrics({ ...metrics, name: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Cinsiyet</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#262626' : '#F3F4F6', borderColor: colors.border }]}>
              <Picker
                selectedValue={metrics.gender}
                onValueChange={(v) => setMetrics({ ...metrics, gender: v })}
                style={{ color: colors.text }}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Erkek" value="Male" color={isDark ? '#FFF' : '#000'} />
                <Picker.Item label="Kadın" value="Female" color={isDark ? '#FFF' : '#000'} />
                <Picker.Item label="Diğer" value="Other" color={isDark ? '#FFF' : '#000'} />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Doğum Tarihi</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: isDark ? '#262626' : '#F3F4F6', borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ fontSize: 15, color: colors.text }}>
                {metrics.birthDate.toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={metrics.birthDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.saveButtonText}>Ölçümleri Güncelle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSubText: { fontSize: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { fontSize: 13 },
  tanitaList: {
    gap: 12,
  },
  tanitaItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tanitaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  pdfPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  pdfPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tanitaDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  tanitaSize: {
    fontSize: 11,
  },
  tanitaFileName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    fontStyle: 'italic',
  },
  openReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  openReportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyVaultBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  emptyVaultTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyVaultDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, justifyContent: 'center', fontSize: 15 },
  pickerContainer: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
