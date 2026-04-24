import React, { useState } from 'react';

export default function SpotInfo({ spot, onClose, onSubgame }) {
  const [tab, setTab] = useState('info');

  if (!spot) return null;

  const hasVideo   = !!spot.youtubeId;
  const hasSubgame = !!spot.subgame;
  const rc = spot.region?.color || '#C8A951';

  // 지역별 배경 패턴 (이미지 없이 스타일만으로 구성)
  const regionThemes = {
    '서울·경기': { bg: 'linear-gradient(135deg,#1a0a0a,#2d1010,#3d1515)', icon: '🏯🏙️🌆', pattern: '궁궐 · 도시' },
    '강원':      { bg: 'linear-gradient(135deg,#0a1a0a,#102d10,#153d15)', icon: '🏔️🌲🍂', pattern: '산악 · 자연' },
    '충청':      { bg: 'linear-gradient(135deg,#1a1200,#2d2000,#3d2b00)', icon: '🌾🏰📜', pattern: '역사 · 문화' },
    '전라':      { bg: 'linear-gradient(135deg,#001a1a,#002d2d,#003d3d)', icon: '🌊🏘️🎶', pattern: '해안 · 예술' },
    '경상':      { bg: 'linear-gradient(135deg,#0d001a,#1a002d,#25003d)', icon: '⛩️🌸🏺', pattern: '고도 · 유산' },
    '제주':      { bg: 'linear-gradient(135deg,#1a000d,#2d0018,#3d0022)', icon: '🌺🌋🌊', pattern: '섬 · 자연유산' },
  };
  const theme = regionThemes[spot.region?.name] || {
    bg: 'linear-gradient(135deg,#0d0d00,#1a1a00,#252500)',
    icon: '📍🗺️✨', pattern: '한국 명소',
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.22s ease',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #1A0900 0%, #2C1810 55%, #3D1A08 100%)',
        borderRadius: 22,
        width: '100%', maxWidth: 530,
        maxHeight: '92vh', overflowY: 'auto',
        border: `2.5px solid ${rc}`,
        boxShadow: `0 28px 80px rgba(0,0,0,0.92), 0 0 60px ${rc}20`,
        animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative',
      }}>

        {/* ── 히어로 배너 ── */}
        <div style={{
          background: theme.bg,
          height: 110, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '19px 19px 0 0',
        }}>
          {/* 배경 이모지 패턴 */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 80, opacity: 0.07, letterSpacing: 20,
            userSelect: 'none',
          }}>
            {theme.icon}
          </div>
          {/* 지역 색 오버레이 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, ${rc}28 0%, transparent 70%)`,
          }}/>
          {/* 메인 이모지 */}
          <div style={{
            fontSize: 64, position: 'relative', zIndex: 1,
            filter: `drop-shadow(0 0 20px ${rc}88)`,
            animation: 'float 3s ease-in-out infinite',
          }}>
            {spot.emoji}
          </div>
          {/* 지역 라벨 배지 */}
          <div style={{
            position: 'absolute', top: 10, left: 14,
            padding: '4px 10px', borderRadius: 12,
            background: `${rc}33`, border: `1px solid ${rc}55`,
            fontSize: 10, color: rc, fontWeight: 700, letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{spot.region?.emoji}</span>
            <span>{spot.region?.name}</span>
          </div>
          {/* 닫기 버튼 */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 10, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ddd', fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          >✕</button>
        </div>

        {/* ── 타이틀 영역 ── */}
        <div style={{
          background: `linear-gradient(135deg, ${rc}22, ${rc}08)`,
          borderBottom: `1px solid ${rc}30`,
          padding: '14px 20px 12px',
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#F5E6C8', lineHeight: 1.2, marginBottom: 3 }}>
            {spot.name}
          </div>
          <div style={{ fontSize: 12, color: '#B8986A' }}>
            📍 {spot.place}
          </div>
        </div>

        {/* ── 탭 ── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 20px',
          background: 'rgba(0,0,0,0.18)',
        }}>
          {[
            ['info', '📖 정보'],
            ...(hasVideo ? [['video', '▶️ 영상']] : []),
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '10px 18px',
              background: 'transparent', border: 'none',
              borderBottom: tab === key ? `2.5px solid ${rc}` : '2.5px solid transparent',
              color: tab === key ? rc : '#7A5C30',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              marginBottom: -1, transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── 바디 ── */}
        <div style={{ padding: '18px 20px 22px' }}>

          {/* ── 정보 탭 ── */}
          {tab === 'info' && (
            <>
              {/* 설명 */}
              <div style={{
                fontSize: 13, color: '#D4B870', lineHeight: 1.95,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 13, padding: '14px 16px', marginBottom: 14,
                border: `1px solid ${rc}18`,
              }}>
                {spot.description}
              </div>

              {/* 주요 사실 */}
              {spot.facts && spot.facts.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, color: rc, fontWeight: 700,
                    letterSpacing: 1.2, marginBottom: 9,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    💡 주요 사실
                  </div>
                  {spot.facts.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 9, alignItems: 'flex-start',
                      padding: '7px 0',
                      borderBottom: i < spot.facts.length - 1
                        ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: `${rc}22`, border: `1px solid ${rc}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: rc, fontWeight: 900,
                        flexShrink: 0, marginTop: 1,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 12.5, color: '#C8A860', lineHeight: 1.7 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 액션 버튼들 */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {hasVideo && (
                  <button onClick={() => setTab('video')} style={{
                    flex: '1 1 auto', padding: '12px 14px',
                    background: 'linear-gradient(135deg,#C0392B,#E74C3C)',
                    border: 'none', borderRadius: 12, color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 3px 14px rgba(192,57,43,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ▶️ 소개 영상 보기
                  </button>
                )}
                {hasSubgame && (
                  <button onClick={() => onSubgame?.(spot.subgame)} style={{
                    flex: '1 1 auto', padding: '12px 14px',
                    background: `linear-gradient(135deg, ${rc}EE, ${rc}AA)`,
                    border: 'none', borderRadius: 12, color: '#1A0800',
                    fontSize: 12, fontWeight: 900, cursor: 'pointer',
                    boxShadow: `0 3px 14px ${rc}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🎮 {spot.subgame.name}
                  </button>
                )}
                <button onClick={onClose} style={{
                  flex: '1 1 auto', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, color: '#bbb',
                  fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                >
                  계속 진행 →
                </button>
              </div>
            </>
          )}

          {/* ── 영상 탭 ── */}
          {tab === 'video' && hasVideo && (
            <>
              {/* YouTube 썸네일 미리보기 */}
              <div style={{
                position: 'relative',
                borderRadius: 14, overflow: 'hidden',
                border: `1px solid ${rc}33`, marginBottom: 14,
                background: '#000',
                aspectRatio: '16/9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                gap: 12,
              }}>
                {/* 썸네일 이미지 */}
                <img
                  src={`https://img.youtube.com/vi/${spot.youtubeId}/mqdefault.jpg`}
                  alt={spot.place}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: 0.6,
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                {/* 재생 버튼 오버레이 */}
                <a
                  href={`https://www.youtube.com/watch?v=${spot.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'relative', zIndex: 2,
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(255,0,0,0.88)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, textDecoration: 'none',
                    boxShadow: '0 4px 24px rgba(255,0,0,0.55)',
                    transition: 'transform 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(200,0,0,0.95)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,0,0,0.88)'; }}
                >
                  ▶
                </a>
                <div style={{
                  position: 'relative', zIndex: 2,
                  fontSize: 11, color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(0,0,0,0.55)',
                  padding: '4px 12px', borderRadius: 8,
                  fontWeight: 600,
                }}>
                  YouTube에서 재생
                </div>
              </div>

              <div style={{
                fontSize: 11, color: '#7A5C30',
                textAlign: 'center', marginBottom: 14,
                padding: '6px 12px',
                background: 'rgba(200,169,81,0.06)',
                borderRadius: 8, border: '1px solid rgba(200,169,81,0.1)',
              }}>
                📹 {spot.place} 소개 영상 | {spot.region?.name}
              </div>

              {/* YouTube 새 탭 열기 버튼 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <a
                  href={`https://www.youtube.com/watch?v=${spot.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '12px 0',
                    background: 'linear-gradient(135deg,#C0392B,#E74C3C)',
                    border: 'none', borderRadius: 12, color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, textDecoration: 'none',
                    boxShadow: '0 3px 14px rgba(192,57,43,0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ▶ YouTube에서 영상 보기 (새 탭)
                </a>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {hasSubgame && (
                  <button onClick={() => onSubgame?.(spot.subgame)} style={{
                    flex: 1, padding: '12px 0',
                    background: `linear-gradient(135deg, ${rc}EE, ${rc}AA)`,
                    border: 'none', borderRadius: 12, color: '#1A0800',
                    fontSize: 12, fontWeight: 900, cursor: 'pointer',
                  }}>🎮 {spot.subgame.name}</button>
                )}
                <button onClick={onClose} style={{
                  flex: 1, padding: '12px 0',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, color: '#bbb',
                  fontSize: 12, cursor: 'pointer',
                }}>계속 진행 →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
