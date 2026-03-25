/* TARRY의 데일리 - newsletter.js */

// ── initNewsletterTab ──
function initNewsletterTab(){
  // EmailJS 설정 불러오기
  loadEmailJSConfig();
  // 구독자 목록 불러오기
  try{nlEmails=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');}catch(e){nlEmails=[];}
  // 발송 기록 불러오기
  try{nlHistory=JSON.parse(localStorage.getItem('tarry_nl_history')||'[]');}catch(e){nlHistory=[];}
  renderNlEmails();
  renderNlHistory();
  updateNlStats();
  // 글 목록 셀렉트 채우기
  const sel=document.getElementById('nlPostSelect');
  if(sel){
    let opts='<option value="">-- 글 선택 --</option>';
    CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>{
      opts+=`<option value="${it.id}">${l1.icon} ${l2.name} > ${it.title.substring(0,30)}</option>`;
    })));
    sel.innerHTML=opts;
    sel.addEventListener('change',()=>nlPreviewPost(sel.value));
  }
}

// ── loadEmailJSConfig ──
function loadEmailJSConfig(){
  var pk  = localStorage.getItem('tarry_ejs_pk')||'';
  var svc = localStorage.getItem('tarry_ejs_service')||'';
  var tpl = localStorage.getItem('tarry_ejs_template')||'';
  var pEl = document.getElementById('ejs_public_key');
  var sEl = document.getElementById('ejs_service');
  var tEl = document.getElementById('ejs_template');
  if(pEl) pEl.value = pk;
  if(sEl) sEl.value = svc;
  if(tEl) tEl.value = tpl;
  updateEjsStatusBadge(pk && svc && tpl);
}

// ── saveEmailJSConfig ──
function saveEmailJSConfig(){
  var pk  = (document.getElementById('ejs_public_key')?.value||'').trim();
  var svc = (document.getElementById('ejs_service')?.value||'').trim();
  var tpl = (document.getElementById('ejs_template')?.value||'').trim();
  if(!pk||!svc||!tpl){ toast('Public Key, Service ID, Template ID 모두 입력해주세요'); return; }
  try{
    localStorage.setItem('tarry_ejs_pk', pk);
    localStorage.setItem('tarry_ejs_service', svc);
    localStorage.setItem('tarry_ejs_template', tpl);
    // emailjs 재초기화
    if(typeof emailjs !== 'undefined') emailjs.init(pk);
  }catch(e){}
  updateEjsStatusBadge(true);
  toast('✅ EmailJS 설정 저장됐어요! 이제 실제 이메일이 발송돼요 📨');
}

// ── testEmailJSConfig ──
async function testEmailJSConfig(){
  var pk  = localStorage.getItem('tarry_ejs_pk')||'';
  var svc = localStorage.getItem('tarry_ejs_service')||'';
  var tpl = localStorage.getItem('tarry_ejs_template')||'';
  if(!pk||!svc||!tpl){ toast('먼저 EmailJS 설정을 저장해주세요'); return; }
  var testEmail = prompt('테스트 이메일 주소를 입력하세요 (기본: tarry9653@daum.net):') || 'tarry9653@daum.net';
  toast('🧪 테스트 발송 중...');
  try{
    if(typeof emailjs !== 'undefined') emailjs.init(pk);
    await emailjs.send(svc, tpl, {
      to_email:   testEmail,
      from_name:  'TARRY의 데일리',
      reply_to:   'tarry9653@daum.net',
      subject:    '[테스트] TARRY 뉴스레터 연결 확인',
      post_title: 'EmailJS 연결 테스트',
      message:    'EmailJS 설정이 완료됐어요! 이제 실제 이메일이 발송됩니다 😊',
      site_url:   'https://tarrydaily.com'
    });
    updateEjsStatusBadge(true, '✅ 연결 성공! '+testEmail+'으로 발송됨');
    toast('✅ 테스트 이메일 발송 성공! '+testEmail+' 확인해보세요');
  }catch(e){
    updateEjsStatusBadge(false, '❌ 연결 실패: '+e.text||e.message||'설정을 확인해주세요');
    toast('❌ 발송 실패. EmailJS 설정을 확인해주세요');
  }
}

