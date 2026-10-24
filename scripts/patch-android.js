// Android projesine konum ve bildirim izinlerini ekler (GitHub Actions içinde çalışır).
const fs = require('fs');
const path = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(path, 'utf8');

const perms = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.WAKE_LOCK'
];
const missing = perms.filter(p => !xml.includes('"' + p + '"'));
if (missing.length) {
  const lines = missing.map(p => '    <uses-permission android:name="' + p + '" />').join('\n');
  xml = xml.replace(/(\s*<application)/, '\n' + lines + '$1');
}
fs.writeFileSync(path, xml);

// Arka plan konum bildirimi için metin
const stringsPath = 'android/app/src/main/res/values/strings.xml';
if (fs.existsSync(stringsPath)) {
  let s = fs.readFileSync(stringsPath, 'utf8');
  if (!s.includes('capacitor_background_geolocation_notification_channel_name')) {
    s = s.replace('</resources>',
      '    <string name="capacitor_background_geolocation_notification_channel_name">Konum paylaşımı</string>\n</resources>');
    fs.writeFileSync(stringsPath, s);
  }
}
console.log('Android manifest güncellendi. Eklenen izinler:', missing.length ? missing.join(', ') : 'yok (zaten vardı)');
