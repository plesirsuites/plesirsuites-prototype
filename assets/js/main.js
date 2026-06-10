
/* ── SHOP PRODUCT DETAIL ── */

let productSlideIndex = 0;
let productSlideTotal = 0;

function openProduct(id) {
  const p = PRODUCTS[id];
  if (!p) return;

  document.getElementById('productName').textContent  = p.name;
  document.getElementById('productPrice').textContent = p.price;
  document.getElementById('productTag').textContent   = p.tag;
  document.getElementById('productDesc').textContent  = p.desc;
  document.getElementById('productNotify').href =
    `mailto:plesirsuites@gmail.com?subject=Notify me — ${p.name}`;

  // Sizes
  const sizesEl = document.getElementById('productSizes');
  sizesEl.innerHTML = p.sizes.map(s =>
    `<div class="product-size-btn">${s}</div>`).join('');

  // Build slideshow
  productSlideIndex = 0;
  const track  = document.getElementById('productSlideTrack');
  const dots   = document.getElementById('productDots');
  const images = p.images && p.images.length ? p.images : [];

  if (images.length === 0) {
    // No images yet — show placeholder
    track.innerHTML = `<div class="product-slide"><div class="product-slide-placeholder">Image Coming Soon</div></div>`;
    dots.innerHTML  = '';
    productSlideTotal = 1;
    document.getElementById('productPrev').classList.add('hidden');
    document.getElementById('productNext').classList.add('hidden');
  } else {
    track.innerHTML = images.map(url =>
      `<div class="product-slide" style="background-image:url('${url}')"></div>`
    ).join('');
    productSlideTotal = images.length;
    dots.innerHTML = images.map((_, i) =>
      `<div class="product-slide-dot ${i === 0 ? 'active' : ''}" onclick="goProductSlide(${i})"></div>`
    ).join('');
    const hidden = images.length <= 1 ? 'hidden' : '';
    document.getElementById('productPrev').className = `product-slide-btn prev ${hidden}`;
    document.getElementById('productNext').className = `product-slide-btn next ${hidden}`;
  }

  track.style.transform = 'translateX(0)';
  document.getElementById('productOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function productSlide(dir) {
  productSlideIndex = (productSlideIndex + dir + productSlideTotal) % productSlideTotal;
  updateProductSlide();
}

function goProductSlide(idx) {
  productSlideIndex = idx;
  updateProductSlide();
}

function updateProductSlide() {
  document.getElementById('productSlideTrack').style.transform =
    `translateX(-${productSlideIndex * 100}%)`;
  document.querySelectorAll('.product-slide-dot').forEach((d, i) =>
    d.classList.toggle('active', i === productSlideIndex));
}

function closeProduct() {
  document.getElementById('productOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeProductOnBg(e) {
  if (e.target === document.getElementById('productOverlay')) closeProduct();
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProduct();
});
function openMcPopup(feedKey, title) {
  const encoded = encodeURIComponent(feedKey);
  const src = 'https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=0&autoplay=true&feed=' + feedKey;
  document.getElementById('mcPopupIframe').src = src;
  document.getElementById('mcPopupOverlay').classList.add('open');
}
function closeMcPopupBtn() {
  document.getElementById('mcPopupIframe').src = '';
  document.getElementById('mcPopupOverlay').classList.remove('open');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMcPopupBtn();
    ['aboutOverlay','shopOverlay','showsOverlay','supportusOverlay','streamOverlay','newsletterOverlay'].forEach(id => closeOverlay(id));
    closeBurger();
  }
});

