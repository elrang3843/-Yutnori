import React from 'react';

export default function PlayerPanel({
  players = [],
  currentPlayerIdx = 0,
  throwResults = [],
  pendingSteps = null,
  selectingPiece = false,
  onChooseThrow,
  PIECES_PER_PLAYER = 4,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>

      {/* 사용 가능한 윷 결과 큐 */}
      {throwResults.length > 0 && (
        <div style={{
          padding: '8px 10px',
          background: 'rgba(200,169,81,0.07)',
          borderRadius: 11, border: '1px solid rgba(200,169,81,0.18)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            fontSize: 9, color: 'rgba(200,169,81,0.5)',
            marginBottom: 5, textAlign: 'center', letterSpacing: 0.8, fontWeight: 700,
          }}>
            📋 사용 가능한 결과 ({throwResults.length}개)
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {throwResults.map((r, i) => {
              const isActive = pendingSteps === r;
              return (
                <button key={i}
                  onClick={() => onChooseThrow?.(i)}
                  style={{
                    padding: '5px 10px', borderRadius: 9,
                    background: isActive
                      ? `${r.color || '#C8A951'}28`
                      : 'rgba(255,255,255,0.05)',
                    border: isActive
                      ? `2px solid ${r.color || '#C8A951'}`
                      : `1px solid rgba(200,169,81,0.15)`,
                    color: '#F5DEB3', fontSize: 10.5, fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', gap: 4, alignItems: 'center',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? `0 2px 8px ${r.color || '#C8A951'}33` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(200,169,81,0.1)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <span style={{ fontSize: 13 }}>{r.emoji}</span>
                  <span style={{ color: r.color || '#C8A951' }}>{r.name}</span>
                  <span style={{ fontSize: 9, color: 'rgba(200,169,81,0.45)' }}>
                    {r.steps > 0 ? `+${r.steps}` : r.steps}칸
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 플레이어 카드들 */}
      {players.map((player, pi) => {
        const color    = player.color || '#C8A951';
        const isActive = pi === currentPlayerIdx;
        const finPct   = (player.finishedCount / PIECES_PER_PLAYER) * 100;
        const onBoardCount = player.pieces.filter(p => !p.finished && p.pos >= 0).length;

        return (
          <div key={player.id} style={{
            border: isActive ? `2px solid ${color}` : '1.5px solid rgba(255,255,255,0.07)',
            borderRadius: 13, padding: '9px 11px',
            background: isActive
              ? `linear-gradient(135deg,${color}18,${color}06)`
              : 'rgba(255,255,255,0.025)',
            transition: 'all 0.3s',
            boxShadow: isActive ? `0 4px 18px ${color}22` : 'none',
          }}>
            {/* 플레이어 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              {/* 아바타 */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${color}28`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
                boxShadow: isActive ? `0 0 10px ${color}55` : 'none',
                transition: 'box-shadow 0.3s',
              }}>
                {player.emoji}
              </div>
              {/* 이름 + 배지 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11.5, fontWeight: 800, color: isActive ? '#F5DEB3' : 'rgba(245,222,179,0.65)',
                  display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4,
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 85 }}>
                    {player.name}
                  </span>
                  {isActive && (
                    <span style={{
                      fontSize: 7.5, background: color, color: '#fff',
                      borderRadius: 4, padding: '1.5px 5px', flexShrink: 0,
                      fontWeight: 900, letterSpacing: 0.5,
                    }}>▶ 차례</span>
                  )}
                </div>
                {/* 진행도 바 */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${finPct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                    borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                  }}/>
                </div>
              </div>
              {/* 완주 수 */}
              <div style={{
                fontSize: 11, color: color, fontWeight: 900,
                textAlign: 'right', flexShrink: 0,
              }}>
                {player.finishedCount}/{PIECES_PER_PLAYER}
              </div>
            </div>

            {/* 말 상태 그리드 */}
            <div style={{ display: 'flex', gap: 4 }}>
              {player.pieces.map((piece, pIdx) => {
                const isFinished = piece.finished;
                const isWaiting  = piece.pos === -1;
                const isOnBoard  = !isFinished && !isWaiting;
                const posLabel = isFinished ? '완주' : isWaiting ? '대기' : `${piece.pos}`;

                return (
                  <div key={piece.id}
                    title={isFinished ? '완주!' : isWaiting ? '출발 대기' : `${piece.pos}번 칸`}
                    style={{
                      flex: 1, height: 36, borderRadius: 8,
                      background: isFinished
                        ? `linear-gradient(135deg, ${color}50, ${color}28)`
                        : isWaiting
                          ? 'rgba(255,255,255,0.04)'
                          : `${color}18`,
                      border: isFinished
                        ? `2px solid ${color}`
                        : isOnBoard
                          ? `1.5px solid ${color}55`
                          : `1px solid rgba(255,255,255,0.08)`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 0, transition: 'all 0.25s',
                    }}>
                    <span style={{ fontSize: isFinished ? 13 : 11, lineHeight: 1 }}>
                      {isFinished ? '✅' : isWaiting ? '⏳' : player.emoji}
                    </span>
                    <span style={{
                      fontSize: 6.5, fontWeight: 700, marginTop: 1,
                      color: isFinished ? color : isOnBoard ? `${color}99` : 'rgba(245,222,179,0.2)',
                    }}>
                      {posLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 보드 위 말 수 + 잡기 통계 */}
            {(onBoardCount > 0 || player.captures > 0 || player.totalMoves > 0) && (
              <div style={{
                display: 'flex', gap: 6, marginTop: 6,
                fontSize: 8.5, color: 'rgba(200,169,81,0.35)',
              }}>
                {onBoardCount > 0 && (
                  <span>🐎 보드 위 {onBoardCount}개</span>
                )}
                {player.captures > 0 && (
                  <span>💥 잡기 {player.captures}회</span>
                )}
                {player.totalMoves > 0 && (
                  <span style={{ marginLeft: 'auto' }}>총 {player.totalMoves}회 이동</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
