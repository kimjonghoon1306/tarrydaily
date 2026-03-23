/* ═══════════════════════════════════════════════════
   TARRY의 데일리 — RSS Service Worker v1.0
   tarrydaily.com/feed, /feed.xml, /rss 접속 시
   열려있는 페이지에서 RSS XML을 동적으로 받아서 반환
═══════════════════════════════════════════════════ */

const RSS_PATHS = ['/feed', '/feed.xml', '/rss', '/rss.xml', '/atom.xml'];
const CACHE_NAME = 'tarry-rss-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  var url  = new URL(event.request.url);
  var path = url.pathname.toLowerCase().replace(/\/+$/, '');

  // /feed, /feed.xml, /rss, /rss.xml, /atom.xml 요청 가로채기
  if (RSS_PATHS.includes(path)) {
    event.respondWith(handleRSSRequest());
  }
});

function handleRSSRequest() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      return new Promise(function(resolve) {

        // 타임아웃 (1.5초 내 응답 없으면 캐시 사용)
        var timer = setTimeout(function() {
          getCachedRSS().then(resolve);
        }, 1500);

        // 열려있는 페이지에 RSS 데이터 요청
        if (clients.length > 0) {
          var channel = new MessageChannel();
          channel.port1.onmessage = function(ev) {
            clearTimeout(timer);
            if (ev.data && ev.data.xml) {
              // 최신 RSS를 캐시에 저장
              cacheRSS(ev.data.xml);
              resolve(makeRSSResponse(ev.data.xml));
            } else {
              getCachedRSS().then(resolve);
            }
          };
          clients[0].postMessage({ type: 'GET_RSS' }, [channel.port2]);
        } else {
          // 페이지가 열려있지 않으면 캐시 사용
          clearTimeout(timer);
          getCachedRSS().then(resolve);
        }
      });
    });
}

function makeRSSResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type':                'application/rss+xml; charset=UTF-8',
      'Cache-Control':               'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options':      'nosniff'
    }
  });
}

// ── RSS 캐시 저장 / 불러오기 ──
function cacheRSS(xml) {
  caches.open(CACHE_NAME).then(function(cache) {
    var res = new Response(xml, {
      headers: { 'Content-Type': 'application/rss+xml; charset=UTF-8' }
    });
    cache.put('/feed.xml', res);
  });
}

function getCachedRSS() {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match('/feed.xml').then(function(cached) {
      if (cached) {
        return cached.text().then(function(xml) {
          return makeRSSResponse(xml);
        });
      }
      return makeRSSResponse(getFallbackXML());
    });
  });
}

function getFallbackXML() {
  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<rss version="2.0">'
    + '<channel>'
    + '<title>TARRY의 데일리</title>'
    + '<link>https://tarrydaily.com</link>'
    + '<description>생활꿀팁, 돈되는정보, IT, 트렌드 — 매일 새로운 정보를 업데이트해요</description>'
    + '<language>ko</language>'
    + '</channel>'
    + '</rss>';
}
