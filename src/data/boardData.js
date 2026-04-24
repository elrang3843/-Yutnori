// ============================================================
// 윷놀이 전국일주 - Board Data
// ============================================================

export const NODE_TYPE = {
  START:  'start',
  CORNER: 'corner',
  CENTER: 'center',
  NORMAL: 'normal',
};

export const SUBGAME_TYPE = {
  QUIZ:   'quiz',
  NONGAK: 'nongak',
  JEGI:   'jegi',
};

export const REGION = {
  SEOUL:       { name: '서울·경기', color: '#E63946', emoji: '🏙️' },
  GANGWON:     { name: '강원',      color: '#2DC653', emoji: '🏔️' },
  CHUNGCHEONG: { name: '충청',      color: '#F4A261', emoji: '🌾' },
  JEOLLA:      { name: '전라',      color: '#00B4D8', emoji: '🌊' },
  GYEONGSANG:  { name: '경상',      color: '#9B5DE5', emoji: '⛩️' },
  JEJU:        { name: '제주',      color: '#FF6B9D', emoji: '🌺' },
};

// ── YUT RESULTS ────────────────────────────────────────────
export const YUT_RESULTS = {
  백도: { name:'백도', steps:-1, emoji:'🔙', extra:false, color:'#888888', description:'-1칸 (뒤로)' },
  도:   { name:'도',   steps: 1, emoji:'🐷', extra:false, color:'#E67E22', description:'+1칸' },
  개:   { name:'개',   steps: 2, emoji:'🐶', extra:false, color:'#27AE60', description:'+2칸' },
  걸:   { name:'걸',   steps: 3, emoji:'🐑', extra:false, color:'#2980B9', description:'+3칸' },
  윷:   { name:'윷',   steps: 4, emoji:'🐂', extra:true,  color:'#C0392B', description:'+4칸 ★한번더' },
  모:   { name:'모',   steps: 5, emoji:'🐎', extra:true,  color:'#6C3483', description:'+5칸 ★한번더' },
};

export const THROW_WEIGHTS = [
  { result:'백도', weight:5  },
  { result:'도',   weight:22 },
  { result:'개',   weight:32 },
  { result:'걸',   weight:22 },
  { result:'윷',   weight:11 },
  { result:'모',   weight:8  },
];

// ── BOARD NODE POSITIONS (SVG %, from 0-100 grid) ──────────
// 0=출발(BR, 우하단), CCW:
// 1-3 bottom(→left), 4=BL corner(하좌),
// 5-7 left(↑), 8=TL corner(상좌),
// 9-11 top(→right), 12=TR corner(상우),
// 13-15 right(↓). CENTER=16.
// TR shortcut: 12→17→18→16
// TL shortcut: 8→19→20→16
// BL shortcut: 4→21→22→16
// Center exit: 16→23→24→0 (finish)
export const BOARD_NODES = [
  { id: 0,  x:85, y:85, type:NODE_TYPE.START  },  // 출발 (우하단)
  { id: 1,  x:64, y:85, type:NODE_TYPE.NORMAL },
  { id: 2,  x:50, y:85, type:NODE_TYPE.NORMAL },
  { id: 3,  x:36, y:85, type:NODE_TYPE.NORMAL },
  { id: 4,  x:15, y:85, type:NODE_TYPE.CORNER },  // 하좌 코너
  { id: 5,  x:15, y:64, type:NODE_TYPE.NORMAL },
  { id: 6,  x:15, y:50, type:NODE_TYPE.NORMAL },
  { id: 7,  x:15, y:36, type:NODE_TYPE.NORMAL },
  { id: 8,  x:15, y:15, type:NODE_TYPE.CORNER },  // 상좌 코너
  { id: 9,  x:36, y:15, type:NODE_TYPE.NORMAL },
  { id:10,  x:50, y:15, type:NODE_TYPE.NORMAL },
  { id:11,  x:64, y:15, type:NODE_TYPE.NORMAL },
  { id:12,  x:85, y:15, type:NODE_TYPE.CORNER },  // 상우 코너
  { id:13,  x:85, y:36, type:NODE_TYPE.NORMAL },
  { id:14,  x:85, y:50, type:NODE_TYPE.NORMAL },
  { id:15,  x:85, y:64, type:NODE_TYPE.NORMAL },
  { id:16,  x:50, y:50, type:NODE_TYPE.CENTER },  // 중앙
  // TR shortcut: 12→17→18→16
  { id:17,  x:72, y:28, type:NODE_TYPE.NORMAL },
  { id:18,  x:61, y:39, type:NODE_TYPE.NORMAL },
  // TL shortcut: 8→19→20→16
  { id:19,  x:28, y:28, type:NODE_TYPE.NORMAL },
  { id:20,  x:39, y:39, type:NODE_TYPE.NORMAL },
  // BL shortcut: 4→21→22→16
  { id:21,  x:28, y:72, type:NODE_TYPE.NORMAL },
  { id:22,  x:39, y:61, type:NODE_TYPE.NORMAL },
  // Center exit: 16→23→24→0
  { id:23,  x:61, y:61, type:NODE_TYPE.NORMAL },
  { id:24,  x:72, y:72, type:NODE_TYPE.NORMAL },
];

