import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SUBGAME_TYPE, QUIZ_BANK } from '../data/boardData.js';

// ══════════════════════════════════════════════════════════
// 농악 (사물놀이) 리듬 게임 - 완전 개선판
// ══════════════════════════════════════════════════════════
const BEATS = ['꽹과리', '북', '장구', '징'];
const BEAT_EMOJI  = { '꽹과리':'🔔', '북':'🥁', '장구':'🪘', '징':'🫧' };
const BEAT_COLOR  = { '꽹과리':'#E63946', '북':'#F4A261', '장구':'#2DC653', '징':'#1D91D5' };
const BEAT_SOUND  = { '꽹과리':'딱!', '북':'둥!', '장구':'덩!', '징':'징~' };
const MAX_ROUNDS = 5;

function NongakGame({ onResult }) {
  const [sequence, setSequence]     = useState([]);
  const [userSeq, setUserSeq]       = useState([]);
  const [phase, setPhase]           = useState('ready'); // ready|watch|play|wrong|win
  const [activeBeat, setActiveBeat] = useState(null);
  const [flashBeat, setFlashBeat]   = useState(null);
  const [score, setScore]           = useState(0);
  const [round, setRound]           = useState(1);
  const [countdown, setCountdown]   = useState(3);
  const [showWrong, setShowWrong]   = useState(false);
  const timerRef = useRef(null);
  const seqRef   = useRef([]);

  const playSequence = useCallback((seq) => {
    seqRef.current = seq;
    setPhase('watch');
    setUserSeq([]);
    setActiveBeat(null);
    let i = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(timerRef.current);
        setActiveBeat(null);
        setTimeout(() => setPhase('play'), 600);
        return;
      }
      setActiveBeat(seq[i]);
      setTimeout(() => setActiveBeat(null), 360);
      i++;
    }, 800);
  }, []);

  const startRound = useCallback((r) => {
    const len = r + 1;
    const seq = Array.from({ length: len }, () =>
      BEATS[Math.floor(Math.random() * BEATS.length)]
    );
    setSequence(seq);
    setUserSeq([]);
    setShowWrong(false);
    setTimeout(() => playSequence(seq), 500);
  }, [playSequence]);

  useEffect(() => {
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(iv); startRound(1); }
    }, 800);
    return () => { clearInterval(iv); clearInterval(timerRef.current); };
  }, []); // eslint-disable-line

  const handleBeat = useCallback((beat) => {
    if (phase !== 'play' || showWrong) return;
    setFlashBeat(beat);
    setTimeout(() => setFlashBeat(null), 180);

    const newUser = [...userSeq, beat];
    setUserSeq(newUser);
    const idx = newUser.length - 1;

    if (beat !== seqRef.current[idx]) {
      setShowWrong(true);
      clearInterval(timerRef.current);
      setTimeout(() => onResult(score >= 2 ? 'win' : 'lose', score), 1200);
      return;
    }
    if (newUser.length === seqRef.current.length) {
      const ns = score + 1;
      setScore(ns);
      if (ns >= 3 || round >= MAX_ROUNDS) {
        setTimeout(() => onResult('win', ns), 700);
      } else {
        const nr = round + 1;
        setRound(nr);
        setTimeout(() => startRound(nr), 1000);
      }
    }
  }, [phase, showWrong, userSeq, score, round, onResult, startRound]);

  if (phase === 'ready') {
    return (
      <div style={{ textAlign:'center', padding:'16px 0' }}>
        <div style={{ fontSize:52, marginBottom:10, animation:'float 2s ease-in-out infinite' }}>🥁</div>
        <div style={{ fontSize:16, color:'#C8A951', fontWeight:800, marginBottom:8, fontFamily:'Noto Serif KR,serif' }}>
          사물놀이 리듬 게임
        </div>
        <div style={{
          fontSize:12, color:'rgba(200,169,81,0.6)', marginBottom:20, lineHeight:2,
          background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 16px',
          border:'1px solid rgba(200,169,81,0.12)',
        }}>
          화면에 표시되는 악기 순서를 기억하고<br/>
          <strong style={{ color:'#FFD700' }}>같은 순서</strong>로 눌러보세요!<br/>
          <span style={{ fontSize:10, opacity:0.6 }}>3라운드 성공 시 클리어 🎉</span>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:22 }}>
          {BEATS.map(b => (
            <div key={b} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              padding:'8px 10px', borderRadius:10,
              background:`${BEAT_COLOR[b]}18`, border:`1px solid ${BEAT_COLOR[b]}44`,
            }}>
              <span style={{ fontSize:22 }}>{BEAT_EMOJI[b]}</span>
              <span style={{ fontSize:9, color:BEAT_COLOR[b], fontWeight:700 }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{
          fontSize:60, fontWeight:900, color:'#FFD700',
          textShadow:'0 0 30px #FFD70088',
          animation:'pulse 0.6s ease-in-out infinite',
        }}>
          {countdown > 0 ? countdown : '시작!'}
        </div>
      </div>
    );
  }

  const progress = Math.min(((userSeq.length) / (sequence.length || 1)) * 100, 100);

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:12, color:'#C8A951', fontWeight:700 }}>
          라운드 {round}/{MAX_ROUNDS}
        </div>
        <div style={{
          fontSize:12, fontWeight:800, padding:'3px 10px', borderRadius:8,
          background: phase==='watch' ? 'rgba(255,215,0,0.15)' : 'rgba(45,198,83,0.15)',
          color: phase==='watch' ? '#FFD700' : '#2DC653',
          border:`1px solid ${phase==='watch' ? '#FFD70044' : '#2DC65344'}`,
        }}>
          {phase==='watch' ? '👀 기억하세요!' : showWrong ? '❌ 틀렸어요!' : '👆 눌러보세요!'}
        </div>
        <div style={{
          fontSize:12, fontWeight:700, color:'#C8A951',
          display:'flex', alignItems:'center', gap:4,
        }}>
          ✅ <span style={{ color:'#FFD700' }}>{score}</span>점
        </div>
      </div>

      {/* 진행도 바 */}
      <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, marginBottom:12, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${progress}%`,
          background:'linear-gradient(90deg,#C8A951,#FFD700)',
          borderRadius:2, transition:'width 0.2s ease',
        }}/>
      </div>

      {/* 시퀀스 박스들 */}
      <div style={{
        display:'flex', gap:6, justifyContent:'center', marginBottom:16,
        flexWrap:'wrap', minHeight:58,
        background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'8px',
        border:'1px solid rgba(200,169,81,0.1)',
      }}>
        {sequence.map((b, i) => {
          const isActive   = phase==='watch' && activeBeat===b && i === sequence.lastIndexOf(b, sequence.length) && false;
          // 더 정확한 active 표시: 현재 i번째가 highlight
          const isActiveByIdx = phase==='watch' && sequence[userSeq.length] === b && i === userSeq.length && activeBeat === b;
          const isDone     = i < userSeq.length;
          const isWrongIdx = showWrong && i === userSeq.length - 1;
          return (
            <div key={i} style={{
              width:46, height:46, borderRadius:12,
              background: isWrongIdx ? 'rgba(230,57,70,0.4)'
                : activeBeat === b && phase === 'watch' ? BEAT_COLOR[b]
                : isDone ? `${BEAT_COLOR[b]}44`
                : 'rgba(255,255,255,0.05)',
              border:`2px solid ${
                isWrongIdx ? '#E63946'
                  : activeBeat === b && phase === 'watch' ? '#FFD700'
                  : isDone ? BEAT_COLOR[b]
                  : 'rgba(255,255,255,0.12)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, transition:'all 0.15s',
              transform: activeBeat === b && phase === 'watch' ? 'scale(1.3)' : 'scale(1)',
              boxShadow: activeBeat === b && phase === 'watch'
                ? `0 0 20px ${BEAT_COLOR[b]}`
                : 'none',
            }}>
              {(phase==='watch' || isDone) ? BEAT_EMOJI[b] : '❓'}
            </div>
          );
        })}
      </div>

      {/* 악기 버튼 그리드 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {BEATS.map(b => {
          const isFlash   = flashBeat === b;
          const canPlay   = phase === 'play' && !showWrong;
          return (
            <button key={b} onClick={() => handleBeat(b)}
              disabled={!canPlay}
              style={{
                padding:'16px 10px', borderRadius:14,
                background: isFlash ? BEAT_COLOR[b]
                  : canPlay ? `${BEAT_COLOR[b]}22`
                  : 'rgba(255,255,255,0.03)',
                border:`2.5px solid ${canPlay ? BEAT_COLOR[b] : 'rgba(255,255,255,0.08)'}`,
                color: canPlay ? '#F5DEB3' : 'rgba(200,200,200,0.2)',
                cursor: canPlay ? 'pointer' : 'not-allowed',
                display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                transition:'all 0.12s',
                transform: isFlash ? 'scale(0.91)' : 'scale(1)',
                boxShadow: isFlash ? `0 0 24px ${BEAT_COLOR[b]}` : 'none',
              }}>
              <span style={{ fontSize:28 }}>{BEAT_EMOJI[b]}</span>
              <span style={{ fontSize:12, fontWeight:800 }}>{b}</span>
              <span style={{ fontSize:10, opacity:0.55 }}>{BEAT_SOUND[b]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 제기차기 반응 게임 - 개선판
// ══════════════════════════════════════════════════════════
function JegiGame({ onResult }) {
  const [count, setCount]         = useState(0);
  const [target, setTarget]       = useState(null);
  const [timeLeft, setTimeLeft]   = useState(20);
  const [started, setStarted]     = useState(false);
  const [combo, setCombo]         = useState(0);
  const [maxCombo, setMaxCombo]   = useState(0);
  const [floats, setFloats]       = useState([]);
  const [lastHitTime, setLastHitTime] = useState(null);
  const areaRef  = useRef(null);
  const idRef    = useRef(0);
  const doneRef  = useRef(false);
  const countRef = useRef(0);

  useEffect(() => {
    if (!started) return;
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [started]);

  useEffect(() => {
    if (timeLeft === 0 && started && !doneRef.current) {
      doneRef.current = true;
      setTimeout(() => onResult(countRef.current >= 8 ? 'win' : 'lose', countRef.current), 800);
    }
  }, [timeLeft, started, onResult]);

  const spawnTarget = useCallback(() => {
    const area = areaRef.current;
    if (!area) return;
    const { width, height } = area.getBoundingClientRect();
    const x = 40 + Math.random() * (width - 90);
    const y = 20 + Math.random() * (height - 65);
    idRef.current++;
    setTarget({ x, y, id: idRef.current, born: Date.now() });
  }, []);

  useEffect(() => {
    if (started) spawnTarget();
  }, [started, spawnTarget]);

  const hitTarget = useCallback((e) => {
    e.stopPropagation();
    if (timeLeft <= 0 || !target) return;
    const nc = count + 1;
    countRef.current = nc;
    const now = Date.now();
    const isQuick = lastHitTime && (now - lastHitTime) < 800;
    const nc2 = isQuick ? combo + 1 : 1;
    setCount(nc);
    setCombo(nc2);
    setMaxCombo(m => Math.max(m, nc2));
    setLastHitTime(now);

    const ft = { id: now, x: target.x, y: target.y, combo: nc2 };
    setFloats(prev => [...prev.slice(-5), ft]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== ft.id)), 900);
    setTimeout(() => spawnTarget(), 220);
    setTarget(null);
  }, [timeLeft, target, count, combo, lastHitTime, spawnTarget]);

  if (!started) {
    return (
      <div style={{ textAlign:'center', padding:'8px 0' }}>
        <div style={{ fontSize:54, marginBottom:10, animation:'float 2s ease-in-out infinite' }}>🪃</div>
        <div style={{ fontSize:16, color:'#C8A951', fontWeight:800, marginBottom:8, fontFamily:'Noto Serif KR,serif' }}>
          제기차기 미니게임
        </div>
        <div style={{
          fontSize:12, color:'rgba(200,169,81,0.6)', marginBottom:20, lineHeight:2,
          background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 14px',
          border:'1px solid rgba(200,169,81,0.12)',
        }}>
          🎯 20초 안에 제기를 <strong style={{ color:'#FFD700' }}>8번 이상</strong> 차세요!<br/>
          화면에 나타나는 제기를 빠르게 탭하세요.<br/>
          <span style={{ fontSize:10, opacity:0.6 }}>빠르게 연속으로 치면 콤보 보너스!</span>
        </div>
        {/* 강릉 단오제 설명 */}
        <div style={{
          fontSize:11, color:'rgba(200,169,81,0.45)', lineHeight:1.7,
          background:'rgba(200,169,81,0.05)', borderRadius:8, padding:'8px 12px',
          marginBottom:20, border:'1px solid rgba(200,169,81,0.1)',
        }}>
          🌊 강릉 단오제의 전통 놀이 제기차기!<br/>
          유네스코 인류무형문화유산으로 등재된 강릉단오제에서 즐기는 전통 놀이입니다.
        </div>
        <button onClick={() => setStarted(true)} style={{
          padding:'14px 40px', borderRadius:14,
          background:'linear-gradient(135deg,#2DC653,#1A8A3A)',
          border:'none', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer',
          boxShadow:'0 4px 18px rgba(45,198,83,0.45)',
          transition:'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          🚀 시작!
        </button>
      </div>
    );
  }

  const pct = Math.min((count / 8) * 100, 100);

  return (
    <div>
      {/* 상태 바 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontSize:14, fontWeight:800 }}>
          <span style={{ color:'#2DC653' }}>🪃 {count}</span>
          {combo >= 3 && (
            <span style={{
              marginLeft:6, color:'#FF6B00', fontSize:12,
              background:'rgba(255,107,0,0.15)', padding:'2px 7px', borderRadius:8,
              border:'1px solid rgba(255,107,0,0.3)', animation:'pulse 0.5s ease-in-out infinite',
            }}>🔥×{combo}</span>
          )}
        </div>
        <div style={{
          fontSize:16, fontWeight:900,
          color: timeLeft <= 5 ? '#E63946' : timeLeft <= 10 ? '#F4A261' : '#C8A951',
          textShadow: timeLeft <= 5 ? '0 0 10px #E6394688' : 'none',
          animation: timeLeft <= 5 ? 'pulse 0.5s ease-in-out infinite' : 'none',
        }}>
          ⏱ {timeLeft}초
        </div>
        <div style={{ fontSize:11, color:'rgba(200,169,81,0.4)' }}>목표: <strong style={{color:'#FFD700'}}>8개</strong></div>
      </div>

      {/* 진행도 바 */}
      <div style={{
        height:8, background:'rgba(255,255,255,0.08)', borderRadius:4,
        marginBottom:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height:'100%',
          width:`${pct}%`,
          background: count >= 8
            ? 'linear-gradient(90deg,#FFD700,#FFA500)'
            : 'linear-gradient(90deg,#2DC653,#1A8A3A)',
          borderRadius:4, transition:'width 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: count >= 8 ? '0 0 10px #FFD70066' : '0 0 8px #2DC65355',
        }}/>
      </div>

      {/* 게임 영역 */}
      <div ref={areaRef} style={{
        position:'relative', height:195,
        background:'radial-gradient(circle at 50% 50%, rgba(45,198,83,0.07), rgba(0,0,0,0.2))',
        border:'2px solid rgba(45,198,83,0.22)', borderRadius:16, overflow:'hidden',
        cursor:'crosshair',
      }}>
        {/* 배경 장식 */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle, rgba(45,198,83,0.06) 1px, transparent 1px)',
          backgroundSize:'24px 24px',
          pointerEvents:'none',
        }}/>

        {target && timeLeft > 0 && (
          <button key={target.id} onClick={hitTarget} style={{
            position:'absolute', left:target.x, top:target.y,
            width:54, height:54, borderRadius:'50%',
            background:'radial-gradient(circle at 35% 35%, #FFB347, #E07020)',
            border:'3px solid #FFD700',
            cursor:'pointer', fontSize:24,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(244,162,97,0.75), 0 0 10px rgba(255,215,0,0.4)',
            transform:'translate(-50%,-50%)',
            zIndex:2, animation:'float 0.8s ease-in-out infinite',
          }}>🪃</button>
        )}

        {/* 콤보 플로팅 텍스트 */}
        {floats.map(ft => (
          <div key={ft.id} style={{
            position:'absolute', left:ft.x, top:ft.y - 15,
            fontSize:ft.combo >= 3 ? 18 : 13, fontWeight:900,
            color: ft.combo >= 5 ? '#FF4500'
              : ft.combo >= 3 ? '#FFD700'
              : '#2DC653',
            pointerEvents:'none', zIndex:10,
            animation:'countUp 0.8s ease-out forwards',
            textShadow:'0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {ft.combo >= 5 ? `🔥 ${ft.combo}콤보!`
              : ft.combo >= 3 ? `⚡${ft.combo}콤보`
              : '+1'}
          </div>
        ))}

        {timeLeft === 0 && (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(0,0,0,0.7)', flexDirection:'column', gap:10,
            borderRadius:14,
          }}>
            <div style={{ fontSize:40 }}>{count >= 8 ? '🎉' : '😢'}</div>
            <div style={{
              fontSize:20, fontWeight:900,
              color: count >= 8 ? '#2DC653' : '#E63946',
            }}>
              {count >= 8 ? `성공! ${count}개 달성!` : `아쉽... ${count}/8개`}
            </div>
            {maxCombo > 1 && (
              <div style={{ fontSize:12, color:'#FFD700' }}>최고 콤보: {maxCombo}회 🔥</div>
            )}
          </div>
        )}
      </div>
      <div style={{ textAlign:'center', marginTop:7, fontSize:10, color:'rgba(200,169,81,0.3)' }}>
        제기가 보이면 빠르게 탭하세요! {count >= 8 && '✨ 목표 달성!'}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 퀴즈 게임 - 개선판
