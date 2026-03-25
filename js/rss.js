/* TARRY의 데일리 - rss.js */

// ── toggleTarryguide ──
function toggleTarryguide(){
  var connected = localStorage.getItem('tarry_rss_tarryguide') !== 'off';
  if(connected){
    if(!confirm('tarryguide.com 연결을 해제할까요?\n이미 가져온 글은 유지됩니다.')) return;
    localStorage.setItem('tarry_rss_tarryguide','off');
    toast('🔌 tarryguide.com 연결이 해제됐어요');
  } else {
    localStorage.setItem('tarry_rss_tarryguide','on');
    toast('✅ tarryguide.com 연결됐어요!');
  }
  renderTarryguideStatus();
}

// ── renderTarryguideStatus ──
function renderTarryguideStatus(){
  var connected = localStorage.getItem('tarry_rss_tarryguide') !== 'off';
  var statusEl  = document.getElementById('tarryguideStatus');
  var toggleBtn = document.getElementById('tarryguideToggleBtn');
  var actionsEl = document.getElementById('tarryguideActions');
  var cardEl    = document.getElementById('tarryguideCard');

  if(connected){
    if(statusEl){
      statusEl.textContent='● 연결됨';
      statusEl.style.cssText='font-size:10px;padding:4px 10px;border-radius:999px;font-weight:700;background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3)';
    }
    if(toggleBtn){ toggleBtn.textContent='🔌 연결 해제'; toggleBtn.style.cssText='background:rgba(220,38,38,.1);color:#dc2626;border:1px solid rgba(220,38,38,.25);border-radius:8px;padding:6px 11px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap'; }
    if(actionsEl) actionsEl.style.display='grid';
    if(cardEl) cardEl.style.borderColor='rgba(16,185,129,.25)';
  } else {
    if(statusEl){
      statusEl.textContent='○ 연결 안됨';
      statusEl.style.cssText='font-size:10px;padding:4px 10px;border-radius:999px;font-weight:700;background:rgba(107,114,128,.12);color:var(--mt);border:1px solid rgba(107,114,128,.25)';
    }
    if(toggleBtn){ toggleBtn.textContent='🔗 다시 연결'; toggleBtn.style.cssText='background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.3);border-radius:8px;padding:6px 11px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap'; }
    if(actionsEl) actionsEl.style.display='none';
    if(cardEl) cardEl.style.borderColor='rgba(107,114,128,.2)';
  }
}

// ── addRss2 ──
function addRss2(){
  var name = (document.getElementById('rssName2')?.value||'').trim();
  var url  = (document.getElementById('rssUrl2')?.value||'').trim();
  if(!name){ toast('사이트 이름을 입력해주세요'); return; }
  if(!url)  { toast('RSS URL을 입력해주세요'); return; }
  if(!url.startsWith('http')){ toast('URL은 http:// 또는 https://로 시작해야 해요'); return; }

  var sites = getRssSites();
  // 중복 체크
  if(sites.find(function(s){ return s.url===url; })){
    toast('이미 등록된 URL이에요'); return;
  }
  sites.push({ id: 'rss_'+Date.now(), name:name, url:url, connected:true, addedDate:new Date().toLocaleDateString('ko-KR') });
  saveRssSites(sites);
  document.getElementById('rssName2').value='';
  document.getElementById('rssUrl2').value='';
  renderRssSiteList();
  toast('✅ "'+name+'" 사이트가 추가됐어요!');
}

// ── toggleRssSite ──
function toggleRssSite(id){
  var sites = getRssSites();
  var site  = sites.find(function(s){ return s.id===id; });
  if(!site) return;
  site.connected = !site.connected;
  saveRssSites(sites);
  renderRssSiteList();
  toast(site.connected ? '✅ "'+site.name+'" 연결됐어요!' : '🔌 "'+site.name+'" 연결이 해제됐어요');
}

// ── removeRssSite ──
function removeRssSite(id){
  var sites = getRssSites();
  var site  = sites.find(function(s){ return s.id===id; });
  if(!site) return;
  if(!confirm('"'+site.name+'" 사이트를 삭제할까요?')) return;
  saveRssSites(sites.filter(function(s){ return s.id!==id; }));
  renderRssSiteList();
  toast('🗑️ "'+site.name+'" 삭제됐어요');
}

// ── syncRssSite ──
async function syncRssSite(id){
  var sites = getRssSites();
  var site  = sites.find(function(s){ return s.id===id; });
  if(!site){ toast('사이트를 찾을 수 없어요'); return; }
  toast('🔄 "'+site.name+'" 동기화 중...');
  try{
    var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(site.url)+'';
    var ctrl   = new AbortController();
    setTimeout(function(){ ctrl.abort(); }, 8000);
    var res    = await fetch(apiUrl, {signal:ctrl.signal});
    var data   = await res.json();
    if(data.status==='ok' && data.items && data.items.length){
      var newsCat = CAT_DATA.find(function(c){ return c.id==='news'; });
      if(newsCat && newsCat.subs[0]){
        var today = new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
        var newPosts = data.items.slice(0,10).map(function(item, i){
          return { id:'rss_'+id+'_'+Date.now()+'_'+i, title:item.title||'', desc:(item.description||'').replace(/<[^>]+>/g,'').substring(0,80), date:today, read:'4분', emoji:'📰' };
        });
        newsCat.subs[0].items = newPosts.concat(newsCat.subs[0].items).slice(0,30);
      }
      try{ buildCatTree(); }catch(e){}
      toast('✅ "'+site.name+'" '+data.items.length+'개 글 가져왔어요!');
    } else {
      toast('⚠️ "'+site.name+'" — RSS를 가져올 수 없어요. URL을 확인해주세요');
    }
  } catch(e){
    toast('❌ "'+site.name+'" 연결 실패. URL을 다시 확인해주세요');
  }
}

// ── renderRssSiteList ──
function renderRssSiteList(){
  var sites   = getRssSites();
  var listEl  = document.getElementById('rssSiteList');
  var countEl = document.getElementById('rssSiteCount');
  if(countEl) countEl.textContent = sites.length+'개';
  if(!listEl) return;

  if(!sites.length){
    listEl.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--mt);font-size:12px"><div style="font-size:24px;margin-bottom:6px">📭</div>아직 추가된 RSS 소스가 없어요</div>';
    return;
  }

  listEl.innerHTML = sites.map(function(site){
    var connected = site.connected !== false;
    return '<div style="background:var(--sur);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:8px">'
      // 상단: 아이콘 + 이름 + 상태
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
        +'<div style="width:36px;height:36px;border-radius:9px;background:'+(connected?'rgba(16,185,129,.15)':'var(--sur2)')+';border:1px solid '+(connected?'rgba(16,185,129,.3)':'var(--bd)')+';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">📡</div>'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-size:13px;font-weight:700;color:var(--tx)">'+site.name+'</div>'
          +'<div style="font-size:10px;color:var(--mt);font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+site.url.substring(0,45)+(site.url.length>45?'...':'')+'</div>'
        +'</div>'
        +'<span style="font-size:10px;padding:3px 9px;border-radius:999px;font-weight:700;flex-shrink:0;'
          +(connected?'background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25)':'background:var(--sur3);color:var(--mt);border:1px solid var(--bd)')+'">'
          +(connected?'● 연결됨':'○ 해제됨')
        +'</span>'
      +'</div>'
      // 버튼들
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
        +(connected?'<button onclick="syncRssSite(\''+site.id+'\')" style="flex:1;background:var(--grad);color:#fff;border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">🔄 동기화</button>':'')
        +'<button onclick="toggleRssSite(\''+site.id+'\')" style="flex:1;background:'+(connected?'rgba(220,38,38,.08)':'rgba(16,185,129,.1)')+';color:'+(connected?'#dc2626':'#059669')+';border:1px solid '+(connected?'rgba(220,38,38,.2)':'rgba(16,185,129,.25)')+';border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">'
          +(connected?'🔌 연결 해제':'🔗 다시 연결')
        +'</button>'
        +'<button onclick="removeRssSite(\''+site.id+'\')" style="background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2);border-radius:8px;padding:8px 11px;font-size:11px;cursor:pointer;font-family:var(--font)">🗑️</button>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--mt);margin-top:8px;text-align:right">추가일: '+site.addedDate+'</div>'
    +'</div>';
  }).join('');
}

