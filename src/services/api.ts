import { supabase, isSupabaseConfigured } from '../utils/supabase';
import {
  UserProfile,
  ClientMetric,
  Package,
  Workout,
  WorkoutExercise,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  TanitaReport,
  Diet,
  NutritionTemplate,
  ProgressPhoto,
} from '../types';
import { toISODate } from '../utils/date';

// Mock in-memory state for offline / zero-latency local testing
let mockProfiles: UserProfile[] = [
  { id: 'trainer-1', email: 'trainer@fitconnect.com', full_name: 'Serhat Hoca', role: 'trainer', phone: '+905301234567', created_at: '2026-01-01T00:00:00Z' },
  { id: '1', email: 'john@example.com', full_name: 'John Doe', role: 'client', trainer_id: 'trainer-1', phone: '+905321112233', created_at: '2026-01-01T00:00:00Z' },
  { id: '2', email: 'jane@example.com', full_name: 'Jane Smith', role: 'client', trainer_id: 'trainer-1', phone: '+905332223344', created_at: '2026-01-01T00:00:00Z' },
  { id: '3', email: 'bob@example.com', full_name: 'Bob Johnson', role: 'client', trainer_id: 'trainer-1', phone: '+905353334455', created_at: '2026-01-01T00:00:00Z' },
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

let mockWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'tmpl-1',
    trainer_id: 'trainer-1',
    title: 'Göğüs & Ön Kol (Hipertrofi)',
    target_focus: 'Hipertrofi',
    description: 'Göğüs kaslarında maksimum hacim ve ön kol dolgunluğu için.',
    exercises: [
      { id: 'ex-1', template_id: 'tmpl-1', exercise_name: 'Bench Press', order_index: 1, default_sets: 4, default_reps: 10, default_rest_sec: 90 },
      { id: 'ex-2', template_id: 'tmpl-1', exercise_name: 'Incline Dumbbell Press', order_index: 2, default_sets: 3, default_reps: 12, default_rest_sec: 60 },
      { id: 'ex-3', template_id: 'tmpl-1', exercise_name: 'Dumbbell Fly', order_index: 3, default_sets: 3, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-4', template_id: 'tmpl-1', exercise_name: 'Barbell Biceps Curl', order_index: 4, default_sets: 4, default_reps: 12, default_rest_sec: 60 },
      { id: 'ex-5', template_id: 'tmpl-1', exercise_name: 'Hammer Curl', order_index: 5, default_sets: 3, default_reps: 15, default_rest_sec: 60 },
    ],
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'tmpl-2',
    trainer_id: 'trainer-1',
    title: 'Bacak & Kalça Odaklı (Alt Vücut)',
    target_focus: 'Bacak & Kalça',
    description: 'Alt vücut kuvveti ve hipertrofisi.',
    exercises: [
      { id: 'ex-6', template_id: 'tmpl-2', exercise_name: 'Barbell Back Squat', order_index: 1, default_sets: 4, default_reps: 8, default_rest_sec: 120 },
      { id: 'ex-7', template_id: 'tmpl-2', exercise_name: 'Barbell Hip Thrust', order_index: 2, default_sets: 4, default_reps: 12, default_rest_sec: 90 },
      { id: 'ex-8', template_id: 'tmpl-2', exercise_name: 'Romanian Deadlift', order_index: 3, default_sets: 3, default_reps: 10, default_rest_sec: 90 },
      { id: 'ex-9', template_id: 'tmpl-2', exercise_name: 'Leg Extension', order_index: 4, default_sets: 3, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-10', template_id: 'tmpl-2', exercise_name: 'Standing Calf Raise', order_index: 5, default_sets: 4, default_reps: 20, default_rest_sec: 60 },
    ],
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'tmpl-3',
    trainer_id: 'trainer-1',
    title: 'Sırt & Arka Kol (Kuvvet & Hacim)',
    target_focus: 'Sırt & Kol',
    description: 'V Taper görünümü ve arka kol gelişimi.',
    exercises: [
      { id: 'ex-11', template_id: 'tmpl-3', exercise_name: 'Deadlift', order_index: 1, default_sets: 4, default_reps: 6, default_rest_sec: 120 },
      { id: 'ex-12', template_id: 'tmpl-3', exercise_name: 'Lat Pulldown', order_index: 2, default_sets: 4, default_reps: 10, default_rest_sec: 90 },
      { id: 'ex-13', template_id: 'tmpl-3', exercise_name: 'Seated Cable Row', order_index: 3, default_sets: 3, default_reps: 12, default_rest_sec: 60 },
      { id: 'ex-14', template_id: 'tmpl-3', exercise_name: 'Triceps Rope Pushdown', order_index: 4, default_sets: 4, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-15', template_id: 'tmpl-3', exercise_name: 'Skull Crusher', order_index: 5, default_sets: 3, default_reps: 12, default_rest_sec: 60 },
    ],
    created_at: '2026-09-03T10:00:00Z',
  },
  {
    id: 'tmpl-4',
    trainer_id: 'trainer-1',
    title: 'Omuz & Karın (Definisyon)',
    target_focus: 'Definisyon',
    description: 'Geniş omuzlar ve sıkı bir merkez bölgesi.',
    exercises: [
      { id: 'ex-16', template_id: 'tmpl-4', exercise_name: 'Overhead Dumbbell Press', order_index: 1, default_sets: 4, default_reps: 10, default_rest_sec: 90 },
      { id: 'ex-17', template_id: 'tmpl-4', exercise_name: 'Lateral Raise', order_index: 2, default_sets: 4, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-18', template_id: 'tmpl-4', exercise_name: 'Face Pull', order_index: 3, default_sets: 3, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-19', template_id: 'tmpl-4', exercise_name: 'Hanging Leg Raise', order_index: 4, default_sets: 4, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-20', template_id: 'tmpl-4', exercise_name: 'Plank', order_index: 5, default_sets: 3, default_reps: 60, default_rest_sec: 60 }, // reps represents seconds here
    ],
    created_at: '2026-09-04T10:00:00Z',
  },
  {
    id: 'tmpl-5',
    trainer_id: 'trainer-1',
    title: 'Full Body Fonksiyonel Kondisyon',
    target_focus: 'Full Body',
    description: 'Tüm vücudu çalıştıran yüksek yoğunluklu kondisyon.',
    exercises: [
      { id: 'ex-21', template_id: 'tmpl-5', exercise_name: 'Kettlebell Swing', order_index: 1, default_sets: 4, default_reps: 20, default_rest_sec: 60 },
      { id: 'ex-22', template_id: 'tmpl-5', exercise_name: 'Dumbbell Thruster', order_index: 2, default_sets: 4, default_reps: 15, default_rest_sec: 60 },
      { id: 'ex-23', template_id: 'tmpl-5', exercise_name: 'Pull-up', order_index: 3, default_sets: 3, default_reps: 10, default_rest_sec: 60 },
      { id: 'ex-24', template_id: 'tmpl-5', exercise_name: 'Push-up', order_index: 4, default_sets: 3, default_reps: 20, default_rest_sec: 60 },
      { id: 'ex-25', template_id: 'tmpl-5', exercise_name: 'Box Jump', order_index: 5, default_sets: 3, default_reps: 10, default_rest_sec: 60 },
    ],
    created_at: '2026-09-05T10:00:00Z',
  },
];

let mockWorkouts: Workout[] = [];

let mockProgressPhotos: ProgressPhoto[] = [
  {
    id: 'photo-1',
    client_id: '1',
    week_label: 'Hafta 1 (Başlangıç)',
    front_image_url: 'https://i.ibb.co/3s6qPXZ/default-front.png',
    side_image_url: 'https://i.ibb.co/L9p6sQG/default-side.png',
    back_image_url: 'https://i.ibb.co/1KzqWc9/default-back.png',
    weight_kg: 84.0,
    notes: 'Başlangıç formu. Yağ oranı biraz yüksek.',
    created_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'photo-2',
    client_id: '1',
    week_label: 'Hafta 4 (Gelişim)',
    front_image_url: 'https://i.ibb.co/3s6qPXZ/default-front.png',
    side_image_url: 'https://i.ibb.co/L9p6sQG/default-side.png',
    back_image_url: 'https://i.ibb.co/1KzqWc9/default-back.png',
    weight_kg: 81.5,
    notes: 'Bel çevresinde incelme, omuzlarda hacim artışı.',
    created_at: '2026-09-15T10:00:00Z',
  }
];

let mockNutritionTemplates: NutritionTemplate[] = [
  {
    id: 'ntmpl-1',
    trainer_id: 'trainer-1',
    title: 'High Protein Definasyon (1950 kcal)',
    target_calories: 1950,
    target_protein_g: 180,
    target_carbs_g: 160,
    target_fat_g: 50,
    meals: [
      { id: 'm-1', time: '08:30', name: 'Kahvaltı', desc: '4 yumurta beyazı, 1 tam yumurta, 60g yulaf, 1 muz', calories: 480, is_completed: false },
      { id: 'm-2', time: '12:30', name: 'Öğle Yemeği', desc: '200g ızgara tavuk göğsü, 150g basmati pirinç, yeşil salata (1 tatlı kaşığı zeytinyağı)', calories: 580, is_completed: false },
      { id: 'm-3', time: '16:00', name: 'Ara Öğün', desc: '1 ölçek Whey protein, 1 adet yeşil elma, 15 adet çiğ badem', calories: 310, is_completed: false },
      { id: 'm-4', time: '19:30', name: 'Akşam Yemeği', desc: '200g fırın somon veya hindi göğsü, haşlanmış brokoli, 100g tatlı patates', calories: 580, is_completed: false },
    ],
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ntmpl-2',
    trainer_id: 'trainer-1',
    title: 'Clean Bulk & Hipertrofi (2800 kcal)',
    target_calories: 2800,
    target_protein_g: 190,
    target_carbs_g: 350,
    target_fat_g: 70,
    meals: [
      { id: 'm-5', time: '08:00', name: 'Kahvaltı', desc: '4 tam yumurta, 100g yulaf ezmesi, 1 yemek kaşığı fıstık ezmesi, 1 bardak süt', calories: 750, is_completed: false },
      { id: 'm-6', time: '12:00', name: 'Öğle Yemeği', desc: '220g ızgara dana biftek / kıyma, 250g makarna / pirinç, mevsim salatası', calories: 820, is_completed: false },
      { id: 'm-7', time: '16:00', name: 'Ara Öğün', desc: '2 dilim tam buğday ekmeği, 60g lor peyniri, 1 muz, 1 ölçek protein tozu', calories: 480, is_completed: false },
      { id: 'm-8', time: '20:00', name: 'Akşam Yemeği', desc: '220g tavuk but veya hindi, 200g fırın patates, zeytinyağlı sebzeler', calories: 750, is_completed: false },
    ],
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'ntmpl-3',
    trainer_id: 'trainer-1',
    title: 'Ketojenik Yağ Yakımı (2100 kcal)',
    target_calories: 2100,
    target_protein_g: 160,
    target_carbs_g: 30,
    target_fat_g: 145,
    meals: [
      { id: 'm-9', time: '09:00', name: 'Kahvaltı (Keto)', desc: '3 tam tereyağlı yumurta, 1/2 avokado, 50g beyaz peynir, 5 adet ceviz', calories: 650, is_completed: false },
      { id: 'm-10', time: '14:00', name: 'Öğle Yemeği', desc: '200g somon fileto, zeytinyağlı ve avokadolu yeşil salata', calories: 720, is_completed: false },
      { id: 'm-11', time: '19:30', name: 'Akşam Yemeği', desc: '200g antrikot / dana pirzola, tereyağında sotelenmiş mantar ve ıspanak', calories: 730, is_completed: false },
    ],
    created_at: '2026-09-03T10:00:00Z',
  },
];

let mockDiets: Diet[] = [
  {
    id: 'diet-1',
    client_id: '1',
    trainer_id: 'trainer-1',
    date: new Date().toISOString().split('T')[0],
    target_calories: 1950,
    target_protein_g: 180,
    target_carbs_g: 160,
    target_fat_g: 50,
    trainer_notes: 'Günde en az 3.5 litre su tüketmeyi unutma. Antrenmandan 2 saat önce ara öğününü bitirmiş ol.',
    meals: [
      { id: 'd-1', time: '08:30', name: 'Kahvaltı', desc: '4 yumurta beyazı, 1 tam yumurta, 60g yulaf, 1 muz', calories: 480, is_completed: true },
      { id: 'd-2', time: '12:30', name: 'Öğle Yemeği', desc: '200g ızgara tavuk göğsü, 150g basmati pirinç, yeşil salata (1 tatlı kaşığı zeytinyağı)', calories: 580, is_completed: false },
      { id: 'd-3', time: '16:00', name: 'Ara Öğün', desc: '1 ölçek Whey protein, 1 adet yeşil elma, 15 adet çiğ badem', calories: 310, is_completed: false },
      { id: 'd-4', time: '19:30', name: 'Akşam Yemeği', desc: '200g fırın somon veya hindi göğsü, haşlanmış brokoli, 100g tatlı patates', calories: 580, is_completed: false },
    ],
    created_at: new Date().toISOString(),
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

  async updateClientPhone(clientId: string, phone: string): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      const p = mockProfiles.find(x => x.id === clientId);
      if (p) {
        p.phone = phone;
        return { ...p };
      }
      throw new Error('Danışan bulunamadı.');
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', clientId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getClientsWithPackages(trainerId?: string): Promise<{ client: UserProfile; package: Package | null }[]> {
    const clients = await this.getClients(trainerId);
    const results = await Promise.all(
      clients.map(async (client) => {
        const pkg = await this.getClientPackage(client.id);
        return { client, package: pkg };
      })
    );
    return results;
  },

  async createClientAccount(clientData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) {
    if (!isSupabaseConfigured) {
      const mockClient = {
        id: `mock-client-${Date.now()}`,
        email: clientData.email,
        full_name: clientData.full_name,
        role: 'client' as const,
        phone: clientData.phone || '',
        trainer_id: 'trainer-1', // Mock trainer id
        created_at: new Date().toISOString(),
      };
      mockProfiles.push(mockClient as any);
      return mockClient;
    }

    const { data, error } = await supabase.functions.invoke('create-client', {
      body: clientData,
    });

    if (error) {
      throw new Error(error.message || 'Danışan hesabı oluşturulamadı.');
    }

    // Edge function hata gövdesi kontrolü
    if (data?.error) {
      throw new Error(data.error);
    }

    return data?.user;
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
    const normalizedMetric = {
      ...metric,
      date: toISODate(metric.date),
    };
    if (!isSupabaseConfigured) {
      const newM: ClientMetric = {
        id: 'm-' + Date.now(),
        ...normalizedMetric,
      };
      mockMetrics.unshift(newM);
      return newM;
    }
    const { data, error } = await supabase
      .from('client_metrics')
      .insert(normalizedMetric)
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
    const normalizedReport = {
      ...report,
      date: toISODate(report.date),
    };
    if (!isSupabaseConfigured) {
      const newRep: TanitaReport = {
        id: 'tanita-' + Date.now(),
        created_at: new Date().toISOString(),
        ...normalizedReport,
      };
      mockTanitaReports.unshift(newRep);
      return newRep;
    }
    const { data, error } = await supabase
      .from('tanita_reports')
      .insert(normalizedReport)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Workout Templates
  async getWorkoutTemplates(trainerId: string): Promise<WorkoutTemplate[]> {
    if (!isSupabaseConfigured) {
      return mockWorkoutTemplates.filter(t => t.trainer_id === trainerId);
    }
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, exercises:workout_template_exercises(*)')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createWorkoutTemplate(template: Omit<WorkoutTemplate, 'id' | 'created_at'>, exercises: Omit<WorkoutTemplateExercise, 'id' | 'template_id'>[]): Promise<WorkoutTemplate> {
    if (!isSupabaseConfigured) {
      const newTemplate: WorkoutTemplate = {
        id: 'tmpl-' + Date.now(),
        created_at: new Date().toISOString(),
        ...template,
        exercises: exercises.map((ex, idx) => ({
          ...ex,
          id: 'ex-' + Date.now() + '-' + idx,
          template_id: 'tmpl-' + Date.now(),
        } as WorkoutTemplateExercise)),
      };
      mockWorkoutTemplates.unshift(newTemplate);
      return newTemplate;
    }
    const { data: tmplData, error: tmplError } = await supabase
      .from('workout_templates')
      .insert(template)
      .select()
      .single();
    if (tmplError) throw tmplError;

    if (exercises.length > 0) {
      const exToInsert = exercises.map(ex => ({ ...ex, template_id: tmplData.id }));
      const { error: exError } = await supabase
        .from('workout_template_exercises')
        .insert(exToInsert);
      if (exError) throw exError;
    }

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*, exercises:workout_template_exercises(*)')
      .eq('id', tmplData.id)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteWorkoutTemplate(templateId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockWorkoutTemplates = mockWorkoutTemplates.filter(t => t.id !== templateId);
      return;
    }
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId);
    if (error) throw error;
  },

  async assignTemplateToClient(templateId: string, clientId: string, date: string): Promise<Workout> {
    const normalizedDate = toISODate(date);
    if (!isSupabaseConfigured) {
      const template = mockWorkoutTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const workoutId = 'w-' + Date.now();
      const exercises: WorkoutExercise[] = (template.exercises || []).map((ex, idx) => {
        const setsCount = ex.default_sets || 3;
        const repsCount = typeof ex.default_reps === 'number' ? ex.default_reps : parseInt(String(ex.default_reps || '10'), 10) || 10;
        const setsData = Array.from({ length: setsCount }).map((_, i) => ({
          set_number: i + 1,
          weight_kg: 0,
          reps: repsCount,
          is_completed: false,
        }));
        
        return {
          id: 'we-' + Date.now() + '-' + idx,
          workout_id: workoutId,
          exercise_name: ex.exercise_name,
          sets: ex.default_sets,
          reps: ex.default_reps,
          weight_kg: 0,
          rest_time_sec: ex.default_rest_sec,
          is_completed: false,
          order_index: ex.order_index,
          setsData,
        };
      });

      const newWorkout: Workout = {
        id: workoutId,
        client_id: clientId,
        trainer_id: template.trainer_id,
        template_id: template.id,
        title: template.title,
        date: normalizedDate,
        status: 'pending',
        exercises,
        created_at: new Date().toISOString(),
      };
      mockWorkouts.unshift(newWorkout);
      return newWorkout;
    }

    const { data: template, error: tmplError } = await supabase
      .from('workout_templates')
      .select('*, exercises:workout_template_exercises(*)')
      .eq('id', templateId)
      .single();
    
    if (tmplError) throw tmplError;

    const { data: workout, error: wError } = await supabase
      .from('workouts')
      .insert({
        client_id: clientId,
        trainer_id: template.trainer_id,
        template_id: template.id,
        title: template.title,
        date: normalizedDate,
        status: 'pending',
      } as any)
      .select()
      .single();
    if (wError) throw wError;

    if (template.exercises && template.exercises.length > 0) {
      const weToInsert = template.exercises.map((ex: any) => {
        const setsCount = ex.default_sets || 3;
        const repsCount = typeof ex.default_reps === 'number' ? ex.default_reps : parseInt(String(ex.default_reps || '10'), 10) || 10;
        const setsData = Array.from({ length: setsCount }).map((_, i) => ({
          set_number: i + 1,
          weight_kg: 0,
          reps: repsCount,
          is_completed: false,
        }));
        
        return {
          workout_id: workout.id,
          exercise_name: ex.exercise_name,
          sets: ex.default_sets,
          reps: ex.default_reps,
          weight_kg: 0,
          rest_time_sec: ex.default_rest_sec,
          order_index: ex.order_index,
          is_completed: false,
          setsData,
        };
      });
      const { error: weError } = await supabase
        .from('workout_exercises')
        .insert(weToInsert);
      if (weError) throw weError;
    }

    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('id', workout.id)
      .single();
    if (error) throw error;
    return data;
  },

  // Workouts
  async getWorkouts(clientId: string): Promise<Workout[]> {
    if (!isSupabaseConfigured) {
      return mockWorkouts.filter(w => w.client_id === clientId).sort((a, b) => b.date.localeCompare(a.date));
    }
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateWorkoutProgress(workoutId: string, exercises: WorkoutExercise[], durationSec?: number) {
    if (!isSupabaseConfigured) {
      const w = mockWorkouts.find(x => x.id === workoutId);
      if (w) {
        w.status = 'completed';
        w.exercises = exercises;
      }
      return w;
    }

    // 1. Update each exercise setsData
    for (const ex of exercises) {
      const { error } = await supabase
        .from('workout_exercises')
        .update({ setsData: ex.setsData })
        .eq('id', ex.id);
      if (error) console.error("Error updating exercise sets:", error);
    }

    // 2. Mark workout as completed
    const { data, error: wError } = await supabase
      .from('workouts')
      .update({ status: 'completed' })
      .eq('id', workoutId)
      .select()
      .single();
    if (wError) throw wError;
    return data;
  },

  // Nutrition Templates & Diet
  async getNutritionTemplates(trainerId: string): Promise<NutritionTemplate[]> {
    if (!isSupabaseConfigured) {
      return mockNutritionTemplates.filter(t => t.trainer_id === trainerId || !t.trainer_id || t.trainer_id === 'trainer-1');
    }
    const { data, error } = await supabase
      .from('nutrition_templates')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createNutritionTemplate(template: Omit<NutritionTemplate, 'id' | 'created_at'>): Promise<NutritionTemplate> {
    if (!isSupabaseConfigured) {
      const newTemplate: NutritionTemplate = {
        id: 'ntmpl-' + Date.now(),
        created_at: new Date().toISOString(),
        ...template,
      };
      mockNutritionTemplates.unshift(newTemplate);
      return newTemplate;
    }
    const { data, error } = await supabase
      .from('nutrition_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteNutritionTemplate(templateId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockNutritionTemplates = mockNutritionTemplates.filter(t => t.id !== templateId);
      return;
    }
    const { error } = await supabase
      .from('nutrition_templates')
      .delete()
      .eq('id', templateId);
    if (error) throw error;
  },

  async assignNutritionPlan(clientId: string, dietPlan: Omit<Diet, 'id' | 'client_id' | 'created_at'>): Promise<Diet> {
    const normalizedDate = toISODate(dietPlan.date || new Date().toISOString().split('T')[0]);
    if (!isSupabaseConfigured) {
      const newDiet: Diet = {
        id: 'diet-' + Date.now(),
        client_id: clientId,
        created_at: new Date().toISOString(),
        ...dietPlan,
        date: normalizedDate,
      };
      const existingIdx = mockDiets.findIndex(d => d.client_id === clientId);
      if (existingIdx !== -1) {
        mockDiets[existingIdx] = newDiet;
      } else {
        mockDiets.unshift(newDiet);
      }
      return newDiet;
    }

    const { data, error } = await supabase
      .from('diets')
      .insert({
        ...dietPlan,
        client_id: clientId,
        date: normalizedDate,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLatestDiet(clientId: string): Promise<Diet | null> {
    if (!isSupabaseConfigured) {
      const found = mockDiets.find(d => d.client_id === clientId);
      return found || null;
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

  async toggleMealCompleted(dietId: string, mealIndex: number, isCompleted: boolean, photoUri?: string): Promise<Diet | null> {
    if (!isSupabaseConfigured) {
      const diet = mockDiets.find(d => d.id === dietId || d.client_id === dietId);
      if (diet && diet.meals && diet.meals[mealIndex]) {
        diet.meals[mealIndex].is_completed = isCompleted;
        if (photoUri !== undefined) {
          diet.meals[mealIndex].photo_uri = photoUri;
        }
        return { ...diet };
      }
      return null;
    }

    const { data: currentDiet, error: fetchErr } = await supabase
      .from('diets')
      .select('*')
      .eq('id', dietId)
      .single();
    if (fetchErr) throw fetchErr;

    const updatedMeals = [...(currentDiet.meals || [])];
    if (updatedMeals[mealIndex]) {
      updatedMeals[mealIndex].is_completed = isCompleted;
      if (photoUri !== undefined) {
        updatedMeals[mealIndex].photo_uri = photoUri;
      }
    }

    const { data, error } = await supabase
      .from('diets')
      .update({ meals: updatedMeals })
      .eq('id', dietId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Progress Gallery
  async getProgressPhotos(clientId: string): Promise<ProgressPhoto[]> {
    if (!isSupabaseConfigured) {
      return mockProgressPhotos
        .filter(p => p.client_id === clientId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addProgressPhoto(photo: Omit<ProgressPhoto, 'id' | 'created_at'>): Promise<ProgressPhoto> {
    if (!isSupabaseConfigured) {
      const newPhoto: ProgressPhoto = {
        id: 'photo-' + Date.now(),
        created_at: new Date().toISOString(),
        ...photo,
      };
      mockProgressPhotos.unshift(newPhoto);
      return newPhoto;
    }
    const { data, error } = await supabase
      .from('progress_photos')
      .insert(photo)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProgressPhoto(photoId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      mockProgressPhotos = mockProgressPhotos.filter(p => p.id !== photoId);
      return;
    }
    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId);
    if (error) throw error;
  },
};