// ── MOVEMENT GRAPH ─────────────────────────────────────────
// -1 = 완주 (출발점 통과)
export const PATH_NEXT = {
  // 외곽 경로
  0:1, 1:2, 2:3, 3:4,
  4:5, 5:6, 6:7, 7:8,
  8:9, 9:10, 10:11, 11:12,
  12:13, 13:14, 14:15, 15:-1,
  // 중앙 출구
  16:23, 23:24, 24:-1,
  // TR 지름길 (상우→중앙)
  17:18, 18:16,
  // TL 지름길 (상좌→중앙)
  19:20, 20:16,
  // BL 지름길 (하좌→중앙)
  21:22, 22:16,
};

export const OUTER_PATH = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
export const SHORTCUT_ENTRY = new Set([4, 8, 12]);
export const SHORTCUT_START = { 4:21, 8:19, 12:17 };

// ── QUIZ DATA ──────────────────────────────────────────────
// 각 spot의 subgame 안에 questions 배열을 직접 넣는 방식으로 전환.
// QUIZ_BANK는 fallback 용도로만 유지합니다.
export const QUIZ_BANK = {
  history: [
    { q:'경복궁을 처음 세운 조선의 왕은?', opts:['세종대왕','태조 이성계','정조','세조'], ans:1, exp:'태조 이성계가 1395년 조선 건국 후 경복궁을 창건했습니다.' },
    { q:'훈민정음(한글)을 창제한 왕은?', opts:['태종','성종','세종대왕','중종'], ans:2, exp:'세종대왕이 1443년 훈민정음을 창제하였습니다.' },
    { q:'세계 최초 금속활자 인쇄본의 이름은?', opts:['팔만대장경','직지심체요절','훈민정음','동의보감'], ans:1, exp:'직지심체요절(1377)은 세계 최초 금속활자 인쇄본으로 유네스코 세계기록유산입니다.' },
    { q:'임진왜란에서 한산도대첩을 이끈 장군은?', opts:['권율','김시민','이순신','원균'], ans:2, exp:'이순신 장군은 한산도대첩(1592)에서 학익진을 이용해 일본군을 격파했습니다.' },
    { q:'신라의 수도는 어느 도시인가요?', opts:['부여','공주','경주','익산'], ans:2, exp:'경주는 신라 천년(기원전 57~935)의 수도로 불국사·석굴암 등이 있습니다.' },
  ],
  nature: [
    { q:'한라산의 높이는 몇 미터인가요?', opts:['1,708m','1,850m','1,950m','2,000m'], ans:2, exp:'한라산(1,950m)은 대한민국에서 가장 높은 산입니다.' },
    { q:'설악산의 최고봉 이름은?', opts:['천왕봉','반야봉','대청봉','향로봉'], ans:2, exp:'설악산의 최고봉은 대청봉(1,708m)입니다.' },
    { q:'제주도의 세계자연유산이 아닌 것은?', opts:['성산일출봉','한라산','만장굴','오름'], ans:3, exp:'제주 세계자연유산은 성산일출봉·한라산·만장굴 등 용암동굴계입니다.' },
    { q:'대한민국에서 가장 긴 강은?', opts:['한강','낙동강','금강','영산강'], ans:1, exp:'낙동강(525km)은 대한민국에서 가장 긴 강으로 경상도를 흐릅니다.' },
  ],
  culture: [
    { q:'윷놀이에서 5칸 이동하는 결과는?', opts:['윷','모','걸','도'], ans:1, exp:'모는 말 5마리를 의미하며 5칸 이동합니다. 한번 더 던질 수 있는 특권도 있습니다.' },
    { q:'사물놀이에 사용되지 않는 악기는?', opts:['꽹과리','장구','해금','북'], ans:2, exp:'사물놀이는 꽹과리·장구·북·징 4가지 타악기로 연주합니다. 해금은 현악기입니다.' },
    { q:'한국의 전통 발효 음식이 아닌 것은?', opts:['김치','된장','막걸리','잡채'], ans:3, exp:'잡채는 발효 음식이 아니라 당면과 채소를 볶은 요리입니다.' },
  ],
};

