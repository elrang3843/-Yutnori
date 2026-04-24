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
    if (idx < 0)   return pos;
    if (idx === 0) return -1;
    return OUTER_PATH[idx - 1];
  }
  let cur = pos, rem = steps, shortcutUsed = false;
  while (rem > 0) {
    if (cur === -1) { cur = 0; rem--; continue; }
    if (useShortcut && !shortcutUsed && SHORTCUT_ENTRY.has(cur)) {
      const sc = SHORTCUT_START[cur];
      if (sc !== undefined) { cur = sc; shortcutUsed = true; rem--; continue; }
    }
    const next = PATH_NEXT[cur];
    if (next === undefined || next === null || next === -1 || next === -2) return -2;
    cur = next; rem--;
  }
  return cur;
}

// ── AI 전략: 최적 말 선택 ─────────────────────────────────
function aiChoosePiece(player, pendingSteps, allPlayers, playerIdx) {
  const steps = pendingSteps.steps;
  const moveable = player.pieces.filter(pc => {
    if (pc.finished) return false;
    if (steps < 0 && pc.pos === -1) return false;
    return true;
  });
  if (moveable.length === 0) return null;

  let bestPiece = null, bestScore = -Infinity, bestShortcut = true;

  for (const piece of moveable) {
    const opts = SHORTCUT_ENTRY.has(piece.pos) && steps > 0 ? [true, false] : [true];
    for (const useShortcut of opts) {
      const newPos = calcNewPos(piece.pos, steps, useShortcut);
      let score = 0;
      if (newPos === -2) {
        score += 1000;
      } else if (newPos >= 0) {
        for (let ei = 0; ei < allPlayers.length; ei++) {
          if (ei === playerIdx) continue;
          if (allPlayers[ei].pieces.some(ep => !ep.finished && ep.pos >= 0 && ep.pos === newPos))
            score += 500;
        }
        score += newPos * 2;
        if (piece.pos === -1) score += 20;
        if (useShortcut && SHORTCUT_ENTRY.has(piece.pos)) score += 15;
        const stacked = player.pieces.filter(op => op.id !== piece.id && !op.finished && op.pos === newPos);
        if (stacked.length > 0) score += 10;
      }
      if (score > bestScore) { bestScore = score; bestPiece = piece; bestShortcut = useShortcut; }
    }
  }
  return bestPiece ? { pieceId: bestPiece.id, useShortcut: bestShortcut } : null;
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
      id: `p${id}_${i}`, playerId: id, pos: -1, finished: false,
    })),
    finishedCount: 0, totalMoves: 0, captures: 0,
  };
}

