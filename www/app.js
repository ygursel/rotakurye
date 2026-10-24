/* RotaKurye — restoran pilot sürümü
   Roller: admin (restoran/dispeçer) ve courier (kurye). Veri: Supabase. */
(function () {
'use strict';
const C = window.ROTA_CONFIG || {};
const R = window.RKRoute;
const MAX_TRIP = C.MAX_ORDERS_PER_TRIP || 3;
const MAX_MIN = C.MAX_DELIVERY_MIN || 40;
const CUR = C.CURRENCY || 'OMR';

/* ---------------- dil ---------------- */
const T = {
  tr: {
    loading:'Yükleniyor…', configMissing:'Kurulum eksik: www/config.js dosyasına Supabase adresini ve anon anahtarını yazın.',
    login:'Giriş', email:'E-posta', password:'Şifre', signIn:'Giriş yap', signOut:'Çıkış', loginFail:'Giriş başarısız. E-posta veya şifre hatalı.',
    noProfile:'Bu hesap bir restorana bağlı değil. Yöneticinin setup.sql adımını çalıştırması gerekiyor.',
    tabOrders:'Siparişler', tabMap:'Harita', tabReport:'Rapor',
    newOrder:'+ Yeni sipariş', suggest:'Rota önerisi', customer:'Müşteri adı', phone:'Telefon',
    location:'Konum linki veya koordinat', locHint:'WhatsApp konum linkini ya da Google Maps linkini yapıştırın',
    pickOnMap:'Haritada seç', address:'Adres tarifi', note:'Not', amount:'Tutar', priority:'Öncelik',
    normal:'Normal', urgent:'Acil', readyNow:'Hazır olarak ekle', save:'Kaydet', cancel:'Vazgeç', close:'Kapat',
    locOk:'Konum bulundu', locBad:'Bu linkte koordinat bulunamadı. Haritadan seçin.',
    shortLink:'Kısa link (goo.gl) okunamıyor. Linki tarayıcıda açıp adres çubuğundaki uzun linki yapıştırın veya haritadan seçin.',
    needLoc:'Önce konumu girin.', tapMap:'Teslimat noktasına dokunun', useThis:'Bu konumu kullan',
    st_new:'Hazırlanıyor', st_ready:'Hazır', st_assigned:'Atandı', st_on_way:'Yolda', st_delivered:'Teslim edildi', st_cancelled:'İptal',
    secNew:'Mutfakta', secReady:'Çıkışa hazır', secRoad:'Kuryede', secDone:'Bugün teslim edilen',
    markReady:'Hazır', assign:'Ata', chooseCourier:'Kurye seç', unassign:'Geri al', cancelOrder:'İptal et',
    confirmCancel:'Bu sipariş iptal edilsin mi?', minAgo:'dk önce', min:'dk', km:'km',
    suggestTitle:'Önerilen seferler', noReady:'Çıkışa hazır sipariş yok.', trip:'Sefer', packages:'paket',
    withReturn:'dönüş dahil', assignTrip:'Bu seferi ata', busy:'(meşgul)', waitedFor:'en uzun bekleyen',
    assigned:'Atandı', saved:'Sipariş eklendi', error:'Hata', empty:'Sipariş yok',
    setRestaurant:'Restoran konumunu ayarla', tapRestaurant:'Restoranın yerine dokunun', restaurantSet:'Restoran konumu kaydedildi',
    lastSeen:'son konum', never:'konum yok', restaurant:'Restoran',
    reportDate:'Tarih', totalDelivered:'Teslim edilen', avgDelivery:'Ort. teslim süresi', avgRoad:'Ort. yol süresi',
    onTime:'Zamanında', revenue:'Ciro', cancelled:'İptal', perCourier:'Kurye bazında', courier:'Kurye', count:'Paket', estKm:'Tahmini km',
    myTasks:'Görevlerim', shiftOn:'Mesaide · konum paylaşılıyor', shiftOff:'Mesai dışı', startShift:'Mesaiye başla', endShift:'Mesaiyi bitir',
    pickedUp:'Paketleri aldım, yola çıkıyorum', navigate:'Yol tarifi', call:'Ara', whatsapp:'WhatsApp', delivered:'Teslim edildi',
    openRoute:'Tüm rotayı Google Maps\'te aç', noTasks:'Şu an atanmış sipariş yok.', collect:'Tahsil', todayDone:'Bugün teslim',
    newAssign:'Yeni sipariş atandı!', deliveredMsg:'Teslim edildi olarak işaretlendi', locDenied:'Konum izni verilmedi. Ayarlardan izin verin.',
    trackingNotif:'Konumunuz restoranla paylaşılıyor', eta:'tahmini varış', etaFrom:'şu anki konumdan'
  },
  en: {
    loading:'Loading…', configMissing:'Setup incomplete: put your Supabase URL and anon key in www/config.js.',
    login:'Sign in', email:'Email', password:'Password', signIn:'Sign in', signOut:'Sign out', loginFail:'Sign-in failed. Check email and password.',
    noProfile:'This account is not linked to a restaurant. The admin needs to run setup.sql.',
    tabOrders:'Orders', tabMap:'Map', tabReport:'Report',
    newOrder:'+ New order', suggest:'Suggest trips', customer:'Customer name', phone:'Phone',
    location:'Location link or coordinates', locHint:'Paste the WhatsApp location link or a Google Maps link',
    pickOnMap:'Pick on map', address:'Directions', note:'Note', amount:'Amount', priority:'Priority',
    normal:'Normal', urgent:'Urgent', readyNow:'Add as ready', save:'Save', cancel:'Cancel', close:'Close',
    locOk:'Location found', locBad:'No coordinates in this link. Pick on the map.',
    shortLink:'Short links (goo.gl) can\'t be read. Open it in the browser and paste the long link, or pick on the map.',
    needLoc:'Enter the location first.', tapMap:'Tap the delivery point', useThis:'Use this location',
    st_new:'Preparing', st_ready:'Ready', st_assigned:'Assigned', st_on_way:'On the way', st_delivered:'Delivered', st_cancelled:'Cancelled',
    secNew:'In the kitchen', secReady:'Ready to go', secRoad:'With couriers', secDone:'Delivered today',
    markReady:'Ready', assign:'Assign', chooseCourier:'Choose courier', unassign:'Unassign', cancelOrder:'Cancel order',
    confirmCancel:'Cancel this order?', minAgo:'min ago', min:'min', km:'km',
    suggestTitle:'Suggested trips', noReady:'No orders ready to go.', trip:'Trip', packages:'orders',
    withReturn:'incl. return', assignTrip:'Assign this trip', busy:'(busy)', waitedFor:'longest wait',
    assigned:'Assigned', saved:'Order added', error:'Error', empty:'No orders',
    setRestaurant:'Set restaurant location', tapRestaurant:'Tap the restaurant\'s location', restaurantSet:'Restaurant location saved',
    lastSeen:'last seen', never:'no location', restaurant:'Restaurant',
    reportDate:'Date', totalDelivered:'Delivered', avgDelivery:'Avg. delivery time', avgRoad:'Avg. road time',
    onTime:'On time', revenue:'Revenue', cancelled:'Cancelled', perCourier:'By courier', courier:'Courier', count:'Orders', estKm:'Est. km',
    myTasks:'My deliveries', shiftOn:'On shift · sharing location', shiftOff:'Off shift', startShift:'Start shift', endShift:'End shift',
    pickedUp:'Picked up, leaving now', navigate:'Directions', call:'Call', whatsapp:'WhatsApp', delivered:'Delivered',
    openRoute:'Open full route in Google Maps', noTasks:'No orders assigned right now.', collect:'Collect', todayDone:'Delivered today',
    newAssign:'New order assigned!', deliveredMsg:'Marked as delivered', locDenied:'Location permission denied. Allow it in settings.',
    trackingNotif:'Your location is shared with the restaurant', eta:'ETA', etaFrom:'from current position'
  }
};
let lang = 'en';
try { lang = localStorage.getItem('rk_lang') || ((navigator.language || '').startsWith('tr') ? 'tr' : 'en'); } catch (e) {}
const t = k => (T[lang] && T[lang][k]) || T.en[k] || k;

/* ---------------- yardımcılar ---------------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const hhmm = d => d ? new Date(d).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-GB', { hour:'2-digit', minute:'2-digit' }) : '';
const minsSince = d => Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
const fmtKm = v => (Math.round(v * 10) / 10).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB');
const money = v => v == null || v === '' ? '' : Number(v).toFixed(3) + ' ' + CUR;
const ll = o => o.lat.toFixed(6) + ',' + o.lng.toFixed(6);
const nowIso = () => new Date().toISOString();
const isActive = s => s === 'new' || s === 'ready' || s === 'assigned' || s === 'on_way';
function toast(msg, ms) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { el.hidden = true; }, ms || 2600);
}
function fail(e) { console.error(e); toast(t('error') + ': ' + (e && e.message ? e.message : e), 4000); }

// WhatsApp / Google Maps linkinden koordinat çıkar
function parseLocation(text) {
  const s = (text || '').trim();
  if (!s) return { empty: true };
  if (/goo\.gl|maps\.app/i.test(s) && !/-?\d+\.\d+\s*,\s*-?\d+\.\d+/.test(decodeURIComponent(s))) return { short: true };
  let str = s; try { str = decodeURIComponent(s); } catch (e) {}
  const pats = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|daddr|destination|center)=(?:loc:)?(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i,
    /geo:(-?\d+\.\d+),(-?\d+\.\d+)/i,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /(-?\d{1,2}\.\d{3,})\s*[,\s]\s*(-?\d{1,3}\.\d{3,})/
  ];
  for (const p of pats) {
    const m = str.match(p);
    if (m) {
      const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return { bad: true };
}
// Umman numarası: 8 haneli ise 968 ekle
function waNumber(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 8) d = '968' + d;
  return d;
}
function beep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.2, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
    o.start(); o.stop(ac.currentTime + 0.6);
  } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}

/* ---------------- durum ---------------- */
let sb = null, me = null, restaurant = null, people = [], couriers = [], orders = [], locs = {};
const ui = { tab: 'orders', suggest: null, pickRestaurant: false };
let map = null, mapLayer = null;
const $app = document.getElementById('app');

/* ---------------- açılış ---------------- */
async function boot() {
  if (!window.supabase || !C.SUPABASE_URL || /PROJE-KODUNUZ/.test(C.SUPABASE_URL) || /BURAYA-ANON/.test(C.SUPABASE_ANON_KEY || '')) {
    $app.innerHTML = '<div class="card" style="margin-top:20px">' + esc(t('configMissing')) + '</div>';
    return;
  }
  sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  const { data } = await sb.auth.getSession();
  if (!data.session) return showLogin();
  await afterLogin(data.session.user);
}

function showLogin(err) {
  $app.innerHTML =
    '<div class="top"><div class="brand">Rota<span>Kurye</span></div><div class="who"></div>' + langBtn() + '</div>' +
    '<form class="card" id="loginForm" style="display:grid;gap:10px;max-width:420px;margin:24px auto">' +
    '<h2>' + esc(t('login')) + '</h2>' +
    '<label>' + esc(t('email')) + '<input id="lEmail" type="email" autocomplete="username" required></label>' +
    '<label>' + esc(t('password')) + '<input id="lPass" type="password" autocomplete="current-password" required></label>' +
    (err ? '<div style="color:var(--bad)">' + esc(err) + '</div>' : '') +
    '<button class="btn primary block" type="submit">' + esc(t('signIn')) + '</button></form>';
  document.getElementById('loginForm').onsubmit = async e => {
    e.preventDefault();
    const { data, error } = await sb.auth.signInWithPassword({
      email: document.getElementById('lEmail').value.trim(), password: document.getElementById('lPass').value });
    if (error) return showLogin(t('loginFail'));
    await afterLogin(data.user);
  };
}

async function afterLogin(user) {
  $app.innerHTML = '<div class="center muted">' + esc(t('loading')) + '</div>';
  const { data: prof, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) return fail(error);
  if (!prof) {
    $app.innerHTML = '<div class="card" style="margin-top:20px">' + esc(t('noProfile')) +
      '<div style="margin-top:10px"><button class="btn" data-act="signout">' + esc(t('signOut')) + '</button></div></div>';
    return;
  }
  me = prof;
  const r1 = await sb.from('restaurants').select('*').eq('id', me.restaurant_id).single();
  if (r1.error) return fail(r1.error);
  restaurant = r1.data;
  const r2 = await sb.from('profiles').select('*').order('full_name');
  people = r2.data || [];
  couriers = people.filter(p => p.role === 'courier');
  await Promise.all([loadOrders(), loadLocs()]);
  subscribe();
  render();
  if (me.role === 'courier' && shiftIsOn()) startTracking();
  setInterval(() => { if (me && ui.tab !== 'map' && !document.querySelector('.modal')) renderContent(); }, 60000);
}

async function loadOrders() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const { data, error } = await sb.from('orders').select('*')
    .or('status.in.(new,ready,assigned,on_way),created_at.gte."' + start.toISOString() + '"')
    .order('created_at', { ascending: true });
  if (error) return fail(error);
  orders = data || [];
}
async function loadLocs() {
  const { data } = await sb.from('courier_locations').select('*');
  locs = {}; (data || []).forEach(l => { locs[l.courier_id] = l; });
}

let reloadTimer = null;
function subscribe() {
  sb.channel('rk-' + me.id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(async () => {
        const before = new Set(orders.filter(o => o.status === 'assigned' && o.courier_id === me.id).map(o => o.id));
        await loadOrders();
        if (me.role === 'courier' && orders.some(o => o.status === 'assigned' && o.courier_id === me.id && !before.has(o.id))) {
          beep(); toast(t('newAssign'), 4000);
        }
        refresh();
      }, 300);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courier_locations' }, p => {
      if (p.new && p.new.courier_id) { locs[p.new.courier_id] = p.new; if (ui.tab === 'map') drawMapLayers(); }
    })
    .subscribe();
}

