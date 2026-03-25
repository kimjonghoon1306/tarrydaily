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
