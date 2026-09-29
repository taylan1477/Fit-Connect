# 📜 PT-App Legacy: Tasarım Sistemi, İş Mantığı ve Eksik Özellikler Kılavuzu

Bu belge, **PT-App (Flutter)** projesinde tasarlanmış, denenmiş ve doğrulanmış tüm **UI/UX tasarım ögelerini, veri modellerini, finansal formülleri ve antrenör araçlarını** eksiksiz olarak kayda geçirir.

**Amaç:** `Fit-Connect (React Native + Expo + Supabase)` geliştirilirken bu kararların ve özelliklerin hiçbirinin kaybolmamasını sağlamak, Fit-Connect'e bir transfer rehberi sunmaktır.

---

## 🎨 1. Tasarım Sistemi & UI/UX Tokenları

PT-App'in görsel kimliği koyu mod (Dark Theme) odaklı, yüksek kontrastlı ve enerjiktir.

### Renk Paleti (Color Tokens)
| Token Adı | HEX / Değer | Kullanım Yeri |
| :--- | :--- | :--- |
| **Scaffold Background** | `#121212` | Tüm ekranların ana zemin rengi |
| **Surface / Card Background** | `#1E1E1E` | Kartlar, listeler, modallar ve alt navigasyon çubuğu |
| **Primary Accent (Turuncu)** | `#FFFF6B00` | Birincil butonlar, aktif sekmeler, ilerleme çubukları, ikon vurguları |
| **Accent Glow / Border** | `rgba(255, 107, 0, 0.25)` | Kart kenarlıkları (`Border.all`), avatar arka planları |
| **Financial / Success (Yeşil)** | `#4CAF50` / `Colors.green` | Ödenen tutar, tahsilat butonları, aktif paket etiketleri |
| **Warning / Alert (Sarı/Turuncu)** | `#FFA000` | "Az Kaldı" (Kalan ders <= 3) rozetleri |
| **Danger / Expired (Kırmızı)** | `#E53935` | "Bitti" (Kalan ders = 0) rozetleri, silme butonları |
| **Text Primary** | `#FFFFFF` | Başlıklar, birincil metinler, değerler |
| **Text Secondary (Muted)** | `#9E9E9E` / `Colors.grey` | Açıklamalar, birimler, tarih ve alt başlıklar |
| **Border / Divider** | `#2C2C2C` / `Colors.grey[800]` | Ayrım çizgileri ve girdi kutusu sınırları |

### Tipografi & Geometri
- **Köşe Yuvarlaklıkları (Border Radius):**
  - Kartlar & Konteynerlar: `12px` - `14px`
  - Butonlar: `8px` - `12px`
  - Bottom Sheet (Modal Başlıkları): Üst köşeler `20px` - `24px`
  - Küçük rozetler (Badges): `6px`
- **İlerleme Çubuğu:** 6px yükseklikte, yuvarlatılmış köşeli `LinearProgressIndicator` (Doluluk: Turuncu, Boşluk: `#121212`).

---

## 💰 2. Finansal Yönetim & Kasa Mantığı (Fit-Connect'te Eksik)

PT-App'te antrenörün en çok değer verdiği özelliklerden biri **Kasa / Borç-Alacak** takibidir. Fit-Connect'e mutlaka aktarılmalıdır.

### Veri Alanları & Formüller
- `packagePrice` (Paket Ücreti): Örn. `15.000 ₺`
- `paidAmount` (Tahsil Edilen): Örn. `10.000 ₺`
- `debtAmount` (Kalan Borç): `debtAmount = packagePrice - paidAmount` (Örn. `5.000 ₺`)
- `lastPaymentDate` (Son Ödeme Tarihi): Örn. `15.08.2026` veya `Bugün`

### Finansal İş Akışları
1. **Ödeme Tahsil Et Modalı:**
   - Kalan borç miktarını varsayılan öneri olarak sunar.
   - Girilen tahsilat miktarını `paidAmount`'a ekler.
   - Son ödeme tarihini `Bugün` olarak günceller.
2. **Paket Yenileme (+20 Ders):**
   - Danışanın dersi bittiğinde veya bitmeye yaklaştığında tek dokunuşla paketi yeniler.
   - Kalan derse `+20`, toplam derse `+20`, paket fiyatına `+15.000 ₺` yansıtır ve durumu anında `Aktif` yapar.
3. **Kasa / Ciro Göstergeleri (Dashboard & Ayarlar):**
   - **Toplam Ciro:** Tüm danışanlardan tahsil edilen toplam para (`sum(paidAmount)`).
   - **Bekleyen Alacak:** Danışanların toplam kalan borcu (`sum(packagePrice - paidAmount)`).

---

## 📐 3. Detaylı Antropometrik Ölçümler & Tanita PDF Arşivi

Fit-Connect sadece `weight`, `height`, `body_fat` tutmaktadır. PT-App ise profesyonel vücut geliştirme ve fitness ölçümlerini destekler.

### 9 Bölge Vücut Ölçüm Modeli
1. **Kilo** (kg)
2. **Boy** (cm)
3. **Omuz** (cm)
4. **Göğüs** (cm)
5. **Kol / Pazu** (cm)
6. **Bel** (cm)
7. **Kalça** (cm)
8. **Bacak / Üst Bacak** (cm)
9. **Baldır / Kalf** (cm)
*Her ölçüm bir tarih (`date`) etiketiyle dizi halinde saklanır ve son ölçüm danışan kartının ön yüzünde mini metrik kutucukları olarak gösterilir.*