/* ── MIXCLOUD WIDGET MANAGER ── */
const mcWidgets = new Map();
function registerWidget(iframe) {
  if (!iframe.id) iframe.id = 'mc-' + Math.random().toString(36).slice(2,8);
  if (mcWidgets.has(iframe.id)) return;
  const widget = Mixcloud.PlayerWidget(iframe);
  mcWidgets.set(iframe.id, widget);
  widget.ready.then(() => {
    widget.events.play.on(() => {
      mcWidgets.forEach((w,id) => { if (id !== iframe.id) w.pause(); });
    });
  });
}
function registerAllIframes() {
  document.querySelectorAll('iframe[src*="mixcloud.com"]').forEach(registerWidget);
}
const mcObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.tagName === 'IFRAME' && node.src.includes('mixcloud.com')) registerWidget(node);
      else node.querySelectorAll && node.querySelectorAll('iframe[src*="mixcloud.com"]').forEach(registerWidget);
    });
  });
});
const showsGrid = document.getElementById('showsGrid');
if (showsGrid) mcObserver.observe(showsGrid, { childList: true, subtree: true });
window.addEventListener('load', registerAllIframes);
setTimeout(registerAllIframes, 2000);

/* ── PLAYER ── */
const STREAM_HTTPS = 'https://static-s8.xajist.com/sslstream/8016';
const STREAM_HTTP  = 'http://static-s8.xajist.com:8016/stream';
const STREAM_URLS  = [
  STREAM_HTTPS,
  'https://corsproxy.io/?url=' + encodeURIComponent(STREAM_HTTP),
];
let playing = false, retryTimer = null, urlIndex = 0;
const audio   = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const nowTitle = document.getElementById('nowTitle');

function setStatus(text, isError) {
  if (playBtn) playBtn.style.color = isError ? '#e03030' : '';
  if (nowTitle) nowTitle.textContent = text;
}
function startStream(index) {
  if (index === undefined) index = urlIndex;
  if (index >= STREAM_URLS.length) index = 0;
  urlIndex = index;
  clearTimeout(retryTimer);
  audio.pause(); audio.removeAttribute('src'); audio.load();
  const url = STREAM_URLS[index];
  setStatus('Connecting…', false);
  setTimeout(() => {
    if (!playing) return;
    audio.src = url;
    audio.play().catch(err => {
      if (!playing) return;
      if (err.name === 'NotAllowedError') { setStatus('Tap PLAY to start', false); playBtn.textContent = 'PLAY'; playing = false; }
      else retryTimer = setTimeout(() => startStream(index + 1), 1500);
    });
  }, 300);
}
function togglePlay() {
  if (!playing) { playing = true; urlIndex = 0; playBtn.textContent = 'STOP'; startStream(0); }
  else { playing = false; clearTimeout(retryTimer); audio.pause(); audio.removeAttribute('src'); audio.load(); playBtn.textContent = 'PLAY'; setStatus('Diverse sounds and community broadcasts, all day, every day.', false); }
}
audio.addEventListener('playing', () => { clearTimeout(retryTimer); setStatus('Diverse sounds and community broadcasts, all day, every day.', false); playBtn.textContent = 'STOP'; playing = true; fetchIcecastMeta(); });
audio.addEventListener('waiting', () => { if (playing) setStatus('Buffering…', false); });
audio.addEventListener('stalled', () => { if (!playing) return; setStatus('Reconnecting…', false); clearTimeout(retryTimer); retryTimer = setTimeout(() => startStream(urlIndex), 3000); });
audio.addEventListener('error', () => { if (!playing) return; clearTimeout(retryTimer); retryTimer = setTimeout(() => startStream(urlIndex + 1), 1500); });
audio.addEventListener('ended', () => { if (playing) retryTimer = setTimeout(() => startStream(urlIndex), 1000); });

async function fetchIcecastMeta() {
  const urls = ['https://corsproxy.io/?url=' + encodeURIComponent('http://static-s8.xajist.com:8016/status-json.xsl'), 'https://static-s8.xajist.com:8016/status-json.xsl'];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      const src = data?.icestats?.source;
      const s = Array.isArray(src) ? src[0] : src;
      if (s?.title && playing) { setStatus(s.title, false); return; }
    } catch(e) {}
  }
}
setInterval(() => { if (playing) fetchIcecastMeta(); }, 15000);
document.addEventListener('touchstart', () => {
  try { new (window.AudioContext || window.webkitAudioContext)().resume(); } catch(e) {}
}, { once: true });

