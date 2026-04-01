// ─── IIIGLOBE Decap CMS Preview Templates ────────────────────────────────────
// Runs inside the CMS preview iframe. Mirrors the brand aesthetic so edits
// show up styled in real-time before you ever push a commit.

var h = window.h; // React.createElement alias provided by Decap CMS

// ─── Shared styles ───────────────────────────────────────────────────────────
var BASE_CSS = [
  '@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap");',
  '* { margin:0; padding:0; box-sizing:border-box; }',
  'body { background:#000; color:#fff; font-family:"DM Mono",monospace; }',
  '.preview-wrap { min-height:100vh; background:#000; color:#fff; padding-bottom:40px; }',
  '.hp-hero { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px 40px; text-align:center; gap:24px; }',
  '.hp-tagline { font-family:"Orbitron",sans-serif; font-size:clamp(14px,3vw,22px); font-weight:900; letter-spacing:6px; text-transform:uppercase; }',
  '.hp-countdown { font-family:"DM Mono",monospace; font-size:13px; opacity:0.5; letter-spacing:3px; text-transform:uppercase; }',
  '.hp-pillars { display:flex; gap:28px; justify-content:center; flex-wrap:wrap; padding:20px 0; }',
  '.hp-pillar { display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; }',
  '.hp-pillar-dot { width:120px; height:120px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-family:"Orbitron",sans-serif; font-size:10px; letter-spacing:2px; text-align:center; padding:12px; }',
  '.hp-pillar span { font-family:"Orbitron",sans-serif; font-size:11px; letter-spacing:2px; opacity:0.7; text-transform:uppercase; }',
  '.hp-social { display:flex; gap:16px; padding:20px 0; opacity:0.6; }',
  '.hp-social a, .hp-social span { color:#fff; font-size:12px; letter-spacing:2px; text-decoration:none; font-family:"DM Mono",monospace; }',
  '.pillar-hero { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px 60px; text-align:center; gap:16px; }',
  '.pillar-hero h1 { font-family:"Bebas Neue",cursive; font-size:clamp(40px,8vw,72px); letter-spacing:4px; }',
  '.pillar-tagline { font-family:"DM Mono",monospace; font-size:13px; letter-spacing:3px; opacity:0.6; text-transform:uppercase; }',
  '.cta-btn { display:inline-block; padding:12px 32px; border:2px solid currentColor; font-family:"Orbitron",sans-serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; text-decoration:none; margin-top:8px; }',
  '.section { padding:50px 40px; max-width:860px; margin:0 auto; }',
  '.section h2 { font-family:"Bebas Neue",cursive; font-size:34px; letter-spacing:4px; margin-bottom:16px; }',
  '.section p { font-size:14px; line-height:1.8; opacity:0.8; margin-bottom:12px; }',
  '.cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:20px; margin-top:20px; }',
  '.card { border:1px solid rgba(255,255,255,0.12); padding:24px; border-radius:4px; }',
  '.card h3 { font-family:"Orbitron",sans-serif; font-size:13px; letter-spacing:2px; margin-bottom:10px; }',
  '.card p { font-size:13px; line-height:1.7; opacity:0.7; }',
  '.geek-accent { color:#022eeb; }',
  '.kgtv-accent { color:#fdde00; }',
  '.funk-accent { color:#f50000; }',
].join('\n');

// Pass the raw CSS string directly — do NOT wrap in a data URL
CMS.registerPreviewStyle(BASE_CSS, { raw: true });

// ─── Homepage Preview ─────────────────────────────────────────────────────────
function HomepagePreview(props) {
  var entry = props.entry;
  var tagline   = entry.getIn(['data', 'tagline'])          || 'Imagine. Invent. Inspire.';
  var cdLabel   = entry.getIn(['data', 'countdown_label'])  || 'LAUNCHING IN';
  var cdTarget  = entry.getIn(['data', 'countdown_target']) || '';
  var brands    = entry.getIn(['data', 'brands']);
  var brandList = brands ? brands.toJS() : [
    { label: 'G.E.E.K. Radio 305' },
    { label: 'KGTV' },
    { label: 'Fresh As Funk' },
  ];
  var social    = entry.getIn(['data', 'social']);
  var socialObj = social ? social.toJS() : {};

  return h('div', { className: 'preview-wrap' },
    h('div', { className: 'hp-hero' },
      h('div', { className: 'hp-tagline' }, tagline),
      cdTarget && h('div', { className: 'hp-countdown' },
        cdLabel + ' \u00b7 ' + new Date(cdTarget).toLocaleString()
      ),
      h('div', { className: 'hp-pillars' },
        brandList.map(function(b, i) {
          return h('div', { className: 'hp-pillar', key: i },
            h('div', { className: 'hp-pillar-dot' }, b.label || '\u2014'),
            h('span', {}, b.label || '\u2014')
          );
        })
      ),
      h('div', { className: 'hp-social' },
        ['facebook', 'instagram', 'twitter', 'youtube'].map(function(k) {
          var url = socialObj[k];
          return url && url !== '#'
            ? h('a', { key: k, href: url }, k.toUpperCase())
            : h('span', { key: k, style: { opacity: 0.3 } }, k.toUpperCase());
        })
      )
    )
  );
}
CMS.registerPreviewTemplate('homepage', HomepagePreview);

// ─── Generic Pillar Preview factory ──────────────────────────────────────────
function makePillarPreview(accentClass, sectionId) {
  return function PillarPreview(props) {
    var entry      = props.entry;
    var title      = entry.getIn(['data', 'title'])          || '';
    var tagline    = entry.getIn(['data', 'tagline'])        || '';
    var ctaText    = entry.getIn(['data', 'cta_text'])       || '';
    var aboutTitle = entry.getIn(['data', 'about_title'])    || '';
    var aboutBody  = entry.getIn(['data', 'about_body'])     || '';
    var section2   = entry.getIn(['data', 'section2_title']) || '';
    var rawItems   = entry.getIn(['data', 'items']);
    var items      = rawItems ? rawItems.toJS() : [];
    var paras      = aboutBody.split(/\n\n+/).filter(Boolean);

    return h('div', { className: 'preview-wrap' },
      h('div', { className: 'pillar-hero' },
        h('h1', { className: accentClass }, title),
        h('p',  { className: 'pillar-tagline' }, tagline),
        h('span', { className: 'cta-btn ' + accentClass }, ctaText)
      ),
      h('div', { className: 'section', id: sectionId },
        h('h2', { className: accentClass }, aboutTitle),
        paras.map(function(p, i) { return h('p', { key: i }, p); })
      ),
      h('div', { className: 'section' },
        h('h2', { className: accentClass }, section2),
        h('div', { className: 'cards' },
          items.map(function(item, i) {
            return h('div', { className: 'card', key: i },
              h('h3', {}, item.name || '\u2014'),
              h('p',  {}, item.description || '')
            );
          })
        )
      )
    );
  };
}

CMS.registerPreviewTemplate('geek-radio',    makePillarPreview('geek-accent', 'listen'));
CMS.registerPreviewTemplate('kgtv',          makePillarPreview('kgtv-accent', 'watch'));
CMS.registerPreviewTemplate('fresh-as-funk', makePillarPreview('funk-accent', 'explore'));