/* ---------------- çizim ---------------- */
function langBtn() { return '<button class="btn small" data-act="lang">' + (lang === 'tr' ? 'EN' : 'TR') + '</button>'; }

function render() {
  destroyMap();
  const tabs = me.role === 'admin'
    ? '<div class="tabs">' + ['orders', 'map', 'report'].map(k =>
        '<button data-act="tab" data-tab="' + k + '" class="' + (ui.tab === k ? 'on' : '') + '">' +
        esc(t('tab' + k[0].toUpperCase() + k.slice(1))) + '</button>').join('') + '</div>'
    : '';
  $app.innerHTML =
    '<div class="top"><div class="brand">Rota<span>Kurye</span></div>' +
    '<div class="who">' + esc(restaurant.name) + ' · ' + esc(me.full_name) + '</div>' +
    langBtn() + '<button class="btn small" data-act="signout">' + esc(t('signOut')) + '</button></div>' +
    tabs + '<div id="content"></div>';
  renderContent();
}
function refresh() { if (me.role === 'admin' && ui.tab === 'map') drawMapLayers(); else renderContent(); }
function renderContent() {
  const el = document.getElementById('content'); if (!el) return;
  if (me.role === 'courier') { el.innerHTML = courierView(); return; }
  if (ui.tab === 'orders') el.innerHTML = adminOrdersView();
  else if (ui.tab === 'map') { el.innerHTML = adminMapView(); initAdminMap(); }
  else if (ui.tab === 'report') { el.innerHTML = reportShell(); loadReport(); }
}

