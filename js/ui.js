/* TARRY의 데일리 - ui.js */

// ── showPage ──
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('on');p.style.display='none';});
  const el=document.getElementById('page-'+id);
  if(el){el.classList.add('on');el.style.display='block';}
  window.scrollTo(0,0);
  try{history.pushState({page:id},'','#'+id);}catch(e){}
  if(id==='cat'){try{buildCatTree();}catch(e){}try{renderPosts();}catch(e){}}
  if(id==='admin')adminOpen();
  if(id==='member'){try{renderMemberPage();}catch(e){}}
  // 댓글 페이지 - 로그인 안내 표시
  if(id==='comment'){
    var notice = document.getElementById('commentLoginNotice');
    if(notice) notice.style.display = (isLoggedIn||isBrowsing) ? 'none' : 'block';
  }
}

// ── setNav ──
function setNav(id){
  document.querySelectorAll('.nl,.nbtn').forEach(b=>b.classList.remove('on'));
  const el=document.getElementById('nl-'+id);if(el)el.classList.add('on');
}

// ── closePopup ──
function closePopup(id){
  var el=document.getElementById(id);
  if(!el) return;
  el.classList.add('hide');
  el.style.display='none';
}

// ── toast ──
function toast(msg,dur){const el=document.getElementById('toastEl');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),dur||3000);}

// ── togFaq ──
function togFaq(el){const arr=el.querySelector('.faq-arr'),ans=el.nextElementSibling;if(arr)arr.classList.toggle('open');if(ans)ans.classList.toggle('open');}

// ── selectContactType ──
function selectContactType(type){
  // 카드 스타일 초기화
  ['inquiry','report','ad','etc'].forEach(function(t){
    var card = document.getElementById('ctype-'+t);
    var guide = document.getElementById('contact-guide-'+t);
    if(card){ card.style.border='2px solid var(--bd)'; card.style.background='var(--sur)'; }
    if(guide) guide.style.display='none';
  });
  // 선택된 카드 활성화
  var sel = document.getElementById('ctype-'+type);
  var selGuide = document.getElementById('contact-guide-'+type);
  if(sel){ sel.style.border='2px solid var(--ac)'; sel.style.background='linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.05))'; }
  if(selGuide) selGuide.style.display='block';
  // 라벨 업데이트
  var labels = {'inquiry':'1:1 문의','report':'신고하기','ad':'광고/제휴','etc':'기타 문의'};
  var label = document.getElementById('contactTypeLabel');
  if(label) label.textContent = labels[type]||'1:1 문의';
  // 카테고리 버튼도 연동
  var catMap = {'inquiry':'일반 문의','report':'기술 오류','ad':'광고/제휴','etc':'일반 문의'};
  var targetText = catMap[type];
  document.querySelectorAll('.cat-btn').forEach(function(btn){
    btn.classList.remove('sel');
    if(btn.textContent.trim() === targetText) btn.classList.add('sel');
  });
}

// ── selContact ──
function selContact(t){document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));const b=document.getElementById('ct-'+t);if(b)b.classList.add('on');}

// ── selCat ──
function selCat(btn){document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('sel'));if(btn)btn.classList.add('sel');}

// ── submitContact ──
async function submitContact(){
  var type    = document.querySelector('.ctab.on')?.dataset?.type || '일반';
  var name    = (document.getElementById('contactName')?.value||'').trim();
  var email   = (document.getElementById('contactEmail')?.value||'').trim();
  var message = (document.getElementById('contactMessage')?.value||'').trim();
  if(!name){ toast('이름을 입력해주세요'); return; }
  if(!email||!email.includes('@')){ toast('올바른 이메일을 입력해주세요'); return; }
  if(!message){ toast('문의 내용을 입력해주세요'); return; }

  var btn = document.querySelector('.submit-btn');
  if(btn){ btn.disabled=true; btn.textContent='📨 전송 중...'; }

  var ejsPk  = localStorage.getItem('tarry_ejs_pk')||'';
  var ejsSvc = localStorage.getItem('tarry_ejs_service')||'';
  var ejsTpl = localStorage.getItem('tarry_ejs_template')||'';
  var sent   = false;

  if(ejsPk && ejsSvc && ejsTpl && typeof emailjs !== 'undefined'){
    try{
      emailjs.init(ejsPk);
      await emailjs.send(ejsSvc, ejsTpl, {
        to_email:   'tarry9653@daum.net',
        from_name:  name+' ('+email+')',
        reply_to:   email,
        subject:    '[문의] '+type+' — '+name,
        post_title: '['+type+'] 문의',
        message:    message,
        site_url:   'https://tarrydaily.com'
      });
      sent = true;
    }catch(e){ console.warn('EmailJS 문의 전송 오류:', e); }
  }

  if(btn){ btn.disabled=false; btn.textContent='📨 문의 보내기'; }

  // 입력 초기화
  ['contactName','contactEmail','contactMessage'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });

  if(sent){
    toast('✅ 문의가 tarry9653@daum.net으로 전송됐어요!');
  } else {
    // EmailJS 미설정 시 안내
    toast('✅ 문의가 접수됐어요! (실제 발송은 EmailJS 설정 후 활성화)');
  }
}

