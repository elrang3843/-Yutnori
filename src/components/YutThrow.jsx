import React, { useState, useEffect, useRef } from 'react';
import { YUT_RESULTS } from '../data/boardData.js';

// 윷 막대 4개의 앞면/뒷면 조합 정의
const YUT_STICK_COMBOS = {
  백도: [false, true, true, true],   // 뒤 1개 = 백도
  도:   [true, false, false, false], // 앞 1개 = 도
  개:   [true, true, false, false],  // 앞 2개 = 개
  걸:   [true, true, true, false],   // 앞 3개 = 걸
  윷:   [false, false, false, false],// 뒤 4개 = 윷
  모:   [true, true, true, true],    // 앞 4개 = 모
};

function YutStick({ isFront, isAnimating, delay = 0 }) {
  return (
    <div style={{
      width: 18,
      height: 70,
      borderRadius: 9,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isFront
        ? '0 3px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
        : '0 3px 12px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(0,0,0,0.3)',
      background: isFront
        ? 'linear-gradient(180deg, #D4A843 0%, #C8961E 40%, #A07820 100%)'
        : 'linear-gradient(180deg, #5D3A1A 0%, #4A2810 40%, #3D1F08 100%)',
      transform: isAnimating
        ? `rotate(${(Math.random() - 0.5) * 30}deg) translateY(${-10 + Math.random() * 20}px)`
        : 'rotate(0deg)',
      transition: isAnimating ? 'none' : `all 0.4s ease ${delay}s`,
      border: isFront ? '1px solid #A07820' : '1px solid #2A1208',
    }}>
      {/* 앞면: 전통 문양 */}
      {isFront && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          <div style={{ width: 10, height: 2, background: 'rgba(139,82,10,0.6)', borderRadius: 1 }}/>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(139,82,10,0.4)' }}/>
          <div style={{ width: 10, height: 2, background: 'rgba(139,82,10,0.6)', borderRadius: 1 }}/>
        </div>
      )}
      {/* 뒷면: 나무결 */}
      {!isFront && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(180deg, transparent 0px, rgba(255,255,255,0.04) 2px, transparent 4px)',
        }}/>
      )}
    </div>
  );
}

const ALL_RESULTS = Object.values(YUT_RESULTS);

