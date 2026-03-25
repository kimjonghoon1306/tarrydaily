/* TARRY의 데일리 - mobile.js */

// ── toggleMobileDash ──
function toggleMobileDash(){
  const panel=document.getElementById('mobileDashPanel');
  if(!panel)return;
  const isOpen=panel.style.display!=='none';
  panel.style.display=isOpen?'none':'block';
  if(!isOpen){
    // 로그인 상태에 따라 표시
    const loginDiv=document.getElementById('mobileDashLogin');
    const mainDiv=document.getElementById('mobileDashMain');
    if(isAdminLoggedIn){
      if(loginDiv)loginDiv.style.display='none';
      if(mainDiv){mainDiv.style.display='block';updateMobileDashStats();}
    }else{
      if(loginDiv)loginDiv.style.display='block';
      if(mainDiv)mainDiv.style.display='none';
    }
  }
}

// ── closeMobileDash ──
function closeMobileDash(){
  const panel=document.getElementById('mobileDashPanel');
  if(panel)panel.style.display='none';
}

// ── updateMobileDashStats ──
function updateMobileDashStats(){
  const t=document.getElementById('mDashTotal'),d=document.getElementById('mDashDaily'),p=document.getElementById('mDashPosts');
  if(t)t.textContent=STATS.fmt(STATS.data.totalVisitors);
  if(d)d.textContent=STATS.fmt(STATS.data.dailyVisitors);
  if(p){const cnt=CAT_DATA.reduce((a,l1)=>a+l1.subs.reduce((b,l2)=>b+l2.items.length,0),0);p.textContent=cnt;}
  // 팝업 상태 업데이트
  updateMPopupState();
}

// ── updateMPopupState ──
function updateMPopupState(){
  var badge=document.getElementById('mPopupBadge');
  var stateText=document.getElementById('mPopupStateText');
  var active=SOCIAL.active;
  if(badge){
    badge.textContent=active?'● 활성':'○ 정지';
    badge.style.background=active?'rgba(16,185,129,.2)':'rgba(107,114,128,.15)';
    badge.style.color=active?'#6ee7b7':'#9ca3af';
    badge.style.borderColor=active?'rgba(16,185,129,.4)':'rgba(107,114,128,.3)';
  }
  if(stateText){
    stateText.textContent=active?'● 자동 팝업 활성 중 (22초 간격)':'○ 자동 팝업 멈춤 상태';
    stateText.style.color=active?'rgba(110,231,183,.8)':'rgba(254,243,199,.4)';
  }
}

// ── mPopupStart ──
function mPopupStart(){
  toggleSocialPopup(true);
  updateMPopupState();
  toast('▶️ 소셜 팝업 자동 시작!');
}

// ── mPopupStop ──
function mPopupStop(){
  toggleSocialPopup(false);
  updateMPopupState();
  toast('⏹️ 소셜 팝업 멈춤');
}

// ── mPopupTest ──
function mPopupTest(){
  SOCIAL.rand();
  toast('⚡ 테스트 팝업 표시!');
}

// ── toggleMPopupInput ──
function toggleMPopupInput(){
  var area=document.getElementById('mPopupInputArea');
  if(!area)return;
  area.style.display=area.style.display==='block'?'none':'block';
  if(area.style.display==='block'){
    setTimeout(function(){var el=document.getElementById('mPopupName');if(el)el.focus();},100);
  }
}

// ── mPopupSend ──
function mPopupSend(){
  var name=(document.getElementById('mPopupName')?.value||'').trim()||'방문자';
  var msg=(document.getElementById('mPopupMsg')?.value||'').trim()||'방문하고 있어요 😊';
  SOCIAL.show({name:name,text:msg});
  document.getElementById('mPopupInputArea').style.display='none';
  toast('📣 팝업 발송됐어요!');
}

// ── mSetMsg ──
function mSetMsg(msg){
  var el=document.getElementById('mPopupMsg');
  if(el){el.value=msg;el.focus();}
}