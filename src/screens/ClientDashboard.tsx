import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTodayDisplayDate } from '../utils/date';
import { api } from '../services/api';
import { Package, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export const ClientDashboard = ({ navigation }: any) => {
  const { colors, radius, isDark, getStatusColor } = useTheme();
  const insets = useSafeAreaInsets();
  const today = getTodayDisplayDate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientPackage, setClientPackage] = useState<Package | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<UserProfile | null>(null);

  const loadData = useCallback(async () => {
    try {
      let clientId = '1';
      let trainerId = 'trainer-1';

      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          clientId = user.id;
          const profile = await api.getProfile(user.id);
          if (profile?.trainer_id) {
            trainerId = profile.trainer_id;
          }
        }
      }

      const [pkg, trainer] = await Promise.all([
        api.getClientPackage(clientId),
        api.getProfile(trainerId),
      ]);

      setClientPackage(pkg);
      setTrainerProfile(trainer);
    } catch (error) {
      console.warn('Error loading client dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenTrainerWhatsApp = () => {
    const phone = trainerProfile?.phone;
    if (!phone) {
      Alert.alert('Bilgi', 'Antrenörünüzün telefon numarası kayıtlı değil.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'WhatsApp uygulaması açılamadı. Cihazınızda WhatsApp yüklü olduğundan emin olun.');
    });
  };

  const handleOpenTrainerPhone = () => {
    const phone = trainerProfile?.phone;
    if (!phone) {
      Alert.alert('Bilgi', 'Antrenörünüzün telefon numarası kayıtlı değil.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'Arama başlatılamadı.');
    });
  };

  const remaining = clientPackage?.remaining_sessions ?? 0;
  const total = clientPackage?.total_sessions || 20;
  const progressRatio = Math.min(100, Math.max(0, (remaining / total) * 100));
  const statusInfo = getStatusColor(remaining);

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#064E3B', '#047857'] : ['#0F766E', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.appTitle}>Fit-Connect Pro</Text>
            <Text style={styles.screenTitle}>Ana Sayfa</Text>
            <Text style={styles.dateText}>📅 {today}</Text>
          </View>

          {/* Greeting Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>Tekrar hoş geldin, Şampiyon! 🏃‍♂️</Text>
            <Text style={[styles.summaryText, { color: colors.textMuted }]}>
              Bugün için planlanmış antrenman ve öğünlerin hazır. Hedeflerine kararlılıkla devam et!
            </Text>
          </View>

          {/* Active Package & Session Progress Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="barbell-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Seans Durumu</Text>
              </View>
              {clientPackage && (
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                  <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              )}
            </View>

            {clientPackage ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text }}>{remaining}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textMuted, marginLeft: 6 }}>
                    / {total} Seans Kaldı
                  </Text>
                </View>

                {/* 6px Linear Progress Bar */}
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <View 
                    style={{ 
                      height: 6, 
                      width: `${progressRatio}%`, 
                      backgroundColor: '#FF6B00', 
                      borderRadius: 3 
                    }} 
                  />
                </View>
                <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'right' }}>
                  %{Math.round(progressRatio)} kalan hak
                </Text>
              </>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Aktif paket bilginiz yüklenemedi.</Text>
            )}
          </View>

          {/* Trainer Quick Communication Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>ÖZEL ANTRENÖRÜNÜZ</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 }}>
                  {trainerProfile?.full_name || 'Serhat Hoca'}
                </Text>
              </View>
              <View style={[styles.trainerAvatar, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="person" size={22} color={colors.primary} />
              </View>
            </View>

            <View style={styles.quickActionRow}>
              <TouchableOpacity 
                style={[styles.quickActionBtn, { backgroundColor: '#25D36618', borderColor: '#25D366' }]} 
                onPress={handleOpenTrainerWhatsApp}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={{ marginRight: 6 }} />
                <Text style={[styles.quickActionText, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionBtn, { backgroundColor: '#2196F318', borderColor: '#2196F3' }]} 
                onPress={handleOpenTrainerPhone}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={17} color="#2196F3" style={{ marginRight: 6 }} />
                <Text style={[styles.quickActionText, { color: '#2196F3' }]}>Ara</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QR Session Confirmation Action */}
          <View style={[styles.actionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Salona Giriş & Seans Onayı</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
              Antrenmana hazır mısın? Seansını onaylamak ve paketinden düşmek için antrenörünün QR kodunu okut.
            </Text>
            
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Text style={styles.scanButtonText}>📸 Seans QR Kodu Tara</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  headerTextContainer: { marginBottom: 24 },
  appTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  screenTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  dateText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  card: { borderRadius: 24, padding: 22, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, marginBottom: 18 },
  greeting: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  summaryText: { fontSize: 15, lineHeight: 22 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  trainerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickActionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickActionText: { fontSize: 13, fontWeight: '700' },
  actionCard: { borderRadius: 24, padding: 24, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, alignItems: 'center', marginBottom: 20 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  actionSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  scanButton: { backgroundColor: '#10B981', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
