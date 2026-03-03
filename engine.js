// ════════════════════════════════════════════════════
// ENGINE.JS — Computation Engine
// ════════════════════════════════════════════════════

const Engine = (() => {

  // ── Seeded RNG ──
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function seededRand(seed, min, max) {
    const x = Math.sin(seed + 1) * 43758.5453123;
    const n = x - Math.floor(x);
    return Math.floor(n * (max - min + 1)) + min;
  }

  function pickFrom(arr, seed) {
    return arr[seededRand(seed, 0, arr.length - 1)];
  }

  // ── Compute Kundali ──
  function compute(formData) {
    const { name, dob, tob, pob, gender, lagnaSel, focus } = formData;
    const baseStr = name + dob + tob + pob;
    const S = hash(baseStr);

    // Build seed array
    const seeds = [S];
    for (let i = 1; i < 30; i++) seeds.push(hash(String(seeds[i - 1] * 6364136223846793005 + i)));

    // ── Lagna ──
    const lagna = lagnaSel >= 0 ? lagnaSel : seededRand(S, 0, 11);

    // ── Place 9 Planets ──
    const planetData = {};
    DATA.planets.forEach((p, i) => {
      const rashiPos = seededRand(seeds[i], 0, 11);
      const deg      = seededRand(seeds[i + 9], 0, 29) + parseFloat(('0.' + seededRand(seeds[i + 18], 0, 59)));
      const house    = ((rashiPos - lagna + 12) % 12) + 1;
      planetData[p.name] = {
        rashi:  rashiPos,
        house,
        deg:    parseFloat(deg.toFixed(2)),
        exalt:  rashiPos === p.exalt,
        debit:  rashiPos === p.debit,
        retro:  p.name !== 'Sun' && p.name !== 'Moon' && seededRand(seeds[i + 20], 0, 4) === 0,
      };
    });

    // Ketu = opposite Rahu
    const rahuRashi = planetData['Rahu'].rashi;
    const ketuRashi = (rahuRashi + 6) % 12;
    planetData['Ketu'] = {
      rashi:  ketuRashi,
      house:  ((ketuRashi - lagna + 12) % 12) + 1,
      deg:    planetData['Rahu'].deg,
      exalt:  ketuRashi === 7,
      debit:  ketuRashi === 1,
      retro:  false,
    };

    // ── House Map ──
    const houseMap = {};
    for (let i = 1; i <= 12; i++) houseMap[i] = [];
    Object.entries(planetData).forEach(([pname, d]) => houseMap[d.house].push(pname));

    // ── Nakshatra (from Moon) ──
    const moonRashi = planetData['Moon'].rashi;
    const moonDeg   = planetData['Moon'].deg;
    const nakshatraIdx = Math.floor((moonRashi * 30 + moonDeg) / (360 / 27)) % 27;
    const nakshatra = DATA.nakshatras[nakshatraIdx];

    // ── Vimshottari Dasha ──
    const [yr, mo, dy] = dob.split('-').map(Number);
    const dashaStartIdx = seededRand(hash(dob + tob), 0, 8); // index into DATA.dashaOrder
    const dashaTimeline = buildDasha(dashaStartIdx, yr, mo - 1, dy);

    // ── Yogas & Doshas ──
    const yogasPresent  = DATA.yogas.map((_,  i) => seededRand(seeds[i],     0, 3) > 1);
    const doshsPresent  = DATA.doshas.map((_, i) => seededRand(seeds[i + 8], 0, 4) > 2);

    // ── Scores ──
    const scores = {
      Health:    seededRand(seeds[1], 45, 95),
      Wealth:    seededRand(seeds[2], 40, 95),
      Career:    seededRand(seeds[3], 50, 95),
      Love:      seededRand(seeds[4], 45, 92),
      Spiritual: seededRand(seeds[5], 40, 98),
      Overall:   seededRand(seeds[6], 55, 90),
    };

    // ── Panchang for today ──
    const today = new Date();
    const dayStr = today.toDateString();
    const ds = hash(S + dayStr);
    const panchang = {
      tithi:    DATA.tithis[seededRand(ds, 0, DATA.tithis.length - 1)],
      nakshatra:DATA.nakshatras[seededRand(ds + 1, 0, 26)].name,
      yoga:     DATA.yogaNames[seededRand(ds + 2, 0, 26)],
      karana:   DATA.karanas[seededRand(ds + 3, 0, DATA.karanas.length - 1)],
      var:      DATA.weekdays[today.getDay()],
      luckyNum: seededRand(ds + 10, 1, 9),
      luckyColor: ['Red','Orange','Yellow','Green','Blue','White','Purple','Gold'][seededRand(ds + 11, 0, 7)],
      luckyGem:  DATA.planets[seededRand(ds + 12, 0, 8)].gem,
      luckyDir: ['North','South','East','West','North-East','North-West','South-East'][seededRand(ds + 13, 0, 6)],
      favorHr:  `${seededRand(ds + 14, 6, 10)}:00 – ${seededRand(ds + 14, 6, 10) + 2}:00`,
      cautionHr:`${seededRand(ds + 15, 13, 17)}:00 – ${seededRand(ds + 15, 13, 17) + 1}:30`,
      moonPhase: ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'][seededRand(ds + 16, 0, 7)],
    };

    // ── Compatibility by rashi ──
    const moonSign = DATA.rashis[moonRashi].name;
    const compatible = DATA.compatibleSigns[moonSign] || [];

    // ── Key Life Events ──
    const birthYear = yr;
    const lifeEvents = buildLifeEvents(seeds, birthYear);

    return {
      // Input
      name, dob, tob, pob, gender, focus,
      // Core
      S, seeds, lagna, planetData, houseMap,
      // Derived
      moonRashi, rahuRashi, ketuRashi: (rahuRashi + 6) % 12,
      nakshatra, nakshatraIdx,
      birthYear: yr, birthMonth: mo - 1, birthDay: dy,
      moonSign, compatible,
      // Dasha
      dashaStartIdx, dashaTimeline,
      // Analysis
      yogasPresent, doshsPresent, scores, panchang, lifeEvents,
      // Helpers
      _hash: hash, _rand: seededRand, _pick: pickFrom,
    };
  }

  function buildDasha(startIdx, yr, mo, dy) {
    const order = DATA.dashaOrder;
    let year = yr + mo / 12 + dy / 365;
    const timeline = [];
    for (let i = 0; i < 9; i++) {
      const idx    = (startIdx + i) % 9;
      const pidx   = order[idx];
      const planet = DATA.planets[pidx];
      const start  = year;
      const end    = start + planet.dasha;
      timeline.push({ planet: planet.name, pidx, start, end, years: planet.dasha });
      year = end;
    }
    return timeline;
  }

  function buildLifeEvents(seeds, birthYear) {
    return [
      { age: seededRand(seeds[10], 20, 27), ev: 'Career/Educational Milestone', desc: 'A significant professional or academic achievement that sets your career trajectory.' },
      { age: seededRand(seeds[11], 25, 33), ev: 'Major Relationship Event',      desc: 'Marriage, a defining partnership, or a transformative romantic union.' },
      { age: seededRand(seeds[12], 28, 40), ev: 'Financial Breakthrough',        desc: 'A major income leap, business success, or significant property acquisition.' },
      { age: seededRand(seeds[13], 32, 44), ev: 'Dharmic Turning Point',         desc: 'A life event that redirects you powerfully toward your highest purpose.' },
      { age: seededRand(seeds[14], 38, 52), ev: 'Authority & Leadership Peak',   desc: 'A period of maximum recognition, worldly achievement, and public influence.' },
      { age: seededRand(seeds[15], 50, 68), ev: 'Spiritual Awakening',           desc: 'A profound inner transformation and deepening of wisdom and inner peace.' },
    ].sort((a, b) => a.age - b.age).map(e => ({ ...e, year: birthYear + e.age }));
  }

  return { compute, hash, seededRand, pickFrom };

})();
