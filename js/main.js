// ── TEAM DATA ──
const partners = [
  {initials:'HA',name:'Hani Abuali',role:'Partner & CEO',location:'Zürich',
   bio:`<p>Hani is the former Chief Executive Officer of Petiole Asset Management AG, an independent multi-family office. He brings over 30 years of experience in investment and finance.</p><p>He was previously Managing Director at Mount Kellett Capital and Portfolio Manager at Polygon Investments. At Morgan Stanley Asia he ran Proprietary Trading and co-headed Telecom Research, achieving a #1 ranking for five years (2000–2005) in Institutional Investor and Greenwich.</p><p>Hani started his career in finance in New York as an Oil & Gas research analyst with Donaldson, Lufkin & Jenrette.</p>`,
   edu:'Economics, The Wharton School, University of Pennsylvania'},
  {initials:'GC',name:'Gregor Conrad',role:'Partner & COO',location:'Zürich',
   bio:`<p>Gregor has a strong track record in the global financial industry with extensive exposure to Asia as an entrepreneur. He is one of the founding partners of an investment boutique in Switzerland and China providing international asset management solutions.</p><p>He started his career at Credit Suisse and subsequently joined Lombard Odier in Zurich as a private equity investment professional focusing on buyout and growth capital transactions across Europe.</p>`,
   edu:'MA in Economics, University of St. Gallen; China Europe International Business School (CEIBS)'},
  {initials:'MN',name:'Martin von Niederhäusern',role:'Partner',location:'Zürich',
   bio:`<p>Martin has a deep understanding of connecting entrepreneurs and companies with like-minded investors. Over recent years, he has advised numerous families, entrepreneurs, and companies on succession planning, strategic M&amp;A transactions, and funding rounds. He was previously part of Citigroup's Global Capital Markets team covering private banks, pension funds, hedge funds, and family offices.</p><p>Earlier he held a global research equity sales role with Lehman Brothers and Nomura International in both Zurich and London, having started his professional career as a financial advisor at a Swiss private bank.</p>`,
   edu:'Banking &amp; Finance, University of Applied Sciences Bern'},
  {initials:'TP',name:'Tom Pitts',role:'Partner & Chairman',location:'Zürich',
   bio:`<p>Tom has over 25 years of experience in public and private markets on the buy- and sell-side, including D.E. Shaw, Morgan Stanley, and Credit Suisse. He has held several leadership positions across leveraged finance, equity derivatives, cash equities, and private placements, running distribution groups in both London and Hong Kong.</p><p>Tom is an IC Member and the European Head of LionRock Capital. He serves on the board of Capricorn (Cairn) Energy PLC and Haglöfs AB.</p>`,
   edu:'Economics, Cambridge University'},
  {initials:'JF',name:'James Foley',role:'Principal',
   bio:`<p>James has over 17 years of experience in leadership roles across both buy-side and sell-side firms. He was Principal and COO of 3 Twelve Capital, a catalyst-driven hedge fund based in Chicago. Prior to that, he served as Managing Director in the Fixed Income Division at Credit Suisse in London and as Vice President, Equities, at Merrill Lynch International in London. He began his career in the Private Client Division of BMO Nesbitt Burns.</p>`,
   edu:'BA, University of Victoria; Corporate Finance, London Business School'},
  {initials:'PA',name:'Patrick Ackermann',role:'Investment Associate',location:'Zürich',
   bio:`<p>Patrick has five years of experience across private markets and alternative investments. Before joining Basso, he worked at LGT Capital Partners in Frankfurt and Switzerland, where he was responsible for sourcing, evaluating, and executing private debt investments.</p><p>His previous experience includes roles at Credit Suisse and Belvédère Asset Management in Zurich, covering multi-asset investments, structured solutions, and derivatives. He started his career as a banking apprentice at St. Galler Kantonalbank.</p>`,
   edu:'Master in Management (Grande École), HEC Paris; Master in Banking &amp; Finance (MBF), University of St. Gallen'},
  {initials:'DN',name:'Dwight Nelson',role:'Partner',location:'Stamford, USA',
   bio:`<p>Dwight is a Founding Partner of Basso Capital Management, where he has managed multi-strategy hedge funds and managed accounts since 1999, in addition to his own family office.</p><p>Dwight started his career at Grace Brothers, Ltd in Chicago, where he rose to portfolio manager for a multi-strategy hedge fund.</p>`,
   edu:'Economics, University of Chicago'},
  {initials:'RT',name:'Roger Tan',role:'Partner',location:'Singapore',
   bio:`<p>Roger is an entrepreneur and private equity investor with over 20 years of experience in commodities trading and private equity investments across the Americas, Europe, and APAC. He is a Partner and Board Member at Club Estate AG, a Swiss-based private markets advisory firm specializing in commercial real estate investments for private and institutional investors.</p><p>Roger is an Advisory Board member at Fraxtor, a Singapore prop-tech platform and Co-Founder of RDI Home, a Singapore-based fall detection system company. He is currently completing his doctoral thesis at Singapore Management University.</p>`,
   edu:'Master in Real Estate, National University of Singapore (NUS); Dual MBA from NUS and UCLA Anderson School of Management'},
];
const advisors = [
  {initials:'RS',name:'Russ Steenberg',role:'Senior Advisor',isAdvisor:true,
   bio:`<p>Russ was Managing Director and Chairman of BlackRock Private Equity Partners (PEP) within BlackRock Equity Private Markets (EPM), and previously Global Co-Head of BlackRock Private Equity Partners from 1999–2022. He founded PEP in 1999 when he joined Merrill Lynch Investment Managers, which merged with BlackRock in 2006.</p><p>Prior to founding PEP, Russ was Co-Founder and Managing Director of Fenway Partners and Co-Head of AT&T Pension Fund's PE portfolio. He currently serves on the boards and ICs of several private equity funds and foundations.</p>`,
   edu:'BA, St. Lawrence University; MBA, Amos Tuck School, Dartmouth; MPA, American University'},
  {initials:'BO',name:"Ben O'Halloran",role:'Senior Advisor',isAdvisor:true,
   bio:`<p>Ben has over 30 years of experience in M&amp;A, finance, and investment transactions across various industries. He handled M&amp;A in Europe for GE Capital and the GE parent company for 12 years, was a partner at Jones Day, and served as Chief Legal Officer at Verisure.</p>`,
   edu:'Harvard University; University of Oxford; INSEAD'},
  {initials:'CP',name:'Dr. Claudia Petersen',role:'Senior Advisor',isAdvisor:true,
   bio:`<p>Claudia has over 30 years of experience in private markets. In her previous position, Claudia was the Head of the Julius Baer Private Markets department leading a team of 16 professionals (including investment, structuring, and lifecycle teams) and responsible for CHF 6 billion of client assets across private equity, private debt, and private real estate.</p><p>Before joining Julius Bär, she was Head of Business Development Private Markets and Senior Private Equity Portfolio Manager at Baloise Asset Management. Claudia's prior experience includes launching the Swisscanto Growth Fund for Zürcher Kantonalbank, being a member of the Private Equity Investment team at Partners Group for 15 years, a Managing Director at LGT Private Equity Advisors, and a business consultant at Oliver Wyman.</p>`,
   edu:'Ph.D. in Business Administration, University of St. Gallen; MBA, HEC Paris'},
  {initials:'RD',name:'Romana Doser',role:'ESG Advisor',isAdvisor:true,
   bio:`<p>Romana has in-depth knowledge of the European impact investor landscape and a strong understanding of the respective product offerings and trends. She spent 13 years with responsAbility's Relationship Management Team, heading the Institutional Team Switzerland. responsAbility is known as the pioneer for social and environmental impact investments. She started her professional career at UBS Wealth Management.</p><p>Outside of her role at Basso, Romana is a Senior Relationship Manager for impact investments at Invethos, an independent wealth management firm in Switzerland focused on transparent and sustainable investment solutions.</p>`,
   edu:'Banking &amp; Finance, University of Applied Sciences Bern'},
];