// ── updateEjsStatusBadge ──
function updateEjsStatusBadge(ok, msg){
  var badge = document.getElementById('ejsStatusBadge');
  if(!badge) return;
  badge.style.display = 'block';
  badge.textContent = msg || (ok ? '✅ EmailJS 설정 완료 — 실제 이메일 발송 활성' : '⚠️ EmailJS 미설정 — 이메일이 실제로 발송되지 않아요');
  badge.style.background = ok ? 'rgba(5,150,105,.08)' : 'rgba(220,38,38,.06)';
  badge.style.border = ok ? '1px solid rgba(5,150,105,.2)' : '1px solid rgba(220,38,38,.15)';
  badge.style.color = ok ? '#059669' : '#dc2626';
}

// ── renderNlEmails ──
function renderNlEmails(){
  const list=document.getElementById('nlEmailList');
  const cnt=document.getElementById('nlSubCount');
  if(cnt)cnt.textContent=nlEmails.length;
  if(!list)return;
  if(!nlEmails.length){list.innerHTML='<div style="text-align:center;padding:1rem;color:var(--mt);font-size:12px">구독자가 없어요<br>블로그 구독 폼에서 이메일을 수집해요</div>';return;}
  list.innerHTML=nlEmails.map((email,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bd)">
      <div style="background:var(--grad);border-radius:50%;width:26px;height:26px;min-width:26px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700">${email[0].toUpperCase()}</div>
      <div style="flex:1;font-size:12px;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${email}</div>
      <button onclick="nlRemoveEmail(${i})" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;flex-shrink:0">×</button>
    </div>
  `).join('');
}

// ── nlAddEmail ──
function nlAddEmail(){
  const input=document.getElementById('nlAddEmail');
  const email=input?.value?.trim();
  if(!email||!email.includes('@')){toast('올바른 이메일 형식을 입력해주세요');return;}
  if(nlEmails.includes(email)){toast('이미 등록된 이메일이에요');return;}
  nlEmails.push(email);
  try{localStorage.setItem('tarry_subscribers',JSON.stringify(nlEmails));}catch(e){}
  if(input)input.value='';
  renderNlEmails();updateNlStats();
  toast('✅ '+email+' 추가됐어요!');
}

// ── nlRemoveEmail ──
function nlRemoveEmail(i){
  const email=nlEmails[i];
  if(!confirm(email+'을 삭제할까요?'))return;
  nlEmails.splice(i,1);
  try{localStorage.setItem('tarry_subscribers',JSON.stringify(nlEmails));}catch(e){}
  renderNlEmails();updateNlStats();
  toast('🗑️ 삭제됐어요');
}

// ── updateNlStats ──
function updateNlStats(){
  const cnt=document.getElementById('nlSubCount');
  const sent=document.getElementById('nlSentCount');
  if(cnt)cnt.textContent=nlEmails.length;
  if(sent)sent.textContent=nlHistory.length;
  // 관리자 구독자 통계도 업데이트
  const adminSubs=document.getElementById('adminStatSubs');
  if(adminSubs)adminSubs.textContent=nlEmails.length;
}

// ── setNlMode ──
function setNlMode(mode){
  nlMode=mode;
  const manual=document.getElementById('nlManualSection');
  const auto=document.getElementById('nlAutoSection');
  const btnM=document.getElementById('nlModeManual');
  const btnA=document.getElementById('nlModeAuto');
  if(mode==='manual'){
    if(manual)manual.style.display='block';
    if(auto)auto.style.display='none';
    if(btnM){btnM.style.background='var(--grad)';btnM.style.color='#fff';btnM.style.border='none';}
    if(btnA){btnA.style.background='var(--sur2)';btnA.style.color='var(--tx)';btnA.style.border='1.5px solid var(--bd)';}
  }else{
    if(manual)manual.style.display='none';
    if(auto)auto.style.display='block';
    if(btnA){btnA.style.background='var(--grad)';btnA.style.color='#fff';btnA.style.border='none';}
    if(btnM){btnM.style.background='var(--sur2)';btnM.style.color='var(--tx)';btnM.style.border='1.5px solid var(--bd)';}
  }
}

// ── setNlAutoSelect ──
function setNlAutoSelect(type){
  nlAutoSelect=type;
  const r=document.getElementById('nlAutoSelectRandom');
  const l=document.getElementById('nlAutoSelectLatest');
  if(type==='random'){
    if(r){r.style.background='var(--grad)';r.style.color='#fff';r.style.border='none';}
    if(l){l.style.background='var(--sur2)';l.style.color='var(--tx)';l.style.border='1.5px solid var(--bd)';}
  }else{
    if(l){l.style.background='var(--grad)';l.style.color='#fff';l.style.border='none';}
    if(r){r.style.background='var(--sur2)';r.style.color='var(--tx)';r.style.border='1.5px solid var(--bd)';}
  }
}

// ── nlPreviewPost ──
function nlPreviewPost(postId){
  const preview=document.getElementById('nlPostPreview');
  if(!preview)return;
  if(!postId){preview.style.display='none';return;}
  let found=null;
  CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>{if(it.id===postId)found=it;})));
  if(!found){preview.style.display='none';return;}
  preview.style.display='block';
  preview.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">${found.emoji||'📄'}</span>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx)">${found.title}</div>
        <div style="font-size:10px;color:var(--mt)">${found.desc||''}</div>
      </div>
    </div>
  `;
}

// ── nlRandomPost ──
function nlRandomPost(){
  const sel=document.getElementById('nlPostSelect');
  if(!sel||sel.options.length<=1)return;
  const idx=Math.floor(Math.random()*(sel.options.length-1))+1;
  sel.selectedIndex=idx;
  nlPreviewPost(sel.value);
  toast('🎲 랜덤으로 선택됐어요!');
}

// ── nlSendManual ──
async function nlSendManual(){
  if(!nlEmails.length){toast('❌ 구독자가 없어요. 먼저 이메일을 추가해주세요');return;}
  const subject=document.getElementById('nlSubject')?.value?.trim();
  const postId=document.getElementById('nlPostSelect')?.value;
  const message=document.getElementById('nlMessage')?.value?.trim();
  if(!subject){toast('제목을 입력해주세요');return;}
  await nlSendProcess(nlEmails,subject,postId,message,false);
}

// ── nlSendTest ──
async function nlSendTest(){
  const testEmail=prompt('테스트 발송할 이메일을 입력해주세요:');
  if(!testEmail||!testEmail.includes('@')){toast('올바른 이메일을 입력해주세요');return;}
  const subject=document.getElementById('nlSubject')?.value?.trim()||'[테스트] TARRY의 데일리 뉴스레터';
  const postId=document.getElementById('nlPostSelect')?.value;
  await nlSendProcess([testEmail],subject,postId,'',true);
}

// ── nlSendProcess ──
async function nlSendProcess(emails,subject,postId,message,isTest){
  const box=document.getElementById('nlProgressBox');
  const bar=document.getElementById('nlProgressBar');
  const pct=document.getElementById('nlProgressPct');
  const txt=document.getElementById('nlProgressText');
  const sub=document.getElementById('nlProgressSub');
  const prog=(p,t,s)=>{if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(txt)txt.textContent=t;if(sub)sub.textContent=s;};
  if(box)box.style.display='block';
  prog(0,'준비 중...','발송 시스템 초기화');
  let postInfo=null;
  if(postId){
    CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>{if(it.id===postId)postInfo=it;})));
  }
  prog(20,'이메일 준비 중...','발송할 내용을 만들어요');
  await new Promise(r=>setTimeout(r,400));

  const total=emails.length;
  let successCount=0;
  let failCount=0;

  // EmailJS 설정값 읽기 (관리자 설정 탭에서 저장된 값)
  const ejsService  = localStorage.getItem('tarry_ejs_service')||'';
  const ejsTemplate = localStorage.getItem('tarry_ejs_template')||'';
  const useEmailJS  = ejsService && ejsTemplate && typeof emailjs !== 'undefined';

  for(let i=0;i<total;i++){
    const pctVal=Math.round(20+((i+1)/total)*70);
    prog(pctVal,`발송 중... (${i+1}/${total})`,emails[i]);
    await new Promise(r=>setTimeout(r,Math.min(300,3000/total)));

    if(useEmailJS){
      try{
        await emailjs.send(ejsService, ejsTemplate, {
          to_email:   emails[i],
          from_name:  'TARRY의 데일리',
          reply_to:   'tarry9653@daum.net',
          subject:    subject,
          post_title: postInfo?.title||'',
          post_desc:  postInfo?.desc||'',
          message:    message||'안녕하세요! TARRY의 데일리에서 새 소식을 전해드려요.',
          site_url:   'https://tarrydaily.com'
        });
        successCount++;
      }catch(e){
        console.warn('EmailJS 발송 실패:', emails[i], e);
        failCount++;
      }
    } else {
      // EmailJS 미설정 시 시뮬레이션 (관리자에게 안내)
      successCount++;
    }
  }

  prog(100,'✅ 발송 완료!',`성공 ${successCount}건${failCount?` / 실패 ${failCount}건`:''}`);
  await new Promise(r=>setTimeout(r,600));
  if(box)box.style.display='none';

  const record={
    date:new Date().toLocaleString('ko-KR'),
    subject,
    count:total,
    success:successCount,
    fail:failCount,
    post:postInfo?.title||'(없음)',
    isTest,
    realSend: useEmailJS
  };
  nlHistory.unshift(record);
  try{localStorage.setItem('tarry_nl_history',JSON.stringify(nlHistory.slice(0,50)));}catch(e){}
  renderNlHistory();
  updateNlStats();

  if(!useEmailJS){
    toast('⚠️ EmailJS 미설정 — 관리자 설정에서 Service ID·Template ID를 입력해주세요');
  } else {
    toast(isTest?`🧪 테스트 발송 완료! (성공 ${successCount}건)`:`📨 발송 완료! ${successCount}명에게 보냈어요`);
  }
}