// ── getRssSites ──
function getRssSites(){
  try{ return JSON.parse(localStorage.getItem('tarry_rss_sites')||'[]'); }catch(e){ return []; }
}

// ── saveRssSites ──
function saveRssSites(sites){
  try{ localStorage.setItem('tarry_rss_sites', JSON.stringify(sites)); }catch(e){}
}

// ── initRssTab ──
function initRssTab(){
  renderTarryguideStatus();
  renderRssSiteList();
}

// ── loadTarryGuideRSS ──
async function loadTarryGuideRSS(){
  const btn=document.getElementById('rssLoadBtn');
  const list=document.getElementById('rssFeedList');
  const box=document.getElementById('rssProgressBox');
  const bar=document.getElementById('rssProgressBar');
  const pct=document.getElementById('rssProgressPct');
  const txt=document.getElementById('rssProgressText');
  const sub=document.getElementById('rssProgressSub');
  const prog=(p,t,s)=>{if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(txt)txt.textContent=t;if(sub)sub.textContent=s;};
  if(btn){btn.disabled=true;btn.textContent='🔄 동기화 중...';}
  if(box)box.style.display='block';
  if(list)list.innerHTML='';
  prog(5,'연결 시도 중...','tarryguide.com 접속');
  toast('🔄 tarryguide.com 연동 시작!');
  let posts=[];
  // 워드프레스 REST API 먼저 시도 (CORS 우회 없이 직접 접근 가능)
  try{
    prog(10,'워드프레스 API 시도...','직접 연결 시도');
    const wpRes=await fetch('https://tarryguide.com/wp-json/wp/v2/posts?per_page=15&_fields=id,title,excerpt,link,date,featured_media,_embedded',{signal:AbortSignal.timeout(8000)});
    if(wpRes.ok){
      const wpPosts=await wpRes.json();
      if(Array.isArray(wpPosts)&&wpPosts.length){
        posts=wpPosts.map(p=>({
          title:p.title?.rendered?.replace(/<[^>]+>/g,'')||'',
          link:p.link||'',
          pubDate:p.date||'',
          thumbnail:'',
          description:(p.excerpt?.rendered||'').replace(/<[^>]+>/g,'').substring(0,200),
          content:(p.excerpt?.rendered||'')
        }));
        prog(80,'WordPress API 성공!',posts.length+'개 글 발견');
      }
    }
  }catch(e){}
  
  const proxies=[
    'https://api.rss2json.com/v1/api.json?rss_url=https://tarryguide.com/feed',
    'https://api.rss2json.com/v1/api.json?rss_url=https://tarryguide.com/rss',
    'https://api.rss2json.com/v1/api.json?rss_url=https://tarryguide.com/rss.xml',
    'https://api.rss2json.com/v1/api.json?rss_url=https://tarryguide.com/atom.xml',
  ];
  prog(15,'RSS 피드 탐색 중...','여러 경로를 시도해요');
  for(const url of proxies){
    if(posts.length)break;
    try{
      const r=await fetch(url,{signal:AbortSignal.timeout(6000)});
      const d=await r.json();
      if(d.status==='ok'&&d.items?.length){posts=d.items;break;}
    }catch(e){}
  }
  // corsproxy 시도
  if(!posts.length){
    prog(35,'직접 연결 시도 중...','corsproxy 서버 이용');
    const feedUrls=['https://tarryguide.com/feed','https://tarryguide.com/rss','https://tarryguide.com/rss.xml'];
    for(const feedUrl of feedUrls){
      if(posts.length)break;
      try{
        const r=await fetch('https://corsproxy.io/?'+feedUrl,{signal:AbortSignal.timeout(8000)});
        const xml=await r.text();
        if(!xml.includes('<item')&&!xml.includes('<entry'))continue;
        const doc=new DOMParser().parseFromString(xml,'text/xml');
        const items=doc.querySelectorAll('item,entry');
        if(!items.length)continue;
        items.forEach(item=>{
          const enc=item.querySelector('enclosure');
          const imgMatch=(item.querySelector('description,summary')?.textContent||'').match(/<img[^>]+src="([^"]+)"/)||[];
          const contentText=item.querySelector('content,encoded,description,summary')?.textContent||'';
          posts.push({
            title:item.querySelector('title')?.textContent?.trim()||'',
            link:item.querySelector('link')?.textContent?.trim()||item.querySelector('link')?.getAttribute('href')||'',
            pubDate:item.querySelector('pubDate,published,updated')?.textContent||'',
            thumbnail:enc?enc.getAttribute('url'):(imgMatch[1]||''),
            description:contentText.replace(/<[^>]+>/g,'').substring(0,200),
            content:contentText
          });
        });
      }catch(e){}
    }
  }
  // sitemap.xml 방식으로 링크만 가져오기
  if(!posts.length){
    prog(55,'사이트맵 탐색 중...','sitemap.xml 시도');
    try{
      const r=await fetch('https://corsproxy.io/?https://tarryguide.com/sitemap.xml',{signal:AbortSignal.timeout(8000)});
      const xml=await r.text();
      const doc=new DOMParser().parseFromString(xml,'text/xml');
      const urls=Array.from(doc.querySelectorAll('url loc')).map(el=>el.textContent?.trim()).filter(u=>u&&u.includes('tarryguide.com')&&!u.endsWith('.xml'));
      urls.slice(0,15).forEach((url,i)=>{
        const slug=url.split('/').filter(Boolean).pop()||'글 '+i;
        const title=slug.replace(/-/g,' ').replace(/\w/g,c=>c.toUpperCase());
        posts.push({title,link:url,pubDate:'',thumbnail:'',description:'tarryguide.com의 글이에요',content:''});
      });
    }catch(e){}
  }
  prog(80,'목록 표시 중...','가져온 글을 정리해요');
  if(!posts.length){
    if(box)box.style.display='none';
    if(list)list.innerHTML=`
      <div style="text-align:center;padding:2rem;color:var(--mt)">
        <div style="font-size:36px;margin-bottom:10px">😔</div>
        <div style="font-size:14px;font-weight:700;color:var(--tx);margin-bottom:8px">RSS를 가져올 수 없어요</div>
        <div style="font-size:12px;color:var(--mt);line-height:2;background:var(--sur2);border-radius:10px;padding:12px;text-align:left;margin-top:10px">
          <strong style="color:var(--tx)">tarryguide.com 설정 방법:</strong><br>
          1. tarryguide.com 관리자 페이지 접속<br>
          2. 설정 → 읽기 → RSS 피드 활성화<br>
          3. 또는 워드프레스라면: 설정 → 읽기 → RSS 항목 수 설정<br>
          4. 설정 후 다시 동기화 버튼을 눌러주세요
        </div>
      </div>`;
    if(btn){btn.disabled=false;btn.textContent='🔄 다시 시도';}
    toast('❌ RSS 연결 실패. tarryguide.com 설정을 확인해주세요');
    return;
  }
  window._rssPosts=posts;
  prog(100,'완료!',posts.length+'개 글 불러옴');
  await new Promise(r=>setTimeout(r,400));
  if(box)box.style.display='none';
  if(btn){btn.disabled=false;btn.textContent='🔄 지금 동기화';}

  // 각 글마다 고유 AI 이미지 미리 생성
  const seed = Date.now();
  const postsWithImg = posts.slice(0,15).map((p,i)=>{
    const kw = encodeURIComponent((p.title||'blog')+' modern minimal thumbnail');
    const aiImg = `https://image.pollinations.ai/prompt/${kw}?width=400&height=250&nologo=1&seed=${seed+i*77}`;
    return {...p, aiPreviewImg: aiImg};
  });
  window._rssPosts = postsWithImg;

  if(list) list.innerHTML=`
    <!-- 헤더 -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div style="background:rgba(16,185,129,.12);color:#059669;border:1.5px solid rgba(16,185,129,.3);border-radius:999px;padding:6px 14px;font-size:12px;font-weight:800">
        ✅ ${postsWithImg.length}개 글 발견
      </div>
      <div style="display:flex;gap:7px;align-items:center">
        <!-- 뷰 토글 -->
        <div style="display:flex;background:var(--sur2);border-radius:9px;padding:3px;gap:2px;border:1px solid var(--bd)">
          <button id="rss-view-card" onclick="setRssView('card')" title="카드형" style="background:var(--grad);color:#fff;border:none;border-radius:7px;padding:6px 10px;font-size:14px;cursor:pointer;transition:.2s">⊞</button>
          <button id="rss-view-list" onclick="setRssView('list')" title="목록형" style="background:transparent;color:var(--mt);border:none;border-radius:7px;padding:6px 10px;font-size:14px;cursor:pointer;transition:.2s">☰</button>
        </div>
        <button onclick="rssImportAll()" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:9px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">📥 전체 등록</button>
        <button onclick="rssAIRewriteAll()" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border:none;border-radius:9px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">✨ AI 전체 재작성</button>
      </div>
    </div>

    <!-- 전체 진행 바 (AI 재작성 시 표시) -->
    <div id="rssAllProgress" style="display:none;background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05));border:1.5px solid var(--bd2);border-radius:14px;padding:16px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="font-size:20px">🤖</div>
        <div style="flex:1">
          <div id="rssAllProgressMsg" style="font-size:13px;font-weight:700;color:var(--tx);margin-bottom:2px">AI 재작성 준비 중...</div>
          <div id="rssAllProgressSub" style="font-size:11px;color:var(--mt)">잠시만 기다려주세요</div>
        </div>
        <div id="rssAllProgressPct" style="font-size:16px;font-weight:800;color:var(--ac)">0%</div>
      </div>
      <div style="background:var(--sur3);border-radius:999px;height:10px;overflow:hidden">
        <div id="rssAllProgressBar" style="background:var(--grad);height:10px;border-radius:999px;width:0%;transition:width .4s ease"></div>
      </div>
    </div>

    <!-- 글 카드 목록 -->
    <div id="rssCardGrid" style="display:flex;flex-direction:column;gap:12px">
      ${postsWithImg.map((p,i)=>{
        const date = p.pubDate ? new Date(p.pubDate).toLocaleDateString('ko-KR') : '';
        const desc = (p.description||'').substring(0,120);
        const isRegistered = registeredTitles.has(p.title);
        const badgeStyle = isRegistered
          ? 'background:rgba(5,150,105,.85)'
          : 'background:rgba(0,0,0,.55)';
        const badgeText = isRegistered ? '✅ 등록됨' : '⏳ 대기 중';
        return `
        <div id="rss-card-${i}" style="background:var(--sur);border:1.5px solid ${isRegistered?'rgba(5,150,105,.3)':'var(--bd)'};border-radius:16px;overflow:hidden;transition:.2s;box-shadow:0 2px 10px rgba(0,0,0,.05)" onmouseover="this.style.borderColor='var(--ac)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(124,58,237,.12)'" onmouseout="this.style.borderColor='${isRegistered?'rgba(5,150,105,.3)':'var(--bd)'}';this.style.transform='';this.style.boxShadow='0 2px 10px rgba(0,0,0,.05)'">

          <!-- 이미지 -->
          <div style="position:relative;height:160px;overflow:hidden;background:var(--sur2);cursor:pointer" onclick="rssPreviewPost(${i})">
            <img id="rss-img-${i}" src="${p.aiPreviewImg}" style="width:100%;height:100%;object-fit:cover;transition:all .5s ease" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80'" loading="lazy">
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;transition:.2s;opacity:0" onmouseover="this.style.opacity='1';this.style.background='rgba(0,0,0,.4)'" onmouseout="this.style.opacity='0';this.style.background='rgba(0,0,0,0)'">
              <div style="background:rgba(255,255,255,.92);border-radius:999px;padding:8px 18px;font-size:12px;font-weight:700;color:var(--ac)">👁️ 미리보기 클릭</div>
            </div>
            <div id="rss-badge-${i}" style="position:absolute;top:10px;right:10px;${badgeStyle};backdrop-filter:blur(6px);color:#fff;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:700">${badgeText}</div>
            ${p.catName?`<div style="position:absolute;top:10px;left:10px;background:rgba(124,58,237,.85);backdrop-filter:blur(6px);color:#fff;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:700">${p.catIcon||'📄'} ${p.catName}</div>`:''}
            ${date?`<div style="position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:600">${date}</div>`:''}
          </div>

          <!-- 내용 -->
          <div style="padding:14px">
            <div onclick="rssPreviewPost(${i})" style="cursor:pointer;font-size:14px;font-weight:800;color:var(--tx);margin-bottom:6px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.title||''}</div>
            <div style="font-size:12px;color:var(--mt);line-height:1.7;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${desc}</div>

            <!-- 진행 바 -->
            <div id="rss-prog-${i}" style="display:none;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span id="rss-prog-msg-${i}" style="font-size:11px;color:var(--ac);font-weight:600">AI 재작성 중...</span>
                <span id="rss-prog-pct-${i}" style="font-size:11px;color:var(--mt)">0%</span>
              </div>
              <div style="background:var(--sur3);border-radius:999px;height:6px;overflow:hidden">
                <div id="rss-prog-bar-${i}" style="background:var(--grad);height:6px;border-radius:999px;width:0%;transition:width .3s ease"></div>
              </div>
            </div>

            <!-- 버튼 -->
            ${isRegistered
              ? `<div style="background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.2);border-radius:9px;padding:9px;text-align:center;font-size:12px;font-weight:700;color:#059669">✅ 이미 등록된 글이에요</div>`
              : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
                  <button id="rss-btn-reg-${i}" onclick="rssSingleImport(${i})" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:9px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">📥 가져오기</button>
                  <button id="rss-btn-ai-${i}" onclick="rssSingleAIRewrite(${i})" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border:none;border-radius:9px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">✨ AI 재작성</button>
                </div>`
            }
            ${p.link?`<a href="${p.link}" target="_blank" style="display:block;text-align:center;margin-top:7px;font-size:11px;color:var(--mt);text-decoration:none">🔗 원문 보기</a>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
  toast('✅ '+postsWithImg.length+'개 글 발견! 원하는 글만 선택해서 등록하세요');
}

