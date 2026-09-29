import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { api } from '../services/api';
import { Package } from '../types';
import { useTheme } from '../context/ThemeContext';

export const TrainerDashboard = ({ navigation }: any) => {
  const { colors, radius, isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingDebt, setPendingDebt] = useState(0);

  const fetchFinancials = async () => {
    try {
      let trainerId = 'trainer-1';
      let name = 'Serhat Özkan';

      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          trainerId = user.id;
          const profile = await api.getProfile(user.id);
          if (profile?.full_name) name = profile.full_name;
        }
      }

      setTrainerName(name);

      const packages = await api.getTrainerPackages(trainerId);
      
      let revenue = 0;
      let debt = 0;

      packages.forEach(pkg => {
        revenue += Number(pkg.paid_amount);
        const diff = Number(pkg.package_price) - Number(pkg.paid_amount);
        if (diff > 0) {
          debt += diff;
        }
      });

      setTotalRevenue(revenue);
      setPendingDebt(debt);
    } catch (error) {
      console.warn('Error fetching financials:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancials();
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textMuted }]}>Hoş geldin,</Text>
        <Text style={[styles.trainerName, { color: colors.text }]}>{trainerName || 'Antrenör'}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Finansal Durum</Text>
      
      <View style={styles.financeContainer}>
        {/* Total Revenue Card */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
            <Ionicons name="wallet" size={24} color={colors.success} />
          </View>
          <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Toplam Ciro</Text>
          <Text style={[styles.financeValue, { color: colors.success }]}>{formatMoney(totalRevenue)}</Text>
        </View>

        {/* Pending Debt Card */}
        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 160, 0, 0.15)' }]}>
            <Ionicons name="time" size={24} color={colors.warning} />
          </View>
          <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Bekleyen Alacak</Text>
          <Text style={[styles.financeValue, { color: colors.warning }]}>{formatMoney(pendingDebt)}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Hızlı İşlemler</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]} 
          onPress={() => navigation.navigate('ClientList')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={28} color={colors.primary} style={styles.actionIcon} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Danışanlarım</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]} 
          onPress={() => navigation.navigate('QRGenerator')}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code" size={28} color={colors.primary} style={styles.actionIcon} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Seans QR Üret</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  trainerName: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  financeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  financeCard: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  financeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 15,
  }
});
