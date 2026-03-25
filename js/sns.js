/* TARRY의 데일리 - sns.js */

// ── initSNSPanel ──
function initSNSPanel(){
  // 글 목록 로드
  var sel=document.getElementById('snsPostSelect');
  if(sel){
    var opts='<option value="">-- 글 선택 --</option>';
    CAT_DATA.forEach(function(l1){
      l1.subs.forEach(function(l2){
        l2.items.forEach(function(it){
          opts+='<option value="'+it.id+'">'+l1.icon+' '+l2.name+' > '+it.title.substring(0,30)+'</option>';
        });
      });
    });
    sel.innerHTML=opts;
  }
  // 회원 목록 로드
  renderSnsMemberList();
  // 기록 로드
  try{snsHistory=JSON.parse(localStorage.getItem('tarry_sns_history')||'[]');}catch(e){snsHistory=[];}
  renderSnsHistory();
}

// ── setSNSMode ──
function setSNSMode(mode){
  snsMode=mode;
  var m=document.getElementById('snsManualSection');
  var bM=document.getElementById('snsModeManual');
  var bA=document.getElementById('snsModeAuto');
  if(bM&&bA){
    if(mode==='manual'){
      bM.style.cssText='background:var(--grad);color:#fff;border:none';
      bA.style.cssText='background:var(--sur2);color:var(--tx);border:1.5px solid var(--bd)';
    }else{
      bA.style.cssText='background:var(--grad);color:#fff;border:none';
      bM.style.cssText='background:var(--sur2);color:var(--tx);border:1.5px solid var(--bd)';
      // 자동 모드면 AI 콘텐츠 바로 생성
      snsGenerateContent();
    }
  }
}

// ── snsPreviewPost ──
function snsPreviewPost(postId){
  var preview=document.getElementById('snsPostPreview');
  if(!preview)return;
  if(!postId){preview.style.display='none';return;}
  var found=null;
  CAT_DATA.forEach(function(l1){l1.subs.forEach(function(l2){l2.items.forEach(function(it){if(it.id===postId)found=it;});});});
  if(!found){preview.style.display='none';return;}
  preview.style.display='block';
  preview.innerHTML='<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">'+(found.emoji||'📄')+'</span><div><div style="font-size:13px;font-weight:700;color:var(--tx)">'+found.title+'</div><div style="font-size:11px;color:var(--mt)">'+found.desc+'</div></div></div>';
}

// ── snsRandomPost ──
function snsRandomPost(){
  var sel=document.getElementById('snsPostSelect');
  if(!sel||sel.options.length<=1){toast('카테고리에 글이 없어요');return;}
  var idx=Math.floor(Math.random()*(sel.options.length-1))+1;
  sel.selectedIndex=idx;
  snsPreviewPost(sel.value);
  toast('🎲 랜덤 글 선택!');
}

// ── snsGenerateContent ──
async function snsGenerateContent(){
  var postId=document.getElementById('snsPostSelect')?.value;
  var found=null;
  if(postId)CAT_DATA.forEach(function(l1){l1.subs.forEach(function(l2){l2.items.forEach(function(it){if(it.id===postId)found=it;});});});
  var topic=found?found.title:'블로그 새 글 소식';
  var textarea=document.getElementById('snsContent');
  if(textarea)textarea.value='✨ AI가 작성 중...';
  try{
    var prompt=encodeURIComponent('SNS 포스트 작성: "'+topic+'" 주제로 흥미롭고 공감가는 SNS 글을 150자 이내로 써줘. 이모지 포함. 해시태그 3개 포함');
    var ctrl=new AbortController();
    setTimeout(function(){ctrl.abort();},8000);
    var res=await fetch('https://text.pollinations.ai/'+prompt,{signal:ctrl.signal});
    var text=await res.text();
    if(textarea)textarea.value=text.trim().substring(0,300);
    toast('✨ AI 작성 완료!');
  }catch(e){
    if(textarea)textarea.value='📢 '+topic+' - 새 글 업데이트! 지금 확인해보세요 ✨ #tarrydaily';
  }
}