// ── toggleDarkMode ──
function toggleDarkMode(){
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',isDark?'light':'dark');
  const btn=document.getElementById('themeToggle');if(btn)btn.textContent=isDark?'🌙':'☀️';
  // SVG 테마 아이콘 교체
  const micon=document.getElementById('mobileThemeIcon');
  if(micon){
    if(isDark){
      // 달 캐릭터 (라이트 모드로)
      micon.setAttribute('viewBox','0 0 46 46');
      micon.innerHTML='<path d="M30 23C30 27.97 26.19 32 21.5 32C16.81 32 13 27.97 13 23C13 18.03 16.81 14 21.5 14C19.5 16.5 19 20 21 22.5C23 25 27 25.5 30 23Z" fill="rgba(255,255,255,0.95)"/><circle cx="20" cy="21" r="1.5" fill="rgba(59,130,246,0.8)"/><circle cx="20.6" cy="20.4" r="0.6" fill="white"/><circle cx="25" cy="22" r="1.2" fill="rgba(59,130,246,0.6)"/><ellipse cx="18.5" cy="23.5" rx="2" ry="1.2" fill="rgba(147,197,253,0.4)"/><path d="M20 24.5Q22 26 24 24.5" stroke="rgba(59,130,246,0.6)" stroke-width="1" stroke-linecap="round" fill="none"/><path d="M34 10L34.8 12.4L37 12.4L35.2 13.9L35.9 16.3L34 14.8L32.1 16.3L32.8 13.9L31 12.4L33.2 12.4Z" fill="rgba(255,255,255,0.8)"/><circle cx="36" cy="20" r="1.2" fill="rgba(255,255,255,0.55)"/><circle cx="10" cy="15" r="1" fill="rgba(255,255,255,0.4)"/>';
      const box=document.getElementById('mobileThemeIconBox');
      if(box){box.style.background='linear-gradient(135deg,#93c5fd,#3b82f6)';box.style.boxShadow='0 4px 12px rgba(59,130,246,0.45),inset 0 1px 0 rgba(255,255,255,0.35)';}
    } else {
      // 해 캐릭터 (다크 모드로)
      micon.setAttribute('viewBox','0 0 46 46');
      micon.innerHTML='<circle cx="23" cy="23" r="9" fill="rgba(255,255,255,0.95)"/><circle cx="19.5" cy="21" r="2.2" fill="white"/><circle cx="19.5" cy="21" r="1.3" fill="rgba(249,115,22,0.85)"/><circle cx="20.1" cy="20.4" r="0.55" fill="white"/><circle cx="26.5" cy="21" r="2.2" fill="white"/><circle cx="26.5" cy="21" r="1.3" fill="rgba(249,115,22,0.85)"/><circle cx="27.1" cy="20.4" r="0.55" fill="white"/><ellipse cx="20" cy="24.5" rx="2.2" ry="1.3" fill="rgba(255,180,80,0.3)"/><ellipse cx="26" cy="24.5" rx="2.2" ry="1.3" fill="rgba(255,180,80,0.3)"/><ellipse cx="23" cy="25.5" rx="1.5" ry="0.9" fill="rgba(249,115,22,0.4)"/><path d="M20.5 26.5Q23 29 25.5 26.5" stroke="rgba(249,115,22,0.7)" stroke-width="1.2" stroke-linecap="round" fill="none"/><line x1="23" y1="10" x2="23" y2="7" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="39" x2="23" y2="36" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="23" x2="7" y2="23" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round"/><line x1="39" y1="23" x2="36" y2="23" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round"/><line x1="13.5" y1="13.5" x2="11.5" y2="11.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/><line x1="34.5" y1="34.5" x2="32.5" y2="32.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/><line x1="34.5" y1="13.5" x2="32.5" y2="15.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/><line x1="13.5" y1="34.5" x2="15.5" y2="32.5" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/>';
      const box=document.getElementById('mobileThemeIconBox');
      if(box){box.style.background='linear-gradient(135deg,#fde68a,#f97316)';box.style.boxShadow='0 4px 12px rgba(249,115,22,0.5),inset 0 1px 0 rgba(255,255,255,0.35)';}
    }
  }
  try{localStorage.setItem('tarry_dark',String(!isDark));}catch(e){}
}

