/* TARRY의 데일리 - news.js */

// ── setNewsMode ──
function setNewsMode(mode){
  newsScheduleMode=mode;
  const a=document.getElementById('newsModeAuto'),m=document.getElementById('newsModeManual');
  if(mode==='auto'){if(a){a.style.background='var(--grad)';a.style.color='#fff';}if(m){m.style.background='var(--sur2)';m.style.color='var(--tx)';}}
  else{if(m){m.style.background='var(--grad)';m.style.color='#fff';}if(a){a.style.background='var(--sur2)';a.style.color='var(--tx)';}}
  toast(mode==='auto'?'🤖 자동 모드!':'✋ 수동 모드!');
}

// ── applyCustomTime ──
function applyCustomTime(){
  const t=document.getElementById('customScheduleTime')?.value;
  if(!t){toast('시간을 입력해주세요');return;}
  scheduleTime=t;
  const l=document.getElementById('scheduleLabel');if(l)l.textContent='⏰ 매일 '+t+' 자동 실행';
  startScheduler();toast('⏰ 매일 '+t+' 자동 수집으로 설정됐어요!');
}

// ── startScheduler ──
function startScheduler(){
  if(scheduleTimer)clearInterval(scheduleTimer);
  scheduleTimer=setInterval(()=>{
    const now=new Date();const cur=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    if(cur===scheduleTime&&newsScheduleMode==='auto')runAutoNews(true);
  },60000);
}

