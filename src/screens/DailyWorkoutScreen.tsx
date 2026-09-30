import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Workout, WorkoutExercise, WorkoutExerciseSetData } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { formatDisplayDate, toISODate } from '../utils/date';

export const DailyWorkoutScreen = () => {
  const { colors, isDark, radius } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  
  // Stopwatch
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeWorkout && activeWorkout.status !== 'completed') {
      if (!startTime) {
        setStartTime(Date.now());
      }
      interval = setInterval(() => {
        if (startTime) {
          setElapsedSecs(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeWorkout, startTime]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      let clientId = 'client-1';
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) clientId = user.id;
      }
      const data = await api.getWorkouts(clientId);
      setWorkouts(data);
      
      const today = new Date().toISOString().split('T')[0];
      const todayW = data.find(w => toISODate(w.date) === today) || data[0];
      if (todayW) {
        setActiveWorkout(todayW);
        if (todayW.status === 'completed') {
          // No stopwatch if completed
          setStartTime(null);
          setElapsedSecs(0);
        } else {
          setStartTime(Date.now());
          setElapsedSecs(0);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutExerciseSetData, value: string | boolean) => {
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises?.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      const updatedSets = [...(ex.setsData || [])];
      const currentSet = { ...updatedSets[setIndex] };
      
      if (field === 'is_completed') {
        currentSet.is_completed = value as boolean;
      } else if (field === 'weight_kg') {
        currentSet.weight_kg = parseFloat(value as string) || 0;
      } else if (field === 'reps') {
        currentSet.reps = parseInt(value as string, 10) || 0;
      }
      
      updatedSets[setIndex] = currentSet;
      return { ...ex, setsData: updatedSets };
    });

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    try {
      setSaving(true);
      await api.updateWorkoutProgress(activeWorkout.id, activeWorkout.exercises || [], elapsedSecs);
      Alert.alert('Tebrikler!', 'Antrenman başarıyla tamamlandı.');
      setActiveWorkout({ ...activeWorkout, status: 'completed' });
      setStartTime(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Antrenman kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activeWorkout) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="cafe-outline" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text, textAlign: 'center', marginBottom: 12 }]}>Dinlenme Günü</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, textAlign: 'center', lineHeight: 24 }]}>Bugün için atanmış bir antrenman programınız bulunmuyor. Kaslarınızı dinlendirin ve beslenmenize dikkat edin!</Text>
      </View>
    );
  }

  // Calculate Volume
  let totalVolume = 0;
  activeWorkout.exercises?.forEach(ex => {
    ex.setsData?.forEach(s => {
      if (s.is_completed) {
        totalVolume += (s.weight_kg * s.reps);
      }
    });
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} dk ${s} sn`;
  };

  const formatDate = (dateStr: string) => {
    return formatDisplayDate(dateStr);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Top Banner: Volume & Time */}
      <View style={[styles.bannerContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.bannerItem}>
          <Ionicons name="barbell-outline" size={24} color={colors.primary} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.bannerLabel, { color: colors.textMuted }]}>Toplam Hacim</Text>
            <Text style={[styles.bannerValue, { color: colors.text }]}>{totalVolume} kg</Text>
          </View>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Ionicons name="stopwatch-outline" size={24} color={colors.primary} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.bannerLabel, { color: colors.textMuted }]}>Süre</Text>
            <Text style={[styles.bannerValue, { color: colors.text }]}>
              {activeWorkout.status === 'completed' ? 'Tamamlandı' : formatTime(elapsedSecs)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{activeWorkout.title || "Bugünün Antrenmanı"}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{formatDate(activeWorkout.date)}</Text>
        </View>

        {activeWorkout.exercises?.map((ex, exIndex) => (
          <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.card }]}>
            <View style={styles.exerciseCardHeader}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>{exIndex + 1}. {ex.exercise_name}</Text>
            </View>
            
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.tableHeaderText, { flex: 0.5, color: colors.textMuted }]}>Set</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textMuted }]}>kg</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, color: colors.textMuted }]}>Tekrar</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5, textAlign: 'center', color: colors.textMuted }]}>✓</Text>
            </View>

            {/* Table Rows */}
            {ex.setsData?.map((setRow, sIndex) => (
              <View key={sIndex} style={[styles.tableRow, { backgroundColor: setRow.is_completed ? (isDark ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9') : 'transparent' }]}>
                <Text style={[styles.tableCellText, { flex: 0.5, color: colors.text }]}>{setRow.set_number}</Text>
                
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    keyboardType="numeric"
                    value={setRow.weight_kg.toString()}
                    onChangeText={(val) => updateSet(ex.id, sIndex, 'weight_kg', val)}
                    editable={activeWorkout.status !== 'completed'}
                  />
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    keyboardType="numeric"
                    value={setRow.reps.toString()}
                    onChangeText={(val) => updateSet(ex.id, sIndex, 'reps', val)}
                    editable={activeWorkout.status !== 'completed'}
                  />
                </View>

                <View style={{ flex: 0.5, alignItems: 'center' }}>
                  <TouchableOpacity 
                    style={[styles.checkbox, setRow.is_completed && styles.checkboxActive]} 
                    onPress={() => activeWorkout.status !== 'completed' && updateSet(ex.id, sIndex, 'is_completed', !setRow.is_completed)}
                    disabled={activeWorkout.status === 'completed'}
                  >
                    {setRow.is_completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {activeWorkout.status !== 'completed' && (
          <TouchableOpacity 
            style={[styles.finishButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}
            onPress={finishWorkout}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.finishButtonText}>Antrenmanı Bitir</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  bannerContainer: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, alignItems: 'center' },
  bannerItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bannerDivider: { width: 1, height: '80%', backgroundColor: '#444', marginHorizontal: 10 },
  bannerLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  bannerValue: { fontSize: 18, fontWeight: 'bold' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: 4 },
  exerciseCard: { borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  exerciseCardHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  exerciseName: { fontSize: 18, fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1 },
  tableHeaderText: { fontSize: 13, fontWeight: '600' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  tableCellText: { fontSize: 16, fontWeight: '500' },
  inputField: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, textAlign: 'center' },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  finishButton: { padding: 16, alignItems: 'center', marginTop: 10 },
  finishButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
