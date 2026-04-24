import React, { useState } from 'react';

const PLAYER_CONFIGS = [
  { defaultName:'플레이어 1', color:'#E63946', emoji:'🔴' },
  { defaultName:'플레이어 2', color:'#1D91D5', emoji:'🔵' },
  { defaultName:'플레이어 3', color:'#2DC653', emoji:'🟢' },
  { defaultName:'플레이어 4', color:'#F4A261', emoji:'🟠' },
];

const AI_NAMES = ['AI 하회', 'AI 해운대', 'AI 한라', 'AI 경주'];

const RULES = [
  { icon:'🐷', label:'도', desc:'1칸 이동' },
  { icon:'🐶', label:'개', desc:'2칸 이동' },
  { icon:'🐑', label:'걸', desc:'3칸 이동' },
  { icon:'🐂', label:'윷', desc:'4칸 + 한번더' },
  { icon:'🐎', label:'모', desc:'5칸 + 한번더' },
  { icon:'🔙', label:'백도', desc:'-1칸 뒤로' },
];

export default function SetupScreen({ onStart }) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames]           = useState(['','','','']);
  // isAI[i] = true이면 i번 플레이어는 AI
  const [isAI, setIsAI]             = useState([false, false, false, false]);

  const toggleAI = (i) => {
    const next = [...isAI];
    next[i] = !next[i];
    // AI로 전환 시 이름 자동 세팅
    if (next[i]) {
      const n = [...names];
      if (!n[i].trim()) n[i] = AI_NAMES[i];
      setNames(n);
    }
    setIsAI(next);
  };

  const handleStart = () => {
    const finalNames = names.map((n, i) =>
      n.trim() || (isAI[i] ? AI_NAMES[i] : PLAYER_CONFIGS[i].defaultName)
    );
    // isAI 배열도 함께 전달 (numPlayers 길이만큼 잘라서)
    onStart(numPlayers, finalNames, isAI.slice(0, numPlayers));
  };

  // 혼자 플레이(1 인간 + 나머지 AI) 빠른 설정
  const handleSolo = () => {
    const n = [...names];
    if (!n[0].trim()) n[0] = '나';
    setNames(n);
    const ai = [false, true, true, true];
    setIsAI(ai);
    setNumPlayers(2); // 1명 vs 1 AI가 기본, 원하면 numPlayers 조절 가능
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#1a0a00 0%,#2C1810 40%,#4A2C1A 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:20,
      position:'relative', overflow:'hidden',
    }}>
      {/* 배경 이모지 장식 */}
      {['🏯','⛩️','🌸','🎋','🥁','🏔️','🌊','🎭','🌺','🎑'].map((emoji, i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${[5,15,75,85,10,80,25,65,45,55][i]}%`,
          top:`${[10,70,15,60,40,30,85,80,20,90][i]}%`,
          fontSize:[40,32,36,28,34,38,30,32,35,28][i],
          opacity:0.07, pointerEvents:'none',
          animation:`float ${3+i*0.35}s ease-in-out infinite`,
          animationDelay:`${i*0.45}s`,
        }}>{emoji}</div>
      ))}

      <div style={{
        background:'linear-gradient(160deg,#FDF6E3 0%,#F5E6C8 100%)',
        borderRadius:24, padding:'32px 28px',
        width:'100%', maxWidth:440,
        boxShadow:'0 24px 64px rgba(0,0,0,0.65)',
        border:'3px solid #C8A951',
        animation:'bounceIn 0.6s cubic-bezier(0.68,-0.55,0.27,1.55)',
        position:'relative', zIndex:1,
      }}>

        {/* 타이틀 */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:50, marginBottom:6, animation:'float 3s ease-in-out infinite' }}>🇰🇷</div>
          <div style={{ fontSize:30, fontWeight:900, color:'#8B1A1A', fontFamily:'Noto Serif KR,serif', letterSpacing:2 }}>
            윷놀이
          </div>
          <div style={{ fontSize:17, fontWeight:700, color:'#C8A951', fontFamily:'Noto Serif KR,serif', letterSpacing:5, marginTop:2 }}>
            전국일주
          </div>
          <div style={{ marginTop:8, fontSize:12, color:'#7A5C30', lineHeight:1.8 }}>
            한국 전통 윷놀이로 떠나는<br/>대한민국 명소 가상 투어 🗺️
          </div>
        </div>

        {/* ── 빠른 시작: 혼자 플레이 버튼 ── */}
        <div style={{
          background:'linear-gradient(135deg,rgba(139,26,26,0.08),rgba(200,169,81,0.10))',
          border:'1.5px dashed #C8A951',
          borderRadius:14, padding:'12px 14px', marginBottom:18,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
        }}>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:'#5A3010' }}>🤖 혼자 플레이</div>
            <div style={{ fontSize:10.5, color:'#8A6030', lineHeight:1.6, marginTop:2 }}>
              나 혼자 AI 상대로 즐기기!<br/>
              아래에서 인원·AI를 자유롭게 조합할 수도 있어요.
            </div>
          </div>
          <button
            onClick={handleSolo}
            style={{
              flexShrink:0, padding:'10px 14px',
              background:'linear-gradient(135deg,#8B1A1A,#C0392B)',
              border:'none', borderRadius:12, color:'#FFF8DC',
              fontSize:12, fontWeight:900, cursor:'pointer',
              boxShadow:'0 3px 12px rgba(139,26,26,0.4)',
              whiteSpace:'nowrap',
            }}
          >
            1인 시작 →
          </button>
        </div>

        {/* 구분선 */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,#C8A951)' }}/>
          <span style={{ color:'#C8A951', fontSize:11, fontWeight:700 }}>⚙️ 직접 설정</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#C8A951,transparent)' }}/>
        </div>

        {/* 플레이어 수 선택 */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#5A3010', marginBottom:9 }}>
            👥 총 참가 인원 (인간 + AI 합산)
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[2,3,4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)} style={{
                flex:1, padding:'11px 0',
                background: numPlayers===n
                  ? 'linear-gradient(135deg,#8B1A1A,#C0392B)'
                  : 'rgba(255,255,255,0.5)',
                border: numPlayers===n ? '2px solid #8B1A1A' : '2px solid #D4B870',
                borderRadius:12,
                color: numPlayers===n ? '#FFF8DC' : '#5A3010',
                fontSize:16, fontWeight:700, cursor:'pointer',
                transition:'all 0.2s',
                boxShadow: numPlayers===n ? '0 4px 14px rgba(139,26,26,0.35)' : 'none',
              }}>
                {n}명
              </button>
            ))}
          </div>
        </div>

        {/* 플레이어별 설정 (이름 + 인간/AI 토글) */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#5A3010', marginBottom:9 }}>
            ✏️ 플레이어 설정
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Array.from({ length:numPlayers }, (_, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'8px 10px', borderRadius:12,
                background: isAI[i]
                  ? 'rgba(29,145,213,0.08)'
                  : 'rgba(255,255,255,0.35)',
                border: `1.5px solid ${isAI[i] ? '#1D91D5aa' : PLAYER_CONFIGS[i].color+'55'}`,
                transition:'all 0.25s',
              }}>
                {/* 플레이어 색상 아이콘 */}
                <div style={{
                  width:32, height:32, borderRadius:'50%',
                  background: isAI[i] ? '#1D91D5' : PLAYER_CONFIGS[i].color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:15, flexShrink:0,
                  boxShadow:`0 2px 8px ${isAI[i] ? '#1D91D5' : PLAYER_CONFIGS[i].color}55`,
                  transition:'background 0.25s',
                }}>
                  {isAI[i] ? '🤖' : PLAYER_CONFIGS[i].emoji}
                </div>

                {/* 이름 입력 */}
                <input
                  type="text"
                  placeholder={isAI[i] ? AI_NAMES[i] : PLAYER_CONFIGS[i].defaultName}
                  value={names[i]}
                  onChange={e => {
                    const n = [...names];
                    n[i] = e.target.value;
                    setNames(n);
                  }}
                  maxLength={10}
                  style={{
                    flex:1, padding:'7px 11px',
                    background:'rgba(255,255,255,0.65)',
                    border:`1.5px solid ${isAI[i] ? '#1D91D555' : PLAYER_CONFIGS[i].color+'44'}`,
                    borderRadius:9, fontSize:12, color:'#2C1810',
                    fontFamily:'inherit',
                  }}
                />

                {/* 인간 / AI 토글 버튼 */}
                <button
                  onClick={() => toggleAI(i)}
                  title={isAI[i] ? 'AI → 인간으로 전환' : '인간 → AI로 전환'}
                  style={{
                    flexShrink:0,
                    padding:'6px 10px', borderRadius:10,
                    background: isAI[i]
                      ? 'linear-gradient(135deg,#1D91D5,#1565A0)'
                      : 'rgba(255,255,255,0.6)',
                    border: isAI[i] ? '1.5px solid #1D91D5' : '1.5px solid #C8A951',
                    color: isAI[i] ? '#fff' : '#5A3010',
                    fontSize:11, fontWeight:800, cursor:'pointer',
                    transition:'all 0.2s',
                    whiteSpace:'nowrap',
                    boxShadow: isAI[i] ? '0 2px 10px #1D91D544' : 'none',
                  }}
                >
                  {isAI[i] ? '🤖 AI' : '👤 인간'}
                </button>
              </div>
            ))}
          </div>

          {/* AI 인원수 요약 뱃지 */}
          {(() => {
            const aiCount = isAI.slice(0, numPlayers).filter(Boolean).length;
            const humanCount = numPlayers - aiCount;
            if (aiCount === 0) return null;
            return (
              <div style={{
                marginTop:9, padding:'6px 12px', borderRadius:10,
                background:'rgba(29,145,213,0.10)',
                border:'1px solid rgba(29,145,213,0.3)',
                fontSize:11, color:'#1D91D5', fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                <span>👤×{humanCount}</span>
                <span style={{ opacity:0.4 }}>+</span>
                <span>🤖×{aiCount}</span>
                <span style={{ marginLeft:4, color:'#5A3010', fontWeight:400 }}>
                  — AI가 자동으로 윷을 던지고 말을 이동합니다
                </span>
              </div>
            );
          })()}
        </div>

        {/* 규칙 요약 */}
        <div style={{
          background:'rgba(139,26,26,0.06)', borderRadius:13,
          padding:'11px 13px', marginBottom:20,
          border:'1px solid rgba(200,169,81,0.3)',
        }}>
          <div style={{ fontSize:11, color:'#7A5C30', fontWeight:700, marginBottom:8 }}>
            📋 윷 결과 안내
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5 }}>
            {RULES.map(r => (
              <div key={r.label} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'4px 6px', borderRadius:7,
                background:'rgba(255,255,255,0.3)',
              }}>
                <span style={{ fontSize:13 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:'#5A3010' }}>{r.label}</div>
                  <div style={{ fontSize:9, color:'#7A5C30' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:9, fontSize:10.5, color:'#7A5C30', lineHeight:1.8 }}>
            🗺️ 코너(안동·강릉·서울)에서 <strong>지름길</strong> 선택 가능<br/>
            🎮 명소 도착 시 관광 정보 &amp; 미니게임 · 🏆 말 4개 완주 → 승리!
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          style={{
            width:'100%', padding:'15px 0',
            background:'linear-gradient(135deg,#8B1A1A,#C0392B)',
            border:'none', borderRadius:15, color:'#FFF8DC',
            fontSize:17, fontWeight:900,
            fontFamily:'Noto Serif KR,serif',
            letterSpacing:3, cursor:'pointer',
            boxShadow:'0 6px 22px rgba(139,26,26,0.45)',
            transition:'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,26,26,0.6)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(139,26,26,0.45)';
          }}
        >
          🎯 게임 시작!
        </button>

        {/* 하단 태그 */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:12 }}>
          {['🇰🇷 한국 전통 윷놀이','🗺️ 전국 25개 명소','🤖 AI 대전 지원'].map(tag => (
            <span key={tag} style={{
              fontSize:9.5, color:'rgba(122,92,48,0.7)',
              background:'rgba(200,169,81,0.12)',
              border:'1px solid rgba(200,169,81,0.25)',
              borderRadius:20, padding:'3px 9px',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
