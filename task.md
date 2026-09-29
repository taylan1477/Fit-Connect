# 📋 Day 1 Task: Foundation, Supabase Schema & PT-App Design System

**Status:** In Progress  
**Target Delivery:** Full database schema, updated TypeScript domain types, PT-App Dark Theme System (`ThemeContext`), and Supabase Auth flow with role detection.

---

## 🎯 Day 1 Goals & Checklist

### 1. Database & Supabase Schema
- [x] Create comprehensive SQL migration script `supabase/schema.sql`:
  - `profiles` table (Trainer vs Client roles, full name, phone number for quick call/WhatsApp, avatar URL).
  - `packages` table with legacy financial tracking (`package_price`, `paid_amount`, `last_payment_date`, `total_sessions`, `remaining_sessions`).
  - `client_metrics` table with complete 9-point anthropometric measurements:
    - Weight (kg), Height (cm)
    - Shoulder (cm), Chest (cm), Biceps (cm)
    - Waist (cm), Hips (cm), Thigh (cm), Calf (cm)
    - Body fat percentage & trainer notes
  - `tanita_reports` table for PDF body composition scan reports.
  - `workout_templates` & `workout_template_exercises` for trainer template library.
  - `workouts` & `workout_exercises` with set-level volume tracking (`weight_kg`, `reps`, `is_completed`, `prev_weight_kg`).
  - `nutrition_templates` & `diets` with macro targets (calories, protein, carbs, fats) and meal schedules.
  - Row Level Security (RLS) policies and performance indexes.

### 2. TypeScript Domain Types
- [x] Update `src/types/index.ts` to export full types for all database models, financial calculations, and 9-point anthropometric data.

### 3. PT-App Legacy Design Tokens & Theme Engine
- [x] Overhaul `src/context/ThemeContext.tsx`:
  - Background: `#121212` (Scaffold Dark)
  - Surface/Card: `#1E1E1E`
  - Primary Accent: `#FF6B00` (Energetic Orange)
  - Accent Glow: `rgba(255, 107, 0, 0.25)`
  - Financial Success: `#4CAF50`
  - Warning/Alert: `#FFA000`
  - Danger/Expired: `#E53935`
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#9E9E9E`
  - Border/Divider: `#2C2C2C`
  - Standard border radius tokens (`card: 14`, `button: 10`, `badge: 6`, `sheet: 24`).

### 4. Authentication & Role-Based Navigation
- [x] Update `src/navigation/AppNavigator.tsx`:
  - Supabase Auth integration (`signInWithPassword` & `signUp`).
  - Automatic profile fetching to route to `TrainerHub` vs `ClientHub`.
  - Maintain quick one-tap demo credentials for rapid local previewing.
  - Apply dark PT-App visual styling across login and navigation headers.

### 5. API Services
- [x] Extend `src/services/api.ts` to support querying packages, financial totals, and metrics.
