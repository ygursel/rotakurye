/* RotaKurye — restoran teslimatı için gruplama ve sıralama.
   Tek çıkış noktası (restoran), kurye her seferde birkaç paket alıp döner.
   Mesafe: kuş uçuşu × yol katsayısı (pilot için). İleride OSRM ile değiştirilecek. */
(function (root) {
  const ROAD_FACTOR = 1.35;   // kuş uçuşunu yaklaşık yol mesafesine çevirir
  const SPEED_KMH = 28;       // şehir içi ortalama motosiklet/araba hızı
  const SERVICE_MIN = 3;      // kapıda geçen süre

  function hav(a, b) {
    const R = 6371, toR = Math.PI / 180;
    const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const roadKm = (a, b) => hav(a, b) * ROAD_FACTOR;
  const driveMin = km => km / SPEED_KMH * 60;

  // Verilen sırayla turu simüle eder: her durağın varış dakikası, toplam km, dönüş dahil süre
  function simulate(depot, stops) {
    let p = depot, t = 0, km = 0;
    const arrivals = [];
    for (const s of stops) {
      const d = roadKm(p, s);
      km += d; t += driveMin(d);
      arrivals.push(t);
      t += SERVICE_MIN; p = s;
    }
    const back = stops.length ? roadKm(p, depot) : 0;
    return { arrivals, km, kmWithReturn: km + back, minWithReturn: t + driveMin(back), outMin: t };
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    const out = [];
    arr.forEach((x, i) => {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      for (const p of permutations(rest)) out.push([x].concat(p));
    });
    return out;
  }

  // Sıra maliyeti: müşterilerin bekleme süreleri toplamı + geç kalma cezası
  function seqCost(depot, stops, ctx) {
    const s = simulate(depot, stops);
    let cost = 0;
    stops.forEach((o, i) => {
      const total = (ctx.waitedMin(o) || 0) + s.arrivals[i];
      const over = Math.max(0, total - ctx.maxMin);
      cost += s.arrivals[i] + over * (o.priority === 'urgent' ? 12 : 4);
    });
    return cost + s.minWithReturn * 0.2;
  }

  function bestSequence(depot, stops, ctx) {
    if (stops.length <= 1) return stops.slice();
    if (stops.length <= 6) {
      let best = null, bc = Infinity;
      for (const p of permutations(stops)) {
        const c = seqCost(depot, p, ctx);
        if (c < bc) { bc = c; best = p; }
      }
      return best;
    }
    // Uzun listeler için en yakın komşu + 2-opt
    const left = stops.slice(), seq = [];
    let cur = depot;
    while (left.length) {
      let bi = 0;
      left.forEach((s, i) => { if (roadKm(cur, s) < roadKm(cur, left[bi])) bi = i; });
      cur = left[bi]; seq.push(left.splice(bi, 1)[0]);
    }
    let improved = true, cur2 = seqCost(depot, seq, ctx), r = seq;
    while (improved) {
      improved = false;
      for (let i = 0; i < r.length - 1; i++) for (let j = i + 1; j < r.length; j++) {
        const n = r.slice(0, i).concat(r.slice(i, j + 1).reverse(), r.slice(j + 1));
        const c = seqCost(depot, n, ctx);
        if (c < cur2 - 0.01) { r = n; cur2 = c; improved = true; }
      }
    }
    return r;
  }

  /* Hazır siparişleri seferlere böler.
     orders: [{id, lat, lng, priority, readyAt(ms)}]
     opts: {now(ms), maxPerTrip, maxMin} */
  function planBatches(depot, orders, opts) {
    const now = opts.now || Date.now();
    const maxPerTrip = opts.maxPerTrip || 3;
    const maxMin = opts.maxMin || 40;
    const ctx = { maxMin, waitedMin: o => Math.max(0, (now - (o.readyAt || now)) / 60000) };
    const rt = stops => simulate(depot, bestSequence(depot, stops, ctx)).minWithReturn;
    const feasible = stops => {
      const seq = bestSequence(depot, stops, ctx), s = simulate(depot, seq);
      return seq.every((o, i) => ctx.waitedMin(o) + s.arrivals[i] <= maxMin || stops.length === 1);
    };

    const pool = orders.slice().sort((a, b) =>
      (a.priority === 'urgent' ? 0 : 1) - (b.priority === 'urgent' ? 0 : 1) || (a.readyAt || 0) - (b.readyAt || 0));
    const batches = [];
    while (pool.length) {
      const batch = [pool.shift()];
      while (batch.length < maxPerTrip && pool.length) {
        let best = null;
        const base = rt(batch);
        pool.forEach((c, i) => {
          const merged = batch.concat([c]);
          const saving = base + rt([c]) - rt(merged);
          if (saving > 1 && feasible(merged) && (!best || saving > best.saving)) best = { i, saving };
        });
        if (!best) break;
        batch.push(pool.splice(best.i, 1)[0]);
      }
      const seq = bestSequence(depot, batch, ctx), s = simulate(depot, seq);
      batches.push({
        orders: seq,
        km: s.km, kmWithReturn: s.kmWithReturn,
        arrivals: s.arrivals, minWithReturn: s.minWithReturn,
        oldestWaitMin: Math.max(...seq.map(ctx.waitedMin))
      });
    }
    // En uzun bekleyen sefer önce gitsin
    batches.sort((a, b) => b.oldestWaitMin - a.oldestWaitMin);
    return batches;
  }

  root.RKRoute = { hav, roadKm, driveMin, simulate, bestSequence, planBatches, SERVICE_MIN };
  if (typeof module !== 'undefined') module.exports = root.RKRoute;
})(typeof window !== 'undefined' ? window : globalThis);
