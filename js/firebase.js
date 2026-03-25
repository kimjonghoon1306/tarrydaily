/* TARRY의 데일리 - Firebase 댓글 연동 */

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAD5ouPW6BcnUNWIKOivrLESogYDS58r1w",
  authDomain: "tarry-daily.firebaseapp.com",
  databaseURL: "https://tarry-daily-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tarry-daily",
  storageBucket: "tarry-daily.firebasestorage.app",
  messagingSenderId: "907462343678",
  appId: "1:907462343678:web:219506c111677942831eaf",
  measurementId: "G-4RYF296PRY"
};

// Firebase 초기화
let firebaseDB = null;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') return;
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firebaseDB = firebase.database();
    console.log('✅ Firebase 연결 완료');
    // 연결 후 댓글 실시간 로드
    loadFirebaseComments();
  } catch(e) {
    console.log('Firebase 초기화 실패:', e);
  }
}

// 댓글 저장 (Firebase)
function saveCommentToFirebase(comment) {
  if (!firebaseDB) return;
  try {
    firebaseDB.ref('comments').push(comment);
  } catch(e) {
    console.log('댓글 저장 실패:', e);
  }
}

// 댓글 실시간 불러오기
function loadFirebaseComments() {
  if (!firebaseDB) return;
  try {
    firebaseDB.ref('comments').on('value', function(snapshot) {
      var data = snapshot.val();
      if (!data) { comments = []; }
      else {
        comments = Object.entries(data).map(function([key, val]) {
          return Object.assign({}, val, { firebaseKey: key });
        });
        // 최신순 정렬
        comments.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        });
      }
      // 화면 업데이트
      try { renderComments(); } catch(e) {}
      try { renderHomeComments(); } catch(e) {}
      try { renderAdminComments(); } catch(e) {}
      try { renderAdminComments2(); } catch(e) {}
    });
  } catch(e) {
    console.log('댓글 로드 실패:', e);
  }
}

// 댓글 삭제 (Firebase)
function deleteCommentFromFirebase(firebaseKey) {
  if (!firebaseDB || !firebaseKey) return;
  try {
    firebaseDB.ref('comments/' + firebaseKey).remove();
  } catch(e) {}
}

// 댓글 좋아요 업데이트 (Firebase)
function updateCommentLikeInFirebase(firebaseKey, likes) {
  if (!firebaseDB || !firebaseKey) return;
  try {
    firebaseDB.ref('comments/' + firebaseKey + '/likes').set(likes);
  } catch(e) {}
}

// ── 글별 댓글 저장 ──
var currentPostId = null;
var postCommentListeners = {};

function submitPostComment(){
  var input = document.getElementById('postCommentInput');
  if(!input || !input.value.trim()){ toast('댓글을 입력해주세요'); return; }
  var cmt = {
    name: currentUser ? currentUser.name : '익명',
    text: input.value.trim(),
    date: new Date().toLocaleDateString('ko-KR'),
    timestamp: Date.now(),
    likes: 0
  };
  if(firebaseDB && currentPostId){
    firebaseDB.ref('postComments/' + currentPostId).push(cmt);
    input.value = '';
    toast('✅ 댓글이 등록됐어요!');
  } else {
    toast('잠시 후 다시 시도해주세요');
  }
}

function loadPostComments(postId){
  if(!firebaseDB || !postId) return;
  currentPostId = postId;
  // 이전 리스너 해제
  if(postCommentListeners[postId]){
    firebaseDB.ref('postComments/' + postId).off('value', postCommentListeners[postId]);
  }
  var listener = firebaseDB.ref('postComments/' + postId).on('value', function(snapshot){
    var list = document.getElementById('postCommentList');
    if(!list) return;
    var data = snapshot.val();
    if(!data){ list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--mt);font-size:13px">첫 번째 댓글을 남겨주세요 😊</div>'; return; }
    var cmts = Object.entries(data).map(function([k,v]){ return Object.assign({},v,{key:k}); });
    cmts.sort(function(a,b){ return b.timestamp - a.timestamp; });
    list.innerHTML = cmts.map(function(c){
      return '<div style="background:var(--sur);border:1px solid var(--bd);border-radius:12px;padding:14px">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<div style="width:32px;height:32px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">'+(c.name?c.name[0].toUpperCase():'익')+'</div>'
        + '<div><div style="font-size:13px;font-weight:700;color:var(--tx)">'+c.name+'</div>'
        + '<div style="font-size:11px;color:var(--mt)">'+c.date+'</div></div>'
        + '</div>'
        + '<div style="font-size:14px;color:var(--tx);line-height:1.7">'+c.text+'</div>'
        + '</div>';
    }).join('');
  });
  postCommentListeners[postId] = listener;
}
