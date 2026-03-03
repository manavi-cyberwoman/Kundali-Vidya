// ════════════════════════════════════════════════════
// CHART.JS — North Indian Kundali Chart Renderer
// ════════════════════════════════════════════════════

const Chart = (() => {

  // Draw North Indian Kundali on a canvas
  function draw(canvas, K, opts = {}) {
    const {
      size = canvas.width,
      bgColor = '#ffffff',
      borderColor = '#cc4400',
      lineColor = '#cc4400',
      textColor = '#2d2d2d',
      rashiColor = '#999999',
      planetColor = '#cc2200',
      lagnaColor = '#ff6b35',
      highlightHouse = null,
    } = opts;

    const ctx = canvas.getContext('2d');
    const S = size;
    const M = S * 0.04; // margin
    const G = (S - M * 2) / 4; // cell size

    ctx.clearRect(0, 0, S, S);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, S, S);

    // ── Draw 4x4 grid with diagonals ──
    const NORTH_MAP = DATA.northMap;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        // Skip center 2x2
        if ((r === 1 || r === 2) && (c === 1 || c === 2)) continue;

        const key  = `${r},${c}`;
        const hnum = NORTH_MAP[key];
        if (hnum === undefined) continue;

        const x = M + c * G;
        const y = M + r * G;

        // Cell background
        const isLagna = hnum === 1;
        const isHighlight = highlightHouse === hnum;

        ctx.fillStyle = isHighlight ? '#fff3ee' : isLagna ? '#fffaf7' : '#ffffff';
        ctx.fillRect(x, y, G, G);

        // Cell border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isLagna ? 2 : 1;
        ctx.strokeRect(x, y, G, G);

        // Draw corner diagonals for corner houses
        drawCellDiagonals(ctx, r, c, x, y, G, lineColor);

        // House number (small, top-left)
        ctx.fillStyle = rashiColor;
        ctx.font = `${S * 0.022}px Poppins, sans-serif`;
        ctx.fillText(hnum, x + G * 0.07, y + G * 0.2);

        // Rashi name
        const rashiIdx = (K.lagna + hnum - 1) % 12;
        const rashi    = DATA.rashis[rashiIdx];
        ctx.fillStyle  = '#bb6600';
        ctx.font       = `${S * 0.023}px 'Noto Serif Devanagari', serif`;
        const rashiLabel = rashi.hi;
        const labelW   = ctx.measureText(rashiLabel).width;
        ctx.fillText(rashiLabel, x + (G - labelW) / 2, y + G * 0.42);

        // Planets
        const planets = K.houseMap[hnum] || [];
        if (planets.length > 0) {
          ctx.font = `bold ${S * 0.028}px Poppins, sans-serif`;
          const lineH = S * 0.036;
          const startY = y + G * 0.58;
          planets.forEach((pname, pi) => {
            const pd = K.planetData[pname];
            const p  = DATA.planets.find(x => x.name === pname);
            ctx.fillStyle = pd && pd.exalt ? '#1a7a1a' : pd && pd.debit ? '#c03030' : p ? p.color : planetColor;
            // Abbreviation
            const abbr = pname === 'Jupiter' ? 'Ju' : pname === 'Saturn' ? 'Sa' :
                         pname === 'Mercury' ? 'Me' : pname === 'Venus' ? 'Ve' :
                         pname === 'Mars' ? 'Ma' : pname === 'Moon' ? 'Mo' :
                         pname === 'Sun' ? 'Su' : pname === 'Rahu' ? 'Ra' : 'Ke';
            const abbrW = ctx.measureText(abbr).width;
            ctx.fillText(abbr, x + (G - abbrW) / 2 + (pi % 2 === 0 ? -G * 0.12 : G * 0.12), startY + Math.floor(pi / 2) * lineH);
          });
        }

        // Lagna marker
        if (isLagna) {
          ctx.strokeStyle = lagnaColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(x + 3, y + 3, G - 6, G - 6);
          ctx.setLineDash([]);
        }
      }
    }

    // ── Center square (OM symbol) ──
    const cx = M + G;
    const cy = M + G;
    ctx.fillStyle = '#fffaf5';
    ctx.fillRect(cx, cy, G * 2, G * 2);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, G * 2, G * 2);

    // Draw diagonals crossing center
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + G * 2, cy + G * 2);
    ctx.moveTo(cx + G * 2, cy);
    ctx.lineTo(cx, cy + G * 2);
    ctx.stroke();

    // OM symbol
    ctx.fillStyle = '#ff6b35';
    ctx.font = `${S * 0.1}px 'Noto Serif Devanagari', serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', cx + G, cy + G * 1.2);
    ctx.textAlign = 'left';

    // Lagna rashi below OM
    ctx.fillStyle = '#bb5500';
    ctx.font = `${S * 0.03}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(DATA.rashis[K.lagna].name, cx + G, cy + G * 1.65);
    ctx.textAlign = 'left';
  }

  function drawCellDiagonals(ctx, r, c, x, y, G, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    // Corners get diagonal lines to form diamond shapes
    if (r === 0 && c === 0) { // top-left
      ctx.beginPath(); ctx.moveTo(x + G, y); ctx.lineTo(x, y + G); ctx.stroke();
    } else if (r === 0 && c === 3) { // top-right
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + G, y + G); ctx.stroke();
    } else if (r === 3 && c === 0) { // bottom-left
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + G, y + G); ctx.stroke();
    } else if (r === 3 && c === 3) { // bottom-right
      ctx.beginPath(); ctx.moveTo(x + G, y); ctx.lineTo(x, y + G); ctx.stroke();
    } else if (r === 0) { // top edge (mid)
      ctx.beginPath(); ctx.moveTo(x, y + G); ctx.lineTo(x + G / 2, y); ctx.lineTo(x + G, y + G); ctx.stroke();
    } else if (r === 3) { // bottom edge (mid)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + G / 2, y + G); ctx.lineTo(x + G, y); ctx.stroke();
    } else if (c === 0) { // left edge (mid)
      ctx.beginPath(); ctx.moveTo(x + G, y); ctx.lineTo(x, y + G / 2); ctx.lineTo(x + G, y + G); ctx.stroke();
    } else if (c === 3) { // right edge (mid)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + G, y + G / 2); ctx.lineTo(x, y + G); ctx.stroke();
    }
  }

  // Draw mini chart for sidebar
  function drawMini(canvas, K) {
    draw(canvas, K, {
      size:        canvas.width,
      bgColor:     '#ffffff',
      borderColor: '#cc4400',
      lineColor:   '#cc4400',
    });
  }

  return { draw, drawMini };

})();