// ── getLocalPosts ──
function getLocalPosts(){
  const posts = [];
  try{
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        l2.items.forEach(function(it){
          const content = POST_CONTENTS[it.id];
          posts.push({
            title:       it.title||'',
            description: it.desc||'',
            link:        'https://tarrydaily.com#'+it.id,
            pubDate:     it.date||'',
            thumbnail:   content?.img||it.img||''
          });
        });
      });
    });
  }catch(e){}
  return posts;
}

// ── rssSingleImport ──
function rssSingleImport(i){
  const posts = window._rssPosts;
  if(!posts||!posts[i]) return;
  const p = posts[i];
  _rssRegisterPost(p, i, false, null);
  // 배지 업데이트
  var badge = document.getElementById('rss-badge-'+i);
  var btnReg = document.getElementById('rss-btn-reg-'+i);
  var btnAI  = document.getElementById('rss-btn-ai-'+i);
  if(badge){ badge.textContent='✅ 등록됨'; badge.style.background='rgba(5,150,105,.8)'; }
  if(btnReg){ btnReg.textContent='✅ 등록됨'; btnReg.disabled=true; btnReg.style.opacity='.6'; }
  if(btnAI){  btnAI.disabled=true; btnAI.style.opacity='.6'; }
  toast('📥 "'+p.title.substring(0,20)+'..." 등록됐어요!');
}