// ── TEAM PHOTOS ──
const teamPhotos = {
  "HA": "assets/team-hani.jpg",
  "GC": "assets/team-gregor.jpg",
  "MN": "assets/team-martin.jpg",
  "TP": "assets/team-tom.jpg",
  "PA": "assets/team-patrick.jpg",
  "DN": "assets/team-dwight.jpg",
  "RT": "assets/team-roger.jpg",
  "RS": "assets/team-russ.jpg",
  "RD": "assets/team-romana.jpg",
  "BO": "assets/team-ben.jpg",
  "JF": "assets/team-foley.jpg",
  "CP": "assets/team-petersen.jpg",
};

function buildTeamGrid(people, gridId, panelId) {
  const grid = document.getElementById(gridId);
  const panel = panelId ? document.getElementById(panelId) : null;
  people.forEach(p => {
    const card = document.createElement('div');
    card.className = 'team-card';
    const photoSrc = teamPhotos[p.initials];
    const avatarHtml = photoSrc
      ? `<div class="team-avatar-photo"><img src="${photoSrc}" alt="${p.name}" loading="lazy"></div>`
      : `<div class="team-avatar">${p.initials}</div>`;
    card.innerHTML = `${avatarHtml}<div class="team-info"><div class="team-name">${p.name}</div><div class="team-role">${p.role}</div></div>`;
    card.onclick = () => toggleTeamMember(card, p, grid, panel);
    grid.appendChild(card);
  });
}