// ── TOURIST SPOTS ──────────────────────────────────────────
export const SPOTS = [
  {
    id:0,  type:NODE_TYPE.START,
    name:'출발',    place:'경복궁',
    region:REGION.SEOUL, emoji:'🏯',
    imageQuery: 'Gyeongbokgung Palace Seoul Korea',
    description:'조선 왕조의 으뜸 궁궐 경복궁! 근정전·경회루·향원정 등 아름다운 건물들이 가득한 서울의 상징입니다. 매일 수문장 교대식이 열립니다.',
    facts:['1395년 태조 이성계 창건','근정전은 국보 제223호','연간 방문객 약 1,400만 명'],
    youtubeId:'p9-mKJHDpkk', subgame:null,
  },
  {
    id:1,  type:NODE_TYPE.NORMAL,
    name:'수원',    place:'수원화성',
    region:REGION.SEOUL, emoji:'🏰',
    imageQuery: 'Suwon Hwaseong Fortress Korea',
    description:'정조대왕의 꿈이 담긴 수원화성! 1796년에 완성된 과학적이고 아름다운 성곽으로 1997년 유네스코 세계문화유산에 등재되었습니다.',
    facts:['1796년 완공','유네스코 세계문화유산(1997)','둘레 5.74km'],
    youtubeId:'rMxrMrGkJA4', subgame:null,
  },
  {
    id:2,  type:NODE_TYPE.NORMAL,
    name:'천안',    place:'독립기념관',
    region:REGION.CHUNGCHEONG, emoji:'🗽',
    imageQuery: 'Independence Hall Korea Cheonan',
    description:'대한민국 독립의 역사를 간직한 독립기념관! 7개 전시관에서 일제강점기 독립운동의 생생한 역사를 만납니다.',
    facts:['1987년 개관','7개 전시관 운영','연간 방문객 약 280만 명'],
    youtubeId:'Gy_GDnqtEJk',
    subgame:{
      type:'quiz', name:'🗽 독립운동 퀴즈', desc:'천안 독립기념관에서 독립운동 역사를 맞혀보세요!',
      questions:[
        { q:'3·1운동이 일어난 연도는?', opts:['1910년','1919년','1945년','1950년'], ans:1, exp:'1919년 3월 1일, 전국에서 독립 만세 운동이 일어났습니다.' },
        { q:'유관순 열사가 태어난 충청남도 지역은?', opts:['천안','아산','공주','보령'], ans:0, exp:'유관순 열사는 충청남도 천안(병천) 출신으로, 3·1운동의 상징적 인물입니다.' },
        { q:'독립기념관이 개관한 연도는?', opts:['1980년','1983년','1987년','1990년'], ans:2, exp:'독립기념관은 1987년 8월 15일 광복절에 개관했습니다.' },
        { q:'대한민국 임시정부가 수립된 곳은?', opts:['상하이','베이징','도쿄','블라디보스토크'], ans:0, exp:'대한민국 임시정부는 1919년 중국 상하이에서 수립되었습니다.' },
      ],
    },
  },
  {
    id:3,  type:NODE_TYPE.NORMAL,
    name:'공주',    place:'공산성·무령왕릉',
    region:REGION.CHUNGCHEONG, emoji:'👑',
    imageQuery: 'Gongju Gongsan Fortress Baekje Korea',
    description:'백제의 옛 도읍 공주! 공산성과 무령왕릉에서 찬란한 백제 문화를 만날 수 있습니다. 2015년 유네스코 세계문화유산 등재.',
    facts:['무령왕릉 1971년 발굴','국보 17점 출토','2015 세계유산 등재'],
    youtubeId:null, subgame:null,
  },
  {
    id:4,  type:NODE_TYPE.CORNER,
    name:'안동',    place:'하회마을',
    region:REGION.GYEONGSANG, emoji:'🎭',
    imageQuery: 'Andong Hahoe Village Korea traditional',
    description:'낙동강이 마을을 S자로 휘감아 도는 하회마을! 조선 양반 문화의 정수이자 유네스코 세계문화유산. 하회별신굿탈놀이의 본고장입니다.',
    facts:['2010년 유네스코 세계유산','풍산 류씨 600년 세거지','하회탈춤 국가무형문화재'],
    youtubeId:'tSCyWfPSXFo',
    subgame:{
      type:'quiz', name:'🎭 하회마을 퀴즈', desc:'안동 하회마을의 역사와 문화를 맞혀보세요!',
      questions:[
        { q:'안동 하회마을이 유네스코 세계유산으로 등재된 연도는?', opts:['2000년','2005년','2010년','2015년'], ans:2, exp:'하회마을은 2010년 유네스코 세계문화유산으로 등재되었습니다.' },
        { q:'하회마을에 600년간 세거한 성씨는?', opts:['경주 김씨','안동 권씨','풍산 류씨','안동 장씨'], ans:2, exp:'풍산 류씨가 조선 초부터 600년 넘게 세거하고 있습니다.' },
        { q:'안동 하회 탈춤의 정식 명칭은?', opts:['봉산탈춤','하회별신굿탈놀이','양주별산대놀이','강릉관노가면극'], ans:1, exp:'하회별신굿탈놀이는 안동을 대표하는 국가무형문화재 탈춤입니다.' },
        { q:'하회마을을 굽이 도는 강의 이름은?', opts:['한강','금강','낙동강','섬진강'], ans:2, exp:'낙동강이 마을을 S자로 휘감아 돌아 "하회(河回)"라는 이름이 붙었습니다.' },
      ],
    },
  },
  {
    id:5,  type:NODE_TYPE.NORMAL,
    name:'부산',    place:'해운대 해수욕장',
    region:REGION.GYEONGSANG, emoji:'🏖️',
    imageQuery: 'Haeundae Beach Busan Korea',
    description:'한국 최고의 해변 해운대! 눈부신 백사장과 마린시티 스카이라인이 어우러지며, 매년 10월 부산국제영화제(BIFF)가 열립니다.',
    facts:['백사장 길이 1.5km','연간 방문객 1,000만+','부산국제영화제 매년 10월'],
    youtubeId:'gVBOmZ7KNtU', subgame:null,
  },
  {
    id:6,  type:NODE_TYPE.NORMAL,
    name:'통영',    place:'한려해상국립공원',
    region:REGION.GYEONGSANG, emoji:'⛵',
    imageQuery: 'Tongyeong Hallyeohaesang National Park Korea',
    description:'동양의 나폴리, 통영! 미륵산 케이블카에서 내려다보는 다도해 풍경이 절경이며, 이순신 장군의 한산대첩 현장이기도 합니다.',
    facts:['한산대첩 이순신 전승지','나전칠기 공예의 고향','케이블카에서 한려수도 조망'],
    youtubeId:'h7qBrXHkSUk', subgame:null,
  },
  {
    id:7,  type:NODE_TYPE.NORMAL,
    name:'경주',    place:'불국사·석굴암',
    region:REGION.GYEONGSANG, emoji:'⛩️',
    imageQuery: 'Bulguksa Temple Gyeongju Korea UNESCO',
    description:'신라 천년의 고도 경주! 불국사와 석굴암은 8세기 통일신라 불교 건축의 걸작으로 유네스코 세계문화유산입니다.',
    facts:['불국사 751년 창건','석굴암 본존불 국보 24호','경주 역사지구 전체 세계유산'],
    youtubeId:'ZhP2AVmFG8M',
    subgame:{
      type:'quiz', name:'⛩️ 경주 신라 역사 퀴즈', desc:'신라 천년 고도 경주의 역사를 맞혀보세요!',
      questions:[
        { q:'불국사가 창건된 시기는?', opts:['삼국시대 고구려','통일신라 8세기','고려시대','조선시대'], ans:1, exp:'불국사는 통일신라 751년(경덕왕 10년) 김대성에 의해 창건되었습니다.' },
        { q:'석굴암 본존불이 국보 몇 호인가요?', opts:['국보 20호','국보 24호','국보 36호','국보 1호'], ans:1, exp:'석굴암 본존불상은 국보 제24호로 지정되어 있습니다.' },
        { q:'신라가 존속한 기간(건국~멸망)은 몇 년인가요?', opts:['약 500년','약 700년','약 992년','약 400년'], ans:2, exp:'신라는 기원전 57년 건국 후 935년 고려에 복속되기까지 약 992년간 존속했습니다.' },
        { q:'경주 첨성대는 어떤 용도로 사용되었나요?', opts:['군사 망루','천문 관측대','곡식 창고','왕실 제단'], ans:1, exp:'첨성대는 신라 선덕여왕 때 세워진 동아시아 최고(最古) 천문 관측대입니다.' },
      ],
    },
  },
  {
    id:8,  type:NODE_TYPE.CORNER,
    name:'강릉',    place:'경포대·오죽헌',
    region:REGION.GANGWON, emoji:'🌊',
    imageQuery: 'Gangneung Ojukheon Korea',
    description:'동해안의 보석 강릉! 신사임당과 율곡 이이의 생가 오죽헌, 아름다운 경포대, 그리고 유네스코 인류무형유산 강릉단오제의 고장.',
    facts:['오죽헌: 5천원권 지폐 배경','강릉단오제 유네스코 유산','경포 해변 연간 400만 방문'],
    youtubeId:'BHXmSFHAP8E',
    subgame:{ type:'jegi', name:'🪃 제기차기 미니게임', desc:'강릉 단오 전통 놀이를 즐겨보세요!' },
  },
  {
    id:9,  type:NODE_TYPE.NORMAL,
    name:'설악산',  place:'설악산 국립공원',
    region:REGION.GANGWON, emoji:'🏔️',
    imageQuery: 'Seoraksan National Park Korea autumn',
    description:'한국의 알프스 설악산! 울산바위·비룡폭포·권금성 케이블카 등 사계절 내내 아름답고, 가을 단풍은 전국 최고입니다.',
    facts:['1970년 국립공원 지정','유네스코 생물권보전지역','최고봉 대청봉 1,708m'],
    youtubeId:'xmrVE3LfVEo', subgame:null,
  },
  {
    id:10, type:NODE_TYPE.NORMAL,
    name:'평창',    place:'대관령·동계올림픽',
    region:REGION.GANGWON, emoji:'🐑',
    imageQuery: 'Pyeongchang Olympic Korea mountains',
    description:'고원의 낭만 평창! 대관령 양떼목장의 초록 풍경과 2018 평창 동계올림픽의 영광이 살아 숨 쉬는 곳입니다.',
    facts:['2018 평창 동계올림픽 개최','해발 800~900m 고원','메밀꽃 필 무렵 이효석 문학관'],
    youtubeId:null, subgame:null,
  },
  {
    id:11, type:NODE_TYPE.NORMAL,
    name:'춘천',    place:'남이섬·닭갈비',
    region:REGION.GANGWON, emoji:'🌿',
    imageQuery: 'Nami Island Chuncheon Korea',
    description:'드라마 겨울연가의 촬영지 남이섬! 메타세쿼이아 가로수길과 아름다운 자연, 그리고 전국 최고의 닭갈비 골목이 있습니다.',
    facts:['드라마 겨울연가 촬영지','외국인 방문객 연 100만+','닭갈비·막국수 본고장'],
    youtubeId:'iq7_ek_bEIM', subgame:null,
  },
  {
    id:12, type:NODE_TYPE.CORNER,
    name:'서울',    place:'광화문·N서울타워',
    region:REGION.SEOUL, emoji:'🏙️',
    imageQuery: 'Gwanghwamun Plaza Seoul Korea',
    description:'대한민국의 심장 서울! 광화문광장과 청계천이 어우러지고, N서울타워에서 서울 야경을 한눈에 담을 수 있습니다.',
    facts:['광화문: 경복궁 정문(1395)','N서울타워 높이 236m','인사동·북촌 전통문화거리'],
    youtubeId:'KptbPHEZMr4',
    subgame:{ type:'nongak', name:'🥁 사물놀이 리듬게임', desc:'전통 사물놀이 리듬을 맞춰보세요!' },
  },
  {
    id:13, type:NODE_TYPE.NORMAL,
    name:'전주',    place:'전주 한옥마을',
    region:REGION.JEOLLA, emoji:'🏘️',
    imageQuery: 'Jeonju Hanok Village Korea traditional',
    description:'한국 전통의 맛과 멋이 살아있는 전주 한옥마을! 700여 채의 한옥, 전주비빔밥·막걸리, 판소리가 어우러진 문화의 도시.',
    facts:['700여 채 한옥 보존','전주비빔밥·막걸리 발상지','유네스코 음식 창의도시'],
    youtubeId:'u3YNQPp0I44',
    subgame:{
      type:'quiz', name:'🍚 전주 문화 퀴즈', desc:'전주 한옥마을의 음식과 전통 문화를 맞혀보세요!',
      questions:[
        { q:'전주비빔밥에 반드시 들어가는 재료가 아닌 것은?', opts:['콩나물','육회','고추장','냉면 육수'], ans:3, exp:'전주비빔밥에는 콩나물·육회·고추장·참기름이 핵심 재료입니다. 냉면 육수는 들어가지 않습니다.' },
        { q:'전주가 유네스코로부터 받은 창의도시 분야는?', opts:['음악','음식','공예','문학'], ans:1, exp:'전주는 2012년 유네스코 음식 창의도시로 선정되었습니다.' },
        { q:'전주 한옥마을에 보존된 한옥은 약 몇 채인가요?', opts:['100채','300채','700채','1,000채'], ans:2, exp:'전주 한옥마을에는 약 700여 채의 한옥이 보존되어 있습니다.' },
        { q:'전주에서 기원한 전통 공연 예술은?', opts:['탈춤','판소리','사물놀이','줄타기'], ans:1, exp:'전주는 판소리의 본고장으로, 동편제 판소리가 전주 일대에서 발전했습니다.' },
      ],
    },
  },
  {
    id:14, type:NODE_TYPE.NORMAL,
    name:'여수',    place:'여수 밤바다·오동도',
    region:REGION.JEOLLA, emoji:'🌃',
    imageQuery: 'Yeosu night sea Korea',
    description:'버스커버스커의 노래로 유명한 여수 밤바다! 오동도의 동백꽃, 돌산대교 야경, 2012 여수세계박람회 개최지입니다.',
    facts:['2012년 세계박람회 개최','오동도 동백나무 3,000그루','게장·갓김치 특산품'],
    youtubeId:'FUJWTiYEPNE', subgame:null,
  },
  {
    id:15, type:NODE_TYPE.NORMAL,
    name:'제주',    place:'한라산·성산일출봉',
    region:REGION.JEJU, emoji:'🌋',
    imageQuery: 'Jeju Seongsan Ilchulbong Hallasan Korea',
    description:'한국의 보석 섬 제주도! 한라산(남한 최고봉), 성산일출봉, 만장굴 3개의 유네스코 세계자연유산이 한 섬에 있습니다.',
    facts:['세계자연유산 3곳 보유','한라산 1,950m 남한 최고봉','흑돼지·감귤 대표 특산품'],
    youtubeId:'z5P_zGFHDaE',
    subgame:{
      type:'quiz', name:'🌺 제주 자연 퀴즈', desc:'제주도의 자연유산과 특산물을 맞혀보세요!',
      questions:[
        { q:'한라산의 높이는 몇 미터인가요?', opts:['1,708m','1,850m','1,950m','2,100m'], ans:2, exp:'한라산(1,950m)은 남한에서 가장 높은 산입니다.' },
        { q:'제주도에서 유네스코 세계자연유산으로 등재된 곳이 아닌 것은?', opts:['성산일출봉','한라산 천연보호구역','만장굴','우도'], ans:3, exp:'제주 세계자연유산은 한라산·성산일출봉·거문오름 용암동굴계(만장굴 포함)입니다. 우도는 포함되지 않습니다.' },
        { q:'제주의 대표 과일 특산물은?', opts:['사과','감귤','배','복숭아'], ans:1, exp:'감귤은 제주도의 대표 특산물로 온난한 기후 덕분에 재배됩니다.' },
        { q:'제주도의 돌담 문화가 발달한 주된 이유는?', opts:['장식 목적','바람 방어 및 경계 구분','물 저장','관광용'], ans:1, exp:'제주도는 강한 바람과 현무암 돌이 많아 바람을 막고 밭 경계를 구분하기 위해 돌담을 쌓았습니다.' },
      ],
    },
  },
  // CENTER
  {
    id:16, type:NODE_TYPE.CENTER,
    name:'중앙',    place:'남산 N서울타워',
    region:REGION.SEOUL, emoji:'🗼',
    imageQuery: 'N Seoul Tower Namsan Korea night',
    description:'서울의 랜드마크 N서울타워! 남산 정상에 우뚝 솟아 서울 전경을 한눈에 담을 수 있으며, 사랑의 자물쇠로도 유명합니다.',
    facts:['타워 높이 236m(해발 479.7m)','사랑의 자물쇠 약 100만 개','야경 명소 세계 TOP 10'],
    youtubeId:'EV5E-UJgRyA',
    subgame:{ type:'nongak', name:'🥁 사물놀이 리듬게임', desc:'한국 전통 사물놀이 리듬을 맞춰보세요!' },
  },
  // TR shortcut nodes
  {
    id:17, type:NODE_TYPE.NORMAL,
    name:'속초',    place:'속초 아바이마을',
    region:REGION.GANGWON, emoji:'🦀',
    imageQuery: 'Sokcho Abai Village Korea East Sea',
    description:'청호동 아바이마을! 한국전쟁 이후 실향민이 정착해 만든 마을로 오징어순대·아바이순대가 유명하고 갯배를 타고 건넙니다.',
    facts:['한국전쟁 실향민 정착지','드라마 가을동화 촬영지','갯배 이동 독특한 명물'],
    youtubeId:null, subgame:null,
  },
  {
    id:18, type:NODE_TYPE.NORMAL,
    name:'대전',    place:'엑스포과학공원',
    region:REGION.CHUNGCHEONG, emoji:'🔬',
    imageQuery: 'Daejeon Expo Science Park Korea',
    description:'과학도시 대전! 1993년 세계박람회 개최지에 위치한 엑스포과학공원에서 과학과 미래를 체험할 수 있습니다.',
    facts:['1993년 세계박람회 개최','대덕연구단지 위치','한빛탑 높이 93m'],
    youtubeId:null, subgame:null,
  },
  // TL shortcut nodes
  {
    id:19, type:NODE_TYPE.NORMAL,
    name:'청주',    place:'직지·고인쇄박물관',
    region:REGION.CHUNGCHEONG, emoji:'📜',
    imageQuery: 'Cheongju Jikji metal printing Korea',
    description:'세계 최초 금속활자본 직지심체요절의 고장 청주! 2001년 유네스코 세계기록유산으로 등재된 직지는 구텐베르크보다 78년 앞선 인쇄물.',
    facts:['직지: 1377년 인쇄','유네스코 세계기록유산(2001)','구텐베르크보다 78년 앞선 발명'],
    youtubeId:null,
    subgame:{
      type:'quiz', name:'📜 직지 역사 퀴즈', desc:'청주 직지와 세계 인쇄 역사를 맞혀보세요!',
      questions:[
        { q:'직지심체요절이 인쇄된 연도는?', opts:['1234년','1377년','1443년','1592년'], ans:1, exp:'직지심체요절은 1377년 청주 흥덕사에서 금속활자로 인쇄되었습니다.' },
        { q:'직지가 유네스코에 등재된 분야는?', opts:['세계문화유산','인류무형유산','세계기록유산','세계자연유산'], ans:2, exp:'직지심체요절은 2001년 유네스코 세계기록유산에 등재되었습니다.' },
        { q:'구텐베르크의 금속활자 성경보다 직지가 앞선 연도는?', opts:['22년','78년','100년','150년'], ans:1, exp:'구텐베르크 성경(1455년)보다 직지(1377년)가 78년 앞서 인쇄되었습니다.' },
        { q:'직지가 현재 소장된 곳은?', opts:['국립중앙박물관','청주고인쇄박물관','프랑스 국립도서관','대영박물관'], ans:2, exp:'직지는 현재 프랑스 국립도서관(BnF)에 소장되어 있습니다.' },
      ],
    },
  },
  {
    id:20, type:NODE_TYPE.NORMAL,
    name:'보령',    place:'대천해수욕장·머드축제',
    region:REGION.CHUNGCHEONG, emoji:'💦',
    imageQuery: 'Boryeong Mud Festival Korea',
    description:'세계 4대 축제 머드축제의 고장 보령! 매년 여름 대천해수욕장에서 열리는 국제머드축제에 외국인 관광객들이 구름처럼 몰려옵니다.',
    facts:['세계 4대 축제 선정','연간 방문객 200만+','대천해수욕장 백사장 3.5km'],
    youtubeId:null, subgame:null,
  },
  // BL shortcut nodes
  {
    id:21, type:NODE_TYPE.NORMAL,
    name:'광주',    place:'5·18기념공원·문화전당',
    region:REGION.JEOLLA, emoji:'🕊️',
    imageQuery: 'Gwangju May 18 Memorial Park Korea',
    description:'민주주의의 도시 광주! 5·18민주화운동의 역사와 국립아시아문화전당이 공존하는 문화·인권 도시입니다.',
    facts:['1980년 5·18민주화운동','국립아시아문화전당 아시아 최대','광주비엔날레 세계적 현대미술제'],
    youtubeId:null, subgame:null,
  },
  {
    id:22, type:NODE_TYPE.NORMAL,
    name:'목포',    place:'목포 근대역사관·유달산',
    region:REGION.JEOLLA, emoji:'⚓',
    imageQuery: 'Mokpo harbor Yudalsan Korea',
    description:'남도의 관문 목포! 근대 개항의 역사와 유달산, 그리고 홍어·세발낙지로 유명한 항구도시입니다.',
    facts:['1897년 개항','유달산에서 다도해 전망','홍어·세발낙지 특산 음식'],
    youtubeId:null, subgame:null,
  },
  // Center exit nodes
  {
    id:23, type:NODE_TYPE.NORMAL,
    name:'대구',    place:'대구 근대골목·팔공산',
    region:REGION.GYEONGSANG, emoji:'🌶️',
    imageQuery: 'Daegu modern alley Palgongsan Korea',
    description:'섬유·패션의 도시 대구! 근대골목 투어와 팔공산 갓바위, 그리고 세계적으로 유명한 치맥 페스티벌이 있습니다.',
    facts:['국내 3대 도시','팔공산 갓바위 소원 명소','대구 치맥 페스티벌'],
    youtubeId:null, subgame:null,
  },
  {
    id:24, type:NODE_TYPE.NORMAL,
    name:'울산',    place:'태화강국가정원·암각화',
    region:REGION.GYEONGSANG, emoji:'🦋',
    imageQuery: 'Ulsan Taehwa River National Garden Korea',
    description:'산업과 자연이 공존하는 울산! 태화강국가정원의 철새 군무와 선사시대 유물 반구대 암각화가 함께하는 도시입니다.',
    facts:['태화강 2019년 국가정원','반구대암각화 유네스코 등재 추진','현대자동차·현대중공업 본고장'],
    youtubeId:null, subgame:null,
  },
];

export const SPOT_BY_ID = Object.fromEntries(SPOTS.map(s => [s.id, s]));
export function getSpot(id) {
  return SPOT_BY_ID[id] ?? {
    id, type:NODE_TYPE.NORMAL, name:`위치 ${id}`, place:'한국 명소',
    region:REGION.SEOUL, emoji:'📍', description:'아름다운 한국의 명소입니다.',
    facts:[], youtubeId:null, subgame:null,
  };
}