// ── startBrowse ──
function startBrowse(){isBrowsing=true;showPage('cat');setNav('cat');}

// ── handleLockedClick ──
function handleLockedClick(){showPage('auth');setNav('auth');setAtab('signup');}

// ── setAtab ──
function setAtab(tab){
  document.querySelectorAll('.atab').forEach(b=>b.classList.remove('on'));
  const btn=document.getElementById('at-'+tab);if(btn)btn.classList.add('on');
  document.querySelectorAll('.auth-panel').forEach(p=>p.style.display='none');
  const panel=document.getElementById(tab==='login'?'loginF':'signupF');if(panel)panel.style.display='block';
}

// ── upgradeVip ──
function upgradeVip(){toast('VIP 업그레이드는 준비 중이에요');}

// ── socialLogin ──
function socialLogin(p){toast(p+' 로그인은 준비 중이에요');}

// ── toggleSocialPopup ──
function toggleSocialPopup(v){SOCIAL.active=v;if(v)SOCIAL.start();else{if(SOCIAL.timer)clearInterval(SOCIAL.timer);}toast(v?'소셜 팝업 켜짐':'꺼짐');}

// ── testSocialPopup ──
function testSocialPopup(){SOCIAL.rand();}

// ── sendManualPopup ──
function sendManualPopup(){
  var name=document.getElementById('manualPopupName')?.value?.trim()||'익명';
  var msg=document.getElementById('manualPopupMsg')?.value?.trim()||'방문하고 있어요 😊';
  SOCIAL.show({name:name,text:msg});
  toast('팝업 발송됨!');
}

// ── applyNotice ──
function applyNotice(){}

// ── setPostView ──
function setPostView(){}

// ── setView ──
function setView(v){currentView=v;renderPosts();}

// ── openPost ──
function openPost(postId,title,tag,emoji,meta){
  try{
    const data=getPostBody(postId,title,tag);
    const els={title:document.getElementById('postTitle'),tag:document.getElementById('postTag'),emoji:document.getElementById('postEmoji'),meta:document.getElementById('postMeta'),header:document.getElementById('postHeader'),body:document.getElementById('postBody'),rel:document.getElementById('relatedPosts')};
    if(els.title)els.title.textContent=title||'';
    if(els.tag)els.tag.textContent=tag||'';
    if(els.emoji)els.emoji.textContent=emoji||'📄';
    if(els.meta)els.meta.textContent='TARRY · '+new Date().toLocaleDateString('ko-KR');
    if(els.header)els.header.style.background=data.img?`linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.5)),url(${data.img}) center/cover`:'var(--grad)';
    if(els.body)els.body.innerHTML=data.body||'';
    if(els.rel){
      let all=[];CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>all.push({...it,color:l1.color,l2name:l2.name}))));
      const rel=all.filter(p=>p.id!==postId).sort(()=>Math.random()-.5).slice(0,3);
      els.rel.innerHTML=rel.map((p,i)=>`<div class="card rel-${i}" style="cursor:pointer"><div class="cthumb ${p.color||'ct-a'}">${p.emoji}</div><div class="cbody"><span class="ptag">${p.l2name}</span><div class="ctitle">${p.title}</div></div><div class="cfooter"><span>${p.date}</span><span>${p.read} 읽기</span></div></div>`).join('');
      rel.forEach((p,i)=>{const el=els.rel.querySelector('.rel-'+i);if(el)el.addEventListener('click',()=>openPost(p.id,p.title,p.l2name,p.emoji,'TARRY'));});
    }
    showPage('post');
    // 글별 댓글 로드
    try{ if(typeof loadPostComments==='function') loadPostComments(postId); }catch(e){}
    try{const v=STATS.getPostView(postId);if(els.meta)els.meta.textContent='TARRY · 조회 '+v.toLocaleString()+'회';}catch(e){}
  }catch(err){console.error('openPost:',err);}
}

