-- ==============================================================================
-- Fit-Connect & PT-App Legacy Database Schema
-- Supabase PostgreSQL Schema with Financials, 9-point Anthropometrics, and Templates
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Trainers and Clients)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('trainer', 'client')),
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PACKAGES & FINANCIAL MANAGEMENT (PT-App Legacy Engine)
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_sessions INT NOT NULL DEFAULT 20,
    remaining_sessions INT NOT NULL DEFAULT 20,
    package_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_payment_date DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'warning', 'completed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 9-POINT ANTHROPOMETRIC MEASUREMENTS (PT-App Legacy 9 Bölge Modeli)
CREATE TABLE IF NOT EXISTS public.client_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5, 2),        -- kg
    height NUMERIC(5, 2),        -- cm
    shoulder NUMERIC(5, 2),      -- Omuz (cm)
    chest NUMERIC(5, 2),         -- Göğüs (cm)
    biceps NUMERIC(5, 2),        -- Kol / Pazu (cm)
    waist NUMERIC(5, 2),         -- Bel (cm)
    hips NUMERIC(5, 2),          -- Kalça (cm)
    thigh NUMERIC(5, 2),         -- Üst Bacak (cm)
    calf NUMERIC(5, 2),          -- Kalf / Baldır (cm)
    body_fat NUMERIC(4, 1),      -- Yağ Oranı %
    par_q_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TANITA CLINICAL PDF ANALYSIS REPORTS VAULT
CREATE TABLE IF NOT EXISTS public.tanita_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. WORKOUT TEMPLATES LIBRARY
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_focus TEXT, -- e.g. 'Hipertrofi', 'Bacak & Kalça', 'Definisyon'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    default_sets INT NOT NULL DEFAULT 3,
    default_reps INT NOT NULL DEFAULT 10,
    default_rest_sec INT NOT NULL DEFAULT 60
);

-- 6. LIVE WORKOUT SESSIONS & SET VOLUME ENGINE
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Günlük Antrenman',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_seconds INT DEFAULT 0,
    total_volume_kg NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    set_number INT NOT NULL DEFAULT 1,
    weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    prev_weight_kg NUMERIC(6, 2) DEFAULT 0.00,
    reps INT NOT NULL DEFAULT 10,
    rest_time_sec INT DEFAULT 60,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. NUTRITION TEMPLATES & DIET PLANS
CREATE TABLE IF NOT EXISTS public.nutrition_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g. 'High Protein Kas Kazanımı (2500 kcal)'
    target_calories INT NOT NULL DEFAULT 2000,
    target_protein_g INT NOT NULL DEFAULT 150,
    target_carbs_g INT NOT NULL DEFAULT 200,
    target_fat_g INT NOT NULL DEFAULT 60,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.diets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_calories INT,
    target_protein_g INT,
    target_carbs_g INT,
    target_fat_g INT,
    meals JSONB NOT NULL DEFAULT '[]'::jsonb,
    trainer_notes TEXT,
    client_meal_image_url TEXT,
    client_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PROGRESS PHOTOS GALLERY
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_label TEXT NOT NULL,
    front_image_url TEXT,
    side_image_url TEXT,
    back_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. APPOINTMENTS & SESSIONS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tanita_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data or trainers to view their clients
CREATE POLICY "Profiles readable by owner or trainer" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR auth.uid() = trainer_id);

CREATE POLICY "Profiles updateable by owner" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Packages readable by client or trainer" ON public.packages
    FOR SELECT TO authenticated
    USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Packages manageable by trainer" ON public.packages
    FOR ALL TO authenticated
    USING (auth.uid() = trainer_id);

CREATE POLICY "Client metrics readable by client or trainer" ON public.client_metrics
    FOR SELECT TO authenticated
    USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Client metrics insertable by trainer or client" ON public.client_metrics
    FOR ALL TO authenticated
    USING (auth.uid() = client_id OR auth.uid() = trainer_id);

-- Profile creation trigger from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
