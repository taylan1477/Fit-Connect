# 📋 Fit-Connect Development Tasks

## ✅ Day 1: Foundation, Supabase Schema & PT-App Design System
**Status:** Completed

### 1. Database & Supabase Schema
- [x] Create comprehensive SQL migration script `supabase/schema.sql`.
- [x] Create tables: `profiles`, `packages`, `client_metrics`, `tanita_reports`, `workout_templates`, `workouts`, `nutrition_templates`, `diets`.

### 2. TypeScript Domain Types
- [x] Update `src/types/index.ts` to export full types for all database models.

### 3. PT-App Legacy Design Tokens & Theme Engine
- [x] Overhaul `src/context/ThemeContext.tsx` with Dark Mode tokens.

### 4. Authentication & Role-Based Navigation
- [x] Update `src/navigation/AppNavigator.tsx` with Supabase Auth integration.

### 5. API Services
- [x] Extend `src/services/api.ts`.

---

## 🚀 Day 2: Financial Engine (Trainer Dashboard & Packages)
**Status:** Completed
**Target Delivery:** Dynamic revenue counters, payment collection modals, and rapid package renewals using legacy PT-App logic.

### 1. Trainer Dashboard
- [x] Fetch all clients and their active packages on load.
- [x] Calculate **Total Revenue** (Sum of all `paid_amount`).
- [x] Calculate **Pending Debt** (Sum of `package_price - paid_amount`).
- [x] Render prominently via `ThemeContext` (Success & Warning colors).

### 2. Client Detail Screen (Financials)
- [x] Fetch active `Package` object from Supabase.
- [x] Render a new **"Financial Status"** card (Price, Paid, Debt).
- [x] **Collect Payment Modal:** allow inputting amount and updating `paid_amount`.
- [x] **Quick Package Renew (+20):** 1-click renewal triggering `api.renewPackage()`.
- [x] Migrate the rest of the screen to `ThemeContext`.