export default function YutThrow({
  onThrow,
  disabled = false,
  lastThrow = null,
  throwing = false,
  extraPending = false,
}) {
  const [animSticks, setAnimSticks] = useState([false, false, false, false]);
  const [displayCombo, setDisplayCombo] = useState(null);
  const animRef = useRef(null);
  const frameRef = useRef(null);

  // 던지는 중 애니메이션
  useEffect(() => {
    if (throwing) {
      setDisplayCombo(null);
      let frame = 0;
      const animate = () => {
        setAnimSticks([
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
        ]);
        frame++;
        if (frame < 14) {
          frameRef.current = setTimeout(animate, 65);
        }
      };
      animate();
      return () => {
        clearTimeout(frameRef.current);
      };
    }
  }, [throwing]);

  // 결과 표시
  useEffect(() => {
    if (!throwing && lastThrow) {
      const combo = YUT_STICK_COMBOS[lastThrow.name];
      if (combo) {
        setAnimSticks(combo);
        setDisplayCombo(lastThrow);
      }
    }
  }, [throwing, lastThrow]);

  const handleThrow = () => {
    if (disabled || throwing) return;
    onThrow?.();
  };

  const sticks = throwing
    ? animSticks
    : (displayCombo ? YUT_STICK_COMBOS[displayCombo.name] || [false, false, false, false] : [false, false, false, false]);

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(20,8,0,0.9), rgba(40,20,5,0.85))',
      borderRadius: 16,
      border: extraPending
        ? '2px solid #FFD700'
        : '1px solid rgba(200,169,81,0.2)',
      padding: '14px 14px 16px',
      boxShadow: extraPending ? '0 0 20px rgba(255,215,0,0.25)' : 'none',
      transition: 'all 0.3s',
    }}>

      {/* 헤더 */}
      <div style={{
        fontSize: 10, color: '#C8A951', fontWeight: 700,
        letterSpacing: 0.8, textAlign: 'center', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      }}>
        <span style={{ opacity: 0.6 }}>──</span>
        <span>윷 던지기</span>
        <span style={{ opacity: 0.6 }}>──</span>
      </div>

      {/* 윷 막대 시각화 */}
      <div style={{
        display: 'flex', gap: 7, justifyContent: 'center', alignItems: 'flex-end',
        marginBottom: 14, minHeight: 82,
        padding: '6px 0',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        border: '1px solid rgba(200,169,81,0.08)',
      }}>
        {sticks.map((isFront, i) => (
          <div key={i} style={{
            transform: throwing
              ? `rotate(${[-12, -4, 4, 12][i] + (Math.random()-0.5)*8}deg) translateY(${Math.random()*8}px)`
              : `rotate(${[-8, -3, 3, 8][i]}deg)`,
            transition: throwing ? 'none' : 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            transitionDelay: `${i * 0.06}s`,
          }}>
            <YutStick isFront={isFront} isAnimating={throwing} delay={i * 0.05} />
          </div>
        ))}
      </div>

      {/* 결과 표시 */}
      <div style={{
        textAlign: 'center', marginBottom: 12, minHeight: 44,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {throwing ? (
          <div style={{ fontSize: 13, color: 'rgba(200,169,81,0.5)', letterSpacing: 2 }}>
            ✦ 던지는 중 ✦
          </div>
        ) : displayCombo ? (
          <div style={{ animation: 'bounceIn 0.4s ease' }}>
            <div style={{
              fontSize: 26, fontWeight: 900,
              color: displayCombo.color || '#C8A951',
              textShadow: `0 2px 12px ${displayCombo.color || '#C8A951'}66`,
              display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22 }}>{displayCombo.emoji}</span>
              <span>{displayCombo.name}</span>
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(200,169,81,0.55)', marginTop: 2,
            }}>
              {displayCombo.steps > 0 ? `+${displayCombo.steps}칸` : `${displayCombo.steps}칸`}
              {displayCombo.extra && (
                <span style={{
                  marginLeft: 6, color: '#FFD700', fontWeight: 700,
                  background: 'rgba(255,215,0,0.12)',
                  padding: '1px 6px', borderRadius: 6, fontSize: 10,
                }}>★ 한번더!</span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'rgba(200,169,81,0.3)', letterSpacing: 1 }}>
            윷을 던져보세요
          </div>
        )}
      </div>

      {/* 던지기 버튼 */}
      <button
        onClick={handleThrow}
        disabled={disabled || throwing}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 12,
          border: 'none',
          background: disabled || throwing
            ? 'rgba(255,255,255,0.06)'
            : extraPending
              ? 'linear-gradient(135deg, #B8860B, #FFD700, #B8860B)'
              : 'linear-gradient(135deg, #8B1A1A 0%, #C0392B 50%, #8B1A1A 100%)',
          backgroundSize: '200% 100%',
          color: disabled || throwing ? 'rgba(255,255,255,0.2)' : '#FFF8DC',
          fontSize: 14,
          fontWeight: 900,
          fontFamily: 'Noto Serif KR, serif',
          letterSpacing: 2,
          cursor: disabled || throwing ? 'not-allowed' : 'pointer',
          boxShadow: disabled || throwing
            ? 'none'
            : extraPending
              ? '0 4px 18px rgba(255,215,0,0.4)'
              : '0 4px 16px rgba(139,26,26,0.45)',
          transition: 'all 0.22s',
          animation: (!disabled && !throwing && extraPending) ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => {
          if (!disabled && !throwing) {
            e.currentTarget.style.transform = 'scale(1.03)';
          }
        }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {throwing ? '🎲 던지는 중...' : extraPending ? '⭐ 한 번 더 던지기!' : '🎲 윷 던지기'}
      </button>

      {/* 윷 결과 간단 참조표 */}
      <div style={{
        marginTop: 12,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
      }}>
        {ALL_RESULTS.map(r => (
          <div key={r.name} style={{
            padding: '4px 5px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 7,
            border: `1px solid ${r.color}22`,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'background 0.15s',
          }}>
            <span style={{ fontSize: 11 }}>{r.emoji}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: r.color }}>{r.name}</span>
            <span style={{
              fontSize: 8.5, color: 'rgba(200,169,81,0.4)',
              marginLeft: 'auto',
            }}>
              {r.steps > 0 ? `+${r.steps}` : r.steps}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