function toggleTeamMember(card, person, grid, panel) {
  const wasActive = card.classList.contains('active');
  // Close any open bio across BOTH grids (partners + advisors) — only one open at a time
  document.querySelectorAll('.team-card.active').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.inline-bio-panel').forEach(p => p.remove());
  if (wasActive) return;
  card.classList.add('active');

  const photo = teamPhotos[person.initials];
  const avatar = photo
    ? `<div class="bio-photo"><img src="${photo}" alt="${person.name}"></div>`
    : `<div class="bio-photo bio-photo-fallback">${person.initials}</div>`;
  const badge = person.isAdvisor ? `<div class="advisor-badge">Advisory Board</div>` : '';
  const location = person.location ? `<div class="bio-location">${person.location}</div>` : '';

  const bioEl = document.createElement('div');
  bioEl.className = 'inline-bio-panel';
  bioEl.innerHTML = `
    <button class="bio-close" aria-label="Close" onclick="const g=this.closest('.team-grid');g.querySelectorAll('.team-card').forEach(c=>c.classList.remove('active'));this.closest('.inline-bio-panel').remove()">&#x2715;</button>
    <div class="bio-media">
      ${avatar}
      <div class="bio-name">${person.name}</div>
      <div class="bio-role">${person.role}</div>
      ${badge}
      ${location}
    </div>
    <div class="bio-body">
      <div class="bio-text">${person.bio}</div>
      <div class="bio-edu"><span>Education</span>${person.edu}</div>
    </div>`;

  // Insert after the last card in the clicked card's visual row, so the row
  // of cards stays intact and the panel spans full width beneath it.
  const cards = Array.from(grid.querySelectorAll('.team-card'));
  const rowTop = card.offsetTop;
  let lastInRow = card;
  cards.forEach(c => { if (Math.abs(c.offsetTop - rowTop) < 4) lastInRow = c; });
  lastInRow.after(bioEl);

  setTimeout(() => bioEl.scrollIntoView({behavior:'smooth', block:'nearest'}), 60);
}

buildTeamGrid(partners, 'teamGrid', null);
buildTeamGrid(advisors, 'advisorGrid', null);

// ── MAP TOOLTIP ──
function showTip(e, city, entity, addr) {
  const tip = document.getElementById('mapTooltip');
  const container = document.getElementById('mapContainer');
  const rect = container.getBoundingClientRect();
  const svgEl = e.currentTarget;
  const svgRect = svgEl.getBoundingClientRect();
  let x = svgRect.left - rect.left + 20;
  let y = svgRect.top - rect.top - 80;
  if (x + 240 > rect.width) x = x - 260;
  if (y < 0) y = svgRect.top - rect.top + 20;
  document.getElementById('tipCity').textContent = city;
  document.getElementById('tipEntity').textContent = entity;
  document.getElementById('tipAddr').textContent = addr;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
  tip.classList.add('show');
}
function hideTip() {
  document.getElementById('mapTooltip').classList.remove('show');
}

// ── NAV ──
function handleNewsletterSignup(btn) {
  const input = btn.previousElementSibling;
  const email = input ? input.value.trim() : '';
  if (!email || !email.includes('@')) {
    input.style.borderColor = 'rgba(201,168,76,0.6)';
    input.placeholder = 'Please enter a valid email address';
    return;
  }
  btn.textContent = 'Subscribed ✓';
  btn.style.background = 'rgba(201,168,76,0.5)';
  btn.disabled = true;
  input.value = '';
  input.placeholder = 'Thank you for subscribing!';
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  // Show map only on home page
  const mapEl = document.getElementById('mapContainer');
  if (mapEl) mapEl.style.display = (name === 'home') ? '' : 'none';
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');
  const footer = document.getElementById('siteFooter');
  if (footer) footer.style.display = '';
  window.scrollTo({top:0, behavior:'smooth'});
}
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
});

// ── PILLAR TOGGLE ──
function togglePillar(el) {
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.pillar-card').forEach(p => p.classList.remove('active'));
  if (!wasActive) el.classList.add('active');
}

// ── STRATEGY ACCORDION ──
function toggleStrategyPillar(el) {
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.strategy-pillar').forEach(p => p.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}
