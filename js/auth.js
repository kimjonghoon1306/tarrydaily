/* TARRY의 데일리 - auth.js */

// ── openAdminLogin ──
function openAdminLogin(){
  if(isAdminLoggedIn){
    // 이미 로그인: 바로 관리자 페이지
    var allPages = document.querySelectorAll('.page');
    for(var pi=0;pi<allPages.length;pi++){
      allPages[pi].style.display='none';
      allPages[pi].classList.remove('on');
    }
    var pg = document.getElementById('page-admin');
    if(pg){ pg.style.display='block'; pg.classList.add('on'); }
    window.scrollTo(0,0);
    try{ adminOpen(); }catch(e){}
  } else {
    // 미로그인: 팝업 표시
    var popup = document.getElementById('adminLoginPopup');
    if(popup){
      popup.classList.remove('hide');
      popup.classList.remove('hide');
      popup.style.display='';
      var inp = document.getElementById('adminPwInput');
      if(inp){ inp.value=''; inp.focus(); }
    }
  }
}

// ── doAdminLogin ──
function doAdminLogin(){
  var v1 = (document.getElementById('adminPwInput')||{}).value||'';
  var v2 = (document.getElementById('adminPwField')||{}).value||'';
  var entered = v1 || v2;
  if(!entered){ toast('비밀번호를 입력해주세요'); return; }
  if(entered.trim() === adminPw){
    isAdminLoggedIn = true;
    var inp1 = document.getElementById('adminPwInput');
    var inp2 = document.getElementById('adminPwField');
    if(inp1) inp1.value = '';
    if(inp2) inp2.value = '';
    var e1 = document.getElementById('adminErr');
    var e2 = document.getElementById('adminLoginErr');
    if(e1) e1.style.display = 'none';
    if(e2) e2.style.display = 'none';
    // 성공 메시지 표시
    var ok1 = document.getElementById('adminLoginOk');
    var ok2 = document.getElementById('adminLoginOk2');
    if(ok1){ ok1.style.display='block'; setTimeout(function(){ok1.style.display='none';},2000); }
    if(ok2){ ok2.style.display='block'; setTimeout(function(){ok2.style.display='none';},2000); }
    // 팝업 닫기
    var popup = document.getElementById('adminLoginPopup');
    if(popup) setTimeout(function(){ popup.classList.add('hide'); },600);
    // 관리자 페이지로 이동
    setTimeout(function(){
      document.querySelectorAll('.page').forEach(function(p){
        p.style.display='none'; p.classList.remove('on');
      });
      var pg = document.getElementById('page-admin');
      if(pg){ pg.style.display='block'; pg.classList.add('on'); }
      window.scrollTo(0,0);
      try{ adminOpen(); }catch(e){}
    }, 600);
    toast('🔐 관리자 페이지에 오신 걸 환영해요!');
  } else {
    var e1 = document.getElementById('adminErr');
    var e2 = document.getElementById('adminLoginErr');
    if(e1) e1.style.display = 'block';
    if(e2) e2.style.display = 'block';
    var inp1 = document.getElementById('adminPwInput');
    var inp2 = document.getElementById('adminPwField');
    if(inp1){ inp1.value=''; inp1.focus(); }
    else if(inp2){ inp2.value=''; inp2.focus(); }
    toast('❌ 비밀번호가 틀렸어요');
  }
}

// ── tryAdminLogin ──
function tryAdminLogin(){doAdminLogin();}

// ── adminOpen ──
function adminOpen(){
  var adminPage=document.getElementById('page-admin');
  if(adminPage){
    document.querySelectorAll('.page').forEach(function(p){p.style.display='none';p.classList.remove('on');});
    adminPage.style.display='block';
    adminPage.classList.add('on');
  }
  switchTab('dash');
}

// ── setAdminTab ──
function setAdminTab(id){switchTab(id);}

// ── doAdminLogout ──
function doAdminLogout(){isAdminLoggedIn=false;showPage('home');setNav('home');toast('로그아웃됐어요');}

