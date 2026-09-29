# 🚀 Fit-Connect v1.0.0 - 10 Günlük Ürünleştirme ve Play Store Çıkış Yol Haritası

Bu belge, **Fit-Connect (React Native + Expo + Supabase)** projesini **PT-App (Legacy)** sistemindeki tüm kritik iş mantıkları, finansal takip formülleri, antropometrik ölçüm ve antrenman şablonlarıyla birleştirerek **10 gün içinde Google Play Store'da yayınlanabilir ve ticarileştirilebilir (v1.0.0)** seviyeye ulaştırma planıdır.

---

## 🎯 Proje Hedefi & Kapsam Özeti

- **Hedef Kitle:** Birebir Personal Trainer (PT) antrenörleri ve onların özel danışanları.
- **İki Taraflı Etkileşim:**
  - **Antrenör Tarafı:** Danışan yönetimi, paket/kasa & ciro takibi, 9 bölge vücut ölçümü, Tanita PDF arşivi, antrenman & beslenme şablonları, canlı set tonaj takibi ve seans düşümü için QR üretimi.
  - **Danışan Tarafı:** Seans QR okuyucu, kalan ders sayacı, günlük antrenman/set tamamlama, beslenme takip & öğün fotoğrafı yükleme, gelişim galerisi.
- **Tasarım Kimliği:** PT-App Legacy Koyu Mod (`#121212` zemin, `#1E1E1E` kart, `#FF6B00` enerjik turuncu vurgu).

---

## 📅 10 Günlük Detaylı Yol Haritası

### 🔹 Gün 1: Temel Mimari, Veritabanı & Tasarım Sistemi (Backend & Theme)
- **Supabase Şeması:** `profiles`, `packages`, `client_metrics` (9 bölge), `tanita_reports`, `workout_templates`, `nutrition_templates` tablolarının ve RLS politikalarının oluşturulması.
- **Tasarım Tokenları:** PT-App Legacy renk paleti (`#121212`, `#1E1E1E`, `#FF6B00`, `#4CAF50`, `#FFA000`, `#E53935`) ve yuvarlatma kurallarının `ThemeContext` içine entegre edilmesi.
- **Kimlik Doğrulama (Auth):** Supabase Auth entegrasyonu, Antrenör vs. Danışan rol ayrımı ve otomatik yönlendirme.
- **Çıktı:** Stabil veritabanı şeması, güncel TypeScript modelleri, koyu tema altyapısı ve çalışan giriş ekranı.

---

### 🔹 Gün 2: Finansal Yönetim, Kasa & Paket Mantığı (Financial Engine)
- **Paket ve Kasa Verisi:** Paket Ücreti (`packagePrice`), Tahsil Edilen (`paidAmount`), Kalan Borç (`debtAmount = packagePrice - paidAmount`) formülleri.
- **Tahsilat Modalı:** Danışan profilinden tek dokunuşla borç tahsilatı ekleme ve son ödeme tarihi güncelleme.
- **Hızlı Paket Yenileme (+20 Ders):** Tek tıkla +20 ders ve paket ücreti ekleme, durumu otomatik `Aktif` yapma.
- **Antrenör Finans Panosu:** Toplam Ciro (`sum(paidAmount)`) ve Bekleyen Alacak sayaçları.
- **Çıktı:** Antrenörün tüm gelirini ve danışan borçlarını tek ekrandan yönetebileceği finans motoru.

---

### 🔹 Gün 3: Detaylı Antropometrik Ölçümler (9 Bölge Vücut Takibi)
- **9 Bölge Ölçüm Modeli:** Kilo, Boy, Omuz, Göğüs, Kol/Pazu, Bel, Kalça, Üst Bacak, Kalf ölçüm girişi.
- **Zaman Çizelgesi & Geçmiş:** Tarih bazlı ölçüm listesi ve önceki ölçümle değişim farkı (+/- cm/kg).
- **Danışan Kartı Ön Yüzü:** Profil kartında en son ölçümlerin mini metrik rozetleri halinde sergilenmesi.
- **Çıktı:** Vücut geliştirme ve fitness standartlarına uygun kapsamlı ölçüm takip sistemi.

---

### 🔹 Gün 4: Tanita Klinik Vücut Analiz Raporları Arşivi (PDF Vault)
- **Supabase Storage Entegrasyonu:** Tanita ve klinik raporlar için güvenli dosya depolama alanı.
- **PDF Yükleme & Not Ekleme:** Antrenörün analiz PDF'lerini cihazdan seçip tarih ve antrenör notuyla yüklemesi.
- **Belge Görüntüleme & Paylaşım:** Danışan detay sayfasında ve danışanın kendi profilinde arşivlenen raporların listelenmesi ve açılması.
- **Çıktı:** Spor salonu / diyetisyen analiz çıktılarının kaybolmasını önleyen profesyonel arşiv modülü.

---

