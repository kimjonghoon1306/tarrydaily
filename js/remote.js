/* TARRY의 데일리 - remote.js */

// ── initRemoteTab ──
function initRemoteTab(){
  var rt=document.getElementById('rc_total'),rd=document.getElementById('rc_daily'),rp=document.getElementById('rc_posts'),rc=document.getElementById('rc_cmts'),rs=document.getElementById('rc_subs'),rpptDl=document.getElementById('rc_pptDl'),rpptLead=document.getElementById('rc_pptLead');
  if(rt) rt.textContent=STATS.fmt(STATS.data.totalVisitors);
  if(rd) rd.textContent=STATS.fmt(STATS.data.dailyVisitors);
  if(rp){ var cnt=CAT_DATA.reduce(function(a,l1){return a+l1.subs.reduce(function(b,l2){return b+l2.items.length;},0);},0); rp.textContent=cnt; }
  if(rc) rc.textContent=comments.length;
  if(rs){ try{rs.textContent=JSON.parse(localStorage.getItem('tarry_subscribers')||'[]').length;}catch(e){rs.textContent=0;} }
  if(rpptDl) rpptDl.textContent=localStorage.getItem('tarry_ppt_dl_count')||'0';
  if(rpptLead){ try{rpptLead.textContent=JSON.parse(localStorage.getItem('tarry_ppt_leads')||'[]').length;}catch(e){rpptLead.textContent=0;} }
  // 팝업 상태 업데이트
  try{ updateRcPopupState(); }catch(e){}
  // 이모지 퀵피커
  var qp=document.getElementById('rcEmojiQuick');
  if(qp&&!qp.dataset.built){
    qp.dataset.built='1';
    var qEmojis=['😊','😂','❤️','🔥','✨','👍','🎉','😍','💪','🙏','😎','💯','🥰','👏','🌟','💝','😆','🤩','🎊','💫','🌸','🍀','💬','📰','✅','🚀','💡','⭐','🎯','💰'];
    qp.innerHTML=qEmojis.map(function(em){return '<span style="font-size:24px;cursor:pointer;padding:4px 5px;border-radius:8px;flex-shrink:0;line-height:1;transition:transform .1s" onmouseover="this.style.transform=\'scale(1.3)\'" onmouseout="this.style.transform=\'\'" onclick="rcPickEmoji(\''+em+'\')">'+em+'</span>';}).join('');
  }
}

// ── rcPickEmoji ──
function rcPickEmoji(emoji){
  var ta=document.getElementById('rc_cmtText');if(!ta)return;
  var pos=ta.selectionStart||ta.value.length;
  ta.value=ta.value.slice(0,pos)+emoji+ta.value.slice(pos);
  ta.focus();ta.setSelectionRange(pos+2,pos+2);
}

// ── rcInsertEmoji ──
function rcInsertEmoji(){
  var qp=document.getElementById('rcEmojiQuick');
  if(qp) qp.style.display=qp.style.display==='none'?'flex':'none';
}

// ── rcAddComment ──
function rcAddComment(){
  var name=(document.getElementById('rc_cmtName')?.value||'').trim();
  var text=(document.getElementById('rc_cmtText')?.value||'').trim();
  if(!name){toast('✏️ 작성자 이름을 입력해주세요');return;}
  if(!text){toast('💬 댓글 내용을 입력해주세요');return;}
  comments.unshift({name:name,text:text,date:new Date().toLocaleDateString('ko-KR'),likes:0});
  document.getElementById('rc_cmtName').value='';
  document.getElementById('rc_cmtText').value='';
  try{renderAdminComments();}catch(e){}try{renderAdminComments2();}catch(e){}try{renderComments();}catch(e){}
  var rc=document.getElementById('rc_cmts');if(rc)rc.textContent=comments.length;
  toast('✅ 댓글이 등록됐어요!');
}

// ── rcSendPopup ──
function rcSendPopup(){
  var name=(document.getElementById('rc_popupName')?.value||'').trim()||'방문자';
  var msg=(document.getElementById('rc_popupMsg')?.value||'').trim()||'방문하고 있어요 😊';
  SOCIAL.show({name:name,text:msg});
  toast('📣 팝업 발송됐어요!');
}

