// ---- POLICY DEFINITIONS ----
const POLICY_DEFS = [
  { id:'tax',        label:'💰 Tax Rate',            min:0,  max:20, default:8,  cost:0.8, unit:'pts', desc:'Higher = more revenue but slower growth & emigration risk' },
  { id:'healthcare', label:'🏥 Healthcare',          min:0,  max:20, default:10, cost:1.2, unit:'pts', desc:'Funds public health. Low = pandemics hit harder' },
  { id:'education',  label:'🎓 Education',           min:0,  max:20, default:10, cost:1.0, unit:'pts', desc:'Long-term GDP multiplier. Payoff after 20 years' },
  { id:'military',   label:'⚔️ Military',            min:0,  max:20, default:5,  cost:1.5, unit:'pts', desc:'Deters wars. High = expensive drain. Zero = vulnerable' },
  { id:'welfare',    label:'🤝 Welfare',             min:0,  max:20, default:8,  cost:1.1, unit:'pts', desc:'Keeps happiness up. Low = inequality, instability' },
  { id:'environment',label:'🌿 Environment',         min:0,  max:20, default:8,  cost:0.9, unit:'pts', desc:'Low = disaster risk rises every decade' },
  { id:'egov',       label:'💻 e-Governance',        min:0,  max:20, default:5,  cost:0.7, unit:'pts', desc:'Reduces corruption, attracts FDI, speeds everything' },
  { id:'openness',   label:'🌍 Immigration/Trade',   min:0,  max:20, default:8,  cost:0.6, unit:'pts', desc:'High = faster growth + cultural tension risk' },
];

const PRESETS = {
  nordic:      { tax:18, healthcare:18, education:16, military:4,  welfare:16, environment:14, egov:10, openness:10 },
  singapore:   { tax:8,  healthcare:12, education:16, military:10, welfare:8,  environment:10, egov:18, openness:16 },
  libertarian: { tax:4,  healthcare:4,  education:6,  military:8,  welfare:2,  environment:4,  egov:12, openness:18 },
  military:    { tax:14, healthcare:8,  education:8,  military:20, welfare:6,  environment:4,  egov:6,  openness:4  },
};

// ---- CRISIS POOL ----
const CRISES = [
  {
    id:'war', icon:'⚔️', title:'War Declared',
    trigger: (s,p,g) => p.military < 5 && (g === 'border' || g === 'coastal') && Math.random() < 0.15,
    desc: 'A neighboring power invades. Your military is too weak to resist fully.',
    effects: { gdp:-20, pop:-8, happy:-15, stability:-25, debt:20 },
  },
  {
    id:'pandemic', icon:'🦠', title:'Pandemic Outbreak',
    trigger: (s,p) => p.healthcare < 6 && Math.random() < 0.12,
    desc: 'A deadly disease spreads. Underfunded healthcare cannot contain it.',
    effects: { gdp:-12, pop:-5, happy:-20, stability:-15, debt:10 },
  },
  {
    id:'climate', icon:'🌊', title:'Climate Disaster',
    trigger: (s,p,g) => p.environment < 5 && (g === 'island' || g === 'coastal') && Math.random() < 0.13,
    desc: 'Floods and storms devastate infrastructure. Environmental neglect made this inevitable.',
    effects: { gdp:-15, pop:-3, happy:-12, stability:-10, debt:15 },
  },
  {
    id:'debt', icon:'💱', title:'Debt Crisis',
    trigger: (s) => s.debt > 120 && Math.random() < 0.25,
    desc: 'International creditors demand repayment. Austerity measures forced on citizens.',
    effects: { gdp:-18, pop:-1, happy:-25, stability:-20, debt:-30 },
  },
  {
    id:'coup', icon:'🏴', title:'Political Coup',
    trigger: (s) => s.stability < 25 && s.happy < 35 && Math.random() < 0.20,
    desc: 'Discontent boils over. The government is overthrown. Years of instability follow.',
    effects: { gdp:-10, pop:-2, happy:-20, stability:-30, debt:5 },
  },
  {
    id:'braindrain', icon:'🚪', title:'Mass Brain Drain',
    trigger: (s,p) => p.tax > 15 && p.welfare < 6 && Math.random() < 0.18,
    desc: 'Educated citizens emigrate en masse. High taxes with poor services push talent abroad.',
    effects: { gdp:-8, pop:-6, happy:-10, stability:-8, debt:0 },
  },
  {
    id:'recession', icon:'📉', title:'Global Recession',
    trigger: (s,p) => p.openness > 14 && Math.random() < 0.10,
    desc: 'Your open economy absorbs the full shock of a global downturn.',
    effects: { gdp:-14, pop:-1, happy:-12, stability:-10, debt:12 },
  },
  {
    id:'cyber', icon:'🕵️', title:'Cyber Attack',
    trigger: (s,p) => p.egov > 14 && p.military < 8 && Math.random() < 0.12,
    desc: 'State infrastructure hacked. Digital systems go offline. Economy disrupted.',
    effects: { gdp:-7, pop:0, happy:-8, stability:-12, debt:5 },
  },
  {
    id:'famine', icon:'🌾', title:'Famine',
    trigger: (s,p) => p.environment < 4 && p.welfare < 4 && Math.random() < 0.10,
    desc: 'Environmental collapse and poor welfare combine. Food shortages cause mass suffering.',
    effects: { gdp:-10, pop:-8, happy:-30, stability:-20, debt:8 },
  },
  {
    id:'tension', icon:'😡', title:'Cultural Tensions',
    trigger: (s,p) => p.openness > 16 && p.welfare < 8 && s.year > 20 && Math.random() < 0.14,
    desc: 'Rapid immigration without social investment sparks unrest. Integration failed.',
    effects: { gdp:-5, pop:-2, happy:-15, stability:-18, debt:3 },
  },
];

