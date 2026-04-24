import React, { useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState.js';
import { SPOTS, YUT_RESULTS, SHORTCUT_ENTRY } from './data/boardData.js';
import GameBoard    from './components/GameBoard.jsx';
import YutThrow     from './components/YutThrow.jsx';
import PlayerPanel  from './components/PlayerPanel.jsx';
import SpotInfo     from './components/SpotInfo.jsx';
import SubGame      from './components/SubGame.jsx';
import SetupScreen  from './components/SetupScreen.jsx';
import WinScreen    from './components/WinScreen.jsx';

export default function App() {
  const game = useGameState();
  const [throwing, setThrowing]           = useState(false);
  const [activeSubgame, setActiveSubgame] = useState(null);
  const [showLog, setShowLog]             = useState(false);
  const [showRules, setShowRules]         = useState(false);
  const [lastMovedPos, setLastMovedPos]   = useState(null);

  /* ── 셋업 ── */
  if (game.gamePhase === 'setup') {
    return <SetupScreen onStart={game.startGame}/>;
  }

  /* ── 승리 ── */
  if (game.gamePhase === 'finished' && game.winner) {
    return (
      <WinScreen
        winner={game.winner}
        players={game.players}
        onRestart={() => game.setGamePhase('setup')}
      />
    );
  }

  const currentPlayer = game.players[game.currentPlayerIdx];

  /* 던지기 가능 조건 */
  const canThrow =
    !throwing &&
    !game.selectingPiece &&
    (game.throwResults.length === 0 || game.extraThrowPending);

  const handleThrow = () => {
    if (!canThrow) return;
    setThrowing(true);
    setTimeout(() => {
      game.throwYut();
      setThrowing(false);
    }, 950);
  };

  const handlePieceClick = (pieceId, useShortcut = true) => {
    if (!game.selectingPiece || !game.pendingSteps) return;
    const result = game.movePieceAction(pieceId, useShortcut);
    // 이동 후 파티클 표시를 위해 lastMovedPos 업데이트
    // (실제 newPos는 게임 상태에서 읽어야 하지만 단순화)
  };

  /* 이동 가능한 말 목록 */
  const moveablePieces = (game.selectingPiece && currentPlayer && game.pendingSteps)
    ? currentPlayer.pieces.filter(pc => {
        if (pc.finished) return false;
        if (game.pendingSteps.steps < 0 && pc.pos === -1) return false;
        return true;
      })
    : [];

  /* 상태 메시지 색상 */
  const msgBgColor = currentPlayer
    ? `linear-gradient(135deg,${currentPlayer.color}18,${currentPlayer.color}06)`
    : 'rgba(200,169,81,0.06)';
  const msgBorderColor = currentPlayer
    ? `${currentPlayer.color}40`
    : 'rgba(200,169,81,0.2)';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#0D0500 0%,#1A0800 45%,#2C1008 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans KR','Malgun Gothic','맑은 고딕',sans-serif",
    }}>

      {/* ════════════ TOP BAR ════════════ */}
      <div style={{
        background: 'linear-gradient(90deg,#140600,#2A1200,#140600)',
        padding: '7px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid rgba(200,169,81,0.35)',
        flexShrink: 0,
        boxShadow: '0 2px 16px rgba(0,0,0,0.6)',
        gap: 8,
      }}>
        {/* 타이틀 */}
        <div style={{
          fontWeight: 900, fontSize: 14, color: '#C8A951',
          letterSpacing: 1.8, display: 'flex', alignItems: 'center', gap: 7,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>🇰🇷</span>
          <span style={{ fontFamily: 'Noto Serif KR,serif' }}>윷놀이 전국일주</span>
        </div>

        {/* 현재 플레이어 배지 + 버튼들 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {currentPlayer && (
            <div style={{
              padding: '4px 11px', borderRadius: 10,
              background: `${currentPlayer.color}1C`,
              border: `1.5px solid ${currentPlayer.color}50`,
              fontSize: 11, color: currentPlayer.color, fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: 5,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>{currentPlayer.emoji}</span>
              <span>{currentPlayer.name}의 차례</span>
            </div>
          )}
          {[
            { icon: '📖', title: '규칙', onClick: () => setShowRules(r => !r), active: showRules },
            { icon: '📋', title: '로그', onClick: () => setShowLog(l => !l),   active: showLog  },
          ].map(btn => (
            <button key={btn.title} onClick={btn.onClick} title={btn.title} style={{
              background: btn.active ? 'rgba(200,169,81,0.25)' : 'rgba(200,169,81,0.1)',
              border: `1px solid rgba(200,169,81,${btn.active ? 0.5 : 0.3})`,
              borderRadius: 7, color: '#C8A951', padding: '4px 9px',
              fontSize: 12, cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.2s',
            }}>{btn.icon}</button>
          ))}
          <button onClick={() => game.setGamePhase('setup')} title="처음으로" style={{
            background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.35)',
            borderRadius: 7, color: '#E63946', padding: '4px 9px',
            fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
          }}>🔄</button>
        </div>
      </div>

      {/* ════════════ BODY ════════════ */}
      <div style={{
        flex: 1, maxWidth: 1020, width: '100%', margin: '0 auto',
        padding: '8px 10px 24px',
        display: 'flex', flexDirection: 'column', gap: 7,
        boxSizing: 'border-box',
      }}>

        {/* 상태 메시지 배너 */}
        <div style={{
          background: msgBgColor,
          border: `1px solid ${msgBorderColor}`,
          borderRadius: 10, padding: '8px 16px',
          fontSize: 13, fontWeight: 600, color: '#F5E6C8',
          textAlign: 'center', minHeight: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.4s ease',
          boxShadow: currentPlayer ? `inset 0 0 20px ${currentPlayer.color}08` : 'none',
        }}>
          {currentPlayer && <span style={{ fontSize: 18 }}>{currentPlayer.emoji}</span>}
          <span>{game.message}</span>
          {game.extraThrowPending && !game.selectingPiece && (
            <span style={{
              fontSize: 11, background: 'rgba(255,215,0,0.2)',
              border: '1px solid rgba(255,215,0,0.4)',
              color: '#FFD700', padding: '1px 8px', borderRadius: 8, fontWeight: 800,
              animation: 'pulse 1s ease-in-out infinite',
            }}>⭐ 한번더!</span>
          )}
        </div>

        {/* 규칙 패널 */}
        {showRules && (
          <div style={{
            background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '13px 16px',
            border: '1px solid rgba(200,169,81,0.2)', animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              fontSize: 11, color: '#C8A951', fontWeight: 700,
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📖 윷놀이 전국일주 규칙
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 5,
              marginBottom: 10,
            }}>
              {Object.values(YUT_RESULTS).map(r => (
                <div key={r.name} style={{
                  display: 'flex', gap: 7, alignItems: 'center',
                  padding: '5px 9px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${r.color}22`,
                }}>
                  <span style={{ fontSize: 16 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.name}</div>
                    <div style={{ fontSize: 9.5, color: 'rgba(200,169,81,0.45)' }}>{r.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              fontSize: 10.5, color: '#7A5C30', lineHeight: 1.9,
              background: 'rgba(200,169,81,0.05)', borderRadius: 8,
              padding: '7px 11px', border: '1px solid rgba(200,169,81,0.1)',
            }}>
              🗺️ <strong style={{color:'#C8A951'}}>코너 도착 시</strong> 지름길 선택 가능 (안동 → 중앙, 강릉 → 중앙, 서울 → 중앙)
              &nbsp;·&nbsp; 🎯 <strong style={{color:'#C8A951'}}>잡기 성공</strong> 시 한 번 더
              &nbsp;·&nbsp; 🤝 <strong style={{color:'#C8A951'}}>같은 칸 = 업기</strong>
              &nbsp;·&nbsp; 🏆 <strong style={{color:'#C8A951'}}>말 4개 완주</strong> → 승리
            </div>
          </div>
        )}

        {/* ════════ 메인 레이아웃 ════════ */}
        <div style={{
          display: 'flex', gap: 10,
          flexWrap: 'wrap', alignItems: 'flex-start',
        }}>

          {/* ── 좌: 보드 + 말 선택 ── */}
          <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* 게임 보드 */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              borderRadius: 18, padding: '6px 6px 4px',
              border: '1px solid rgba(200,169,81,0.16)',
              boxShadow: '0 6px 28px rgba(0,0,0,0.4)',
            }}>
              <GameBoard
                players={game.players}
                currentPlayerIdx={game.currentPlayerIdx}
                selectingPiece={game.selectingPiece}
                pendingSteps={game.pendingSteps}
                lastMovedPos={lastMovedPos}
                onNodeClick={(nodeId, spot) => {
                  if (game.selectingPiece && game.pendingSteps) {
                    if (nodeId === -1 || nodeId === 0) {
                      const waitingPiece = currentPlayer?.pieces.find(
                        pc => !pc.finished && pc.pos === -1
                      );
                      if (waitingPiece) handlePieceClick(waitingPiece.id);
                    }
                  } else if (spot && spot.id !== 0) {
                    game.showSpotInfo(spot.id);
                  }
                }}
              />
            </div>

            {/* ── 말 선택 패널 ── */}
            {game.selectingPiece && currentPlayer && game.pendingSteps && (
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 15, padding: '13px 15px',
                border: `2px solid ${currentPlayer.color}`,
                animation: 'fadeIn 0.25s ease',
                boxShadow: `0 4px 22px ${currentPlayer.color}22`,
              }}>
                {/* 헤더 */}
                <div style={{
                  fontSize: 12, color: '#C8A951', marginBottom: 12,
                  textAlign: 'center', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 18 }}>{game.pendingSteps.emoji}</span>
                  <strong style={{ color: game.pendingSteps.color || '#C8A951', fontSize: 14 }}>
                    {game.pendingSteps.name}
                  </strong>
                  <span style={{ color: 'rgba(200,169,81,0.7)' }}>
                    ({game.pendingSteps.steps > 0 ? `+${game.pendingSteps.steps}` : game.pendingSteps.steps}칸)
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>이동할 말 선택</span>
                </div>

                {/* 말 버튼들 */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {moveablePieces.length === 0 ? (
                    <div style={{
                      fontSize: 12, color: '#6A5030', textAlign: 'center',
                      padding: '10px 0', width: '100%',
                    }}>
                      이동 가능한 말이 없습니다.
                    </div>
                  ) : (
                    moveablePieces.map((piece) => {
                      const atCorner = SHORTCUT_ENTRY.has(piece.pos) && game.pendingSteps.steps > 0;
                      const pieceNum = currentPlayer.pieces.indexOf(piece) + 1;
                      return (
                        <div key={piece.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          {atCorner ? (
                            <>
                              <div style={{
                                fontSize: 9, color: 'rgba(200,169,81,0.6)',
                                textAlign: 'center', marginBottom: 2,
                              }}>말{pieceNum} (코너)</div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handlePieceClick(piece.id, true)} style={{
                                  padding: '8px 12px', borderRadius: 9,
                                  background: 'linear-gradient(135deg,#C8A951,#E8C96A)',
                                  border: 'none', color: '#1A0800',
                                  fontSize: 10, fontWeight: 900, cursor: 'pointer',
                                  boxShadow: '0 3px 12px rgba(200,169,81,0.45)',
                                  transition: 'all 0.15s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                                >
                                  ↗ 지름길
                                </button>
                                <button onClick={() => handlePieceClick(piece.id, false)} style={{
                                  padding: '8px 12px', borderRadius: 9,
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  color: '#bbb', fontSize: 10, cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                                >
                                  → 외곽
                                </button>
                              </div>
                            </>
                          ) : (
                            <button onClick={() => handlePieceClick(piece.id)} style={{
                              width: 62, height: 62, borderRadius: '50%',
                              background: `linear-gradient(135deg,${currentPlayer.color},${currentPlayer.color}CC)`,
                              border: '3px solid rgba(255,255,255,0.75)',
                              color: '#fff', cursor: 'pointer',
                              boxShadow: `0 5px 18px ${currentPlayer.color}55`,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center', gap: 2,
                              transition: 'all 0.15s',
                            }}
                              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <span style={{ fontSize: 22 }}>{currentPlayer.emoji}</span>
                              <span style={{ fontSize: 8.5, fontWeight: 800 }}>
                                말{pieceNum}
                                <br/>
                                {piece.pos === -1 ? '(대기)' : `(${piece.pos}번)`}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 복수 결과 선택 */}
                {game.throwResults.length > 1 && (
                  <div style={{ marginTop: 11, textAlign: 'center' }}>
                    <div style={{
                      fontSize: 10, color: 'rgba(200,169,81,0.5)', marginBottom: 6,
                    }}>대기 중인 다른 결과:</div>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {game.throwResults.map((r, idx) => (
                        <button key={idx} onClick={() => game.chooseThrow(idx)} style={{
                          padding: '4px 12px', borderRadius: 12,
                          background: game.pendingSteps === r
                            ? `${r.color || '#C8A951'}33`
                            : 'rgba(255,255,255,0.07)',
                          border: `1.5px solid ${r.color || '#C8A951'}`,
                          color: '#FFF8DC', fontSize: 10, fontWeight: 800, cursor: 'pointer',
                          transition: 'all 0.15s',
                          transform: game.pendingSteps === r ? 'scale(1.05)' : 'scale(1)',
                        }}>
                          {r.emoji} {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 턴 건너뛰기 */}
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <button onClick={game.endTurnManually} style={{
                    padding: '5px 18px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 14, color: 'rgba(255,255,255,0.3)',
                    fontSize: 10, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}
                  >
                    턴 건너뛰기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 우: 윷 던지기 + 플레이어 현황 + 명소 ── */}
          <div style={{ flex: '0 0 224px', display: 'flex', flexDirection: 'column', gap: 9 }}>

            {/* 윷 던지기 */}
            <YutThrow
              onThrow={handleThrow}
              disabled={!canThrow || throwing}
              lastThrow={game.lastThrow}
              throwing={throwing}
              extraPending={game.extraThrowPending}
            />

            {/* 플레이어 현황 */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              borderRadius: 14, padding: '9px 11px',
              border: '1px solid rgba(200,169,81,0.16)',
            }}>
              <div style={{
                fontSize: 10, color: '#C8A951', marginBottom: 8,
                textAlign: 'center', letterSpacing: 0.8, fontWeight: 700,
              }}>── 플레이어 현황 ──</div>
              <PlayerPanel
                players={game.players}
                currentPlayerIdx={game.currentPlayerIdx}
                throwResults={game.throwResults}
                pendingSteps={game.pendingSteps}
                onChooseThrow={game.chooseThrow}
                selectingPiece={game.selectingPiece}
                PIECES_PER_PLAYER={game.PIECES_PER_PLAYER}
              />
            </div>

            {/* 명소 목록 */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              borderRadius: 14, padding: '9px 11px',
              border: '1px solid rgba(200,169,81,0.1)',
            }}>
              <div style={{
                color: '#C8A951', fontWeight: 700, marginBottom: 7, fontSize: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                🗺️ 명소 안내
                <span style={{ fontSize: 9, color: 'rgba(200,169,81,0.4)', marginLeft: 'auto' }}>클릭하여 보기</span>
              </div>
              <div style={{ maxHeight: 155, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {SPOTS.filter(s => s.id !== 0).map(s => (
                  <button key={s.id}
                    onClick={() => game.showSpotInfo(s.id)}
                    style={{
                      display: 'flex', gap: 6, alignItems: 'center',
                      width: '100%', background: 'transparent', border: 'none',
                      cursor: 'pointer', padding: '3.5px 5px', borderRadius: 7,
                      transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 12, flexShrink: 0 }}>{s.emoji}</span>
                    <span style={{
                      fontSize: 10, color: s.region?.color || '#C8A951', fontWeight: 600,
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{s.name}</span>
                    {s.subgame && (
                      <span style={{ fontSize: 9, color: 'rgba(200,169,81,0.45)', flexShrink: 0 }}>🎮</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 게임 로그 ── */}
        {showLog && (
          <div style={{
            background: 'rgba(0,0,0,0.55)', borderRadius: 13, padding: '10px 14px',
            border: '1px solid rgba(200,169,81,0.16)', animation: 'fadeIn 0.3s ease',
            maxHeight: 180, overflowY: 'auto', scrollbarWidth: 'thin',
          }}>
            <div style={{
              fontSize: 10, color: '#C8A951', marginBottom: 7, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
              position: 'sticky', top: 0,
              background: 'rgba(0,0,0,0.3)', padding: '2px 0',
            }}>
              📋 게임 로그
              <span style={{ fontSize: 9, color: 'rgba(200,169,81,0.4)', marginLeft: 'auto' }}>
                {game.log.length}개 기록
              </span>
            </div>
            {game.log.length === 0 ? (
              <div style={{ fontSize: 11, color: 'rgba(200,169,81,0.3)', padding: '4px 0' }}>
                아직 기록이 없습니다.
              </div>
            ) : (
              game.log.map((e, i) => (
                <div key={e.time} style={{
                  fontSize: 11, lineHeight: 1.65,
                  color: `rgba(245,222,179,${Math.max(0.2, 0.9 - i * 0.05)})`,
                  padding: '2px 0',
                  borderBottom: i < game.log.length - 1
                    ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  {e.msg}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── 모달: 관광지 정보 ── */}
      {game.gamePhase === 'spotInfo' && game.visitedSpot && (
        <SpotInfo
          spot={game.visitedSpot}
          onClose={game.dismissSpotInfo}
          onSubgame={(subgame) => setActiveSubgame(subgame)}
        />
      )}

      {/* ── 모달: 미니게임 ── */}
      {activeSubgame && (
        <SubGame
          subgame={activeSubgame}
          onClose={() => {
            setActiveSubgame(null);
            if (game.gamePhase === 'spotInfo') game.dismissSpotInfo();
          }}
        />
      )}
    </div>
  );
}