function pills(o) {
  return '<span class="pill ' + o.status + '">' + esc(t('st_' + o.status)) + '</span>' +
    (o.priority === 'urgent' ? ' <span class="pill urgent">' + esc(t('urgent')) + '</span>' : '');
}
function courierName(id) { const p = people.find(x => x.id === id); return p ? p.full_name : '—'; }
function activeOf(cid) { return orders.filter(o => o.courier_id === cid && (o.status === 'assigned' || o.status === 'on_way')); }

/* ---------- yönetici: siparişler ---------- */
function adminOrdersView() {
  const by = s => orders.filter(o => o.status === s);
  const fresh = by('new'), ready = by('ready');
  const road = orders.filter(o => o.status === 'assigned' || o.status === 'on_way');
  const done = by('delivered').slice().reverse();
  let h = '<div class="row"><button class="btn primary" data-act="newOrder">' + esc(t('newOrder')) + '</button>' +
    '<button class="btn" data-act="suggest">' + esc(t('suggest')) + '</button></div>';
  if (ui.suggest) h += suggestView();
  h += section(t('secNew'), fresh, adminCard);
  h += section(t('secReady'), ready, adminCard);
  h += '<div class="section-title">' + esc(t('secRoad')) + ' <span>' + road.length + '</span></div>';
  const withRoad = couriers.filter(c => activeOf(c.id).length);
  if (!withRoad.length) h += '<div class="empty">' + esc(t('empty')) + '</div>';
  withRoad.forEach(c => {
    const list = activeOf(c.id).sort((a, b) => (a.seq || 0) - (b.seq || 0));
    h += '<div class="card batch"><b>' + esc(c.full_name) + '</b> <span class="muted small">' + list.length + ' ' + esc(t('packages')) + '</span>' +
      list.map(o => '<div style="margin-top:8px">' + adminCard(o, true) + '</div>').join('') + '</div>';
  });
  h += section(t('secDone'), done.slice(0, 15), adminCard, done.length);
  return h;
}
function section(title, list, fn, total) {
  return '<div class="section-title">' + esc(title) + ' <span>' + (total != null ? total : list.length) + '</span></div>' +
    (list.length ? list.map(o => '<div class="card">' + fn(o) + '</div>').join('') : '<div class="empty">' + esc(t('empty')) + '</div>');
}
function courierOptions(sel) {
  return couriers.map(c => '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.full_name) +
    (activeOf(c.id).length ? ' ' + esc(t('busy')) : '') + '</option>').join('');
}
function adminCard(o, inner) {
  const meta = [o.address_text, o.customer_phone, money(o.amount)].filter(Boolean).map(esc).join(' · ');
  const time = o.status === 'delivered' ? hhmm(o.delivered_at) + ' ✓' : hhmm(o.created_at) + ' · ' + minsSince(o.created_at) + ' ' + t('minAgo');
  let act = '';
  if (o.status === 'new') act = btn('ready', o.id, t('markReady'), 'primary') + btn('cancel', o.id, t('cancelOrder'), 'danger');
  else if (o.status === 'ready') act =
    '<select data-sel="' + o.id + '" style="flex:1 1 140px;width:auto"><option value="">' + esc(t('chooseCourier')) + '</option>' + courierOptions() + '</select>' +
    btn('assignOne', o.id, t('assign'), 'primary') + btn('cancel', o.id, t('cancelOrder'), 'danger');
  else if (o.status === 'assigned') act = btn('unassign', o.id, t('unassign'));
  return '<div class="order"><span class="no">#' + o.id + '</span><div>' +
    '<div class="name">' + esc(o.customer_name || '—') + ' ' + pills(o) + '</div>' +
    (meta ? '<div class="meta">' + meta + '</div>' : '') +
    (o.note ? '<div class="meta">📝 ' + esc(o.note) + '</div>' : '') +
    '<div class="meta">' + esc(time) + (inner && o.seq ? ' · ' + t('trip') + ' #' + o.seq : '') + '</div></div>' +
    (act ? '<div class="actions">' + act + '</div>' : '') + '</div>';
}
function btn(act, id, label, cls) {
  return '<button class="btn small ' + (cls || '') + '" data-act="' + act + '" data-id="' + id + '">' + esc(label) + '</button>';
}

