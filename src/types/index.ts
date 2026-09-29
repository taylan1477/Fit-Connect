export type Role = 'trainer' | 'client';

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  created_at: string;
}

export interface ClientMetric {
  id: string;
  client_id: string;
  weight: number;
  height: number;
  body_fat: number;
  par_q_data: any;
  date: string;
}

export interface Package {
  id: string;
  client_id: string;
  total_sessions: number;
  remaining_sessions: number;
}

export interface Workout {
  id: string;
  client_id: string;
  date: string;
  status: 'pending' | 'completed';
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  rest_time_sec: number;
  is_completed: boolean;
}

export interface Diet {
  id: string;
  client_id: string;
  date: string;
  trainer_notes: string;
  client_meal_image_url: string;
  client_notes: string;
}

export interface ProgressPhoto {
  id: string;
  client_id: string;
  week_label: string;
  front_image_url: string;
  side_image_url: string;
  back_image_url: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  trainer_id: string;
  date_time: string;
  status: 'available' | 'booked' | 'cancelled';
}
