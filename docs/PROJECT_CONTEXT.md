# FIT-CONNECT - PROJE DÖKÜMANTASYONU & BAĞLAM (CONTEXT) 🏋️‍♂️📱

Bu döküman, **Fit-Connect** projesinin başlangıçtan bugüne tüm kararlarını, ekran mimarisini, veri modelini ve yayına (release) giden yol haritasını içerir. Yeni açılacak Antigravity konuşmasında bu dosyayı referans alarak sıfır kayıpla devam edilecektir.

---

## 🎯 Projenin Amacı ve Hedefi
Fit-Connect, kişisel antrenörler (**Personal Trainer**) ve birebir çalıştıkları danışanlar (**Clients**) arasındaki tüm seans yönetimini, antrenman programlarını, beslenme takiplerini ve vücut ölçüm geçmişini dijitalleştiren bir mobil SaaS ürünüdür.

- **Kullanıcı Kararı:** Bu proje sadece bir test projesi olarak kalmayacak; **tasarımı, veritabanı ve kullanıcı deneyimi mükemmelleştirilerek App Store ve Google Play üzerinde canlıya (release) alınacaktır.**
- **GitHub Reposu:** `https://github.com/taylan1477/Fit-Connect`
- **Yerel Klasör:** `C:\Projeler\Fit-Connect`

---

## 🛠️ Teknoloji Yığını ve Mimari
- **Framework:** React Native (Expo SDK 52+, TypeScript)
- **Navigasyon:** `@react-navigation/native` & `@react-navigation/native-stack` v7
- **Bileşenler & Donanım Erişimi:**
  - `react-native-qrcode-svg`: Antrenör tarafında dinamik, güvenli seans düşürme QR kodu üretimi.
  - `expo-camera` (`CameraView`): Danışan tarafında QR kodu tarayıp seansı anında düşürme.
  - `expo-image-picker`: Öğün fotoğrafları ve gelişim galerisi yüklemeleri.
- **Backend & Veritabanı:** Supabase (`@supabase/supabase-js`)
  - Kimlik doğrulama (Auth), PostgreSQL ilişkisel veritabanı, Row Level Security (RLS) ve dosya depolama (Storage).
- **Stil Stratejisi:** Temiz ve performanslı saf React Native `StyleSheet` (Tailwind / NativeWind karmaşası temizlendi).

---

## 📱 Mevcut Ekranlar ve Fonksiyonel Durum

Tüm ekranlar `src/screens/` altında modüler olarak kodlanmış ve `src/navigation/AppNavigator.tsx` içerisindeki Stack Navigator'a bağlanmıştır:

### 1. Antrenör Modülü (Trainer)
- `TrainerDashboard.tsx`: Antrenör karşılama ekranı, aktif danışan sayısı, "QR Oluştur" butonu ve "Danışanlarım" listesine hızlı geçiş.
- `ClientListScreen.tsx`: Antrenöre kayıtlı danışanların kartları (kalan seans sayısı, son antrenman tarihi vb.). Tıklanınca detay ekranına gider.
- `ClientDetailScreen.tsx`: Seçilen danışanın detayları, kilo/yağ metrikleri, antrenman programı atama ve diyet listesi ekleme butonları.
- `QRGeneratorScreen.tsx`: Antrenörün ürettiği, `{ type: 'SESSION_DEDUCT', trainerId: '...', timestamp: ... }` JSON payload'ını içeren ve belirli sürelerde yenilenen dinamik QR kod ekranı.

### 2. Danışan Modülü (Client)
- `ClientDashboard.tsx`: Danışanın ana merkezi; kalan seans sayacı, "QR Oku (Seans Düşür)", "Bugünkü Antrenmanım", "Öğün Takibi", "Gelişim Galerisi" ve "Ölçümlerim" butonları.
- `QRScannerScreen.tsx`: Kamerayı tam ekran açarak antrenörün QR kodunu tarar. Başarılı okumada *"Seansınız başarıyla düşüldü!"* uyarısı verir.
- `DailyWorkoutScreen.tsx`: O gün yapılması gereken egzersizler, set ve tekrar sayıları. Danışan hareketleri yaptıkça checkbox ile işaretler (`is_completed`).
- `DietTrackerScreen.tsx`: Günün kahvaltı, öğle, akşam ve ara öğün fotoğraflarını yükleme ve antrenöre not bırakma alanı.
- `ProgressGalleryScreen.tsx`: Danışanın haftalık/aylık ön, yan ve arka boy fotoğraflarını yan yana karşılaştırma galerisi.
- `MyMetricsScreen.tsx`: Kilo, boy, yağ oranı, kas kütlesi (Tanita) ve PAR-Q sağlık anketi geçmişi.

---

## 🚀 Yayına (Release) Hazırlık Yol Haritası

Bir sonraki conversation'da sırasıyla yapılması gereken görevler:

1. **Faz 1: Supabase Gerçek Veritabanı Bağlantısı (Backend Entegrasyonu)**
   - `trainers`, `clients`, `sessions`, `workouts`, `diets`, `metrics` tablolarının Supabase üzerinde oluşturulması.
   - `src/services/api.ts` ve mock dataların gerçek Supabase API çağrılarıyla değiştirilmesi.
2. **Faz 2: Giriş ve Rol Yönetimi (Auth Flow)**
   - Login / Register ekranları.
   - Giriş yapan kullanıcının rolüne göre (Trainer vs. Client) ilgili Dashboard'a otomatik yönlendirme.
3. **Faz 3: UI/UX & Tema Cilalama**
   - Karanlık/Aydınlık tema desteği (`ThemeContext.tsx`).
   - Yüklenme durumları (Skeletons/Spinners), modern hata pop-up'ları ve boş durum (Empty State) görselleri.
4. **Faz 4: Mağaza Dağıtımı (EAS Build)**
   - `app.json` içinde bundle identifier (`com.taycore.fitconnect`) ayarları.
   - Android APK / AAB ve iOS IPA derlemeleri için Expo Application Services (EAS) yapılandırması.
