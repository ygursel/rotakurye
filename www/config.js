/* Supabase > Project Settings > API sayfasındaki iki değeri buraya yapıştırın.
   "Publishable key" (veya eski "anon public") anahtarı herkese açık olabilir; verileri veritabanındaki güvenlik kuralları korur.
   "Secret key" veya "service_role" anahtarını ASLA buraya koymayın. */
window.ROTA_CONFIG = {
  SUPABASE_URL: 'https://hfnxadeaasxtkuvgxdod.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_p8qgEKD9_RhnxTYP14yCbA_LGHEIO43',

  // Sefer kuralları
  MAX_ORDERS_PER_TRIP: 3,   // bir kurye tek seferde en fazla kaç paket
  MAX_DELIVERY_MIN: 40,     // sipariş hazır olduktan sonra en geç kaç dakikada teslim
  MAX_SPREAD_KM: 50,        // aynı kuryedeki iki sipariş arası en fazla kaç km olabilir
  CURRENCY: 'OMR'
};