/* ---------- yönetici: rota önerisi ---------- */
function computeSuggest() {
  const ready = orders.filter(o => o.status === 'ready');
  if (!restaurant.lat) { toast(t('setRestaurant')); return null; }
  const depot = { lat: restaurant.lat, lng: restaurant.lng };
  const batches = R.planBatches(depot, ready.map(o => ({
    id: o.id, lat: o.lat, lng: o.lng, priority: o.priority, readyAt: new Date(o.ready_at || o.created_at).getTime()
  })), { now: Date.now(), maxPerTrip: MAX_TRIP, maxMin: MAX_MIN });
  const free = couriers.filter(c => !activeOf(c.id).length);
  batches.forEach((b, i) => { b.courier = free[i] ? free[i].id : ''; });
  return batches;
}
function suggestView() {
  const b = ui.suggest;
  let h = '<div class="section-title">' + esc(t('suggestTitle')) + ' <button class="btn small" data-act="closeSuggest">' + esc(t('close')) + '</button></div>';
  if (!b.length) return h + '<div class="empty">' + esc(t('noReady')) + '</div>';
  b.forEach((x, i) => {
    h += '<div class="card batch"><b>' + esc(t('trip')) + ' ' + (i + 1) + '</b> <span class="muted small">' +
      x.orders.length + ' ' + esc(t('packages')) + ' · ' + fmtKm(x.kmWithReturn) + ' ' + t('km') + ' · ~' +
      Math.round(x.minWithReturn) + ' ' + t('min') + ' ' + esc(t('withReturn')) + ' · ' + esc(t('waitedFor')) + ' ' + Math.round(x.oldestWaitMin) + ' ' + t('min') + '</span><ol>' +
      x.orders.map((o, k) => {
        const full = orders.find(z => z.id === o.id) || {};
        return '<li>#' + o.id + ' ' + esc(full.customer_name || '') + ' <span class="muted small">· ' + esc(t('eta')) + ' ~' + Math.round(x.arrivals[k]) + ' ' + t('min') + '</span></li>';
      }).join('') + '</ol><div class="row"><select data-tripsel="' + i + '"><option value="">' + esc(t('chooseCourier')) + '</option>' +
      courierOptions(x.courier) + '</select><button class="btn primary" data-act="assignTrip" data-i="' + i + '">' + esc(t('assignTrip')) + '</button></div></div>';
  });
  return h;
}
async function assignOrders(ids, courierId) {
  if (!courierId) return toast(t('chooseCourier'));
  const base = activeOf(courierId).length;
  const res = await Promise.all(ids.map((id, i) => sb.from('orders').update({
    status: 'assigned', courier_id: courierId, seq: base + i + 1, assigned_at: nowIso()
  }).eq('id', id)));
  const err = res.find(r => r.error); if (err) return fail(err.error);
  toast(t('assigned') + ': ' + courierName(courierId));
  await loadOrders(); if (ui.suggest) ui.suggest = computeSuggest(); renderContent();
}