// ---- GOOD EVENTS ----
const GOOD_EVENTS = [
  { icon:'🌐', text:'Tech hub status achieved — foreign investment surges', condition: p => p.egov > 12 && p.tax < 10,      gdp:10, happy:5,  stab:5  },
  { icon:'🎓', text:'Education dividends pay off — productivity boom',      condition: p => p.education > 14,               gdp:8,  happy:6,  stab:4  },
  { icon:'🏥', text:'Life expectancy hits 85 — global healthcare model',    condition: p => p.healthcare > 14,              gdp:4,  happy:10, stab:6  },
  { icon:'🌿', text:'Green energy exports begin — new revenue stream',      condition: p => p.environment > 12,             gdp:7,  happy:5,  stab:3  },
  { icon:'🤝', text:'Welfare state praised — zero poverty declared',        condition: p => p.welfare > 14,                 gdp:3,  happy:12, stab:8  },
  { icon:'🚀', text:'Startup ecosystem explodes — first unicorn born',      condition: p => p.egov > 10 && p.tax < 12,      gdp:12, happy:7,  stab:4  },
  { icon:'🏆', text:'World Happiness Report: top 5 globally',               condition: p => p.welfare > 12 && p.healthcare > 12, gdp:5, happy:15, stab:8 },
  { icon:'🛡️', text:'Military deterrence works — peace treaty signed',      condition: p => p.military > 12,               gdp:6,  happy:8,  stab:12 },
  { icon:'🌍', text:'Immigration wave brings skilled workers',               condition: p => p.openness > 12,               gdp:8,  happy:4,  stab:3  },
  { icon:'💻', text:'e-Government wins global award — FDI triples',         condition: p => p.egov > 15,                   gdp:14, happy:6,  stab:5  },
];

const ERAS = [
  { min:1,   max:30,  name:'🌱 Foundation Era',   color:'text-emerald-300' },
  { min:31,  max:70,  name:'📈 Growth Era',        color:'text-blue-300'   },
  { min:71,  max:110, name:'⚡ Trial Era',          color:'text-yellow-300' },
  { min:111, max:150, name:'🏛️ Maturity Era',      color:'text-violet-300' },
  { min:151, max:200, name:'🌟 Legacy Era',         color:'text-amber-300'  },
];