// ── togglePwVis ──
function togglePwVis(inputId, btnId){
  var inp = document.getElementById(inputId);
  var btn = document.getElementById(btnId);
  if(!inp) return;
  var isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  if(btn) btn.textContent = isHidden ? '🙈' : '👁️';
}

// ── changeAdminPw ──
function changeAdminPw(){
  var cur = (document.getElementById('curPw')?.value||'').trim();
  var np  = (document.getElementById('newPw')?.value||'').trim();
  var cnf = (document.getElementById('newPwConfirm')?.value||'').trim();
  var ok  = document.getElementById('pwSuccess');
  var errShow = function(msg){ toast(msg); };
  if(!cur){ errShow('현재 비밀번호를 입력해주세요'); return; }
  if(cur !== adminPw){ errShow('❌ 현재 비밀번호가 틀렸어요'); return; }
  if(!np || np.length < 4){ errShow('새 비밀번호는 4자 이상이어야 해요'); return; }
  if(np !== cnf){ errShow('새 비밀번호가 일치하지 않아요'); return; }
  adminPw = np;
  try{ localStorage.setItem('tarry_admin_pw', np); }catch(e){}
  var curEl = document.getElementById('curPw');
  var newEl = document.getElementById('newPw');
  var cnfEl = document.getElementById('newPwConfirm');
  if(curEl) curEl.value='';
  if(newEl) newEl.value='';
  if(cnfEl) cnfEl.value='';
  if(ok){ ok.style.display='block'; setTimeout(function(){ ok.style.display='none'; }, 3000); }
  toast('✅ 비밀번호가 성공적으로 변경됐어요!');
}

// ── doLogin ──
function doLogin(){
  const email=document.getElementById('lEmail')?.value||'';
  const pw=document.getElementById('lPw')?.value||'';
  if(!email||!pw){toast('이메일과 비밀번호를 입력해주세요');return;}
  loginSuccess({email,name:email.split('@')[0],grade:'FREE'});
}

// ── checkSignupEmail ──
function checkSignupEmail(){
  var email = document.getElementById('sEmail')?.value?.trim()||'';
  var box = document.getElementById('emailCheckBox');
  var icon = document.getElementById('ec_format_icon');
  if(!email){if(box)box.style.display='none';return;}
  if(box) box.style.display='block';
  var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(icon){
    icon.textContent = ok ? '✅' : '❌';
    icon.parentElement.style.color = ok ? '#059669' : '#dc2626';
  }
}

// ── checkSignupPw ──
function checkSignupPw(){
  var pw = document.getElementById('sPw')?.value||'';
  var box = document.getElementById('pwCheckBox');
  if(!pw){if(box)box.style.display='none';return;}
  if(box) box.style.display='block';

  var checks = {
    len:   pw.length >= 6,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num:   /[0-9]/.test(pw)
  };

  function setCheck(id, iconId, ok){
    var row = document.getElementById(id);
    var ic  = document.getElementById(iconId);
    if(ic)  ic.textContent = ok ? '✅' : '⬜';
    if(row) row.style.color = ok ? '#059669' : 'var(--mt)';
  }
  setCheck('pwCheck_len',   'pc_len',   checks.len);
  setCheck('pwCheck_upper', 'pc_upper', checks.upper);
  setCheck('pwCheck_lower', 'pc_lower', checks.lower);
  setCheck('pwCheck_num',   'pc_num',   checks.num);

  var score = Object.values(checks).filter(Boolean).length;
  var bar   = document.getElementById('pwStrengthBar');
  var label = document.getElementById('pwStrengthLabel');
  var configs = [
    {w:'25%', color:'#ef4444', txt:'취약해요 😟'},
    {w:'50%', color:'#f97316', txt:'조금 더 필요해요 🤔'},
    {w:'75%', color:'#eab308', txt:'거의 다 왔어요 😊'},
    {w:'100%',color:'#22c55e', txt:'완벽해요! 🎉'}
  ];
  if(bar && label && score > 0){
    bar.style.width   = configs[score-1].w;
    bar.style.background = configs[score-1].color;
    label.textContent = configs[score-1].txt;
    label.style.color = configs[score-1].color;
  }
}