/* ---------- yönetici: yeni sipariş ---------- */
function openNewOrder() {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = '<form class="card" id="noForm" style="display:grid;gap:10px">' +
    '<h3>' + esc(t('newOrder').replace('+ ', '')) + '</h3>' +
    '<div class="row"><label>' + esc(t('customer')) + '<input id="noName"></label>' +
    '<label>' + esc(t('phone')) + '<input id="noPhone" type="tel" inputmode="tel"></label></div>' +
    '<label>' + esc(t('location')) + '<textarea id="noLoc" placeholder="' + esc(t('locHint')) + '"></textarea></label>' +
    '<div class="row" style="align-items:center"><div id="noLocMsg" class="small muted"></div>' +
    '<button type="button" class="btn small" data-act="pickOrder" style="flex:0 0 auto">' + esc(t('pickOnMap')) + '</button></div>' +
    '<label>' + esc(t('address')) + '<input id="noAddr"></label>' +
    '<label>' + esc(t('note')) + '<input id="noNote"></label>' +
    '<div class="row"><label>' + esc(t('amount')) + ' (' + CUR + ')<input id="noAmt" type="number" step="0.001" inputmode="decimal"></label>' +
    '<label>' + esc(t('priority')) + '<select id="noPri"><option value="normal">' + esc(t('normal')) + '</option><option value="urgent">' + esc(t('urgent')) + '</option></select></label></div>' +
    '<label style="display:flex;align-items:center;gap:8px;text-transform:none;font-size:14px;color:var(--ink)"><input type="checkbox" id="noReady" style="width:auto"> ' + esc(t('readyNow')) + '</label>' +
    '<div class="row"><button type="button" class="btn" data-act="closeModal">' + esc(t('cancel')) + '</button>' +
    '<button type="submit" class="btn primary">' + esc(t('save')) + '</button></div></form>';
  document.body.appendChild(m);
  const loc = m.querySelector('#noLoc'), msg = m.querySelector('#noLocMsg');
  const check = () => {
    const p = parseLocation(loc.value);
    if (p.empty) msg.textContent = '';
    else if (p.short) msg.textContent = t('shortLink');
    else if (p.bad) msg.textContent = t('locBad');
    else msg.textContent = '✓ ' + t('locOk') + ': ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5);
    msg.style.color = p.lat != null ? 'var(--ok)' : (p.empty ? '' : 'var(--bad)');
  };
  loc.addEventListener('input', check);
  m.querySelector('#noForm').onsubmit = async e => {
    e.preventDefault();
    const p = parseLocation(loc.value);
    if (p.lat == null) return toast(t('needLoc'));
    const ready = m.querySelector('#noReady').checked;
    const amt = m.querySelector('#noAmt').value;
    const { error } = await sb.from('orders').insert({
      restaurant_id: me.restaurant_id,
      customer_name: m.querySelector('#noName').value.trim() || null,
      customer_phone: m.querySelector('#noPhone').value.trim() || null,
      address_text: m.querySelector('#noAddr').value.trim() || null,
      note: m.querySelector('#noNote').value.trim() || null,
      amount: amt === '' ? null : Number(amt),
      priority: m.querySelector('#noPri').value,
      lat: p.lat, lng: p.lng,
      status: ready ? 'ready' : 'new', ready_at: ready ? nowIso() : null
    });
    if (error) return fail(error);
    m.remove(); toast(t('saved'));
    await loadOrders(); renderContent();
  };
}

// Harita üzerinden nokta seçme penceresi
function openPicker(start, onPick) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = '<div class="card" style="display:grid;gap:10px"><b>' + esc(t('tapMap')) + '</b>' +
    '<div id="pickMap" class="map pick"></div><div class="row">' +
    '<button class="btn" data-act="closeModal">' + esc(t('cancel')) + '</button>' +
    '<button class="btn primary" id="pickUse" disabled>' + esc(t('useThis')) + '</button></div></div>';
  document.body.appendChild(m);
  const pm = L.map(m.querySelector('#pickMap')).setView([start.lat, start.lng], 14);
  tiles().addTo(pm);
  let mk = null, pos = null;
  pm.on('click', e => {
    pos = { lat: e.latlng.lat, lng: e.latlng.lng };
    if (mk) mk.setLatLng(e.latlng); else mk = L.marker(e.latlng).addTo(pm);
    m.querySelector('#pickUse').disabled = false;
  });
  m.querySelector('#pickUse').onclick = () => { m.remove(); onPick(pos); };
  setTimeout(() => pm.invalidateSize(), 50);
}
function tiles() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  });
}
function restaurantPos() { return restaurant.lat ? { lat: restaurant.lat, lng: restaurant.lng } : { lat: 23.588, lng: 58.3829 }; }