// ── renderNlHistory ──
function renderNlHistory(){
  const hist=document.getElementById('nlHistory');
  if(!hist)return;
  if(!nlHistory.length){hist.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--mt);font-size:12px">발송 기록이 없어요</div>';return;}
  hist.innerHTML=nlHistory.slice(0,10).map(h=>`
    <div style="background:var(--sur2);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;margin-bottom:7px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-size:12px">${h.isTest?'🧪':'📨'}</span>
        <div style="font-size:12px;font-weight:700;color:var(--tx);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.subject}</div>
        <span style="font-size:10px;background:var(--sur3);border-radius:999px;padding:2px 7px;color:var(--mt);flex-shrink:0">${h.count}명</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:10px;color:var(--mt)">글: ${h.post.substring(0,20)}</div>
        <div style="font-size:10px;color:var(--mt)">${h.date}</div>
      </div>
    </div>
  `).join('');
}

// ── nlStartAuto ──
function nlStartAuto(){
  const time=document.getElementById('nlAutoTime')?.value||'09:00';
  const freq=document.getElementById('nlAutoFreq')?.value||'weekly';
  if(nlTimer)clearInterval(nlTimer);
  const freqLabel={daily:'매일',weekly:'매주',monthly:'매월'}[freq];
  toast(`🤖 자동 발송 설정됨! ${freqLabel} ${time}에 발송돼요`);
  // 1분마다 체크
  nlTimer=setInterval(async()=>{
    const now=new Date();
    const cur=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    if(cur!==time||!nlEmails.length)return;
    // 글 선택
    let postId='';
    const allPosts=[];
    CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>allPosts.push(it))));
    if(allPosts.length){
      if(nlAutoSelect==='random'){
        postId=allPosts[Math.floor(Math.random()*allPosts.length)].id;
      }else{
        postId=allPosts[0].id; // 최신글
      }
    }
    await nlSendProcess(nlEmails,'['+freqLabel+'] TARRY의 데일리 뉴스레터',postId,'',false);
  },60000);
}

