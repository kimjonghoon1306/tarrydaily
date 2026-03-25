/* TARRY의 데일리 - posts.js */

// ── getPostBody ──
function getPostBody(postId, title, tag) {
  if(POST_CONTENTS[postId]) return POST_CONTENTS[postId];
  const imgs = {life:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',money:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',it:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',trend:'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80',news:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'};
  return {img:imgs[tag]||'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',body:'<p style="font-size:16px;line-height:2;margin-bottom:1.5rem;color:var(--mt)">안녕하세요, TARRY입니다! 오늘은 <strong style="color:var(--tx)">'+(title||'')+'</strong>에 대해 깊이 있게 알아보려고 해요.</p><h2 style="font-family:var(--display);font-size:22px;margin-bottom:1rem;color:var(--tx);border-left:4px solid var(--ac);padding-left:12px">📌 핵심 내용</h2><div style="background:var(--sur2);border-radius:12px;padding:1.3rem;border:1px solid var(--bd);margin-bottom:1.5rem"><ul style="padding-left:1.2rem;display:flex;flex-direction:column;gap:.8rem;font-size:15px;color:var(--mt)"><li>누구나 쉽게 이해할 수 있는 핵심 정보를 정리했어요</li><li>바로 실생활에 적용할 수 있는 실용적인 팁을 소개해요</li><li>전문가들도 인정하는 노하우를 공유해드릴게요</li><li>자주 하는 실수와 올바른 방법도 알려드려요</li></ul></div><p style="font-size:15px;line-height:2;margin-bottom:1rem;color:var(--mt)">이 주제는 많은 분들이 일상에서 마주하는 상황이에요. 처음에는 어렵게 느껴질 수 있지만, 오늘 소개하는 방법을 따라하시면 생각보다 쉽게 해결하실 수 있을 거예요.</p><div style="background:var(--sur3);border-radius:12px;padding:1.3rem;border:1px solid var(--bd2)"><p style="font-size:15px;color:var(--mt);line-height:2">💬 <strong style="color:var(--tx)">여러분의 생각은?</strong> 댓글로 의견을 나눠주세요! 😊</p></div>'};
}

// ── buildCatTree ──
function buildCatTree(){
  const tree=document.getElementById('catTree');if(!tree)return;
  const total=CAT_DATA.reduce((a,l1)=>a+l1.subs.reduce((b,l2)=>b+l2.items.length,0),0);
  let html=`<button onclick="selectCat(null,null,null)" style="display:flex;align-items:center;width:100%;background:var(--sur);border:1px solid var(--bd);border-radius:9px;padding:9px 12px;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:600;color:var(--tx);margin-bottom:6px">🗂 전체 글 <span style="margin-left:auto;font-size:11px;color:var(--mt)">${total}개</span></button>`;
  CAT_DATA.forEach(l1=>{
    const cnt=l1.subs.reduce((a,b)=>a+b.items.length,0);
    html+=`<div><button id="cl1-${l1.id}" style="display:flex;align-items:center;width:100%;background:var(--sur);border:1px solid var(--bd);border-radius:9px;padding:9px 12px;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:600;color:var(--tx);margin-bottom:4px;text-align:left"><span style="margin-right:6px">${l1.icon}</span><span style="flex:1">${l1.name}</span><span style="font-size:11px;color:var(--mt)">${cnt}</span></button>`;
    html+=`<div id="l2-${l1.id}" style="display:none;padding-left:10px;margin-bottom:4px">`;
    l1.subs.forEach(l2=>{
      html+=`<button id="cl2-${l2.id}" style="display:flex;align-items:center;width:100%;background:transparent;border:none;border-radius:7px;padding:7px 10px;cursor:pointer;font-family:var(--font);font-size:12px;color:var(--mt);text-align:left;margin-bottom:2px"><span style="flex:1">${l2.name}</span><span style="font-size:10px">${l2.items.length}</span></button>`;
    });
    html+='</div></div>';
  });
  tree.innerHTML=html;
  // 이벤트 등록
  CAT_DATA.forEach(l1=>{
    const b1=document.getElementById('cl1-'+l1.id);
    if(b1)b1.addEventListener('click',()=>togL1(l1.id));
    l1.subs.forEach(l2=>{
      const b2=document.getElementById('cl2-'+l2.id);
      if(b2)b2.addEventListener('click',()=>selectCat(l1.id,l2.id,null));
    });
  });
}

