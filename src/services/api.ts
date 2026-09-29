import { supabase } from '../utils/supabase';
import {
  UserProfile,
  ClientMetric,
  Package,
  Workout,
  WorkoutExercise,
  WorkoutTemplate,
  TanitaReport,
  Diet,
  NutritionTemplate,
} from '../types';

export const api = {
  // Profiles
  async getProfile(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching profile:', error.message);
    }
    return data;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Clients
  async getClients(trainerId?: string): Promise<UserProfile[]> {
    let query = supabase.from('profiles').select('*').eq('role', 'client');
    if (trainerId) {
      query = query.eq('trainer_id', trainerId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Packages & Financials (PT-App Legacy Engine)
  async getClientPackage(clientId: string): Promise<Package | null> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTrainerPackages(trainerId: string): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('trainer_id', trainerId);
    if (error) throw error;
    return data || [];
  },

  async collectPayment(packageId: string, amountToPay: number, currentPaid: number) {
    const newPaidAmount = Number(currentPaid) + Number(amountToPay);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('packages')
      .update({
        paid_amount: newPaidAmount,
        last_payment_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async renewPackage(packageId: string, additionalSessions: number = 20, additionalPrice: number = 15000) {
    const { data: pkg, error: getErr } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (getErr) throw getErr;

    const { data, error } = await supabase
      .from('packages')
      .update({
        total_sessions: Number(pkg.total_sessions) + additionalSessions,
        remaining_sessions: Number(pkg.remaining_sessions) + additionalSessions,
        package_price: Number(pkg.package_price) + additionalPrice,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async decrementSession(clientId: string) {
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pkgError) throw pkgError;
    if (pkg.remaining_sessions > 0) {
      const remaining = pkg.remaining_sessions - 1;
      const status = remaining === 0 ? 'completed' : remaining <= 3 ? 'warning' : 'active';
      const { data, error } = await supabase
        .from('packages')
        .update({
          remaining_sessions: remaining,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pkg.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('Kalan dersiniz bulunmamaktadır.');
  },

  // 9-Point Anthropometrics (PT-App Legacy 9 Bölge Modeli)
  async getMetrics(clientId: string): Promise<ClientMetric[]> {
    const { data, error } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addMetric(metric: Omit<ClientMetric, 'id'>): Promise<ClientMetric> {
    const { data, error } = await supabase
      .from('client_metrics')
      .insert(metric)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Tanita Reports Vault
  async getTanitaReports(clientId: string): Promise<TanitaReport[]> {
    const { data, error } = await supabase
      .from('tanita_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addTanitaReport(report: Omit<TanitaReport, 'id' | 'created_at'>): Promise<TanitaReport> {
    const { data, error } = await supabase
      .from('tanita_reports')
      .insert(report)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Workout Templates
  async getWorkoutTemplates(trainerId: string): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, exercises:workout_template_exercises(*)')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Workouts
  async getWorkouts(clientId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markExerciseCompleted(exerciseId: string, isCompleted: boolean) {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update({ is_completed: isCompleted })
      .eq('id', exerciseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Nutrition Templates & Diet
  async getNutritionTemplates(trainerId: string): Promise<NutritionTemplate[]> {
    const { data, error } = await supabase
      .from('nutrition_templates')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getLatestDiet(clientId: string): Promise<Diet | null> {
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
