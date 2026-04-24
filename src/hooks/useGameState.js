import { useState, useCallback, useRef, useEffect } from 'react';
import {
  THROW_WEIGHTS, YUT_RESULTS, PATH_NEXT,
  SHORTCUT_ENTRY, SHORTCUT_START, OUTER_PATH,
  getSpot, SPOTS,
} from '../data/boardData.js';

export const PIECES_PER_PLAYER = 4;
const MAX_LOG = 80;

// ── Weighted random throw ──────────────────────────────────
function randomThrow() {
  const total = THROW_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of THROW_WEIGHTS) {
    r -= w.weight;
    if (r <= 0) return w.result;
  }
  return '개';
}

// ── Move calculation ──────────────────────────────────────
function calcNewPos(pos, steps, useShortcut) {
  if (steps === 0) return pos;

  if (steps < 0) {
    if (pos === -1) return -1;
    if (pos === 0)  return -1;
    const idx = OUTER_PATH.indexOf(pos);
    if (idx < 0)    return pos;
    if (idx === 0)  return -1;
    return OUTER_PATH[idx - 1];
  }

  let cur = pos;
  let rem = steps;
  let shortcutUsed = false;

  while (rem > 0) {
    if (cur === -1) { cur = 0; rem--; continue; }
    if (useShortcut && !shortcutUsed && SHORTCUT_ENTRY.has(cur)) {
      const scStart = SHORTCUT_START[cur];
      if (scStart !== undefined) { cur = scStart; shortcutUsed = true; rem--; continue; }
    }
    const next = PATH_NEXT[cur];
    if (next === undefined || next === null) return -2;
    if (next === -2) return -2;
    if (next === -1) return -2;
    cur = next;
    rem--;
  }
  return cur;
}

// ── AI 전략 함수 ───────────────────────────────────────────
// 최적의 말과 지름길 여부를 결정합니다
function aiChoosePiece(player, pendingSteps, allPlayers, playerIdx) {
  const steps = pendingSteps.steps;
  const moveable = player.pieces.filter(pc => {
    if (pc.finished) return false;
    if (steps < 0 && pc.pos === -1) return false;
    return true;
  });
  if (moveable.length === 0) return null;

  // 각 말의 점수를 계산하여 최적 선택
  let bestPiece = null;
  let bestScore = -Infinity;
  let bestUseShortcut = true;

  for (const piece of moveable) {
    // 지름길 사용 여부 두 가지 경우 모두 평가
    const options = SHORTCUT_ENTRY.has(piece.pos) && steps > 0
      ? [true, false]
      : [true];

    for (const useShortcut of options) {
      const newPos = calcNewPos(piece.pos, steps, useShortcut);
      let score = 0;

      // 완주 → 최고 우선
      if (newPos === -2) {
        score += 1000;
      } else if (newPos >= 0) {
        // 적 잡기 체크
        for (let ei = 0; ei < allPlayers.length; ei++) {
          if (ei === playerIdx) continue;
          const hasEnemy = allPlayers[ei].pieces.some(ep => !ep.finished && ep.pos >= 0 && ep.pos === newPos);
          if (hasEnemy) score += 500;
        }
        // 앞으로 많이 나가기 유리
        score += newPos >= 0 ? newPos * 2 : 0;
        // 대기 중인 말 출전 선호 (새 말 투입)
        if (piece.pos === -1) score += 20;
        // 지름길이면 약간 가산
        if (useShortcut && SHORTCUT_ENTRY.has(piece.pos)) score += 15;
        // 같은 칸에 아군이 있으면 업기 → 약간 유리
        const stacked = player.pieces.filter(op => op.id !== piece.id && !op.finished && op.pos === newPos);
        if (stacked.length > 0) score += 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPiece = piece;
        bestUseShortcut = useShortcut;
      }
    }
  }

  return bestPiece ? { pieceId: bestPiece.id, useShortcut: bestUseShortcut } : null;
}

