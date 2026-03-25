/* TARRY의 데일리 - admin.js */

// ── switchTab ──
function switchTab(id){
  var adminPage=document.getElementById('page-admin');
  if(adminPage){adminPage.style.display='block';adminPage.classList.add('on');}
  document.querySelectorAll('.page').forEach(function(p){
    if(p.id!=='page-admin'){p.style.display='none';p.classList.remove('on');}
  });
  var pids=['dash','remote','rss','sns','cat','theme','seo','biz','pw','analytics','news','stats','files','write','newsletter'];
  for(var i=0;i<pids.length;i++){
    var el=document.getElementById('ap-'+pids[i]);
    if(el) el.style.display=(pids[i]===id)?'block':'none';
  }
  var btns=document.querySelectorAll('.atab-admin');
  for(var j=0;j<btns.length;j++){ btns[j].style.cssText=''; }
  var ab=document.getElementById('at-'+id);
  if(ab) ab.style.cssText='background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-weight:800';
  try{if(id==='stats')refreshAdminStats();}catch(e){}
  try{if(id==='newsletter')initNewsletterTab();}catch(e){}
  try{if(id==='cat')renderAdminCatTree();}catch(e){}
  try{if(id==='files')initFilesTab();}catch(e){}
  try{if(id==='write')initWritePanel();}catch(e){}
  try{if(id==='rss')initRssTab();}catch(e){}
  try{if(id==='remote')initRemoteTab();}catch(e){}
  try{if(id==='sns')initSNSTab();}catch(e){}
  try{if(id==='pw')loadAdminProfile();}catch(e){}
  try{if(id==='dash'){renderAdminComments();renderAdminComments2();refreshAdminStats();}}catch(e){}
}

// ── refreshAdminStats ──
function refreshAdminStats(){
  var ti=document.getElementById('manualTotalInput');
  var di=document.getElementById('manualDailyInput');
  if(ti&&!ti.value)ti.value=STATS.data.totalVisitors;
  if(di&&!di.value)di.value=STATS.data.dailyVisitors;

  // 구독자 수 업데이트
  try{
    const subs=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');
    const subEl=document.getElementById('adminStatSubs');if(subEl)subEl.textContent=subs.length;
  }catch(e){}
  // 댓글 수 업데이트
  const cmtEl=document.getElementById('adminStatComments');if(cmtEl)cmtEl.textContent=comments.length;
  // 방문자 차트 그리기
  try{drawVisitorChart();}catch(e){}

  const dt=document.getElementById('dashStatTotal'),dd=document.getElementById('dashStatDaily'),dp=document.getElementById('dashStatPosts');
  if(dt)dt.textContent=STATS.fmt(STATS.data.totalVisitors);
  if(dd)dd.textContent=STATS.fmt(STATS.data.dailyVisitors);
  if(dp){const cnt=CAT_DATA.reduce((a,l1)=>a+l1.subs.reduce((b,l2)=>b+l2.items.length,0),0);dp.textContent=cnt;}
  
  const t=document.getElementById('adminStatTotal'),d=document.getElementById('adminStatDaily'),p=document.getElementById('adminStatPosts');
  if(t)t.textContent=STATS.fmt(STATS.data.totalVisitors);
  if(d)d.textContent=STATS.fmt(STATS.data.dailyVisitors);
  if(p){const cnt=CAT_DATA.reduce((a,l1)=>a+l1.subs.reduce((b,l2)=>b+l2.items.length,0),0);p.textContent=cnt;}
  toast('📊 통계 새로고침!');
}