// ⚠️ rssSingleAIRewrite - 추출 실패

// ── rssAIRewriteAll ──
async function rssAIRewriteAll(){
  const posts = window._rssPosts;
  if(!posts?.length){ toast('먼저 동기화해주세요'); return; }

  var allProg    = document.getElementById('rssAllProgress');
  var allProgMsg = document.getElementById('rssAllProgressMsg');
  var allProgSub = document.getElementById('rssAllProgressSub');
  var allProgPct = document.getElementById('rssAllProgressPct');
  var allProgBar = document.getElementById('rssAllProgressBar');
  if(allProg) allProg.style.display='block';

  for(let i=0; i<posts.length; i++){
    const pct = Math.round((i/posts.length)*100);
    if(allProgMsg) allProgMsg.textContent = `(${i+1}/${posts.length}) "${posts[i].title.substring(0,20)}..." 재작성 중`;
    if(allProgSub) allProgSub.textContent = '완료: '+i+'개 / 남음: '+(posts.length-i)+'개';
    if(allProgPct) allProgPct.textContent = pct+'%';
    if(allProgBar) allProgBar.style.width = pct+'%';
    await rssSingleAIRewrite(i);
    await new Promise(r=>setTimeout(r,600));
  }

  if(allProgMsg) allProgMsg.textContent = '🎉 전체 AI 재작성 완료!';
  if(allProgPct) allProgPct.textContent = '100%';
  if(allProgBar) allProgBar.style.width = '100%';
  await new Promise(r=>setTimeout(r,1500));
  if(allProg) allProg.style.display='none';
  toast('🎉 전체 AI 재작성 완료! 카테고리에서 확인하세요');
}

// ── rssImportAll ──
function rssImportAll(){
  const posts = window._rssPosts;
  if(!posts?.length){ toast('먼저 동기화해주세요'); return; }
  posts.forEach((p,i)=>{ rssSingleImport(i); });
  toast('📥 '+posts.length+'개 글 전체 등록 완료!');
}

// ── _rssRegisterPost ──
function _rssRegisterPost(p, i, isAI, aiData){
  let targetL1 = CAT_DATA.find(c=>c.id==='news') || CAT_DATA[0];
  let targetL2 = targetL1?.subs?.[0];
  if(!targetL1||!targetL2) return;

  const today  = new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  const postId = 'rss_'+(Date.now())+'_'+i;
  const img    = aiData?.img || p.aiPreviewImg || p.thumbnail || '';

  if(isAI && aiData?.body){
    POST_CONTENTS[postId] = { img: img, body: aiData.body, rawBody: '' };
  } else {
    POST_CONTENTS[postId] = { img: img, body: `<img src="${img}" style="width:100%;border-radius:14px;margin-bottom:1.5rem" onerror="this.style.display='none'"><p style="font-size:15px;line-height:2;color:var(--mt)">${p.description||''}</p>${p.link?`<a href="${p.link}" target="_blank" style="color:var(--ac)">🔗 원문 보기</a>`:''}`, rawBody: '' };
  }

  // 중복 체크
  const exists = targetL2.items.find(it=>it.title===p.title);
  if(exists) return;

  targetL2.items.unshift({
    id:    postId,
    title: p.title,
    desc:  (p.description||'').substring(0,100),
    date:  p.pubDate ? new Date(p.pubDate).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'}) : today,
    read:  isAI ? '5분' : '3분',
    emoji: '📰',
    img:   img
  });
  targetL2.items = targetL2.items.slice(0,50);
  try{ buildCatTree(); }catch(e){}
  try{ renderPosts(); }catch(e){}
  // localStorage에 자동 저장
  try{ savePostsToStorage(); }catch(e){}
}

// ── loadAndRewriteAll ──
async function loadAndRewriteAll(){
  await rssAIRewriteAll();
}

// ── autoSyncRSS ──
function autoSyncRSS(){
  // RSS 탭 열릴 때 UI 복원만 (자동 fetch 제거)
  restoreAutoSyncSettings();
  updateLastSyncTime();
}

// ── loadTarryGuideRSSFiles ──
function loadTarryGuideRSSFiles(){
  switchTab('rss');
  setTimeout(function(){ loadTarryGuideRSS(); }, 300);
}