// ── togL1 ──
function togL1(id){const w=document.getElementById('l2-'+id);if(w)w.style.display=w.style.display==='none'?'block':'none';selectCat(id,null,null);}

// ── togL2 ──
function togL2(l1id,l2id){selectCat(l1id,l2id,null);}

// ── selectCat ──
function selectCat(l1id,l2id,l3id){
  selectedL1=l1id;selectedL2=l2id;selectedL3=l3id;
  document.querySelectorAll('[id^=cl1-],[id^=cl2-]').forEach(b=>{b.style.background='';b.style.color='';});
  if(l2id){const b=document.getElementById('cl2-'+l2id);if(b){b.style.background='var(--sur2)';b.style.color='var(--ac)';}}
  else if(l1id){const b=document.getElementById('cl1-'+l1id);if(b){b.style.background='var(--sur2)';b.style.color='var(--ac)';}}
  renderBreadcrumb();renderPosts();
}

// ── renderBreadcrumb ──
function renderBreadcrumb(){
  const bc=document.getElementById('breadcrumb');if(!bc)return;
  let html='<span id="bc0" style="cursor:pointer;color:var(--ac)">🏠 전체</span>';
  if(selectedL1){
    const l1=CAT_DATA.find(x=>x.id===selectedL1);
    if(l1){
      html+=` › <span id="bc1" style="cursor:pointer">${l1.name}</span>`;
      if(selectedL2){const l2=l1.subs.find(x=>x.id===selectedL2);if(l2)html+=` › <span>${l2.name}</span>`;}
    }
  }
  bc.innerHTML=html;
  const b0=document.getElementById('bc0');if(b0)b0.onclick=()=>selectCat(null,null,null);
  const b1=document.getElementById('bc1');if(b1&&selectedL1){const id=selectedL1;b1.onclick=()=>selectCat(id,null,null);}
}

// ── getFilteredPosts ──
function getFilteredPosts(){
  let all=[];
  if(!selectedL1){CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>l2.items.forEach(it=>all.push({...it,l1:l1.id,color:l1.color,l2name:l2.name}))));}
  else{
    const l1=CAT_DATA.find(x=>x.id===selectedL1);if(!l1)return[];
    if(!selectedL2){l1.subs.forEach(l2=>l2.items.forEach(it=>all.push({...it,l1:l1.id,color:l1.color,l2name:l2.name})));}
    else{const l2=l1.subs.find(x=>x.id===selectedL2);if(!l2)return[];l2.items.forEach(it=>all.push({...it,l1:l1.id,color:l1.color,l2name:l2.name}));}
  }
  return all;
}

// ── renderPosts ──
function renderPosts(){
  currentPosts=getFilteredPosts();
  const grid=document.getElementById('postGrid');if(!grid)return;
  const isList=currentView==='list';
  grid.className='post-grid'+(isList?' list-v':'');
  const cnt=document.getElementById('catCountLbl');if(cnt)cnt.textContent=currentPosts.length+'개';
  const l1=selectedL1?CAT_DATA.find(x=>x.id===selectedL1):null;
  const l2=l1&&selectedL2?l1.subs.find(x=>x.id===selectedL2):null;
  const ttl=document.getElementById('catTitle');if(ttl)ttl.textContent=l2?l2.name:(l1?l1.icon+' '+l1.name:'전체 글');
  if(!currentPosts.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--mt)"><div style="font-size:36px;margin-bottom:8px">📭</div>이 카테고리에 글이 없어요</div>';return;}
  let h='';
  currentPosts.forEach((p,i)=>{
    h+=`<div class="pc" data-idx="${i}" style="cursor:pointer">`;
    h+=`<div class="pc-thumb ${p.color||'ct-a'}">${p.emoji||'📄'}</div>`;
    h+=`<div style="flex:1"><div class="pc-body"><span class="pc-tag">${p.l2name||''}</span>`;
    h+=`<div class="pc-title">${p.title||''}</div><div class="pc-desc">${p.desc||''}</div></div>`;
    h+=`<div class="pc-footer"><span>${p.date||''}</span><span>${p.read||''} 읽기</span></div></div></div>`;
  });
  grid.innerHTML=h;
  grid.querySelectorAll('.pc[data-idx]').forEach(el=>{
    const i=parseInt(el.getAttribute('data-idx'));
    el.addEventListener('click',()=>clickPost(i));
  });
}

