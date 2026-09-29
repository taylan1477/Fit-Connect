# Fit-Connect 🏋️‍♂️📱

Fit-Connect, kişisel antrenörler (Personal Trainer) ve danışanları arasındaki seans takibi, antrenman programları, diyet kayıtları ve fiziksel gelişim metriklerini dijitalleştiren modern bir **React Native (Expo)** mobil uygulamasıdır.

## 🚀 Temel Özellikler

### 🧑‍🏫 Antrenör (Trainer Hub)
- **Danışan Listesi ve Detay:** Danışanların seans durumları, ölçümleri ve geçmişi.
- **Dinamik QR Kod Oluşturma:** Seans düşürmek için anlık güvenli QR kod üretimi.
- **Antrenman & Diyet Planı Atama:** Danışana özel haftalık egzersiz ve beslenme listesi tanımlama.

### 🏃‍♂️ Danışan (Client Hub)
- **Hızlı QR Tarayıcı:** Antrenörün QR kodunu tarayarak tek dokunuşla seans tamamlama ve bakiye düşümü.
- **Günlük Antrenman Takvimi:** Atanan hareketler, set/tekrar sayıları ve tamamlandı onay kutuları.
- **Diyet ve Öğün Takibi:** Günlük öğün fotoğrafları ve beslenme notları.
- **Gelişim Galerisi & Metrikler:** Tanita vücut analizi, kilo değişim grafikleri ve gelişim fotoğrafları.

## 🛠️ Teknoloji Yığını
- **Frontend:** React Native (Expo SDK 52+)
- **Dil:** TypeScript
- **Navigasyon:** React Navigation v7 (Stack & Bottom Tabs)
- **Veritabanı & Backend:** Supabase (Auth, PostgreSQL, Storage)
- **Stil:** React Native StyleSheet

## 📦 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npx expo start
```
Expo Go uygulamasını telefonunuza yükleyip ekrandaki QR kodu tarayarak anında test edebilirsiniz.
