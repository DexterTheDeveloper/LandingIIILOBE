export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  const dataMap = {
    '/geek-radio': '/_data/geek-radio.json',
    '/kgtv': '/_data/kgtv.json',
    '/fresh-as-funk': '/_data/fresh-as-funk.json',
    '/': '/_data/homepage.json',
  };

  const dataFile = dataMap[path];

  const loaderScript = dataFile ? `<script>(function(){
  fetch('${dataFile}').then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    function qs(s){return document.querySelector(s);}
    function qsa(s){return Array.from(document.querySelectorAll(s));}
    if(d.title){var h1=qs('.pillar-hero h1');if(h1)h1.textContent=d.title;document.title=d.title+' | IIIGLOBE';}
    if(d.tagline){var tg=qs('p.tagline');if(tg)tg.textContent=d.tagline;}
    if(d.cta_text){var btn=qs('a.cta-btn');if(btn){btn.textContent=d.cta_text;if(d.cta_url)btn.href=d.cta_url;}}
    var h2s=qsa('main h2,section h2');
    if(d.about_title&&h2s[0])h2s[0].textContent=d.about_title;
    if(d.section2_title&&h2s[1])h2s[1].textContent=d.section2_title;
    if(d.about_body&&h2s[0]){var sec=h2s[0].closest('section')||h2s[0].parentElement;var ps=Array.from(sec.querySelectorAll('p'));var lines=d.about_body.split('\\n\\n');ps.forEach(function(p,i){if(lines[i]!==undefined)p.textContent=lines[i];});}
    if(d.items&&d.items.length){qsa('.card').forEach(function(card,i){if(!d.items[i])return;var h3=card.querySelector('h3');var p=card.querySelector('p');if(h3&&d.items[i].name)h3.textContent=d.items[i].name;if(p&&d.items[i].description)p.textContent=d.items[i].description;});}
    if(d.social){qsa('a[href]').forEach(function(a){var href=a.getAttribute('href')||'';if(href.includes('facebook.com')&&d.social.facebook)a.href=d.social.facebook;else if(href.includes('instagram.com')&&d.social.instagram)a.href=d.social.instagram;else if((href.includes('twitter.com')||href.includes('x.com'))&&d.social.twitter)a.href=d.social.twitter;else if(href.includes('youtube.com')&&d.social.youtube)a.href=d.social.youtube;});}
  });
})();<\/script>` : '';

  class ScriptTextHandler {
    constructor(){this._buf='';}
    text(chunk){
      this._buf+=chunk.text;
      if(chunk.lastInTextNode){
        let out=this._buf;
        out=out.replace(/\{length:\s*110\}/g,'{length:280}');
        out=out.replace(/Math\.random\(\)\*1\.8\+0\.4/g,'Math.random()*3+0.6');
        out=out.replace(/\{length:\s*55\}/g,'{length:180}');
        out=out.replace(/Math\.random\(\) \* 2\.5 \+ 0\.5/g,'Math.random() * 3.5 + 0.8');
        chunk.replace(out);
        this._buf='';
      } else { chunk.remove(); }
    }
  }

  return new HTMLRewriter()
    .on('script', new ScriptTextHandler())
    .on('body', {element(el){if(loaderScript)el.append(loaderScript,{html:true});}})
    .transform(response);
}