// ── doSignup ──
function doSignup(){
  var nick  = document.getElementById('sNick')?.value?.trim()||'';
  var email = document.getElementById('sEmail')?.value?.trim()||'';
  var pw    = document.getElementById('sPw')?.value||'';
  // 이메일 검증
  if(!email){toast('✉️ 이메일을 입력해주세요');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('✉️ 올바른 이메일 형식이 아니에요 (예: abc@gmail.com)');return;}
  // 비밀번호 검증
  if(!pw){toast('🔐 비밀번호를 입력해주세요');return;}
  if(pw.length<6){toast('🔐 비밀번호는 6자 이상이어야 해요');return;}
  if(!/[A-Z]/.test(pw)){toast('🔐 영문 대문자(A–Z)를 1개 이상 포함해주세요');return;}
  if(!/[a-z]/.test(pw)){toast('🔐 영문 소문자(a–z)를 1개 이상 포함해주세요');return;}
  if(!/[0-9]/.test(pw)){toast('🔐 숫자(0–9)를 1개 이상 포함해주세요');return;}

  // 중복 이메일 체크
  try{
    var members = JSON.parse(localStorage.getItem('tarry_members')||'[]');
    if(members.find(function(m){return m.email===email;})){
      toast('✉️ 이미 가입된 이메일이에요');return;
    }
  }catch(e){}

  // URL 추천코드 확인
  var refCode = '';
  try{
    var urlParams = new URLSearchParams(window.location.search);
    refCode = urlParams.get('ref') || sessionStorage.getItem('tarry_ref') || '';
  }catch(e){}

  // 고유 추천코드 생성
  var myCode = 'TARRY_' + email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g,'').substring(0,8) + '_' + Date.now().toString(36).toUpperCase().slice(-4);

  var joinDate = new Date().toLocaleDateString('ko-KR');
  var user = {
    email: email,
    name:  nick || email.split('@')[0],
    grade: 'FREE',
    pw:    pw,
    joinDate: joinDate,
    refCode:  myCode,
    refBy:    refCode,
    profileImg: ''
  };

  // 회원 저장
  try{
    var members = JSON.parse(localStorage.getItem('tarry_members')||'[]');
    members.push(user);
    localStorage.setItem('tarry_members', JSON.stringify(members));
  }catch(e){}

  // 추천인 유입 기록
  if(refCode){
    try{
      var refs = JSON.parse(localStorage.getItem('tarry_refs')||'{}');
      if(!refs[refCode]) refs[refCode]=[];
      refs[refCode].push({name: user.name, email: email, date: joinDate});
      localStorage.setItem('tarry_refs', JSON.stringify(refs));
    }catch(e){}
  }

  loginSuccess(user);
  toast('🎉 가입 완료! 환영해요, '+(nick||email.split('@')[0])+'님!');
  // 기존 팝업 제거 후 새로 생성
  setTimeout(function(){
    var existing = document.getElementById('signupSuccessPop');
    if(existing) existing.remove();
    var pop = document.createElement('div');
    pop.id = 'signupSuccessPop';
    pop.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
    pop.onclick = function(e){ if(e.target===pop) pop.remove(); };
    pop.innerHTML='<div style="background:var(--sur);border-radius:22px;padding:32px 28px;text-align:center;max-width:340px;width:100%;box-shadow:0 24px 70px rgba(124,58,237,.25)">'
      +'<div style="font-size:56px;margin-bottom:12px">🎉</div>'
      +'<h2 style="font-family:var(--display);font-size:22px;color:var(--tx);margin-bottom:8px">가입 완료!</h2>'
      +'<p style="font-size:14px;color:var(--mt);margin-bottom:20px">환영해요, <strong style="color:var(--ac)">'+(nick||email.split('@')[0])+'</strong>님!<br>TARRY의 데일리 회원이 됐어요 😊</p>'
      +'<button onclick="document.getElementById(\'signupSuccessPop\').remove()" style="background:var(--grad);color:#fff;border:none;border-radius:10px;padding:12px 32px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)">시작하기 🚀</button>'
      +'</div>';
    document.body.appendChild(pop);
    setTimeout(function(){ if(pop.parentNode) pop.remove(); }, 5000);
  }, 300);
}

