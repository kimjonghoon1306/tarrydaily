/* TARRY의 데일리 - 초기화 */

/* ═══════════════════════════════════════════════════
   📡 Service Worker 자동 등록 + sw.js 자동 생성
   tarrydaily.com/feed 또는 /feed.xml 접속 시
   Service Worker가 가로채서 RSS XML 동적 반환
═══════════════════════════════════════════════════ */

// ── RSS XML 생성 함수 (SW에서도 사용 가능한 순수 함수) ──
function generateRSSXML(){
  var siteUrl  = 'https://tarrydaily.com';
  var siteName = localStorage.getItem('tarry_admin_name') || 'TARRY의 데일리';
  var siteDesc = localStorage.getItem('tarry_admin_bio')  || '생활꿀팁, 돈되는정보, IT, 트렌드 — 매일 새로운 정보를 업데이트해요';
  var now      = new Date().toUTCString();

  var allPosts = [];
  try{
    if(typeof CAT_DATA !== 'undefined'){
      CAT_DATA.forEach(function(l1){
        l1.subs.forEach(function(l2){
          l2.items.forEach(function(it){
            allPosts.push({ title:it.title||'', desc:it.desc||'', date:it.date||'', emoji:it.emoji||'📄', id:it.id||'', cat:l1.name||'' });
          });
        });
      });
    }
  }catch(e){}

  var items = allPosts.slice(0,20);
  var esc   = function(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  var xml  = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n';
  xml += '  <channel>\n';
  xml += '    <title>' + esc(siteName) + '</title>\n';
  xml += '    <link>' + siteUrl + '</link>\n';
  xml += '    <description>' + esc(siteDesc) + '</description>\n';
  xml += '    <language>ko</language>\n';
  xml += '    <lastBuildDate>' + now + '</lastBuildDate>\n';
  xml += '    <atom:link href="' + siteUrl + '/feed.xml" rel="self" type="application/rss+xml"/>\n\n';

  items.forEach(function(p, i){
    var postUrl = siteUrl + '#post-' + (p.id || i);
    var pubDate = now;
    try{
      var d = new Date((p.date||'').replace(/(\d{4})\.(\d{1,2})\.(\d{1,2})/,'$1-$2-$3'));
      if(!isNaN(d.getTime())) pubDate = d.toUTCString();
    }catch(e){}
    xml += '    <item>\n';
    xml += '      <title>' + esc(p.emoji + ' ' + p.title) + '</title>\n';
    xml += '      <link>' + postUrl + '</link>\n';
    xml += '      <guid isPermaLink="false">' + postUrl + '</guid>\n';
    xml += '      <description>' + esc(p.desc) + '</description>\n';
    xml += '      <pubDate>' + pubDate + '</pubDate>\n';
    xml += '      <dc:creator>' + esc(siteName) + '</dc:creator>\n';
    xml += '      <category>' + esc(p.cat) + '</category>\n';
    xml += '    </item>\n\n';
  });

  xml += '  </channel>\n</rss>';
  return xml;
}

// ── Service Worker 코드 (문자열) ──
function getSWCode(){
  return `
/* TARRY의 데일리 — RSS Service Worker v1.0 */
const RSS_PATHS = ['/feed', '/feed.xml', '/rss', '/rss.xml', '/atom.xml'];

self.addEventListener('install',  e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  var path = url.pathname.toLowerCase().replace(/\\/+$/, '');

  // /feed, /feed.xml, /rss, /rss.xml, /atom.xml 요청 가로채기
  if(RSS_PATHS.includes(path)){
    event.respondWith(
      self.clients.matchAll({type:'window'}).then(function(clients){
        // 열려 있는 페이지에서 RSS 데이터 요청
        return new Promise(function(resolve){
          var msgChannel = new MessageChannel();
          msgChannel.port1.onmessage = function(ev){
            var xml = ev.data && ev.data.xml ? ev.data.xml : getFallbackXML();
            resolve(new Response(xml, {
              status: 200,
              headers: {
                'Content-Type':  'application/rss+xml; charset=UTF-8',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            }));
          };
          // 타임아웃 (페이지가 없을 때)
          setTimeout(function(){
            resolve(new Response(getFallbackXML(), {
              status: 200,
              headers: {
                'Content-Type':  'application/rss+xml; charset=UTF-8',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            }));
          }, 1500);
          // 열려 있는 첫 번째 페이지에 RSS 데이터 요청
          if(clients.length > 0){
            clients[0].postMessage({ type: 'GET_RSS' }, [msgChannel.port2]);
          } else {
            // 캐시된 RSS 사용
            resolve(new Response(getFallbackXML(), {
              status: 200,
              headers: {
                'Content-Type':  'application/rss+xml; charset=UTF-8',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            }));
          }
        });
      })
    );
  }
});

function getFallbackXML(){
  return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>TARRY의 데일리</title><link>https://tarrydaily.com</link><description>생활꿀팁, 돈되는정보, IT, 트렌드</description><language>ko</language></channel></rss>';
}
`;
}

// ── Service Worker 등록 ──
(function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;

  // sw.js 파일을 Blob URL로 생성해서 등록
  var swCode = getSWCode();
  var blob   = new Blob([swCode], { type: 'application/javascript' });
  var swUrl  = URL.createObjectURL(blob);

  navigator.serviceWorker.register(swUrl, { scope: '/' })
    .then(function(reg){
      console.log('[TARRY RSS] Service Worker 등록 완료:', reg.scope);
    })
    .catch(function(err){
      // Blob URL로 scope '/'가 안 될 경우 → sw.js 파일 방식 안내
      console.warn('[TARRY RSS] SW Blob 등록 실패 (정상):', err.message);
      // sw.js 파일이 있으면 파일 방식으로 등록 시도
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(reg){ console.log('[TARRY RSS] sw.js 등록 완료'); })
        .catch(function(e){ console.warn('[TARRY RSS] sw.js 없음 — 파일 다운로드 방식 사용'); });
    });

  // ── 페이지에서 SW 메시지 수신 (RSS 데이터 반환) ──
  navigator.serviceWorker.addEventListener('message', function(event){
    if(event.data && event.data.type === 'GET_RSS'){
      var xml = generateRSSXML();
      event.ports[0].postMessage({ xml: xml });
    }
  });
})();

// ── sw.js 파일 다운로드 버튼 함수 (RSS 탭에서 호출) ──
function downloadSWFile(){
  var blob = new Blob([getSWCode()], { type: 'application/javascript' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = 'sw.js';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('✅ sw.js 다운로드 완료! Cloudflare Pages에 index.html과 함께 업로드해주세요');
}
// ── Firebase 초기화 (페이지 로드 시) ──
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    try{ initFirebase(); }catch(e){ console.log('Firebase 초기화:', e); }
  }, 500);
});