// ---- STATE ----
let p = {};
let s = {};
let geo = 'island';
let ticker = null;
let charts = {};
let cd = { years:[], gdp:[], happy:[], stab:[] };

// ---- BUILD SLIDERS ----
function buildSliders() {
  const container = document.getElementById('sliders');
  container.innerHTML = '';
  POLICY_DEFS.forEach(def => {
    p[def.id] = def.default;
    container.innerHTML += `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-semibold">${def.label}</span>
          <span id="v_${def.id}" class="text-sm font-mono text-violet-300 w-8 text-right">${def.default}</span>
        </div>
        <input type="range" id="sl_${def.id}" min="${def.min}" max="${def.max}" value="${def.default}" step="1"
          class="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-500 bg-white/10"
          oninput="onSlider('${def.id}', this.value)">
        <div class="text-xs text-slate-500 mt-1">${def.desc}</div>
      </div>`;
  });
  updateBudget();
}

function onSlider(id, val) {
  p[id] = parseInt(val);
  document.getElementById('v_' + id).textContent = val;
  updateBudget();
}

function updateBudget() {
  const spent = POLICY_DEFS.reduce((sum, def) => sum + p[def.id] * def.cost, 0);
  const max   = POLICY_DEFS.reduce((sum, def) => sum + def.max * def.cost, 0);
  const budget = Math.round(100 - (spent / max) * 100);
  const pct    = Math.max(0, budget);
  document.getElementById('budgetDisplay').textContent = budget;
  document.getElementById('budgetDisplay').className   = `text-2xl font-black ${budget < 0 ? 'text-red-400' : budget < 20 ? 'text-yellow-300' : 'text-emerald-300'}`;
  document.getElementById('budgetBar').style.width     = Math.max(0, pct) + '%';
  document.getElementById('budgetBar').className       = `h-full rounded-full transition-all duration-300 ${budget < 0 ? 'bg-gradient-to-r from-red-600 to-rose-600' : budget < 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`;
}

function calcInitialDebt() {
  const spent = POLICY_DEFS.reduce((sum, def) => sum + p[def.id] * def.cost, 0);
  const max   = POLICY_DEFS.reduce((sum, def) => sum + def.max * def.cost, 0);
  const overspend = Math.max(0, (spent / max * 100) - 100);
  return 20 + overspend * 0.8;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  Object.entries(preset).forEach(([id, val]) => {
    p[id] = val;
    const sl = document.getElementById('sl_' + id);
    const vl = document.getElementById('v_' + id);
    if (sl) sl.value = val;
    if (vl) vl.textContent = val;
  });
  updateBudget();
}

// ---- UTILS ----
function fmt(n) {
  if (n >= 1e6)  return (n/1e6).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(0) + 'k';
  return Math.round(n);
}

