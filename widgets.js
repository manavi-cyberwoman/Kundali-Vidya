// ════════════════════════════════════════════════════
// WIDGETS.JS — Right Sidebar Widgets
// ════════════════════════════════════════════════════

const Widgets = (() => {

  function render(K) {
    renderToday(K);
    renderLucky(K);
    renderGem(K);
    renderTransits(K);
  }

  function renderToday(K) {
    const now = new Date();
    const items = [
      ['Tithi',      K.panchang.tithi],
      ['Nakshatra',  K.panchang.nakshatra],
      ['Yoga',       K.panchang.yoga],
      ['Moon Phase', K.panchang.moonPhase],
      ['Ruling Day', `${DATA.weekdays[now.getDay()].slice(0,3)} / ${'Sun,Moon,Mars,Mercury,Jupiter,Venus,Saturn'.split(',')[now.getDay()]}`],
    ];
    document.getElementById('todayWidget').innerHTML = `
    <div class="widget-body">
      ${items.map(([l, v]) => `
      <div class="today-item">
        <span class="ti-label">${l}</span>
        <span class="ti-value">${v}</span>
      </div>`).join('')}
    </div>`;
  }

  function renderLucky(K) {
    const nums = [K.panchang.luckyNum];
    const extra = [
      Engine.seededRand(Engine.hash(K.S + 'ln1'), 1, 9),
      Engine.seededRand(Engine.hash(K.S + 'ln2'), 10, 50),
      Engine.seededRand(Engine.hash(K.S + 'ln3'), 1, 9),
    ];
    nums.push(...extra);

    document.getElementById('luckyWidget').innerHTML = `
    <div class="lucky-nums">
      ${nums.map(n => `<div class="lucky-num-ball">${n}</div>`).join('')}
    </div>
    <div class="widget-body" style="padding-top:0">
      <div class="today-item"><span class="ti-label">Color</span><span class="ti-value">${K.panchang.luckyColor}</span></div>
      <div class="today-item"><span class="ti-label">Direction</span><span class="ti-value">${K.panchang.luckyDir}</span></div>
      <div class="today-item"><span class="ti-label">Fav. Hours</span><span class="ti-value">${K.panchang.favorHr}</span></div>
    </div>`;
  }

  function renderGem(K) {
    const lagnaLordId = DATA.rashis[K.lagna].lord;
    const planet      = DATA.planets[lagnaLordId];
    const gemEmojis   = { Ruby:'💎', Pearl:'🔮', 'Red Coral':'🟠', Emerald:'💚', 'Yellow Sapphire':'💛', Diamond:'💠', 'Blue Sapphire':'🔵', Hessonite:'🟤', "Cat's Eye":'🟡' };
    const emoji = gemEmojis[planet.gem] || '💎';

    document.getElementById('gemWidget').innerHTML = `
    <div class="gem-display">
      <div class="gem-icon">${emoji}</div>
      <div class="gem-name">${planet.gem}</div>
      <div class="gem-note">Recommended for ${planet.name} (your Lagna lord). Wear in ${planet.color === '#ff8c00' || planet.color === '#f9a825' ? 'gold' : 'silver'} after consulting a qualified astrologer.</div>
    </div>`;
  }

  function renderTransits(K) {
    const now = new Date();
    const transits = DATA.planets.slice(0, 7).map((p, i) => {
      const transitRashi = Engine.seededRand(Engine.hash(K.S + 'transit' + i + now.getMonth()), 0, 11);
      const days = Engine.seededRand(Engine.hash(K.S + 'td' + i), 10, 45);
      return { planet: p, rashi: DATA.rashis[transitRashi], days };
    });

    document.getElementById('transitWidget').innerHTML = `
    <div class="widget-body">
      ${transits.map(t => `
      <div class="transit-item">
        <div class="transit-planet" style="color:${t.planet.color}">${t.planet.sym} ${t.planet.name}</div>
        <div class="transit-info">Transiting ${t.rashi.name} • ${t.days} days remaining</div>
      </div>`).join('')}
    </div>`;
  }

  return { render };

})();
