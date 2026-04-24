import React, { useEffect, useState } from 'react';

function Confetti() {
  const items = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    dur: 2.5 + Math.random() * 2,
    color: ['#FFD700','#E63946','#2DC653','#1D91D5','#FF6B9D','#F4A261'][i % 6],
    size: 6 + Math.random() * 8,
    rot: Math.random() * 360,
  }));
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {items.map(p => (
        <div key={p.id} style={{
          position:'absolute',
          left:`${p.x}%`, top:'-20px',
          width:p.size, height:p.size,
          background:p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '0',
          transform:`rotate(${p.rot}deg)`,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in infinite`,
        }}/>
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0.3; }
        }
      `}</style>
    </div>
  );
}

export default function WinScreen({ winner, players = [], onRestart }) {
  const [show, setShow] = useState(false);
  const [countUp, setCountUp] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    let count = 0;
    const target = winner?.finishedCount || 4;
    const iv = setInterval(() => {
      count++;
      setCountUp(count);
      if (count >= target) clearInterval(iv);
    }, 180);
    return () => clearInterval(iv);
  }, [show, winner]);

  const sorted = [...players].sort((a, b) => {
    if (b.finishedCount !== a.finishedCount) return b.finishedCount - a.finishedCount;
    return (b.captures || 0) - (a.captures || 0);
  });

  const rankEmoji = ['🥇','🥈','🥉','🏅'];

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#0D0500 0%,#1A0A00 40%,#2C1810 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:20, position:'relative', overflow:'hidden',
      fontFamily:"'Noto Sans KR','Malgun Gothic',sans-serif",
    }}>
      <Confetti/>

      {/* 불꽃 배경 장식 */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        {['🎆','🎇','✨','🎊','🎉','⭐'].map((e,i) => (
          <div key={i} style={{
            position:'absolute',
            left:`${[10,85,20,75,45,60][i]}%`,
            top:`${[15,20,75,70,10,85][i]}%`,
            fontSize:[40,36,28,32,44,30][i],
            opacity:0.12,
            animation:`float ${3+i*0.4}s ease-in-out infinite`,
            animationDelay:`${i*0.5}s`,
          }}>{e}</div>
        ))}
      </div>

      <div style={{
        position:'relative', zIndex:1,
        width:'100%', maxWidth:460,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transition:'all 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* 왕관 & 트로피 */}
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{
            fontSize:80, lineHeight:1,
            animation:'float 2.5s ease-in-out infinite, pulse 1.5s ease-in-out infinite',
            display:'inline-block',
          }}>👑</div>
        </div>

        {/* 메인 카드 */}
        <div style={{
          background:`linear-gradient(160deg,${winner?.color||'#C8A951'}1A,rgba(26,9,0,0.95))`,
          borderRadius:28, padding:'32px 28px',
          border:`3px solid ${winner?.color||'#C8A951'}`,
          boxShadow:`0 30px 80px rgba(0,0,0,0.85), 0 0 60px ${winner?.color||'#C8A951'}30`,
          textAlign:'center',
          backdropFilter:'blur(10px)',
        }}>

          {/* 우승자 정보 */}
          <div style={{ marginBottom:20 }}>
            <div style={{
              fontSize:56, marginBottom:6,
              filter:`drop-shadow(0 0 20px ${winner?.color||'#C8A951'})`,
              animation:'float 2s ease-in-out infinite',
              display:'inline-block',
            }}>{winner?.emoji}</div>
            <div style={{
              fontSize:28, fontWeight:900, color:'#F5DEB3',
              fontFamily:'Noto Serif KR,serif', letterSpacing:2, marginBottom:4,
            }}>{winner?.name}</div>
            <div style={{
              fontSize:15, fontWeight:700,
              color:winner?.color||'#C8A951', letterSpacing:1.5,
              background:`${winner?.color||'#C8A951'}18`,
              padding:'5px 18px', borderRadius:20, display:'inline-block',
              border:`1px solid ${winner?.color||'#C8A951'}44`,
            }}>
              🏆 전국일주 완료!
            </div>
          </div>

          {/* 완주 카운터 */}
          <div style={{
            display:'flex', justifyContent:'center', gap:10,
            marginBottom:24, flexWrap:'wrap',
          }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width:50, height:50, borderRadius:14,
                background: i < countUp
                  ? `linear-gradient(135deg,${winner?.color||'#C8A951'},${winner?.color||'#C8A951'}99)`
                  : 'rgba(255,255,255,0.06)',
                border:`2px solid ${i < countUp ? winner?.color||'#C8A951' : 'rgba(255,255,255,0.12)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20,
                transition:`all 0.3s ${i*0.1}s cubic-bezier(0.34,1.56,0.64,1)`,
                boxShadow: i < countUp ? `0 4px 16px ${winner?.color||'#C8A951'}44` : 'none',
              }}>
                {i < countUp ? '✅' : '⏳'}
              </div>
            ))}
          </div>

          {/* 구분선 */}
          <div style={{
            height:1, background:`linear-gradient(90deg,transparent,${winner?.color||'#C8A951'}55,transparent)`,
            marginBottom:20,
          }}/>

          {/* 순위표 */}
          {players.length > 1 && (
            <div style={{ marginBottom:22 }}>
              <div style={{
                fontSize:11, color:'rgba(200,169,81,0.55)', fontWeight:700,
                letterSpacing:1.5, marginBottom:12, textTransform:'uppercase',
              }}>── 최종 순위 ──</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {sorted.map((p, i) => (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:11,
                    background: p.id === winner?.id
                      ? `${p.color||'#C8A951'}22`
                      : 'rgba(255,255,255,0.04)',
                    borderRadius:13, padding:'9px 14px',
                    border:`1.5px solid ${p.id===winner?.id ? `${p.color||'#C8A951'}55` : 'rgba(255,255,255,0.07)'}`,
                    transition:'all 0.3s',
                  }}>
                    <span style={{ fontSize:20, width:28, textAlign:'center', flexShrink:0 }}>
                      {rankEmoji[i]}
                    </span>
                    <div style={{
                      width:32, height:32, borderRadius:'50%',
                      background:`${p.color||'#C8A951'}22`,
                      border:`2px solid ${p.color||'#C8A951'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:16, flexShrink:0,
                    }}>
                      {p.emoji}
                    </div>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{
                        fontSize:12, fontWeight:800,
                        color: p.id===winner?.id ? '#F5DEB3' : 'rgba(245,222,179,0.6)',
                      }}>{p.name}</div>
                      <div style={{ fontSize:9.5, color:'rgba(200,169,81,0.4)', marginTop:1 }}>
                        잡기 {p.captures||0}회 · 이동 {p.totalMoves||0}회
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:900, color:p.color||'#C8A951' }}>
                        {p.finishedCount}/4
                      </div>
                      <div style={{ fontSize:9, color:'rgba(200,169,81,0.35)' }}>완주</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 한국 여행 메시지 */}
          <div style={{
            background:'rgba(200,169,81,0.08)', borderRadius:14,
            padding:'12px 16px', marginBottom:22,
            border:'1px solid rgba(200,169,81,0.18)',
          }}>
            <div style={{ fontSize:11, color:'#C8A860', lineHeight:1.9, letterSpacing:0.3 }}>
              🇰🇷 대한민국의 아름다운 명소 25곳을<br/>
              모두 탐방했습니다! 훌륭한 여행이었습니다 ✨
            </div>
          </div>

          {/* 재시작 버튼 */}
          <button onClick={onRestart} style={{
            width:'100%', padding:'16px 0',
            background:`linear-gradient(135deg,#8B1A1A,#C0392B)`,
            border:'none', borderRadius:16, color:'#FFF8DC',
            fontSize:17, fontWeight:900,
            fontFamily:'Noto Serif KR,serif', letterSpacing:2,
            cursor:'pointer',
            boxShadow:'0 6px 24px rgba(139,26,26,0.5)',
            transition:'all 0.22s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.025) translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,26,26,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,26,26,0.5)';
            }}
          >
            🔄 다시 전국일주!
          </button>

          <div style={{ marginTop:14, fontSize:10, color:'rgba(200,169,81,0.25)' }}>
            윷놀이 전국일주 · 한국 전통 보드게임
          </div>
        </div>
      </div>
    </div>
  );
}