/* ── MIXCLOUD API ── */
async function fetchMcData(key) {
  try {
    const res = await fetch('https://api.mixcloud.com' + key);
    const data = await res.json();
    return {
      picture: data.pictures?.extra_large || data.pictures?.large || data.pictures?.medium || null,
      desc: data.description ? data.description.slice(0,100) + (data.description.length > 100 ? '…' : '') : (data.tags?.length ? data.tags.map(t => t.name).join(', ') : '—'),
      name: data.name || '',
    };
  } catch(e) { return { picture: null, desc: '—', name: '' }; }
}

async function populateHardcodedCards() {
  const cards = [
    { key: '/plesirsuites_radio/p-suites-r054-jemput-dengar/', coverId: 'cover-r054' },
    { key: '/plesirsuites_radio/p-suites-r053-aldi/',          coverId: 'cover-r053' },
    { key: '/plesirsuites_radio/p-suites-r052-ical/',          coverId: 'cover-r052' },
    { key: '/plesirsuites_radio/p-suites-r051-rio/',           coverId: 'cover-r051' },
  ];
  for (const c of cards) {
    const data = await fetchMcData(c.key);
    const coverEl = document.getElementById(c.coverId);
    if (coverEl && data.picture) coverEl.style.backgroundImage = "url('" + data.picture + "')";
    const subEl = document.querySelector('.show-sub[data-key="' + c.key + '"]');
    if (subEl) subEl.textContent = data.desc;
  }
}

function buildCard(cast) {
  const feedKey = cast.key;
  const epMatch = cast.name.match(/[Rr](\d{3})/);
  const epLabel = epMatch ? 'R' + epMatch[1] : '—';
  const coverUrl = cast.pictures?.extra_large || cast.pictures?.large || cast.pictures?.medium || '';
  const card = document.createElement('div');
  card.className = 'show-card mixcloud';
  card.onclick = () => openMcPopup(feedKey, cast.name);
  card.innerHTML = '<div class="show-thumb"><div class="show-thumb-inner" style="background:#111 url(\'' + coverUrl + '\') center/cover no-repeat;width:100%;height:100%;transition:transform 0.5s ease;"></div><div class="play-overlay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div><div class="show-info"><div class="show-meta"><span class="show-cat">Archive</span><span class="show-ep">' + epLabel + '</span></div><div class="show-name">' + cast.name + '</div><div class="show-sub">Loading…</div></div>';
  fetchMcData(feedKey).then(data => { const s = card.querySelector('.show-sub'); if(s) s.textContent = data.desc; });
  return card;
}

/* ── LOAD MORE ── */
const MIXCLOUD_USER = 'plesirsuites_radio';
const PER_PAGE = 4;
let mcOffset = 4, mcNextUrl = null, mcLoading = false, mcExhausted = false;

async function loadMore() {
  if (mcLoading || mcExhausted) return;
  mcLoading = true;
  const btn = document.getElementById('loadMoreBtn');
  btn.textContent = 'Loading…'; btn.disabled = true;
  try {
    const url = mcNextUrl ? mcNextUrl : 'https://api.mixcloud.com/' + MIXCLOUD_USER + '/cloudcasts/?limit=' + PER_PAGE + '&offset=' + mcOffset;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const grid = document.getElementById('showsGrid');
    (data.data || []).forEach(cast => grid.appendChild(buildCard(cast)));
    mcNextUrl = (data.paging && data.paging.next) ? data.paging.next : null;
    if (!mcNextUrl || !data.data?.length) { mcExhausted = true; btn.textContent = 'All Shows Loaded'; btn.classList.add('all-loaded'); btn.disabled = true; }
    else { btn.textContent = 'Load More'; btn.disabled = false; }
  } catch(err) { console.error(err); btn.textContent = 'Retry'; btn.disabled = false; }
  mcLoading = false;
}

/* ── SHOWS OVERLAY ── */
let sovNextUrl = null, sovLoading = false, sovExhausted = false, sovInitialized = false;