// ── toggleQuickPopupMenu ──
function toggleQuickPopupMenu(){
  var menu = document.getElementById('quickPopupMenu');
  var arrow = document.getElementById('quickPopupArrow');
  if(!menu) return;
  var open = menu.style.display === 'block';
  menu.style.display = open ? 'none' : 'block';
  if(arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
  if(!open){
    // 상태 배지 업데이트
    var badge = document.getElementById('popStartStatus');
    if(badge){
      badge.textContent = SOCIAL.active ? '● 실행중' : '대기중';
      badge.style.color = SOCIAL.active ? '#6ee7b7' : '#9ca3af';
      badge.style.background = SOCIAL.active ? 'rgba(52,211,153,.15)' : 'rgba(107,114,128,.15)';
    }
  }
  // 외부 클릭 시 닫기
  if(!open){
    setTimeout(function(){
      function outsideClick(e){
        var btn = document.getElementById('quickPopupBtn');
        if(menu && !menu.contains(e.target) && btn && !btn.contains(e.target)){
          menu.style.display = 'none';
          if(arrow) arrow.style.transform = '';
          document.removeEventListener('click', outsideClick);
        }
      }
      document.addEventListener('click', outsideClick);
    }, 50);
  }
}

// ── quickPopupStart ──
function quickPopupStart(){
  toggleSocialPopup(true);
  var badge = document.getElementById('popStartStatus');
  if(badge){ badge.textContent='● 실행중'; badge.style.color='#6ee7b7'; badge.style.background='rgba(52,211,153,.15)'; }
  document.getElementById('quickPopupMenu').style.display='none';
  document.getElementById('quickPopupArrow').style.transform='';
  toast('▶️ 소셜 팝업 자동 시작!');
}

// ── quickPopupStop ──
function quickPopupStop(){
  toggleSocialPopup(false);
  var badge = document.getElementById('popStartStatus');
  if(badge){ badge.textContent='대기중'; badge.style.color='#9ca3af'; badge.style.background='rgba(107,114,128,.15)'; }
  document.getElementById('quickPopupMenu').style.display='none';
  document.getElementById('quickPopupArrow').style.transform='';
  toast('⏹️ 소셜 팝업 멈춤');
}

// ── quickPopupSend ──
function quickPopupSend(){
  var name = (document.getElementById('qp_name')?.value||'').trim() || '방문자';
  var msg  = (document.getElementById('qp_msg')?.value||'').trim()  || '방문하고 있어요 😊';
  SOCIAL.show({name:name, text:msg});
  document.getElementById('quickPopupMenu').style.display='none';
  document.getElementById('quickPopupArrow').style.transform='';
  toast('📣 팝업 발송됐어요!');
}

// ── quickPopupTest ──
function quickPopupTest(){
  SOCIAL.rand();
  document.getElementById('quickPopupMenu').style.display='none';
  document.getElementById('quickPopupArrow').style.transform='';
  toast('⚡ 즉시 테스트 팝업!');
}

// ── qpSetMsg ──
function qpSetMsg(msg){
  var el = document.getElementById('qp_msg');
  if(el){ el.value=msg; el.focus(); }
}

// ── toggleRcPopupMenu ──
function toggleRcPopupMenu(){
  var menu=document.getElementById('rcPopupMenu');
  var arrow=document.getElementById('rcPopupArrow');
  var inputArea=document.getElementById('rcPopupInputArea');
  if(!menu) return;
  var isOpen = menu.style.display==='block';
  menu.style.display = isOpen?'none':'block';
  if(arrow) arrow.style.transform = isOpen?'':'rotate(180deg)';
  if(isOpen && inputArea) inputArea.style.display='none';
  updateRcPopupState();
}

// ── updateRcPopupState ──
function updateRcPopupState(){
  var badge=document.getElementById('rcPopupStatusBadge');
  var stateText=document.getElementById('rcPopupStateText');
  var isActive = SOCIAL.active;
  if(badge){
    badge.textContent = isActive?'● 활성':'○ 정지';
    badge.style.background = isActive?'rgba(16,185,129,.25)':'rgba(107,114,128,.15)';
    badge.style.borderColor = isActive?'rgba(16,185,129,.5)':'rgba(107,114,128,.3)';
    badge.style.color = isActive?'#6ee7b7':'#9ca3af';
  }
  if(stateText){
    stateText.textContent = isActive?'● 자동 팝업 활성 중 (22초 간격)':'○ 자동 팝업 멈춤 상태';
    stateText.style.color = isActive?'#10b981':'var(--mt)';
  }
}

// ── rcPopupStart ──
function rcPopupStart(){
  toggleSocialPopup(true);
  updateRcPopupState();
  toast('▶️ 소셜 팝업 자동 시작됐어요!');
}

// ── rcPopupStop ──
function rcPopupStop(){
  toggleSocialPopup(false);
  updateRcPopupState();
  toast('⏹️ 소셜 팝업이 멈췄어요');
}

// ── rcPopupShowInput ──
function rcPopupShowInput(){
  var area=document.getElementById('rcPopupInputArea');
  if(!area) return;
  var isOpen = area.style.display==='block';
  area.style.display = isOpen?'none':'block';
  if(!isOpen){
    setTimeout(function(){ var inp=document.getElementById('rc_popupName'); if(inp) inp.focus(); },100);
  }
}

// ── rcPopupTest ──
function rcPopupTest(){
  SOCIAL.rand();
  toast('⚡ 테스트 팝업이 표시됐어요!');
}

// ── rcSetMsg ──
function rcSetMsg(msg){
  var el=document.getElementById('rc_popupMsg');
  if(el){ el.value=msg; el.focus(); }
}

// ── rcShowNotice ──
function rcShowNotice(){
  var title=(document.getElementById('rc_noticeTitle')?.value||'').trim();
  var content=(document.getElementById('rc_noticeContent')?.value||'').trim();
  if(!title&&!content){toast('제목 또는 내용을 입력해주세요');return;}
  var nt=document.getElementById('noticeTitle'),nc=document.getElementById('noticeContent');
  if(nt)nt.value=title;if(nc)nc.value=content;
  showNoticePopup();
}

// ── rcSetVisitor ──
function rcSetVisitor(type){
  if(type==='total'){
    var val=parseInt(document.getElementById('rc_totalVisit')?.value||'0');
    if(val>0){STATS.data.totalVisitors=val;STATS.save();STATS.upd();var rt=document.getElementById('rc_total');if(rt)rt.textContent=STATS.fmt(val);toast('✅ 누적 방문자 '+val.toLocaleString()+'명 설정!');}
  }else{
    var val2=parseInt(document.getElementById('rc_dailyVisit')?.value||'0');
    if(val2>=0){STATS.data.dailyVisitors=val2;STATS.save();STATS.upd();var rd=document.getElementById('rc_daily');if(rd)rd.textContent=STATS.fmt(val2);toast('✅ 오늘 방문자 '+val2.toLocaleString()+'명 설정!');}
  }
}