function fmtMoney(n) {
  if (n >= 1000) return '€' + (n/1000).toFixed(0) + 'k';
  return '€' + Math.round(n);
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function getEra() {
  return ERAS.find(e => s.year >= e.min && s.year <= e.max) || ERAS[4];
}

function calcGrade() {
  const score = (s.gdp/1000)*0.25 + s.happy*0.35 + s.stability*0.25 + (100-s.debt)*0.15;
  if (score > 85) return { g:'S', c:'text-emerald-300', label:'Utopia — a model for all humanity' };
  if (score > 70) return { g:'A', c:'text-lime-300',    label:'Exceptional — among the world\'s best' };
  if (score > 55) return { g:'B', c:'text-yellow-300',  label:'Solid — above average governance' };
  if (score > 40) return { g:'C', c:'text-orange-300',  label:'Struggling — reforms needed urgently' };
  return                  { g:'F', c:'text-red-400',     label:'Failed state — collapse imminent' };
}

// ---- SIMULATE ----
function simulateYear() {
  if (s.collapsed) return;

  if (s.year > 200) {
    clearInterval(ticker);
    showFinal();
    return;
  }

  // ---- GDP ----
  let gdpGrowth = 1.5;
  gdpGrowth += (p.egov     - 10) * 0.08;
  gdpGrowth += (10 - p.tax)      * 0.06;
  gdpGrowth += (p.openness - 10) * 0.05;
  gdpGrowth += s.year > 20 ? (p.education - 10) * 0.06 : 0;
  gdpGrowth -= s.debt > 80  ? 1.2 : 0;
  gdpGrowth -= s.debt > 120 ? 2.0 : 0;
  gdpGrowth += (Math.random() - 0.45) * 1.5;
  gdpGrowth  = clamp(gdpGrowth, -8, 14);
  s.gdp      = Math.round(s.gdp * (1 + gdpGrowth / 100));

  // ---- POPULATION ----
  let popGrowth = 0.4;
  popGrowth += (p.openness   - 10) * 0.04;
  popGrowth += (p.healthcare - 10) * 0.03;
  popGrowth += (p.welfare    - 10) * 0.02;
  popGrowth -= s.happy < 30 ? 0.8 : 0;
  popGrowth  = clamp(popGrowth, -3, 6);
  s.pop      = Math.round(s.pop * (1 + popGrowth / 100));

  // ---- HAPPINESS ----
  let happyD = 0;
  happyD += (p.healthcare - 10) * 0.12;
  happyD += (p.welfare    - 10) * 0.10;
  happyD += (p.environment- 10) * 0.06;
  happyD -= (p.tax        - 10) * 0.04;
  happyD -= s.debt > 100 ? 3 : 0;
  happyD += (Math.random() - 0.5) * 2;
  s.happy  = clamp(s.happy + happyD * 0.15, 0, 100);

  // ---- STABILITY ----
  let stabD = 0;
  stabD += (p.welfare    - 10) * 0.08;
  stabD += (p.military   - 10) * 0.06;
  stabD -= s.happy < 25 ? 5 : 0;
  stabD -= s.debt > 100 ? 3 : 0;
  stabD += (Math.random() - 0.5) * 1.5;
  s.stability = clamp(s.stability + stabD * 0.1, 0, 100);

  // ---- DEBT ----
  const revenue = p.tax * 4.5 + p.openness * 1.5;
  const spending = p.healthcare * 2.5 + p.education * 2 + p.military * 3
                 + p.welfare * 2.5 + p.environment * 1.5 + p.egov * 1.2;
  const balance  = revenue - spending;
  s.debt = clamp(s.debt - balance * 0.04 + (Math.random() - 0.5) * 0.5, 0, 200);

  // ---- ENVIRONMENT ----
  s.envHealth = clamp((s.envHealth || 50) + (p.environment - 10) * 0.2, 0, 100);

  // ---- CRISES (every 8 years check) ----
  if (s.year % 8 === 0) {
    const crisis = CRISES.find(c => !s.crisesHit.has(c.id) && c.trigger(s, p, geo));
    if (crisis) triggerCrisis(crisis);
  }

  // ---- GOOD EVENTS (every 10 years) ----
  if (s.year % 10 === 0) {
    const ev = GOOD_EVENTS.find(e => e.condition(p));
    if (ev) logEvent(ev.icon, ev.text, 'good');
    if (ev) {
      s.gdp       = Math.round(s.gdp * (1 + ev.gdp / 100));
      s.happy     = clamp(s.happy + ev.happy, 0, 100);
      s.stability = clamp(s.stability + ev.stab, 0, 100);
    }
  }

  // ---- ERA CHANGE ----
  const era = getEra();
  if (era.name !== s.lastEra) {
    s.lastEra = era.name;
    logEvent('🕰️', `Entering the ${era.name}`, 'era');
  }

  // ---- COLLAPSE CHECK ----
  if (s.stability < 5 || s.pop < 1000) {
    collapse(s.stability < 5 ? 'Political instability destroyed the nation.' : 'Population collapsed — the nation was abandoned.');
    return;
  }

  // ---- UPDATE CHART DATA ----
  cd.years.push(s.year);
  cd.gdp.push(s.gdp);
  cd.happy.push(Math.round(s.happy));
  cd.stab.push(Math.round(s.stability));
  updateCharts();
  updateDisplay();

  s.year++;
}

function triggerCrisis(crisis) {
  s.crisesHit.add(crisis.id);
  const fx = crisis.effects;
  s.gdp       = Math.round(s.gdp * (1 + fx.gdp / 100));
  s.pop       = Math.round(s.pop * (1 + fx.pop / 100));
  s.happy     = clamp(s.happy     + fx.happy,   0, 100);
  s.stability = clamp(s.stability + fx.stability, 0, 100);
  s.debt      = clamp(s.debt      + fx.debt,     0, 200);

  const banner = document.getElementById('crisisBanner');
  document.getElementById('crisisIcon').textContent   = crisis.icon;
  document.getElementById('crisisTitle').textContent  = crisis.title;
  document.getElementById('crisisDesc').textContent   = crisis.desc;
  document.getElementById('crisisEffect').textContent =
    `GDP ${fx.gdp}% | Happiness ${fx.happy} | Stability ${fx.stability} | Debt +${fx.debt}%`;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 6000);

  logEvent(crisis.icon, `CRISIS: ${crisis.title} — ${crisis.desc}`, 'crisis');
}