// ══════════════════════════════════════════════════════════
function QuizGame({ bank = 'history', onClose }) {
  const questions   = QUIZ_BANK[bank] || QUIZ_BANK.history;
  const [qIdx, setQIdx]           = useState(() => Math.floor(Math.random() * questions.length));
  const [selected, setSelected]   = useState(null);
  const [result, setResult]       = useState(null);
  const [total, setTotal]         = useState(0);
  const [correct, setCorrect]     = useState(0);
  const [streak, setStreak]       = useState(0);
  const [showAnim, setShowAnim]   = useState(false);
  const q = questions[qIdx];

  const handleAnswer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    const isOk = i === q.ans;
    setResult(isOk ? 'correct' : 'wrong');
    setTotal(t => t + 1);
    if (isOk) {
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      setShowAnim(true);
      setTimeout(() => setShowAnim(false), 800);
    } else {
      setStreak(0);
    }
  };

  const nextQ = () => {
    let ni;
    do { ni = Math.floor(Math.random() * questions.length); } while (ni === qIdx && questions.length > 1);
    setQIdx(ni);
    setSelected(null);
    setResult(null);
  };

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div>
      {/* 점수 바 */}
      {total > 0 && (
        <div style={{
          display:'flex', gap:10, justifyContent:'center', marginBottom:12,
          padding:'8px 12px', borderRadius:10,
          background:'rgba(200,169,81,0.07)', border:'1px solid rgba(200,169,81,0.15)',
        }}>
          <span style={{ fontSize:12, color:'#2DC653', fontWeight:700 }}>
            ✅ {correct}
          </span>
          <span style={{ fontSize:11, color:'rgba(200,169,81,0.4)' }}>/ {total}문제</span>
          <span style={{ fontSize:12, color:'#C8A951', fontWeight:700 }}>
            정답률 {accuracy}%
          </span>
          {streak >= 2 && (
            <span style={{
              fontSize:11, color:'#FFD700', fontWeight:700,
              background:'rgba(255,215,0,0.12)', padding:'1px 7px', borderRadius:8,
              border:'1px solid rgba(255,215,0,0.3)',
              animation:'pulse 0.8s ease-in-out infinite',
            }}>🔥 {streak}연속!</span>
          )}
        </div>
      )}

      {/* 정답 애니메이션 */}
      {showAnim && (
        <div style={{
          textAlign:'center', fontSize:32, marginBottom:8,
          animation:'bounceIn 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)',
        }}>
          {streak >= 3 ? '🔥 완벽해요!' : streak >= 2 ? '⭐ 연속 정답!' : '✅ 정답!'}
        </div>
      )}

      {/* 문제 카드 */}
      <div style={{
        background:'rgba(200,169,81,0.08)', border:'1.5px solid rgba(200,169,81,0.2)',
        borderRadius:14, padding:'16px', marginBottom:14,
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{
          fontSize:10, color:'#C8A951', marginBottom:9,
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{
            background:'rgba(200,169,81,0.2)', padding:'2px 8px', borderRadius:6,
            fontWeight:700, letterSpacing:0.5,
          }}>Q{total + 1}</span>
          <span style={{ opacity:0.5 }}>
            {bank === 'history' ? '📜 역사' : bank === 'nature' ? '🌿 자연' : '🎭 문화'}
          </span>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:'#F5DEB3', lineHeight:1.8 }}>
          {q.q}
        </div>
      </div>

      {/* 보기 */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
        {q.opts.map((opt, i) => {
          const isCorrect  = i === q.ans;
          const isSelected = selected === i;
          let bg  = 'rgba(255,255,255,0.05)';
          let bdr = '1.5px solid rgba(255,255,255,0.1)';
          let tc  = '#D4B870';
          let transform = 'scale(1)';
          if (selected !== null) {
            if (isCorrect)       { bg='rgba(45,198,83,0.18)'; bdr='2px solid #2DC653'; tc='#2DC653'; }
            else if (isSelected) { bg='rgba(230,57,70,0.18)'; bdr='2px solid #E63946'; tc='#E63946'; transform='scale(0.98)'; }
            else                 { bg='rgba(255,255,255,0.02)'; tc='rgba(212,184,112,0.3)'; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{
                padding:'12px 15px', borderRadius:12,
                background: bg, border: bdr, color: tc,
                fontSize:13, cursor:selected!==null ? 'default' : 'pointer',
                textAlign:'left', fontWeight:600,
                display:'flex', alignItems:'center', gap:11,
                transition:'all 0.2s', transform,
              }}
              onMouseEnter={e => {
                if (selected === null) e.currentTarget.style.background = 'rgba(200,169,81,0.12)';
              }}
              onMouseLeave={e => {
                if (selected === null) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              <span style={{
                width:24, height:24, borderRadius:'50%',
                background: selected !== null && isCorrect ? '#2DC65330'
                  : selected !== null && isSelected && !isCorrect ? '#E6394630'
                  : 'rgba(200,169,81,0.12)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, flexShrink:0,
                border:`1px solid ${selected !== null && isCorrect ? '#2DC653' : 'rgba(200,169,81,0.2)'}`,
              }}>
                {['①','②','③','④'][i]}
              </span>
              <span style={{ flex:1, lineHeight:1.5 }}>{opt}</span>
              {selected !== null && isCorrect && (
                <span style={{ fontSize:16, flexShrink:0 }}>✅</span>
              )}
              {selected !== null && isSelected && !isCorrect && (
                <span style={{ fontSize:16, flexShrink:0 }}>❌</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 해설 */}
      {result && (
        <div style={{
          background: result==='correct' ? 'rgba(45,198,83,0.12)' : 'rgba(230,57,70,0.12)',
          border:`1.5px solid ${result==='correct' ? '#2DC65344' : '#E6394644'}`,
          borderRadius:12, padding:'11px 14px', marginBottom:13,
          animation:'slideUp 0.3s ease',
        }}>
          <div style={{
            fontSize:12, fontWeight:800,
            color: result==='correct' ? '#2DC653' : '#E63946',
            marginBottom:5,
          }}>
            {result==='correct' ? '✅ 정답입니다!' : '❌ 오답입니다.'}
          </div>
          <div style={{ fontSize:12, color:'#C8A860', lineHeight:1.7 }}>{q.exp}</div>
        </div>
      )}

      {/* 버튼들 */}
      <div style={{ display:'flex', gap:8 }}>
        {result && (
          <button onClick={nextQ} style={{
            flex:2, padding:'12px 0', borderRadius:12,
            background:'linear-gradient(135deg,#C8A951,#A07820)',
            border:'none', color:'#1A0800', fontSize:13, fontWeight:900, cursor:'pointer',
            boxShadow:'0 3px 12px rgba(200,169,81,0.35)',
            transition:'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          >
            다음 문제 →
          </button>
        )}
        <button onClick={onClose} style={{
          flex:1, padding:'12px 0', borderRadius:12,
          background:'rgba(255,255,255,0.06)',
          border:'1px solid rgba(255,255,255,0.14)',
          color:'rgba(200,180,140,0.7)', fontSize:12, cursor:'pointer',
          transition:'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SubGame 메인 컴포넌트
// ══════════════════════════════════════════════════════════
export default function SubGame({ subgame, onClose }) {
  const [result, setResult] = useState(null);
  if (!subgame) return null;

  const type  = subgame.type;
  const typeColor = {
    quiz:   '#C8A951',
    nongak: '#E63946',
    jegi:   '#2DC653',
  }[type] || '#C8A951';

  const typeIcon = { quiz:'📝', nongak:'🥁', jegi:'🪃' }[type] || '🎮';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:1100,
        background:'rgba(0,0,0,0.92)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:16, animation:'fadeIn 0.2s ease',
        backdropFilter:'blur(8px)',
      }}
    >
      <div style={{
        background:'linear-gradient(160deg,#0D0400 0%,#1E0D00 60%,#2C1810 100%)',
        borderRadius:24, width:'100%', maxWidth:450,
        maxHeight:'92vh', overflowY:'auto',
        border:`2.5px solid ${typeColor}`,
        boxShadow:`0 30px 80px rgba(0,0,0,0.95), 0 0 60px ${typeColor}20`,
        animation:'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        scrollbarWidth:'thin',
      }}>

        {/* 헤더 */}
        <div style={{
          borderBottom:`1px solid ${typeColor}33`,
          padding:'15px 18px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:`${typeColor}08`,
          borderRadius:'21px 21px 0 0',
          position:'sticky', top:0, zIndex:5,
          backdropFilter:'blur(10px)',
        }}>
          <div>
            <div style={{
              fontSize:16, fontWeight:900, color:'#F5DEB3',
              fontFamily:'Noto Serif KR,serif',
              display:'flex', alignItems:'center', gap:7,
            }}>
              <span style={{ fontSize:18 }}>{typeIcon}</span>
              {subgame.name}
            </div>
            <div style={{ fontSize:11, color:`${typeColor}88`, marginTop:2 }}>
              {subgame.desc || ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:'50%',
            background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.15)',
            color:'#bbb', cursor:'pointer', fontSize:15,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s', flexShrink:0,
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
          >✕</button>
        </div>

        <div style={{ padding:'18px' }}>
          {type === SUBGAME_TYPE.QUIZ && (
            <QuizGame bank={subgame.bank || 'history'} onClose={onClose}/>
          )}

          {type === SUBGAME_TYPE.NONGAK && !result && (
            <NongakGame onResult={(outcome, score) => setResult({ outcome, score })}/>
          )}

          {type === SUBGAME_TYPE.JEGI && !result && (
            <JegiGame onResult={(outcome, score) => setResult({ outcome, score })}/>
          )}

          {/* 미니게임 결과 (농악/제기) */}
          {result && (type === SUBGAME_TYPE.NONGAK || type === SUBGAME_TYPE.JEGI) && (
            <div style={{ textAlign:'center', padding:'8px 0 4px' }}>
              <div style={{
                fontSize:72, lineHeight:1, marginBottom:14,
                animation:'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)',
              }}>
                {result.outcome === 'win' ? '🎊' : '😢'}
              </div>
              <div style={{
                fontSize:24, fontWeight:900, marginBottom:8,
                fontFamily:'Noto Serif KR,serif',
                color: result.outcome === 'win' ? '#2DC653' : '#E63946',
              }}>
                {result.outcome === 'win' ? '성공! 훌륭해요!' : '아쉽네요!'}
              </div>
              <div style={{ fontSize:15, color:'#C8A860', marginBottom:6 }}>
                최종 점수:{' '}
                <strong style={{
                  color:'#FFD700', fontSize:20,
                  textShadow:'0 0 12px #FFD70066',
                }}>
                  {result.score}점
                </strong>
              </div>
              <div style={{
                fontSize:12, color:'rgba(200,169,81,0.5)',
                marginBottom:22, lineHeight:1.8,
                background:'rgba(255,255,255,0.04)', borderRadius:10,
                padding:'10px 14px', border:'1px solid rgba(200,169,81,0.1)',
              }}>
                {result.outcome === 'win'
                  ? '🎊 전통 놀이를 완벽하게 마스터했습니다!\n한국 문화를 온몸으로 체험했네요!'
                  : '💪 다음번엔 더 잘할 수 있어요!\n전통 놀이에 도전해보세요!'}
              </div>

              {/* 다시 도전 or 게임으로 */}
              <div style={{ display:'flex', gap:9 }}>
                {result.outcome === 'lose' && (
                  <button onClick={() => setResult(null)} style={{
                    flex:1, padding:'13px 0', borderRadius:13,
                    background:`linear-gradient(135deg,${typeColor},${typeColor}99)`,
                    border:'none', color:'#1A0800',
                    fontSize:13, fontWeight:900, cursor:'pointer',
                    transition:'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  >🔄 다시 도전</button>
                )}
                <button onClick={onClose} style={{
                  flex:1, padding:'13px 0', borderRadius:13,
                  background:'linear-gradient(135deg,#C8A951,#A07820)',
                  border:'none', color:'#1A0800',
                  fontSize:13, fontWeight:900, cursor:'pointer',
                  boxShadow:'0 3px 14px rgba(200,169,81,0.35)',
                  transition:'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                >
                  🎲 게임으로 돌아가기
                </button>
              </div>
            </div>
          )}

          {/* 알 수 없는 타입 */}
          {type !== SUBGAME_TYPE.QUIZ && type !== SUBGAME_TYPE.NONGAK && type !== SUBGAME_TYPE.JEGI && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🎮</div>
              <div style={{ fontSize:14, color:'#C8A860', marginBottom:22, lineHeight:1.7 }}>
                {subgame.desc || '미니게임을 즐겨보세요!'}
              </div>
              <button onClick={onClose} style={{
                width:'100%', padding:'13px 0', borderRadius:14,
                background:'linear-gradient(135deg,#C8A951,#A07820)',
                border:'none', color:'#1A0800', fontSize:14, fontWeight:900, cursor:'pointer',
              }}>계속 진행</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
