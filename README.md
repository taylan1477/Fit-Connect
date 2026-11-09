# Fit-Connect 🏋️‍♂️📱

Fit-Connect, kişisel antrenörler (Personal Trainer) ile danışanları arasındaki tüm operasyonel, finansal ve sportif süreçleri dijitalleştiren modern, uçtan uca **React Native (Expo)** ve **Supabase** tabanlı bir mobil ekosistemdir.

Legacy PT-App iş mantıklarını modern bulut mimarisiyle birleştiren Fit-Connect; paket/kasa yönetiminden 9 bölge antropometrik ölçümlere, Tanita klinik PDF arşivinden canlı tonaj takipli antrenmanlara, makro beslenme motorundan QR kodlu anlık seans düşümüne kadar eksiksiz bir çözüm sunar.

---

## 🚀 Temel Özellikler ve Modüller

### 🧑‍🏫 Antrenör Paneli (Trainer Hub)
- **Finansal Kasa ve Ciro Takibi:** Toplam tahsil edilen ciro, bekleyen danışan alacakları, tek tıkla tahsilat girişi ve +20 ders hızlı paket yenileme.
- **Danışan Yönetimi & Güvenli Kayıt (Yöntem B):** Antrenör oturumu kapanmadan, Supabase Edge Function (`create-client`) üzerinden RBAC yetkilendirmesiyle güvenli danışan hesabı oluşturma.
- **9 Bölge Antropometrik Ölçüm:** Kilo, boy, omuz, göğüs, kol/pazu, bel, kalça, üst bacak ve kalf ölçümlerinin takibi; zaman çizelgesinde önceki ölçüme göre `+/-` fark analizi.
- **Tanita Klinik PDF Vault:** `expo-document-picker` ve `expo-sharing` ile Tanita vücut analizi raporlarını arşivleme, paylaşma ve görüntüleme.
- **Antrenman Şablon Kütüphanesi:** Hipertrofi, definasyon, bacak/kalça odaklı şablonlar oluşturma, danışana tek tıkla atama ve mevcut antrenmanı şablon olarak kaydetme.
- **Canlı Seans & Tonaj (Volume) Takibi:** Canlı seans kronometresi, set/tekrar tablosu ve $\sum (\text{Ağırlık} \times \text{Tekrar})$ formülüyle dinamik toplam tonaj hesabı.
- **Beslenme & Makro Şablonları:** 4-4-9 formülüyle kalori/makro (Protein, Karbonhidrat, Yağ) hesaplama, saatli öğün listeleri ve şablondan danışana diyet atama.
- **Dinamik Rozetler & Seans Kuralları:** `Aktif` (>3 ders), `Az Kaldı` (1-3 ders) ve `Bitti` (0 ders) durumları, 6px linear progress bar.
- **Hızlı İletişim Entegrasyonları:** Danışan profilinden tek dokunuşla WhatsApp mesajı, telefon araması ve SMS başlatma.
- **Dinamik QR Kod Üretici:** Sahteciliği önleyen zaman damgalı, seans düşümüne özel anlık QR kod üretimi.

### 🏃‍♂️ Danışan Portalı (Client Hub)
- **Kamera ile Hızlı QR Okuyucu:** Antrenörün QR kodunu tarayarak anında seans düşümü ve animasyonlu başarı modalı.
- **Kalan Seans & Paket Durumu:** Dinamik durum rozetleri, seans ilerleme çubuğu ve antrenöre doğrudan hızlı iletişim butonları.
- **İnteraktif Günlük Antrenman:** Atanan hareketler, ağırlık/tekrar düzenleme, set bazlı tamamlandı onay kutuları ve canlı seans süresi.
- **Makro Hedefli Diyet Takibi:** Günlük kalori ve makro dağılımı, saatli öğünler, öğün tamamlama ve kameradan/galeriden tabak fotoğrafı yükleme.
- **Gelişim Galerisi & Before/After:** Ön, yan ve arka poz etiketleme, haftalık form fotoğrafları ve kilo değişim karşılaştırması.
- **Tanita ve Ölçüm Geçmişi:** Vücut ölçüm geçmişi ve antrenörün yüklediği Tanita PDF raporlarına doğrudan erişim.