// ── loadCustomRSS ──
async function loadCustomRSS(feedUrl, siteId){
  const list = document.getElementById('rssFeedList');
  const box  = document.getElementById('rssProgressBox');
  const bar  = document.getElementById('rssProgressBar');
  const pct  = document.getElementById('rssProgressPct');
  const txt  = document.getElementById('rssProgressText');
  const sub  = document.getElementById('rssProgressSub');
  const prog = (p,t,s)=>{ if(bar)bar.style.width=p+'%'; if(pct)pct.textContent=p+'%'; if(txt)txt.textContent=t; if(sub)sub.textContent=s; };

  if(box) box.style.display='block';
  if(list) list.innerHTML='';
  prog(10,'글 목록 읽는 중...','사이트 데이터 확인');
  toast('🔄 동기화 시작!');
  await new Promise(r=>setTimeout(r,400));
  prog(50,'글 목록 정리 중...','');

  // 현재 사이트 등록 글 직접 읽기
  const posts=[], seen=new Set();
  try{
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        l2.items.forEach(function(it){
          if(seen.has(it.title))return;
          seen.add(it.title);
          const content=POST_CONTENTS[it.id];
          const seed=Math.abs((it.id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))+1;
          const aiImg='https://image.pollinations.ai/prompt/'+encodeURIComponent((it.title||'blog'))+' blog thumbnail minimal?width=400&height=250&nologo=1&seed='+seed;
          posts.push({
            title:it.title||'',
            description:it.desc||'',
            link:'https://tarrydaily.com#'+it.id,
            pubDate:it.date||'',
            thumbnail:content?.img||it.img||aiImg,
            catName:l1.name||'',
            catIcon:l1.icon||'📄',
            id:it.id
          });
        });
      });
    });
  }catch(e){}

  prog(90,'완료!',posts.length+'개 글 발견');
  await new Promise(r=>setTimeout(r,300));
  if(box) box.style.display='none';

  var btn=document.getElementById('manualSyncBtn');
  var badge=document.getElementById('syncStatusBadge');

  if(!posts.length){
    if(list) list.innerHTML='<div style="text-align:center;padding:2.5rem;color:var(--mt)"><div style="font-size:44px;margin-bottom:12px">📭</div><div style="font-size:15px;font-weight:800;color:var(--tx);margin-bottom:8px">등록된 글이 없어요</div><div style="font-size:12px;color:var(--mt);line-height:2;background:var(--sur2);border-radius:12px;padding:14px;margin-top:8px">글쓰기 탭에서 새 글을 작성하거나<br>뉴스 수집 탭에서 AI 자동 수집을 해주세요</div><button onclick="switchTab(\'write\')" style="margin-top:14px;background:var(--grad);color:#fff;border:none;border-radius:10px;padding:11px 24px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">✍️ 글쓰기 탭 열기</button></div>';
    if(btn){btn.disabled=false;btn.innerHTML='<span style="font-size:20px">🔄</span> 지금 바로 동기화';}
    if(badge){badge.textContent='● 글 없음';badge.style.background='rgba(220,38,38,.12)';badge.style.color='#dc2626';badge.style.borderColor='rgba(220,38,38,.25)';}
    toast('ℹ️ 등록된 글이 없어요');
    return;
  }

  window._rssPosts=posts;
  if(list) list.innerHTML=renderRSSCards(posts, _rssCurrentView||'card');
  if(btn){btn.disabled=false;btn.innerHTML='<span style="font-size:20px">🔄</span> 지금 바로 동기화';}
  if(badge){badge.textContent='● '+posts.length+'개 완료';badge.style.background='rgba(5,150,105,.15)';badge.style.color='#059669';badge.style.borderColor='rgba(5,150,105,.3)';}
  toast('✅ '+posts.length+'개 글 발견!');
}

// ── renderRSSCards ──
function renderRSSCards(posts, view){
  var isCard=view!=='list';
  return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">'
    +'<div style="background:rgba(16,185,129,.12);color:#059669;border:1.5px solid rgba(16,185,129,.3);border-radius:999px;padding:6px 14px;font-size:12px;font-weight:800">✅ '+posts.length+'개 글</div>'
    +'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
    +'<div style="display:flex;background:var(--sur2);border-radius:9px;padding:3px;gap:2px;border:1px solid var(--bd)">'
    +'<button id="rss-view-card" onclick="switchRssView(\'card\')" style="background:'+(isCard?'var(--grad)':'transparent')+';color:'+(isCard?'#fff':'var(--mt)')+';border:none;border-radius:7px;padding:6px 12px;font-size:12px;cursor:pointer;font-weight:700">⊞ 크게</button>'
    +'<button id="rss-view-list" onclick="switchRssView(\'list\')" style="background:'+(!isCard?'var(--grad)':'transparent')+';color:'+(!isCard?'#fff':'var(--mt)')+';border:none;border-radius:7px;padding:6px 12px;font-size:12px;cursor:pointer;font-weight:700">☰ 작게</button>'
    +'</div>'
    +'<button onclick="rssImportAll()" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:9px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">📥 전체 등록</button>'
    +'<button onclick="rssAIRewriteAll()" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border:none;border-radius:9px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">✨ AI 전체</button>'
    +'</div></div>'
    +'<div id="rssAllProgress" style="display:none;background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05));border:1.5px solid var(--bd2);border-radius:14px;padding:16px;margin-bottom:14px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="font-size:20px">🤖</div><div style="flex:1"><div id="rssAllProgressMsg" style="font-size:13px;font-weight:700;color:var(--tx);margin-bottom:2px">AI 재작성 준비 중...</div><div id="rssAllProgressSub" style="font-size:11px;color:var(--mt)">잠시만 기다려주세요</div></div><div id="rssAllProgressPct" style="font-size:16px;font-weight:800;color:var(--ac)">0%</div></div><div style="background:var(--sur3);border-radius:999px;height:10px;overflow:hidden"><div id="rssAllProgressBar" style="background:var(--grad);height:10px;border-radius:999px;width:0%;transition:width .4s ease"></div></div></div>'
    +'<div id="rssCardGrid">'+(isCard?renderCardView(posts):renderListView(posts))+'</div>';
}