// ── renderComments ──
function renderComments(){
  // 댓글 수 업데이트
  document.querySelectorAll('.comment-count-badge').forEach(function(el){el.textContent=comments.length+'개';});
  var cnt = document.getElementById('commentCount');
  if(cnt) cnt.textContent = comments.length;

  var list = document.getElementById('commentList');
  if(!list) return;

  if(!comments.length){
    list.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--mt)"><div style="font-size:40px;margin-bottom:10px">💬</div><div style="font-size:14px;font-weight:700;color:var(--tx);margin-bottom:4px">아직 댓글이 없어요</div><div style="font-size:12px">첫 번째 댓글을 남겨보세요!</div></div>';
    return;
  }

  var html = '';
  for(var i=0; i<comments.length; i++){
    var c = comments[i];
    var replies = '';
    if(c.replies && c.replies.length){
      for(var r=0; r<c.replies.length; r++){
        var rep = c.replies[r];
        replies += '<div style="background:var(--sur3);border-radius:10px;padding:10px 12px;margin-top:8px;border-left:3px solid var(--ac)">'
          + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">'
          + '<div style="background:var(--grad);border-radius:50%;width:22px;height:22px;min-width:22px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px">'+rep.name[0]+'</div>'
          + '<div style="font-size:12px;font-weight:700;color:var(--tx)">'+rep.name+'</div>'
          + '<div style="font-size:10px;color:var(--mt)">'+rep.date+'</div>'
          + '</div>'
          + '<div style="font-size:13px;color:var(--mt)">'+rep.text+'</div>'
          + '</div>';
      }
    }
    html += '<div style="background:var(--sur);border:1px solid var(--bd);border-radius:14px;padding:14px;margin-bottom:10px">'
      + '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">'
      + '<div style="background:var(--grad);border-radius:50%;width:34px;height:34px;min-width:34px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">'+c.name[0]+'</div>'
      + '<div style="flex:1">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
      + '<div style="font-size:13px;font-weight:700;color:var(--tx)">'+c.name+'</div>'
      + '<div style="font-size:10px;color:var(--mt)">'+c.date+'</div>'
      + '</div>'
      + '<div style="font-size:14px;line-height:1.7;color:var(--mt)">'+c.text+'</div>'
      + '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">'
      + '<button onclick="likeComment('+i+')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--mt);display:flex;align-items:center;gap:3px;padding:0">❤️ <span id="like-'+i+'">'+(c.likes||0)+'</span></button>'
      + '<button onclick="startReply('+i+')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--ac);padding:0">↩️ 답글</button>'
      + '</div>'
      + '</div></div>'
      + replies
      + '<div id="reply-box-'+i+'" style="display:none;margin-top:8px">'
      + '<div style="display:flex;gap:7px">'
      + '<input id="reply-input-'+i+'" placeholder="답글 입력..." style="flex:1;background:var(--sur2);border:1px solid var(--bd);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--tx);outline:none;font-family:var(--font)">'
      + '<button onclick="submitReply('+i+')" style="background:var(--grad);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">등록</button>'
      + '<button onclick="closeReplyBox('+i+')" style="background:var(--sur2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;cursor:pointer;font-size:12px;color:var(--mt)">✕</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }
  list.innerHTML = html;
  try{renderHomeComments();}catch(e){}
}

