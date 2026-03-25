/* TARRY의 데일리 - data.js : 전역 데이터 및 변수 */

// ── 카테고리 데이터 ──
const CAT_DATA = [
  {id:'news',name:'오늘의 뉴스',icon:'📰',color:'ct-d',subs:[
    {id:'hot',name:'핫이슈',items:[
      {id:'news1',title:'2026년 꼭 알아야 할 AI 트렌드',desc:'올해 주목받는 AI 핵심 트렌드 총정리',date:'3월 22일',read:'5분',emoji:'🤖'},
      {id:'news2',title:'스마트폰 배터리 2배 오래 쓰는 설정법',desc:'몰랐던 배터리 절약 숨겨진 설정',date:'3월 22일',read:'4분',emoji:'🔋'},
      {id:'news3',title:'매달 10만원 아끼는 생활비 절약 꿀팁',desc:'바로 실천 가능한 10가지 절약법',date:'3월 22일',read:'3분',emoji:'💰'}
    ]}
  ]},
  {id:'life',name:'라이프',icon:'🌸',color:'ct-a',subs:[
    {id:'daily',name:'일상',items:[{id:'l1',title:'봄날의 루틴 — 하루를 천천히 시작하는 법',desc:'따뜻한 봄날 모닝 루틴',date:'3월 21일',read:'5분',emoji:'🌸'},{id:'l2',title:'주말을 알차게 보내는 7가지 방법',desc:'지루한 주말이 풍요로워지는 팁',date:'3월 18일',read:'4분',emoji:'☀️'}]},
    {id:'wellness',name:'웰니스',items:[{id:'l3',title:'하루 10분 스트레칭으로 몸이 바뀐다',desc:'직장인을 위한 간단 스트레칭',date:'3월 15일',read:'3분',emoji:'🧘'}]},
  ]},
  {id:'money',name:'돈되는 정보',icon:'💰',color:'ct-b',subs:[
    {id:'adsense',name:'애드센스',items:[{id:'m1',title:'구글 애드센스 수익 극대화 전략',desc:'니치 선정부터 트래픽 확보까지',date:'3월 21일',read:'7분',emoji:'💰'},{id:'m2',title:'애드센스 자동화 수익 극대화',desc:'자동화로 매달 수익 만들기',date:'3월 20일',read:'6분',emoji:'📈'}]},
    {id:'card',name:'신용카드',items:[{id:'m3',title:'나에게 딱 맞는 신용카드 추천',desc:'소비패턴별 최적 카드',date:'3월 19일',read:'5분',emoji:'💳'}]},
  ]},
  {id:'it',name:'IT & 온라인',icon:'💻',color:'ct-c',subs:[
    {id:'ai',name:'AI 활용',items:[{id:'i1',title:'ChatGPT 프롬프트 모음 완벽 가이드',desc:'생산성 200% UP',date:'3월 21일',read:'8분',emoji:'🤖'},{id:'i2',title:'ChatGPT로 현실 수익 창출하기',desc:'AI 활용 돈 버는 방법',date:'3월 20일',read:'7분',emoji:'🤑'},{id:'i3',title:'2026 무료 AI 툴 추천 TOP10',desc:'직장인 필독 AI 툴',date:'3월 19일',read:'6분',emoji:'✨'}]},
    {id:'app',name:'앱 꿀팁',items:[{id:'i4',title:'카카오톡 숨겨진 꿀팁 5가지',desc:'몰랐던 기능으로 채팅 혁신',date:'3월 21일',read:'4분',emoji:'💬'},{id:'i5',title:'네이버 지도 꿀기능 완벽 정리',desc:'일상을 스마트하게',date:'3월 18일',read:'5분',emoji:'🗺️'}]},
  ]},
  {id:'trend',name:'트렌드 정보',icon:'🔥',color:'ct-d',subs:[
    {id:'enter',name:'엔터테인먼트',items:[{id:'t1',title:'2026 넷플릭스 추천 영화 TOP10',desc:'놓치면 후회하는 최고 작품들',date:'3월 21일',read:'5분',emoji:'🎬'},{id:'t2',title:'요즘 뜨는 OTT 콘텐츠 총정리',desc:'넷플릭스·티빙·쿠팡플레이',date:'3월 16일',read:'6분',emoji:'📺'}]},
    {id:'social',name:'소셜 트렌드',items:[{id:'t3',title:'2026 SNS 트렌드 완벽 분석',desc:'Threads·숏폼·AI 콘텐츠',date:'3월 14일',read:'7분',emoji:'📱'}]},
  ]},
];

