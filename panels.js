// ════════════════════════════════════════════════════
// PANELS.JS — All Panel Renderers
// ════════════════════════════════════════════════════

const Panels = (() => {

  const R = Engine.seededRand;
  const P = Engine.pickFrom;

  // ── Helpers ──
  function nth(n) {
    const s = ['st','nd','rd'];
    const v = n % 100;
    return n + (v >= 11 && v <= 13 ? 'th' : (s[(v - 1) % 10] || 'th'));
  }

  function stars(score) {
    const n = Math.round(score / 20);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function scoreClass(s) { return s >= 75 ? 'high' : s >= 50 ? 'mid' : 'low'; }

  function predCard(icon, title, text, score, ruler, colorClass = '') {
    return `
    <div class="pred-card">
      <div class="pred-card-top">
        <span class="pred-card-icon">${icon}</span>
        <span class="pred-card-title">${title}</span>
        <span class="pred-card-stars">${stars(score)}</span>
      </div>
      <div class="pred-card-body">
        <p class="pred-card-text">${text}</p>
      </div>
      <div class="pred-card-footer">
        <span class="pred-ruler">Ruled by ${ruler}</span>
        <span class="pred-score ${scoreClass(score)}">${score}%</span>
      </div>
    </div>`;
  }

  function scoreBar(label, value, color) {
    return `
    <div class="score-row">
      <div class="score-label">${label}</div>
      <div class="score-bar-bg">
        <div class="score-bar-fill" style="width:0%;background:${color}" data-target="${value}"></div>
      </div>
      <div class="score-val">${value}%</div>
    </div>`;
  }

  function animateBars(container) {
    setTimeout(() => {
      container.querySelectorAll('[data-target]').forEach(el => {
        el.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
        el.style.width = el.dataset.target + '%';
      });
    }, 100);
  }

  function sectionTitle(text, sub = '') {
    return `<div class="section-divider">${text}${sub ? `<span style="font-weight:400;text-transform:none;margin-left:8px;color:#aaa">${sub}</span>` : ''}</div>`;
  }

  // ════════════════════════════════════
  // OVERVIEW
  // ════════════════════════════════════
  function overview(K) {
    const lagna    = DATA.rashis[K.lagna];
    const moon     = DATA.rashis[K.planetData['Moon'].rashi];
    const sun      = DATA.rashis[K.planetData['Sun'].rashi];
    const now      = new Date();
    const currentAge = now.getFullYear() - K.birthYear;

    // Find current dasha
    const curYear = now.getFullYear() + now.getMonth() / 12 + now.getDate() / 365;
    const curDasha = K.dashaTimeline.find(d => curYear >= d.start && curYear < d.end) || K.dashaTimeline[0];
    const curDashaP = DATA.planets[curDasha.pidx];

    const items = [
      { icon: '⬆',  label: 'Ascendant',    value: lagna.name,     sub: lagna.hi },
      { icon: '☽',  label: 'Moon Sign',     value: moon.name,      sub: moon.hi },
      { icon: '☉',  label: 'Sun Sign',      value: sun.name,       sub: sun.hi },
      { icon: '🌟', label: 'Nakshatra',      value: K.nakshatra.name, sub: 'Birth Star' },
      { icon: '🔮', label: 'Element',        value: lagna.elem,     sub: lagna.quality },
      { icon: '⏳', label: 'Current Dasha',  value: curDashaP.name, sub: `${curDashaP.en} Dasha` },
      { icon: '📅', label: 'Age',            value: currentAge + ' yrs', sub: K.birthYear },
      { icon: '🧭', label: 'Lagna Quality',  value: lagna.quality,  sub: DATA.rashis[K.lagna].elem },
    ];

    const ovHTML = `<div class="overview-grid">${items.map(it => `
      <div class="ov-item">
        <div class="ov-icon">${it.icon}</div>
        <div class="ov-label">${it.label}</div>
        <div class="ov-value">${it.value}</div>
        <div class="ov-sub">${it.sub}</div>
      </div>`).join('')}</div>`;

    const scoreColors = { Health:'#e53935', Wealth:'#f9a825', Career:'#1565c0', Love:'#e91e8c', Spiritual:'#ff6b35', Overall:'#2e7d32' };
    const scoresHTML = `
    <div class="card">
      <div class="card-header"><h3>🌟 Life Area Strengths</h3></div>
      <div class="card-body">
        ${Object.entries(K.scores).map(([k, v]) => scoreBar(k, v, scoreColors[k] || '#ff6b35')).join('')}
      </div>
    </div>`;

    // Yoga count
    const yogaCount = K.yogasPresent.filter(Boolean).length;
    const doshaCount = K.doshsPresent.filter(Boolean).length;

    const summaryHTML = `
    <div class="card">
      <div class="card-header"><h3>📊 Chart Summary</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
          ${[
            ['Yogas Present', yogaCount + ' of ' + DATA.yogas.length, yogaCount >= 4 ? '#2e7d32' : '#f9a825'],
            ['Doshas Present', doshaCount + ' of ' + DATA.doshas.length, doshaCount === 0 ? '#2e7d32' : '#e53935'],
            ['Benefics', '3 planets', '#2e7d32'],
            ['Malefics', '4 planets', '#c03030'],
            ['Exalted', K.planetData ? Object.values(K.planetData).filter(p => p.exalt).length + ' planets' : '0', '#2e7d32'],
            ['Debilitated', K.planetData ? Object.values(K.planetData).filter(p => p.debit).length + ' planets' : '0', '#c03030'],
          ].map(([l, v, c]) => `
          <div style="text-align:center;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:10px 8px">
            <div style="font-size:0.68rem;color:#999;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">${l}</div>
            <div style="font-size:0.92rem;font-weight:700;color:${c}">${v}</div>
          </div>`).join('')}
        </div>
        <div class="info-note" style="margin-top:12px">
          <strong>Nakshatra Lord:</strong> ${DATA.nakshatras[K.nakshatraIdx].lord >= 0 ? DATA.planets[DATA.nakshatras[K.nakshatraIdx].lord].name : 'Unknown'} — 
          <strong>Deity:</strong> ${DATA.nakshatras[K.nakshatraIdx].deity}
        </div>
      </div>
    </div>`;

    return `
    <div class="panel-header">
      <h2>📊 Kundli Overview — ${K.name}</h2>
      <p>${K.dob} • ${K.tob} • ${K.pob}</p>
    </div>
    ${ovHTML}
    ${scoresHTML}
    ${summaryHTML}`;
  }

  // ════════════════════════════════════
  // KUNDLI CHART
  // ════════════════════════════════════
  function kundliChart(K) {
    // Build rashi wheel table
    const rashiRows = Array.from({ length: 12 }, (_, i) => {
      const rashiIdx = (K.lagna + i) % 12;
      const rashi    = DATA.rashis[rashiIdx];
      const planets  = K.houseMap[i + 1] || [];
      return `<tr>
        <td><span class="house-num">${i + 1}</span></td>
        <td>${DATA.houses[i].name} <span class="house-name-hi">${DATA.houses[i].hi}</span></td>
        <td>${rashi.symbol} ${rashi.name}</td>
        <td><span class="house-name-hi">${rashi.hi}</span></td>
        <td>
          <div class="house-planets-cell">
            ${planets.length ? planets.map(p => {
              const pd = K.planetData[p];
              const pl = DATA.planets.find(x => x.name === p);
              const cls = pd && pd.exalt ? 'status-exalted' : pd && pd.debit ? 'status-debilitated' : '';
              return `<span class="hp-tag ${cls}">${p}${pd && pd.retro ? ' ℞' : ''}</span>`;
            }).join('') : '<span style="color:#ccc">—</span>'}
          </div>
        </td>
      </tr>`;
    }).join('');

    return `
    <div class="panel-header"><h2>🔯 Kundli Chart</h2><p>North Indian (Parashari) Birth Chart</p></div>
    <div class="chart-layout">
      <div class="card">
        <div class="card-header"><h3>🔯 Lagna Chart (D-1)</h3><span class="card-badge">North Indian</span></div>
        <div class="card-body chart-canvas-wrap">
          <canvas id="mainChartCanvas" class="kundli-canvas" width="360" height="360"></canvas>
          <p style="font-size:0.75rem;color:#999;margin-top:10px;text-align:center">
            <span style="color:#1a7a1a">■ Exalted</span> &nbsp;
            <span style="color:#c03030">■ Debilitated</span> &nbsp;
            <span style="color:#ff6b35">■ Normal</span>
          </p>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📋 House Details</h3></div>
        <div class="card-body" style="padding:0;overflow-x:auto">
          <table class="house-table">
            <thead><tr><th>#</th><th>Bhava</th><th>Rashi</th><th>Hindi</th><th>Planets</th></tr></thead>
            <tbody>${rashiRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  // ════════════════════════════════════
  // PLANET TABLE
  // ════════════════════════════════════
  function planetTable(K) {
    const rows = DATA.planets.map(p => {
      const d  = K.planetData[p.name];
      if (!d) return '';
      const status = d.exalt ? '<span class="status-exalted">⬆ Exalted</span>' :
                     d.debit ? '<span class="status-debilitated">⬇ Debilitated</span>' : 'Neutral';
      const natClass = p.nature === 'benefic' ? 'nature-benefic' : p.nature === 'malefic' ? 'nature-malefic' : 'nature-neutral';
      const retroMark = d.retro ? ' <small style="color:#c03030">(℞)</small>' : '';
      return `<tr>
        <td>
          <div class="planet-sym-cell">
            <div class="planet-dot" style="background:${p.bg};border:2px solid ${p.color};color:${p.color}">${p.sym}</div>
            <div>
              <div style="font-weight:600">${p.name}${retroMark}</div>
              <div style="font-size:0.72rem;color:#999;font-family:'Noto Serif Devanagari',serif">${p.hi}</div>
            </div>
          </div>
        </td>
        <td>${DATA.rashis[d.rashi].symbol} ${DATA.rashis[d.rashi].name} <small style="color:#999">${DATA.rashis[d.rashi].hi}</small></td>
        <td>${d.deg.toFixed(2)}°</td>
        <td>${nth(d.house)} House</td>
        <td><span class="nature-tag ${natClass}">${p.nature}</span></td>
        <td>${status}</td>
        <td style="font-size:0.78rem;color:#666">${p.gem}</td>
      </tr>`;
    }).join('');

    return `
    <div class="panel-header"><h2>🪐 Planetary Positions</h2><p>All 9 Grahas — Rashi, Degree, House, Status</p></div>
    <div class="card">
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="planet-table">
          <thead><tr><th>Planet</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nature</th><th>Status</th><th>Gem</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📖 Divisional Charts (Shodasavarga)</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          ${DATA.divisionalCharts.map(d => `
          <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:10px">
            <div style="font-weight:700;font-size:0.82rem;color:#ff6b35">${d.code} — ${d.name}</div>
            <div style="font-size:0.72rem;color:#999;margin:2px 0 5px">${d.full}</div>
            <div style="font-size:0.78rem;color:#666;line-height:1.45">${d.desc}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  // ════════════════════════════════════
  // HOUSE ANALYSIS
  // ════════════════════════════════════
  function houseAnalysis(K) {
    const houseDescriptions = [
      (lagna) => `Your Lagna is <strong>${DATA.rashis[lagna].name}</strong> — a ${DATA.rashis[lagna].elem} sign of ${DATA.rashis[lagna].quality} quality. This gives you a ${lagna % 3 === 0 ? 'nurturing, sensitive' : lagna % 3 === 1 ? 'dynamic, energetic' : 'intellectual, communicative'} personality and a ${DATA.rashis[lagna].name} appearance.`,
      () => `The 2nd house governs your accumulated wealth, speech, and family values. Planets here strongly influence your relationship with money and your communication style.`,
      () => `The 3rd house of courage and siblings shows your drive, writing ability, and relationship with brothers and sisters. It rules short journeys and media.`,
      () => `The 4th house reveals your home life, maternal figures, and emotional security. It rules real estate, vehicles, and your sense of comfort.`,
      () => `The 5th house of children and intelligence shows your creative power, romantic tendencies, and past-life meritorious deeds (purva punya).`,
      () => `The 6th house reveals how you handle obstacles, enemies, and health challenges. A strong 6th house gives victory over adversaries.`,
      () => `The 7th house governs marriage, partnerships, and business dealings. Planets here shape the nature of your spouse and key relationships.`,
      () => `The 8th house of transformation shows your relationship with change, hidden resources, inheritance, and mystical dimensions of life.`,
      () => `The 9th house is the house of fortune and dharma. It governs your father, guru, religion, and the grace that flows into your life.`,
      () => `The 10th house of karma governs career, public status, and your contribution to society. It is the most visible house in the chart.`,
      () => `The 11th house of gains reveals your income sources, social network, and fulfillment of desires. Elder siblings also belong here.`,
      () => `The 12th house of liberation rules expenses, foreign lands, spirituality, and the journey toward moksha and inner freedom.`,
    ];

    const rows = DATA.houses.map((h, i) => {
      const rashiIdx  = (K.lagna + i) % 12;
      const rashi     = DATA.rashis[rashiIdx];
      const planets   = K.houseMap[i + 1] || [];
      const lordIdx   = rashi.lord;
      const lord      = DATA.planets[lordIdx];
      const lordHouse = K.planetData[lord.name]?.house || '?';
      const desc      = typeof houseDescriptions[i] === 'function' ? houseDescriptions[i](K.lagna) : houseDescriptions[i];
      return `
      <div class="card" style="margin-bottom:12px">
        <div class="card-header">
          <h3>${rashi.symbol} ${nth(i+1)} House — ${h.name} (${h.hi})</h3>
          <span class="card-badge">${rashi.name}</span>
        </div>
        <div class="card-body">
          <p style="font-size:0.82rem;color:#666;margin-bottom:10px;line-height:1.55">${desc}</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.8rem">
            <div><span style="color:#999">Rashi:</span> <strong>${rashi.name} (${rashi.hi})</strong></div>
            <div><span style="color:#999">Lord:</span> <strong>${lord.name}</strong> in ${nth(lordHouse)} House</div>
            <div><span style="color:#999">Domain:</span> ${h.meaning.split(',').slice(0,3).join(', ')}</div>
            ${planets.length ? `<div><span style="color:#999">Planets:</span> <strong>${planets.join(', ')}</strong></div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    return `
    <div class="panel-header"><h2>🏠 House Analysis (12 Bhavas)</h2><p>Detailed analysis of all 12 houses and their significance</p></div>
    ${rows}`;
  }

  // ════════════════════════════════════
  // DASHA
  // ════════════════════════════════════
  function dasha(K) {
    const now = new Date();
    const curYear = now.getFullYear() + now.getMonth() / 12 + now.getDate() / 365;
    const dashaEffects = {
      Sun: 'Career, authority, government dealings, father, heart health, leadership roles.',
      Moon: 'Emotional wellbeing, mother, travel, home changes, mental sensitivity.',
      Mars: 'Property, energy, siblings, courage, ambition, physical vitality.',
      Mercury: 'Business, intellect, communication, education, trade, travel.',
      Jupiter: 'Children, wisdom, dharma, expansion, teachers, spiritual growth.',
      Venus: 'Marriage, luxury, arts, comfort, love, financial gains.',
      Saturn: 'Karma, hard work, discipline, delays, service, long-term results.',
      Rahu: 'Ambition, foreign connections, technology, unconventional paths, illusions.',
      Ketu: 'Spirituality, detachment, past karma, moksha, psychic sensitivity.',
    };

    const rows = K.dashaTimeline.map(d => {
      const isCurr = curYear >= d.start && curYear < d.end;
      const progress = isCurr ? Math.round(((curYear - d.start) / d.years) * 100) : (curYear >= d.end ? 100 : 0);
      const pl = DATA.planets.find(p => p.name === d.planet);

      // Sub-dashas (Antardashas)
      const subDashas = DATA.dashaOrder.map((pidx, j) => {
        const sp = DATA.planets[pidx];
        const subYears = (d.years * sp.dasha / 120).toFixed(1);
        return { name: sp.name, years: subYears };
      });

      return `
      <tr class="${isCurr ? 'current-row' : ''}">
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:${pl.bg};border:2px solid ${pl.color};display:flex;align-items:center;justify-content:center;font-size:0.9rem;color:${pl.color}">${pl.sym}</div>
            <span class="dasha-planet">${d.planet}</span>
            ${isCurr ? `<span class="dasha-label">ACTIVE</span>` : ''}
          </div>
        </td>
        <td>${Math.floor(d.start)} – ${Math.floor(d.end)}</td>
        <td>${d.years} yrs</td>
        <td style="font-size:0.78rem;color:#666">${dashaEffects[d.planet] || ''}</td>
        <td>
          ${isCurr ? `
          <div class="dasha-progress">
            <div style="font-size:0.72rem;color:#999;margin-bottom:3px">${progress}% complete</div>
            <div class="dasha-prog-bg"><div class="dasha-prog-fill" style="width:${progress}%"></div></div>
          </div>` : curYear >= d.end ? '<span style="color:#2a7a2a;font-size:0.8rem">✓ Completed</span>' : '<span style="color:#999;font-size:0.8rem">⏳ Upcoming</span>'}
        </td>
      </tr>
      ${isCurr ? `<tr><td colspan="5">
        <div class="antardasha-list">
          <div class="sub-title">Antardashas (Sub-Periods)</div>
          <div class="sub-dasha-grid">
            ${subDashas.map(s => `<div class="sub-dasha-item"><div class="sub-dasha-p">${s.name}</div><div class="sub-dasha-y">${s.years} yrs</div></div>`).join('')}
          </div>
        </div>
      </td></tr>` : ''}`;
    }).join('');

    // Current dasha description
    const curDasha = K.dashaTimeline.find(d => curYear >= d.start && curYear < d.end) || K.dashaTimeline[0];
    const curP = DATA.planets[curDasha.pidx];
    const detailedEffects = {
      Sun: 'The Sun Maha Dasha illuminates your identity, leadership, and public image. Government connections, career authority, and your relationship with father and father figures take center stage. Health of eyes and heart requires attention. Opportunities arise through confidence and authentic self-expression.',
      Moon: 'The Moon Maha Dasha deepens emotional intelligence and intuitive gifts. Your relationship with mother and feminine figures becomes central. Travel near water, domestic changes, and heightened emotional sensitivity mark this period. Mental peace comes through connecting with nature and nurturing relationships.',
      Mars: 'The Mars Maha Dasha ignites energy, ambition, and courage. Property, real estate, and land dealings are highly favored. Siblings play an important role. The body is energized but prone to heat, accidents, and inflammation. Act decisively but avoid aggression and impulsiveness.',
      Mercury: 'The Mercury Maha Dasha sharpens intellect and opens doors through communication, writing, and trade. Education, business, and sibling relationships flourish. A period of mental activity, information, short journeys, and commercial success.',
      Jupiter: 'The Jupiter Maha Dasha is one of the most auspicious periods — bringing wisdom, spiritual growth, children, and expansion in all life domains. Teacher and guru figures enter your life. Your dharmic path becomes luminously clear. Spiritual progress accelerates.',
      Venus: 'The Venus Maha Dasha, the longest at 20 years, brings luxury, love, artistic pursuits, and prosperity. Marriage and partnerships are highlighted. Creativity, beauty, and material comfort flow abundantly into life.',
      Saturn: 'The Saturn Maha Dasha tests discipline, patience, and commitment to dharma. What is built slowly here lasts forever. Service, hard work, and facing karmic debts lead to unshakeable foundations. This is a period of earning, not receiving.',
      Rahu: 'The Rahu Maha Dasha brings ambition, obsession, and unconventional experiences. Foreign connections, technology, and boundary-breaking opportunities emerge. Material gains can be rapid but illusions must be seen through clearly to avoid pitfalls.',
      Ketu: 'The Ketu Maha Dasha brings spiritual depth, detachment from worldly matters, and karmic resolution. Psychic sensitivity heightens. Past-life gifts re-emerge powerfully. What falls away in this period creates sacred space for the divine to enter.',
    };

    return `
    <div class="panel-header"><h2>⏳ Vimshottari Dasha</h2><p>120-year planetary period cycle governing major life themes</p></div>
    <div class="card" style="border-left:4px solid ${curP.color}">
      <div class="card-header"><h3>${curP.sym} Current Maha Dasha: ${curP.name} (${curP.hi})</h3><span class="card-badge">ACTIVE</span></div>
      <div class="card-body">
        <p style="font-size:0.85rem;line-height:1.65;color:#444">${detailedEffects[curDasha.planet]}</p>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📊 Full Dasha Timeline</h3></div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="dasha-table">
          <thead><tr><th>Maha Dasha</th><th>Period</th><th>Duration</th><th>Key Themes</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  // ════════════════════════════════════
  // DAILY
  // ════════════════════════════════════
  function daily(K) {
    const now = new Date();
    const ds  = Engine.hash(K.S + now.toDateString());
    const R   = Engine.seededRand;
    const P   = Engine.pickFrom;

    const genScore  = R(ds + 1, 58, 95);
    const hlthScore = R(ds + 2, 52, 92);
    const carScore  = R(ds + 3, 50, 93);
    const finScore  = R(ds + 4, 48, 92);
    const lovScore  = R(ds + 5, 55, 95);
    const spiScore  = R(ds + 6, 55, 98);

    const gen  = P(DATA.predictionTexts.daily.general, ds + 1);
    const hlth = P(DATA.predictionTexts.daily.health, ds + 2);
    const car  = P(DATA.predictionTexts.daily.career, ds + 3);
    const fin  = P(DATA.predictionTexts.daily.finance, ds + 4);
    const lov  = P(DATA.predictionTexts.daily.love, ds + 5);

    const weekday   = DATA.weekdays[now.getDay()];
    const monthName = DATA.months[now.getMonth()];
    const rulers    = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
    const todayRuler = rulers[now.getDay()];

    const panchangHTML = `
    <div class="card">
      <div class="card-header"><h3>📿 Today's Panchang</h3><span class="card-badge">${weekday}, ${monthName} ${now.getDate()}, ${now.getFullYear()}</span></div>
      <div class="card-body">
        <div class="panchang-grid">
          ${[
            ['Tithi', K.panchang.tithi, 'Lunar day'],
            ['Nakshatra', K.panchang.nakshatra, 'Star'],
            ['Yoga', K.panchang.yoga, 'Auspiciousness'],
            ['Karana', K.panchang.karana, 'Half-tithi'],
            ['Vara', weekday, 'Day'],
            ['Moon Phase', K.panchang.moonPhase, ''],
            ['Lucky Number', K.panchang.luckyNum, 'For you'],
            ['Lucky Color', K.panchang.luckyColor, 'Wear today'],
            ['Favorable Hours', K.panchang.favorHr, 'Best time'],
            ['Caution Hours', K.panchang.cautionHr, 'Avoid tasks'],
          ].map(([l, v, s]) => `
          <div class="panch-item">
            <div class="panch-label">${l}</div>
            <div class="panch-value">${v}</div>
            ${s ? `<div class="panch-sub">${s}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>
    </div>`;

    const predHTML = `
    <div class="pred-grid">
      ${predCard('🌍', 'General Outlook', gen, genScore, todayRuler)}
      ${predCard('❤️', 'Love & Relationship', lov, lovScore, 'Venus')}
      ${predCard('💼', 'Career & Work', car, carScore, 'Mercury')}
      ${predCard('💰', 'Finance & Money', fin, finScore, 'Jupiter')}
      ${predCard('🌿', 'Health & Energy', hlth, hlthScore, 'Sun')}
      ${predCard('🕉', 'Spiritual Energy', `Today's spiritual quotient is <em>exceptionally high</em>. Your morning practice carries triple the impact. Light a ghee lamp, chant your mantra, and offer gratitude before checking your phone.`, spiScore, 'Ketu')}
    </div>`;

    const metersHTML = `
    <div class="card">
      <div class="card-header"><h3>📊 Daily Energy Meters</h3></div>
      <div class="card-body">
        ${scoreBar('Overall Luck', genScore, '#ff6b35')}
        ${scoreBar('Health Energy', hlthScore, '#e53935')}
        ${scoreBar('Career Focus', carScore, '#1565c0')}
        ${scoreBar('Financial Flow', finScore, '#f9a825')}
        ${scoreBar('Love Harmony', lovScore, '#e91e8c')}
        ${scoreBar('Spiritual Power', spiScore, '#ff6b35')}
      </div>
    </div>`;

    return `
    <div class="panel-header"><h2>🌅 Daily Predictions</h2><p>${weekday}, ${monthName} ${now.getDate()}, ${now.getFullYear()}</p></div>
    ${panchangHTML}
    ${predHTML}
    ${metersHTML}`;
  }

  // ════════════════════════════════════
  // WEEKLY
  // ════════════════════════════════════
  function weekly(K) {
    const now = new Date();
    const weekNum = Math.ceil((now.getDate()) / 7);
    const ds  = Engine.hash(K.S + 'week' + now.getFullYear() + now.getMonth() + weekNum);

    // Week strip
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStrip = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const energy  = Engine.seededRand(Engine.hash(K.S + d.toDateString()), 1, 5);
      return `
      <div class="day-cell ${isToday ? 'today' : ''}">
        <div class="day-name">${DATA.weekdays[i].slice(0, 3)}</div>
        <div class="day-num">${d.getDate()}</div>
        <div class="day-energy">${Array.from({length:5},(_,j)=>`<div class="de-dot ${j<energy?'on':''}"></div>`).join('')}</div>
      </div>`;
    }).join('');

    const areas = [
      ['💼','Career & Goals','#1565c0'],
      ['❤️','Love & Family','#e91e8c'],
      ['🌿','Health','#2e7d32'],
      ['💰','Finance','#f9a825'],
      ['🕉','Spiritual','#ff6b35'],
      ['👥','Social Life','#7b1fa2'],
    ];
    const weekTexts = [
      'This week brings <em>focused professional momentum</em>. Mid-week is especially powerful for achieving milestones and making important decisions.',
      'A week of <em>emotional depth and relationship insight</em>. Conversations that have been postponed can happen now with productive and healing results.',
      'Your physical vitality is <em>high and sustained</em> this week. Begin a new health routine or intensify an existing one — the body responds well now.',
      'Financial clarity arrives this week. A <em>pending decision about money</em> can be made with confidence. Review your long-term financial goals.',
      '<em>Deep spiritual impressions</em> and meaningful synchronicities mark this week. Meditation, prayer, or time in nature brings profound peace.',
      'Your social world expands naturally. <em>A chance encounter or gathering</em> introduces someone significant — be present and authentic.',
    ];

    const predHTML = `<div class="pred-grid">
      ${areas.map((a, i) => {
        const s = Engine.seededRand(Engine.hash(ds + i * 7), 55, 95);
        return predCard(a[0], a[1], weekTexts[i], s, DATA.planets[Engine.seededRand(Engine.hash(ds + i), 0, 8)].name);
      }).join('')}
    </div>`;

    const dayFocus = ['Plan & Set Intentions','Take Bold Action','Connect & Collaborate','Analyze & Reflect','Expand & Learn','Create & Express','Rest & Recharge'];
    const dayTable = `
    <div class="card">
      <div class="card-header"><h3>📅 Day-by-Day Focus</h3></div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="planet-table">
          <thead><tr><th>Day</th><th>Focus Theme</th><th>Ruling Planet</th><th>Advice</th></tr></thead>
          <tbody>${DATA.weekdays.map((day, i) => {
            const dScore = Engine.seededRand(Engine.hash(ds + i * 3), 50, 97);
            const ruler = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'][i];
            return `<tr><td><strong>${day}</strong></td><td>${dayFocus[i]}</td><td>${ruler}</td><td>
              <div style="display:flex;align-items:center;gap:6px">
                <div class="score-bar-bg" style="width:80px"><div class="score-bar-fill" style="width:0%;background:#ff6b35" data-target="${dScore}"></div></div>
                <span style="font-size:0.78rem;font-weight:700">${dScore}%</span>
              </div>
            </td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>`;

    return `
    <div class="panel-header"><h2>📅 Weekly Forecast</h2><p>Week of ${DATA.months[now.getMonth()]} ${startOfWeek.getDate()}, ${now.getFullYear()}</p></div>
    <div class="card"><div class="card-header"><h3>📆 Week at a Glance</h3></div><div class="card-body"><div class="week-strip">${weekStrip}</div></div></div>
    ${predHTML}
    ${dayTable}`;
  }

  // ════════════════════════════════════
  // MONTHLY
  // ════════════════════════════════════
  function monthly(K) {
    const now = new Date();
    const ds  = Engine.hash(K.S + 'month' + now.getFullYear() + now.getMonth());

    const areas = [
      { icon:'💼', key:'career',   title:'Career & Profession',  ruler:'Saturn', texts: DATA.predictionTexts.monthly.career },
      { icon:'💰', key:'wealth',   title:'Wealth & Finance',      ruler:'Jupiter',texts: DATA.predictionTexts.monthly.wealth },
      { icon:'❤️', key:'love',     title:'Love & Relationships',  ruler:'Venus',  texts: DATA.predictionTexts.monthly.love },
      { icon:'🌿', key:'health',   title:'Health & Vitality',     ruler:'Sun',    texts: DATA.predictionTexts.monthly.health },
      { icon:'🕉', key:'spiritual',title:'Spiritual Growth',      ruler:'Ketu',   texts: DATA.predictionTexts.monthly.spiritual },
      { icon:'🏠', key:'family',   title:'Family & Home',         ruler:'Moon',   texts: ['Warm family energy dominates. A celebration or meaningful gathering strengthens bonds. Resolve long-standing family matters with calm and love.','Home-related matters need practical attention — a repair, renovation, or important conversation with a family elder moves things forward.','Your family needs your <em>emotional presence</em> this month more than practical support. Be available, listen deeply, and show up with warmth.','An unexpected family development brings both challenge and opportunity for deeper understanding and healing of old wounds.'] },
    ];

    const predHTML = `<div class="pred-grid">${areas.map((a, i) => {
      const s = Engine.seededRand(Engine.hash(ds + i * 11), 55, 95);
      return predCard(a.icon, a.title, P(a.texts, Engine.hash(ds + i)), s, a.ruler);
    }).join('')}</div>`;

    const weekBreakdown = `
    <div class="card">
      <div class="card-header"><h3>🗓 Weekly Breakdown</h3></div>
      <div class="card-body">
        <div class="month-grid">
          ${['Week of Initiation','Week of Progress','Week of Harvest','Week of Reflection'].map((theme, i) => {
            const ws = Engine.hash(K.S + 'mweek' + i + ds);
            const wScore = Engine.seededRand(ws, 50, 95);
            const wTexts = [
              'Set powerful intentions and act decisively in the first 3 days. Cosmic energy powerfully supports new starts.',
              'Build steadily on what was started. Mid-week brings unexpected help or information that accelerates progress.',
              'The fruits of effort this month begin to crystallize. Express gratitude and share your gains generously.',
              'Review, rest, and prepare for the next cycle. The inner work done now seeds the coming month.',
            ];
            return `<div class="month-pred-card">
              <div class="month-name">Week ${i + 1}: ${theme}</div>
              <div style="height:5px;border-radius:3px;background:#f0f0f0;margin:5px 0 7px"><div style="height:100%;width:${wScore}%;border-radius:3px;background:#ff6b35"></div></div>
              <div class="month-text">${wTexts[i]}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;

    const metersHTML = `
    <div class="card">
      <div class="card-header"><h3>📊 Monthly Energy Overview</h3></div>
      <div class="card-body">
        ${areas.map((a, i) => scoreBar(a.title, Engine.seededRand(Engine.hash(ds + i * 13), 50, 95), ['#1565c0','#f9a825','#e91e8c','#e53935','#ff6b35','#7b1fa2'][i])).join('')}
      </div>
    </div>`;

    return `
    <div class="panel-header"><h2>🌙 Monthly Forecast</h2><p>${DATA.months[now.getMonth()]} ${now.getFullYear()}</p></div>
    ${predHTML}
    ${weekBreakdown}
    ${metersHTML}`;
  }

  // ════════════════════════════════════
  // YEARLY
  // ════════════════════════════════════
  function yearly(K) {
    const now  = new Date();
    const year = now.getFullYear();
    const ds   = Engine.hash(K.S + 'year' + year);
    const theme = P(DATA.predictionTexts.yearly.themes, ds);

    const quarterHTML = `
    <div class="pred-grid">
      ${DATA.predictionTexts.yearly.quarters.map((q, i) => {
        const s = Engine.seededRand(Engine.hash(ds + i * 17), 55, 92);
        return predCard(['🌱','🌿','🍂','⛄'][i], `${q.q} — ${q.theme}`, q.desc, s, DATA.planets[Engine.seededRand(Engine.hash(ds + i), 0, 8)].name);
      }).join('')}
    </div>`;

    const monthCards = DATA.months.map((m, i) => {
      const ms    = Engine.hash(K.S + m + year);
      const score = Engine.seededRand(ms, 42, 95);
      const c     = score > 75 ? '#2e7d32' : score > 55 ? '#f9a825' : '#e53935';
      return `
      <div class="month-pred-card">
        <div class="month-name">${m} ${year}</div>
        <div class="month-theme">${DATA.predictionTexts.yearly.monthTexts[i].split('.')[0]}</div>
        <div style="height:5px;border-radius:3px;background:#f0f0f0;margin:5px 0 7px"><div style="height:100%;width:${score}%;border-radius:3px;background:${c}"></div></div>
        <div class="month-text" style="font-size:0.75rem">${DATA.predictionTexts.yearly.monthTexts[i]}</div>
      </div>`;
    }).join('');

    return `
    <div class="panel-header"><h2>☀️ Yearly Forecast ${year}</h2><p>${theme}</p></div>
    <div class="card">
      <div class="card-header"><h3>🌟 Year Overview</h3></div>
      <div class="card-body">
        <p style="font-size:0.9rem;line-height:1.7;color:#444"><strong style="color:#ff6b35">${year}</strong> unfolds as a <em>${theme}</em> for ${K.name}. ${['Jupiter\'s transit brings expansion and opportunities for those prepared.','Saturn demands patience and discipline, rewarding genuine effort with lasting results.','Rahu drives ambition and unconventional paths — embrace bold change.'][Engine.seededRand(ds,0,2)]} Your Maha Dasha lord ${K.dashaTimeline.find(d => {const cy = now.getFullYear() + now.getMonth()/12; return cy >= d.start && cy < d.end;})?.planet || 'Saturn'} strongly colors the year's main theme.</p>
      </div>
    </div>
    ${quarterHTML}
    <div class="card">
      <div class="card-header"><h3>📅 Month-by-Month Guide</h3></div>
      <div class="card-body"><div class="month-grid">${monthCards}</div></div>
    </div>`;
  }

  // ════════════════════════════════════
  // LIFE PREDICTIONS
  // ════════════════════════════════════
  function life(K) {
    const now = new Date();
    const currentAge = now.getFullYear() - K.birthYear;

    function isCurrentPhase(yearsStr) {
      const [min, maxS] = yearsStr.split('–');
      const max = maxS === '+' ? 120 : parseInt(maxS);
      return currentAge >= parseInt(min) && currentAge <= max;
    }

    const phasesHTML = DATA.lifePhases.map((phase, i) => {
      const isCurr = isCurrentPhase(phase.years);
      const texts  = DATA.predictionTexts.life.phases[i] || [];
      return `
      <div class="life-phase ${isCurr ? 'current' : ''}">
        <div class="life-dot">${phase.icon}</div>
        <div class="life-phase-card">
          <div class="life-phase-title">
            ${phase.title}
            ${isCurr ? '<span class="current-tag">YOUR PHASE</span>' : ''}
          </div>
          <div class="life-phase-years">Ages ${phase.years} • Theme: ${phase.theme}</div>
          <div class="life-phase-text">
            ${texts.map(t => `<p style="margin-bottom:6px">${t}</p>`).join('')}
          </div>
        </div>
      </div>`;
    }).join('');

    const eventsHTML = `
    <div class="card">
      <div class="card-header"><h3>🎯 Key Life Events (Predicted)</h3><span class="card-badge">Based on Dasha & House Lords</span></div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="planet-table">
          <thead><tr><th>Age</th><th>Year</th><th>Event</th><th>Description</th></tr></thead>
          <tbody>${K.lifeEvents.map(e => `<tr>
            <td><strong style="color:#ff6b35">~${e.age}</strong></td>
            <td>${e.year}</td>
            <td><strong>${e.ev}</strong></td>
            <td style="font-size:0.8rem;color:#666">${e.desc}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;

    return `
    <div class="panel-header"><h2>🌿 Life Path & Predictions</h2><p>Five phases of karmic unfoldment based on your birth chart</p></div>
    <div class="card"><div class="card-header"><h3>🌱 Life Phases</h3></div><div class="card-body"><div class="life-timeline">${phasesHTML}</div></div></div>
    ${eventsHTML}`;
  }

  // ════════════════════════════════════
  // YOGAS & DOSHAS
  // ════════════════════════════════════
  function yoga(K) {
    const yogaHTML = `
    <div class="yoga-grid">
      ${DATA.yogas.map((y, i) => {
        const present = K.yogasPresent[i];
        return `<div class="yoga-card ${present ? 'present' : 'absent'}">
          <div class="yoga-name">${y.name}</div>
          <span class="yoga-badge ${present ? 'yb-present' : 'yb-absent'}">${present ? '✓ Present in Your Chart' : '— Not Found'}</span>
          <div class="yoga-desc">${y.desc}</div>
          ${present ? `<div class="yoga-remedy"><strong>Remedy:</strong> ${y.remedy}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;

    const doshaHTML = `
    <div class="yoga-grid">
      ${DATA.doshas.map((d, i) => {
        const present = K.doshsPresent[i];
        return `<div class="yoga-card ${present ? 'dosha' : 'absent'}">
          <div class="yoga-name" style="${present ? 'color:#c03030' : ''}">${d.name}</div>
          <span class="yoga-badge ${present ? 'yb-dosha' : 'yb-absent'}">${present ? '⚠ Present' : '— Not Present'}</span>
          <div class="yoga-desc">${d.desc}</div>
          ${present ? `<div class="yoga-remedy" style="border-top-color:#fde8e8;color:#c03030"><strong>Remedy:</strong> ${d.remedy}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;

    return `
    <div class="panel-header"><h2>✦ Yogas & Doshas</h2><p>Special planetary combinations and karmic challenges</p></div>
    ${sectionTitle('✦ Auspicious Yogas', `${K.yogasPresent.filter(Boolean).length} found in your chart`)}
    ${yogaHTML}
    ${sectionTitle('⚠ Doshas (Karmic Challenges)', `${K.doshsPresent.filter(Boolean).length} found`)}
    ${doshaHTML}`;
  }

  // ════════════════════════════════════
  // PANCHANG
  // ════════════════════════════════════
  function panchang(K) {
    const now = new Date();
    const weekday = DATA.weekdays[now.getDay()];

    const items = [
      ['Tithi (Lunar Day)',   K.panchang.tithi,       'The tithi determines auspicious timings for daily activities'],
      ['Nakshatra',           K.panchang.nakshatra,   'The star in which the Moon is transiting today'],
      ['Yoga',                K.panchang.yoga,        'The yoga of the day — auspicious or otherwise'],
      ['Karana',              K.panchang.karana,      'Half-tithi, changes every ~6 hours'],
      ['Vara (Weekday)',      weekday,                 'The day of the week and its ruling planet'],
      ['Moon Phase',          K.panchang.moonPhase,   'Current phase of the Moon'],
      ['Lucky Number',        K.panchang.luckyNum,    'Your lucky number today based on your chart'],
      ['Lucky Color',         K.panchang.luckyColor,  'Wear or use this color today for benefit'],
      ['Lucky Gemstone',      K.panchang.luckyGem,    'Your supportive gemstone for today'],
      ['Lucky Direction',     K.panchang.luckyDir,    'Face this direction for important tasks'],
      ['Favorable Hours',     K.panchang.favorHr,     'Best window for new initiatives and decisions'],
      ['Caution Hours',       K.panchang.cautionHr,   'Avoid major decisions or important activities'],
    ];

    return `
    <div class="panel-header"><h2>📿 Today's Panchang</h2><p>${weekday}, ${DATA.months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}</p></div>
    <div class="card">
      <div class="card-body">
        <div class="panchang-grid">
          ${items.map(([l, v, s]) => `
          <div class="panch-item">
            <div class="panch-label">${l}</div>
            <div class="panch-value">${v}</div>
            <div class="panch-sub">${s}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="info-note">
      <strong>Today's Ruling Planet:</strong> ${['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'][now.getDay()]} — ${['Perform Surya puja; offer water to the Sun at sunrise.','Offer milk to Lord Shiva; wear white; seek mother\'s blessings.','Visit Hanuman temple; fast or eat sattvic food; be courageous.','Recite Vishnu Sahasranama; offer tulsi; engage in trade or study.','Donate yellow items; worship Vishnu or your guru with devotion.','Offer flowers to Lakshmi; practice art; keep your space beautiful.','Feed the poor; visit a Shiva temple; practice discipline and service.'][now.getDay()]}
    </div>`;
  }

  // ════════════════════════════════════
  // COMPATIBILITY
  // ════════════════════════════════════
  function compatibility(K) {
    const moonSignName = K.moonSign;
    const compatible   = K.compatible;
    const allRashis    = DATA.rashis.map(r => r.name);

    const tableRows = allRashis.map(rname => {
      const isComp = compatible.includes(rname);
      const score  = isComp ? Engine.seededRand(Engine.hash(K.S + rname), 70, 96) : Engine.seededRand(Engine.hash(K.S + rname), 30, 65);
      const c = score > 70 ? '#2e7d32' : score > 50 ? '#f9a825' : '#e53935';
      return `<tr>
        <td>${rname}</td>
        <td>${DATA.rashis.find(r=>r.name===rname)?.hi || ''}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="compat-score-bar" style="width:${score}%;background:${c}"></div>
            <span style="font-size:0.8rem;font-weight:700;color:${c}">${score}%</span>
          </div>
        </td>
        <td><span class="nature-tag ${isComp?'nature-benefic':'nature-malefic'}">${isComp?'✓ Compatible':'Challenging'}</span></td>
      </tr>`;
    }).join('');

    return `
    <div class="panel-header"><h2>💑 Compatibility</h2><p>Moon sign (Rashi) compatibility with all 12 signs</p></div>
    <div class="info-note">Your Moon sign is <strong>${moonSignName}</strong>. Most compatible with: <strong>${compatible.join(', ')}</strong></div>
    <div class="card">
      <div class="card-header"><h3>📊 Rashi Compatibility Chart</h3></div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="compat-table">
          <thead><tr><th>Rashi</th><th>Hindi</th><th>Compatibility Score</th><th>Status</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;
  }

  // ════════════════════════════════════
  // REMEDIES
  // ════════════════════════════════════
  function remedies(K) {
    const planetNames = Object.keys(DATA.remedies);
    const tabs = planetNames.map((p, i) => `<button class="rtab${i===0?' active':''}" onclick="Panels.switchRemedyTab(this,'rem-${p}')">${p}</button>`).join('');
    const panels = planetNames.map((p, i) => {
      const pl = DATA.planets.find(x => x.name === p);
      return `
      <div class="remedy-panel${i===0?' active':''}" id="rem-${p}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:${pl.bg};border:2px solid ${pl.color};display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:${pl.color}">${pl.sym}</div>
          <div>
            <div style="font-weight:700">${p} (${pl.hi})</div>
            <div style="font-size:0.75rem;color:#999">Best day: ${pl.day} • Gem: ${pl.gem}</div>
          </div>
        </div>
        <ul class="remedy-list">${DATA.remedies[p].map(r => `<li>${r}</li>`).join('')}</ul>
      </div>`;
    }).join('');

    return `
    <div class="panel-header"><h2>🕉 Vedic Remedies</h2><p>Traditional Jyotish upayas to harmonize planetary energies</p></div>
    <div class="card">
      <div class="card-header"><h3>🌿 Select Planet for Remedies</h3></div>
      <div class="card-body">
        <div class="remedy-tabs">${tabs}</div>
        ${panels}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📿 Universal Daily Practices</h3></div>
      <div class="card-body">
        <ul class="remedy-list">
          ${['Rise before sunrise (Brahma Muhurta ~4:30 AM) for meditation and mantra practice — the mind is clearest and the energy purest at this time','Offer water to the rising Sun while chanting Gayatri Mantra 12 times — aligns you with solar life force','Feed birds, especially crows (Saturn) and parrots (Mercury), grain every morning near your home','Light a ghee lamp in front of your deity or altar every morning and evening without fail','Practice Surya Namaskar — 12 rounds representing the 12 zodiac houses — for planetary balance','Chant your lagna lord\'s mantra or Gayatri Mantra 108 times daily using a rudraksha mala','Donate to the poor on Saturdays — this propitiates Saturn and systematically clears karmic debts','Maintain an attitude of gratitude and non-attachment — this is the highest remedy in all of Vedic astrology','Avoid eating after sunset when possible — this preserves prana and supports spiritual sensitivity','Keep your home clean, fragrant, and aesthetically beautiful — this invites Lakshmi and planetary blessings'].map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  function switchRemedyTab(btn, panelId) {
    btn.closest('.card-body').querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
    btn.closest('.card-body').querySelectorAll('.remedy-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(panelId)?.classList.add('active');
  }

  // ════════════════════════════════════
  // MANTRAS
  // ════════════════════════════════════
  function mantras(K) {
    const lagnaLordId  = DATA.rashis[K.lagna].lord;
    const primaryName  = DATA.planets[lagnaLordId].name;

    const cards = DATA.mantras.map(m => {
      const isPrimary = m.planet === primaryName;
      return `
      <div class="mantra-card" style="${isPrimary?'border-color:#ff6b35;border-width:2px;background:#fffaf7':''}">
        ${isPrimary ? '<div style="font-size:0.72rem;font-weight:700;color:#ff6b35;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">★ YOUR PRIMARY MANTRA (Lagna Lord)</div>' : ''}
        <div class="mantra-planet">${m.planet} Mantra</div>
        <div class="mantra-text">${m.text}</div>
        <div class="mantra-roman">${m.roman}</div>
        <div class="mantra-meaning">${m.meaning}</div>
        <div class="mantra-meta">
          <div class="m-meta-item"><span class="m-meta-key">Count: </span><span class="m-meta-val">${m.count.toLocaleString()} total</span></div>
          <div class="m-meta-item"><span class="m-meta-key">Day: </span><span class="m-meta-val">${m.day}</span></div>
          <div class="m-meta-item"><span class="m-meta-key">Color: </span><span class="m-meta-val">${m.color}</span></div>
          <div class="m-meta-item"><span class="m-meta-key">Metal: </span><span class="m-meta-val">${m.metal}</span></div>
        </div>
      </div>`;
    }).join('');

    return `
    <div class="panel-header"><h2>🎵 Planetary Mantras</h2><p>Sacred Beej (seed) mantras for all 9 Grahas</p></div>
    <div class="info-note">Your Lagna lord is <strong>${primaryName}</strong>. The ${primaryName} mantra is your primary mantra for spiritual protection and empowerment.</div>
    <div class="card">
      <div class="card-header"><h3>📖 How to Chant Mantras</h3></div>
      <div class="card-body">
        <p style="font-size:0.84rem;line-height:1.7;color:#555">Sit facing East (for Sun, Mercury mantras) or North (for Moon, Jupiter mantras) in the early morning after bathing. Use a Rudraksha or crystal mala of 108 beads. Begin by chanting <strong style="font-family:'Noto Serif Devanagari',serif">ॐ गं गणपतये नमः</strong> (Om Gam Ganapataye Namah) 11 times to invoke Lord Ganesha before any planetary mantra. The prescribed total count should be completed over 40 days (one mandala). Most powerful during the planet's hora (planetary hour) on its ruling day. Maintain celibacy, sattvic diet, and mental purity during the 40-day practice.</p>
      </div>
    </div>
    ${cards}`;
  }

  // ══ Public API ──
  return {
    overview, kundliChart, planetTable, houseAnalysis,
    dasha, daily, weekly, monthly, yearly, life,
    yoga, panchang, compatibility, remedies, mantras,
    animateBars, switchRemedyTab,
  };

})();
