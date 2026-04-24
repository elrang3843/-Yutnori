import React, { useMemo, useState, useEffect } from 'react';
import { BOARD_NODES, SPOTS, NODE_TYPE } from '../data/boardData.js';

const VB = 580;
const PAD = 46;
const INR = VB - PAD * 2;
const P = (v) => PAD + (v / 100) * INR;

const PATHS = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],
  [8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,0],
  [12,17],[17,18],[18,16],
  [8,19],[19,20],[20,16],
  [4,21],[21,22],[22,16],
  [16,23],[23,24],[24,0],
];
const DIAG_SET = new Set(['12-17','17-18','18-16','8-19','19-20','20-16','4-21','21-22','22-16','16-23','23-24','24-0']);

function getNode(id) { return BOARD_NODES.find(n => n.id === id); }

// 파티클 컴포넌트 (말 이동 시 파티클 효과)
function Particles({ cx, cy, color }) {
  const pts = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    r: 14 + Math.random() * 10,
    id: i,
  })), []);
  return (
    <>
      {pts.map(p => (
        <circle key={p.id}
          cx={cx + Math.cos(p.angle) * p.r}
          cy={cy + Math.sin(p.angle) * p.r}
          r={2.5} fill={color} opacity={0.7}
        >
          <animate attributeName="opacity" values="0.7;0" dur="0.6s" fill="freeze"/>
          <animate attributeName="r" values="2.5;0.5" dur="0.6s" fill="freeze"/>
        </circle>
      ))}
    </>
  );
}

