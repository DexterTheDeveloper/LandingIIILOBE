export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  const dataMap = {
    '/geek-radio':    '/_data/geek-radio.json',
    '/kgtv':          '/_data/kgtv.json',
    '/fresh-as-funk': '/_data/fresh-as-funk.json',
    '/':              '/_data/homepage.json',
  };

  const dataFile = dataMap[path];
  const isHome   = path === '/';

  /* âââ 1. RESPONSIVE CSS OVERRIDES âââ */
  const styleInject = `<style>
/* ââ Large-screen scaling (1200px+) ââ */
@media (min-width: 1200px) {
  .logo-wrap img {
    max-width: clamp(500px, 38vw, 860px) !important;
  }
  .pillar img {
    width:  clamp(180px, 11vw, 260px) !important;
    height: clamp(180px, 11vw, 260px) !important;
  }
  .pillar span {
    font-size: clamp(14px, 0.9vw, 20px) !important;
  }
  nav a {
    font-size: clamp(0.72rem, 0.55vw, 0.95rem) !important;
  }
}

/* ââ Countdown wrapper ââ */
.iiiglobe-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 0 6px;
  width: 100%;
}
.cd-label {
  font-family: "Orbitron", sans-serif;
  font-size: clamp(0.5rem, 0.7vw, 0.8rem);
  letter-spacing: 5px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
}
.cd-timer {
  display: flex;
  align-items: center;
  gap: clamp(4px, 0.8vw, 14px);
}
.cd-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: clamp(34px, 3.2vw, 60px);
}
.cd-num {
  font-family: "Orbitron", sans-serif;
  font-size: clamp(1.3rem, 2.8vw, 3rem);
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 16px rgba(0,229,255,0.55), 0 0 32px rgba(138,43,226,0.25);
}
.cd-lbl {
  font-family: "DM Mono", monospace;
  font-size: clamp(0.4rem, 0.45vw, 0.6rem);
  letter-spacing: 2px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  margin-top: 4px;
}
.cd-sep {
  font-family: "Orbitron", sans-serif;
  font-size: clamp(1rem, 2.4vw, 2.6rem);
  color: rgba(0,229,255,0.4);
  font-weight: 700;
  padding-bottom: 12px;
  line-height: 1;
}
/* Video reveal */
.cd-video-wrap {
  display: none;
  width: clamp(280px, 52vw, 740px);
  aspect-ratio: 16/9;
  margin-top: 4px;
}
.cd-video-wrap iframe {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 6px;
  box-shadow: 0 0 28px rgba(0,229,255,0.18), 0 0 56px rgba(138,43,226,0.1);
}
.cd-live-label {
  display: none;
  font-family: "Orbitron", sans-serif;
  font-size: clamp(0.6rem, 0.8vw, 0.9rem);
  letter-spacing: 5px;
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0,229,255,0.8);
  text-transform: uppercase;
}
@media (max-width: 768px) {
  .cd-video-wrap { width: 90vw; }
}
</style>`;

  /* âââ 2. COUNTDOWN HTML (homepage only) âââ */
  const countdownHtml = `<div class="iiiglobe-countdown" id="iiig-cd">
  <div class="cd-label" id="cd-label">LAUNCHING IN</div>
  <div class="cd-timer" id="cd-timer">
    <div class="cd-unit"><span class="cd-num" id="cd-d">--</span><span class="cd-lbl">DAYS</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cd-h">--</span><span class="cd-lbl">HRS</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cd-m">--</span><span class="cd-lbl">MIN</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cd-s">--</span><span class="cd-lbl">SEC</span></div>
  </div>
  <div class="cd-live-label" id="cd-live">LIVE NOW</div>
  <div class="cd-video-wrap" id="cd-video">
    <iframe id="cd-frame" src="" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>`;

  /* âââ 3. COUNTDOWN ENGINE (homepage only) âââ */
  const countdownScript = `<script>(function(){
  window.__iiigStartCountdown = function(target, videoUrl, labelText) {
    var timer  = document.getElementById('cd-timer');
    var label  = document.getElementById('cd-label');
    var live   = document.getElementById('cd-live');
    var video  = document.getElementById('cd-video');
    var frame  = document.getElementById('cd-frame');
    var dEl    = document.getElementById('cd-d');
    var hEl    = document.getElementById('cd-h');
    var mEl    = document.getElementById('cd-m');
    var sEl    = document.getElementById('cd-s');
    if (!timer) return;
    if (labelText && label) label.textContent = labelText;
    var end = new Date(target).getTime();
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var diff = end - Date.now();
      if (diff <= 0) {
        timer.style.display  = 'none';
        label.style.display  = 'none';
        live.style.display   = 'block';
        if (videoUrl) {
          frame.src          = videoUrl;
          video.style.display = 'block';
        }
        return;
      }
      dEl.textContent = pad(Math.floor(diff / 86400000));
      hEl.textContent = pad(Math.floor(diff % 86400000 / 3600000));
      mEl.textContent = pad(Math.floor(diff % 3600000  /   60000));
      sEl.textContent = pad(Math.floor(diff %   60000  /    1000));
      setTimeout(tick, 1000);
    }
    tick();
  };
})();</script>`;

  /* âââ 4. DATA LOADER âââ */
  const loaderScript = dataFile ? `<script>(function(){
  fetch('${dataFile}')
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){
      if (!d) return;
      var qs  = function(s){ return document.querySelector(s); };
      var qsa = function(s){ return Array.from(document.querySelectorAll(s)); };

      /* title */
      if (d.title) {
        var h1 = qs('h1');
        if (h1) h1.textContent = d.title;
        document.title = d.title + ' | IIIGLOBE';
      }

      /* tagline */
      if (d.tagline) {
        var tg = qs('p.tagline');
        if (tg) tg.textContent = d.tagline;
      }

      /* CTA button */
      if (d.cta_text) {
        var btn = qs('a.cta-btn');
        if (btn) {
          btn.textContent = d.cta_text;
          if (d.cta_url) btn.href = d.cta_url;
        }
      }

      /* Section headings */
      var h2s = qsa('main h2, section h2, .about-section h2, .content-section h2');
      if (d.about_title   && h2s[0]) h2s[0].textContent = d.about_title;
      if (d.section2_title && h2s[1]) h2s[1].textContent = d.section2_title;

      /* About body paragraphs */
      if (d.about_body && h2s[0]) {
        var sec = h2s[0].closest('section') || h2s[0].parentElement;
        var ps  = Array.from(sec.querySelectorAll('p'));
        d.about_body.split('\\n\\n').forEach(function(line, i){
          if (ps[i]) ps[i].textContent = line;
        });
      }

      /* Cards */
      if (d.items && d.items.length) {
        qsa('.card').forEach(function(card, i){
          if (!d.items[i]) return;
          var h3 = card.querySelector('h3');
          var p  = card.querySelector('p');
          if (h3) h3.textContent = d.items[i].name        || '';
          if (p)  p.textContent  = d.items[i].description || '';
        });
      }

      /* Social links */
      if (d.social) {
        qsa('a[href]').forEach(function(a){
          var href = a.getAttribute('href') || '';
          if      (href.includes('facebook.com')                          && d.social.facebook)  a.href = d.social.facebook;
          else if (href.includes('instagram.com')                         && d.social.instagram) a.href = d.social.instagram;
          else if ((href.includes('twitter.com')||href.includes('x.com')) && d.social.twitter)   a.href = d.social.twitter;
          else if (href.includes('youtube.com')                           && d.social.youtube)   a.href = d.social.youtube;
        });
      }

      /* Brand pillars â update labels AND wrap in real <a> links */
      if (d.brands) {
        qsa('.pillar').forEach(function(pillar, i){
          if (!d.brands[i]) return;
          var b    = d.brands[i];
          var span = pillar.querySelector('span');
          if (span && b.label) span.textContent = b.label;
          /* Wrap in anchor if not already wrapped */
          if (b.url && !pillar.closest('a')) {
            var a       = document.createElement('a');
            a.href      = b.url;
            a.title     = b.label || '';
            a.style.cssText = 'text-decoration:none;color:inherit;display:flex;flex-direction:column;align-items:center;gap:8px;';
            pillar.parentNode.insertBefore(a, pillar);
            a.appendChild(pillar);
          }
        });
      }

      /* Countdown */
      if (d.countdown_target && window.__iiigStartCountdown) {
        window.__iiigStartCountdown(
          d.countdown_target,
          d.countdown_video_url || '',
          d.countdown_label     || 'LAUNCHING IN'
        );
      }
    });
})();</script>` : '';

  /* âââ ASSEMBLE WITH HTMLRewriter âââ */
  const rewriter = new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(styleInject, { html: true });
      }
    })
    .on('body', {
      element(el) {
        if (isHome) el.append(countdownScript, { html: true });
        if (loaderScript) el.append(loaderScript, { html: true });
      }
    });

  /* Inject countdown block just before the .pillars div (homepage only) */
  if (isHome) {
    rewriter.on('.pillars', {
      element(el) {
        el.before(countdownHtml, { html: true });
      }
    });
  }

  return rewriter.transform(response);
}