// ── loginSuccess ──
function loginSuccess(user){
  currentUser = user;
  isLoggedIn  = true;
  // 네비 업데이트
  var guestArea = document.getElementById('guestArea');
  var navUser   = document.getElementById('navUser');
  var navGrade  = document.getElementById('navGrade');
  var navAv     = document.getElementById('navAv');
  if(guestArea) guestArea.style.display='none';
  if(navUser)   navUser.style.display='flex';
  if(navGrade)  navGrade.textContent = user.grade||'FREE';
  if(navAv){
    navAv.innerHTML = '';
    if(user.profileImg){
      navAv.innerHTML = '<img src="'+user.profileImg+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    } else {
      navAv.textContent = (user.name||'?')[0].toUpperCase();
    }
  }
  // 마이페이지 렌더
  renderMemberPage();
  showPage('home');
  setNav('home');
}

// ── doLogout ──
function doLogout(){
  currentUser=null;isLoggedIn=false;isBrowsing=false;
  var guestArea=document.getElementById('guestArea');if(guestArea)guestArea.style.display='flex';
  var navUser=document.getElementById('navUser');if(navUser)navUser.style.display='none';
  // 마이페이지 초기화
  var gm=document.getElementById('guestMsg');var md=document.getElementById('memberDash');
  if(gm)gm.style.display='block';if(md)md.style.display='none';
  showPage('home');setNav('home');
  toast('로그아웃됐어요');
}

// ── handleLockedClick ──
function handleLockedClick(){showPage('auth');setNav('auth');setAtab('signup');}

// ── doMobileAdminLogin ──
function doMobileAdminLogin(){
  const input=document.getElementById('mobilePwField');
  if(!input)return;
  if(input.value===adminPw){
    isAdminLoggedIn=true;input.value='';
    const loginDiv=document.getElementById('mobileDashLogin');
    const mainDiv=document.getElementById('mobileDashMain');
    if(loginDiv)loginDiv.style.display='none';
    if(mainDiv){mainDiv.style.display='block';updateMobileDashStats();}
    toast('🔐 관리자 로그인 완료!');
  }else{
    toast('❌ 비밀번호가 틀렸어요');input.value='';input.focus();
  }
}

// ── copyRefLink ──
function copyRefLink(){
  var el = document.getElementById('myRefLink');
  if(!el)return;
  try{
    navigator.clipboard.writeText(el.textContent);
    toast('📋 추천링크가 복사됐어요!');
  }catch(e){
    var ta=document.createElement('textarea');ta.value=el.textContent;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('📋 추천링크가 복사됐어요!');
  }
}

// ── shareRefCopy ──
function shareRefCopy(){ copyRefLink(); }

// ── shareRefKakao ──
function shareRefKakao(){
  toast('💛 카카오 공유는 카카오 SDK 연동 후 사용 가능해요');
}

// ── shareRefSMS ──
function shareRefSMS(){
  var el = document.getElementById('myRefLink');
  if(!el)return;
  var link = el.textContent;
  try{ window.open('sms:?body=TARRY의 데일리 추천링크예요!%0A'+encodeURIComponent(link)); }
  catch(e){ toast('📱 문자앱을 열 수 없어요'); }
}

