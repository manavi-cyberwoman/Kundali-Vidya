// ════════════════════════════════════════════════════
// APP.JS — Main Application Controller
// ════════════════════════════════════════════════════

const App = (() => {

  let K = null; // Current kundali state

  // Panel map: id → renderer
  const PANELS = {
    overview:      () => Panels.overview(K),
    'kundli-chart':() => Panels.kundliChart(K),
    'planet-table':() => Panels.planetTable(K),
    houses:        () => Panels.houseAnalysis(K),
    dasha:         () => Panels.dasha(K),
    daily:         () => Panels.daily(K),
    weekly:        () => Panels.weekly(K),
    monthly:       () => Panels.monthly(K),
    yearly:        () => Panels.yearly(K),
    life:          () => Panels.life(K),
    yoga:          () => Panels.yoga(K),
    panchang:      () => Panels.panchang(K),
    compatibility: () => Panels.compatibility(K),
    remedies:      () => Panels.remedies(K),
    mantras:       () => Panels.mantras(K),
  };

  const LOADING_MESSAGES = [
    'Calculating planetary positions...',
    'Computing house cusps...',
    'Analyzing Yogas and Doshas...',
    'Building Vimshottari Dasha timeline...',
    'Preparing life predictions...',
    'Generating your complete Kundli...',
    'Almost ready...',
  ];

  // ── Form Tab Switching ──
  document.querySelectorAll('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ftab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = document.getElementById('tab-' + btn.dataset.tab);
      if (tab) tab.classList.add('active');
    });
  });

  // ── Generate ──
  function generate() {
    const name   = document.getElementById('f-name').value.trim() || 'Native';
    const dob    = document.getElementById('f-dob').value;
    const tob    = document.getElementById('f-tob').value || '12:00';
    const pob    = document.getElementById('f-pob').value.trim() || 'India';
    const gender = document.getElementById('f-gender').value;
    const lagna  = parseInt(document.getElementById('f-lagna').value);
    const focus  = document.getElementById('f-focus').value;

    if (!dob) { alert('Please enter your Date of Birth to generate your Kundli.'); return; }

    // Show loading
    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      document.getElementById('loadingMsg').textContent = LOADING_MESSAGES[msgIdx % LOADING_MESSAGES.length];
      msgIdx++;
    }, 500);

    // Compute
    setTimeout(() => {
      K = Engine.compute({ name, dob, tob, pob, gender, lagnaSel: lagna, focus });

      clearInterval(msgInterval);
      loading.classList.remove('active');

      renderResults();
    }, 3000);
  }

  // ── Render All ──
  function renderResults() {
    // Profile bar
    renderProfileBar();

    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Sidebar navigation
    document.getElementById('sidebarNav').querySelectorAll('.snav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchPanel(btn.dataset.panel, btn));
    });

    // Initial panel
    switchPanel('overview', document.querySelector('.snav-btn[data-panel="overview"]'));

    // Mini chart
    const miniCanvas = document.getElementById('miniChartCanvas');
    if (miniCanvas) Chart.drawMini(miniCanvas, K);

    // Widgets
    Widgets.render(K);
  }

  function renderProfileBar() {
    const lagna    = DATA.rashis[K.lagna];
    const moon     = DATA.rashis[K.planetData['Moon'].rashi];
    const now      = new Date();
    const curYear  = now.getFullYear() + now.getMonth() / 12;
    const curDasha = K.dashaTimeline.find(d => curYear >= d.start && curYear < d.end) || K.dashaTimeline[0];

    document.getElementById('profileAvatar').textContent = K.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent   = K.name;
    document.getElementById('profileMeta').textContent   = `${K.dob} • ${K.tob} • ${K.pob}`;
    document.getElementById('profileTags').innerHTML = [
      `Lagna: ${lagna.name}`,
      `Moon: ${moon.name}`,
      `Nakshatra: ${K.nakshatra.name}`,
      `Dasha: ${curDasha.planet}`,
    ].map(t => `<span class="profile-tag">${t}</span>`).join('');
  }

  // ── Panel Switching ──
  function switchPanel(panelId, btn) {
    // Update nav
    document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Render panel
    const mainContent = document.getElementById('mainContent');
    const renderer    = PANELS[panelId];
    if (!renderer) return;

    // Clear + inject
    mainContent.innerHTML = `<div class="panel active" id="panel-${panelId}">${renderer()}</div>`;

    // Post-render: draw main chart canvas if needed
    if (panelId === 'kundli-chart') {
      const canvas = document.getElementById('mainChartCanvas');
      if (canvas) Chart.draw(canvas, K, { size: Math.min(360, canvas.parentElement.offsetWidth - 40) });
    }

    // Animate score bars
    Panels.animateBars(mainContent);

    // Scroll panel into view
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Reset ──
  function reset() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
    K = null;
  }

  return { generate, reset, switchPanel };

})();