export default function GameBoard({
  players = [],
  currentPlayerIdx = 0,
  pendingSteps = null,
  selectingPiece = false,
  onNodeClick,
  highlightedNodes = [],
  lastMovedPos = null,
}) {
  const [particles, setParticles] = useState(null);
  const [particleKey, setParticleKey] = useState(0);

  useEffect(() => {
    if (lastMovedPos !== null && lastMovedPos >= 0) {
      const node = getNode(lastMovedPos);
      if (node) {
        setParticles({ x: P(node.x), y: P(node.y) });
        setParticleKey(k => k + 1);
        const t = setTimeout(() => setParticles(null), 700);
        return () => clearTimeout(t);
      }
    }
  }, [lastMovedPos, particleKey]);

  const pieceMap = useMemo(() => {
    const map = {};
    players.forEach(player => {
      player.pieces.forEach(piece => {
        if (piece.finished || piece.pos < 0) return;
        if (!map[piece.pos]) map[piece.pos] = [];
        map[piece.pos].push({ piece, player });
      });
    });
    return map;
  }, [players]);

  const startPieces = useMemo(() => {
    const arr = [];
    players.forEach(player => {
      player.pieces.forEach(piece => {
        if (!piece.finished && piece.pos === -1) arr.push({ piece, player });
      });
    });
    return arr;
  }, [players]);

  const hlSet = new Set(highlightedNodes);
  const currentPlayer = players[currentPlayerIdx];

  return (
    <div style={{ width: '100%', aspectRatio: '1/1', maxWidth: VB, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <radialGradient id="bgG" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#FFFCF0"/>
            <stop offset="60%" stopColor="#F8EDD8"/>
            <stop offset="100%" stopColor="#EDD9A3"/>
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD70040"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <filter id="sh">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#00000030"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="textSh">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#00000050"/>
          </filter>
          {/* 지름길 특수 효과 */}
          <linearGradient id="diagLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8A951" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#C8A951" stopOpacity="0.8"/>
          </linearGradient>
        </defs>

        {/* 배경 */}
        <rect x="0" y="0" width={VB} height={VB} rx="22" fill="url(#bgG)"/>
        {/* 외곽 장식 테두리 */}
        <rect x="5" y="5" width={VB-10} height={VB-10} rx="18" fill="none"
          stroke="#C8A951" strokeWidth="1.5" strokeDasharray="12 6" opacity="0.35"/>
        <rect x="12" y="12" width={VB-24} height={VB-24} rx="14" fill="none"
          stroke="#C8A951" strokeWidth="0.7" opacity="0.15"/>

        {/* 중앙 배경 글자 */}
        <text x={VB/2} y={VB/2+5} textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fill="#C8A951" opacity="0.07" fontFamily="Noto Serif KR,serif"
          fontWeight="900" letterSpacing="12">전국일주</text>

        {/* 중앙 원형 장식 */}
        <circle cx={VB/2} cy={VB/2} r={INR*0.35} fill="none"
          stroke="#C8A951" strokeWidth="0.5" opacity="0.08"/>
        <circle cx={VB/2} cy={VB/2} r={INR*0.2} fill="none"
          stroke="#C8A951" strokeWidth="0.5" opacity="0.06"/>

        {/* ── 경로 선 ── */}
        {PATHS.map(([a,b],i) => {
          const na = getNode(a), nb = getNode(b);
          if (!na || !nb) return null;
          const isDiag = DIAG_SET.has(`${a}-${b}`);
          return (
            <line key={i}
              x1={P(na.x)} y1={P(na.y)} x2={P(nb.x)} y2={P(nb.y)}
              stroke={isDiag ? '#B8911A' : '#9B7A2A'}
              strokeWidth={isDiag ? 3 : 2.5}
              strokeDasharray={isDiag ? '7 4' : 'none'}
              strokeLinecap="round"
              opacity={isDiag ? 0.65 : 0.45}
            />
          );
        })}

        {/* 지름길 화살표 표시 */}
        {[[4,21],[8,19],[12,17]].map(([from,to]) => {
          const fn = getNode(from), tn = getNode(to);
          if (!fn || !tn) return null;
          const mx = (P(fn.x)+P(tn.x))/2, my = (P(fn.y)+P(tn.y))/2;
          const ang = Math.atan2(P(tn.y)-P(fn.y), P(tn.x)-P(fn.x))*180/Math.PI;
          return (
            <g key={`sc${from}`} transform={`translate(${mx},${my}) rotate(${ang})`} opacity="0.55">
              <polygon points="-6,-3.5 4,0 -6,3.5" fill="#C8A951"/>
            </g>
          );
        })}

        {/* 외곽 방향 화살표 */}
        {[[2,1],[6,5],[10,9],[14,13]].map(([f,t]) => {
          const fn = getNode(f), tn = getNode(t);
          if (!fn || !tn) return null;
          const mx = (P(fn.x)+P(tn.x))/2, my = (P(fn.y)+P(tn.y))/2;
          const ang = Math.atan2(P(tn.y)-P(fn.y), P(tn.x)-P(fn.x))*180/Math.PI;
          return (
            <g key={`arr${f}`} transform={`translate(${mx},${my}) rotate(${ang})`} opacity="0.45">
              <polygon points="-6,-4 5,0 -6,4" fill="#B8911A"/>
            </g>
          );
        })}

        {/* ── 노드들 ── */}
        {BOARD_NODES.map(node => {
          const spot = SPOTS.find(s => s.id === node.id);
          const cx = P(node.x), cy = P(node.y);
          const isSpecial = node.type === NODE_TYPE.CORNER || node.type === NODE_TYPE.START || node.type === NODE_TYPE.CENTER;
          const isStart  = node.type === NODE_TYPE.START;
          const isCenter = node.type === NODE_TYPE.CENTER;
          const isCorner = node.type === NODE_TYPE.CORNER;
          const isHl     = hlSet.has(node.id);
          const pieces   = pieceMap[node.id] || [];
          const isLastMoved = node.id === lastMovedPos;

          const outerR = isCenter ? 28 : isCorner || isStart ? 25 : 18;
          const innerR = isCenter ? 21 : isCorner || isStart ? 19 : 13;
          const rColor = spot?.region?.color || '#A08040';

          const fillC = isHl ? '#FFFAE0'
            : isCenter ? '#2A0800'
            : isCorner ? '#FFFAF0'
            : isStart ? '#FFFDE8'
            : '#F8F2E2';

          const strokeC = isHl ? '#FFD700'
            : isCenter ? '#FFD700'
            : isCorner ? rColor
            : isStart ? '#8B1A1A'
            : rColor;

          return (
            <g key={node.id}
              onClick={() => onNodeClick && onNodeClick(node.id, spot)}
              style={{ cursor: 'pointer' }}
            >
              {/* 하이라이트 펄스 링 */}
              {isHl && (
                <circle cx={cx} cy={cy} r={outerR + 5} fill="none" stroke="#FFD700" strokeWidth="2.5">
                  <animate attributeName="r"
                    values={`${outerR+3};${outerR+14};${outerR+3}`}
                    dur="1.1s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/>
                </circle>
              )}

              {/* 말 위치 표시 (글로우) */}
              {pieces.length > 0 && (
                <circle cx={cx} cy={cy} r={outerR + 4} fill="none"
                  stroke={pieces[0].player.color || '#C8A951'}
                  strokeWidth="2" opacity="0.3"/>
              )}

              {/* 최근 이동 표시 */}
              {isLastMoved && (
                <circle cx={cx} cy={cy} r={outerR + 8} fill="none"
                  stroke="#FFD700" strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="3"/>
                </circle>
              )}

              {/* 특별 노드 외곽 장식 */}
              {isSpecial && (
                <circle cx={cx} cy={cy} r={outerR + 5} fill="none"
                  stroke={rColor} strokeWidth="1.2" opacity="0.2"/>
              )}

              {/* 노드 본체 */}
              <circle cx={cx} cy={cy} r={outerR}
                fill={fillC} stroke={strokeC}
                strokeWidth={isSpecial ? 2.5 : 1.8}
                filter="url(#sh)"
              />

              {/* 내부 장식 링 */}
              <circle cx={cx} cy={cy} r={innerR} fill="none"
                stroke={isCenter ? '#FFD700' : rColor}
                strokeWidth={isSpecial ? 1.8 : 1.2}
                opacity={isSpecial ? 0.55 : 0.28}
              />

              {/* 코너 이중 장식 */}
              {(isCorner || isCenter) && (
                <circle cx={cx} cy={cy} r={innerR * 0.62} fill="none"
                  stroke={isCenter ? '#FFD70088' : `${rColor}66`}
                  strokeWidth="1" opacity="0.5"/>
              )}

              {/* 이모지 */}
              {spot && (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isCenter ? 15 : isCorner || isStart ? 14 : 11}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {spot.emoji}
                </text>
              )}

              {/* 출발 텍스트 */}
              {isStart && (
                <>
                  <text x={cx} y={cy + outerR + 14} textAnchor="middle"
                    fontSize="10" fill="#8B1A1A" fontWeight="800"
                    fontFamily="Noto Sans KR,sans-serif"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}>
                    출발
                  </text>
                  <text x={cx} y={cy + outerR + 24} textAnchor="middle"
                    fontSize="8" fill="#C8A951" fontWeight="600"
                    fontFamily="Noto Sans KR,sans-serif"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}>
                    🏯경복궁
                  </text>
                </>
              )}

              {/* 명소 이름 라벨 */}
              {spot && !isStart && (() => {
                let lx = cx, ly = cy, anchor = 'middle', baseline = 'auto';
                const off = outerR + 12;
                if (node.y >= 78)      { ly = cy + off; }
                else if (node.y <= 22) { ly = cy - off + 3; }
                else if (node.x <= 22) { lx = cx - off; anchor = 'end'; ly = cy; baseline = 'middle'; }
                else if (node.x >= 78) { lx = cx + off; anchor = 'start'; ly = cy; baseline = 'middle'; }
                else if (node.y < 50)  { ly = cy - off + 3; }
                else                   { ly = cy + off; }

                const displayName = spot.name.length > 4 ? spot.name.slice(0, 4) : spot.name;
                return (
                  <text x={lx} y={ly}
                    textAnchor={anchor} dominantBaseline={baseline}
                    fontSize={isCenter ? 10 : 8.5}
                    fill={isCenter ? '#FFD700' : '#3A2208'}
                    fontWeight={isCenter ? '800' : '700'}
                    fontFamily="Noto Sans KR,sans-serif"
                    filter="url(#textSh)"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}>
                    {displayName}
                  </text>
                );
              })()}

              {/* 코너 지름길 표시 */}
              {isCorner && (
                <text x={cx} y={cy + outerR + 13} textAnchor="middle"
                  fontSize="7.5" fill={rColor} fontWeight="700" opacity="0.75"
                  fontFamily="Noto Sans KR,sans-serif"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  ↗지름길
                </text>
              )}

              {/* ── 말 렌더링 ── */}
              {pieces.length > 0 && (() => {
                const total = pieces.length;
                return (
                  <g>
                    {pieces.map(({ piece, player }, i) => {
                      const angle = total > 1 ? (i / total) * 2 * Math.PI - Math.PI / 2 : 0;
                      const pr = total > 1 ? innerR * 0.52 : 0;
                      const px = cx + pr * Math.cos(angle);
                      const py = cy + pr * Math.sin(angle);
                      const pr2 = total > 1 ? 8 : 12;
                      const isCurrentPlayer = player.id === currentPlayerIdx;
                      return (
                        <g key={piece.id}>
                          {/* 그림자 */}
                          <circle cx={px+1} cy={py+2} r={pr2} fill="rgba(0,0,0,0.35)"/>
                          {/* 본체 */}
                          <circle cx={px} cy={py} r={pr2}
                            fill={player.color || '#C8A951'}
                            stroke={isCurrentPlayer ? '#FFD700' : '#FFFFFF'}
                            strokeWidth={isCurrentPlayer ? 2.5 : 1.5}
                            filter={isCurrentPlayer ? 'url(#glow)' : 'url(#sh)'}
                          />
                          {/* 이모지 */}
                          <text x={px} y={py} textAnchor="middle" dominantBaseline="middle"
                            fontSize={total > 1 ? 9 : 13}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}>
                            {player.emoji}
                          </text>
                        </g>
                      );
                    })}
                    {/* 겹친 말 숫자 */}
                    {total > 1 && (
                      <>
                        <circle cx={cx} cy={cy} r={9} fill="#111" opacity="0.85"/>
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                          fontSize="9.5" fill="#FFD700" fontWeight="900"
                          style={{ userSelect: 'none', pointerEvents: 'none' }}>
                          {total}
                        </text>
                      </>
                    )}
                  </g>
                );
              })()}
            </g>
          );
        })}

        {/* ── 출발 대기 말 ── */}
        {startPieces.length > 0 && (() => {
          const sn = getNode(0);
          if (!sn) return null;
          const sx = P(sn.x), sy = P(sn.y);
          const offsets = [[-26, -36], [0, -36], [26, -36], [-13, -50]];
          return startPieces.slice(0, 4).map(({ piece, player }, idx) => {
            const [ox, oy] = offsets[idx] || [0, -36];
            const isMovable = selectingPiece && player.id === currentPlayerIdx;
            return (
              <g key={piece.id}
                onClick={e => { e.stopPropagation(); onNodeClick && onNodeClick(-1, null); }}
                style={{ cursor: isMovable ? 'pointer' : 'default' }}
              >
                {isMovable && (
                  <circle cx={sx+ox} cy={sy+oy} r={14} fill="none"
                    stroke="#FFD700" strokeWidth="2.5" filter="url(#glow)">
                    <animate attributeName="opacity" values="1;0.15;1" dur="0.75s" repeatCount="indefinite"/>
                    <animate attributeName="r" values="12;16;12" dur="0.75s" repeatCount="indefinite"/>
                  </circle>
                )}
                {/* 그림자 */}
                <circle cx={sx+ox+1} cy={sy+oy+2} r={9.5} fill="rgba(0,0,0,0.3)"/>
                {/* 말 */}
                <circle cx={sx+ox} cy={sy+oy} r={9.5}
                  fill={player.color || '#C8A951'}
                  stroke={isMovable ? '#FFD700' : 'rgba(255,255,255,0.75)'}
                  strokeWidth={isMovable ? 2.5 : 1.8}
                  opacity="0.95"
                  filter={isMovable ? 'url(#glow)' : 'url(#sh)'}
                />
                <text x={sx+ox} y={sy+oy} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {player.emoji}
                </text>
              </g>
            );
          });
        })()}

        {/* 파티클 효과 */}
        {particles && (
          <Particles key={particleKey}
            cx={particles.x} cy={particles.y}
            color={currentPlayer?.color || '#FFD700'}
          />
        )}
      </svg>
    </div>
  );
}