/* ---------- yönetici: harita ---------- */
function adminMapView() {
  return '<div class="row" style="margin-bottom:8px"><button class="btn" data-act="setRest">' +
    esc(ui.pickRestaurant ? t('tapRestaurant') : t('setRestaurant')) + '</button></div>' +
    '<div id="liveMap" class="map"></div><div id="mapLegend" style="margin-top:10px"></div>';
}
function destroyMap() { if (map) { map.remove(); map = null; mapLayer = null; } }
function initAdminMap() {
  destroyMap();
  map = L.map('liveMap').setView([restaurantPos().lat, restaurantPos().lng], 13);
  tiles().addTo(map);
  mapLayer = L.layerGroup().addTo(map);
  map.on('click', async e => {
    if (!ui.pickRestaurant) return;
    const { error } = await sb.from('restaurants').update({ lat: e.latlng.lat, lng: e.latlng.lng }).eq('id', restaurant.id);
    if (error) return fail(error);
    restaurant.lat = e.latlng.lat; restaurant.lng = e.latlng.lng; ui.pickRestaurant = false;
    toast(t('restaurantSet')); renderContent();
  });
  drawMapLayers(true);
}
const COLORS = ['#2f63d0', '#0f8a64', '#b4317a', '#c26a00', '#6a4bc4', '#0b7f8f'];
function colorOf(cid) { const i = couriers.findIndex(c => c.id === cid); return COLORS[(i < 0 ? 0 : i) % COLORS.length]; }
function badge(text, bg, round) {
  return L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15],
    html: '<div style="width:30px;height:30px;border-radius:' + (round ? '50%' : '7px') + ';background:' + bg +
      ';color:#fff;font:700 13px system-ui;display:grid;place-items:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">' + esc(text) + '</div>' });
}
function drawMapLayers(fit) {
  if (!map || !mapLayer) return;
  mapLayer.clearLayers();
  const pts = [];
  const rp = restaurantPos();
  L.marker([rp.lat, rp.lng], { icon: badge('R', '#c23a2b') }).bindTooltip(t('restaurant')).addTo(mapLayer); pts.push([rp.lat, rp.lng]);
  orders.filter(o => isActive(o.status)).forEach(o => {
    const col = o.courier_id ? colorOf(o.courier_id) : (o.status === 'ready' ? '#2f63d0' : '#9a6700');
    L.marker([o.lat, o.lng], { icon: badge(o.seq && o.courier_id ? String(o.seq) : '•', col, true) })
      .bindPopup('<b>#' + o.id + ' ' + esc(o.customer_name || '') + '</b><br>' + esc(t('st_' + o.status)) +
        (o.courier_id ? ' · ' + esc(courierName(o.courier_id)) : '') + (o.address_text ? '<br>' + esc(o.address_text) : ''))
      .addTo(mapLayer);
    pts.push([o.lat, o.lng]);
  });
  couriers.forEach(c => {
    const l = locs[c.id], list = activeOf(c.id).sort((a, b) => (a.seq || 0) - (b.seq || 0));
    const start = l ? { lat: l.lat, lng: l.lng } : rp;
    if (list.length) L.polyline([[start.lat, start.lng]].concat(list.map(o => [o.lat, o.lng])), { color: colorOf(c.id), weight: 4, opacity: .8 }).addTo(mapLayer);
    if (l) {
      L.marker([l.lat, l.lng], { icon: badge(c.full_name.slice(0, 2).toUpperCase(), colorOf(c.id)) })
        .bindTooltip(c.full_name + ' · ' + t('lastSeen') + ' ' + hhmm(l.updated_at)).addTo(mapLayer);
      pts.push([l.lat, l.lng]);
    }
  });
  if (fit && pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
  const leg = document.getElementById('mapLegend');
  if (leg) leg.innerHTML = couriers.map(c => {
    const l = locs[c.id];
    return '<div class="card" style="display:flex;gap:10px;align-items:center;padding:8px 12px">' +
      '<span class="dot" style="background:' + colorOf(c.id) + '"></span><b>' + esc(c.full_name) + '</b>' +
      '<span class="muted small" style="flex:1">' + activeOf(c.id).length + ' ' + esc(t('packages')) + '</span>' +
      '<span class="muted small">' + (l ? esc(t('lastSeen')) + ' ' + hhmm(l.updated_at) + ' (' + minsSince(l.updated_at) + ' ' + t('minAgo') + ')' : esc(t('never'))) + '</span></div>';
  }).join('');
}

/* ---------- yönetici: rapor ---------- */
function reportShell() {
  const d = ui.reportDate || new Date().toISOString().slice(0, 10);
  return '<div class="row" style="margin-bottom:10px"><label style="flex:0 1 220px">' + esc(t('reportDate')) +
    '<input type="date" id="repDate" value="' + d + '"></label></div><div id="repBody"><div class="empty">' + esc(t('loading')) + '</div></div>';
}
async function loadReport() {
  const inp = document.getElementById('repDate');
  const d = inp.value || new Date().toISOString().slice(0, 10);
  ui.reportDate = d;
  inp.onchange = () => { ui.reportDate = inp.value; loadReport(); };
  const from = new Date(d + 'T00:00:00'), to = new Date(from.getTime() + 86400000);
  const { data, error } = await sb.from('orders').select('*')
    .gte('created_at', from.toISOString()).lt('created_at', to.toISOString());
  if (error) return fail(error);
  const all = data || [], del = all.filter(o => o.status === 'delivered' && o.delivered_at);
  const avg = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0;
  const total = del.map(o => (new Date(o.delivered_at) - new Date(o.created_at)) / 60000);
  const road = del.filter(o => o.picked_at).map(o => (new Date(o.delivered_at) - new Date(o.picked_at)) / 60000);
  const onTime = del.filter(o => (new Date(o.delivered_at) - new Date(o.ready_at || o.created_at)) / 60000 <= MAX_MIN).length;
  const rev = del.reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const rp = restaurantPos();
  const rows = couriers.map(c => {
    const mine = del.filter(o => o.courier_id === c.id);
    const trips = {};
    mine.forEach(o => { const k = o.picked_at || o.assigned_at || o.id; (trips[k] = trips[k] || []).push(o); });
    const km = Object.values(trips).reduce((s, tr) => s + R.simulate(rp, tr.sort((a, b) => (a.seq || 0) - (b.seq || 0))).kmWithReturn, 0);
    return { c, n: mine.length, km, rev: mine.reduce((s, o) => s + (Number(o.amount) || 0), 0) };
  });
  document.getElementById('repBody').innerHTML =
    '<div class="stats">' +
    stat(t('totalDelivered'), del.length) +
    stat(t('avgDelivery'), avg(total) + ' ' + t('min')) +
    stat(t('avgRoad'), avg(road) + ' ' + t('min')) +
    stat(t('onTime') + ' (≤' + MAX_MIN + ')', del.length ? Math.round(onTime / del.length * 100) + '%' : '—') +
    stat(t('revenue'), rev.toFixed(3) + ' ' + CUR) +
    stat(t('cancelled'), all.filter(o => o.status === 'cancelled').length) +
    '</div><div class="section-title">' + esc(t('perCourier')) + '</div><div class="card" style="overflow-x:auto"><table><thead><tr>' +
    '<th>' + esc(t('courier')) + '</th><th class="num">' + esc(t('count')) + '</th><th class="num">' + esc(t('estKm')) + '</th><th class="num">' + esc(t('revenue')) + '</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td>' + esc(r.c.full_name) + '</td><td class="num">' + r.n + '</td><td class="num">' + fmtKm(r.km) + '</td><td class="num">' + r.rev.toFixed(3) + '</td></tr>').join('') +
    '</tbody></table></div>';
}
function stat(label, val) { return '<div class="stat"><span>' + esc(label) + '</span><b>' + esc(val) + '</b></div>'; }