// ── submitComment ──
function submitComment(){
  const input=document.getElementById('commentInput');
  if(!input||!input.value.trim()){toast('댓글을 입력해주세요');return;}
  // 로그인 확인
  if(!isLoggedIn && !isAdminLoggedIn){
    toast('🔐 로그인 후 댓글을 작성할 수 있어요');
    showPage('auth');setNav('auth');
    return;
  }
  var userName = isAdminLoggedIn ? (localStorage.getItem('tarry_admin_name')||'관리자') : (currentUser?currentUser.name:'익명');
  var newCmt={
    name: userName,
    avatar: userName[0].toUpperCase(),
    text: input.value.trim(),
    date: new Date().toLocaleDateString('ko-KR'),
    timestamp: Date.now(),
    likes: 0,
    isAdmin: isAdminLoggedIn
  };
  // Firebase에 저장
  if(typeof saveCommentToFirebase === 'function' && firebaseDB){
    saveCommentToFirebase(newCmt);
  } else {
    comments.unshift(newCmt);
    try{ localStorage.setItem('tarry_comments', JSON.stringify(comments)); }catch(e){}
    renderComments();
    try{renderHomeComments();}catch(e){}
    try{renderAdminComments();}catch(e){}
    try{renderAdminComments2();}catch(e){}
    var cnt=document.getElementById('commentCount'); if(cnt) cnt.textContent=comments.length;
  }
  input.value='';
  var list=document.getElementById('commentList');
  if(list) list.scrollIntoView({behavior:'smooth',block:'start'});
  toast('✅ 댓글이 등록됐어요!');
}

// ── togLike ──
function togLike(){}

// ── replyTo ──
function replyTo(name){const i=document.getElementById('commentInput');if(i)i.value='@'+name+' ';}

// ── removeAdminComment ──
function removeAdminComment(i){
  if(!confirm('이 댓글을 삭제할까요?')) return;
  comments.splice(i,1);
  renderAdminComments();
  renderAdminComments2();
  renderComments();
  toast('🗑️ 삭제됐어요');
}

// ── adminAddComment ──
function adminAddComment(){
  var name = (document.getElementById('adminCommentName')?.value||'').trim();
  var text = (document.getElementById('adminCommentText')?.value||'').trim();
  if(!name){ toast('✏️ 작성자 이름을 입력해주세요'); return; }
  if(!text){ toast('💬 댓글 내용을 입력해주세요'); return; }
  comments.unshift({name:name, text:text, date:new Date().toLocaleDateString('ko-KR'), likes:0});
  document.getElementById('adminCommentName').value='';
  document.getElementById('adminCommentText').value='';
  // 이모지 피커 닫기
  var pk=document.getElementById('adminEmojiPicker'); if(pk) pk.style.display='none';
  renderAdminComments();
  renderAdminComments2();
  renderComments();
  toast('✅ 댓글이 등록됐어요!');
}

// ── adminAddComment2 ──
function adminAddComment2(){
  var name = (document.getElementById('adminCommentName2')?.value||'').trim();
  var text = (document.getElementById('adminCommentText2')?.value||'').trim();
  if(!name){ toast('✏️ 작성자 이름을 입력해주세요'); return; }
  if(!text){ toast('💬 댓글 내용을 입력해주세요'); return; }
  comments.unshift({name:name, text:text, date:new Date().toLocaleDateString('ko-KR'), likes:0});
  document.getElementById('adminCommentName2').value='';
  document.getElementById('adminCommentText2').value='';
  var pk=document.getElementById('adminEmojiPicker2'); if(pk) pk.style.display='none';
  renderAdminComments();
  renderAdminComments2();
  renderComments();
  toast('✅ 댓글이 등록됐어요!');
}