---

## 🛠️ Teknoloji Yığını

- **Mobil Çerçeve:** React Native & Expo SDK 57
- **Dil:** TypeScript (~6.0)
- **Navigasyon:** React Navigation v7 (Native Stack & Bottom Tabs)
- **Tasarım Sistemi:** PT-App Koyu Mod (`#121212`, `#1E1E1E`, `#FF6B00`) & React Native StyleSheet
- **Backend & Veritabanı:** Supabase (PostgreSQL, Row Level Security, Auth Trigger)
- **Bulut Fonksiyonları:** Supabase Edge Functions (Deno / TypeScript)
- **Donanım ve Medya:** `expo-camera`, `expo-image-picker`, `expo-document-picker`, `expo-sharing`, `react-native-qrcode-svg`
- **Çift Modlu Çalışma:** Hem canlı Supabase Cloud hem de kesintisiz yerel çevrimdışı (mock) geliştirme desteği.

---

## 📁 Proje Yapısı

```text
fit-connect/
├── assets/                     # İkon ve splash görselleri
├── src/
│   ├── context/
│   │   └── ThemeContext.tsx    # PT-App Legacy Dark/Light tema sistemi ve tokenlar
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Rol bazlı Auth, Trainer ve Client navigasyon akışı
│   ├── screens/
│   │   ├── TrainerDashboard.tsx         # Kasa & Finans özeti paneli
│   │   ├── ClientListScreen.tsx         # Danışan filtreleme ve yeni danışan modalı
│   │   ├── ClientDetailScreen.tsx       # Kapsamlı danışan profili, ölçümler ve şablon atama
│   │   ├── ClientMetricsHistoryScreen.tsx # 9 bölge ölçüm zaman çizelgesi (+/- farklar)
│   │   ├── WorkoutTemplatesScreen.tsx   # Antrenman şablon kütüphanesi
│   │   ├── NutritionTemplatesScreen.tsx # Beslenme & makro şablon kütüphanesi
│   │   ├── DailyWorkoutScreen.tsx       # Canlı antrenman, kronometre ve tonaj ekranı
│   │   ├── DietTrackerScreen.tsx        # Günlük makro ve öğün fotoğrafı takip ekranı
│   │   ├── ProgressGalleryScreen.tsx    # Form fotoğrafları ve Before/After kıyaslama
│   │   ├── MyMetricsScreen.tsx          # Danışan ölçüm ve Tanita PDF görüntüleme
│   │   ├── QRGeneratorScreen.tsx        # Seans düşüm QR üretici
│   │   └── QRScannerScreen.tsx          # Seans QR okuyucu ve onay modalı
│   ├── services/
│   │   └── api.ts              # Supabase Cloud & Mock hibrit servis katmanı
│   ├── types/
│   │   └── index.ts            # Veritabanı ve iş modelleri TypeScript tipleri
│   └── utils/
│       ├── date.ts             # GG-AA-YYYY formatlayıcıları
│       └── supabase.ts         # Supabase istemci yapılandırması
├── supabase/
│   ├── functions/
│   │   └── create-client/      # RBAC yetkili Danışan Oluşturma Edge Function'ı
│   └── schema.sql              # Tablolar, RLS kuralları ve Auth trigger'ları
├── package.json
└── README.md
```

---

## 📦 Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Ortam Değişkenlerini Tanımlayın
Kök dizinde bir `.env` dosyası oluşturun ve Supabase bilgilerinizi ekleyin (tanımlanmadığında uygulama otomatik olarak çevrimdışı mock modunda çalışır):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npx expo start -c
```
- **Fiziksel Cihaz:** Expo Go uygulamasını açıp terminaldeki QR kodu taratın.
- **Android Emülatör:** Terminalde `a` tuşuna basın.
- **Web Önizleme:** Terminalde `w` tuşuna basın.

### 4. Tip Kontrolü
```bash
cmd /c "npx tsc --noEmit"
```

---

## 📄 Lisans
Bu proje özel mülkiyet altındadır. Tüm hakları saklıdır.