function buildShowCard(cast) {
  const feedKey = cast.key;
  const epMatch = cast.name.match(/[Rr](\d{3})/);
  const epLabel = epMatch ? 'R' + epMatch[1] : '—';
  const coverUrl = cast.pictures?.extra_large || cast.pictures?.large || cast.pictures?.medium || '';
  const date = cast.created_time ? new Date(cast.created_time).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
  const card = document.createElement('div');
  card.className = 'show-card-dark';
  card.onclick = () => openMcPopup(feedKey, cast.name);
  card.innerHTML = '<div class="show-thumb"><div class="show-thumb-inner" style="background:#111 url(\'' + coverUrl + '\') center/cover no-repeat;width:100%;height:100%;transition:transform 0.5s ease;"></div><div class="play-overlay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div><div class="show-info"><div class="show-meta"><span class="show-cat">Archive</span><span class="show-ep">' + epLabel + '</span></div><div class="show-name">' + cast.name + '</div><div class="show-sub">' + date + '</div></div>';
  return card;
}

async function loadShowsOverlay() {
  if (sovLoading || sovExhausted) return;
  sovLoading = true;
  const btn = document.getElementById('showsOverlayBtn');
  const grid = document.getElementById('showsOverlayGrid');
  btn.textContent = 'Loading…'; btn.disabled = true;
  try {
    const url = sovNextUrl ? sovNextUrl : 'https://api.mixcloud.com/plesirsuites_radio/cloudcasts/?limit=12&offset=0';
    const res = await fetch(url);
    const data = await res.json();
    (data.data || []).forEach(cast => grid.appendChild(buildShowCard(cast)));
    sovNextUrl = data.paging?.next || null;
    if (!sovNextUrl || !data.data?.length) { sovExhausted = true; btn.textContent = 'All Shows Loaded'; btn.disabled = true; }
    else { btn.textContent = 'Load More'; btn.disabled = false; }
  } catch(e) { btn.textContent = 'Retry'; btn.disabled = false; }
  sovLoading = false;
}

function resetShowsOverlay() {
  sovNextUrl = null; sovLoading = false; sovExhausted = false; sovInitialized = false;
  const grid = document.getElementById('showsOverlayGrid'); if(grid) grid.innerHTML = '';
  const btn = document.getElementById('showsOverlayBtn'); if(btn) { btn.textContent = 'Load More'; btn.disabled = false; }
}

/* ── OVERLAYS ── */
// ── MIXCLOUD LIVE STREAM URL ──
// Replace with your Mixcloud live stream URL when Pro is active:
// e.g. 'https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=0&autoplay=true&feed=/plesirsuites_radio/live/'
const MIXCLOUD_LIVE_URL = ''; // Leave empty until Pro is active