// ── renderAdminComments ──
function renderAdminComments(){
  var list = document.getElementById('adminCommentList');
  var badge = document.getElementById('dashCmtBadge');
  if(badge) badge.textContent = comments.length+'개';
  if(!list) return;
  if(!comments.length){
    list.innerHTML='<div style="text-align:center;padding:1rem;color:var(--mt);font-size:12px">아직 댓글이 없어요</div>';
    return;
  }
  list.innerHTML = comments.map(function(c,i){
    return '<div style="background:var(--sur);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;margin-bottom:6px">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
        +'<div style="width:28px;height:28px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0">'+(c.name||'?')[0].toUpperCase()+'</div>'
        +'<div style="flex:1">'
          +'<span style="font-size:12px;font-weight:700;color:var(--tx)">'+c.name+'</span>'
          +' <span style="font-size:10px;color:var(--mt)">'+c.date+'</span>'
        +'</div>'
        +'<button onclick="removeAdminComment('+i+')" style="background:rgba(220,38,38,.1);color:#dc2626;border:1px solid rgba(220,38,38,.2);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);flex-shrink:0">🗑️ 삭제</button>'
      +'</div>'
      +'<div style="font-size:12px;color:var(--mt);line-height:1.6;padding-left:36px">'+c.text+'</div>'
    +'</div>';
  }).join('');
}

// ── renderAdminComments2 ──
function renderAdminComments2(){
  var list = document.getElementById('adminCommentList2');
  if(!list) return;
  if(!comments.length){
    list.innerHTML='<div style="text-align:center;padding:1rem;color:var(--mt);font-size:12px">아직 댓글이 없어요</div>';
    return;
  }
  list.innerHTML = comments.map(function(c,i){
    return '<div style="background:var(--sur2);border:1px solid var(--bd);border-radius:9px;padding:9px 11px;margin-bottom:5px;display:flex;align-items:center;gap:8px">'
      +'<div style="flex:1;min-width:0">'
        +'<span style="font-size:12px;font-weight:700;color:var(--tx)">'+c.name+'</span>'
        +' <span style="font-size:10px;color:var(--mt)">'+c.date+'</span>'
        +'<div style="font-size:11px;color:var(--mt);margin-top:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'+c.text.substring(0,50)+(c.text.length>50?'...':'')+'</div>'
      +'</div>'
      +'<button onclick="removeAdminComment('+i+')" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:16px;padding:0;flex-shrink:0">×</button>'
    +'</div>';
  }).join('');
}

// ── buildEmojiGrid ──
function buildEmojiGrid(gridId, cat, textareaId){
  var g = document.getElementById(gridId);
  if(!g) return;
  var emojis = EMOJI_CATS[cat] || EMOJI_CATS['face'];
  g.innerHTML = emojis.map(function(em){
    return '<span style="font-size:22px;cursor:pointer;padding:5px;border-radius:8px;display:inline-block;transition:transform .1s;line-height:1" '
      +'onmouseover="this.style.transform=\'scale(1.3)\';this.style.background=\'var(--sur2)\'" '
      +'onmouseout="this.style.transform=\'\';this.style.background=\'\'" '
      +'onclick="insertEmojiToTA(\''+textareaId+'\',\''+em+'\')">'+em+'</span>';
  }).join('');
}

// ── insertEmojiToTA ──
function insertEmojiToTA(taId, emoji){
  var ta = document.getElementById(taId);
  if(!ta) return;
  var pos = ta.selectionStart || ta.value.length;
  ta.value = ta.value.slice(0,pos) + emoji + ta.value.slice(pos);
  ta.focus();
  ta.setSelectionRange(pos+2, pos+2);
}

// ── switchEmojiCat2 ──
function switchEmojiCat2(btn, cat){
  currentEmojiCat2 = cat;
  document.querySelectorAll('.ae2-cat-btn').forEach(function(b){
    b.style.background='var(--sur2)'; b.style.color='var(--mt)';
    b.style.borderColor='var(--bd)'; b.style.fontWeight='400';
  });
  btn.style.background='var(--ac)'; btn.style.color='#fff';
  btn.style.borderColor='var(--ac)'; btn.style.fontWeight='700';
  buildEmojiGrid('adminEmojiGrid2', cat, 'adminCommentText2');
}