/* ---------------- kurye ekranı ---------------- */
let myPos = null, lastSent = 0, lastSentAt = null, watcherId = null;
function shiftIsOn() { try { return localStorage.getItem('rk_shift') === '1'; } catch (e) { return false; } }
function setShift(v) { try { localStorage.setItem('rk_shift', v ? '1' : '0'); } catch (e) {} }

function courierView() {
  const list = activeOf(me.id).sort((a, b) => (a.seq || 0) - (b.seq || 0));
  const doneToday = orders.filter(o => o.courier_id === me.id && o.status === 'delivered').length;
  const on = shiftIsOn();
  let h = '<div class="card shift"><span class="dot ' + (on ? 'on' : '') + '"></span><div style="flex:1">' +
    '<b>' + esc(on ? t('shiftOn') : t('shiftOff')) + '</b>' +
    (lastSentAt ? '<div class="muted small">' + esc(t('lastSeen')) + ' ' + hhmm(lastSentAt) + '</div>' : '') + '</div>' +
    '<button class="btn ' + (on ? '' : 'primary') + '" data-act="shift">' + esc(on ? t('endShift') : t('startShift')) + '</button></div>';
  h += '<div class="section-title">' + esc(t('myTasks')) + ' <span>' + esc(t('todayDone')) + ': ' + doneToday + '</span></div>';
  if (!list.length) return h + '<div class="card empty">' + esc(t('noTasks')) + '</div>';

  const waiting = list.filter(o => o.status === 'assigned');
  if (waiting.length) h += '<button class="btn primary block" data-act="pickedUp" style="margin-bottom:10px;min-height:52px">' + esc(t('pickedUp')) + '</button>';

  // Tahmini varış: kuryenin şu anki konumundan (yoksa restorandan) sırayla
  const from = myPos || restaurantPos();
  const sim = R.simulate(from, list);
  list.forEach((o, i) => {
    const wa = waNumber(o.customer_phone);
    const etaMin = Math.max(1, Math.round(sim.arrivals[i]));
    const msg = (lang === 'tr'
      ? 'Merhaba ' + (o.customer_name || '') + ', siparişiniz yolda. Tahmini varış: ' + etaMin + ' dk.'
      : 'Hello ' + (o.customer_name || '') + ', your order is on the way. Estimated arrival: ' + etaMin + ' min.') +
      '\nطلبك في الطريق، الوصول المتوقع خلال ' + etaMin + ' دقيقة.';
    h += '<div class="card"><div class="order"><span class="no">' + (i + 1) + '</span><div>' +
      '<div class="name">' + esc(o.customer_name || '—') + ' ' + pills(o) + '</div>' +
      (o.address_text ? '<div class="meta">' + esc(o.address_text) + '</div>' : '') +
      (o.note ? '<div class="meta">📝 ' + esc(o.note) + '</div>' : '') +
      (o.amount != null ? '<div class="meta"><b>' + esc(t('collect')) + ': ' + esc(money(o.amount)) + '</b></div>' : '') +
      '<div class="meta">' + esc(t('eta')) + ' ~' + etaMin + ' ' + t('min') + ' ' + esc(myPos ? t('etaFrom') : '') + '</div></div>' +
      '<div class="actions">' +
      '<a class="btn small" href="https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + ll(o) + '" target="_blank" rel="noopener">🧭 ' + esc(t('navigate')) + '</a>' +
      (o.customer_phone ? '<a class="btn small" href="tel:' + esc(o.customer_phone.replace(/\s/g, '')) + '">📞 ' + esc(t('call')) + '</a>' : '') +
      (wa ? '<a class="btn small" href="https://wa.me/' + wa + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">💬 ' + esc(t('whatsapp')) + '</a>' : '') +
      (o.status === 'on_way' ? btn('deliver', o.id, '✓ ' + t('delivered'), 'ok') : '') +
      '</div></div></div>';
  });
  if (list.length > 1) {
    const dest = list[list.length - 1], mid = list.slice(0, -1).slice(0, 8);
    const url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + ll(dest) +
      (mid.length ? '&waypoints=' + encodeURIComponent(mid.map(ll).join('|')) : '');
    h += '<a class="btn block" href="' + url + '" target="_blank" rel="noopener">🗺️ ' + esc(t('openRoute')) + '</a>';
  }
  return h;
}

function bgPlugin() {
  const Cap = window.Capacitor;
  return Cap && Cap.isNativePlatform && Cap.isNativePlatform() && Cap.Plugins && Cap.Plugins.BackgroundGeolocation;
}
async function startTracking() {
  const BG = bgPlugin();
  try {
    if (BG) {
      watcherId = await BG.addWatcher({
        backgroundTitle: 'RotaKurye', backgroundMessage: t('trackingNotif'),
        requestPermissions: true, stale: false, distanceFilter: 25
      }, (loc, err) => {
        if (err) { if (err.code === 'NOT_AUTHORIZED') { toast(t('locDenied'), 4000); BG.openSettings && BG.openSettings(); } return; }
        if (loc) onPos(loc.latitude, loc.longitude, loc.accuracy);
      });
    } else if (navigator.geolocation) {
      watcherId = navigator.geolocation.watchPosition(
        p => onPos(p.coords.latitude, p.coords.longitude, p.coords.accuracy),
        () => toast(t('locDenied'), 4000),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 });
    }
  } catch (e) { fail(e); }
}
function stopTracking() {
  const BG = bgPlugin();
  try {
    if (watcherId != null) { if (BG) BG.removeWatcher({ id: watcherId }); else navigator.geolocation.clearWatch(watcherId); }
  } catch (e) {}
  watcherId = null;
}
async function onPos(lat, lng, acc) {
  const first = !myPos;
  myPos = { lat, lng };
  const now = Date.now();
  if (now - lastSent < 15000) return;   // en fazla 15 saniyede bir gönder
  lastSent = now;
  const { error } = await sb.from('courier_locations').upsert({
    courier_id: me.id, restaurant_id: me.restaurant_id, lat, lng, accuracy: acc || null, updated_at: nowIso()
  });
  if (!error) { lastSentAt = nowIso(); if (first) renderContent(); }
}