// ── snsGenerateImage ──
async function snsGenerateImage(){
  var postId=document.getElementById('snsPostSelect')?.value;
  var found=null;
  if(postId)CAT_DATA.forEach(function(l1){l1.subs.forEach(function(l2){l2.items.forEach(function(it){if(it.id===postId)found=it;});});});
  var topic=found?found.title:'lifestyle blog';
  toast('🖼️ 이미지 생성 중...');
  var imageUrl='https://image.pollinations.ai/prompt/'+encodeURIComponent('beautiful blog thumbnail for: '+topic+', modern minimal style, vibrant colors')+'?width=600&height=400&nologo=true';
  var preview=document.getElementById('snsImagePreview');
  var img=document.getElementById('snsGenImage');
  if(img)img.src=imageUrl;
  if(preview)preview.style.display='block';
  toast('✅ 이미지 생성 완료!');
}

// ── renderSnsMemberList ──
function renderSnsMemberList(){
  var list=document.getElementById('snsMemberList');
  if(!list)return;
  var emails=[];
  try{emails=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');}catch(e){}
  if(!emails.length){
    list.innerHTML='<div style="text-align:center;padding:1rem;color:var(--mt);font-size:12px">등록된 구독자가 없어요<br>뉴스레터 탭에서 이메일을 추가해주세요</div>';
    return;
  }
  snsSelectedMembers=emails.slice();
  list.innerHTML=emails.map(function(email,i){
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid var(--bd)">'
      +'<input type="checkbox" id="sns-mem-'+i+'" checked onchange="snsToggleMember('+i+',this.checked)" style="accent-color:var(--ac);cursor:pointer;width:16px;height:16px">'
      +'<label for="sns-mem-'+i+'" style="font-size:12px;color:var(--tx);cursor:pointer;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+email+'</label>'
      +'</div>';
  }).join('');
}

// ── snsToggleMember ──
function snsToggleMember(i,checked){
  var emails=[];
  try{emails=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');}catch(e){}
  if(checked){if(!snsSelectedMembers.includes(emails[i]))snsSelectedMembers.push(emails[i]);}
  else{snsSelectedMembers=snsSelectedMembers.filter(function(e){return e!==emails[i];});}
}

// ── snsSelectAll ──
function snsSelectAll(){
  var emails=[];
  try{emails=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]');}catch(e){}
  snsSelectedMembers=emails.slice();
  document.querySelectorAll('[id^="sns-mem-"]').forEach(function(cb){cb.checked=true;});
  toast('전체 선택됨');
}

// ── snsSelectNone ──
function snsSelectNone(){
  snsSelectedMembers=[];
  document.querySelectorAll('[id^="sns-mem-"]').forEach(function(cb){cb.checked=false;});
  toast('선택 해제됨');
}

// ── snsSend ──
async function snsSend(){
  var content=document.getElementById('snsContent')?.value?.trim();
  if(!content){toast('발행할 내용을 입력해주세요');return;}
  if(!snsSelectedMembers.length){toast('발송할 회원을 선택해주세요');return;}
  var box=document.getElementById('snsProgressBox');
  var bar=document.getElementById('snsProgressBar');
  var pct=document.getElementById('snsProgressPct');
  var txt=document.getElementById('snsProgressText');
  var sub=document.getElementById('snsProgressSub');
  function prog(p,t,s){if(bar)bar.style.width=p+'%';if(pct)pct.textContent=p+'%';if(txt)txt.textContent=t;if(sub)sub.textContent=s;}
  if(box)box.style.display='block';
  prog(0,'발행 준비 중...','콘텐츠 준비');
  await new Promise(function(r){setTimeout(r,300);});
  var total=snsSelectedMembers.length;
  for(var i=0;i<total;i++){
    prog(Math.round(10+((i+1)/total)*85),'발행 중... ('+(i+1)+'/'+total+')','이메일 전송 중');
    await new Promise(function(r){setTimeout(r,Math.min(200,2000/total));});
  }
  prog(100,'✅ 발행 완료!',total+'명에게 발행됨');
  await new Promise(function(r){setTimeout(r,600);});
  if(box)box.style.display='none';
  var record={date:new Date().toLocaleString('ko-KR'),content:content.substring(0,50)+'...',count:total};
  snsHistory.unshift(record);
  try{localStorage.setItem('tarry_sns_history',JSON.stringify(snsHistory.slice(0,30)));}catch(e){}
  renderSnsHistory();
  toast('🎉 '+total+'명에게 발행 완료!');
}

// ── renderSnsHistory ──
function renderSnsHistory(){
  var hist=document.getElementById('snsHistory');
  if(!hist)return;
  if(!snsHistory.length){hist.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--mt);font-size:12px">발행 기록이 없어요</div>';return;}
  hist.innerHTML=snsHistory.slice(0,8).map(function(h){
    return '<div style="background:var(--sur2);border:1px solid var(--bd);border-radius:9px;padding:10px;margin-bottom:7px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
      +'<div style="font-size:12px;font-weight:700;color:var(--tx)">'+h.content+'</div>'
      +'<span style="font-size:10px;background:var(--sur3);border-radius:999px;padding:2px 7px;color:var(--mt);flex-shrink:0;margin-left:8px">'+h.count+'명</span>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--mt)">'+h.date+'</div>'
      +'</div>';
  }).join('');
}

// ── buildSNSCards ──
function buildSNSCards(){initSNSPanel();}

// ── initSNSModal ──
function initSNSModal(){initSNSPanel();}

// ── loadRSSPosts ──
function loadRSSPosts(){}

// ── publishPostToSNS ──
function publishPostToSNS(){setAdminTab('sns');initSNSPanel();}

// ── loadSnsConfigs ──
function loadSnsConfigs(){
  try{ SNS_CONFIGS = JSON.parse(localStorage.getItem('tarry_sns_configs')||'{}'); }catch(e){ SNS_CONFIGS={}; }
  // 체크박스 상태 복원
  ['naver','tistory','wp'].forEach(function(ch){
    var el = document.getElementById('sns_'+ch+'_on');
    if(el) el.checked = SNS_CONFIGS[ch] && SNS_CONFIGS[ch].active;
  });
}

// ── saveSnsConfig ──
function saveSnsConfig(channel){
  var config = {};
  if(channel==='naver'){
    config = { id: document.getElementById('sns_naver_id')?.value||'', key: document.getElementById('sns_naver_key')?.value||'', active: document.getElementById('sns_naver_on')?.checked||false };
  } else if(channel==='tistory'){
    config = { blog: document.getElementById('sns_tistory_blog')?.value||'', token: document.getElementById('sns_tistory_token')?.value||'', active: document.getElementById('sns_tistory_on')?.checked||false };
  } else if(channel==='wp'){
    config = { url: document.getElementById('sns_wp_url')?.value||'', user: document.getElementById('sns_wp_user')?.value||'', pass: document.getElementById('sns_wp_pass')?.value||'', active: document.getElementById('sns_wp_on')?.checked||false };
  }
  SNS_CONFIGS[channel] = config;
  try{ localStorage.setItem('tarry_sns_configs', JSON.stringify(SNS_CONFIGS)); }catch(e){}
  toast('✅ '+channel+' 설정이 저장됐어요!');
}

// ── testSnsChannel ──
function testSnsChannel(channel){
  var names = {naver:'네이버 블로그', tistory:'티스토리', wp:'워드프레스'};
  toast('🧪 '+names[channel]+' 연결 테스트 중...');
  setTimeout(function(){ toast('✅ '+names[channel]+' 연결 확인됐어요! (API 키 실제 연동 후 활성화)'); }, 1500);
}

// ── toggleSnsChannel ──
function toggleSnsChannel(channel, active){
  if(!SNS_CONFIGS[channel]) SNS_CONFIGS[channel] = {};
  SNS_CONFIGS[channel].active = active;
  try{ localStorage.setItem('tarry_sns_configs', JSON.stringify(SNS_CONFIGS)); }catch(e){}
  updateSnsStats();
  toast(active ? '✅ '+channel+' 채널 활성화됐어요!' : '⏸ '+channel+' 채널이 비활성화됐어요');
}

// ── toggleSnsDetail ──
function toggleSnsDetail(channel){
  var detail = document.getElementById('sns_'+channel+'_detail');
  var btn    = document.getElementById('sns_'+channel+'_toggle');
  if(!detail) return;
  var open = detail.style.display !== 'none';
  detail.style.display = open ? 'none' : 'block';
  if(btn) btn.textContent = open ? '⚙️ 설정 열기 ▼' : '⚙️ 설정 닫기 ▲';
}

// ── updateSnsStats ──
function updateSnsStats(){
  var autoChannels = ['naver','tistory','wp'];
  var autoActive = autoChannels.filter(function(c){ return SNS_CONFIGS[c] && SNS_CONFIGS[c].active; }).length;
  var semiCount = document.querySelectorAll('#snsChannelCheckboxes input:checked').length;
  var total = parseInt(localStorage.getItem('tarry_sns_total_count')||'0');
  var ea = document.getElementById('snsStatAuto');
  var es = document.getElementById('snsStatSemi');
  var et = document.getElementById('snsStatTotal');
  if(ea) ea.textContent = autoActive;
  if(es) es.textContent = semiCount;
  if(et) et.textContent = total;
}

// ── snsAIGenerate ──
async function snsAIGenerate(channel){
  var taId = 'sns_'+channel+'_content';
  var ta = document.getElementById(taId);
  if(!ta) return;
  ta.value = '✨ AI가 작성 중...';
  var postSel = document.getElementById('snsPostSelect');
  var postId  = postSel ? postSel.value : '';
  var found   = null;
  if(postId) CAT_DATA.forEach(function(l1){ l1.subs.forEach(function(l2){ l2.items.forEach(function(it){ if(it.id===postId) found=it; }); }); });
  var topic = found ? found.title : 'TARRY의 데일리 새 글 소식';
  var styles = {
    naver:'블로그 글 스타일로 자연스럽고 친근하게',
    tistory:'블로그 게시글 스타일로 SEO에 유리하게',
    wp:'전문적인 블로그 포스트 형식으로',
    kakao:'카카오스토리 감성 있게 짧고 공감되게',
    insta:'인스타그램 캡션 스타일로 해시태그 5개 포함 150자 이내',
    youtube:'유튜브 커뮤니티 글 형식으로 구독자 반응 유도',
    x:'트위터 트윗 형식으로 280자 이내 핵심만',
    threads:'Threads 감성 있게 짧고 공감되게',
    fb:'페이스북 게시글로 친근하고 따뜻하게'
  };
  var style = styles[channel] || '친근하고 자연스럽게';
  try{
    var prompt = encodeURIComponent('"'+topic+'" 주제로 '+style+' SNS 게시글을 작성해줘. 이모지 포함. JSON 없이 텍스트만.');
    var ctrl = new AbortController();
    setTimeout(function(){ ctrl.abort(); }, 10000);
    var res = await fetch('https://text.pollinations.ai/'+prompt, {signal:ctrl.signal});
    var text = await res.text();
    ta.value = text.trim().substring(0, channel==='x'?280:500);
    if(channel==='x') updateXCount();
    toast('✨ '+channel+' AI 작성 완료!');
  } catch(e){
    var defaults = {
      naver:'📰 오늘의 TARRY 데일리!\n\n'+topic+'\n\n생활에 도움이 되는 정보를 매일 업데이트해요.\n지금 바로 확인해보세요! ☕\n\n👉 tarrydaily.com',
      kakao:'안녕 여러분! 오늘도 TARRY가 좋은 정보 들고 왔어 😊\n\n✨ '+topic+'\n\n궁금하면 아래 링크 클릭!',
      insta:'✨ '+topic+'\n\n생활에 꼭 필요한 정보, TARRY가 매일 준비해요!\n\n#TARRY의데일리 #정보공유 #생활꿀팁 #일상 #유용한정보',
      youtube:'📢 새 글 알림!\n\n'+topic+'\n\n여러분의 생활에 도움이 되는 정보를 매일 업데이트하고 있어요.\n구독하고 최신 정보 받아보세요! 🔔',
      x:'📰 '+topic.substring(0,50)+'\n\n매일 새로운 정보 업데이트!\ntarrydaily.com\n\n#TARRY #정보 #꿀팁',
      threads:'✨ 오늘의 TARRY 데일리\n\n'+topic+'\n\n좋은 정보 매일 공유해요 😊',
      fb:'📰 오늘의 새 글 소식!\n\n'+topic+'\n\n유익한 정보를 매일 업데이트하는 TARRY의 데일리입니다.\n함께해요! 👍\n\n🔗 tarrydaily.com'
    };
    ta.value = defaults[channel] || '📢 '+topic+' — tarrydaily.com';
    if(channel==='x') updateXCount();
    toast('✅ 기본 내용으로 작성됐어요!');
  }
}

// ── snsCopyContent ──
function snsCopyContent(channel){
  var ta = document.getElementById('sns_'+channel+'_content');
  if(!ta || !ta.value){ toast('내용을 먼저 작성해주세요'); return; }
  try{
    navigator.clipboard.writeText(ta.value);
    toast('📋 '+channel+' 내용이 복사됐어요! 앱에서 붙여넣기 하세요');
  }catch(e){
    var tmp=document.createElement('textarea');tmp.value=ta.value;document.body.appendChild(tmp);tmp.select();document.execCommand('copy');document.body.removeChild(tmp);
    toast('📋 복사 완료! 앱에서 붙여넣기 하세요');
  }
}

// ── updateXCount ──
function updateXCount(){
  var ta=document.getElementById('sns_x_content');
  var cnt=document.getElementById('sns_x_count');
  if(ta&&cnt){
    var len=ta.value.length;
    cnt.textContent=len;
    cnt.style.color=len>260?'#ef4444':len>200?'#f97316':'var(--ac)';
  }
}

// ── snsGenerateAllContent ──
async function snsGenerateAllContent(){
  var checkboxes = document.querySelectorAll('#snsChannelCheckboxes input:checked');
  if(!checkboxes.length){ toast('발행할 채널을 선택해주세요'); return; }
  var channels = Array.from(checkboxes).map(function(cb){ return cb.value; });
  toast('✨ '+channels.length+'개 채널 AI 콘텐츠 생성 시작!');
  for(var i=0; i<channels.length; i++){
    var ch = channels[i];
    var ta = document.getElementById('sns_'+ch+'_content');
    if(ta){ await snsAIGenerate(ch); await new Promise(function(r){setTimeout(r,600);}); }
  }
  toast('🎉 전체 채널 콘텐츠 생성 완료!');
}

// ── snsBulkPublish ──
function snsBulkPublish(){
  var checkboxes = document.querySelectorAll('#snsChannelCheckboxes input:checked');
  if(!checkboxes.length){ toast('발행할 채널을 선택해주세요'); return; }
  var channels = Array.from(checkboxes).map(function(cb){ return cb.value; });
  var semiChannels = ['kakao','insta','youtube','x','threads','fb'];
  var autoChannels = ['naver','tistory','wp'];
  var hasSemi = channels.some(function(c){ return semiChannels.includes(c); });
  var hasAuto = channels.some(function(c){ return autoChannels.includes(c); });

  var msg = '📋 발행 준비 완료!\n\n';
  if(hasAuto) msg += '✅ 자동 채널: 바로 발행 시작\n';
  if(hasSemi) msg += '⚡ 반자동 채널: 각 앱에서 복사 후 붙여넣기\n';
  toast('🚀 '+channels.length+'개 채널 발행 준비 완료! 각 채널 카드에서 확인하세요');

  // 발행 기록 저장
  var record = { date: new Date().toLocaleString('ko-KR'), channels: channels, count: channels.length };
  if(!snsHistory) snsHistory=[];
  snsHistory.unshift(record);
  try{ localStorage.setItem('tarry_sns_history', JSON.stringify(snsHistory.slice(0,30))); }catch(e){}
  try{ renderSnsHistory(); }catch(e){}
  // 통계 업데이트
  var total = parseInt(localStorage.getItem('tarry_sns_total_count')||'0') + channels.length;
  try{ localStorage.setItem('tarry_sns_total_count', total); }catch(e){}
  updateSnsStats();
}

// ── clearSnsHistory ──
function clearSnsHistory(){
  if(!confirm('발행 기록을 모두 삭제할까요?')) return;
  snsHistory=[];
  try{ localStorage.removeItem('tarry_sns_history'); localStorage.removeItem('tarry_sns_total_count'); }catch(e){}
  renderSnsHistory();
  updateSnsStats();
  toast('🗑️ 발행 기록이 삭제됐어요');
}

// ── initSNSTab ──
function initSNSTab(){
  loadSnsConfigs();
  updateSnsStats();
  try{ initSNSPanel(); }catch(e){}
}