// ── subscribeEmail ──
function subscribeEmail(){
  const e=document.getElementById('emailInp')?.value?.trim();
  if(!e||!e.includes('@')){toast('이메일 형식을 확인해주세요');return;}
  // 중복 체크
  var isDup = false;
  try{
    const saved=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');
    isDup = saved.includes(e);
    if(!isDup){
      saved.push(e);
      localStorage.setItem('tarry_subscribers',JSON.stringify(saved));
      nlEmails=saved;
    }
  }catch(err){}
  const inp=document.getElementById('emailInp');if(inp)inp.value='';
  if(isDup){ toast('이미 구독 중인 이메일이에요 😊'); return; }
  // 구독 성공 팝업
  var existing2 = document.getElementById('subSuccessPop');
  if(existing2) existing2.remove();
  var pop = document.createElement('div');
  pop.id = 'subSuccessPop';
  pop.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  pop.onclick = function(ev){ if(ev.target===pop) pop.remove(); };
  pop.innerHTML='<div style="background:var(--sur);border-radius:22px;padding:30px 26px;text-align:center;max-width:320px;width:100%;box-shadow:0 24px 70px rgba(6,182,212,.25)">'
    +'<div style="font-size:52px;margin-bottom:10px">💌</div>'
    +'<h2 style="font-family:var(--display);font-size:20px;color:var(--tx);margin-bottom:8px">구독 완료!</h2>'
    +'<p style="font-size:13px;color:var(--mt);margin-bottom:18px"><strong style="color:var(--ac)">'+e+'</strong><br>뉴스레터 구독이 완료됐어요 😊<br>새 글 소식을 이메일로 받아보세요!</p>'
    +'<button onclick="document.getElementById(\'subSuccessPop\').remove()" style="background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;border:none;border-radius:10px;padding:12px 30px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)">확인 ✓</button>'
    +'</div>';
  document.body.appendChild(pop);
  setTimeout(function(){ if(pop.parentNode) pop.remove(); }, 5000);
  toast('✅ 구독 완료! 소식을 보내드릴게요 😊');
}

