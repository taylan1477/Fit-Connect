import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Workout, WorkoutExercise } from '../types';

export const DailyWorkoutScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      let clientId = 'client-1'; // fallback
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) clientId = user.id;
      }
      const data = await api.getWorkouts(clientId);
      setWorkouts(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (exercise: WorkoutExercise) => {
    try {
      // optimistic update
      setWorkouts(current => current.map(w => ({
        ...w,
        exercises: w.exercises?.map(ex => ex.id === exercise.id ? { ...ex, is_completed: !ex.is_completed } : ex)
      })));
      await api.markExerciseCompleted(exercise.id, !exercise.is_completed);
    } catch (e) {
      // revert on error
      loadWorkouts();
    }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Yükleniyor...</Text>
      </View>
    );
  }

  const todayWorkout = workouts.find(w => w.date === new Date().toISOString().split('T')[0]) || workouts[0];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {todayWorkout ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{todayWorkout.title || "Bugünün Antrenmanı"}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{todayWorkout.date}</Text>
            </View>

            {todayWorkout.exercises?.map((ex) => (
              <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, { color: ex.is_completed ? colors.textMuted : colors.text, textDecorationLine: ex.is_completed ? 'line-through' : 'none' }]}>{ex.exercise_name}</Text>
                  <Text style={styles.exerciseDetails}>{ex.sets} sets x {ex.reps} {ex.weight_kg ? `| ${ex.weight_kg}kg` : ''}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.checkbox, ex.is_completed && styles.checkboxActive]} 
                  onPress={() => toggleComplete(ex)}
                >
                  {ex.is_completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.finishButton}>
              <Text style={styles.finishButtonText}>Antrenmanı Bitir</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Program Yok</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Bugün için atanmış bir antrenman bulunmuyor.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  exerciseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 18, fontWeight: 'bold' },
  exerciseDetails: { fontSize: 14, color: '#059669', marginTop: 4, fontWeight: '500' },
  checkbox: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  checkboxActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  finishButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