// ── 글 본문 컨테이너 ──
var POST_CONTENTS = {};

// ── 전역 상태 변수 ──
var currentUser = null;
var isAdminLoggedIn = false;
var adminPw = "123456";
var comments = [];
var extraFiles = [];
var currentCat = null;
var currentSubCat = null;
var currentPost = null;
var _rssCurrentView = 'card';
var _autoSyncTimer = null;
var _syncFreq = 'daily';
var _autoSyncEnabled = false;
var nlMode = 'manual';
var nlAutoSelect = 'random';
var nlTimer = null;
var nlHistory = [];
var nlEmails = [];
var autoIncTimer = null;

// ── 통계 객체 ──
const STATS={
  data:{totalVisitors:12847,dailyVisitors:234,autoMode:true,lastReset:new Date().toDateString(),postViews:{}},
  init(){
    try{const d=JSON.parse(localStorage.getItem('tarry_stats')||'{}');if(d.totalVisitors)Object.assign(STATS.data,d);}catch(e){}
    if(STATS.data.lastReset!==new Date().toDateString()){STATS.data.dailyVisitors=0;STATS.data.lastReset=new Date().toDateString();}
    if(STATS.data.autoMode){STATS.data.totalVisitors++;STATS.data.dailyVisitors++;}
    STATS.save();STATS.upd();
    if(STATS.data.autoMode)setInterval(()=>{const a=Math.floor(Math.random()*3)+1;STATS.data.totalVisitors+=a;STATS.data.dailyVisitors+=a;STATS.save();STATS.upd();},30000);
  },
  save(){try{localStorage.setItem('tarry_stats',JSON.stringify(STATS.data));}catch(e){}},
  upd(){const t=document.getElementById('statTotal'),d=document.getElementById('statDaily');if(t)t.textContent=STATS.fmt(STATS.data.totalVisitors);if(d)d.textContent=STATS.fmt(STATS.data.dailyVisitors);},
  fmt(n){if(n>=10000)return(n/10000).toFixed(1)+'만';return n.toLocaleString('ko-KR');},
  getPostView(id){if(!STATS.data.postViews[id])STATS.data.postViews[id]=Math.floor(Math.random()*500)+100;if(STATS.data.autoMode)STATS.data.postViews[id]++;STATS.save();return STATS.data.postViews[id];}
};

// ── 소셜 팝업 객체 ──
const SOCIAL={
  active:true,timer:null,
  names:['김○순','이○영','박○준','최○진','정○민','강○희','윤○수','임○현'],
  msgs:['글을 읽고 있어요 📖','방금 가입했어요! 🎉','댓글을 남겼어요 💬','구독했어요 📩','좋아요를 눌렀어요 ❤️'],
  show(msg){const p=document.getElementById('socialPopup');if(!p)return;const av=document.getElementById('socialPopupAv'),m=document.getElementById('socialPopupMsg'),t=document.getElementById('socialPopupTime');if(av)av.textContent=msg.name[0];if(m)m.innerHTML='<strong>'+msg.name+'</strong>님이 '+msg.text;if(t)t.textContent='방금 전';p.style.display='block';setTimeout(()=>p.style.display='none',20000);},
  rand(){const n=this.names[Math.floor(Math.random()*this.names.length)];const m=this.msgs[Math.floor(Math.random()*this.msgs.length)];this.show({name:n,text:m});},
  start(){if(this.timer)clearInterval(this.timer);setTimeout(()=>{if(SOCIAL.active)SOCIAL.rand();},4000);this.timer=setInterval(()=>{if(SOCIAL.active)SOCIAL.rand();},22000);}
};