/* ── NEWSLETTER ── */
function submitNewsletter(e) {
  e.preventDefault();
  const name  = document.getElementById('nlFirstName').value.trim();
  const email = document.getElementById('nlEmail').value.trim();
  if (!name || !email) return;

  // Send to mailto as fallback (replace with your email service later)
  const subject = encodeURIComponent('Newsletter Subscription — Plesir Suites Radio');
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}`);
  window.open(`mailto:plesirsuites@gmail.com?subject=${subject}&body=${body}`);

  // Show success
  document.querySelector('.newsletter-form').style.display = 'none';
  document.querySelector('.newsletter-note').style.display = 'none';
  document.getElementById('nlSuccess').classList.add('show');
}

function openOverlay(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
  if (id === 'streamOverlay') {
    const iframe = document.getElementById('streamIframe');
    const coming = document.getElementById('streamComingSoon');
    if (MIXCLOUD_LIVE_URL) {
      iframe.src = MIXCLOUD_LIVE_URL;
      iframe.style.display = 'block';
      coming.style.display = 'none';
    } else {
      iframe.style.display = 'none';
      coming.style.display = 'flex';
    }
  }
  if (id === 'showsOverlay' && !sovInitialized) { sovInitialized = true; loadShowsOverlay(); }
}

function stopStream() {
  const iframe = document.getElementById('streamIframe');
  if (iframe) iframe.src = '';
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
  if (id === 'streamOverlay') stopStream();
  if (id === 'showsOverlay') resetShowsOverlay();
  if (id === 'newsletterOverlay') {
    document.querySelector('.newsletter-form').style.display = 'flex';
    document.querySelector('.newsletter-note').style.display = 'block';
    document.getElementById('nlSuccess').classList.remove('show');
    document.getElementById('nlFirstName').value = '';
    document.getElementById('nlEmail').value = '';
  }
}

document.addEventListener('click', e => {
  const btn = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  if (btn.contains(e.target) || menu.contains(e.target)) return;
  if (e.target.closest && (e.target.closest('.fullscreen-overlay') || e.target.closest('.h-nav'))) return;
  closeBurger();
});

/* ── BURGER ── */
function toggleBurger() {
  const btn = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  btn.classList.toggle('open'); menu.classList.toggle('open');
}
function closeBurger() {
  const btn = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  if(btn) btn.classList.remove('open');
  if(menu) menu.classList.remove('open');
}

/* ── SLIDESHOW ── */
const slides = document.querySelectorAll('.slide');
const dotsEl = document.getElementById('slideDots');
const progressEl = document.getElementById('slideProgress');
const DURATION = 5000;
let current = 0, slideTimer = null, slidePaused = false;

slides.forEach((_,i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i===0?' active':'');
  d.onclick = () => goTo(i);
  dotsEl.appendChild(d);
});

function getDots() { return document.querySelectorAll('.dot'); }
function goTo(n) {
  slides[current].classList.remove('active'); getDots()[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active'); getDots()[current].classList.add('active');
  if (slidePaused) { slidePaused = false; const b = document.getElementById('navPauseBtn'); if(b) b.innerHTML = '&#9646;&#9646;'; }
  startProgress();
}
function slidePrev() { goTo(current - 1); }
function slideNext() { goTo(current + 1); }
function startProgress() {
  clearTimeout(slideTimer);
  progressEl.style.transition = 'none'; progressEl.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    progressEl.style.transition = 'width ' + DURATION + 'ms linear'; progressEl.style.width = '100%';
  }));
  slideTimer = setTimeout(() => { if (!slidePaused) goTo(current + 1); }, DURATION);
}
function toggleSlidePause() {
  slidePaused = !slidePaused;
  const btn = document.getElementById('navPauseBtn');
  if (slidePaused) { clearTimeout(slideTimer); progressEl.style.transition = 'none'; if(btn) btn.innerHTML = '&#9654;'; }
  else { if(btn) btn.innerHTML = '&#9646;&#9646;'; startProgress(); }
}
startProgress();

/* ── SCHEDULE ── */


function toMins(t) { const [h,m]=t.split(':').map(Number); return h*60+m; }

function getCurrentAndNext() {
  const now = new Date(), day = now.toLocaleString('en-US',{weekday:'long'}), mins = now.getHours()*60+now.getMinutes();
  const shows = SCHEDULE[day] || []; let current = null, next = null;
  for (let i=0; i<shows.length; i++) {
    const s = shows[i];
    if (mins >= toMins(s.time) && mins < toMins(s.end)) { current=s; next=shows[i+1]||null; break; }
    if (toMins(s.time) > mins && !next) next = s;
  }
  if (!current && !next) { const tIdx=(DAYS.indexOf(day)+1)%7; next=(SCHEDULE[DAYS[tIdx]]||[])[0]||null; }
  return { current, next, day };
}

function buildLiveNowBar() {
  const { current } = getCurrentAndNext();
  const onAirEl = document.getElementById('schedOnAirTitle');
  const text = current ? current.time + ' – ' + current.end + '  ·  ' + current.title.toUpperCase() : 'Catch us at our next scheduled time!';
  ['liveNowTitle','liveNowTitle2','liveNowTitle3','liveNowTitle4'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=text; });
  if (onAirEl) onAirEl.textContent = current ? current.title.toUpperCase() : 'Off Air';
}

function buildSchedule() {
  const grid = document.getElementById('scheduleGrid'); if(!grid) return;
  const today = new Date().toLocaleString('en-US',{weekday:'long'}), nowMins = new Date().getHours()*60+new Date().getMinutes();
  DAYS.forEach(day => {
    const isToday = day===today, col = document.createElement('div'); col.className='sched-col';
    const hdr = document.createElement('div'); hdr.className='sched-col-header'+(isToday?' today':'');
    hdr.innerHTML='<span class="sched-col-day">'+day.slice(0,3).toUpperCase()+'</span>'+(isToday?'<span style="font-size:8px;color:#e03030;letter-spacing:0.1em;">TODAY</span>':'');
    col.appendChild(hdr);
    const showsEl = document.createElement('div'); showsEl.className='sched-col-shows';
    const shows = SCHEDULE[day]||[];
    if (!shows.length) { showsEl.innerHTML='<div class="sched-empty">No shows</div>'; }
    else { shows.forEach(s => { const isLive=isToday&&nowMins>=toMins(s.time)&&nowMins<toMins(s.end); const item=document.createElement('div'); item.className='sched-item'+(isLive?' live':''); item.innerHTML='<div class="sched-item-time">'+s.time+' – '+s.end+(isLive?' · Diverse sounds and community broadcasts, all day, every day.':'')+'</div><div class="sched-item-title">'+s.title+'</div><div class="sched-item-desc">'+s.desc+'</div>'; showsEl.appendChild(item); }); }
    col.appendChild(showsEl); grid.appendChild(col);
  });
}

function toggleSchedule() {
  const sec   = document.getElementById('scheduleSection');
  const arrow = document.getElementById('schedArrow');
  const isOpen = sec.classList.toggle('open');
  arrow.textContent = isOpen ? '‹' : '›';
  // Auto scroll to top when opening
  if (isOpen) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ── SEARCH ── */
let searchTimer = null;

function handleSearch(e) {
  if (e.key === 'Escape') {
    closeSearch();
    document.getElementById('searchInput').blur();
  }
  if (e.key === 'Enter') triggerSearch();
}

function handleSearchInput(val) {
  clearTimeout(searchTimer);
  if (!val.trim()) { closeSearch(); return; }
  searchTimer = setTimeout(() => triggerSearch(), 400);
}

async function triggerSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const results = document.getElementById('searchResults');
  results.innerHTML = '<div class="search-loading">Searching…</div>';
  results.classList.add('open');

  try {
    const res  = await fetch(`https://api.mixcloud.com/plesirsuites_radio/cloudcasts/?limit=20`);
    const data = await res.json();
    const all  = data.data || [];
    const lower = q.toLowerCase();
    const matches = all.filter(c => c.name.toLowerCase().includes(lower));

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">No results for "<strong>${q}</strong>"</div>`;
      return;
    }

    results.innerHTML = matches.map(c => {
      const cover = c.pictures?.medium || c.pictures?.large || '';
      const ep    = (c.name.match(/[Rr](\d{3})/) || [])[0] || '';
      return `<div class="search-result-item" onclick="openMcPopup('${c.key}','${c.name.replace(/'/g,"\\'")}'); closeSearch();">
        <div class="search-result-img" style="background-image:url('${cover}')"></div>
        <div class="search-result-info">
          <div class="search-result-name">${c.name}</div>
          <div class="search-result-meta">${ep} · Plesir Suites Radio</div>
        </div>
      </div>`;
    }).join('');

  } catch(e) {
    results.innerHTML = '<div class="search-empty">Could not load results.</div>';
  }
}

function closeSearch() {
  document.getElementById('searchResults').classList.remove('open');
  document.getElementById('searchInput').value = '';
}

// Close search on outside click
document.addEventListener('click', e => {
  const search = document.querySelector('.h-search');
  if (search && !search.contains(e.target)) closeSearch();
});

/* ── ICECAST META ── */
async function fetchIcecastMetaAlways() {
  const urls = ['https://corsproxy.io/?url='+encodeURIComponent('http://static-s8.xajist.com:8016/status-json.xsl')];
  for (const url of urls) {
    try {
      const res=await fetch(url,{cache:'no-store'}); const data=await res.json();
      const src=data?.icestats?.source; const s=Array.isArray(src)?src[0]:src;
      if (s?.title) { if(nowTitle && !playing) nowTitle.textContent=s.title; return; }
    } catch(e) {}
  }
}
setInterval(fetchIcecastMetaAlways, 15000);
fetchIcecastMetaAlways();

buildLiveNowBar();
buildSchedule();
populateHardcodedCards();
