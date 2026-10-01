export type Role = 'trainer' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  trainer_id?: string;
  created_at: string;
  updated_at?: string;
}

export type User = UserProfile;

// PT-App Legacy 9-Bölge Antropometrik Ölçüm Modeli
export interface ClientMetric {
  id: string;
  client_id: string;
  trainer_id?: string;
  date: string;
  weight: number;      // Kilo (kg)
  height: number;      // Boy (cm)
  shoulder?: number;   // Omuz (cm)
  chest?: number;      // Göğüs (cm)
  biceps?: number;     // Kol / Pazu (cm)
  waist?: number;      // Bel (cm)
  hips?: number;       // Kalça (cm)
  thigh?: number;      // Bacak / Üst Bacak (cm)
  calf?: number;       // Baldır / Kalf (cm)
  body_fat?: number;   // Yağ Oranı (%)
  par_q_data?: any;
  notes?: string;
  created_at?: string;
}

// PT-App Legacy Kasa & Paket Modeli
export interface Package {
  id: string;
  client_id: string;
  trainer_id?: string;
  total_sessions: number;
  remaining_sessions: number;
  package_price: number;       // Paket Ücreti (örn. 15000 ₺)
  paid_amount: number;         // Tahsil Edilen (örn. 10000 ₺)
  debt_amount?: number;        // Hesaplanabilir: package_price - paid_amount
  last_payment_date?: string;  // Son Ödeme Tarihi
  status?: 'active' | 'warning' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Tanita Klinik PDF Analiz Raporları Arşivi
export interface TanitaReport {
  id: string;
  client_id: string;
  trainer_id?: string;
  date: string;
  file_name: string;
  file_url: string;
  clinic_name?: string;
  file_size?: string;
  note?: string;
  created_at?: string;
}

// Antrenman Şablon Kütüphanesi
export interface WorkoutTemplate {
  id: string;
  trainer_id: string;
  title: string;
  target_focus?: string; // örn. 'Hipertrofi', 'Bacak & Kalça'
  description?: string;
  exercises?: WorkoutTemplateExercise[];
  created_at?: string;
}

export interface WorkoutTemplateExercise {
  id?: string;
  template_id?: string;
  exercise_name: string;
  order_index: number;
  default_sets: number;
  default_reps: number;
  default_rest_sec: number;
}

// Canlı Antrenman ve Set Hacmi
export interface Workout {
  id: string;
  client_id: string;
  trainer_id?: string;
  template_id?: string;
  title?: string;
  date: string;
  duration_seconds?: number;
  total_volume_kg?: number; // Toplam Hacim = sum(Ağırlık * Tekrar)
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  exercises?: WorkoutExercise[];
  created_at?: string;
}

export interface WorkoutExerciseSetData {
  set_number: number;
  weight_kg: number;
  reps: number;
  is_completed: boolean;
  prev_weight_kg?: number;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  set_number?: number;
  sets?: number;
  reps?: number | string;
  weight_kg?: number;
  prev_weight_kg?: number;
  rest_time_sec?: number;
  is_completed?: boolean;
  order_index?: number;
  setsData?: WorkoutExerciseSetData[];
}

// Beslenme Şablonları & Planı
export interface MealItem {
  id?: string;
  time: string; // örn. '08:30'
  name: string; // örn. 'Sabah Kahvaltısı'
  desc: string; // örn. '4 yumurta beyazı, 2 tam yumurta, 60g yulaf'
  calories?: number; // örn. 450
  is_completed?: boolean;
  photo_uri?: string;
}

export interface NutritionTemplate {
  id: string;
  trainer_id: string;
  title: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  meals: MealItem[];
  created_at?: string;
}

export interface Diet {
  id: string;
  client_id: string;
  trainer_id?: string;
  date: string;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  meals?: MealItem[];
  trainer_notes?: string;
  client_meal_image_url?: string;
  client_notes?: string;
  created_at?: string;
}

export interface ProgressPhoto {
  id: string;
  client_id: string;
  week_label: string;
  front_image_url?: string;
  side_image_url?: string;
  back_image_url?: string;
  weight_kg?: number;
  notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id?: string;
  trainer_id: string;
  date_time: string;
  status: 'available' | 'booked' | 'cancelled';
  created_at?: string;
}