/* ---------------- tıklamalar ---------------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id ? Number(b.dataset.id) : null;
  try {
    if (act === 'lang') { lang = lang === 'tr' ? 'en' : 'tr'; try { localStorage.setItem('rk_lang', lang); } catch (x) {} return me ? render() : showLogin(); }
    if (act === 'signout') { stopTracking(); await sb.auth.signOut(); location.reload(); return; }
    if (act === 'tab') { ui.tab = b.dataset.tab; ui.pickRestaurant = false; return render(); }
    if (act === 'closeModal') { b.closest('.modal').remove(); return; }
    if (act === 'newOrder') return openNewOrder();
    if (act === 'pickOrder') {
      const ta = document.getElementById('noLoc');
      const cur = parseLocation(ta.value);
      return openPicker(cur.lat != null ? cur : restaurantPos(), p => {
        ta.value = p.lat.toFixed(6) + ',' + p.lng.toFixed(6); ta.dispatchEvent(new Event('input'));
      });
    }
    if (act === 'suggest') { ui.suggest = computeSuggest(); return renderContent(); }
    if (act === 'closeSuggest') { ui.suggest = null; return renderContent(); }
    if (act === 'assignTrip') {
      const i = Number(b.dataset.i), sel = document.querySelector('[data-tripsel="' + i + '"]');
      return assignOrders(ui.suggest[i].orders.map(o => o.id), sel.value);
    }
    if (act === 'assignOne') {
      const sel = document.querySelector('[data-sel="' + id + '"]');
      return assignOrders([id], sel.value);
    }
    if (act === 'ready') return update(id, { status: 'ready', ready_at: nowIso() });
    if (act === 'unassign') return update(id, { status: 'ready', courier_id: null, seq: null, assigned_at: null });
    if (act === 'cancel') { if (!window.confirm(t('confirmCancel'))) return; return update(id, { status: 'cancelled' }); }
    if (act === 'setRest') { ui.pickRestaurant = !ui.pickRestaurant; b.textContent = ui.pickRestaurant ? t('tapRestaurant') : t('setRestaurant'); return; }
    if (act === 'shift') {
      const on = !shiftIsOn(); setShift(on);
      if (on) startTracking(); else stopTracking();
      return renderContent();
    }
    if (act === 'pickedUp') {
      const ids = activeOf(me.id).filter(o => o.status === 'assigned').map(o => o.id);
      const ts = nowIso();
      const res = await Promise.all(ids.map(x => sb.from('orders').update({ status: 'on_way', picked_at: ts }).eq('id', x)));
      const err = res.find(r => r.error); if (err) return fail(err.error);
      if (!shiftIsOn()) { setShift(true); startTracking(); }
      await loadOrders(); return renderContent();
    }
    if (act === 'deliver') { await update(id, { status: 'delivered', delivered_at: nowIso() }); toast(t('deliveredMsg')); return; }
  } catch (err) { fail(err); }
});
async function update(id, patch) {
  const { error } = await sb.from('orders').update(patch).eq('id', id);
  if (error) return fail(error);
  await loadOrders(); if (ui.suggest) ui.suggest = computeSuggest(); renderContent();
}

boot().catch(fail);
})();