### Tanita Vücut Analiz Raporları Arşivi
- `date`: Analiz tarihi (örn. `01.09.2026`)
- `fileName`: Dosya adı (örn. `Guven_Ozdemir_Tanita_Analiz_Eylul.pdf`)
- `note`: Antrenör inceleme notu (örn. `Sezon başı ilk vücut analizi raporu - yağ oranı %14`)
- Danışanın geçmiş tüm klinik analiz raporları profilde listelenir.

---

## 🏋️ 4. Antrenman Şablonları & Canlı Set/Hacim Takip Ekranı

Fit-Connect'te egzersizler listelenir fakat antrenman şablon kütüphanesi ve canlı seans ekranı yoktur.

### A. Şablon Kütüphanesi (Workout Templates)
Antrenörler her danışana sıfırdan aynı hareketleri yazmak istemez.
- **Hazır Şablon Örnekleri:**
  - *Göğüs & Ön Kol (Hipertrofi):* Bench Press, Incline Dumbbell Press, Biceps Curl.
  - *Bacak & Kalça Odaklı:* Barbell Hip Thrust, Barbell Back Squat.
- **Şablon Olarak Kaydet:** Antrenör bir danışana özel yazdığı programı tek tıkla başlık vererek şablon kütüphanesine ekleyebilir.
- **Danışana Şablon Uygula:** Kütüphanedeki şablonu seçip danışanın programına tek tıkla kopyalama.

### B. Canlı Antrenman ve Set Hacmi Hesabı (`WorkoutDetailEditScreen`)
- **Canlı Kronometre:** Antrenmanın ne kadar sürdüğünü saniye saniye sayar (`12m 45s`).
- **Set Tablosu:**
  - `Set No` (1, 2, 3...)
  - `Önceki (Prev)` (Geçen haftaki ağırlık)
  - `Ağırlık (kg)` (Düzenlenebilir input)
  - `Tekrar (Reps)` (Düzenlenebilir input)
  - `Tamamlandı Checkbox` (Yeşil tik)
- **🔥 Toplam Hacim / Tonaj Hesabı (Total Volume):**
  $$\text{Toplam Hacim} = \sum (\text{Ağırlık (kg)} \times \text{Tekrar}) \quad [\text{Sadece tamamlanan setler için}]$$
  *Örnek: 100 kg x 10 tekrar = 1.000 kg tonaj. Ekranda anlık "Toplam Hacim: 4.850 kg" rozeti yanar.*

---

## 🥗 5. Beslenme Planı & Makro Şablonları

Fit-Connect sadece öğün fotoğrafları tutmaktadır; PT-App ise antrenörün kalori/makro reçetesi yazmasını sağlar.

### Veri Yapısı
- **Makro Hedefleri:**
  - Hedef Kalori: `2500 kcal`
  - Protein: `180g`
  - Karbonhidrat: `250g`
  - Yağ: `65g`
- **Öğün Listesi (`meals`):**
  - `time`: Saat (örn. `08:30`)
  - `name`: Öğün Başlığı (örn. `Sabah Kahvaltısı`)
  - `desc`: İçerik (örn. `4 yumurta beyazı, 2 tam yumurta, 60g yulaf, 1 ölçek whey`)
- **Beslenme Şablonları:** "High Protein - Kas Kazanımı (2500 kcal)", "Kilo Verme - Definisyon (1800 kcal)" şablonları danışana atanabilir veya danışanın diyeti yeni şablon olarak kaydedilebilir.

---

## ⏱ 6. Seans Kuralları & Durum Yönetimi Mantığı

- **Paket Kuralı:** Varsayılan paket 20 derstir.
- **Ders Düşüm Kuralı:**
  - Kalan ders > 3 $\rightarrow$ Durum: `Aktif` (Yeşil etiket)
  - Kalan ders <= 3 ve > 0 $\rightarrow$ Durum: `Az Kaldı` (Turuncu uyarı etiketi)
  - Kalan ders == 0 $\rightarrow$ Durum: `Bitti` (Kırmızı kritik etiket)
- **Hızlı İletişim Butonları:** Danışan profilinde tek tıkla "Ara" (`tel:`) ve "Mesaj" (WhatsApp / SMS) eylem butonları.

---

## 📋 Fit-Connect'e Aktarım Kontrol Listesi (Action Items)

Fit-Connect geliştirilirken sırasıyla yapılacaklar:

- [ ] **Tasarım:** Fit-Connect `ThemeContext` içine PT-App renkleri eklenecek (Koyu zemin `#121212`, Yüzey `#1E1E1E`, Vurgu `#FFFF6B00`).
- [ ] **Veritabanı (Supabase):** `packages` tablosuna `package_price`, `paid_amount`, `last_payment_date` kolonları eklenecek.
- [ ] **Danışan Detay Sayfası:**
  - [ ] Finans & Borç kartı ve "Tahsilat Ekle" modalı.
  - [ ] 9 bölgeli antropometrik vücut ölçüm formu.
  - [ ] PDF vücut analizi dosya listesi.
- [ ] **Antrenör Dashboard:** Toplam Ciro (`totalRevenue`) ve Bekleyen Alacak (`totalPending`) sayaçları.
- [ ] **Antrenman Modülü:** Canlı antrenman ekranına set bazlı ağırlık/tekrar ve **Toplam Hacim (kg x rep)** formülü.
- [ ] **Şablon Sistemi:** Antrenman ve beslenme için "Şablon Olarak Kaydet" ve "Şablon Uygula" fonksiyonları.