### 🔹 Gün 5: Antrenman Şablon Kütüphanesi (Workout Templates)
- **Şablon Kütüphanesi Ekranı:** Hipertrofi, definisyon, bacak/kalça odaklı hazır antrenman şablonları.
- **Şablon Olarak Kaydet:** Danışana yazılan özel bir antrenmanı tek tuşla genel şablon kütüphanesine aktarma.
- **Danışana Şablon Ata:** Kütüphanedeki şablonu seçip danışanın takvimine/gününe tek tıkla kopyalama.
- **Çıktı:** Antrenörün her seferinde sıfırdan hareket yazmasını engelleyen zaman kazandırıcı şablon motoru.

---

### 🔹 Gün 6: Canlı Antrenman & Set Hacmi (Volume) Takip Ekranı
- **Canlı Seans Arayüzü (`WorkoutDetailEditScreen`):**
  - Süre sayacı (Canlı Kronometre: `14m 20s`).
  - Set tablosu: Set No, Önceki Ağırlık (Prev), Anlık Ağırlık (kg), Tekrar (Reps), Tamamlandı (Checkbox).
- **🔥 Toplam Hacim / Tonaj Hesabı:** $\sum (\text{Ağırlık} \times \text{Tekrar})$ formülü ile sadece tamamlanan setlerin canlı tonaj rozetinde gösterilmesi.
- **Çıktı:** Salonda birebir antrenman sırasında antrenörün tableti/telefonuyla seansı canlı yönettiği dinamik ekran.

---

### 🔹 Gün 7: Beslenme Planı & Makro Şablonları
- **Makro Hedefleri:** Günlük Hedef Kalori (kcal), Protein (g), Karbonhidrat (g), Yağ (g) ataması.
- **Saatli Öğün Listesi:** Saat, öğün adı, besin içerikleri ve gramajların detaylı listelenmesi.
- **Beslenme Şablonları:** Hazır diyet şablonları oluşturma ve danışana tek tıkla uygulama.
- **Çıktı:** Danışanın ne yiyeceğini tam olarak bildiği, antrenörün kalori reçetesi yazabildiği beslenme modülü.

---

### 🔹 Gün 8: Seans Kuralları, Dinamik Rozetler & Hızlı İletişim
- **Dinamik Durum Yönetimi:**
  - Kalan Ders > 3 $\rightarrow$ `Aktif` (Yeşil rozet)
  - Kalan Ders 1-3 $\rightarrow$ `Az Kaldı` (Turuncu uyarı rozeti)
  - Kalan Ders = 0 $\rightarrow$ `Bitti` (Kırmızı kritik rozet)
- **Hızlı İletişim Butonları:** Danışan profilinden tek dokunuşla WhatsApp mesajı, telefon araması ve SMS başlatma.
- **Linear Progress Bar:** PT-App standartlarında turuncu dolgulu 6px seans ilerleme çubuğu.
- **Çıktı:** Müşteri ilişkilerini ve paket yenileme döngüsünü maksimize eden iletişim/uyarı sistemi.

---

### 🔹 Gün 9: Danışan Deneyimi & QR Kod ile Canlı Seans Düşümü
- **QR Doğrulama Döngüsü:** Antrenörün ürettiği dinamik QR kodunu danışanın kamerasıyla okutarak seansın anlık -1 düşürülmesi.
- **Danışan Portalı İyileştirmeleri:** Kalan ders sayısı, günlük antrenman hareketlerini tamamlama, öğün fotoğrafı yükleme ve gelişim fotoğrafları galerisi.
- **Offline / Hata Toleransı:** İnternet kesintilerinde kullanıcı dostu uyarılar ve veri senkronizasyonu.
- **Çıktı:** İki tarafın da senkronize çalıştığı kusursuz danışan deneyimi.

---

### 🔹 Gün 10: Uçtan Uca Test, Mağaza Hazırlığı & Play Store Yayın Paketi
- **Performans & Stabilite:** Bellek sızıntılarının giderilmesi, sayfa geçiş animasyonlarının optimize edilmesi.
- **Play Store Varlıkları:** Uygulama simgesi (App Icon), Splash Screen, Google Play mağaza ekran görüntüleri ve tanıtım metinleri.
- **Build & Yayın:** EAS Build ile production Android App Bundle (`.aab`) derlenmesi ve Google Play Console hazırlığı.
- **Çıktı:** Play Store'a yüklenmeye hazır **Fit-Connect v1.0.0** üretim sürümü.

---

## 🏆 Başarı Kriterleri (Definition of Done)
1. PT-App Legacy dokümanında listelenen tüm özelliklerin ve tokenların aktarılmış olması.
2. Hem Antrenör hem Danışan girişlerinin sorunsuz çalışması.
3. Kasa/Finans, 9 Bölge Ölçüm ve Canlı Tonaj formüllerinin hatasız hesaplama yapması.
4. Google Play Store yönergelerine uygun production APK/AAB çıktısının hazır olması.
