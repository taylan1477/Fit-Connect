import { supabase } from '../utils/supabase';
import { User, ClientMetric, Package, Workout, WorkoutExercise, Diet, ProgressPhoto, Appointment } from '../types';

export const api = {
  // Users
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Metrics
  async getMetrics(clientId: string): Promise<ClientMetric[]> {
    const { data, error } = await supabase.from('client_metrics').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async addMetric(metric: Omit<ClientMetric, 'id'>) {
    const { data, error } = await supabase.from('client_metrics').insert(metric).select().single();
    if (error) throw error;
    return data;
  },

  // Packages & Sessions
  async decrementSession(clientId: string, trainerId: string) {
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('client_id', clientId)
      .single();
    
    if (pkgError) throw pkgError;
    if (pkg.remaining_sessions > 0) {
      const { data, error } = await supabase
        .from('packages')
        .update({ remaining_sessions: pkg.remaining_sessions - 1 })
        .eq('id', pkg.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('No remaining sessions.');
  },

  // Workouts
  async getWorkouts(clientId: string): Promise<Workout[]> {
    const { data, error } = await supabase.from('workouts').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async markExerciseCompleted(exerciseId: string) {
    const { data, error } = await supabase.from('workout_exercises').update({ is_completed: true }).eq('id', exerciseId);
    if (error) throw error;
    return data;
  },

  // Progress Photos
  async uploadProgressPhoto(clientId: string, file: any, label: string) {
    // Upload logic will go here
    return true;
  }
};
