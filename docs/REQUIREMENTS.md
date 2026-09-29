# SYSTEM INSTRUCTION FOR JARVIS SWARM
You are an autonomous AI development swarm orchestrating the creation of a Personal Trainer (PT) Mobile Application MVP. 
Your goal is to parse this document and execute the development phases sequentially. 

## 1. PROJECT OVERVIEW
**Name:** PT-Connect (MVP)
**Description:** A mobile application serving two user roles: Trainer and Client. It handles onboarding metrics, workout/diet assignments, progress tracking (photos), calendar scheduling, and QR-code-based session deduction.
**Tech Stack Required:**
- **Frontend/Mobile:** React Native (Expo) with TypeScript, NativeWind (Tailwind).
- **Backend/Database:** Supabase (PostgreSQL for data, Auth for authentication, Storage for images).
- **Architecture:** Client-Server, single repository, role-based conditional rendering.

---

## 2. DATABASE SCHEMA (Supabase PostgreSQL)
*Agent-Core must initialize these tables and RLS (Row Level Security) policies first.*

1. **Users:** `id` (uuid), `email`, `role` (enum: 'trainer', 'client'), `full_name`, `created_at`.
2. **Client_Metrics:** `id`, `client_id` (fk), `weight`, `height`, `body_fat`, `par_q_data` (jsonb), `date`.
3. **Packages:** `id`, `client_id` (fk), `total_sessions` (int), `remaining_sessions` (int).
4. **Workouts:** `id`, `client_id` (fk), `date`, `status` (enum: 'pending', 'completed').
5. **Workout_Exercises:** `id`, `workout_id` (fk), `exercise_name`, `sets` (int), `reps` (int), `weight_kg` (float), `rest_time_sec` (int), `is_completed` (boolean).
6. **Diets:** `id`, `client_id` (fk), `date`, `trainer_notes` (text), `client_meal_image_url` (text), `client_notes` (text).
7. **Progress_Photos:** `id`, `client_id` (fk), `week_label` (e.g., 'Week 4', 'Week 8'), `front_image_url`, `side_image_url`, `back_image_url`, `created_at`.
8. **Appointments:** `id`, `client_id` (fk), `trainer_id` (fk), `date_time`, `status` (enum: 'available', 'booked', 'cancelled').

---

## 3. UI/UX SCREENS & ROUTING
*Agent-UI must create these screens using functional components and React Navigation.*

### Auth Stack
- `LoginScreen`: Email/password login. Routes to Trainer/Client Hub based on role.

### Trainer Hub (Role: Trainer)
- `TrainerDashboard`: Overview of today's appointments and pending client reviews.
- `ClientListScreen`: List of assigned clients.
- `ClientDetailScreen`: View metrics, assign workouts/diets, view progress photos.
- `WorkoutBuilderScreen`: Form to add `Workout_Exercises` (Sets, Reps, Kg, Rest).
- `TrainerCalendarScreen`: Manage availability, approve/deny booking requests.
- `QRGeneratorScreen`: Generates a unique, time-sensitive QR code containing `{ trainer_id, package_id, timestamp }` for the current session.

### Client Hub (Role: Client)
- `ClientDashboard`: Summary of today's tasks (Workout, Diet).
- `MyMetricsScreen`: View historical Tanita/PAR-Q data (with PDF export logic using `expo-print`).
- `DailyWorkoutScreen`: Checklist UI to mark `is_completed` for each assigned exercise.
- `DietTrackerScreen`: Upload meal photos to Supabase Storage and add notes.
- `ProgressGalleryScreen`: Upload and view physical changes (4, 6, 8, 12 weeks).
- `ClientCalendarScreen`: View empty slots of the trainer and request bookings/changes.
- `QRScannerScreen`: Opens device camera to scan Trainer's QR code.

---

## 4. CORE BUSINESS LOGIC (CRITICAL PATHS)

**Feature A: QR Session Deduction**
1. Trainer opens `QRGeneratorScreen`. App creates a secure JSON payload.
2. Client opens `QRScannerScreen` and scans the code.
3. Client app sends API request to Backend: `decrementSession(client_id, trainer_id)`.
4. Backend verifies condition: `if (packages.remaining_sessions > 0)`.
5. If valid, decrement by 1, return success. Both screens update via real-time subscription.

**Feature B: Progress & File Uploads**
- Use `expo-image-picker` for capturing meal photos and physical progress.
- Images must be uploaded to Supabase Storage buckets (`meals`, `progress_photos`) before saving the URL to the PostgreSQL database.

---

## 5. SWARM EXECUTION PLAN

**Phase 1: Project Setup (Agent-Core)**
- Initialize React Native Expo app.
- Install dependencies: `@supabase/supabase-js`, `react-navigation`, `nativewind`, `expo-camera`, `expo-image-picker`, `react-native-qrcode-svg`.
- Set up Supabase client utility (`src/utils/supabase.ts`).

**Phase 2: Data Access Layer (Agent-Core)**
- Generate types based on the Database Schema.
- Create API service functions (`src/services/`) for CRUD operations on all tables.

**Phase 3: UI Implementation (Agent-UI)**
- Build layout wrappers and navigation stacks (`AppNavigator.tsx`).
- Implement Auth screens.
- Implement Trainer Hub screens with mock data first, then wire to services.
- Implement Client Hub screens with mock data first, then wire to services.

**Phase 4: Hardware Integration (Agent-UI & Agent-Core)**
- Implement `expo-camera` logic on `QRScannerScreen`.
- Implement QR generation on `QRGeneratorScreen`.
- Wire the session deduction logic to the Supabase backend.

**Phase 5: Polish & Run (Master Orchestrator)**
- Review codebase for missing imports or TypeScript errors.
- Ensure role-based routing cannot be bypassed.
- Terminate swarm execution and report success.