// ── toggleAdminEmoji ──
function toggleAdminEmoji(){
  var box = document.getElementById('adminEmojiPicker');
  if(!box) return;
  var open = box.style.display==='block';
  box.style.display = open?'none':'block';
  if(!open) buildEmojiGrid('adminEmojiGrid', currentEmojiCat, 'adminCommentText');
}

// ── toggleAdminEmoji2 ──
function toggleAdminEmoji2(){
  var box = document.getElementById('adminEmojiPicker2');
  if(!box) return;
  var open = box.style.display==='block';
  box.style.display = open?'none':'block';
  if(!open) buildEmojiGrid('adminEmojiGrid2', currentEmojiCat2, 'adminCommentText2');
}

// ── buildAdminEmojiGrid ──
function buildAdminEmojiGrid(){ buildEmojiGrid('adminEmojiGrid', 'face', 'adminCommentText'); }

// ── insertAdminEmoji ──
function insertAdminEmoji(e){ insertEmojiToTA('adminCommentText', e); }

// ── renderAdminCatTree ──
function renderAdminCatTree(){
  const tree=document.getElementById('adminCatTree');
  console.log('renderAdminCatTree 호출 — tree:', tree, '— CAT_DATA:', CAT_DATA?.length);
  if(!tree)return;
  // l1SelectForL2, l2SelectForPost 셀렉트 업데이트
  const l1sel=document.getElementById('l1SelectForL2');
  const l2sel=document.getElementById('l2SelectForPost');
  if(l1sel)l1sel.innerHTML=CAT_DATA.map(l1=>`<option value="${l1.id}">${l1.icon} ${l1.name}</option>`).join('');
  if(l2sel){
    let opts='';
    CAT_DATA.forEach(l1=>l1.subs.forEach(l2=>{opts+=`<option value="${l1.id}__${l2.id}">${l1.icon} ${l1.name} > ${l2.name}</option>`;}));
    l2sel.innerHTML=opts;
  }
  // 트리 렌더링
  tree.innerHTML=CAT_DATA.map(l1=>`
    <div style="background:var(--sur);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:20px">${l1.icon}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--tx)">${l1.name}</div>
          <div style="font-size:11px;color:var(--mt)">${l1.subs.reduce((a,s)=>a+s.items.length,0)}개 글</div>
        </div>
        <button onclick="delAdminL1('${l1.id}')" style="background:rgba(220,38,38,.1);color:#dc2626;border:1px solid rgba(220,38,38,.2);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;font-family:var(--font)">🗑️ 삭제</button>
      </div>
      <div style="padding-left:12px">
        ${l1.subs.map(l2=>`
          <div style="background:var(--sur2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700;color:var(--tx)">${l2.name}</div>
              <div style="font-size:10px;color:var(--mt)">${l2.items.length}개 글</div>
            </div>
            <button onclick="delAdminL2('${l1.id}','${l2.id}')" style="background:rgba(220,38,38,.1);color:#dc2626;border:none;border-radius:5px;padding:3px 7px;font-size:10px;cursor:pointer;font-family:var(--font)">삭제</button>
          </div>
          <div style="padding-left:10px">
            ${l2.items.map((item,idx)=>`
              <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--bd)">
                <span style="font-size:14px">${item.emoji||'📄'}</span>
                <div style="flex:1;font-size:11px;color:var(--tx);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${item.title}</div>
                <button onclick="delAdminPost('${l1.id}','${l2.id}',${idx})" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:12px;padding:0;flex-shrink:0">×</button>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ── buildAdminCatTree ──
function buildAdminCatTree(){renderAdminCatTree();}

// ── addAdminL1 ──
function addAdminL1(){
  const name=document.getElementById('newL1Name')?.value?.trim();
  const icon=document.getElementById('newL1Icon')?.value?.trim()||'📁';
  if(!name){toast('대분류 이름을 입력해주세요');return;}
  const id='cat_'+Date.now();
  CAT_DATA.push({id,name,icon,color:'ct-a',subs:[]});
  document.getElementById('newL1Name').value='';
  document.getElementById('newL1Icon').value='';
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('✅ 대분류 "'+name+'" 추가됐어요!');
}

// ── delAdminL1 ──
function delAdminL1(id){
  const idx=CAT_DATA.findIndex(c=>c.id===id);
  if(idx===-1)return;
  if(!confirm('"'+CAT_DATA[idx].name+'" 대분류를 삭제할까요? 안에 있는 모든 글도 삭제돼요'))return;
  CAT_DATA.splice(idx,1);
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('🗑️ 삭제됐어요');
}

// ── addAdminL2 ──
function addAdminL2(){
  const l1id=document.getElementById('l1SelectForL2')?.value;
  const name=document.getElementById('newL2Name')?.value?.trim();
  if(!l1id||!name){toast('대분류를 선택하고 이름을 입력해주세요');return;}
  const l1=CAT_DATA.find(c=>c.id===l1id);
  if(!l1){toast('대분류를 찾을 수 없어요');return;}
  const id='sub_'+Date.now();
  l1.subs.push({id,name,items:[]});
  document.getElementById('newL2Name').value='';
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('✅ 서브카테고리 "'+name+'" 추가됐어요!');
}

// ── delAdminL2 ──
function delAdminL2(l1id,l2id){
  const l1=CAT_DATA.find(c=>c.id===l1id);if(!l1)return;
  const idx=l1.subs.findIndex(s=>s.id===l2id);if(idx===-1)return;
  if(!confirm('"'+l1.subs[idx].name+'" 서브카테고리를 삭제할까요?'))return;
  l1.subs.splice(idx,1);
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('🗑️ 삭제됐어요');
}

// ── delAdminL3 ──
function delAdminL3(){}

// ── addPostToCategory ──
function addPostToCategory(){
  const l2val=document.getElementById('l2SelectForPost')?.value;
  const title=document.getElementById('newPostTitle')?.value?.trim();
  const desc=document.getElementById('newPostDesc')?.value?.trim();
  const emoji=document.getElementById('newPostEmoji')?.value?.trim()||'📝';
  const read=document.getElementById('newPostRead')?.value?.trim()||'5분';
  if(!l2val||!title){toast('카테고리와 글 제목을 입력해주세요');return;}
  const [l1id,l2id]=l2val.split('__');
  const l1=CAT_DATA.find(c=>c.id===l1id);if(!l1)return;
  const l2=l1.subs.find(s=>s.id===l2id);if(!l2)return;
  const today=new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'});
  const newId='post_'+Date.now();
  l2.items.unshift({id:newId,title,desc:desc||title,date:today,read,emoji});
  document.getElementById('newPostTitle').value='';
  document.getElementById('newPostDesc').value='';
  document.getElementById('newPostEmoji').value='';
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('✅ "'+title.substring(0,20)+'..." 글이 추가됐어요!');
}

// ── delAdminPost ──
function delAdminPost(l1id,l2id,idx){
  const l1=CAT_DATA.find(c=>c.id===l1id);if(!l1)return;
  const l2=l1.subs.find(s=>s.id===l2id);if(!l2)return;
  const title=l2.items[idx]?.title||'이 글';
  if(!confirm('"'+title.substring(0,20)+'..."을 삭제할까요?'))return;
  l2.items.splice(idx,1);
  renderAdminCatTree();buildCatTree();renderPosts();
  toast('🗑️ 글이 삭제됐어요');
}

// ── renderHomeComments ──
function renderHomeComments(){
  const list=document.getElementById('homeCommentList');
  if(!list||!comments.length)return;
  list.innerHTML=comments.slice(0,6).map(c=>`
    <div style="background:var(--sur);border:1px solid var(--bd);border-radius:14px;padding:14px;transition:.2s" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='var(--bd)'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="background:var(--grad);border-radius:50%;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">${c.name[0]}</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--tx)">${c.name}</div>
          <div style="font-size:10px;color:var(--mt)">${c.date}</div>
        </div>
        <div style="margin-left:auto;font-size:11px;color:var(--mt)">❤️ ${c.likes}</div>
      </div>
      <div style="font-size:13px;color:var(--mt);line-height:1.7;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${c.text}</div>
    </div>
  `).join('');
}