function collapse(reason) {
  clearInterval(ticker);
  s.collapsed = true;
  document.getElementById('collapseCard').classList.remove('hidden');
  document.getElementById('collapseReason').textContent = reason +
    ` Nation survived ${s.year - 1} years. Final GDP: ${fmtMoney(s.gdp)} | Happiness: ${Math.round(s.happy)}/100`;
  document.getElementById('collapseCard').scrollIntoView({ behavior: 'smooth' });
}

// ---- LOG ----
function logEvent(icon, text, type) {
  const log   = document.getElementById('chronicle');
  const colors = { good:'bg-emerald-900/20 border-emerald-500/20', crisis:'bg-red-900/20 border-red-500/30', era:'bg-violet-900/20 border-violet-500/20', neutral:'bg-white/5 border-white/10' };
  const c = colors[type] || colors.neutral;
  const entry = document.createElement('div');
  entry.className = `flex gap-3 p-3 border ${c} rounded-xl text-sm`;
  entry.innerHTML = `<span class="text-lg shrink-0">${icon}</span><div><span class="text-xs font-mono text-slate-400">Year ${s.year} — </span><span class="text-slate-200">${text}</span></div>`;
  log.insertBefore(entry, log.firstChild);
}

// ---- DISPLAY ----
function updateDisplay() {
  const era = getEra();
  document.getElementById('simYear').textContent    = 'Year ' + s.year;
  document.getElementById('simYearNum').textContent = `${s.year} of 200`;
  document.getElementById('eraLabel').textContent   = era.name;
  document.getElementById('eraLabel').className     = `text-xs font-semibold mt-1 uppercase tracking-wider ${era.color}`;
  document.getElementById('simProgress').style.width = (s.year / 200 * 100) + '%';
  document.getElementById('sGDP').textContent    = fmtMoney(s.gdp);
  document.getElementById('sPop').textContent    = fmt(s.pop);
  document.getElementById('sHappy').textContent  = Math.round(s.happy) + '/100';
  document.getElementById('sStab').textContent   = Math.round(s.stability) + '/100';
  document.getElementById('sDebt').textContent   = Math.round(s.debt) + '%';
  document.getElementById('sMil').textContent    = p.military + '/20';
  document.getElementById('sEnv').textContent    = Math.round(s.envHealth || 50) + '/100';
}

// ---- CHARTS ----
function initCharts() {
  [
    { id:'chartGDP',   label:'💰 GDP per capita',        color:'#34d399' },
    { id:'chartHappy', label:'😊 Happiness (0–100)',      color:'#fbbf24' },
    { id:'chartStab',  label:'🏛️ Political Stability',   color:'#a78bfa' },
  ].forEach(({ id, label, color }) => {
    const ctx = document.getElementById(id);
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
      type: 'line',
      data: { labels:[], datasets:[{ data:[], borderColor:color, borderWidth:2, fill:true, backgroundColor:color+'12', tension:0.4, pointRadius:0 }] },
      options: {
        responsive:true, animation:false,
        plugins: { legend:{display:false}, title:{display:true,text:label,color:'#94a3b8',font:{size:11}} },
        scales: {
          x:{ ticks:{color:'#475569',font:{size:9}}, grid:{color:'#ffffff05'} },
          y:{ ticks:{color:'#475569',font:{size:9}}, grid:{color:'#ffffff08'} }
        }
      }
    });
  });
}

