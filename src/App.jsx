import React, { useState } from 'react';
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

  /* ── 셋업 ── */
  if (game.gamePhase === 'setup') {
    return <SetupScreen onStart={game.startGame} />;
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

  const currentPlayer  = game.players[game.currentPlayerIdx];
  const isAITurn       = !!currentPlayer?.isAI;
  const SHORTCUT_CORNERS = SHORTCUT_ENTRY;

  /* 던지기 가능 조건 — AI 턴에는 인간이 조작 불가 */
  const canThrow =
    !isAITurn &&
    !throwing &&
    !game.selectingPiece &&
    (game.throwResults.length === 0 || game.extraThrowPending);

  const handleThrow = () => {
    if (!canThrow) return;
    setThrowing(true);
    setTimeout(() => {
      game.throwYut();
      setThrowing(false);
    }, 900);
  };

  const handlePieceClick = (pieceId, useShortcut = true) => {
    if (isAITurn) return;                        // AI 턴엔 인간 클릭 차단
    if (!game.selectingPiece || !game.pendingSteps) return;
    game.movePieceAction(pieceId, useShortcut);
  };

  /* 이동 가능한 말 목록 */
  const moveablePieces = (game.selectingPiece && currentPlayer && game.pendingSteps && !isAITurn)
    ? currentPlayer.pieces.filter(pc => {
        if (pc.finished) return false;
        if (game.pendingSteps.steps < 0 && pc.pos === -1) return false;
        return true;
      })
    : [];

  /* AI 플레이어 수 */
  const aiCount    = game.players.filter(p => p.isAI).length;
  const humanCount = game.players.length - aiCount;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#1a0a00 0%,#2C1810 50%,#3D1A08 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans KR','Malgun Gothic','맑은 고딕',sans-serif",
    }}>

      {/* ────────── TOP BAR ────────── */}
      <div style={{
        background: 'linear-gradient(90deg,#1E0A00,#3A1E0A,#1E0A00)',
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid rgba(200,169,81,0.4)',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          fontWeight: 900, fontSize: 15, color: '#C8A951',
          letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 7,
        }}>
          🇰🇷
          <span style={{ fontFamily: 'Noto Serif KR,serif' }}>윷놀이 전국일주</span>
          {/* AI 모드 뱃지 */}
          {aiCount > 0 && (
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 8,
              background: 'rgba(29,145,213,0.18)',
              border: '1px solid rgba(29,145,213,0.45)',
              color: '#1D91D5', fontWeight: 800, letterSpacing: 0,
            }}>
              🤖 AI {aiCount}명
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {currentPlayer && (
            <div style={{
              padding: '3px 10px', borderRadius: 10,
              background: isAITurn
                ? 'rgba(29,145,213,0.15)'
                : `${currentPlayer.color}1E`,
              border: `1px solid ${isAITurn ? 'rgba(29,145,213,0.5)' : currentPlayer.color + '55'}`,
              fontSize: 11,
              color: isAITurn ? '#1D91D5' : currentPlayer.color,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {isAITurn && game.aiThinking && (
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
              )}
              {currentPlayer.emoji} {currentPlayer.name}의 차례
              {isAITurn && <span style={{ opacity: 0.7 }}>(AI)</span>}
            </div>
          )}
          <button onClick={() => setShowRules(r => !r)} style={{
            background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.35)',
            borderRadius: 7, color: '#C8A951', padding: '3px 8px',
            fontSize: 11, cursor: 'pointer', fontWeight: 700,
          }} title="규칙 보기">📖</button>
          <button onClick={() => setShowLog(l => !l)} style={{
            background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.35)',
            borderRadius: 7, color: '#C8A951', padding: '3px 8px',
            fontSize: 11, cursor: 'pointer',
          }} title="게임 로그">📋</button>
          <button onClick={() => game.setGamePhase('setup')} style={{
            background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.4)',
            borderRadius: 7, color: '#E63946', padding: '3px 8px',
            fontSize: 11, cursor: 'pointer',
          }} title="처음으로">🔄</button>
        </div>
      </div>

      {/* ────────── BODY ────────── */}
      <div style={{
        flex: 1, maxWidth: 1000, width: '100%', margin: '0 auto',
        padding: '10px 10px 28px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>

        {/* ── AI 사고 중 배너 ── */}
        {isAITurn && (
          <div style={{
            background: 'linear-gradient(135deg,rgba(29,145,213,0.15),rgba(29,145,213,0.06))',
            border: '1.5px solid rgba(29,145,213,0.4)',
            borderRadius: 11, padding: '9px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeIn 0.3s ease',
          }}>
            {/* 점 세 개 로딩 애니메이션 */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#1D91D5',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#5BB8E8', fontWeight: 700 }}>
              {currentPlayer?.emoji} {currentPlayer?.name}이(가) 전략을 세우는 중...
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(91,184,232,0.5)' }}>
              AI 자동 진행
            </div>
          </div>
        )}

        {/* 상태 메시지 배너 */}
        <div style={{
          background: isAITurn
            ? 'rgba(29,145,213,0.07)'
            : (currentPlayer
              ? `linear-gradient(135deg,${currentPlayer.color}1A,${currentPlayer.color}08)`
              : 'rgba(200,169,81,0.08)'),
          border: `1px solid ${isAITurn
            ? 'rgba(29,145,213,0.3)'
            : (currentPlayer ? currentPlayer.color + '44' : 'rgba(200,169,81,0.25)')}`,
          borderRadius: 10, padding: '8px 15px',
          fontSize: 13, fontWeight: 600, color: '#F5E6C8',
          textAlign: 'center', minHeight: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          {currentPlayer && <span style={{ fontSize: 17 }}>{currentPlayer.emoji}</span>}
          <span>{game.message}</span>
        </div>

        {/* 규칙 패널 */}
        {showRules && (
          <div style={{
            background: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: '12px 16px',
            border: '1px solid rgba(200,169,81,0.25)', animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: 11, color: '#C8A951', fontWeight: 700, marginBottom: 8 }}>
              📖 윷놀이 전국일주 규칙
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 5,
            }}>
              {Object.values(YUT_RESULTS).map(r => (
                <div key={r.name} style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  padding: '4px 8px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(200,169,81,0.1)',
                }}>
                  <span style={{ fontSize: 15 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.name}</div>
                    <div style={{ fontSize: 9.5, color: '#6A5030' }}>{r.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10.5, color: '#7A5C30', lineHeight: 1.8 }}>
              🗺️ 코너(안동·강릉·서울)에서 지름길 선택 가능 · 🎯 잡기 성공 시 한 번 더 · 🤝 같은 칸 = 업기 · 🏆 말 4개 완주 시 승리
              {aiCount > 0 && <> · 🤖 AI 플레이어는 자동으로 최적의 말을 선택합니다</>}
            </div>
          </div>
        )}

        {/* 메인 레이아웃: 보드 + 사이드 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ── 좌측: 게임 보드 ── */}
          <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 8,
              border: `1px solid ${isAITurn ? 'rgba(29,145,213,0.25)' : 'rgba(200,169,81,0.18)'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'border-color 0.4s',
              /* AI 턴엔 보드를 살짝 어둡게 오버레이 */
              position: 'relative',
            }}>
              {/* AI 턴 오버레이 (클릭 차단 + 시각적 표시) */}
              {isAITurn && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 5,
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.08)',
                  pointerEvents: 'all',
                  cursor: 'not-allowed',
                }} />
              )}
              <GameBoard
                players={game.players}
                currentPlayerIdx={game.currentPlayerIdx}
                selectingPiece={game.selectingPiece && !isAITurn}
                pendingSteps={game.pendingSteps}
                onNodeClick={(nodeId, spot) => {
                  if (isAITurn) return;
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

            {/* ── 말 선택 패널 (인간 턴에만 표시) ── */}
            {game.selectingPiece && currentPlayer && game.pendingSteps && !isAITurn && (
              <div style={{
                background: 'rgba(0,0,0,0.55)', borderRadius: 14, padding: '12px 14px',
                border: `2px solid ${currentPlayer.color}`,
                animation: 'fadeIn 0.3s ease',
                boxShadow: `0 4px 18px ${currentPlayer.color}22`,
              }}>
                <div style={{
                  fontSize: 12, color: '#C8A951', marginBottom: 10,
                  textAlign: 'center', letterSpacing: 0.5, fontWeight: 700,
                }}>
                  <span style={{ fontSize: 16 }}>{game.pendingSteps.emoji}</span>{' '}
                  <strong style={{ color: game.pendingSteps.color || '#C8A951' }}>
                    {game.pendingSteps.name}
                  </strong>
                  {' '}({game.pendingSteps.steps > 0 ? `+${game.pendingSteps.steps}` : game.pendingSteps.steps}칸)
                  {' '}— 이동할 말을 선택하세요
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {moveablePieces.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#7A5C30', textAlign: 'center', padding: '8px 0' }}>
                      이동 가능한 말이 없습니다.
                    </div>
                  ) : (
                    moveablePieces.map((piece) => {
                      const atCorner = SHORTCUT_CORNERS.has(piece.pos) && game.pendingSteps.steps > 0;
                      const pieceNum = currentPlayer.pieces.indexOf(piece) + 1;
                      return (
                        <div key={piece.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          {atCorner ? (
                            <>
                              <div style={{ fontSize: 10, color: '#C8A951', textAlign: 'center' }}>말{pieceNum}</div>
                              <div style={{ display: 'flex', gap: 5 }}>
                                <button onClick={() => handlePieceClick(piece.id, true)} style={{
                                  padding: '7px 11px', borderRadius: 8,
                                  background: 'linear-gradient(135deg,#C8A951,#E8C96A)',
                                  border: 'none', color: '#2C1810',
                                  fontSize: 10, fontWeight: 900, cursor: 'pointer',
                                  boxShadow: '0 2px 10px rgba(200,169,81,0.5)',
                                }}>↗ 지름길</button>
                                <button onClick={() => handlePieceClick(piece.id, false)} style={{
                                  padding: '7px 11px', borderRadius: 8,
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid #777', color: '#ccc',
                                  fontSize: 10, cursor: 'pointer',
                                }}>→ 외곽</button>
                              </div>
                            </>
                          ) : (
                            <button onClick={() => handlePieceClick(piece.id)} style={{
                              width: 58, height: 58, borderRadius: '50%',
                              background: `linear-gradient(135deg,${currentPlayer.color},${currentPlayer.color}CC)`,
                              border: '3px solid rgba(255,255,255,0.7)',
                              color: '#fff', cursor: 'pointer',
                              boxShadow: `0 4px 16px ${currentPlayer.color}55`,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center', gap: 2,
                              transition: 'transform 0.15s',
                            }}
                              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <span style={{ fontSize: 20 }}>{currentPlayer.emoji}</span>
                              <span style={{ fontSize: 9, fontWeight: 700 }}>
                                말{pieceNum}
                                {piece.pos === -1 ? '(대기)' : `(${piece.pos})`}
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
                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9A7A50', marginBottom: 5 }}>다른 결과 선택:</div>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {game.throwResults.map((r, idx) => (
                        <button key={idx} onClick={() => game.chooseThrow(idx)} style={{
                          padding: '4px 11px', borderRadius: 12,
                          background: game.pendingSteps === r
                            ? `${r.color || '#C8A951'}AA`
                            : 'rgba(255,255,255,0.08)',
                          border: `1.5px solid ${r.color || '#C8A951'}`,
                          color: '#FFF8DC', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        }}>{r.emoji} {r.name}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: 9 }}>
                  <button onClick={game.endTurnManually} style={{
                    padding: '5px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 14, color: 'rgba(255,255,255,0.4)',
                    fontSize: 10, cursor: 'pointer',
                  }}>턴 건너뛰기</button>
                </div>
              </div>
            )}

            {/* ── AI 말 선택 중 표시 ── */}
            {game.selectingPiece && isAITurn && currentPlayer && (
              <div style={{
                background: 'rgba(29,145,213,0.08)', borderRadius: 14, padding: '14px',
                border: '1.5px solid rgba(29,145,213,0.3)',
                animation: 'fadeIn 0.3s ease',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#1D91D5',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#5BB8E8', fontWeight: 700 }}>
                  {currentPlayer.emoji} {currentPlayer.name} — 최적의 말 선택 중...
                  {game.pendingSteps && (
                    <span style={{ color: 'rgba(91,184,232,0.6)', marginLeft: 8 }}>
                      ({game.pendingSteps.emoji} {game.pendingSteps.name})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── 우측 패널 ── */}
          <div style={{ flex: '0 0 222px', display: 'flex', flexDirection: 'column', gap: 9 }}>

            {/* 윷 던지기 — AI 턴엔 잠금 표시 */}
            <div style={{ position: 'relative' }}>
              <YutThrow
                onThrow={handleThrow}
                disabled={!canThrow || throwing}
                lastThrow={game.lastThrow}
                throwing={throwing}
                extraPending={game.extraThrowPending}
              />
              {/* AI 턴 잠금 오버레이 */}
              {isAITurn && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 14,
                  background: 'rgba(0,0,0,0.45)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                }}>
                  <div style={{ fontSize: 30 }}>🤖</div>
                  <div style={{ fontSize: 12, color: '#5BB8E8', fontWeight: 700 }}>
                    AI 자동 진행 중
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#1D91D5',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 플레이어 현황 */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 13, padding: '9px 11px',
              border: '1px solid rgba(200,169,81,0.18)',
            }}>
              <div style={{
                fontSize: 10, color: '#C8A951', marginBottom: 7,
                textAlign: 'center', letterSpacing: 1, fontWeight: 700,
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
              background: 'rgba(255,255,255,0.03)', borderRadius: 13, padding: '9px 11px',
              border: '1px solid rgba(200,169,81,0.1)',
            }}>
              <div style={{ color: '#C8A951', fontWeight: 700, marginBottom: 6, fontSize: 10 }}>
                🗺️ 명소 안내 (클릭하여 보기)
              </div>
              <div style={{ maxHeight: 148, overflowY: 'auto' }}>
                {SPOTS.filter(s => s.id !== 0).map(s => (
                  <button key={s.id}
                    onClick={() => game.showSpotInfo(s.id)}
                    style={{
                      display: 'flex', gap: 5, alignItems: 'center',
                      width: '100%', background: 'transparent', border: 'none',
                      cursor: 'pointer', padding: '3px 4px', borderRadius: 6,
                      transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 12 }}>{s.emoji}</span>
                    <span style={{ fontSize: 10, color: s.region?.color || '#C8A951', fontWeight: 600 }}>
                      {s.name}
                    </span>
                    {s.subgame && (
                      <span style={{ fontSize: 8.5, color: 'rgba(200,169,81,0.5)', marginLeft: 'auto' }}>
                        🎮
                      </span>
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
            background: 'rgba(0,0,0,0.5)', borderRadius: 13, padding: '10px 13px',
            border: '1px solid rgba(200,169,81,0.18)', animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: 10, color: '#C8A951', marginBottom: 6, fontWeight: 700 }}>
              📋 게임 로그
            </div>
            {game.log.length === 0 ? (
              <div style={{ fontSize: 11, color: '#555' }}>아직 기록이 없습니다.</div>
            ) : (
              game.log.map((e, i) => (
                <div key={e.time} style={{
                  fontSize: 11,
                  color: `rgba(255,255,255,${Math.max(0.28, 0.85 - i * 0.045)})`,
                  padding: '2.5px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
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

      {/* ── bounce 키프레임 (AI 로딩 점) ── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