// ── buildRSSXML ──
function buildRSSXML(){
  var siteUrl  = 'https://tarrydaily.com';
  var feedUrl  = siteUrl + '/feed.xml';
  var siteName = localStorage.getItem('tarry_admin_name') || 'TARRY의 데일리';
  var siteDesc = localStorage.getItem('tarry_admin_bio')  || '생활꿀팁, 돈되는정보, IT, 트렌드 — 매일 새로운 정보를 업데이트해요';
  var now      = new Date().toUTCString();

  // 전체 글 모으기
  var allPosts = [];
  try{
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        l2.items.forEach(function(it){
          allPosts.push({
            title:   it.title || '',
            desc:    it.desc  || '',
            date:    it.date  || '',
            emoji:   it.emoji || '📄',
            id:      it.id    || '',
            cat:     l1.name  || ''
          });
        });
      });
    });
  }catch(e){}

  // 최신 20개
  var items = allPosts.slice(0, 20);

  var esc = function(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0"\n';
  xml += '  xmlns:atom="http://www.w3.org/2005/Atom"\n';
  xml += '  xmlns:dc="http://purl.org/dc/elements/1.1/">\n';
  xml += '  <channel>\n';
  xml += '    <title>' + esc(siteName) + '</title>\n';
  xml += '    <link>' + siteUrl + '</link>\n';
  xml += '    <description>' + esc(siteDesc) + '</description>\n';
  xml += '    <language>ko</language>\n';
  xml += '    <lastBuildDate>' + now + '</lastBuildDate>\n';
  xml += '    <atom:link href="' + feedUrl + '" rel="self" type="application/rss+xml"/>\n\n';

  items.forEach(function(p, i){
    var postUrl = siteUrl + '#post-' + (p.id || i);
    // 날짜 파싱 시도
    var pubDate = now;
    try{
      var d = new Date(p.date.replace(/(\d{4})\.(\d{1,2})\.(\d{1,2})/,'$1-$2-$3'));
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
  return { xml: xml, count: items.length };
}

// ── previewRSSFeed ──
function previewRSSFeed(){
  var result  = buildRSSXML();
  var preview = document.getElementById('rssFeedPreview');
  var count   = document.getElementById('rssFeedItemCount');
  if(count)   count.textContent = result.count + '개 글';
  if(preview) preview.textContent = result.xml.substring(0, 800) + '\n\n... (총 ' + result.count + '개 항목)';
  toast('👁️ 미리보기 업데이트됐어요!');
}

// ── downloadRSSFeed ──
function downloadRSSFeed(){
  var result = buildRSSXML();
  if(result.count === 0){
    toast('⚠️ 등록된 글이 없어요. 카테고리에 글을 먼저 추가해주세요');
    return;
  }
  var blob = new Blob([result.xml], {type: 'application/rss+xml;charset=utf-8'});
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'feed.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // 미리보기도 업데이트
  var count = document.getElementById('rssFeedItemCount');
  if(count) count.textContent = result.count + '개 글';

  toast('✅ feed.xml 다운로드 완료! Cloudflare Pages에 업로드해주세요');
}

// ── testRSSConnection ──
async function testRSSConnection(){
  var url    = (document.getElementById('rssTestUrl')?.value||'').trim();
  var result = document.getElementById('rssTestResult');
  if(!url){ toast('URL을 입력해주세요'); return; }
  if(result){ result.style.display='block'; result.textContent='🔄 연결 테스트 중...'; result.style.background='rgba(59,130,246,.08)'; result.style.border='1px solid rgba(59,130,246,.2)'; result.style.color='#3b82f6'; }
  try{
    // rss2json 프록시로 테스트
    var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url) + '';
    var res  = await fetch(proxyUrl, {signal: AbortSignal.timeout(8000)});
    var data = await res.json();
    if(data.status === 'ok' && data.items?.length){
      if(result){
        result.textContent = '✅ 연결 성공! ' + data.items.length + '개 글 확인됨 — 관리자 RSS 탭에서 동기화하세요';
        result.style.background = 'rgba(5,150,105,.08)';
        result.style.border     = '1px solid rgba(5,150,105,.2)';
        result.style.color      = '#059669';
      }
      toast('✅ RSS 연결 성공! ' + data.items.length + '개 글 확인됨');
    } else {
      throw new Error(data.message || '글을 찾을 수 없어요');
    }
  }catch(e){
    if(result){
      result.textContent = '❌ 연결 실패 — feed.xml이 아직 업로드되지 않았거나 URL을 확인해주세요\n오류: ' + (e.message||e);
      result.style.background = 'rgba(220,38,38,.06)';
      result.style.border     = '1px solid rgba(220,38,38,.15)';
      result.style.color      = '#dc2626';
    }
    toast('❌ RSS 연결 실패 — feed.xml 업로드 여부를 확인해주세요');
  }
}