// ── sharePost ──
function sharePost(){try{navigator.clipboard.writeText(location.href);toast('🔗 링크 복사됐어요!');}catch(e){toast('링크: '+location.href);}}

// ── clickPost ──
function clickPost(i){const p=currentPosts[i];if(!p)return;openPost(p.id||'',p.title||'',p.l2name||'',p.emoji||'📄','TARRY');}

// ── toggleEmojiPicker ──
function toggleEmojiPicker(){
  var box=document.getElementById('emojiPickerBox');
  if(!box)return;
  if(box.style.display==='none'||!box.style.display){
    box.style.display='block';
    buildEmojiPicker();
  }else{
    box.style.display='none';
  }
}

// ── insertEmoji ──
function insertEmoji(emoji){
  var input=document.getElementById('commentInput');
  if(!input)return;
  var pos=input.selectionStart||input.value.length;
  input.value=input.value.slice(0,pos)+emoji+input.value.slice(pos);
  input.focus();
  input.setSelectionRange(pos+emoji.length,pos+emoji.length);
}

// ── switchEmojiCat ──
function switchEmojiCat(){}

// ── renderEmojiGrid ──
function renderEmojiGrid(){}

// ── searchEmoji ──
function searchEmoji(){}

// ── toggleEmoji ──
function toggleEmoji(){}

// ── buildEmojiPicker ──
function buildEmojiPicker(){
  var grid=document.getElementById('emojiGrid');
  if(!grid)return;
  var emojis=['😊', '😂', '🥰', '😍', '🤩', '😎', '🥳', '😜', '🤣', '😆', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '👍', '👏', '🙌', '🤝', '✌️', '🤞', '👋', '🙏', '💪', '🎉', '🔥', '⭐', '✨', '💫', '🌟', '🎊', '🎁', '🎈', '🎀', '🏆', '🌸', '🌹', '🌺', '🌻', '🌼', '🍀', '🌿', '🍁', '🍂', '🌈', '☀️', '🌙', '⛅', '🌤️', '❄️', '🌊', '⚡', '🌙', '🌟', '🌏', '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍉', '🍌', '🍕', '🍔', '🍣', '🍜', '🍰', '🎂', '🍩', '🍪', '☕', '🧋', '🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐸', '🐙', '🦋', '🌸', '🚀', '✈️', '🚗', '⚽', '🎸', '📚', '💡', '🔮', '🎭', '🎮'];
  grid.innerHTML=emojis.map(function(e){
    return '<button onclick="insertEmoji(\''+e+'\',this)" style="background:none;border:none;font-size:22px;cursor:pointer;padding:4px;border-radius:6px;line-height:1" >'+e+'</button>';
  }).join('');
}

// ── autoResize ──
function autoResize(el){el.style.height='auto';el.style.height=el.scrollHeight+'px';}

// ── likeComment ──
function likeComment(i){
  if(!comments[i])return;
  comments[i].likes=(comments[i].likes||0)+1;
  var el=document.getElementById('like-'+i);
  if(el)el.textContent=comments[i].likes;
}

// ── startReply ──
function startReply(i){
  var box=document.getElementById('reply-box-'+i);
  if(box){box.style.display=box.style.display==='none'?'flex':'none';}
}

// ── closeReplyBox ──
function closeReplyBox(i){
  var box = document.getElementById('reply-box-'+i);
  if(box) box.style.display='none';
}

// ── submitReply ──
function submitReply(i){
  var input=document.getElementById('reply-input-'+i);
  if(!input||!input.value.trim()){toast('답글을 입력해주세요');return;}
  if(!comments[i].replies)comments[i].replies=[];
  comments[i].replies.push({
    name:currentUser?currentUser.name:'익명',
    text:input.value.trim(),
    date:new Date().toLocaleDateString('ko-KR')
  });
  input.value='';
  renderComments();
  toast('답글이 등록됐어요!');
}