// ── drawVisitorChart ──
function drawVisitorChart(){
  const chart=document.getElementById('visitorChart');
  const labels=document.getElementById('visitorChartLabels');
  if(!chart)return;
  const days=['일','월','화','수','목','금','토'];
  const today=new Date().getDay();
  const data=[];
  const base=STATS.data.dailyVisitors||100;
  for(let i=6;i>=0;i--){
    const variance=0.6+Math.random()*0.8;
    data.push(Math.floor(base*variance));
  }
  data[6]=STATS.data.dailyVisitors;
  const max=Math.max(...data)||1;
  chart.innerHTML=data.map((v,i)=>{
    const h=Math.max(8,Math.round((v/max)*100))+'%';
    const isToday=i===6;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="font-size:9px;color:var(--mt)">${v}</div>
      <div style="width:100%;height:${h};background:${isToday?'var(--grad)':'rgba(124,58,237,.3)'};border-radius:4px 4px 0 0;min-height:8px;transition:.3s"></div>
    </div>`;
  }).join('');
  if(labels){
    const dayLabels=[];
    for(let i=6;i>=0;i--){dayLabels.unshift(days[(today-i+7)%7]);}
    labels.innerHTML=dayLabels.map((d,i)=>`<span style="color:${i===6?'var(--ac)':'var(--mt)'};font-weight:${i===6?700:400}">${d}</span>`).join('');
  }
}

// ── applyManualStats ──
function applyManualStats(type){
  if(type==='total'){
    var val = parseInt(document.getElementById('manualTotalInput')?.value||'0');
    if(val>0){STATS.data.totalVisitors=val;STATS.save();STATS.upd();refreshAdminStats();toast('✅ 누적 방문자 '+val.toLocaleString()+'명으로 설정!');}
    else{toast('올바른 숫자를 입력해주세요');}
  } else {
    var val2 = parseInt(document.getElementById('manualDailyInput')?.value||'0');
    if(val2>=0){STATS.data.dailyVisitors=val2;STATS.save();STATS.upd();refreshAdminStats();toast('✅ 오늘 방문자 '+val2.toLocaleString()+'명으로 설정!');}
    else{toast('올바른 숫자를 입력해주세요');}
  }
}

// ── startAutoIncrease ──
function startAutoIncrease(){
  if(autoIncTimer){clearInterval(autoIncTimer);}
  var interval = parseInt(document.getElementById('autoIncInterval')?.value||'60000');
  var amount = parseInt(document.getElementById('autoIncAmount')?.value||'3');
  autoIncTimer = setInterval(function(){
    STATS.data.totalVisitors += amount;
    STATS.data.dailyVisitors += Math.ceil(amount/2);
    STATS.save(); STATS.upd();
    var t=document.getElementById('adminStatTotal'),d=document.getElementById('adminStatDaily');
    if(t)t.textContent=STATS.fmt(STATS.data.totalVisitors);
    if(d)d.textContent=STATS.fmt(STATS.data.dailyVisitors);
    var dt=document.getElementById('dashStatTotal'),dd=document.getElementById('dashStatDaily');
    if(dt)dt.textContent=STATS.fmt(STATS.data.totalVisitors);
    if(dd)dd.textContent=STATS.fmt(STATS.data.dailyVisitors);
  }, interval);
  var st=document.getElementById('autoIncStatus');
  if(st)st.innerHTML='<span style="color:#10b981;font-weight:700">▶ 자동 증가 중 ('+amount+'명/'+interval/1000+'초)</span>';
  toast('▶ 자동 증가 시작! '+amount+'명씩 증가');
}

// ── stopAutoIncrease ──
function stopAutoIncrease(){
  if(autoIncTimer){clearInterval(autoIncTimer);autoIncTimer=null;}
  var st=document.getElementById('autoIncStatus');
  if(st)st.textContent='자동 증가 꺼짐';
  toast('⏹ 자동 증가 정지');
}

// ── buildThemePresets ──
function buildThemePresets(){const g=document.getElementById('presetGrid');if(g)g.innerHTML='<div style="color:var(--mt);font-size:12px;text-align:center;padding:1rem">테마 준비 중이에요</div>';}

// ── applyPreset ──
function applyPreset(){}

// ── initFilesTab ──
function initFilesTab(){
  updatePPTDisplay();
  renderPPTLeadList();
}

// ── updatePPTDisplay ──
function updatePPTDisplay(){
  var d = document.getElementById('currentPPTDisplay');
  if(!d) return;
  var fileData = localStorage.getItem('tarry_ppt_file');
  var url      = localStorage.getItem('tarry_ppt_url');
  var meta     = {};
  try{ meta = JSON.parse(localStorage.getItem('tarry_ppt_meta')||'{}'); }catch(e){}

  if(fileData){
    var sizeKB = meta.size ? Math.round(meta.size/1024) : '?';
    d.innerHTML = '<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:20px">📎</span>'
      +'<div><div style="font-size:13px;font-weight:700;color:var(--tx)">'+(meta.name||'업로드된 파일')+'</div>'
      +'<div style="font-size:11px;color:var(--mt)">'+(meta.date||'')+' · '+sizeKB+'KB</div></div>'
      +'<span style="margin-left:auto;background:rgba(16,185,129,.1);color:#059669;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:700">직접업로드</span>'
      +'</div>';
  } else if(url){
    d.innerHTML = '<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:20px">🔗</span>'
      +'<a href="'+url+'" target="_blank" style="color:var(--ac);font-size:12px;text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+url.substring(0,45)+'...</a>'
      +'<span style="margin-left:auto;background:rgba(59,130,246,.1);color:#3b82f6;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:700;flex-shrink:0">링크</span>'
      +'</div>';
  } else {
    d.textContent = '등록된 파일 없음';
  }
}

// ── handlePPTFileSelect ──
function handlePPTFileSelect(input){
  if(!input.files || !input.files[0]) return;
  var file = input.files[0];
  var maxSize = 50 * 1024 * 1024; // 50MB
  if(file.size > maxSize){ toast('⚠️ 파일 크기가 50MB를 초과해요'); return; }

  var prog = document.getElementById('pptUploadProgress');
  var bar  = document.getElementById('pptUploadBar');
  var pct  = document.getElementById('pptUploadPct');
  var fname= document.getElementById('pptUploadFileName');
  if(prog) prog.style.display='block';
  if(fname) fname.textContent = file.name;

  var reader = new FileReader();
  // 진행률 시뮬레이션
  var fakeProgress = 0;
  var interval = setInterval(function(){
    fakeProgress = Math.min(fakeProgress + Math.random()*15, 90);
    if(bar) bar.style.width = fakeProgress+'%';
    if(pct) pct.textContent = Math.floor(fakeProgress)+'%';
  }, 120);

  reader.onload = function(e){
    clearInterval(interval);
    if(bar) bar.style.width='100%';
    if(pct) pct.textContent='100%';

    var data = e.target.result;
    try{
      localStorage.setItem('tarry_ppt_file', data);
      localStorage.setItem('tarry_ppt_meta', JSON.stringify({name:file.name, size:file.size, date:new Date().toLocaleString('ko-KR')}));
      localStorage.removeItem('tarry_ppt_url'); // URL 방식 초기화
    }catch(storageErr){
      // localStorage 용량 초과 시 URL 안내
      clearInterval(interval);
      if(prog) prog.style.display='none';
      toast('⚠️ 파일이 너무 커서 브라우저에 저장할 수 없어요. 구글 드라이브 URL 방식을 이용해주세요.');
      return;
    }

    setTimeout(function(){
      if(prog) prog.style.display='none';
      updatePPTDisplay();
      toast('✅ PPT 파일 등록 완료! "'+file.name+'"');
      // 드롭존 업데이트
      var dz = document.getElementById('pptDropZone');
      if(dz) dz.style.borderColor='var(--ac)';
    }, 400);
  };
  reader.onerror = function(){
    clearInterval(interval);
    if(prog) prog.style.display='none';
    toast('❌ 파일 읽기 실패. 다시 시도해주세요.');
  };
  reader.readAsDataURL(file);
}

// ── handlePPTDrop ──
function handlePPTDrop(e){
  e.preventDefault();
  var dt = document.getElementById('pptDropZone');
  if(dt) dt.style.background='';
  var files = e.dataTransfer.files;
  if(files && files[0]){
    var input = document.getElementById('pptFileInput');
    // DataTransfer를 통해 파일 전달
    var dummyInput = {files: files};
    handlePPTFileSelect(dummyInput);
  }
}

// ── savePPTUrl ──
function savePPTUrl(){
  var u = document.getElementById('pptUrlInput')?.value?.trim();
  if(!u){ toast('URL을 입력해주세요'); return; }
  localStorage.setItem('tarry_ppt_url', u);
  localStorage.removeItem('tarry_ppt_file');
  localStorage.removeItem('tarry_ppt_meta');
  document.getElementById('pptUrlInput').value='';
  updatePPTDisplay();
  toast('✅ PPT 링크 등록 완료!');
}

// ── removePPT ──
function removePPT(){
  localStorage.removeItem('tarry_ppt_url');
  localStorage.removeItem('tarry_ppt_file');
  localStorage.removeItem('tarry_ppt_meta');
  updatePPTDisplay();
  var dz=document.getElementById('pptDropZone');
  if(dz) dz.style.borderColor='';
  toast('🗑️ PPT 삭제됐어요');
}

// ── openPPTDownloadModal ──
function openPPTDownloadModal(){
  var url = localStorage.getItem('tarry_ppt_url');
  var fileData = localStorage.getItem('tarry_ppt_file');
  if(!url && !fileData){ toast('⚠️ 관리자에서 PPT를 먼저 등록해주세요!'); return; }
  var modal = document.getElementById('pptDownloadModal');
  if(modal){
    modal.style.display='flex';
    // 입력값 초기화
    ['pptLeadName','pptLeadEmail','pptLeadPhone'].forEach(function(id){
      var el=document.getElementById(id); if(el)el.value='';
    });
    var err=document.getElementById('pptModalErr'); if(err)err.style.display='none';
  }
}

// ── closePPTModal ──
function closePPTModal(){
  var modal=document.getElementById('pptDownloadModal');
  if(modal) modal.style.display='none';
}

// ── submitPPTLead ──
function submitPPTLead(){
  var name  = (document.getElementById('pptLeadName')?.value||'').trim();
  var email = (document.getElementById('pptLeadEmail')?.value||'').trim();
  var phone = (document.getElementById('pptLeadPhone')?.value||'').trim();
  var err   = document.getElementById('pptModalErr');

  function showErr(msg){ if(err){err.textContent=msg;err.style.display='block';} }

  if(!name){ showErr('이름을 입력해주세요'); return; }
  if(!email && !phone){ showErr('이메일 또는 전화번호 중 하나는 반드시 입력해주세요'); return; }
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showErr('올바른 이메일 형식이 아니에요'); return; }

  // 리드 저장
  var leads = [];
  try{ leads = JSON.parse(localStorage.getItem('tarry_ppt_leads')||'[]'); }catch(e){}
  var lead = { name:name, email:email, phone:phone, date:new Date().toLocaleString('ko-KR') };
  leads.unshift(lead);
  try{ localStorage.setItem('tarry_ppt_leads', JSON.stringify(leads)); }catch(e){}

  // 다운로드 카운트
  var cnt = parseInt(localStorage.getItem('tarry_ppt_dl_count')||'0') + 1;
  try{ localStorage.setItem('tarry_ppt_dl_count', cnt); }catch(e){}

  closePPTModal();
  // 실제 다운로드
  _doPPTDownload();
  toast('📥 다운로드 시작! 감사해요 '+name+'님 😊');
  // 관리자 패널 업데이트 (열려있으면)
  try{ renderPPTLeadList(); }catch(e){}
}

// ── _doPPTDownload ──
function _doPPTDownload(){
  var fileData = localStorage.getItem('tarry_ppt_file');
  if(fileData){
    // base64 파일 직접 다운로드
    var meta = JSON.parse(localStorage.getItem('tarry_ppt_meta')||'{}');
    var a = document.createElement('a');
    a.href = fileData;
    a.download = meta.name || 'TARRY_사용설명서.pptx';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    return;
  }
  var url = localStorage.getItem('tarry_ppt_url');
  if(url){
    var a = document.createElement('a');
    a.href = url; a.target='_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
}

// ── downloadPPT ──
function downloadPPT(){
  // 관리자 테스트용 - 모달 없이 바로 다운로드
  var url = localStorage.getItem('tarry_ppt_url');
  var fileData = localStorage.getItem('tarry_ppt_file');
  if(!url && !fileData){ toast('⚠️ PPT를 먼저 등록해주세요!'); return; }
  _doPPTDownload();
  toast('📥 다운로드 테스트 시작!');
}

// ── renderPPTLeadList ──
function renderPPTLeadList(){
  var leads = [];
  try{ leads = JSON.parse(localStorage.getItem('tarry_ppt_leads')||'[]'); }catch(e){}
  var dlCnt = localStorage.getItem('tarry_ppt_dl_count')||'0';

  var cntEl = document.getElementById('pptDownloadCount');
  var leadCntEl = document.getElementById('pptLeadCount');
  if(cntEl) cntEl.textContent = dlCnt;
  if(leadCntEl) leadCntEl.textContent = leads.length;

  var list = document.getElementById('pptLeadList');
  if(!list) return;
  if(!leads.length){
    list.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--mt);font-size:12px">아직 수집된 연락처가 없어요</div>';
    return;
  }
  list.innerHTML = leads.map(function(l,i){
    return '<div style="background:var(--sur2);border-radius:10px;padding:10px 12px;margin-bottom:7px;display:flex;align-items:center;gap:10px">'
      +'<div style="width:32px;height:32px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0">'+(l.name||'?')[0].toUpperCase()+'</div>'
      +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:13px;font-weight:700;color:var(--tx)">'+l.name+'</div>'
        +'<div style="font-size:11px;color:var(--mt)">'+(l.email||'')+(l.phone?' · '+l.phone:'')+'</div>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--mt);flex-shrink:0">'+l.date+'</div>'
      +'</div>';
  }).join('');
}

// ── exportPPTLeads ──
function exportPPTLeads(){
  var leads=[];
  try{ leads=JSON.parse(localStorage.getItem('tarry_ppt_leads')||'[]'); }catch(e){}
  if(!leads.length){ toast('수집된 연락처가 없어요'); return; }
  var csv = '이름,이메일,전화번호,다운로드일시\n';
  csv += leads.map(function(l){
    return [l.name,l.email||'',l.phone||'',l.date].map(function(v){return '"'+v+'"';}).join(',');
  }).join('\n');
  var blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='TARRY_PPT_다운로더_'+new Date().toLocaleDateString('ko-KR').replace(/\. /g,'-').replace('.','')+'_.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast('📤 CSV 파일 다운로드 완료!');
}

// ── clearPPTLeads ──
function clearPPTLeads(){
  if(!confirm('수집된 연락처를 모두 삭제할까요?')) return;
  localStorage.removeItem('tarry_ppt_leads');
  localStorage.removeItem('tarry_ppt_dl_count');
  renderPPTLeadList();
  toast('🗑️ 삭제됐어요');
}

// ── saveBiz ──
function saveBiz(){toast('저장됐어요!');}

// ── initWritePanel ──
function initWritePanel(){
  var sel=document.getElementById('writeCategory');
  if(sel&&!sel.options.length){
    var opts='<option value="">-- 카테고리 선택 --</option>';
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        opts+='<option value="'+l1.id+'__'+l2.id+'">'+l1.icon+' '+l1.name+' > '+l2.name+'</option>';
      });
    });
    sel.innerHTML=opts;
  }
  buildWriteEmojiGrid();
}

// ── buildWriteEmojiGrid ──
function buildWriteEmojiGrid(){
  var g=document.getElementById('writeEmojiGrid');
  if(!g||WRITE_EMOJIS_BUILT)return;
  WRITE_EMOJIS_BUILT=true;
  var html='';
  for(var i=0;i<WRITE_EMOJIS.length;i++){
    html+='<span class="we-item" style="font-size:22px;cursor:pointer;padding:4px;border-radius:6px;display:inline-block;transition:.1s">'+WRITE_EMOJIS[i]+'</span>';
  }
  g.innerHTML=html;
  g.addEventListener('click',function(e){
    var t=e.target;
    if(t.classList.contains('we-item')){
      var ta=document.getElementById('writeBody');
      if(!ta)return;
      var pos=ta.selectionStart||ta.value.length;
      ta.value=ta.value.slice(0,pos)+t.textContent+ta.value.slice(pos);
      ta.focus();
      ta.setSelectionRange(pos+2,pos+2);
    }
  });
}

// ── toggleWriteEmoji ──
function toggleWriteEmoji(){
  var box=document.getElementById('writeEmojiPicker');
  if(!box)return;
  var isOpen=box.style.display==='block';
  box.style.display=isOpen?'none':'block';
  if(!isOpen)buildWriteEmojiGrid();
}

// ── insertVideoLink ──
function insertVideoLink(){
  var urlEl=document.getElementById('writeVideoUrl');
  var url=urlEl?urlEl.value.trim():'';
  if(!url){toast('유튜브 URL을 입력해주세요');return;}
  var ta=document.getElementById('writeBody');
  if(!ta)return;
  var pos=ta.selectionStart||ta.value.length;
  var tag='\n[video:'+url+']\n';
  ta.value=ta.value.slice(0,pos)+tag+ta.value.slice(pos);
  if(urlEl)urlEl.value='';
  ta.focus();
  toast('✅ 영상 태그 삽입! 발행 후 글 보기에서 재생됩니다');
}

// ── newPost ──
function newPost(){
  editingPostId=null;
  var fields=['writeTitle','writeBody','writeImgUrl'];
  fields.forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var list=document.getElementById('editPostList');
  if(list)list.style.display='none';
  var sel=document.getElementById('writeCategory');
  if(sel)sel.selectedIndex=0;
  toast('📝 새 글 작성 모드');
}

// ── loadPostsForEdit ──
function loadPostsForEdit(){
  var list=document.getElementById('editPostList');
  if(!list)return;
  var isOpen=list.style.display==='block';
  if(isOpen){list.style.display='none';return;}
  list.style.display='block';
  var html='<div style="font-size:11px;font-weight:700;color:var(--mt);margin-bottom:6px;padding:0 2px">수정할 글을 선택하세요:</div>';
  CAT_DATA.forEach(function(l1){
    l1.subs.forEach(function(l2){
      l2.items.forEach(function(item){
        html+='<div class="ep-row" data-l1="'+l1.id+'" data-l2="'+l2.id+'" data-id="'+item.id+'" style="padding:8px 10px;border-radius:8px;cursor:pointer;font-size:12px;color:var(--tx);background:var(--sur3);margin-bottom:4px;border:1px solid var(--bd)">'
          +(item.emoji||'📄')+' '+item.title+'</div>';
      });
    });
  });
  list.innerHTML=html;
  list.onclick=function(e){
    var row=e.target.closest('.ep-row');
    if(!row)return;
    var catId=row.dataset.l1+'__'+row.dataset.l2;
    var postId=row.dataset.id;
    editingPostId=postId;
    var found=null;
    CAT_DATA.forEach(function(l1){l1.subs.forEach(function(l2){l2.items.forEach(function(it){if(it.id===postId)found=it;});});});
    if(!found){toast('글을 찾을 수 없어요');return;}
    document.getElementById('writeTitle').value=found.title||'';
    var img=POST_CONTENTS[postId]?.img||'';
    document.getElementById('writeImgUrl').value=img;
    var bodyEl=document.getElementById('writeBody');
    if(bodyEl){
      var raw=POST_CONTENTS[postId]?.rawBody||POST_CONTENTS[postId]?.body||'';
      bodyEl.value=raw.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().substring(0,800);
    }
    var sel=document.getElementById('writeCategory');
    if(sel){
      var parts=catId.split('__');
      for(var i=0;i<sel.options.length;i++){
        if(sel.options[i].value===catId){sel.selectedIndex=i;break;}
      }
    }
    list.style.display='none';
    toast('✅ "'+found.title.substring(0,20)+'..." 불러왔어요!');
  };
}

// ── processPostBody ──
function processPostBody(raw){
  if(!raw)return '';
  // [video:URL] → iframe
  var processed=raw.replace(/\[video:(https?:\/\/[^\]]+)\]/g,function(match,url){
    var ytId=null;
    var m1=url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    var m2=url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if(m1)ytId=m1[1];
    else if(m2)ytId=m2[1];
    if(ytId){
      return '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:14px;margin:16px 0;box-shadow:0 8px 24px rgba(0,0,0,.15)">'
        +'<iframe src="https://www.youtube.com/embed/'+ytId+'" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen allow="autoplay"></iframe></div>';
    }
    return '<a href="'+url+'" target="_blank" rel="noopener" style="color:var(--ac);font-weight:600">🎬 영상 보기: '+url+'</a>';
  });
  // 줄바꿈 → <br>
  processed=processed.replace(/\n/g,'<br>');
  return '<div style="font-size:15px;line-height:2;color:var(--mt)">'+processed+'</div>';
}

// ── previewPost ──
function previewPost(){
  var title=document.getElementById('writeTitle')?.value?.trim();
  var body=document.getElementById('writeBody')?.value?.trim();
  var img=document.getElementById('writeImgUrl')?.value?.trim()||'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';
  if(!title){toast('⚠️ 제목을 입력해주세요');return;}
  if(!body){toast('⚠️ 내용을 입력해주세요');return;}
  openPost('preview',title,'미리보기','✍️','미리보기');
  setTimeout(function(){
    var el=document.getElementById('postBodyContent');
    if(el)el.innerHTML='<img src="'+img+'" style="width:100%;border-radius:14px;margin-bottom:1.5rem;max-height:300px;object-fit:cover">'+processPostBody(body);
  },100);
}

// ── publishPost ──
function publishPost(){
  var title=document.getElementById('writeTitle')?.value?.trim();
  var body=document.getElementById('writeBody')?.value?.trim();
  var img=document.getElementById('writeImgUrl')?.value?.trim()||'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';
  var catVal=document.getElementById('writeCategory')?.value||'';
  if(!title){toast('⚠️ 제목을 입력해주세요');return;}
  if(!body){toast('⚠️ 내용을 입력해주세요');return;}
  if(!catVal){toast('⚠️ 카테고리를 선택해주세요');return;}
  var parts=catVal.split('__');
  var l1id=parts[0],l2id=parts[1];
  var l1=CAT_DATA.find(function(c){return c.id===l1id;});
  if(!l1){toast('카테고리 오류');return;}
  var l2=l1.subs.find(function(s){return s.id===l2id;});
  if(!l2){toast('서브카테고리 오류');return;}
  var today=new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  var newId=editingPostId||('post_'+Date.now());
  var bodyHtml=processPostBody(body);
  POST_CONTENTS[newId]={img:img,body:bodyHtml,rawBody:body};
  if(editingPostId){
    var updated=false;
    CAT_DATA.forEach(function(cl1){cl1.subs.forEach(function(cl2){cl2.items.forEach(function(item){if(item.id===editingPostId){item.title=title;item.date=today;updated=true;}});});});
    if(!updated)l2.items.unshift({id:newId,title:title,desc:body.substring(0,80),date:today,read:'5분',emoji:'✍️'});
  } else {
    l2.items.unshift({id:newId,title:title,desc:body.substring(0,80),date:today,read:'5분',emoji:'✍️'});
  }
  try{buildCatTree();}catch(e){}
  try{renderPosts();}catch(e){}
  toast('🚀 "'+title.substring(0,20)+'..." 발행 완료!');
  editingPostId=null;
  document.getElementById('writeTitle').value='';
  document.getElementById('writeBody').value='';
  document.getElementById('writeImgUrl').value='';
}

// ── registerCurrentPost ──
function registerCurrentPost(){toast('✅ 등록됐어요!');}

// ── showNoticePopupFull ──
function showNoticePopupFull(){
  var pop=document.getElementById('noticePopup');
  if(pop&&pop.style.display!=='flex')pop.style.display='flex';
  else showNoticePopup();
}

// ── showNoticePopup ──
function showNoticePopup(){
  var title=document.getElementById('noticeTitle')?.value||'';
  var body=document.getElementById('noticeContent')?.value||'';
  var img=document.getElementById('noticeImageUrl')?.value||'';
  if(!title&&!body){toast('제목 또는 내용을 입력해주세요');return;}
  var pop=document.getElementById('noticePopup');
  if(!pop)return;
  // 공지 배너도 업데이트
  var banner=document.getElementById('noticeBanner');
  var bannerText=document.getElementById('noticeBannerText');
  if(banner&&bannerText){
    bannerText.textContent='📢 '+title+' - 클릭해서 확인하세요!';
    banner.style.display='block';
  }
  document.getElementById('noticePopupTitle').textContent=title;
  document.getElementById('noticePopupContent').innerHTML=body.replace(/\n/g,'<br>');
  var imgDiv=document.getElementById('noticePopupImg');
  var imgEl=document.getElementById('noticePopupImgEl');
  if(img&&imgDiv&&imgEl){imgEl.src=img;imgDiv.style.display='block';}
  else if(imgDiv)imgDiv.style.display='none';
  // 유튜브 링크 처리
  var videoMatch=body.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  var vidDiv=document.getElementById('noticePopupVideo');
  var vidEl=document.getElementById('noticePopupVideoEl');
  if(videoMatch&&vidDiv&&vidEl){
    vidEl.src='https://www.youtube.com/embed/'+videoMatch[1]+'?autoplay=1';
    vidDiv.style.display='block';
  } else if(vidDiv) vidDiv.style.display='none';
  pop.style.display='flex';
}

// ── hideNoticePopup ──
function hideNoticePopup(){
  var pop=document.getElementById('noticePopup');
  if(pop)pop.style.display='none';
  var vidEl=document.getElementById('noticePopupVideoEl');
  if(vidEl)vidEl.src='';
}

// ── savePostsToStorage ──
function savePostsToStorage(){
  try{
    // CAT_DATA 전체를 저장하면 기본 글이 사라질 수 있으므로
    // 추가된 글(rss_ 접두사)만 따로 저장
    var added = {};
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        l2.items.forEach(function(it){
          // rss_ 또는 post_ 로 시작하는 추가 글만 저장
          if(it.id && (it.id.startsWith('rss_') || it.id.startsWith('post_'))){
            if(!added[l1.id]) added[l1.id] = {};
            if(!added[l1.id][l2.id]) added[l1.id][l2.id] = [];
            added[l1.id][l2.id].push(it);
          }
        });
      });
    });
    localStorage.setItem('tarry_added_posts', JSON.stringify(added));
    // POST_CONTENTS 저장
    var data = {};
    Object.keys(POST_CONTENTS).forEach(function(k){
      if(k.startsWith('rss_') || k.startsWith('post_')) data[k] = POST_CONTENTS[k];
    });
    localStorage.setItem('tarry_post_contents', JSON.stringify(data));
  }catch(e){}
}

// ── loadPostsFromStorage ──
function loadPostsFromStorage(){
  try{
    // 추가된 글만 병합 (기본 CAT_DATA는 건드리지 않음)
    var saved = localStorage.getItem('tarry_added_posts');
    if(saved){
      var added = JSON.parse(saved);
      Object.keys(added).forEach(function(l1id){
        var l1 = CAT_DATA.find(function(c){ return c.id === l1id; });
        if(!l1) return;
        Object.keys(added[l1id]).forEach(function(l2id){
          var l2 = l1.subs.find(function(s){ return s.id === l2id; });
          if(!l2) return;
          var existIds = new Set(l2.items.map(function(it){ return it.id; }));
          added[l1id][l2id].forEach(function(it){
            if(!existIds.has(it.id)) l2.items.push(it);
          });
        });
      });
    }
    var contents = localStorage.getItem('tarry_post_contents');
    if(contents){
      var pc = JSON.parse(contents);
      Object.assign(POST_CONTENTS, pc);
    }
  }catch(e){}
}
// ── OG 이미지 설정 ──
function handleOgImageUpload(input){
  if(!input.files||!input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e){
    var dataUrl = e.target.result;
    // 미리보기
    var img = document.getElementById('ogImagePreviewImg');
    var placeholder = document.getElementById('ogImagePlaceholder');
    if(img){ img.src=dataUrl; img.style.display='block'; }
    if(placeholder) placeholder.style.display='none';
    // URL 입력란에도 표시
    var urlInput = document.getElementById('ogImageUrl');
    if(urlInput) urlInput.value = '(업로드된 이미지)';
    // localStorage에 임시 저장
    try{ localStorage.setItem('tarry_og_image_data', dataUrl); }catch(e){}
    toast('✅ 이미지 업로드 완료! 저장 버튼을 눌러주세요');
  };
  reader.readAsDataURL(file);
}

function applyOgImageUrl(){
  var url = (document.getElementById('ogImageUrl')?.value||'').trim();
  if(!url){ toast('URL을 입력해주세요'); return; }
  var img = document.getElementById('ogImagePreviewImg');
  var placeholder = document.getElementById('ogImagePlaceholder');
  if(img){ img.src=url; img.style.display='block'; }
  if(placeholder) placeholder.style.display='none';
  try{ localStorage.removeItem('tarry_og_image_data'); }catch(e){}
  toast('✅ 이미지 URL 적용됐어요! 저장 버튼을 눌러주세요');
}

function saveOgImage(){
  var url = (document.getElementById('ogImageUrl')?.value||'').trim();
  var dataUrl = '';
  try{ dataUrl = localStorage.getItem('tarry_og_image_data')||''; }catch(e){}

  var finalUrl = dataUrl || url;
  if(!finalUrl){ toast('이미지를 먼저 선택해주세요'); return; }

  // og:image 메타태그 동적 업데이트
  var ogImg = document.querySelector('meta[property="og:image"]');
  var twImg = document.querySelector('meta[name="twitter:image"]');
  if(ogImg && !dataUrl) ogImg.setAttribute('content', finalUrl);
  if(twImg && !dataUrl) twImg.setAttribute('content', finalUrl);

  // localStorage에 저장
  try{
    if(dataUrl){
      localStorage.setItem('tarry_og_image_data', dataUrl);
      localStorage.removeItem('tarry_og_image_url');
    } else {
      localStorage.setItem('tarry_og_image_url', finalUrl);
      localStorage.removeItem('tarry_og_image_data');
    }
  }catch(e){}

  var msg = document.getElementById('ogSaveMsg');
  if(msg){ msg.style.display='block'; setTimeout(function(){ msg.style.display='none'; },3000); }
  toast('✅ 공유 이미지가 저장됐어요!');
}

function loadOgImageSetting(){
  try{
    var dataUrl = localStorage.getItem('tarry_og_image_data')||'';
    var url = localStorage.getItem('tarry_og_image_url')||'';
    var finalUrl = dataUrl || url;
    if(!finalUrl) return;
    var img = document.getElementById('ogImagePreviewImg');
    var placeholder = document.getElementById('ogImagePlaceholder');
    var urlInput = document.getElementById('ogImageUrl');
    if(img){ img.src=finalUrl; img.style.display='block'; }
    if(placeholder) placeholder.style.display='none';
    if(urlInput && url) urlInput.value = url;
    // 메타태그에도 적용
    if(url){
      var ogImg = document.querySelector('meta[property="og:image"]');
      var twImg = document.querySelector('meta[name="twitter:image"]');
      if(ogImg) ogImg.setAttribute('content', url);
      if(twImg) twImg.setAttribute('content', url);
    }
  }catch(e){}
}