// ── _rssCardHtml ──
function _rssCardHtml(p, i, mode){
  // 따옴표 충돌 없이 DOM 방식으로 생성
  var isCard = mode !== 'list';
  var wrap = document.createElement('div');
  wrap.id = 'rss-card-'+i;
  wrap.style.cssText = isCard
    ? 'background:var(--sur);border:1.5px solid var(--bd);border-radius:16px;overflow:hidden;transition:.2s;display:flex;flex-direction:column'
    : 'background:var(--sur);border:1.5px solid var(--bd);border-radius:12px;overflow:hidden;transition:.2s;display:flex;align-items:stretch;min-height:80px';
  wrap.onmouseover = function(){ this.style.borderColor='var(--ac)'; if(isCard) this.style.transform='translateY(-2px)'; };
  wrap.onmouseout  = function(){ this.style.borderColor='var(--bd)'; if(isCard) this.style.transform=''; };

  // 이미지 영역
  var imgWrap = document.createElement('div');
  imgWrap.style.cssText = isCard
    ? 'position:relative;height:150px;overflow:hidden;background:var(--sur2);cursor:pointer;flex-shrink:0'
    : 'width:80px;min-width:80px;overflow:hidden;background:var(--sur2);cursor:pointer;position:relative;flex-shrink:0';
  imgWrap.onclick = function(){ rssPreviewPost(i); };

  var img = document.createElement('img');
  img.id = 'rss-img-'+i;
  img.src = p.thumbnail||'';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;transition:all .5s ease';
  img.loading = 'lazy';
  img.onerror = function(){
    this.style.display='none';
    imgWrap.style.display='flex';
    imgWrap.style.alignItems='center';
    imgWrap.style.justifyContent='center';
    imgWrap.style.fontSize= isCard?'36px':'28px';
    imgWrap.textContent = p.catIcon||'📄';
  };

  var badge = document.createElement('div');
  badge.id = 'rss-badge-'+i;
  badge.style.cssText = isCard
    ? 'position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);color:#fff;border-radius:999px;padding:3px 9px;font-size:10px;font-weight:700'
    : 'position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border-radius:4px;padding:2px 5px;font-size:8px;font-weight:700';
  badge.textContent = '⏳ 대기';

  imgWrap.appendChild(img);
  imgWrap.appendChild(badge);

  if(isCard && p.catIcon){
    var catBadge = document.createElement('div');
    catBadge.style.cssText = 'position:absolute;top:8px;left:8px;background:rgba(0,0,0,.5);color:#fff;border-radius:999px;padding:3px 9px;font-size:10px';
    catBadge.textContent = p.catIcon;
    imgWrap.appendChild(catBadge);
  }
  if(isCard && p.pubDate){
    var dateBadge = document.createElement('div');
    dateBadge.style.cssText = 'position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,.55);color:#fff;border-radius:999px;padding:3px 9px;font-size:9px';
    dateBadge.textContent = p.pubDate;
    imgWrap.appendChild(dateBadge);
  }

  // 내용 영역
  var body = document.createElement('div');
  body.style.cssText = isCard
    ? 'padding:12px;flex:1;display:flex;flex-direction:column;gap:6px'
    : 'flex:1;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;min-width:0';

  var title = document.createElement('div');
  title.style.cssText = isCard
    ? 'cursor:pointer;font-size:13px;font-weight:800;color:var(--tx);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1'
    : 'cursor:pointer;font-size:12px;font-weight:800;color:var(--tx);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:4px';
  title.textContent = p.title||'';
  title.onclick = function(){ rssPreviewPost(i); };
  body.appendChild(title);

  if(isCard){
    var desc = document.createElement('div');
    desc.style.cssText = 'font-size:11px;color:var(--mt);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden';
    desc.textContent = p.description||'';
    body.appendChild(desc);
  } else {
    var meta = document.createElement('div');
    meta.style.cssText = 'font-size:10px;color:var(--mt);margin-bottom:5px';
    meta.textContent = (p.catIcon||'📄')+' '+(p.catName||'')+(p.pubDate?' · '+p.pubDate:'');
    body.appendChild(meta);
  }

  // 진행바
  var prog = document.createElement('div');
  prog.id = 'rss-prog-'+i;
  prog.style.display = 'none';
  prog.innerHTML = '<div style="background:var(--sur3);border-radius:999px;height:'+(isCard?5:4)+'px;overflow:hidden"><div id="rss-prog-bar-'+i+'" style="background:var(--grad);height:100%;border-radius:999px;width:0%;transition:width .3s"></div></div>'
    +'<div style="display:flex;justify-content:space-between;margin-top:2px"><span id="rss-prog-msg-'+i+'" style="font-size:9px;color:var(--ac)">AI 작성 중...</span><span id="rss-prog-pct-'+i+'" style="font-size:9px;color:var(--mt)">0%</span></div>';
  body.appendChild(prog);

  // 버튼
  var btns = document.createElement('div');
  btns.style.cssText = isCard ? 'display:grid;grid-template-columns:1fr 1fr;gap:6px' : 'display:flex;gap:5px';
  var btnReg = document.createElement('button');
  btnReg.id = 'rss-btn-reg-'+i;
  btnReg.style.cssText = 'background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:'+(isCard?8:6)+'px;padding:'+(isCard?'8px':'5px 10px')+';font-size:'+(isCard?11:10)+'px;font-weight:700;cursor:pointer;font-family:var(--font)';
  btnReg.textContent = '📥 등록';
  btnReg.onclick = function(){ rssSingleImport(i); };

  var btnAI = document.createElement('button');
  btnAI.id = 'rss-btn-ai-'+i;
  btnAI.style.cssText = 'background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border:none;border-radius:'+(isCard?8:6)+'px;padding:'+(isCard?'8px':'5px 10px')+';font-size:'+(isCard?11:10)+'px;font-weight:700;cursor:pointer;font-family:var(--font)';
  btnAI.textContent = '✨ AI';
  btnAI.onclick = function(){ rssSingleAIRewrite(i); };

  btns.appendChild(btnReg);
  btns.appendChild(btnAI);
  body.appendChild(btns);

  wrap.appendChild(imgWrap);
  wrap.appendChild(body);
  return wrap;
}

// ── renderCardView ──
function renderCardView(posts){
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:12px';
  posts.forEach(function(p,i){ grid.appendChild(_rssCardHtml(p,i,'card')); });
  return grid.outerHTML;
}

// ── renderListView ──
function renderListView(posts){
  var grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:6px';
  posts.forEach(function(p,i){ grid.appendChild(_rssCardHtml(p,i,'list')); });
  return grid.outerHTML;
}

// ── switchRssView ──
function switchRssView(view){
  _rssCurrentView=view;
  var posts=window._rssPosts;
  if(!posts?.length)return;
  var grid=document.getElementById('rssCardGrid');
  if(!grid)return;
  grid.innerHTML=view==='card'?renderCardView(posts):renderListView(posts);
  var c=document.getElementById('rss-view-card'),l=document.getElementById('rss-view-list');
  if(c){c.style.background=view==='card'?'var(--grad)':'transparent';c.style.color=view==='card'?'#fff':'var(--mt)';}
  if(l){l.style.background=view==='list'?'var(--grad)':'transparent';l.style.color=view==='list'?'#fff':'var(--mt)';}
}

// ── parseRSSXML ──
function parseRSSXML(xml){
  if(!xml || (!xml.includes('<item') && !xml.includes('<entry'))) return [];
  const posts = [];
  try{
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    doc.querySelectorAll('item, entry').forEach(item=>{
      const enc = item.querySelector('enclosure');
      const contentText = item.querySelector('content\\:encoded,content,description,summary')?.textContent
        || item.querySelector('description')?.textContent || '';
      const imgMatch = contentText.match(/<img[^>]+src=["']([^"']+)["']/)||[];
      posts.push({
        title:       item.querySelector('title')?.textContent?.trim()||'',
        link:        item.querySelector('link')?.textContent?.trim() || item.querySelector('link')?.getAttribute('href')||'',
        pubDate:     item.querySelector('pubDate,published,updated')?.textContent||'',
        thumbnail:   enc ? enc.getAttribute('url') : (imgMatch[1]||''),
        description: contentText.replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,' ').trim().substring(0,200)
      });
    });
  }catch(e){}
  return posts;
}