// ── runAutoNews ──
async function runAutoNews(isAuto){
  const btn=document.getElementById('autoNewsBtn'),list=document.getElementById('autoNewsList');
  const box=document.getElementById('newsLoadingBox'),bar=document.getElementById('newsProgressBar'),pct=document.getElementById('newsProgressPct'),txt=document.getElementById('newsLoadingText'),stp=document.getElementById('newsLoadingStep');
  const prog=(p,t,s)=>{if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(txt)txt.textContent=t;if(stp)stp.textContent=s;};
  if(btn){btn.disabled=true;btn.textContent='🔄 수집 중...';}
  if(box)box.style.display='block';if(list)list.innerHTML='';
  prog(10,'🔌 서버 연결 중...','AI 서버에 접속해요');
  if(!isAuto)toast('📰 뉴스 수집 시작!');

  // 설정값 읽기
  const count=parseInt(document.getElementById('newsCount')?.value||5);
  const category=document.getElementById('newsCategory')?.value||'종합';
  const keywords=(document.getElementById('newsKeywords')?.value||'').trim();
  const length=document.getElementById('newsLength')?.value||'1500';
  const style=document.getElementById('newsStyle')?.value||'전문적인';
  const aiStyle=document.querySelector('.ai-style-btn[style*="var(--ac)"]')?.textContent?.trim()||'해외 감성 풍경';
  const imgSrc=document.querySelector('input[name="imgSrc"]:checked')?.value||'ai';
  const imgPosTop=document.getElementById('imgPosTop')?.checked;
  const imgPosMid=document.getElementById('imgPosMid')?.checked;
  const pubSite=document.getElementById('pubSite')?.checked!==false;
  const pubSns=document.getElementById('pubSns')?.checked;
  const pubNl=document.getElementById('pubNewsletter')?.checked;

  const today=new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  const seed=Date.now();

  // 이미지 URL 생성
  const getImg=(kw)=>{
    if(imgSrc==='ai'){
      const styles={'해외 감성 풍경':'scenic landscape photography cinematic','미니멀 인포그래픽':'minimal infographic design flat','따뜻한 라이프스타일':'warm lifestyle photography cozy','모던 테크 비주얼':'modern tech digital dark neon','뉴스 저널리즘':'news journalism documentary photo'};
      const styleStr=styles[aiStyle]||styles['해외 감성 풍경'];
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(kw+' '+styleStr)}?width=800&height=450&nologo=1&seed=${Math.floor(Math.random()*9999)}`;
    }
    return `https://source.unsplash.com/800x450/?${encodeURIComponent(kw)}&sig=${seed}`;
  };

  // 뉴스 데이터
  const defaults={
    '종합':[{title:'2026 라이프스타일 트렌드 완벽 분석',summary:'올해 주목받는 트렌드 한눈에 정리',emoji:'🔥'},{title:'스마트폰 배터리 2배 오래 쓰는 설정법',summary:'몰랐던 배터리 절약 숨겨진 설정',emoji:'🔋'},{title:'매달 10만원 아끼는 생활비 절약 꿀팁',summary:'바로 실천 가능한 10가지 절약법',emoji:'💰'},{title:'봄철 건강 관리 완벽 가이드',summary:'환절기 건강 지키는 쉬운 방법',emoji:'🌸'},{title:'2026 OTT 콘텐츠 완벽 정리',summary:'이번 달 놓치면 후회할 작품들',emoji:'🎬'},{title:'재택근무 생산성 높이는 7가지 방법',summary:'집에서도 최고 성과 내는 비결',emoji:'💻'},{title:'주식 초보가 꼭 알아야 할 투자 원칙',summary:'잃지 않는 투자의 기본 원칙',emoji:'📈'}],
    'IT기술':[{title:'챗GPT 신기능 완벽 정리',summary:'업데이트된 ChatGPT 활용법',emoji:'🤖'},{title:'무료 AI 툴 TOP10',summary:'꼭 알아야 할 무료 AI 도구',emoji:'💻'},{title:'카카오톡 숨겨진 꿀기능',summary:'매일 쓰는 카카오톡 비밀 기능',emoji:'💬'},{title:'애플 최신 기능 완전 분석',summary:'업데이트 후 달라진 점 정리',emoji:'🍎'},{title:'구글 AI 검색 이렇게 달라졌다',summary:'AI 통합 구글 검색 완벽 가이드',emoji:'🔍'}],
    '경제재테크':[{title:'적금 vs ETF 2026 최선의 선택',summary:'전문가 추천 투자 전략',emoji:'📈'},{title:'카드 혜택 완벽 정리',summary:'내 카드의 숨겨진 혜택 확인',emoji:'💳'},{title:'청년 주거 지원 혜택 총정리',summary:'정부 주거 지원 완벽 정리',emoji:'🏠'},{title:'월 30만원으로 노후 대비하기',summary:'지금 시작하면 충분한 연금 전략',emoji:'💰'},{title:'2026 세금 환급 완벽 가이드',summary:'놓치면 손해인 세금 혜택들',emoji:'🧾'}],
    '생활건강':[{title:'아침 10분 스트레칭 효과',summary:'직장인을 위한 아침 루틴',emoji:'🧘'},{title:'봄철 다이어트 완벽 가이드',summary:'건강하게 체중 관리하기',emoji:'🥗'},{title:'수면의 질을 높이는 7가지 습관',summary:'깊은 잠을 자기 위한 방법',emoji:'😴'},{title:'피부 트러블 없애는 루틴',summary:'피부과 의사 추천 스킨케어',emoji:'✨'},{title:'눈 건강 지키는 방법',summary:'스마트폰 시대 눈 보호 가이드',emoji:'👁️'}],
    '트렌드':[{title:'2026 SNS 트렌드 완벽 분석',summary:'Threads 숏폼 AI까지 최신 트렌드',emoji:'📱'},{title:'MZ세대가 많이 쓰는 앱 TOP10',summary:'지금 가장 핫한 앱들 정리',emoji:'✨'},{title:'서울 새 핫플레이스',summary:'요즘 MZ들이 몰리는 서울 핫플',emoji:'🗼'},{title:'요즘 유행하는 카페 디저트',summary:'SNS에서 난리난 디저트 총정리',emoji:'🍰'},{title:'Z세대 소비 트렌드 분석',summary:'그들은 왜 그걸 사는가',emoji:'🛍️'}]
  };

  let newsItems=[];
  try{
    prog(40,'📡 뉴스 소스 연결 중...','선택된 소스에서 수집해요');
    const kwStr=keywords||category;
    const prompt=encodeURIComponent(`${today} "${kwStr}" 관련 뉴스 ${count}개. 각각 ${length}자 이상의 ${style} 블로그 글. JSON배열: [{"title":"제목","summary":"2줄요약","emoji":"이모지","body":"${length}자 이상의 본문. 소제목 포함. 이모지 풍부하게. 실용적 정보 위주."}]. JSON만 반환.`);
    const controller=new AbortController();
    setTimeout(()=>controller.abort(),15000);
    prog(55,'🤖 AI가 글을 작성해요...','고퀄리티 글을 만드는 중이에요');
    const res=await fetch('https://text.pollinations.ai/'+prompt,{signal:controller.signal});
    const text=await res.text();
    const m=text.replace(/```json|```/g,'').trim().match(/\[[\s\S]*\]/);
    if(m)newsItems=JSON.parse(m[0]);
  }catch(e){}
  if(!newsItems?.length){const pool=[...(defaults[category]||defaults['종합'])].sort(()=>Math.random()-.5);newsItems=pool.slice(0,count);}

  prog(80,'🖼️ 이미지 생성/수집 중...','고화질 이미지를 준비해요');
  await new Promise(r=>setTimeout(r,400));

  // 카테고리 등록
  if(pubSite){
    prog(90,'📂 카테고리에 등록 중...','사이트에 발행해요');
    const newsCat=CAT_DATA.find(c=>c.id==='news');
    if(newsCat?.subs[0]){
      const newPosts=newsItems.map((n,i)=>({
        id:`auto_${seed}_${i}`,
        title:n.title,
        desc:n.summary||'',
        date:today,
        read:Math.ceil(parseInt(length)/500)+'분',
        emoji:n.emoji||'📰',
        body:n.body||''
      }));
      newsCat.subs[0].items=[...newPosts,...newsCat.subs[0].items].slice(0,30);
    }
    buildCatTree();
  }

  // SNS 발행 시뮬레이션
  if(pubSns){ prog(93,'📱 SNS 발행 중...','연동된 SNS에 배포해요'); await new Promise(r=>setTimeout(r,300)); }
  // 뉴스레터 발행 시뮬레이션
  if(pubNl){ prog(96,'💌 뉴스레터 발송 중...','구독자들에게 이메일 발송해요'); await new Promise(r=>setTimeout(r,300)); }

  prog(100,'🎉 모두 완료!',newsItems.length+'개 발행 성공!');
  await new Promise(r=>setTimeout(r,500));
  if(box)box.style.display='none';

  // 결과 목록 렌더링
  const countEl=document.getElementById('newsCollectedCount');
  if(countEl)countEl.textContent=newsItems.length+'건';

  if(list){
    list.innerHTML=newsItems.map((n,i)=>{
      const imgUrl=getImg(n.title||category);
      const hasBody=n.body&&n.body.length>50;
      return `<div style="background:var(--sur);border:1.5px solid var(--bd2);border-radius:16px;overflow:hidden;margin-bottom:12px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        ${imgPosTop?`<div style="position:relative;height:160px;overflow:hidden;background:var(--sur3)"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"><div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.5);color:#fff;border-radius:8px;padding:3px 9px;font-size:10px;font-weight:700">${n.emoji||'📰'} ${category}</div></div>`:''}
        <div style="padding:13px">
          <div style="font-size:15px;font-weight:800;color:var(--tx);margin-bottom:6px;line-height:1.4">${n.emoji||'📰'} ${n.title||''}</div>
          <div style="font-size:12px;color:var(--mt);margin-bottom:10px;line-height:1.6">${n.summary||''}</div>
          ${hasBody&&imgPosMid?`<div style="height:120px;overflow:hidden;border-radius:10px;margin-bottom:10px;background:var(--sur3)"><img src="${getImg((n.title||category)+'2')}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"></div>`:''}
          ${hasBody?`<div style="background:var(--sur2);border-radius:10px;padding:10px;margin-bottom:10px;font-size:11px;color:var(--mt);line-height:1.7;max-height:120px;overflow:hidden">${(n.body||'').substring(0,200)}...</div>`:''}
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button onclick="publishNewsItem(${i},${JSON.stringify(n).replace(/"/g,'&quot;')},${seed})" style="flex:1;background:var(--grad);color:#fff;border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">🌐 사이트 발행</button>
            <button onclick="shareNewsToSns(${JSON.stringify(n.title||'').replace(/"/g,'&quot;')})" style="background:rgba(249,115,22,.12);color:#f97316;border:1px solid rgba(249,115,22,.25);border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">📱 SNS</button>
            <button onclick="shareNewsToNewsletter(${JSON.stringify(n.title||'').replace(/"/g,'&quot;')})" style="background:rgba(6,182,212,.12);color:#06b6d4;border:1px solid rgba(6,182,212,.25);border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">💌</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  if(btn){btn.disabled=false;btn.textContent='🚀 자동 수집 실행';}
  const pubMsg=[pubSite?'사이트':'',pubSns?'SNS':'',pubNl?'뉴스레터':''].filter(Boolean).join('+');
  toast(`🎉 ${newsItems.length}개 수집 완료! ${pubMsg?'→ '+pubMsg+' 발행':''}`.trim());
}

// ── openManualCollect ──
function openManualCollect(){
  var m=document.getElementById('manualCollectModal');
  if(m)m.style.display='flex';
}

// ── closeManualCollect ──
function closeManualCollect(){
  var m=document.getElementById('manualCollectModal');
  if(m)m.style.display='none';
}

// ── runManualCollect ──
async function runManualCollect(){
  var keyword=(document.getElementById('manualKeyword')?.value||'').trim();
  if(!keyword){toast('🔍 키워드를 입력해주세요');return;}
  closeManualCollect();
  // newsKeywords에 반영 후 runAutoNews 실행
  var kwEl=document.getElementById('newsKeywords');
  if(kwEl)kwEl.value=keyword;
  var catEl=document.getElementById('newsCategory');
  var mCat=document.getElementById('manualCategory')?.value;
  if(catEl&&mCat)catEl.value=mCat;
  var lenEl=document.getElementById('newsLength');
  var mLen=document.getElementById('manualLength')?.value;
  if(lenEl&&mLen)lenEl.value=mLen;
  toast('✋ 수동 수집 시작! "'+keyword+'"');
  switchTab('news');
  await runAutoNews(false);
}

// ── publishNewsItem ──
function publishNewsItem(i,n,seed){
  toast('🌐 "'+((n.title||'').substring(0,20))+'..." 사이트에 발행됐어요!');
}

// ── shareNewsToSns ──
function shareNewsToSns(title){
  switchTab('sns');
  var sc=document.getElementById('snsContent');
  if(sc)sc.value='📰 '+title+'\n\n자세한 내용은 tarrydaily.com에서 확인하세요!';
  toast('📱 SNS 탭으로 이동했어요! 내용을 확인하세요.');
}

// ── shareNewsToNewsletter ──
function shareNewsToNewsletter(title){
  switchTab('newsletter');
  var si=document.getElementById('nlSubject');
  if(si)si.value='[TARRY의 데일리] '+title;
  toast('💌 뉴스레터 탭으로 이동했어요!');
}

// ── runFullPublish ──
function runFullPublish(){
  var hasSite=document.getElementById('pubSite')?.checked;
  var hasSns=document.getElementById('pubSns')?.checked;
  var hasNl=document.getElementById('pubNewsletter')?.checked;
  if(!hasSite&&!hasSns&&!hasNl){toast('⚠️ 발행 대상을 하나 이상 선택해주세요');return;}
  runAutoNews(false);
}

// ── toggleSrcStyle ──
function toggleSrcStyle(id,checked){
  var el=document.getElementById(id);
  if(!el)return;
  if(checked){el.style.borderColor='rgba(124,58,237,.4)';el.style.background='rgba(124,58,237,.06)';}
  else{el.style.borderColor='var(--bd)';el.style.background='var(--sur)';}
}

// ── selectImgSrc ──
function selectImgSrc(){
  var val=document.querySelector('input[name="imgSrc"]:checked')?.value;
  ['imgOptAI','imgOptManual'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='none';});
  if(val==='ai'){var a=document.getElementById('imgOptAI');if(a)a.style.display='block';}
  if(val==='manual'){var m=document.getElementById('imgOptManual');if(m)m.style.display='block';}
  // 라벨 스타일
  ['imgSrcAI','imgSrcUnsplash','imgSrcManual'].forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    el.style.borderColor='var(--bd)';el.style.background='var(--sur)';
  });
  var selId=val==='ai'?'imgSrcAI':val==='unsplash'?'imgSrcUnsplash':'imgSrcManual';
  var sel=document.getElementById(selId);
  if(sel){sel.style.borderColor='rgba(124,58,237,.4)';sel.style.background='rgba(124,58,237,.08)';}
}

// ── selectAiStyle ──
function selectAiStyle(btn,style){
  document.querySelectorAll('.ai-style-btn').forEach(function(b){
    b.style.background='var(--sur3)';b.style.color='var(--mt)';b.style.border='1px solid var(--bd)';b.style.fontWeight='400';
  });
  btn.style.background='var(--ac)';btn.style.color='#fff';btn.style.border='none';btn.style.fontWeight='700';
}

// ── previewManualImg ──
function previewManualImg(){
  var url=(document.getElementById('manualImgUrl')?.value||'').trim();
  if(!url){toast('URL을 입력해주세요');return;}
  var prev=document.getElementById('manualImgPreview');
  var img=document.getElementById('manualImgPreviewEl');
  if(prev)prev.style.display='block';
  if(img){img.src=url;img.onerror=function(){toast('❌ 이미지를 불러올 수 없어요');prev.style.display='none';};}
}

// ── runIndexing ──
async function runIndexing(){
  const g=document.getElementById('idx-google'),n=document.getElementById('idx-naver'),b=document.getElementById('idx-bing');
  await new Promise(r=>setTimeout(r,400));
  if(g)g.textContent='✅ 완료';if(n)n.textContent='✅ 완료';if(b)b.textContent='✅ 완료';
}