// ── saveNickname ──
function saveNickname(){
  var v = document.getElementById('editNick')?.value?.trim();
  if(!v){toast('닉네임을 입력해주세요');return;}
  if(!currentUser){toast('로그인이 필요해요');return;}
  currentUser.name = v;
  // localStorage 업데이트
  try{
    var members = JSON.parse(localStorage.getItem('tarry_members')||'[]');
    var idx = members.findIndex(function(m){return m.email===currentUser.email;});
    if(idx!==-1){ members[idx].name=v; localStorage.setItem('tarry_members',JSON.stringify(members)); }
  }catch(e){}
  renderMemberPage();
  // 네비 아바타 이니셜 업데이트
  var navAv = document.getElementById('navAv');
  if(navAv && !currentUser.profileImg) navAv.textContent = v[0].toUpperCase();
  toast('✅ 닉네임이 변경됐어요!');
}

// ── handleMemberProfileUpload ──
function handleMemberProfileUpload(input){
  if(!input.files||!input.files[0])return;
  var reader = new FileReader();
  reader.onload = function(e){
    var imgData = e.target.result;
    if(!currentUser)return;
    currentUser.profileImg = imgData;
    // localStorage 저장
    try{
      var members = JSON.parse(localStorage.getItem('tarry_members')||'[]');
      var idx = members.findIndex(function(m){return m.email===currentUser.email;});
      if(idx!==-1){ members[idx].profileImg=imgData; localStorage.setItem('tarry_members',JSON.stringify(members)); }
    }catch(e){}
    renderMemberPage();
    // 네비 아바타 업데이트
    var navAv = document.getElementById('navAv');
    if(navAv) navAv.innerHTML='<img src="'+imgData+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    toast('📸 프로필 사진이 변경됐어요!');
  };
  reader.readAsDataURL(input.files[0]);
}

// ── renderMemberPage ──
function renderMemberPage(){
  if(!currentUser) return;
  var u = currentUser;

  // 보임/숨김
  var gm = document.getElementById('guestMsg');
  var md = document.getElementById('memberDash');
  if(gm) gm.style.display='none';
  if(md) md.style.display='block';

  // 프로필 이미지
  var avImg  = document.getElementById('mAvImg');
  var avInit = document.getElementById('mAvInitial');
  if(u.profileImg && avImg){
    avImg.src = u.profileImg;
    avImg.style.display='block';
    if(avInit) avInit.style.display='none';
  } else {
    if(avImg) avImg.style.display='none';
    if(avInit){ avInit.style.display='block'; avInit.textContent=(u.name||'?')[0].toUpperCase(); }
  }

  // 기본 정보
  var dn = document.getElementById('dashName');
  var de = document.getElementById('dashEmail');
  var dg = document.getElementById('dashGrade');
  var dj = document.getElementById('dashJoinDate');
  var dc = document.getElementById('dashCmt');
  if(dn) dn.textContent = (u.name||'회원')+'님';
  if(de) de.textContent = u.email||'';
  if(dg) dg.textContent = (u.grade||'FREE')+' 회원';
  if(dj) dj.textContent = '🗓 '+( u.joinDate||new Date().toLocaleDateString('ko-KR'));
  if(dc) dc.textContent = '💬 댓글 '+(comments.filter(function(c){return c.name===u.name;}).length)+'개';

  // 정보 수정 필드
  var en = document.getElementById('editNick');
  var ie = document.getElementById('infoEmail');
  var ij = document.getElementById('infoJoinDate');
  if(en) en.value = u.name||'';
  if(ie) ie.textContent = u.email||'';
  if(ij) ij.textContent = u.joinDate || new Date().toLocaleDateString('ko-KR');

  // 통계
  var sc  = document.getElementById('stCmt');
  var sr  = document.getElementById('stRef');
  var sdy = document.getElementById('stDays');
  if(sc) sc.textContent = comments.filter(function(c){return c.name===u.name;}).length;

  // 추천 유입 수
  var refs = {};
  try{ refs = JSON.parse(localStorage.getItem('tarry_refs')||'{}'); }catch(e){}
  var myRefs = (u.refCode && refs[u.refCode]) ? refs[u.refCode] : [];
  if(sr) sr.textContent = myRefs.length;

  // 가입 일수
  if(sdy){
    try{
      var joined = new Date(u.joinDate||new Date());
      var diff = Math.max(1, Math.floor((new Date()-joined)/(1000*60*60*24))+1);
      sdy.textContent = diff;
    }catch(e){ sdy.textContent=1; }
  }

  // 추천링크
  var base = window.location.href.split('?')[0].split('#')[0];
  var refCode = u.refCode || '';
  var refLink = refCode ? (base + '?ref=' + refCode) : base;
  var rl = document.getElementById('myRefLink');
  if(rl) rl.textContent = refLink;

  // 추천 배지
  var rcb = document.getElementById('refCountBadge');
  if(rcb) rcb.textContent = myRefs.length + '명';

  // 유입 회원 목록
  var rml = document.getElementById('refMemberList');
  if(rml){
    if(!myRefs.length){
      rml.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--mt)"><div style="font-size:28px;margin-bottom:8px">🔗</div><div style="font-size:13px;font-weight:600;color:var(--tx);margin-bottom:4px">아직 추천 가입자가 없어요</div><div style="font-size:11px">추천링크를 공유하면 여기에 표시돼요!</div></div>';
    } else {
      rml.innerHTML = myRefs.map(function(r, i){
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd)">'
          +'<div style="width:34px;height:34px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">'+(r.name||'?')[0].toUpperCase()+'</div>'
          +'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--tx)">'+r.name+'</div>'
          +'<div style="font-size:11px;color:var(--mt)">'+r.email+'</div></div>'
          +'<div style="font-size:11px;color:var(--mt);flex-shrink:0">'+r.date+'</div>'
          +'</div>';
      }).join('');
    }
  }
}

