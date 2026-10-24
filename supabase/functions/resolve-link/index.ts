// RotaKurye: kısa Google Maps linkini (maps.app.goo.gl) koordinata çevirir.
// Supabase > Edge Functions > Deploy a new function > Via Editor, adı: resolve-link

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function findCoords(text: string): { lat: number; lng: number } | null {
  let s = text;
  try { s = decodeURIComponent(text); } catch (_) { /* olduğu gibi kullan */ }
  const pats = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|daddr|destination|center)=(?:loc:)?(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /\/search\/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/,
    /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/,
  ];
  for (const p of pats) {
    const m = s.match(p);
    if (m) {
      const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { url } = await req.json();
    if (typeof url !== 'string' || !/^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)\//.test(url)) {
      return json({ error: 'Yalnızca Google Maps kısa linkleri kabul edilir' }, 400);
    }
    const headers = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36' };
    let cur = url;
    for (let i = 0; i < 6; i++) {
      const hit = findCoords(cur);
      if (hit) return json({ ...hit, url: cur });
      const r = await fetch(cur, { redirect: 'manual', headers });
      const loc = r.headers.get('location');
      if (!loc) {
        const body = await r.text();
        const fromBody = findCoords(body);
        return fromBody ? json({ ...fromBody, url: cur }) : json({ error: 'Koordinat bulunamadı', url: cur }, 404);
      }
      cur = new URL(loc, cur).toString();
    }
    const last = findCoords(cur);
    return last ? json({ ...last, url: cur }) : json({ error: 'Koordinat bulunamadı', url: cur }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