function updateCharts() {
  const lbls = cd.years.filter((_,i) => i % 2 === 0).map(y => 'Y'+y);
  [['chartGDP','gdp'],['chartHappy','happy'],['chartStab','stab']].forEach(([id, key]) => {
    charts[id].data.labels            = cd.years.map(y => 'Y'+y);
    charts[id].data.datasets[0].data  = cd[key];
    charts[id].update('none');
  });
}

// ---- FINAL ----
function showFinal() {
  document.getElementById('finalCard').classList.remove('hidden');
  document.getElementById('finalCard').scrollIntoView({ behavior: 'smooth' });
  const gr = calcGrade();
  document.getElementById('finalContent').innerHTML = `
    <div class="text-center py-4 space-y-1">
      <div class="text-7xl font-black ${gr.c}">${gr.g}</div>
      <div class="text-slate-300 font-semibold">${gr.label}</div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-emerald-300">${fmtMoney(s.gdp)}</div>
        <div class="text-xs text-slate-400 mt-1">Final GDP/capita</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-yellow-300">${Math.round(s.happy)}/100</div>
        <div class="text-xs text-slate-400 mt-1">Final happiness</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-blue-300">${fmt(s.pop)}</div>
        <div class="text-xs text-slate-400 mt-1">Final population</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-rose-300">${Math.round(s.debt)}%</div>
        <div class="text-xs text-slate-400 mt-1">Final debt/GDP</div>
      </div>
    </div>
    <div class="p-4 bg-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed">
      ${s.crisesHit.size} crises survived over 200 years. 
      Nation founded with ${Object.values(p).reduce((a,b)=>a+b,0)} total policy points.
    </div>
  `;
}

// ---- SHARE ----
function shareResult() {
  const gr = calcGrade();
  const text = `🏛️ NationForge — I built a nation and survived ${s.collapsed ? s.year-1 : 200} years!\n\n`
    + `Grade: ${gr.g} — ${gr.label}\n`
    + `💰 GDP: ${fmtMoney(s.gdp)} | 😊 Happiness: ${Math.round(s.happy)}/100\n`
    + `👥 Population: ${fmt(s.pop)} | 🏛️ Stability: ${Math.round(s.stability)}/100\n\n`
    + `Play it: ${location.href}`;
  navigator.clipboard.writeText(text)
    .then(() => alert('✅ Copied! Share your nation\'s legacy.'))
    .catch(() => prompt('Copy:', text));
}

// ---- START ----
function startSimulation() {
  geo = document.getElementById('geoType').value;
  const name    = document.getElementById('nationName').value.trim() || 'Valdoria';
  const startPop = parseInt(document.getElementById('startPop').value);

  s = {
    year: 1, gdp: 8000, pop: startPop,
    happy: 45, stability: 60, debt: calcInitialDebt(),
    envHealth: 50, collapsed: false,
    crisesHit: new Set(), lastEra: ''
  };
  cd = { years:[], gdp:[], happy:[], stab:[] };

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('simPanel').classList.remove('hidden');
  document.getElementById('simName').textContent = '🏛️ ' + name;
  document.getElementById('collapseCard').classList.add('hidden');
  document.getElementById('finalCard').classList.add('hidden');
  document.getElementById('crisisBanner').classList.add('hidden');
  document.getElementById('chronicle').innerHTML = '';

  logEvent('🌱', `${name} declares independence. A new nation is born.`, 'era');
  initCharts();
  updateDisplay();
  ticker = setInterval(simulateYear, 600);
}

function resetSim() {
  clearInterval(ticker);
  document.getElementById('simPanel').classList.add('hidden');
  document.getElementById('setupPanel').classList.remove('hidden');
}

// ---- INIT ----
buildSliders();