// ── handleAdminProfileUpload ──
function handleAdminProfileUpload(input){
  if(!input.files||!input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var data = e.target.result;
    try{ localStorage.setItem('tarry_admin_profile_img', data); }catch(err){}
    var img = document.getElementById('adminProfileImg');
    var ini = document.getElementById('adminProfileInitial');
    if(img){ img.src=data; img.style.display='block'; }
    if(ini) ini.style.display='none';
    toast('✅ 프로필 이미지 업로드 완료!');
  };
  reader.readAsDataURL(input.files[0]);
}

// ── saveAdminProfile ──
function saveAdminProfile(){
  var name = (document.getElementById('adminDisplayName')?.value||'').trim() || 'TARRY';
  var bio  = (document.getElementById('adminBio')?.value||'').trim();
  try{
    localStorage.setItem('tarry_admin_name', name);
    localStorage.setItem('tarry_admin_bio', bio);
  }catch(e){}
  var ok = document.getElementById('adminProfileSaved');
  if(ok){ ok.style.display='block'; setTimeout(function(){ ok.style.display='none'; },3000); }
  toast('✅ 프로필이 저장됐어요!');
}

// ── loadAdminProfile ──
function loadAdminProfile(){
  var name = localStorage.getItem('tarry_admin_name')||'TARRY';
  var bio  = localStorage.getItem('tarry_admin_bio')||'';
  var img  = localStorage.getItem('tarry_admin_profile_img')||'';
  var nameEl = document.getElementById('adminDisplayName');
  var bioEl  = document.getElementById('adminBio');
  var imgEl  = document.getElementById('adminProfileImg');
  var iniEl  = document.getElementById('adminProfileInitial');
  if(nameEl) nameEl.value = name;
  if(bioEl)  bioEl.value  = bio;
  if(img && imgEl){
    imgEl.src = img; imgEl.style.display='block';
    if(iniEl) iniEl.style.display='none';
  }
  // OG 이미지 설정 로드
  try{ loadOgImageSetting(); }catch(e){}
}

// ── handleProfileUpload ──
function handleProfileUpload(){}

// ── updateAllAvatars ──
function updateAllAvatars(){}

// ── updateSignupInitial ──
function updateSignupInitial(){
  var nick=document.getElementById('sNick')?.value||'';
  var el=document.getElementById('signupProfileInitial');
  if(el)el.textContent=nick?nick[0].toUpperCase():'?';
}