// ── autoImportRSSPosts ──
async function autoImportRSSPosts(posts){
  if(!posts||!posts.length) return;

  let targetL1 = CAT_DATA.find(c=>c.id==='news') || CAT_DATA[0];
  let targetL2 = targetL1?.subs?.[0];
  if(!targetL1||!targetL2) return;

  const today = new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  const seed  = Date.now();
  const existingTitles = new Set(targetL2.items.map(it=>it.title));
  const newPosts = posts.filter(p=>p.title&&!existingTitles.has(p.title)).slice(0,10);

  if(!newPosts.length){ toast('ℹ️ 새 글이 없어요 (이미 모두 등록됨)'); return; }

  // 진행 상황 표시
  const list = document.getElementById('rssFeedList');
  if(list) list.innerHTML=`
    <div style="background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05));border:1.5px solid var(--bd2);border-radius:16px;padding:20px;text-align:center">
      <div style="font-size:32px;margin-bottom:10px">🤖</div>
      <div style="font-size:15px;font-weight:800;color:var(--tx);margin-bottom:6px">AI 최상 퀄리티 글 생성 중</div>
      <div id="aiProgressMsg" style="font-size:12px;color:var(--mt);margin-bottom:14px">준비 중...</div>
      <div style="background:var(--sur3);border-radius:999px;height:8px;overflow:hidden;margin-bottom:6px">
        <div id="aiProgressBar" style="background:var(--grad);height:8px;border-radius:999px;width:0%;transition:width .4s ease"></div>
      </div>
      <div id="aiProgressPct" style="font-size:11px;color:var(--mt)">0%</div>
    </div>`;

  const setProgress = (pct, msg)=>{
    var bar = document.getElementById('aiProgressBar');
    var txt = document.getElementById('aiProgressMsg');
    var p   = document.getElementById('aiProgressPct');
    if(bar) bar.style.width = pct+'%';
    if(txt) txt.textContent = msg;
    if(p)   p.textContent   = pct+'%';
  };

  const results = [];

  for(let i=0; i<newPosts.length; i++){
    const p   = newPosts[i];
    const pct = Math.round(((i)/newPosts.length)*90);
    setProgress(pct, `(${i+1}/${newPosts.length}) "${p.title.substring(0,25)}..." 재작성 중`);

    // ── 1) AI 고퀄리티 본문 생성 (2000자 이상, 애드센스 기준) ──
    let body = '';
    try{
      const prompt = encodeURIComponent(
        `당신은 한국 최고의 블로그 작가입니다. 아래 주제로 애드센스 승인 기준에 맞는 최고 퀄리티 블로그 글을 작성해주세요.\n\n`+
        `[주제] ${p.title}\n`+
        `[참고내용] ${p.description||p.title}\n\n`+
        `[작성 조건]\n`+
        `- 글자수: 반드시 2000자 이상\n`+
        `- 구조: 도입부(흥미로운 시작) → 소제목 5개 이상(## 사용) → 결론\n`+
        `- 각 소제목 아래 최소 3문단 이상\n`+
        `- 이모지 풍부하게 사용\n`+
        `- 실용적이고 독창적인 내용\n`+
        `- 자연스러운 구어체 한국어\n`+
        `- 독자가 끝까지 읽고 싶게 흥미롭게\n`+
        `- 광고성 문구 금지\n`+
        `- JSON 없이 본문 텍스트만 반환`
      );
      const ctrl = new AbortController();
      setTimeout(()=>ctrl.abort(), 20000);
      const res  = await fetch('https://text.pollinations.ai/'+prompt, {signal:ctrl.signal});
      body = (await res.text()).trim();
    }catch(e){
      body = `## ${p.title}\n\n`+
        `${p.description||''}\n\n`+
        `## 핵심 정보 정리\n\n`+
        `이 주제에 대해 알아두면 유용한 정보들을 정리했어요.\n\n`+
        `## 실생활 활용법\n\n`+
        `일상에서 바로 적용할 수 있는 방법을 소개합니다.\n\n`+
        `## 마무리\n\n`+
        `오늘 소개한 내용이 도움이 됐으면 좋겠어요!`;
    }

    // ── 2) 대표 이미지 생성 (고화질 800x450) ──
    const imgKeyword = encodeURIComponent(
      p.title + ' professional blog thumbnail high quality modern minimal korean style'
    );
    const mainImg = `https://image.pollinations.ai/prompt/${imgKeyword}?width=800&height=450&nologo=1&seed=${seed+i}`;

    // ── 3) 본문 중간 이미지 (다른 시드) ──
    const midImg = `https://image.pollinations.ai/prompt/${imgKeyword}?width=800&height=400&nologo=1&seed=${seed+i+1000}`;

    // ── 4) 본문 HTML 변환 (완성도 높은 포맷) ──
    const lines = body.split('\n');
    let htmlBody = '';
    let paraCount = 0;

    for(let j=0; j<lines.length; j++){
      const line = lines[j].trim();
      if(!line) continue;

      if(line.startsWith('## ')){
        // 소제목
        const headText = line.replace(/^##\s*/,'');
        // 중간 이미지 삽입 (두 번째 소제목 앞)
        if(paraCount === 1){
          htmlBody += `<div style="margin:1.5rem 0;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
            <img src="${midImg}" style="width:100%;height:280px;object-fit:cover" onerror="this.style.display='none'" loading="lazy">
          </div>`;
        }
        htmlBody += `<h2 style="font-family:var(--display);font-size:20px;font-weight:800;color:var(--tx);margin:2rem 0 1rem;padding-left:14px;border-left:4px solid var(--ac);line-height:1.4">${headText}</h2>`;
        paraCount++;
      } else if(line.startsWith('### ')){
        const headText = line.replace(/^###\s*/,'');
        htmlBody += `<h3 style="font-family:var(--display);font-size:17px;font-weight:700;color:var(--tx);margin:1.5rem 0 .8rem">${headText}</h3>`;
      } else if(line.startsWith('- ') || line.startsWith('• ')){
        htmlBody += `<li style="font-size:15px;line-height:1.9;color:var(--mt);margin-bottom:6px;padding-left:4px">${line.replace(/^[-•]\s*/,'')}</li>`;
      } else {
        htmlBody += `<p style="font-size:15px;line-height:2;color:var(--mt);margin-bottom:1.2rem">${line}</p>`;
      }
    }

    // ── 5) 최종 본문 조립 (상단 이미지 + 본문 + 하단 정보) ──
    const fullBody = `
      <!-- 대표 이미지 -->
      <div style="margin-bottom:2rem;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.1)">
        <img src="${mainImg}" style="width:100%;height:320px;object-fit:cover" onerror="this.style.display='none'" loading="lazy">
      </div>

      <!-- 본문 -->
      <div style="max-width:720px;margin:0 auto">
        ${htmlBody}
      </div>

      <!-- 하단 정보 박스 -->
      <div style="background:linear-gradient(135deg,rgba(124,58,237,.06),rgba(236,72,153,.04));border:1.5px solid var(--bd2);border-radius:16px;padding:1.5rem;margin-top:2.5rem">
        <div style="font-size:13px;font-weight:800;color:var(--ac);margin-bottom:8px">📌 핵심 요약</div>
        <div style="font-size:13px;color:var(--mt);line-height:1.9">${(p.description||'').substring(0,150)}</div>
      </div>

      <!-- 원문 링크 -->
      ${p.link ? `<div style="text-align:center;margin-top:1.5rem">
        <a href="${p.link}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;background:var(--sur2);color:var(--ac);border:1.5px solid var(--bd2);border-radius:999px;padding:9px 20px;font-size:12px;font-weight:700;text-decoration:none">
          🔗 원문 보기
        </a>
      </div>` : ''}
    `;

    const postId = 'rss_'+seed+'_'+i;
    POST_CONTENTS[postId] = { img: mainImg, body: fullBody, rawBody: body };

    results.push({
      id:    postId,
      title: p.title,
      desc:  body.replace(/#+\s*/g,'').replace(/\n/g,' ').substring(0,100),
      date:  p.pubDate ? new Date(p.pubDate).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'}) : today,
      read:  Math.max(3, Math.ceil(body.length/600))+'분',
      emoji: '📰',
      link:  p.link||'',
      img:   mainImg
    });

    await new Promise(r=>setTimeout(r,800));
  }

  setProgress(100, '완료!');
  await new Promise(r=>setTimeout(r,500));

  // 카테고리 등록
  targetL2.items = [...results, ...targetL2.items].slice(0,50);
  try{ buildCatTree(); }catch(e){}
  try{ renderPosts(); }catch(e){}

  // 완료 화면
  if(list) list.innerHTML=`
    <div style="background:rgba(16,185,129,.08);border:1.5px solid rgba(16,185,129,.25);border-radius:16px;padding:24px;text-align:center;margin-bottom:14px">
      <div style="font-size:40px;margin-bottom:10px">🎉</div>
      <div style="font-size:16px;font-weight:800;color:#059669;margin-bottom:6px">${results.length}개 글 등록 완료!</div>
      <div style="font-size:12px;color:var(--mt);margin-bottom:14px">애드센스 기준 최상 퀄리티로 작성됐어요</div>
      <button onclick="showPage('cat');setNav('cat')" style="background:var(--grad);color:#fff;border:none;border-radius:10px;padding:11px 24px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">📂 카테고리에서 확인하기</button>
    </div>
    ${results.map(r=>`
      <div style="background:var(--sur);border:1px solid var(--bd);border-radius:12px;overflow:hidden;margin-bottom:8px;display:flex;gap:0">
        <img src="${r.img}" style="width:80px;height:80px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">
        <div style="padding:10px 12px;flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;color:var(--tx);margin-bottom:3px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${r.title}</div>
          <div style="font-size:10px;color:var(--mt)">${r.date} · ${r.read} 읽기</div>
        </div>
      </div>`).join('')}
  `;

  toast('🎉 '+results.length+'개 최상 퀄리티 글 등록 완료!');
}

// ── manualSync ──
async function manualSync(){
  var btn = document.getElementById('manualSyncBtn');
  var badge = document.getElementById('syncStatusBadge');
  if(btn){ btn.disabled=true; btn.innerHTML='<span style="font-size:20px">⏳</span> 동기화 중...'; }
  if(badge){ badge.textContent='● 동기화 중'; badge.style.background='rgba(245,158,11,.15)'; badge.style.color='#d97706'; badge.style.borderColor='rgba(245,158,11,.3)'; }

  // 글 가져오기
  await loadCustomRSS('https://tarrydaily.com/feed.xml', 'tarrydaily');

  // 동기화 후 처리
  var autoAI  = document.getElementById('syncAutoAI')?.checked;
  var autoReg = document.getElementById('syncAutoRegister')?.checked;

  if(window._rssPosts?.length){
    if(autoAI){
      await rssAIRewriteAll();
    } else if(autoReg){
      rssImportAll();
    }
  }

  // 마지막 동기화 시간 업데이트
  var now = new Date().toLocaleString('ko-KR');
  try{ localStorage.setItem('tarry_last_sync', now); }catch(e){}
  updateLastSyncTime();

  if(btn){ btn.disabled=false; btn.innerHTML='<span style="font-size:20px">🔄</span> 지금 바로 동기화'; }
  if(badge){ badge.textContent='● 동기화 완료'; badge.style.background='rgba(5,150,105,.15)'; badge.style.color='#059669'; badge.style.borderColor='rgba(5,150,105,.3)'; }
}

// ── updateLastSyncTime ──
function updateLastSyncTime(){
  var el = document.getElementById('lastSyncTime');
  if(!el) return;
  try{
    var t = localStorage.getItem('tarry_last_sync');
    el.textContent = t ? '마지막 동기화: '+t : '마지막 동기화: 없음';
  }catch(e){}
}

// ── toggleAutoSyncPanel ──
function toggleAutoSyncPanel(){
  var panel = document.getElementById('autoSyncPanel');
  var arrow = document.getElementById('autoSyncArrow');
  if(!panel) return;
  var open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'block';
  if(arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

// ── toggleAutoSync ──
function toggleAutoSync(){
  _autoSyncEnabled = !_autoSyncEnabled;
  var tog   = document.getElementById('autoSyncToggle');
  var thumb = document.getElementById('autoSyncThumb');
  var status = document.getElementById('autoSyncStatus');
  if(_autoSyncEnabled){
    if(tog)   tog.style.background   = 'linear-gradient(135deg,#06b6d4,#3b82f6)';
    if(thumb) thumb.style.left       = '22px';
    if(status) status.textContent    = '✅ 자동 동기화 활성';
    try{ localStorage.setItem('tarry_auto_sync_on','1'); }catch(e){}
    startAutoSyncTimer();
  } else {
    if(tog)   tog.style.background   = '#e5e7eb';
    if(thumb) thumb.style.left       = '2px';
    if(status) status.textContent    = '설정 안 됨';
    if(_autoSyncTimer) clearInterval(_autoSyncTimer);
    try{ localStorage.setItem('tarry_auto_sync_on','0'); }catch(e){}
  }
}

// ── setSyncFreq ──
function setSyncFreq(freq){
  _syncFreq = freq;
  ['daily','weekday','twice'].forEach(function(f){
    var btn = document.getElementById('sync-freq-'+f);
    if(btn){
      if(f === freq){
        btn.style.background = 'linear-gradient(135deg,#06b6d4,#3b82f6)';
        btn.style.color      = '#fff';
        btn.style.border     = 'none';
      } else {
        btn.style.background = 'var(--sur)';
        btn.style.color      = 'var(--mt)';
        btn.style.border     = '1.5px solid var(--bd)';
      }
    }
  });
  try{ localStorage.setItem('tarry_sync_freq', freq); }catch(e){}
}

// ── saveAutoSyncSettings ──
function saveAutoSyncSettings(){
  var time    = document.getElementById('autoSyncTime')?.value || '08:00';
  var autoAI  = document.getElementById('syncAutoAI')?.checked || false;
  var autoReg = document.getElementById('syncAutoRegister')?.checked || true;
  try{
    localStorage.setItem('tarry_sync_time', time);
    localStorage.setItem('tarry_sync_ai',   autoAI ? '1' : '0');
    localStorage.setItem('tarry_sync_reg',  autoReg ? '1' : '0');
    localStorage.setItem('tarry_sync_freq', _syncFreq);
  }catch(e){}

  // 다음 동기화 시간 계산
  var [h, m] = time.split(':').map(Number);
  var next = new Date();
  next.setHours(h, m, 0, 0);
  if(next <= new Date()) next.setDate(next.getDate()+1);

  var nextEl = document.getElementById('nextSyncInfo');
  if(nextEl){
    nextEl.style.display = 'block';
    nextEl.textContent = '⏰ 다음 동기화: '+next.toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  if(_autoSyncEnabled) startAutoSyncTimer();
  toast('✅ 자동 동기화 설정 저장됐어요! 매일 '+time+' 자동 실행');
}

// ── startAutoSyncTimer ──
function startAutoSyncTimer(){
  if(_autoSyncTimer) clearInterval(_autoSyncTimer);
  _autoSyncTimer = setInterval(async function(){
    var time = localStorage.getItem('tarry_sync_time') || '08:00';
    var freq = localStorage.getItem('tarry_sync_freq') || 'daily';
    var now  = new Date();
    var cur  = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    var day  = now.getDay(); // 0=일, 6=토

    var shouldRun = false;
    if(cur === time){
      if(freq === 'daily') shouldRun = true;
      else if(freq === 'weekday' && day >= 1 && day <= 5) shouldRun = true;
      else if(freq === 'twice'){
        var [h] = time.split(':').map(Number);
        var time2 = (h+12).toString().padStart(2,'0')+':'+time.split(':')[1];
        if(cur === time || cur === time2) shouldRun = true;
      }
    }

    if(shouldRun){
      toast('⏰ 자동 동기화 시작!');
      await manualSync();
    }
  }, 60000); // 1분마다 체크
}

// ── restoreAutoSyncSettings ──
function restoreAutoSyncSettings(){
  try{
    var on   = localStorage.getItem('tarry_auto_sync_on') === '1';
    var time = localStorage.getItem('tarry_sync_time') || '08:00';
    var freq = localStorage.getItem('tarry_sync_freq') || 'daily';
    var ai   = localStorage.getItem('tarry_sync_ai')  === '1';
    var reg  = localStorage.getItem('tarry_sync_reg')  !== '0';

    var timeEl = document.getElementById('autoSyncTime');
    var aiEl   = document.getElementById('syncAutoAI');
    var regEl  = document.getElementById('syncAutoRegister');
    if(timeEl) timeEl.value   = time;
    if(aiEl)   aiEl.checked  = ai;
    if(regEl)  regEl.checked = reg;

    setSyncFreq(freq);
    updateLastSyncTime();

    if(on){
      _autoSyncEnabled = false; // 토글이 반전되므로
      toggleAutoSync();
    }
  }catch(e){}
}