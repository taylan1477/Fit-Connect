# Graph Report - Fit-Connect  (2026-11-09)

## Corpus Check
- 34 files · ~35,433 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 318 nodes · 620 edges · 33 communities (16 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90c5cf07`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppNavigator.tsx
- 📋 Fit-Connect Development Tasks
- api.ts
- expo
- 📜 PT-App Legacy: Tasarım Sistemi, İş Mantığı ve Eksik Özellikler Kılavuzu
- 📅 10 Günlük Detaylı Yol Haritası
- dependencies
- Fit-Connect 🏋️‍♂️📱
- package.json
- SYSTEM INSTRUCTION FOR AGENT
- FIT-CONNECT - PROJE DÖKÜMANTASYONU & BAĞLAM (CONTEXT) 🏋️‍♂️📱
- App.tsx
- AGENTS.md
- tsconfig.json
- scripts
- expo-sharing
- create-client/index.ts
- expo
- expo-camera
- expo-document-picker
- expo-linear-gradient
- @expo/metro-runtime@~57.0.16
- expo-print@~57.0.2
- react-dom@19.2.3
- @react-native-async-storage/async-storage
- @react-native-community/datetimepicker
- @react-native-picker/picker
- react-native-qrcode-svg
- react-native-svg@15.15.4
- react-native-web@^0.21.2
- @react-navigation/bottom-tabs
- @react-navigation/native-stack

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 31 edges
2. `react` - 18 edges
3. `react-native` - 17 edges
4. `@expo/vector-icons` - 16 edges
5. `api` - 13 edges
6. `expo` - 12 edges
7. `formatDisplayDate()` - 11 edges
8. `getTodayDisplayDate()` - 11 edges
9. `📅 10 Günlük Detaylı Yol Haritası` - 11 edges
10. `isSupabaseConfigured` - 10 edges

## Surprising Connections (you probably didn't know these)
- `4. CORE BUSINESS LOGIC (CRITICAL PATHS)` --references--> `QRGeneratorScreen()`  [INFERRED]
  docs/REQUIREMENTS.md → src/screens/QRGeneratorScreen.tsx
- `5. AGENT EXECUTION PLAN` --references--> `QRGeneratorScreen()`  [INFERRED]
  docs/REQUIREMENTS.md → src/screens/QRGeneratorScreen.tsx
- `Client Hub (Role: Client)` --references--> `QRScannerScreen()`  [INFERRED]
  docs/REQUIREMENTS.md → src/screens/QRScannerScreen.tsx
- `1. Client Detail Screen (Metrics Update)` --references--> `ClientMetric`  [INFERRED]
  task.md → src/types/index.ts
- `1. Document & File Handling Engine` --references--> `TanitaReport`  [INFERRED]
  task.md → src/types/index.ts

## Import Cycles
- None detected.

## Communities (33 total, 17 thin omitted)

### Community 0 - "AppNavigator.tsx"
Cohesion: 0.12
Nodes (46): Client Hub (Role: Client), Trainer Hub (Role: Trainer), @expo/vector-icons, react, react-native, react-native-safe-area-context, PTTheme, ThemeContext (+38 more)

### Community 1 - "📋 Fit-Connect Development Tasks"
Cohesion: 0.05
Nodes (42): MealItem, 1. Canlı QR Seans Düşümü, 1. Data Models & API Engine, 1. Data Models & API Services, 1. Database & Supabase Schema, 1. Trainer Dashboard, 1. Workout Templates Library, 2. Client Interface (DailyWorkoutScreen) (+34 more)

### Community 2 - "api.ts"
Cohesion: 0.09
Nodes (32): DIET_TYPES, styles, ClientItemData, STATUS_FILTERS, styles, mockDiets, mockMetrics, mockNutritionTemplates (+24 more)

### Community 3 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, foregroundImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android, icon, ios (+13 more)

### Community 4 - "📜 PT-App Legacy: Tasarım Sistemi, İş Mantığı ve Eksik Özellikler Kılavuzu"
Cohesion: 0.11
Nodes (17): 🎨 1. Tasarım Sistemi & UI/UX Tokenları, 💰 2. Finansal Yönetim & Kasa Mantığı (Fit-Connect'te Eksik), 📐 3. Detaylı Antropometrik Ölçümler & Tanita PDF Arşivi, 🏋️ 4. Antrenman Şablonları & Canlı Set/Hacim Takip Ekranı, 🥗 5. Beslenme Planı & Makro Şablonları, ⏱ 6. Seans Kuralları & Durum Yönetimi Mantığı, 9 Bölge Vücut Ölçüm Modeli, A. Şablon Kütüphanesi (Workout Templates) (+9 more)

### Community 5 - "📅 10 Günlük Detaylı Yol Haritası"
Cohesion: 0.11
Nodes (17): 📅 10 Günlük Detaylı Yol Haritası, 1. Online Kayıt ve Kimlik Doğrulama (Auth) Servisi, 2. Online Servisi Canlıya Alma Adımları (Deployment Checklist), 🏆 Başarı Kriterleri (Definition of Done), 🚀 Fit-Connect v1.0.0 - 10 Günlük Ürünleştirme ve Play Store Çıkış Yol Haritası, 🔹 Gün 10: Uçtan Uca Test, Mağaza Hazırlığı & Play Store Yayın Paketi, 🔹 Gün 1: Temel Mimari, Veritabanı & Tasarım Sistemi (Backend & Theme), 🔹 Gün 2: Finansal Yönetim, Kasa & Paket Mantığı (Financial Engine) (+9 more)

### Community 6 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo-image-picker@~57.0.20, expo-status-bar@~57.0.1, @expo/vector-icons@^15.0.2, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0 (+7 more)

### Community 7 - "Fit-Connect 🏋️‍♂️📱"
Cohesion: 0.15
Nodes (12): 1. Bağımlılıkları Yükleyin, 2. Ortam Değişkenlerini Tanımlayın, 3. Geliştirme Sunucusunu Başlatın, 4. Tip Kontrolü, 🧑‍🏫 Antrenör Paneli (Trainer Hub), 🏃‍♂️ Danışan Portalı (Client Hub), Fit-Connect 🏋️‍♂️📱, 📦 Kurulum ve Çalıştırma (+4 more)

### Community 8 - "package.json"
Cohesion: 0.21
Nodes (11): devDependencies, @expo/ngrok@^4.1.3, @types/react@~19.2.2, typescript@~6.0.3, main, name, private, version (+3 more)

### Community 9 - "SYSTEM INSTRUCTION FOR AGENT"
Cohesion: 0.22
Nodes (9): 1. PROJECT OVERVIEW, 2. DATABASE SCHEMA (Supabase PostgreSQL), 3. UI/UX SCREENS & ROUTING, 4. CORE BUSINESS LOGIC (CRITICAL PATHS), 5. AGENT EXECUTION PLAN, Auth Stack, SYSTEM INSTRUCTION FOR AGENT, LoginScreen() (+1 more)

### Community 10 - "FIT-CONNECT - PROJE DÖKÜMANTASYONU & BAĞLAM (CONTEXT) 🏋️‍♂️📱"
Cohesion: 0.25
Nodes (7): 1. Antrenör Modülü (Trainer), 2. Danışan Modülü (Client), FIT-CONNECT - PROJE DÖKÜMANTASYONU & BAĞLAM (CONTEXT) 🏋️‍♂️📱, 📱 Mevcut Ekranlar ve Fonksiyonel Durum, 🎯 Projenin Amacı ve Hedefi, 🛠️ Teknoloji Yığını ve Mimari, 🚀 Yayına (Release) Hazırlık Yol Haritası

### Community 11 - "App.tsx"
Cohesion: 0.47
Nodes (4): App(), styles, AppNavigator(), MainStack()

### Community 12 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 13 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, exclude, extends

### Community 14 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, android, ios, start, web

### Community 15 - "expo-sharing"
Cohesion: 0.33
Nodes (4): expo-sharing@~57.0.22, @react-navigation/native@^7.4.1, expo-sharing, @react-navigation/native

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 150 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TanitaReport` connect `api.ts` to `AppNavigator.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppNavigator.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11639344262295082 - nodes in this community are weakly interconnected._
- **Why does `MealItem` connect `📋 Fit-Connect Development Tasks` to `AppNavigator.tsx`, `api.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `📋 Fit-Connect Development Tasks` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09365079365079365 - nodes in this community are weakly interconnected._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._