// ── Player factory ────────────────────────────────────────
export const PLAYER_DEFAULTS = [
  { name: '플레이어 1', emoji: '🔴', color: '#E63946' },
  { name: '플레이어 2', emoji: '🔵', color: '#1D91D5' },
  { name: '플레이어 3', emoji: '🟢', color: '#2DC653' },
  { name: '플레이어 4', emoji: '🟠', color: '#F4A261' },
];

function createPlayer(id, name, emoji, color, isAI = false) {
  return {
    id,
    name:  name  || PLAYER_DEFAULTS[id]?.name  || `플레이어${id + 1}`,
    emoji: isAI ? '🤖' : (emoji || PLAYER_DEFAULTS[id]?.emoji || '🎯'),
    color: color || PLAYER_DEFAULTS[id]?.color || '#999',
    isAI,
    pieces: Array.from({ length: PIECES_PER_PLAYER }, (_, i) => ({
      id: `p${id}_${i}`,
      playerId: id,
      pos: -1,
      finished: false,
    })),
    finishedCount: 0,
    totalMoves: 0,
    captures: 0,
  };
}

// ── Main hook ─────────────────────────────────────────────
export function useGameState() {
  const [gamePhase, setGamePhase]               = useState('setup');
  const [players, setPlayers]                   = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [throwResults, setThrowResults]         = useState([]);
  const [pendingSteps, setPendingSteps]         = useState(null);
  const [selectingPiece, setSelectingPiece]     = useState(false);
  const [lastThrow, setLastThrow]               = useState(null);
  const [visitedSpot, setVisitedSpot]           = useState(null);
  const [winner, setWinner]                     = useState(null);
  const [log, setLog]                           = useState([]);
  const [message, setMessage]                   = useState('');
  const [extraThrowPending, setExtraThrowPending] = useState(false);
  const [pendingAfterSpot, setPendingAfterSpot] = useState(null);
  const [throwCount, setThrowCount]             = useState(0);
  // AI 사고 중 표시용
  const [aiThinking, setAiThinking]             = useState(false);

  const playersRef        = useRef([]);
  const currentIdxRef     = useRef(0);
  const throwResultsRef   = useRef([]);
  const pendingStepsRef   = useRef(null);
  const extraThrowRef     = useRef(false);
  const pendingAfterSpotRef = useRef(null);

  playersRef.current        = players;
  currentIdxRef.current     = currentPlayerIdx;
  throwResultsRef.current   = throwResults;
  pendingStepsRef.current   = pendingSteps;
  extraThrowRef.current     = extraThrowPending;
  pendingAfterSpotRef.current = pendingAfterSpot;

  const addLog = useCallback((msg) => {
    setLog(prev => [{ msg, time: Date.now() }, ...prev].slice(0, MAX_LOG));
  }, []);

  // ── 게임 시작 ─────────────────────────────────────────
  // isAIArr: boolean[] — 각 플레이어가 AI인지 여부
  const startGame = useCallback((numPlayers, playerNames, isAIArr = []) => {
    const count = typeof numPlayers === 'number' ? numPlayers : 2;
    const names = Array.isArray(playerNames) ? playerNames : [];
    const ps = Array.from({ length: count }, (_, i) =>
      createPlayer(
        i,
        names[i],
        PLAYER_DEFAULTS[i].emoji,
        PLAYER_DEFAULTS[i].color,
        isAIArr[i] === true,
      )
    );
    setPlayers(ps);
    setCurrentPlayerIdx(0);
    setThrowResults([]);
    setPendingSteps(null);
    setSelectingPiece(false);
    setLastThrow(null);
    setVisitedSpot(null);
    setWinner(null);
    setLog([]);
    setExtraThrowPending(false);
    setPendingAfterSpot(null);
    setThrowCount(0);
    setAiThinking(false);
    const aiCount = isAIArr.slice(0, count).filter(Boolean).length;
    const modeStr = aiCount === 0 ? '멀티플레이' : aiCount === count ? 'AI 시범' : `${count - aiCount}인 vs AI ${aiCount}명`;
    setMessage(`${ps[0].name}의 차례입니다. 윷을 던지세요!`);
    setGamePhase('playing');
    addLog(`🎮 게임 시작! ${count}명 참가 (${modeStr}) — 대한민국 전국일주!`);
  }, [addLog]);

  // ── 턴 전환 내부 함수 ─────────────────────────────────
  const _advanceTurn = useCallback((currentPs, currentIdx) => {
    const next = (currentIdx + 1) % currentPs.length;
    setCurrentPlayerIdx(next);
    setThrowResults([]);
    setPendingSteps(null);
    setSelectingPiece(false);
    setExtraThrowPending(false);
    setPendingAfterSpot(null);
    const nextPlayer = currentPs[next];
    const isNextAI = nextPlayer?.isAI;
    setMessage(isNextAI
      ? `🤖 ${nextPlayer?.name}이(가) 생각 중...`
      : `${nextPlayer?.name}의 차례입니다. 윷을 던지세요!`
    );
    addLog(`↩️ ${nextPlayer?.name}의 차례${isNextAI ? ' (AI)' : ''}`);
  }, [addLog]);

  // ── 윷 던지기 ─────────────────────────────────────────
  const throwYut = useCallback(() => {
    const result = randomThrow();
    const info   = YUT_RESULTS[result];
    if (!info) return;

    setLastThrow(info);
    setThrowCount(c => c + 1);

    const prev       = throwResultsRef.current;
    const curExtra   = extraThrowRef.current;
    const newResults = [...prev, info];
    setThrowResults(newResults);

    const pName = playersRef.current[currentIdxRef.current]?.name || '';
    addLog(`🎲 ${pName}: ${info.emoji} ${info.name} (${info.steps > 0 ? '+' : ''}${info.steps}칸)${info.extra ? ' ★한번더!' : ''}`);

    if (info.extra) {
      setExtraThrowPending(true);
      if (!pendingStepsRef.current) {
        setPendingSteps(info);
        setSelectingPiece(true);
        setMessage(`${info.emoji} ${info.name}! 말을 이동하고 한 번 더 던지세요.`);
      } else {
        setMessage(`${info.emoji} ${info.name}! 한 번 더 던질 수 있습니다!`);
      }
    } else {
      if (!pendingStepsRef.current) {
        setPendingSteps(info);
        setSelectingPiece(true);
        setMessage(`${info.emoji} ${info.name}! 이동할 말을 선택하세요.`);
      } else {
        setMessage(`${info.emoji} ${info.name} 추가! 큐에 저장됨.`);
      }
    }
  }, [addLog]);

  // ── 큐에서 결과 선택 ──────────────────────────────────
  const chooseThrow = useCallback((idx) => {
    const results = throwResultsRef.current;
    const chosen  = typeof idx === 'number' ? results[idx] : idx;
    if (!chosen) return;
    setPendingSteps(chosen);
    setSelectingPiece(true);
    setMessage(`${chosen.emoji} ${chosen.name} — 이동할 말을 고르세요!`);
  }, []);

  // ── 말 이동 메인 로직 ─────────────────────────────────
  const movePieceAction = useCallback((pieceId, useShortcut = true) => {
    const ps = pendingStepsRef.current;
    if (!ps) return;

    const curPlayers = playersRef.current;
    const curIdx     = currentIdxRef.current;
    const curResults = throwResultsRef.current;
    const curExtra   = extraThrowRef.current;

    const updatedPlayers = curPlayers.map(p => ({
      ...p,
      pieces: p.pieces.map(pc => ({ ...pc })),
    }));

    const playerIdx = updatedPlayers.findIndex(p =>
      p.pieces.some(pc => pc.id === pieceId)
    );
    if (playerIdx === -1) return;

    const player = updatedPlayers[playerIdx];
    const piece  = player.pieces.find(pc => pc.id === pieceId);
    if (!piece || piece.finished) return;
    if (ps.steps < 0 && piece.pos === -1) return;

    const oldPos = piece.pos;
    const newPos = calcNewPos(oldPos, ps.steps, useShortcut);
    const isDone = newPos === -2;

    piece.pos      = isDone ? -2 : newPos;
    piece.finished = isDone;
    player.totalMoves = (player.totalMoves || 0) + 1;

    if (isDone) {
      player.finishedCount++;
      addLog(`✅ ${player.name}의 말이 완주! (${player.finishedCount}/${PIECES_PER_PLAYER}개)`);
    } else {
      const fromLabel = oldPos === -1 ? '출발대기' : `${oldPos}번`;
      addLog(`🐎 ${player.name}: ${fromLabel} → ${newPos}번`);
    }

    // 잡기
    let captured = false;
    if (!isDone && newPos >= 0) {
      updatedPlayers.forEach((enemy, ei) => {
        if (ei === playerIdx) return;
        enemy.pieces.forEach(ep => {
          if (!ep.finished && ep.pos >= 0 && ep.pos === newPos) {
            ep.pos = -1;
            captured = true;
            player.captures = (player.captures || 0) + 1;
            addLog(`💥 ${player.name}이 ${enemy.name}의 말을 잡았습니다!`);
          }
        });
      });
    }

    // 업기 알림
    if (!isDone && newPos >= 0) {
      const stacked = player.pieces.filter(ap =>
        ap.id !== pieceId && !ap.finished && ap.pos === newPos
      );
      if (stacked.length > 0) addLog(`🤝 ${player.name}: 말 업기! (${stacked.length + 1}개 합체)`);
    }

    const usedIdx    = curResults.indexOf(ps);
    const newResults = usedIdx >= 0
      ? curResults.filter((_, i) => i !== usedIdx)
      : curResults.slice(1);

    setPlayers(updatedPlayers);

    // 승리 체크
    const w = updatedPlayers.find(p => p.finishedCount >= PIECES_PER_PLAYER);
    if (w) {
      setWinner(w);
      setGamePhase('finished');
      setMessage(`🎉 ${w.name} 우승! 전국일주 완료!`);
      addLog(`🏆 ${w.name} 전국일주 완료! 우승!`);
      setThrowResults([]);
      setPendingSteps(null);
      setSelectingPiece(false);
      setExtraThrowPending(false);
      setAiThinking(false);
      return;
    }

    const hasMoreResults = newResults.length > 0;
    const stillExtra = curExtra && !ps.extra;
    const hasWinExtra = ps.extra;
    const nextExtra = captured || stillExtra || hasWinExtra;

    const realSpot = (!isDone && newPos >= 0) ? getSpot(newPos) : null;
    const showSpot = realSpot && realSpot.id !== 0 && realSpot.name;

    // AI 턴에서는 관광지 팝업 스킵 (AI는 자동 진행)
    const isAITurn = updatedPlayers[playerIdx]?.isAI;

    if (showSpot && !isAITurn) {
      setVisitedSpot(realSpot);
      setPendingAfterSpot({
        newResults: hasMoreResults ? newResults : [],
        capturedExtra: captured,
        extraThrow: (stillExtra || hasWinExtra) && !captured,
      });
      setGamePhase('spotInfo');
      setThrowResults(hasMoreResults ? newResults : []);
      setPendingSteps(hasMoreResults ? newResults[0] : null);
      setSelectingPiece(false);
      setExtraThrowPending(nextExtra);
      return;
    }

    if (hasMoreResults) {
      setThrowResults(newResults);
      setPendingSteps(newResults[0]);
      setSelectingPiece(true);
      setExtraThrowPending(nextExtra);
      setMessage('남은 윷 결과로 이동할 말을 선택하세요!');
      return;
    }

    if (captured) {
      setThrowResults([]);
      setPendingSteps(null);
      setSelectingPiece(false);
      setExtraThrowPending(true);
      setMessage(`💥 잡기 성공! 한 번 더 던지세요!`);
      return;
    }

    if (stillExtra || hasWinExtra) {
      setThrowResults([]);
      setPendingSteps(null);
      setSelectingPiece(false);
      setExtraThrowPending(true);
      setMessage(`★ 윷/모! 한 번 더 던지세요!`);
      return;
    }

    setThrowResults([]);
    setPendingSteps(null);
    setSelectingPiece(false);
    setExtraThrowPending(false);
    _advanceTurn(updatedPlayers, curIdx);
  }, [addLog, _advanceTurn]);

  // ── 관광지 닫기 ───────────────────────────────────────
  const dismissSpotInfo = useCallback(() => {
    setVisitedSpot(null);
    setGamePhase('playing');

    const after  = pendingAfterSpotRef.current;
    const curPs  = playersRef.current;
    const curIdx = currentIdxRef.current;
    setPendingAfterSpot(null);

    if (!after) { _advanceTurn(curPs, curIdx); return; }

    const { newResults, capturedExtra, extraThrow } = after;

    if (newResults && newResults.length > 0) {
      setThrowResults(newResults);
      setPendingSteps(newResults[0]);
      setSelectingPiece(true);
      setExtraThrowPending(capturedExtra || extraThrow);
      setMessage('남은 윷 결과로 이동할 말을 선택하세요!');
      return;
    }
    if (capturedExtra) {
      setThrowResults([]); setPendingSteps(null); setSelectingPiece(false);
      setExtraThrowPending(true); setMessage('💥 잡기 성공! 한 번 더 던지세요!');
      return;
    }
    if (extraThrow) {
      setThrowResults([]); setPendingSteps(null); setSelectingPiece(false);
      setExtraThrowPending(true); setMessage('★ 윷/모! 한 번 더 던지세요!');
      return;
    }
    _advanceTurn(curPs, curIdx);
  }, [_advanceTurn]);

  // ── 수동 턴 종료 ───────────────────────────────────────
  const endTurnManually = useCallback(() => {
    setThrowResults([]);
    setPendingSteps(null);
    setSelectingPiece(false);
    setExtraThrowPending(false);
    _advanceTurn(playersRef.current, currentIdxRef.current);
  }, [_advanceTurn]);

  // ── 관광지 직접 보기 ───────────────────────────────────
  const showSpotInfo = useCallback((spotId) => {
    const s = SPOTS.find(sp => sp.id === spotId);
    if (s) { setVisitedSpot(s); setGamePhase('spotInfo'); }
  }, []);

  // ── AI 자동 실행 (useEffect) ───────────────────────────
  // AI 턴일 때 자동으로 윷 던지고 말 이동
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const currentPlayer = players[currentPlayerIdx];
    if (!currentPlayer?.isAI) return;

    // 1) AI가 말을 선택해야 하는 상태
    if (selectingPiece && pendingSteps) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const choice = aiChoosePiece(currentPlayer, pendingSteps, players, currentPlayerIdx);
        if (choice) {
          setAiThinking(false);
          movePieceAction(choice.pieceId, choice.useShortcut);
        } else {
          // 이동 가능한 말 없음 → 턴 넘기기
          setAiThinking(false);
          endTurnManually();
        }
      }, 900); // 0.9초 "사고" 딜레이
      return () => clearTimeout(timer);
    }

    // 2) AI가 윷을 던져야 하는 상태
    const canThrow = !selectingPiece && (throwResults.length === 0 || extraThrowPending);
    if (canThrow) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        setAiThinking(false);
        throwYut();
      }, 1100); // 1.1초 딜레이
      return () => clearTimeout(timer);
    }
  }, [
    gamePhase, currentPlayerIdx, players,
    selectingPiece, pendingSteps, throwResults, extraThrowPending,
    throwYut, movePieceAction, endTurnManually,
  ]);

  return {
    gamePhase, setGamePhase,
    players,
    currentPlayerIdx,
    throwResults,
    pendingSteps,
    selectingPiece,
    lastThrow,
    visitedSpot,
    winner,
    log,
    message,
    extraThrowPending,
    throwCount,
    aiThinking,
    PIECES_PER_PLAYER,
    startGame,
    throwYut,
    chooseThrow,
    movePieceAction,
    dismissSpotInfo,
    endTurnManually,
    showSpotInfo,
  };
}