// ── Main hook ─────────────────────────────────────────────
export function useGameState() {
  const [gamePhase, setGamePhase]                 = useState('setup');
  const [players, setPlayers]                     = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx]   = useState(0);
  const [throwResults, setThrowResults]           = useState([]);
  const [pendingSteps, setPendingSteps]           = useState(null);
  const [selectingPiece, setSelectingPiece]       = useState(false);
  const [lastThrow, setLastThrow]                 = useState(null);
  const [visitedSpot, setVisitedSpot]             = useState(null);
  const [winner, setWinner]                       = useState(null);
  const [log, setLog]                             = useState([]);
  const [message, setMessage]                     = useState('');
  const [extraThrowPending, setExtraThrowPending] = useState(false);
  const [pendingAfterSpot, setPendingAfterSpot]   = useState(null);
  const [throwCount, setThrowCount]               = useState(0);
  const [aiThinking, setAiThinking]               = useState(false);

  // ── refs (stale-closure 방지) ──────────────────────────
  const playersRef          = useRef([]);
  const currentIdxRef       = useRef(0);
  const throwResultsRef     = useRef([]);
  const pendingStepsRef     = useRef(null);
  const extraThrowRef       = useRef(false);
  const pendingAfterSpotRef = useRef(null);
  const gamePhaseRef        = useRef('setup');
  const selectingPieceRef   = useRef(false);

  // AI 자동화용 refs — 함수를 deps에 넣지 않기 위해 최신 함수를 ref에 보관
  const throwYutRef         = useRef(null);
  const movePieceActionRef  = useRef(null);
  const endTurnManuallyRef  = useRef(null);

  // AI 루프 중복 방지용 ref
  const aiTimerRef          = useRef(null);
  const aiRunningRef        = useRef(false);

  playersRef.current          = players;
  currentIdxRef.current       = currentPlayerIdx;
  throwResultsRef.current     = throwResults;
  pendingStepsRef.current     = pendingSteps;
  extraThrowRef.current       = extraThrowPending;
  pendingAfterSpotRef.current = pendingAfterSpot;
  gamePhaseRef.current        = gamePhase;
  selectingPieceRef.current   = selectingPiece;

  const addLog = useCallback((msg) => {
    setLog(prev => [{ msg, time: Date.now() }, ...prev].slice(0, MAX_LOG));
  }, []);

  // ── 게임 시작 ──────────────────────────────────────────
  const startGame = useCallback((numPlayers, playerNames, isAIArr = []) => {
    const count = typeof numPlayers === 'number' ? numPlayers : 2;
    const names = Array.isArray(playerNames) ? playerNames : [];
    const ps = Array.from({ length: count }, (_, i) =>
      createPlayer(i, names[i], PLAYER_DEFAULTS[i].emoji, PLAYER_DEFAULTS[i].color, isAIArr[i] === true)
    );
    // AI 루프 초기화
    if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null; }
    aiRunningRef.current = false;

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

  // ── 턴 전환 ────────────────────────────────────────────
  const _advanceTurn = useCallback((currentPs, currentIdx) => {
    const next = (currentIdx + 1) % currentPs.length;
    // AI 루프 플래그 초기화 (새 플레이어 턴 시작 시)
    aiRunningRef.current = false;
    setCurrentPlayerIdx(next);
    setThrowResults([]);
    setPendingSteps(null);
    setSelectingPiece(false);
    setExtraThrowPending(false);
    setPendingAfterSpot(null);
    setAiThinking(false);
    const nextPlayer = currentPs[next];
    setMessage(nextPlayer?.isAI
      ? `🤖 ${nextPlayer?.name}이(가) 생각 중...`
      : `${nextPlayer?.name}의 차례입니다. 윷을 던지세요!`
    );
    addLog(`↩️ ${nextPlayer?.name}의 차례${nextPlayer?.isAI ? ' (AI)' : ''}`);
  }, [addLog]);

  // ── 윷 던지기 ──────────────────────────────────────────
  const throwYut = useCallback(() => {
    const result = randomThrow();
    const info   = YUT_RESULTS[result];
    if (!info) return;

    setLastThrow(info);
    setThrowCount(c => c + 1);
    const prev       = throwResultsRef.current;
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

  // ── 큐에서 결과 선택 ───────────────────────────────────
  const chooseThrow = useCallback((idx) => {
    const results = throwResultsRef.current;
    const chosen  = typeof idx === 'number' ? results[idx] : idx;
    if (!chosen) return;
    setPendingSteps(chosen);
    setSelectingPiece(true);
    setMessage(`${chosen.emoji} ${chosen.name} — 이동할 말을 고르세요!`);
  }, []);

  // ── 말 이동 ────────────────────────────────────────────
  const movePieceAction = useCallback((pieceId, useShortcut = true) => {
    const ps = pendingStepsRef.current;
    if (!ps) return;

    const curPlayers = playersRef.current;
    const curIdx     = currentIdxRef.current;
    const curResults = throwResultsRef.current;
    const curExtra   = extraThrowRef.current;

    const updatedPlayers = curPlayers.map(p => ({
      ...p, pieces: p.pieces.map(pc => ({ ...pc })),
    }));

    const playerIdx = updatedPlayers.findIndex(p => p.pieces.some(pc => pc.id === pieceId));
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
      addLog(`🐎 ${player.name}: ${oldPos === -1 ? '대기' : oldPos+'번'} → ${newPos}번`);
    }

    // 잡기
    let captured = false;
    if (!isDone && newPos >= 0) {
      updatedPlayers.forEach((enemy, ei) => {
        if (ei === playerIdx) return;
        enemy.pieces.forEach(ep => {
          if (!ep.finished && ep.pos >= 0 && ep.pos === newPos) {
            ep.pos = -1; captured = true;
            player.captures = (player.captures || 0) + 1;
            addLog(`💥 ${player.name}이 ${enemy.name}의 말을 잡았습니다!`);
          }
        });
      });
    }

    // 업기
    if (!isDone && newPos >= 0) {
      const stacked = player.pieces.filter(ap => ap.id !== pieceId && !ap.finished && ap.pos === newPos);
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
      setThrowResults([]); setPendingSteps(null); setSelectingPiece(false);
      setExtraThrowPending(false); setAiThinking(false);
      aiRunningRef.current = false;
      return;
    }

    const hasMoreResults = newResults.length > 0;
    const stillExtra     = curExtra && !ps.extra;
    const hasWinExtra    = ps.extra;
    const nextExtra      = captured || stillExtra || hasWinExtra;

    const realSpot = (!isDone && newPos >= 0) ? getSpot(newPos) : null;
    const showSpot = realSpot && realSpot.id !== 0 && realSpot.name;
    const isAITurn = updatedPlayers[playerIdx]?.isAI;

    // 인간 턴에서만 관광지 팝업 표시
    if (showSpot && !isAITurn) {
      setVisitedSpot(realSpot);
      setPendingAfterSpot({
        newResults:    hasMoreResults ? newResults : [],
        capturedExtra: captured,
        extraThrow:    (stillExtra || hasWinExtra) && !captured,
      });
      setGamePhase('spotInfo');
      setThrowResults(hasMoreResults ? newResults : []);
      setPendingSteps(hasMoreResults ? newResults[0] : null);
      setSelectingPiece(false);
      setExtraThrowPending(nextExtra);
      return;
    }

    if (hasMoreResults) {
      setThrowResults(newResults); setPendingSteps(newResults[0]);
      setSelectingPiece(true); setExtraThrowPending(nextExtra);
      setMessage('남은 윷 결과로 이동할 말을 선택하세요!');
      return;
    }
    if (captured) {
      setThrowResults([]); setPendingSteps(null); setSelectingPiece(false);
      setExtraThrowPending(true); setMessage('💥 잡기 성공! 한 번 더 던지세요!');
      return;
    }
    if (stillExtra || hasWinExtra) {
      setThrowResults([]); setPendingSteps(null); setSelectingPiece(false);
      setExtraThrowPending(true); setMessage('★ 윷/모! 한 번 더 던지세요!');
      return;
    }

    // 이 턴의 모든 이동 완료 → 다음 플레이어로 전환
    setThrowResults([]); setPendingSteps(null);
    setSelectingPiece(false); setExtraThrowPending(false);
    _advanceTurn(updatedPlayers, curIdx);
  }, [addLog, _advanceTurn]);

  // ── 관광지 닫기 ────────────────────────────────────────
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
      setThrowResults(newResults); setPendingSteps(newResults[0]);
      setSelectingPiece(true); setExtraThrowPending(capturedExtra || extraThrow);
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

  // ── 수동 턴 종료 ────────────────────────────────────────
  const endTurnManually = useCallback(() => {
    setThrowResults([]); setPendingSteps(null);
    setSelectingPiece(false); setExtraThrowPending(false);
    _advanceTurn(playersRef.current, currentIdxRef.current);
  }, [_advanceTurn]);

  // ── 관광지 직접 보기 ────────────────────────────────────
  const showSpotInfo = useCallback((spotId) => {
    const s = SPOTS.find(sp => sp.id === spotId);
    if (s) { setVisitedSpot(s); setGamePhase('spotInfo'); }
  }, []);

  // ── 최신 함수를 ref에 동기화 ────────────────────────────
  throwYutRef.current        = throwYut;
  movePieceActionRef.current = movePieceAction;
  endTurnManuallyRef.current = endTurnManually;

  // ── AI 자동 실행 ─────────────────────────────────────
  // aiRunningRef로 중복 실행 방지.
  // deps: gamePhase, currentPlayerIdx, selectingPiece, pendingSteps
  // extraThrowPending은 refs로만 접근 → deps에서 제거하여 무한루프 방지
  useEffect(() => {
    // 게임 중이 아니면 무시
    if (gamePhase !== 'playing') return;

    const currentPlayer = playersRef.current[currentIdxRef.current];
    if (!currentPlayer?.isAI) return;

    // 이미 타이머가 예약된 경우 중복 방지
    if (aiTimerRef.current) return;

    // ── 케이스 1: 말을 선택해야 하는 상태 ──
    if (selectingPiece && pendingSteps) {
      setAiThinking(true);
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        // 실행 시점에 상태 재확인
        if (gamePhaseRef.current !== 'playing') { setAiThinking(false); return; }
        const cp = playersRef.current[currentIdxRef.current];
        if (!cp?.isAI) { setAiThinking(false); return; }

        const ps    = pendingStepsRef.current;
        const psAll = playersRef.current;
        const idx   = currentIdxRef.current;
        const pl    = psAll[idx];
        if (!pl || !ps) {
          setAiThinking(false);
          endTurnManuallyRef.current?.();
          return;
        }
        const choice = aiChoosePiece(pl, ps, psAll, idx);
        setAiThinking(false);
        if (choice) {
          movePieceActionRef.current?.(choice.pieceId, choice.useShortcut);
        } else {
          endTurnManuallyRef.current?.();
        }
      }, 900);
      return () => {
        if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null; }
      };
    }

    // ── 케이스 2: 윷을 던져야 하는 상태 ──
    // 말 선택 중이 아니고, 결과가 없거나 추가 던지기 대기 중
    const noResults  = throwResultsRef.current.length === 0;
    const waitExtra  = extraThrowRef.current;

    if (!selectingPiece && (noResults || waitExtra)) {
      setAiThinking(true);
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        // 실행 시점에 상태 재확인
        if (gamePhaseRef.current !== 'playing') { setAiThinking(false); return; }
        const cp = playersRef.current[currentIdxRef.current];
        if (!cp?.isAI) { setAiThinking(false); return; }
        setAiThinking(false);
        throwYutRef.current?.();
      }, 1100);
      return () => {
        if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null; }
      };
    }
  // extraThrowPending을 deps에서 제거 → 무한루프 방지
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentPlayerIdx, selectingPiece, pendingSteps]);

  return {
    gamePhase, setGamePhase,
    players, currentPlayerIdx,
    throwResults, pendingSteps, selectingPiece,
    lastThrow, visitedSpot, winner,
    log, message, extraThrowPending, throwCount, aiThinking,
    PIECES_PER_PLAYER,
    startGame, throwYut, chooseThrow, movePieceAction,
    dismissSpotInfo, endTurnManually, showSpotInfo,
  };
}
