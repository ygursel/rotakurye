# RotaKurye — Restoran pilot sürümü

Restoranın siparişlerini kuryelere dağıtan, kuryeleri haritada canlı gösteren ve teslimat raporu çıkaran uygulama.

- **Restoran (yönetici):** Tarayıcıdan açılan web panel. Sipariş girer, hazır siparişleri sefere böldürür, kuryeye atar, haritada takip eder, günlük rapor görür.
- **Kurye:** Android uygulaması. Atanan siparişleri sırayla görür, yol tarifi alır, müşteriyi arar veya WhatsApp'tan "yoldayım" mesajı atar, teslim edildi işaretler. Mesaideyken konumu arka planda paylaşılır.

Her şey telefondan kurulabilir. Bilgisayar gerekmez.

---

## 1. Veritabanı (Supabase) — yaklaşık 10 dakika

1. https://supabase.com adresinde ücretsiz hesap açın, **New project** deyin. Bölge olarak yakın bir yer seçin (ör. Mumbai veya Frankfurt). Veritabanı şifresini bir yere not edin.
2. Proje açılınca soldan **SQL Editor > New query**. `supabase/schema.sql` dosyasının tamamını yapıştırıp **Run** deyin.
3. Soldan **Authentication > Users > Add user > Create new user**:
   - Bir yönetici hesabı (restoranın kullanacağı e-posta ve şifre)
   - Her kurye için bir hesap (ör. kurye1@restoranadi.com)
   - Her birinde **Auto Confirm User** kutusunu işaretleyin.
4. Tekrar **SQL Editor**. `supabase/setup.sql` dosyasını yapıştırın; restoran adını, e-postaları, kurye isimlerini kendi bilgilerinizle değiştirip **Run** deyin. En altta 3 satır (yönetici + 2 kurye) görmelisiniz.
5. Soldan **Project Settings > API**. Şu iki değeri kopyalayın:
   - **Project URL** (https://xxxx.supabase.co)
   - **anon public** anahtarı
   (`service_role` anahtarını hiçbir yere koymayın.)

## 2. Kod (GitHub)

1. https://github.com adresinde hesap açın ve **public** bir depo (repository) oluşturun, ör. `rotakurye`. (Ücretsiz web yayını için depo public olmalı. Anon anahtarın görünmesi sorun değil; verileri veritabanındaki güvenlik kuralları korur.)
2. Kodları depoya yükleyin (Claude'un yüklemesini isteyebilirsiniz).
3. Depoda `www/config.js` dosyasını açın, kalem simgesine dokunun, 1. adımda kopyaladığınız iki değeri yapıştırıp **Commit changes** deyin.

## 3. Restoran web paneli

1. Depoda **Settings > Pages > Build and deployment > Source: GitHub Actions** seçin.
2. **Actions** sekmesinde "Web panel" işi yeşil olunca panel şu adreste açılır:
   `https://KULLANICI-ADINIZ.github.io/rotakurye/`
3. Restoranın tabletinde veya telefonunda bu adresi açıp yönetici hesabıyla giriş yapın.
4. **Harita** sekmesi > **Restoran konumunu ayarla** > restoranın yerine dokunun. (Rota hesabı buradan başlar.)

## 4. Kurye uygulaması (APK)

1. Depoda **Actions** sekmesi > **Android APK** işi. Her kod değişikliğinde kendiliğinden çalışır, yaklaşık 5–8 dakika sürer.
2. İş yeşil olunca içine girin, en altta **Artifacts > RotaKurye-apk** dosyasını indirin (zip içinde `app-debug.apk`).
3. APK'yı kuryelerin telefonuna gönderin (WhatsApp ile dosya olarak gönderilebilir). Kurulurken "bilinmeyen kaynaklara izin ver" demeleri gerekir.
4. İlk açılışta: kurye hesabıyla giriş > **Mesaiye başla** > konum iznini **"Her zaman izin ver"** olarak verin. Bildirim iznini de verin.
5. Xiaomi, Huawei, Oppo gibi telefonlarda: Ayarlar > Pil > RotaKurye > **Kısıtlama yok**. Yoksa telefon arka planda konum göndermeyi durdurur.

Kurye isterse APK yerine panel adresini telefonunun tarayıcısında da açabilir, ama o zaman konum yalnızca ekran açıkken gider.

## 5. Günlük kullanım

**Restoran:**
1. **+ Yeni sipariş**: müşterinin WhatsApp'tan gönderdiği konum linkini yapıştırın (veya **Haritada seç**), adı, telefonu, tutarı girin.
2. Yemek hazır olunca **Hazır**.
3. **Rota önerisi**: hazır siparişleri aynı yöne gidenleri birleştirerek seferlere böler (en fazla 3 paket, hazır olduktan sonra en geç 40 dk teslim). Kuryeyi seçip **Bu seferi ata**.
4. **Harita**: kuryelerin canlı konumu ve rotaları. **Rapor**: günlük teslim sayısı, ortalama süre, zamanında oranı, kurye bazında paket ve km.

**Kurye:**
1. Telefona yeni sipariş düşünce ses ve titreşimle uyarılır.
2. **Paketleri aldım, yola çıkıyorum** > her sipariş için **Yol tarifi** (Google Maps açılır) ve gerekirse **WhatsApp** (müşteriye tahmini varış süresiyle hazır mesaj, İngilizce + Arapça).
3. Teslimde **Teslim edildi**.

Ayarlar (`www/config.js`): sefer başına en fazla paket, en geç teslim süresi, para birimi.

---

## Bu sürümün bilinen sınırları

- Mesafeler kuş uçuşu × 1,35 ile tahmin edilir; gerçek yol mesafesi değildir. Pilot için yeterli, ileride OSRM veya Google Routes eklenecek.
- `maps.app.goo.gl` kısa linkleri okunamaz. Linki açıp uzun halini yapıştırın ya da haritadan seçin.
- APK "debug" imzalıdır: test ve pilot için uygundur, Play Store'a yüklemek için ayrıca imzalı sürüm gerekir.
- Arayüz Türkçe/İngilizce. Arapça arayüz sonraki adım.
- Supabase ücretsiz planı 1 hafta hiç kullanılmazsa projeyi duraklatır; günlük kullanımda sorun olmaz.
- Harita OpenStreetMap kullanır; ticari ölçekte kendi harita sağlayıcınıza geçmeniz gerekir.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `www/index.html`, `www/app.js`, `www/style.css` | Uygulamanın kendisi (panel + kurye ekranı) |
| `www/route.js` | Sefer gruplama ve sıralama algoritması |
| `www/config.js` | Supabase bağlantısı ve sefer kuralları |
| `supabase/schema.sql` | Tablolar ve güvenlik kuralları |
| `supabase/setup.sql` | Restoranı ve kullanıcıları bağlama |
| `.github/workflows/android.yml` | APK'yı bulutta derler |
| `.github/workflows/web.yml` | Paneli GitHub Pages'te yayınlar |
| `scripts/patch-android.js` | Android konum/bildirim izinlerini ekler |
