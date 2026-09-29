import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { ClientMetric } from '../types';

export const ClientMetricsHistoryScreen = ({ route }: any) => {
  const { client } = route.params;
  const { colors, radius } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<ClientMetric[]>([]);

  const loadData = async () => {
    try {
      // api.getMetrics returns ordered by date DESC
      const data = await api.getMetrics(client.id);
      setMetrics(data);
    } catch (error) {
      console.warn('Error loading metrics history:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Render a single field row with change logic
  const renderField = (label: string, currentValue?: number, previousValue?: number, unit: string = 'cm') => {
    if (currentValue == null) return null;

    let diffText = null;
    let diffColor = colors.textMuted;

    if (previousValue != null) {
      const diff = currentValue - previousValue;
      if (diff > 0) {
        diffText = `+${diff.toFixed(1)}`;
        // For weight/fat/measurements, gaining might be bad or good depending on goal, but let's use standard colors.
        // Actually, we'll just use primary for positive, and warning for negative, or just textMuted.
        // In fitness, let's use colors.warning for +, colors.success for - (assuming fat loss)
        // A neutral colorful approach is better:
        diffColor = diff > 0 ? colors.danger : colors.success; 
      } else if (diff < 0) {
        diffText = `${diff.toFixed(1)}`;
        diffColor = colors.success;
      } else {
        diffText = 'Değişmedi';
      }
    }

    return (
      <View style={styles.row}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
        <View style={styles.valueContainer}>
          {diffText && <Text style={[styles.diffText, { color: diffColor }]}>{diffText} {diffText !== 'Değişmedi' ? unit : ''}</Text>}
          <Text style={[styles.currentValue, { color: colors.text }]}>{currentValue.toFixed(1)} {unit}</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing && metrics.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={{ marginBottom: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>Ölçüm Geçmişi</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{client.full_name || client.name}</Text>
      </View>

      {metrics.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
          <Ionicons name="body-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz girilmiş bir ölçüm bulunmuyor.</Text>
        </View>
      ) : (
        metrics.map((metric, index) => {
          // Since array is DESC (newest first), the "previous" measurement chronologically is at index + 1
          const prevMetric = index < metrics.length - 1 ? metrics[index + 1] : null;

          return (
            <View key={metric.id} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
              <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="calendar" size={18} color={colors.primary} />
                <Text style={[styles.dateText, { color: colors.primary }]}>{formatDate(metric.date)}</Text>
              </View>

              <View style={styles.fieldsContainer}>
                {renderField('Kilo', metric.weight, prevMetric?.weight, 'kg')}
                {renderField('Yağ Oranı', metric.body_fat, prevMetric?.body_fat, '%')}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                {renderField('Omuz', metric.shoulder, prevMetric?.shoulder)}
                {renderField('Göğüs', metric.chest, prevMetric?.chest)}
                {renderField('Kol / Pazu', metric.biceps, prevMetric?.biceps)}
                {renderField('Bel', metric.waist, prevMetric?.waist)}
                {renderField('Kalça', metric.hips, prevMetric?.hips)}
                {renderField('Üst Bacak', metric.thigh, prevMetric?.thigh)}
                {renderField('Kalf', metric.calf, prevMetric?.calf)}
              </View>

              {metric.notes && (
                <View style={[styles.notesContainer, { backgroundColor: colors.background, borderRadius: radius.badge }]}>
                  <Text style={[styles.notesLabel, { color: colors.textMuted }]}>Antrenör Notu:</Text>
                  <Text style={[styles.notesText, { color: colors.text }]}>{metric.notes}</Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  
  emptyCard: { padding: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '500' },

  metricCard: { borderWidth: 1, marginBottom: 20, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 16 },
  dateText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },

  fieldsContainer: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  valueContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentValue: { fontSize: 16, fontWeight: '700', minWidth: 60, textAlign: 'right' },
  diffText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 4 },

  notesContainer: { marginTop: 16, padding: 12 },
  notesLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  notesText: { fontSize: 14, fontWeight: '500' }
});
