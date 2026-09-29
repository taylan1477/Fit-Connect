import { supabase, isSupabaseConfigured } from '../utils/supabase';
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

// Mock in-memory state for offline / zero-latency local testing
let mockProfiles: UserProfile[] = [
  { id: 'trainer-1', email: 'trainer@fitconnect.com', full_name: 'Serhat Hoca', role: 'trainer', created_at: '2026-01-01T00:00:00Z' },
  { id: '1', email: 'john@example.com', full_name: 'John Doe', role: 'client', trainer_id: 'trainer-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', email: 'jane@example.com', full_name: 'Jane Smith', role: 'client', trainer_id: 'trainer-1', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', email: 'bob@example.com', full_name: 'Bob Johnson', role: 'client', trainer_id: 'trainer-1', created_at: '2026-01-01T00:00:00Z' },
];

let mockPackages: Package[] = [
  {
    id: 'pkg-1',
    client_id: '1',
    trainer_id: 'trainer-1',
    package_price: 18000,
    paid_amount: 12000,
    total_sessions: 20,
    remaining_sessions: 8,
    status: 'active',
    last_payment_date: '2026-09-15',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-15T12:00:00Z',
  },
  {
    id: 'pkg-2',
    client_id: '2',
    trainer_id: 'trainer-1',
    package_price: 15000,
    paid_amount: 15000,
    total_sessions: 16,
    remaining_sessions: 2,
    status: 'warning',
    last_payment_date: '2026-09-10',
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-10T10:00:00Z',
  },
  {
    id: 'pkg-3',
    client_id: '3',
    trainer_id: 'trainer-1',
    package_price: 12000,
    paid_amount: 12000,
    total_sessions: 12,
    remaining_sessions: 0,
    status: 'completed',
    last_payment_date: '2026-08-01',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  },
];

let mockMetrics: ClientMetric[] = [
  {
    id: 'm-1',
    client_id: '1',
    date: '2026-09-20',
    weight: 81.5,
    height: 182,
    body_fat: 16.5,
    shoulder: 121,
    chest: 104,
    biceps: 38,
    waist: 84,
    hips: 98,
    thigh: 58,
    calf: 38,
    notes: 'Dayanıklılık ve form artışı gözlendi.',
  },
  {
    id: 'm-2',
    client_id: '1',
    date: '2026-08-15',
    weight: 84.0,
    height: 182,
    body_fat: 18.2,
    shoulder: 119,
    chest: 102,
    biceps: 37,
    waist: 88,
    hips: 101,
    thigh: 60,
    calf: 38.5,
    notes: 'İlk başlangıç ölçümü',
  },
  {
    id: 'm-3',
    client_id: '2',
    date: '2026-09-15',
    weight: 62.0,
    height: 168,
    body_fat: 21.0,
    shoulder: 98,
    chest: 88,
    biceps: 27,
    waist: 68,
    hips: 94,
    thigh: 52,
    calf: 34,
    notes: 'Hipertrofi programı 1. ay',
  },
  {
    id: 'm-4',
    client_id: '3',
    date: '2026-09-10',
    weight: 77.0,
    height: 175,
    body_fat: 14.0,
    shoulder: 115,
    chest: 100,
    biceps: 36,
    waist: 79,
    hips: 95,
    thigh: 55,
    calf: 36,
    notes: 'Kondisyon test ölçümü',
  },
];

let mockTanitaReports: TanitaReport[] = [
  {
    id: 'tanita-1',
    client_id: '1',
    trainer_id: 'trainer-1',
    date: '2026-09-18',
    file_name: 'John_Doe_Tanita_MC780_Eylul.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    clinic_name: 'Acıbadem Sports Tanita MC-780',
    file_size: '1.2 MB',
    note: 'Visseral yağ seviyesi 6\'ya geriledi. Yağsız kas kütlesi +850g artış gösterdi. Su tutulumu dengeli.',
    created_at: '2026-09-18T10:30:00Z',
  },
  {
    id: 'tanita-2',
    client_id: '1',
    trainer_id: 'trainer-1',
    date: '2026-08-15',
    file_name: 'John_Doe_Tanita_Ilk_Analiz.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    clinic_name: 'FitLife Klinik Laboratuvarı',
    file_size: '980 KB',
    note: 'Program başlangıcı segmental vücut analizi. Sağ-sol bacak kas dengesizliği %4 (düzeltici egzersizler yazıldı).',
    created_at: '2026-08-15T09:15:00Z',
  },
  {
    id: 'tanita-3',
    client_id: '2',
    trainer_id: 'trainer-1',
    date: '2026-09-12',
    file_name: 'Jane_Smith_InBody_770.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    clinic_name: 'Medicana Spor Hekimliği',
    file_size: '1.5 MB',
    note: 'Hipertrofi dönemi ara kontrol. İskelet kası kütlesi 24.2 kg -> 25.1 kg.',
    created_at: '2026-09-12T14:00:00Z',
  },
];

export const api = {
  // Profiles
  async getProfile(id: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      return mockProfiles.find(p => p.id === id) || mockProfiles[0];
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching profile:', error.message);
    }
    return data;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      const idx = mockProfiles.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockProfiles[idx] = { ...mockProfiles[idx], ...updates };
        return mockProfiles[idx];
      }
      const newP = { id, email: '', role: 'trainer', ...updates } as UserProfile;
      mockProfiles.push(newP);
      return newP;
    }
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
    if (!isSupabaseConfigured) {
      return mockProfiles.filter(p => p.role === 'client');
    }
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
    if (!isSupabaseConfigured) {
      const found = mockPackages.find(p => p.client_id === clientId);
      return found || null;
    }
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
    if (!isSupabaseConfigured) {
      return mockPackages;
    }
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

    if (!isSupabaseConfigured) {
      const idx = mockPackages.findIndex(p => p.id === packageId);
      if (idx !== -1) {
        mockPackages[idx] = {
          ...mockPackages[idx],
          paid_amount: newPaidAmount,
          last_payment_date: today,
          updated_at: new Date().toISOString(),
        };
        return mockPackages[idx];
      }
      throw new Error('Paket bulunamadı.');
    }

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
    if (!isSupabaseConfigured) {
      const idx = mockPackages.findIndex(p => p.id === packageId);
      if (idx !== -1) {
        const pkg = mockPackages[idx];
        mockPackages[idx] = {
          ...pkg,
          total_sessions: Number(pkg.total_sessions) + additionalSessions,
          remaining_sessions: Number(pkg.remaining_sessions) + additionalSessions,
          package_price: Number(pkg.package_price) + additionalPrice,
          status: 'active',
          updated_at: new Date().toISOString(),
        };
        return mockPackages[idx];
      }
      throw new Error('Paket bulunamadı.');
    }

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
    if (!isSupabaseConfigured) {
      const idx = mockPackages.findIndex(p => p.client_id === clientId);
      if (idx !== -1) {
        const pkg = mockPackages[idx];
        if (pkg.remaining_sessions > 0) {
          const remaining = pkg.remaining_sessions - 1;
          const status = remaining === 0 ? 'completed' : remaining <= 3 ? 'warning' : 'active';
          mockPackages[idx] = {
            ...pkg,
            remaining_sessions: remaining,
            status: status as any,
            updated_at: new Date().toISOString(),
          };
          return mockPackages[idx];
        }
        throw new Error('Kalan dersiniz bulunmamaktadır.');
      }
      throw new Error('Paket bulunamadı.');
    }

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
    if (!isSupabaseConfigured) {
      return mockMetrics
        .filter(m => m.client_id === clientId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    const { data, error } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addMetric(metric: Omit<ClientMetric, 'id'>): Promise<ClientMetric> {
    if (!isSupabaseConfigured) {
      const newM: ClientMetric = {
        id: 'm-' + Date.now(),
        ...metric,
      };
      mockMetrics.unshift(newM);
      return newM;
    }
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
    if (!isSupabaseConfigured) {
      return mockTanitaReports
        .filter(r => r.client_id === clientId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    const { data, error } = await supabase
      .from('tanita_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addTanitaReport(report: Omit<TanitaReport, 'id' | 'created_at'>): Promise<TanitaReport> {
    if (!isSupabaseConfigured) {
      const newRep: TanitaReport = {
        id: 'tanita-' + Date.now(),
        created_at: new Date().toISOString(),
        ...report,
      };
      mockTanitaReports.unshift(newRep);
      return newRep;
    }
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
    if (!isSupabaseConfigured) {
      return [];
    }
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
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markExerciseCompleted(exerciseId: string, isCompleted: boolean) {
    if (!isSupabaseConfigured) {
      return { id: exerciseId, is_completed: isCompleted };
    }
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
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('nutrition_templates')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getLatestDiet(clientId: string): Promise<Diet | null> {
    if (!isSupabaseConfigured) {
      return null;
    }
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
