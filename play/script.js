const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const worryCountEl = document.getElementById('worryCount');
const bestScoreEl = document.getElementById('bestScore');
const modeDescriptionEl = document.getElementById('modeDescription');
const calmTextEl = document.getElementById('calmText');
const toastEl = document.getElementById('toast');
const overlayTipEl = document.getElementById('overlayTip');
const calmBtn = document.getElementById('calmBtn');
const soundBtn = document.getElementById('soundBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const startWoodfishBtn = document.getElementById('startWoodfishBtn');
const playgroundWrap = document.querySelector('.playground-wrap');
const modeBtns = [...document.querySelectorAll('.mode-btn')];
const modeIconEl = document.getElementById('modeIcon');
const modeBadgeEl = document.getElementById('modeBadge');
const modeTitleEl = document.getElementById('modeTitle');
const modeSubtextEl = document.getElementById('modeSubtext');
const resetBtn = document.getElementById('resetBtn');
const summaryBtn = document.getElementById('summaryBtn');
const pauseBtn = document.getElementById('pauseBtn');
const summaryModal = document.getElementById('summaryModal');
const summaryScoreEl = document.getElementById('summaryScore');
const summaryBestComboEl = document.getElementById('summaryBestCombo');
const summaryWorriesEl = document.getElementById('summaryWorries');
const summaryWoodfishEl = document.getElementById('summaryWoodfish');
const summarySketchEl = document.getElementById('summarySketch');
const summaryLineEl = document.getElementById('summaryLine');
const summaryLeaderboardEl = document.getElementById('summaryLeaderboard');
const summaryHistoryEl = document.getElementById('summaryHistory');
const summaryCopyBtn = document.getElementById('summaryCopyBtn');
const summaryExportBtn = document.getElementById('summaryExportBtn');
const summaryCloseBtn = document.getElementById('summaryCloseBtn');
const summaryResetBtn = document.getElementById('summaryResetBtn');
const comboBreakEl = document.getElementById('comboBreak');
const achievementListEl = document.getElementById('achievementList');
const achievementCountEl = document.getElementById('achievementCount');
const dailyTitleEl = document.getElementById('dailyTitle');
const dailyModeEl = document.getElementById('dailyMode');
const dailyDescEl = document.getElementById('dailyDesc');
const dailyProgressTextEl = document.getElementById('dailyProgressText');
const dailyProgressFillEl = document.getElementById('dailyProgressFill');
const dailyStatusEl = document.getElementById('dailyStatus');
const dailyRewardEl = document.getElementById('dailyReward');
const dailyJumpBtn = document.getElementById('dailyJumpBtn');

const state = {
  mode: 'bubble',
  score: 0,
  combo: 0,
  bestCombo: 0,
  worriesCleared: 0,
  lastHitAt: 0,
  bubbles: [],
  particles: [],
  worries: [],
  blobs: [],
  pointer: { x: 0, y: 0, down: false },
  dragBlobId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  lastSpawnAt: 0,
  audioEnabled: true,
  audioCtx: null,
  paused: false,
  pauseStartedAt: 0,
  visitedModes: new Set(),
  unlockedAchievements: new Set(),
  dailyChallenge: null,
  runHistory: [],
  woodfishScale: 1,
  woodfishGlow: 0,
  woodfishHits: 0,
  bestScore: 0,
  flash: 0,
  comboPulse: 0,
  rings: [],
  hitTexts: [],
  cameraKick: 0,
  backgroundShift: 0,
  trails: [],
  ribbons: [],
  transition: 0,
  transitionLabel: '',
  comboFever: 0,
  comboFeverActive: false,
  sketchDrawing: false,
  lastSketchPoint: null,
  sketchTargets: [],
  sketchCollected: 0,
};

const calmingLines = [
  '你不是机器，偶尔卡一下很正常。',
  '先喘口气，世界不会因为你停 10 秒就散架。',
  '今天只要比刚刚松一点点，就算赢。',
  '压力不是你一个人的错，先把肩膀放下来。',
  '别急，先点爆几个泡泡，让脑子回神。'
];

const modeDescriptions = {
  bubble: '疯狂点爆飘起来的气泡，越快越爽，连击越高特效越夸张。',
  worry: '把烦恼词条一个个戳爆，越炸越解气，屏幕会帮你把它们送走。',
  squish: '抓住软乎乎的果冻团子乱拖乱甩，松手时它还会弹回去。',
  woodfish: '电子木鱼，专治脑子嗡嗡响。点一下敲一下，给心情一个有节奏的出口。',
  sketch: '按住拖动，把漂浮的星星连起来。线越长，夜空越亮。'
};

const modeMeta = {
  bubble: {
    icon: '🫧',
    badge: '轻松上手',
    title: '气泡狂点',
    subtext: '适合先把手感热起来，连点两分钟就能进入状态。',
    tip: '点击气泡试试手感',
    calm: '乱点一会儿也没关系，手先动起来。',
  },
  worry: {
    icon: '💥',
    badge: '清空缓存',
    title: '烦恼粉碎机',
    subtext: '把写在屏幕上的烦恼一个个拆掉，能量会回来的。',
    tip: '把烦恼一个个点碎',
    calm: '把看得见的烦恼先清掉，脑子会轻一点。',
  },
  squish: {
    icon: '🍡',
    badge: '软乎乎',
    title: '拖拽果冻',
    subtext: '抓住软乎乎的果冻团子乱拖乱甩，松手时它还会弹回去。',
    tip: '按住果冻拖来拖去',
    calm: '不是所有情绪都要讲清楚，有时候甩两下就够了。',
  },
  woodfish: {
    icon: '🔔',
    badge: '静心模式',
    title: '电子木鱼',
    subtext: '敲一下就当给脑子降噪，节奏稳了，整个人也会稳一点。',
    tip: '专心敲木鱼，别想工作',
    calm: '先让节奏慢下来，别急着和世界较劲。',
  },
  sketch: {
    icon: '🌌',
    badge: '连线放空',
    title: '星轨连线',
    subtext: '沿着星光拖出长长的线，把屏幕当成夜空慢慢连起来。',
    tip: '按住并拖动，连起散落的星星',
    calm: '不用追求画得多好，连起来就已经在放松了。',
  },
};

const summaryLines = [
  '今天已经比刚打开时轻一点了。',
  '把能戳的都戳了一遍，脑袋应该也跟着松了一点。',
  '节奏已经找回来了，下一轮会更顺。',
  '先把压力丢出去一点，剩下的可以慢慢来。',
  '别急着完美，能轻下来一点，就已经很值了。',
];

const worryTexts = ['加班', '堵车', '催回复', '改需求', '早起', '开会', 'KPI', '已读不回', 'bug', '内耗'];
const blobFaces = ['•ᴗ•', '◕‿◕', '╹◡╹', '•ω•', '˶ᵔ ᵕ ᵔ˶'];
const woodfishLines = ['功德+1', '烦恼-1', '别急，先敲一下', '脑壳降温中', '今日心平气和+1'];
const STORAGE_KEY = 'relax-room-best-score-v1';
const SETTINGS_KEY = 'relax-room-settings-v1';
const ACHIEVEMENTS_KEY = 'relax-room-achievements-v1';
const DAILY_CHALLENGE_KEY = 'relax-room-daily-challenge-v1';
const RUN_HISTORY_KEY = 'relax-room-run-history-v1';
const RUN_HISTORY_LIMIT = 50;

const DAILY_CHALLENGE_POOL = [
  {
    mode: 'bubble',
    title: '气泡热身',
    desc: '在气泡模式里点破 24 个气泡。',
    target: 24,
    reward: 60,
  },
  {
    mode: 'worry',
    title: '清空烦恼',
    desc: '粉碎 12 个烦恼词条。',
    target: 12,
    reward: 70,
  },
  {
    mode: 'squish',
    title: '果冻回弹',
    desc: '成功甩开 8 次果冻。',
    target: 8,
    reward: 70,
  },
  {
    mode: 'woodfish',
    title: '木鱼静心',
    desc: '敲 30 下木鱼。',
    target: 30,
    reward: 80,
  },
  {
    mode: 'sketch',
    title: '星轨连线',
    desc: '连住 6 颗星星。',
    target: 6,
    reward: 80,
  },
];

const ACHIEVEMENTS = [
  {
    id: 'first-step',
    icon: '🌱',
    title: '热身完成',
    desc: '第一次拿到分数，说明手已经开始跟上了。',
    stateText: '完成一次有效操作',
    check: () => state.score > 0 || state.worriesCleared > 0 || state.woodfishHits > 0,
  },
  {
    id: 'combo-8',
    icon: '🔥',
    title: '连点上手',
    desc: '单局连击达到 8，手感已经开始发热。',
    stateText: '单局连击 ≥ 8',
    check: () => state.bestCombo >= 8,
  },
  {
    id: 'combo-15',
    icon: '🚀',
    title: '手感爆发',
    desc: '单局连击达到 15，节奏已经在你这边了。',
    stateText: '单局连击 ≥ 15',
    check: () => state.bestCombo >= 15,
  },
  {
    id: 'worry-12',
    icon: '🧹',
    title: '清空缓存',
    desc: '把烦恼词条清掉 12 个，脑袋会轻不少。',
    stateText: '清掉烦恼 ≥ 12',
    check: () => state.worriesCleared >= 12,
  },
  {
    id: 'woodfish-30',
    icon: '🔔',
    title: '木鱼静心',
    desc: '木鱼敲到 30 下，节奏会更稳。',
    stateText: '木鱼次数 ≥ 30',
    check: () => state.woodfishHits >= 30,
  },
  {
    id: 'all-modes',
    icon: '🧭',
    title: '五门全开',
    desc: '五个模式都体验过，才算完整走一圈。',
    stateText: '五个模式都玩过',
    check: () => state.visitedModes.size >= 5,
  },
  {
    id: 'best-score-300',
    icon: '🏆',
    title: '高分解压师',
    desc: '本地最高分达到 300，手感已经很能打了。',
    stateText: '本地最高分 ≥ 300',
    check: () => state.bestScore >= 300,
  },
  {
    id: 'daily-challenge',
    icon: '📅',
    title: '今日有做',
    desc: '完成今天的每日挑战，说明自己真的来过。',
    stateText: '完成今日挑战',
    check: () => Boolean(state.dailyChallenge?.completed),
  },
];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ensureAudio() {
  if (!state.audioEnabled) return null;
  if (!state.audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    state.audioCtx = new AudioContextClass();
  }
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
  return state.audioCtx;
}

function beep({ freq = 440, type = 'sine', duration = 0.08, gain = 0.03, slideTo = null }) {
  const audio = ensureAudio();
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playPop() {
  beep({ freq: random(340, 520), type: 'triangle', duration: 0.07, gain: 0.035, slideTo: random(620, 880) });
}
function playWorryBreak() {
  beep({ freq: random(180, 260), type: 'square', duration: 0.09, gain: 0.03, slideTo: random(80, 120) });
  setTimeout(() => beep({ freq: random(480, 620), type: 'triangle', duration: 0.06, gain: 0.018, slideTo: random(720, 920) }), 20);
}
function playBlobSquish() {
  beep({ freq: random(120, 160), type: 'sine', duration: 0.11, gain: 0.045, slideTo: random(180, 260) });
}
function playCalmChime() {
  beep({ freq: 540, type: 'sine', duration: 0.12, gain: 0.02, slideTo: 680 });
  setTimeout(() => beep({ freq: 720, type: 'sine', duration: 0.12, gain: 0.018, slideTo: 860 }), 90);
}
function playSuccessSound() {
  beep({ freq: 660, type: 'sine', duration: 0.1, gain: 0.022, slideTo: 880 });
  setTimeout(() => beep({ freq: 990, type: 'triangle', duration: 0.08, gain: 0.016, slideTo: 1180 }), 70);
}
function playWoodfish() {
  beep({ freq: 220, type: 'sine', duration: 0.16, gain: 0.04, slideTo: 190 });
  setTimeout(() => beep({ freq: 440, type: 'triangle', duration: 0.12, gain: 0.018, slideTo: 320 }), 40);
}

function updateSoundButton() {
  soundBtn.textContent = state.audioEnabled ? '🔊 音效开' : '🔇 音效关';
  soundBtn.classList.toggle('off', !state.audioEnabled);
}

function updatePauseButton() {
  if (!pauseBtn) return;
  pauseBtn.textContent = state.paused ? '▶ 继续' : '⏸ 暂停';
  pauseBtn.setAttribute('aria-pressed', String(state.paused));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      mode: state.mode,
      audioEnabled: state.audioEnabled,
      visitedModes: [...state.visitedModes],
    }));
  } catch {}
}

function setPaused(paused) {
  const now = performance.now();
  if (paused) {
    state.pauseStartedAt = now;
  } else if (state.pauseStartedAt) {
    const pausedDuration = now - state.pauseStartedAt;
    state.lastHitAt += pausedDuration;
    state.lastSpawnAt += pausedDuration;
    state.pauseStartedAt = 0;
  }
  state.paused = paused;
  updatePauseButton();
  overlayTipEl.textContent = paused ? '已暂停，点继续再出发' : modeMeta[state.mode]?.tip || '继续解压';
  if (paused) {
    showToast('已暂停');
  }
}

function togglePause() {
  if (startScreen && !startScreen.classList.contains('hidden')) return;
  if (summaryModal && !summaryModal.classList.contains('hidden')) return;
  setPaused(!state.paused);
}

function loadBestScore() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return Number.isFinite(saved) ? saved : 0;
  } catch {
    return 0;
  }
}

function updateBestScore(silent = false) {
  if (state.score <= state.bestScore) return;
  state.bestScore = state.score;
  bestScoreEl.textContent = state.bestScore;
  try {
    localStorage.setItem(STORAGE_KEY, String(state.bestScore));
  } catch {}
  if (!silent) {
    showToast('新的本地最高分！');
  }
}

function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveAchievements() {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...state.unlockedAchievements]));
  } catch {}
}

function renderAchievements() {
  if (!achievementListEl) return;
  achievementListEl.innerHTML = ACHIEVEMENTS.map(item => {
    const unlocked = state.unlockedAchievements.has(item.id);
    return `
      <article class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${item.icon}</div>
        <div class="achievement-copy">
          <strong>${item.title}</strong>
          <p>${item.desc}</p>
          <div class="achievement-state">${unlocked ? '已解锁' : item.stateText}</div>
        </div>
      </article>
    `;
  }).join('');

  if (achievementCountEl) {
    achievementCountEl.textContent = `${state.unlockedAchievements.size} / ${ACHIEVEMENTS.length}`;
  }
}

function unlockAchievement(id, silent = false) {
  if (state.unlockedAchievements.has(id)) return false;
  const achievement = ACHIEVEMENTS.find(item => item.id === id);
  if (!achievement) return false;

  state.unlockedAchievements.add(id);
  saveAchievements();
  renderAchievements();

  if (!silent) {
    showToast(`解锁成就：${achievement.title}`);
  }
  return true;
}

function evaluateAchievements() {
  let unlockedAny = false;
  for (const achievement of ACHIEVEMENTS) {
    if (!state.unlockedAchievements.has(achievement.id) && achievement.check()) {
      if (unlockAchievement(achievement.id, true)) unlockedAny = true;
    }
  }
  if (unlockedAny) {
    showToast(`成就进度：${state.unlockedAchievements.size} / ${ACHIEVEMENTS.length}`);
  }
}

function markModeVisited(mode) {
  if (!modeMeta[mode]) return;
  if (!state.visitedModes.has(mode)) {
    state.visitedModes.add(mode);
  }
  evaluateAchievements();
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDailyChallenge(dateKey) {
  const index = hashString(dateKey) % DAILY_CHALLENGE_POOL.length;
  const template = DAILY_CHALLENGE_POOL[index];
  return {
    dateKey,
    mode: template.mode,
    title: template.title,
    desc: template.desc,
    target: template.target,
    reward: template.reward,
    progress: 0,
    completed: false,
    rewardGranted: false,
  };
}

function saveDailyChallenge() {
  if (!state.dailyChallenge) return;
  try {
    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(state.dailyChallenge));
  } catch {}
}

function loadDailyChallenge() {
  const dateKey = getTodayKey();
  const fresh = buildDailyChallenge(dateKey);
  try {
    const raw = localStorage.getItem(DAILY_CHALLENGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dateKey === dateKey && parsed.mode === fresh.mode) {
        fresh.progress = Math.min(fresh.target, Number(parsed.progress) || 0);
        fresh.completed = Boolean(parsed.completed);
        fresh.rewardGranted = Boolean(parsed.rewardGranted);
      }
    }
  } catch {}
  state.dailyChallenge = fresh;
  if (fresh.completed && !fresh.rewardGranted) {
    grantDailyReward({ silent: true });
  }
  renderDailyChallenge();
  evaluateAchievements();
}

function grantDailyReward({ silent = false } = {}) {
  const challenge = state.dailyChallenge;
  if (!challenge || challenge.rewardGranted) return;
  challenge.rewardGranted = true;
  state.score += challenge.reward;
  scoreEl.textContent = state.score;
  updateBestScore(silent);
  saveDailyChallenge();
  if (!silent) {
    showToast(`今日挑战完成，奖励 +${challenge.reward} 解压值`);
    playSuccessSound();
  }
}

function completeDailyChallenge() {
  const challenge = state.dailyChallenge;
  if (!challenge || challenge.completed) return;
  challenge.progress = Math.max(challenge.progress, challenge.target);
  challenge.completed = true;
  grantDailyReward();
  saveDailyChallenge();
  renderDailyChallenge();
  evaluateAchievements();
}

function advanceDailyChallenge(amount = 1, sourceMode = state.mode) {
  const challenge = state.dailyChallenge;
  if (!challenge || challenge.completed || challenge.mode !== sourceMode) return;
  challenge.progress = Math.min(challenge.target, challenge.progress + amount);
  saveDailyChallenge();
  renderDailyChallenge();
  if (challenge.progress >= challenge.target) {
    completeDailyChallenge();
  }
}

function renderDailyChallenge() {
  const challenge = state.dailyChallenge;
  if (!challenge || !dailyTitleEl) return;

  const modeInfo = modeMeta[challenge.mode] || modeMeta.bubble;
  const progress = Math.min(1, challenge.progress / challenge.target);
  const active = state.mode === challenge.mode;
  const statusText = challenge.completed ? '已完成' : active ? '进行中' : '去切换';

  dailyTitleEl.textContent = challenge.title;
  dailyModeEl.textContent = `${modeInfo.icon} ${modeInfo.title}`;
  dailyDescEl.textContent = challenge.desc;
  dailyProgressTextEl.textContent = `${Math.min(challenge.progress, challenge.target)} / ${challenge.target}`;
  dailyProgressFillEl.style.width = `${progress * 100}%`;
  dailyStatusEl.textContent = statusText;
  dailyStatusEl.classList.toggle('done', challenge.completed);
  dailyRewardEl.textContent = challenge.completed
    ? `奖励已发放：+${challenge.reward} 解压值`
    : `完成后奖励 +${challenge.reward} 解压值`;
  dailyJumpBtn.textContent = challenge.completed ? '再玩一次' : active ? '继续挑战' : '去完成';
  dailyJumpBtn.onclick = () => {
    if (challenge.completed) {
      resetRun(challenge.mode);
      return;
    }
    if (active) {
      if (state.paused) setPaused(false);
      showToast('继续挑战就行');
      return;
    }
    resetRun(challenge.mode);
  };
}

function loadRunHistory() {
  try {
    const raw = localStorage.getItem(RUN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        id: typeof item.id === 'string' ? item.id : `${Date.now()}-${Math.random()}`,
        timestamp: Number(item.timestamp) || Date.now(),
        mode: modeMeta[item.mode] ? item.mode : 'bubble',
        modeTitle: item.modeTitle || (modeMeta[item.mode]?.title || '气泡狂点'),
        score: Number(item.score) || 0,
        bestCombo: Number(item.bestCombo) || 0,
        worriesCleared: Number(item.worriesCleared) || 0,
        woodfishHits: Number(item.woodfishHits) || 0,
        sketchCollected: Number(item.sketchCollected) || 0,
        dailyChallenge: item.dailyChallenge && typeof item.dailyChallenge === 'object' ? {
          title: item.dailyChallenge.title || '',
          mode: modeMeta[item.dailyChallenge.mode] ? item.dailyChallenge.mode : 'bubble',
          progress: Number(item.dailyChallenge.progress) || 0,
          target: Number(item.dailyChallenge.target) || 0,
          completed: Boolean(item.dailyChallenge.completed),
        } : null,
      }));
  } catch {
    return [];
  }
}

function saveRunHistory() {
  try {
    localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(state.runHistory.slice(0, RUN_HISTORY_LIMIT)));
  } catch {}
}

function formatRunTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function recordCurrentRun() {
  const meaningful = state.score > 0 || state.bestCombo > 0 || state.worriesCleared > 0 || state.woodfishHits > 0 || state.sketchCollected > 0;
  if (!meaningful) return;

  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    mode: state.mode,
    modeTitle: modeMeta[state.mode]?.title || state.mode,
    score: state.score,
    bestCombo: state.bestCombo,
    worriesCleared: state.worriesCleared,
    woodfishHits: state.woodfishHits,
    sketchCollected: state.sketchCollected,
    dailyChallenge: state.dailyChallenge ? {
      title: state.dailyChallenge.title,
      mode: state.dailyChallenge.mode,
      progress: state.dailyChallenge.progress,
      target: state.dailyChallenge.target,
      completed: state.dailyChallenge.completed,
    } : null,
  };

  state.runHistory = [entry, ...state.runHistory].slice(0, RUN_HISTORY_LIMIT);
  saveRunHistory();
  renderRunHistory();
  renderLeaderboard();
}

function renderRunHistory() {
  if (!summaryHistoryEl) return;
  const history = state.runHistory.slice(0, 3);
  if (!history.length) {
    summaryHistoryEl.innerHTML = '<div class="summary-history-item"><strong>还没有记录</strong><span>先玩一局，系统会自动记下最近一次表现。</span><div class="history-meta">空</div></div>';
    return;
  }

  summaryHistoryEl.innerHTML = history.map(item => {
    const modeInfo = modeMeta[item.mode] || modeMeta.bubble;
    const dailyText = item.dailyChallenge?.completed
      ? `今日挑战：已完成`
      : item.dailyChallenge
        ? `今日挑战：${item.dailyChallenge.progress}/${item.dailyChallenge.target}`
        : '今日挑战：—';
    return `
      <div class="summary-history-item">
        <div>
          <strong>${modeInfo.icon} ${item.modeTitle}</strong>
          <span>分数 ${item.score} · 连击 ${item.bestCombo} · 烦恼 ${item.worriesCleared} · 木鱼 ${item.woodfishHits} · 星轨 ${item.sketchCollected}</span>
          <span>${dailyText}</span>
        </div>
        <div class="history-meta">${formatRunTime(item.timestamp)}</div>
      </div>
    `;
  }).join('');
}

function getLeaderboardEntries(limit = 5) {
  return [...state.runHistory]
    .sort((a, b) => (b.score - a.score) || (b.bestCombo - a.bestCombo) || (b.timestamp - a.timestamp))
    .slice(0, limit);
}

function renderLeaderboard() {
  if (!summaryLeaderboardEl) return;
  const entries = getLeaderboardEntries(5);
  if (!entries.length) {
    summaryLeaderboardEl.innerHTML = '<div class="summary-leaderboard-item"><div class="leaderboard-rank">—</div><div class="leaderboard-main"><strong>还没有最佳记录</strong><span>先玩几局，排行榜会自动出现。</span></div><div class="leaderboard-score"><strong>0</strong><span>分</span></div></div>';
    return;
  }

  summaryLeaderboardEl.innerHTML = entries.map((item, index) => {
    const modeInfo = modeMeta[item.mode] || modeMeta.bubble;
    const challengeNote = item.dailyChallenge?.completed
      ? '今日挑战已完成'
      : item.dailyChallenge && item.dailyChallenge.target
        ? `挑战 ${item.dailyChallenge.progress}/${item.dailyChallenge.target}`
        : '轻松一局';
    return `
      <div class="summary-leaderboard-item">
        <div class="leaderboard-rank">#${index + 1}</div>
        <div class="leaderboard-main">
          <strong>${modeInfo.icon} ${item.modeTitle}</strong>
          <span>连击 ${item.bestCombo} · 烦恼 ${item.worriesCleared} · 木鱼 ${item.woodfishHits} · 星轨 ${item.sketchCollected}</span>
        </div>
        <div class="leaderboard-score">
          <strong>${item.score}</strong>
          <span>${challengeNote}</span>
        </div>
      </div>
    `;
  }).join('');
}

function buildSummaryText() {
  const modeInfo = modeMeta[state.mode] || modeMeta.bubble;
  const daily = state.dailyChallenge;
  const leaderboard = getLeaderboardEntries(3);
  const dailyLine = daily
    ? `${daily.completed ? '今日挑战已完成' : '今日挑战进度'}：${daily.title} ${Math.min(daily.progress, daily.target)}/${daily.target}`
    : '今日挑战：无';
  return [
    `《3分钟解压屋》复盘`,
    `当前模式：${modeInfo.title}`,
    `解压值：${state.score}`,
    `最高连击：${state.bestCombo}`,
    `烦恼粉碎：${state.worriesCleared}`,
    `木鱼次数：${state.woodfishHits}`,
    `星轨连线：${state.sketchCollected}`,
    dailyLine,
    `成就：${state.unlockedAchievements.size}/${ACHIEVEMENTS.length}`,
    `本地最高分：${state.bestScore}`,
    leaderboard.length ? `历史最佳：${leaderboard.map((item, index) => `${index + 1}. ${item.modeTitle} ${item.score}`).join(' / ')}` : '历史最佳：暂无',
  ].join('\n');
}

async function copySummary() {
  const text = buildSummaryText();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    showToast('复盘文案已复制');
  } catch {
    showToast('复制失败，试试手动选中');
  }
}

function drawRoundedRect(g, x, y, width, height, radius, fillStyle, strokeStyle = null, lineWidth = 1) {
  const r = Math.min(radius, width / 2, height / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + width, y, x + width, y + height, r);
  g.arcTo(x + width, y + height, x, y + height, r);
  g.arcTo(x, y + height, x, y, r);
  g.arcTo(x, y, x + width, y, r);
  g.closePath();
  if (fillStyle) {
    g.fillStyle = fillStyle;
    g.fill();
  }
  if (strokeStyle) {
    g.lineWidth = lineWidth;
    g.strokeStyle = strokeStyle;
    g.stroke();
  }
}

function wrapCardLines(g, text, maxWidth) {
  const paragraphs = String(text).split('\n');
  const lines = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const ch of paragraph) {
      const next = line + ch;
      if (g.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawWrappedText(g, text, x, y, maxWidth, lineHeight, { font = '500 28px "Microsoft YaHei"', fillStyle = '#26324b', align = 'left' } = {}) {
  g.save();
  g.font = font;
  g.fillStyle = fillStyle;
  g.textAlign = align;
  g.textBaseline = 'top';
  const lines = wrapCardLines(g, text, maxWidth);
  lines.forEach((line, index) => {
    g.fillText(line, x, y + index * lineHeight);
  });
  g.restore();
  return lines.length;
}

function fitText(g, text, maxWidth) {
  const value = String(text || '');
  if (g.measureText(value).width <= maxWidth) return value;
  let output = value;
  while (output.length > 1 && g.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}…`;
}

async function exportSummaryCard() {
  const card = document.createElement('canvas');
  card.width = 1080;
  card.height = 1680;
  const g = card.getContext('2d');
  const modeInfo = modeMeta[state.mode] || modeMeta.bubble;
  const challenge = state.dailyChallenge;
  const leaderboard = getLeaderboardEntries(3);
  const theme = {
    bubble: { top: '#f8fbff', mid: '#eef3ff', bottom: '#dfe8ff', accent: '#6c7cff', accent2: '#ff7aa2' },
    worry: { top: '#fff8fb', mid: '#fff1f5', bottom: '#ffe1e9', accent: '#ff7aa2', accent2: '#ffb36c' },
    squish: { top: '#f6fff9', mid: '#ecfff3', bottom: '#dff9f0', accent: '#74e4c5', accent2: '#6c7cff' },
    woodfish: { top: '#fffaf4', mid: '#fff1de', bottom: '#f8dfba', accent: '#b56e34', accent2: '#d6a261' },
    sketch: { top: '#101a3b', mid: '#1b2957', bottom: '#263b70', accent: '#8fcbff', accent2: '#c2a4ff' },
  }[state.mode] || { top: '#f8fbff', mid: '#eef3ff', bottom: '#dfe8ff', accent: '#6c7cff', accent2: '#ff7aa2' };

  try {

  // Background
  const bg = g.createLinearGradient(0, 0, 0, card.height);
  bg.addColorStop(0, theme.top);
  bg.addColorStop(0.42, theme.mid);
  bg.addColorStop(1, theme.bottom);
  g.fillStyle = bg;
  g.fillRect(0, 0, card.width, card.height);

  // Decorative blobs
  g.globalAlpha = 0.85;
  for (let i = 0; i < 16; i++) {
    const x = (i * 137) % card.width;
    const y = 80 + ((i * 97) % 360);
    const radius = 18 + (i % 5) * 5;
    g.fillStyle = i % 2 === 0 ? `${theme.accent}22` : `${theme.accent2}22`;
    g.beginPath();
    g.arc(x + 40, y, radius, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Card shell
  drawRoundedRect(g, 48, 48, 984, 1584, 42, 'rgba(255,255,255,0.74)', 'rgba(133, 147, 190, 0.14)', 2);

  // Header
  g.fillStyle = theme.accent;
  g.font = '700 28px "Microsoft YaHei"';
  g.textBaseline = 'top';
  g.fillText('3分钟解压屋', 96, 86);

  drawRoundedRect(g, 810, 80, 164, 48, 24, `${theme.accent}1F`, null, 0);
  g.fillStyle = theme.accent;
  g.font = '700 22px "Microsoft YaHei"';
  g.textAlign = 'center';
  g.fillText(getTodayKey(), 892, 92);
  g.textAlign = 'left';

  g.fillStyle = '#22304d';
  g.font = '900 52px "Microsoft YaHei"';
  g.fillText(`${modeInfo.icon} ${modeInfo.title}`, 96, 146);
  const heroBand = g.createLinearGradient(96, 186, 984, 298);
  heroBand.addColorStop(0, `${theme.accent}18`);
  heroBand.addColorStop(1, `${theme.accent2}16`);
  drawRoundedRect(g, 96, 186, 888, 112, 30, heroBand, `${theme.accent}24`, 1.5);
  drawRoundedRect(g, 122, 208, 72, 72, 24, 'rgba(255,255,255,0.86)', `${theme.accent}20`, 1.2);
  g.save();
  g.fillStyle = theme.accent;
  g.font = '900 42px "Microsoft YaHei"';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(modeInfo.icon, 158, 244);
  g.restore();
  g.fillStyle = theme.accent;
  g.font = '700 18px "Microsoft YaHei"';
  g.fillText(challenge && challenge.completed ? '今日挑战已完成' : '今日总结', 220, 206);
  g.fillStyle = '#22304d';
  g.font = '900 30px "Microsoft YaHei"';
  g.fillText(modeInfo.title, 220, 232);
  g.fillStyle = '#6f7a91';
  g.font = '500 19px "Microsoft YaHei"';
  g.fillText(fitText(g, pickSummaryLine(), 700), 220, 266);
  drawRoundedRect(g, 836, 214, 110, 36, 18, `${theme.accent}18`, null, 0);
  g.fillStyle = theme.accent;
  g.font = '700 16px "Microsoft YaHei"';
  g.textAlign = 'center';
  g.fillText(modeInfo.badge, 891, 226);
  g.textAlign = 'left';

  // Big score
  drawRoundedRect(g, 96, 312, 888, 210, 32, 'rgba(255,255,255,0.88)', `${theme.accent}20`, 2);
  g.fillStyle = '#6f7a91';
  g.font = '700 22px "Microsoft YaHei"';
  g.fillText('本轮解压值', 132, 344);
  g.fillStyle = '#22304d';
  g.font = '900 94px Arial';
  g.fillText(String(state.score), 132, 382);
  g.fillStyle = theme.accent;
  g.font = '700 22px "Microsoft YaHei"';
  g.fillText(`最高连击 ${state.bestCombo}`, 132, 500);
  g.fillText(`本地最高分 ${state.bestScore}`, 360, 500);
  g.fillText(`成就 ${state.unlockedAchievements.size}/${ACHIEVEMENTS.length}`, 598, 500);

  // Stats grid
  const stats = [
    ['连击', state.bestCombo],
    ['烦恼', state.worriesCleared],
    ['木鱼', state.woodfishHits],
    ['星轨', state.sketchCollected],
    ['挑战', challenge ? `${challenge.progress}/${challenge.target}` : '—'],
    ['模式', modeInfo.title],
  ];
  const tileW = 284;
  const tileH = 106;
  stats.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 96 + col * 296;
    const y = 562 + row * 124;
    drawRoundedRect(g, x, y, tileW, tileH, 24, 'rgba(255,255,255,0.78)', 'rgba(133, 147, 190, 0.12)', 1.5);
    g.fillStyle = '#6f7a91';
    g.font = '700 18px "Microsoft YaHei"';
    g.fillText(item[0], x + 18, y + 18);
    g.fillStyle = '#22304d';
    g.font = typeof item[1] === 'string' ? '900 28px "Microsoft YaHei"' : '900 34px Arial';
    g.fillText(String(item[1]), x + 18, y + 50);
  });

  // Challenge card
  drawRoundedRect(g, 96, 818, 888, 226, 30, 'rgba(255,255,255,0.82)', 'rgba(133, 147, 190, 0.12)', 1.5);
  g.fillStyle = theme.accent;
  g.font = '700 20px "Microsoft YaHei"';
  g.fillText('今日挑战', 132, 850);
  g.fillStyle = '#22304d';
  g.font = '900 34px "Microsoft YaHei"';
  g.fillText(challenge ? challenge.title : '无', 132, 884);
  g.fillStyle = '#6f7a91';
  g.font = '500 22px "Microsoft YaHei"';
  drawWrappedText(g, challenge ? challenge.desc : '今天先放轻松，没有额外目标。', 132, 934, 780, 30, { font: '500 22px "Microsoft YaHei"', fillStyle: '#6f7a91' });
  drawRoundedRect(g, 132, 1008, 720, 20, 10, 'rgba(108,124,255,0.12)');
  const progress = challenge ? Math.min(1, challenge.progress / challenge.target) : 0;
  const progressGrad = g.createLinearGradient(132, 1008, 852, 1008);
  progressGrad.addColorStop(0, theme.accent);
  progressGrad.addColorStop(1, theme.accent2);
  drawRoundedRect(g, 132, 1008, Math.max(12, 720 * progress), 20, 10, progressGrad);
  g.fillStyle = theme.accent;
  g.font = '700 20px "Microsoft YaHei"';
  g.textAlign = 'right';
  g.fillText(challenge ? `${challenge.progress}/${challenge.target}` : '0/0', 872, 1000);
  g.textAlign = 'left';
  g.fillStyle = '#6f7a91';
  g.font = '500 18px "Microsoft YaHei"';
  g.fillText(challenge && challenge.completed ? `奖励已获得 +${challenge.reward}` : '完成后可获得额外奖励', 132, 1042);

  // Leaderboard card
  drawRoundedRect(g, 96, 1080, 888, 346, 30, 'rgba(255,255,255,0.82)', 'rgba(133, 147, 190, 0.12)', 1.5);
  g.fillStyle = theme.accent;
  g.font = '700 20px "Microsoft YaHei"';
  g.fillText('历史最佳', 132, 1112);
  if (!leaderboard.length) {
    g.fillStyle = '#6f7a91';
    g.font = '500 22px "Microsoft YaHei"';
    g.fillText('还没有记录，先来几局再说。', 132, 1160);
  } else {
    leaderboard.forEach((item, index) => {
      const y = 1150 + index * 74;
      drawRoundedRect(g, 132, y, 816, 60, 20, 'rgba(255,255,255,0.76)', 'rgba(133, 147, 190, 0.12)', 1);
      drawRoundedRect(g, 148, y + 12, 36, 36, 14, `${theme.accent}22`);
      g.fillStyle = theme.accent;
      g.font = '900 18px Arial';
      g.fillText(`#${index + 1}`, 157, y + 22);
      const modeInfo = modeMeta[item.mode] || modeMeta.bubble;
      g.fillStyle = '#22304d';
      g.font = '700 20px "Microsoft YaHei"';
      g.fillText(`${modeInfo.icon} ${item.modeTitle}`, 200, y + 14);
      g.fillStyle = '#6f7a91';
      g.font = '500 16px "Microsoft YaHei"';
      g.fillText(`连击 ${item.bestCombo} · 烦恼 ${item.worriesCleared} · 木鱼 ${item.woodfishHits} · 星轨 ${item.sketchCollected}`, 200, y + 36);
      g.fillStyle = '#22304d';
      g.font = '900 24px Arial';
      g.textAlign = 'right';
      g.fillText(String(item.score), 912, y + 20);
      g.fillStyle = '#6f7a91';
      g.font = '500 14px "Microsoft YaHei"';
      g.fillText(formatRunTime(item.timestamp), 912, y + 42);
      g.textAlign = 'left';
    });
  }

  // Footer
  g.fillStyle = '#6f7a91';
  g.font = '500 18px "Microsoft YaHei"';
  const footer = `成就 ${state.unlockedAchievements.size}/${ACHIEVEMENTS.length} · 本地最高分 ${state.bestScore} · ${getTodayKey()}`;
  g.fillText(footer, 96, 1490);
  g.fillStyle = '#22304d';
  g.font = '900 26px "Microsoft YaHei"';
  drawWrappedText(g, summaryLineEl?.textContent || pickSummaryLine(), 96, 1528, 888, 34, { font: '700 24px "Microsoft YaHei"', fillStyle: '#22304d' });

  const blob = await new Promise(resolve => card.toBlob(resolve, 'image/png', 1));
  if (!blob) throw new Error('Failed to create image blob');
  const fileName = `3分钟解压屋-${getTodayKey()}-${state.mode}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    try {
      await navigator.share({
        title: '3分钟解压屋分享卡',
        text: buildSummaryText(),
        files: [file],
      });
      showToast('已唤起系统分享');
      return;
    } catch (shareError) {
      if (shareError && shareError.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('分享卡已导出');
  } catch (error) {
    console.error(error);
    showToast('导出失败，再试一次');
  }
}

function updateModeHero(mode) {
  const meta = modeMeta[mode];
  if (!meta) return;
  modeIconEl.textContent = meta.icon;
  modeBadgeEl.textContent = meta.badge;
  modeTitleEl.textContent = meta.title;
  modeSubtextEl.textContent = meta.subtext;
}

function showComboBreak(comboCount) {
  if (!comboBreakEl || comboCount < 4) return;
  comboBreakEl.textContent = comboCount >= 10
    ? `连击断了，但刚刚已经打出 ${comboCount} 连了`
    : `连击 ${comboCount} 断了，没事，下一波继续`;
  comboBreakEl.classList.remove('hidden');
  clearTimeout(showComboBreak.timer);
  showComboBreak.timer = setTimeout(() => {
    comboBreakEl.classList.add('hidden');
  }, 1400);
}

function pickSummaryLine() {
  if (state.combo >= 15 || state.bestCombo >= 15) return '今天的手感已经很能打了，先奖励自己一点松弛感。';
  if (state.worriesCleared >= 12) return '烦恼清掉了不少，脑袋应该轻得更明显了。';
  if (state.woodfishHits >= 20) return '木鱼敲到这个量，节奏已经开始稳住了。';
  if (state.sketchCollected >= 6) return '星轨已经连起来了，今晚的脑子应该更安静一点。';
  if (state.score >= 300) return '这轮已经攒出一截不错的解压值，停一下也挺好。';
  return pick(summaryLines);
}

function syncSummaryModal() {
  if (!summaryModal) return;
  summaryScoreEl.textContent = state.score;
  summaryBestComboEl.textContent = state.bestCombo;
  summaryWorriesEl.textContent = state.worriesCleared;
  summaryWoodfishEl.textContent = state.woodfishHits;
  summarySketchEl.textContent = state.sketchCollected;
  summaryLineEl.textContent = pickSummaryLine();
}

function openSummary() {
  syncSummaryModal();
  renderLeaderboard();
  renderRunHistory();
  summaryModal.classList.remove('hidden');
}

function closeSummary() {
  summaryModal.classList.add('hidden');
}

function resetRun(mode = state.mode) {
  recordCurrentRun();
  clearTimeout(showComboBreak.timer);
  closeSummary();
  setPaused(false);
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.worriesCleared = 0;
  state.woodfishHits = 0;
  state.lastHitAt = 0;
  state.lastSpawnAt = 0;
  state.flash = 0;
  state.comboPulse = 0;
  state.cameraKick = 0;
  state.backgroundShift = 0;
  state.transition = 0;
  state.transitionLabel = '';
  state.comboFever = 0;
  state.comboFeverActive = false;
  state.woodfishScale = 1;
  state.woodfishGlow = 0;
  state.pointer.down = false;
  state.dragBlobId = null;
  state.bubbles = [];
  state.particles = [];
  state.worries = [];
  state.blobs = [];
  state.ribbons = [];
  state.sketchTargets = [];
  state.sketchDrawing = false;
  state.lastSketchPoint = null;
  state.sketchCollected = 0;
  state.rings = [];
  state.hitTexts = [];
  state.trails = [];
  scoreEl.textContent = '0';
  comboEl.textContent = '0';
  worryCountEl.textContent = '0';
  updateModeHero(mode);
  setMode(mode);
}

function pulseWrap(kind = 'soft') {
  if (!playgroundWrap) return;
  playgroundWrap.classList.remove('shake-soft', 'shake-strong');
  void playgroundWrap.offsetWidth;
  playgroundWrap.classList.add(kind === 'strong' ? 'shake-strong' : 'shake-soft');
}

function vibrate(ms = 18) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function createBurst(x, y, hue, amount = 14) {
  for (let i = 0; i < amount; i++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(1.4, 5.4);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(28, 54),
      maxLife: 54,
      size: random(3, 9),
      hue,
      gravity: random(0.01, 0.08),
      shape: Math.random() > 0.72 ? 'spark' : 'dot',
      spin: random(-0.18, 0.18),
      rot: random(0, Math.PI * 2),
    });
  }
}

function createRing(x, y, hue, size = 24, width = 8) {
  state.rings.push({
    x,
    y,
    hue,
    r: size,
    width,
    life: 24,
    maxLife: 24,
  });
}

function createHitText(x, y, text, hue = 20) {
  state.hitTexts.push({
    x,
    y,
    text,
    hue,
    vy: random(0.8, 1.6),
    life: 30,
    maxLife: 30,
    size: random(18, 26),
  });
}

function impact(x, y, { flash = 0.16, ringHue = 32, ringSize = 28, text = '', textHue = 32 } = {}) {
  state.flash = Math.max(state.flash, flash);
  state.comboPulse = Math.max(state.comboPulse, 0.3 + Math.min(state.combo, 18) * 0.02);
  state.cameraKick = Math.max(state.cameraKick, 0.8 + Math.min(state.combo, 12) * 0.08);
  state.backgroundShift = Math.max(state.backgroundShift, 0.25 + Math.min(state.combo, 12) * 0.04);
  createRing(x, y, ringHue, ringSize, 7 + Math.min(state.combo, 10) * 0.5);
  if (text) createHitText(x, y - 6, text, textHue);
}

function createTrail(x, y, hue, size = 28, alpha = 0.2) {
  state.trails.push({
    x,
    y,
    hue,
    size,
    alpha,
    life: 18,
    maxLife: 18,
  });
}

function startTransition(label) {
  state.transition = 1;
  state.transitionLabel = label;
}

function getImpactTier() {
  if (state.combo >= 12) return 'critical';
  if (state.combo >= 6) return 'heavy';
  return 'light';
}

function applyImpactFx(x, y, hue, tier, texts) {
  if (tier === 'critical') {
    createBurst(x, y, hue, 36);
    createTrail(x, y, hue, 64, 0.34);
    impact(x, y, {
      flash: 0.32,
      ringHue: hue,
      ringSize: 52,
      text: pick(texts.critical),
      textHue: hue,
    });
    state.cameraKick = Math.max(state.cameraKick, 2.6);
    state.backgroundShift = Math.max(state.backgroundShift, 0.85);
  } else if (tier === 'heavy') {
    createBurst(x, y, hue, 24);
    createTrail(x, y, hue, 42, 0.24);
    impact(x, y, {
      flash: 0.22,
      ringHue: hue,
      ringSize: 38,
      text: pick(texts.heavy),
      textHue: hue,
    });
  } else {
    createBurst(x, y, hue, 16);
    createTrail(x, y, hue, 28, 0.16);
    impact(x, y, {
      flash: 0.12,
      ringHue: hue,
      ringSize: 28,
      text: pick(texts.light),
      textHue: hue,
    });
  }
}

function addScore(base) {
  const now = performance.now();
  state.combo = now - state.lastHitAt < 900 ? state.combo + 1 : 1;
  state.lastHitAt = now;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.score += base + Math.min(state.combo, 12);
  scoreEl.textContent = state.score;
  comboEl.textContent = state.combo;
  updateBestScore();
  state.comboPulse = Math.max(state.comboPulse, 0.18 + Math.min(state.combo, 20) * 0.018);

  const feverNow = state.combo >= 10;
  state.comboFeverActive = feverNow;
  if (feverNow) state.comboFever = Math.min(1, state.comboFever + 0.14);

  if ([5, 10, 15].includes(state.combo)) {
    showToast(state.combo >= 15 ? '连击爆发！' : `连击 ${state.combo}`);
  }

  evaluateAchievements();
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.add('hidden'), 1300);
}

function spawnBubble() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  state.bubbles.push({ x: random(60, w - 60), y: h + random(20, 100), r: random(24, 52), vy: random(0.8, 2.2), drift: random(-0.5, 0.5), hue: random(180, 330), wobble: random(0, Math.PI * 2) });
}
function spawnWorry() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  state.worries.push({ text: pick(worryTexts), x: random(80, w - 80), y: random(90, h - 80), w: 120, h: 54, vx: random(-1.1, 1.1), vy: random(-0.8, 0.8), rot: random(-0.08, 0.08), tone: random(0, 1) });
}
function spawnBlob() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const r = random(34, 52);
  const x = random(90, w - 90);
  const y = random(120, h - 90);
  state.blobs.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, x, y, homeX: x, homeY: y, r, vx: random(-0.5, 0.5), vy: random(-0.3, 0.3), stretchX: 1, stretchY: 1, hue: random(140, 320), face: pick(blobFaces), grabbed: false });
}

function spawnSketchTarget() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const r = random(12, 18);
  state.sketchTargets.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    x: random(80, w - 80),
    y: random(90, h - 90),
    vx: random(-0.45, 0.45),
    vy: random(-0.32, 0.32),
    r,
    hue: random(186, 248),
    twinkle: random(0, Math.PI * 2),
  });
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function drawStarPath(outer, inner, points = 5) {
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + i * step;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function collectSketchTarget(target) {
  const idx = state.sketchTargets.indexOf(target);
  if (idx < 0) return;
  state.sketchTargets.splice(idx, 1);
  state.sketchCollected += 1;
  addScore(12);
  createBurst(target.x, target.y, target.hue, 18);
  createTrail(target.x, target.y, target.hue, 28, 0.18);
  showToast(`连到星星了：${state.sketchCollected}`);
  playCalmChime();
  advanceDailyChallenge(1, 'sketch');
  if (state.sketchTargets.length < 7) spawnSketchTarget();
  evaluateAchievements();
}

function handleSketchStroke(from, to) {
  if (!from || !to || state.paused) return;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.5) return;

  const hue = 200 + ((state.sketchCollected * 18) % 90);
  state.ribbons.push({
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    hue,
    width: 5 + Math.min(state.combo, 12) * 0.12,
    life: 36,
    maxLife: 36,
  });
  if (state.ribbons.length > 280) {
    state.ribbons.splice(0, state.ribbons.length - 280);
  }

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  createTrail(midX, midY, hue, Math.max(22, dist * 0.18), 0.12);
  if (Math.random() > 0.78) {
    createBurst(midX, midY, hue, 4);
  }

  addScore(Math.max(1, Math.round(dist / 32)));

  for (let i = state.sketchTargets.length - 1; i >= 0; i--) {
    const target = state.sketchTargets[i];
    const hitDistance = distanceToSegment(target.x, target.y, from.x, from.y, to.x, to.y);
    if (hitDistance <= target.r + 10) {
      collectSketchTarget(target);
    }
  }
}

function setMode(mode) {
  if (!modeMeta[mode]) mode = 'bubble';
  state.mode = mode;
  setPaused(false);
  closeSummary();
  clearTimeout(showComboBreak.timer);
  if (comboBreakEl) comboBreakEl.classList.add('hidden');
  state.bubbles = [];
  state.worries = [];
  state.blobs = [];
  state.particles = [];
  state.rings = [];
  state.hitTexts = [];
  state.trails = [];
  state.ribbons = [];
  state.sketchTargets = [];
  state.sketchDrawing = false;
  state.lastSketchPoint = null;
  state.sketchCollected = 0;
  state.dragBlobId = null;
  state.pointer.down = false;
  state.lastSpawnAt = 0;
  startTransition(modeMeta[mode]?.title || mode);

  updateModeHero(mode);
  overlayTipEl.textContent = modeMeta[mode]?.tip || '继续解压';
  modeDescriptionEl.textContent = modeDescriptions[mode];
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  calmTextEl.textContent = modeMeta[mode]?.calm || '先慢一点，别急。';

  for (let i = 0; i < 8; i++) {
    if (mode === 'bubble') spawnBubble();
    if (mode === 'worry') spawnWorry();
  }
  if (mode === 'squish') for (let i = 0; i < 5; i++) spawnBlob();
  if (mode === 'sketch') for (let i = 0; i < 7; i++) spawnSketchTarget();
  markModeVisited(mode);
  renderDailyChallenge();
  saveSettings();
}

function hideStartScreen() {
  startScreen.classList.add('hidden');
}

modeBtns.forEach(btn => btn.addEventListener('click', () => resetRun(btn.dataset.mode)));
startBtn.addEventListener('click', () => {
  hideStartScreen();
  playCalmChime();
  resetRun('bubble');
});
startWoodfishBtn.addEventListener('click', () => {
  hideStartScreen();
  playCalmChime();
  resetRun('woodfish');
});

resetBtn.addEventListener('click', () => {
  playCalmChime();
  resetRun(state.mode);
});

summaryBtn.addEventListener('click', openSummary);
summaryCopyBtn.addEventListener('click', copySummary);
summaryExportBtn.addEventListener('click', exportSummaryCard);
pauseBtn.addEventListener('click', togglePause);
summaryCloseBtn.addEventListener('click', closeSummary);
summaryResetBtn.addEventListener('click', () => {
  playCalmChime();
  resetRun(state.mode);
});

summaryModal.addEventListener('click', (event) => {
  if (event.target === summaryModal) closeSummary();
});

calmBtn.addEventListener('click', () => {
  calmTextEl.textContent = pick(calmingLines);
  showToast('今天先松一点点');
  playCalmChime();
});

soundBtn.addEventListener('click', () => {
  state.audioEnabled = !state.audioEnabled;
  updateSoundButton();
  if (state.audioEnabled) playCalmChime();
  saveSettings();
});
updateSoundButton();

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function getBlobAt(x, y) {
  for (let i = state.blobs.length - 1; i >= 0; i--) {
    const blob = state.blobs[i];
    const dx = x - blob.x;
    const dy = y - blob.y;
    if (dx * dx + dy * dy <= blob.r * blob.r) return blob;
  }
  return null;
}

function getWoodfishBounds() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const width = Math.min(340, w * 0.42);
  const height = width * 0.62;
  return { x: w / 2, y: h / 2 + 20, width, height };
}

canvas.addEventListener('pointermove', (event) => {
  Object.assign(state.pointer, pointerPos(event));
  if (state.mode === 'squish' && state.dragBlobId) {
    const blob = state.blobs.find(item => item.id === state.dragBlobId);
    if (!blob) return;
    blob.x = state.pointer.x - state.dragOffsetX;
    blob.y = state.pointer.y - state.dragOffsetY;
    const dx = blob.x - blob.homeX;
    const dy = blob.y - blob.homeY;
    const dist = Math.hypot(dx, dy);
    blob.stretchX = Math.min(1.45, 1 + dist / 180);
    blob.stretchY = Math.max(0.72, 1 - dist / 280);
  }
  if (state.mode === 'sketch' && state.sketchDrawing && state.pointer.down) {
    handleSketchStroke(state.lastSketchPoint, state.pointer);
    state.lastSketchPoint = { x: state.pointer.x, y: state.pointer.y };
  }
});

canvas.addEventListener('pointerdown', (event) => {
  Object.assign(state.pointer, pointerPos(event));
  if (state.paused) {
    showToast('已暂停，点“继续”再玩');
    return;
  }
  state.pointer.down = true;
  if (state.mode === 'sketch') {
    state.sketchDrawing = true;
    state.lastSketchPoint = { x: state.pointer.x, y: state.pointer.y };
    for (let i = state.sketchTargets.length - 1; i >= 0; i--) {
      const target = state.sketchTargets[i];
      if (Math.hypot(target.x - state.pointer.x, target.y - state.pointer.y) <= target.r + 8) {
        collectSketchTarget(target);
        break;
      }
    }
    overlayTipEl.textContent = '连起来，慢慢拖就好';
    return;
  }
  if (state.mode === 'squish') {
    const blob = getBlobAt(state.pointer.x, state.pointer.y);
    if (blob) {
      state.dragBlobId = blob.id;
      state.dragOffsetX = state.pointer.x - blob.x;
      state.dragOffsetY = state.pointer.y - blob.y;
      blob.grabbed = true;
      blob.stretchX = 1.18;
      blob.stretchY = 0.84;
      playBlobSquish();
      impact(blob.x, blob.y, { flash: 0.08, ringHue: blob.hue, ringSize: blob.r * 0.8, text: '抓住了', textHue: blob.hue });
      pulseWrap('soft');
      vibrate(12);
      overlayTipEl.textContent = '甩起来！越乱越解压';
      return;
    }
  }
  handleTap(state.pointer.x, state.pointer.y);
});

window.addEventListener('pointerup', () => {
  state.pointer.down = false;
  if (state.mode === 'sketch') {
    state.sketchDrawing = false;
    state.lastSketchPoint = null;
    return;
  }
  if (state.mode === 'squish' && state.dragBlobId) {
    const blob = state.blobs.find(item => item.id === state.dragBlobId);
    if (blob) {
      blob.grabbed = false;
      const away = Math.hypot(blob.x - blob.homeX, blob.y - blob.homeY);
      if (away > 50) {
        addScore(10);
        applyImpactFx(blob.x, blob.y, blob.hue, away > 120 ? 'critical' : getImpactTier(), {
          light: ['啪叽'],
          heavy: ['甩开！', '弹飞！'],
          critical: ['甩飞！', '炸开！'],
        });
        pulseWrap('soft');
        vibrate(18);
        advanceDailyChallenge(1, 'squish');
        showToast('啪叽，压力甩出去了');
      }
    }
    state.dragBlobId = null;
  }
});

function hitWoodfish(x, y) {
  const box = getWoodfishBounds();
  const rx = Math.abs(x - box.x) / (box.width / 2);
  const ry = Math.abs(y - box.y) / (box.height / 2);
  return (rx * rx + ry * ry) <= 1;
}

function handleTap(x, y) {
  if (state.mode === 'bubble') {
    for (let i = state.bubbles.length - 1; i >= 0; i--) {
      const b = state.bubbles[i];
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy <= b.r * b.r) {
        state.bubbles.splice(i, 1);
        addScore(8);
        applyImpactFx(b.x, b.y, b.hue, getImpactTier(), {
          light: ['啪！', '啵！', '爆！'],
          heavy: ['连爆！', '爽！', '炸开！'],
          critical: ['炸裂！', '全清！', '停不下来！'],
        });
        playPop();
        pulseWrap(state.combo >= 8 ? 'strong' : 'soft');
        vibrate(state.combo >= 8 ? 22 : 12);
        overlayTipEl.textContent = state.combo > 5 ? '连击中，继续戳！' : '好，再来一个';
        if (Math.random() > 0.55) showToast(pick(['啪！', '啵！', '爽！', '继续炸！']));
        advanceDailyChallenge(1, 'bubble');
        spawnBubble();
        return;
      }
    }
  } else if (state.mode === 'worry') {
    for (let i = state.worries.length - 1; i >= 0; i--) {
      const item = state.worries[i];
      if (x >= item.x - item.w / 2 && x <= item.x + item.w / 2 && y >= item.y - item.h / 2 && y <= item.y + item.h / 2) {
        state.worries.splice(i, 1);
        const burstHue = random(340, 390);
        addScore(12);
        applyImpactFx(item.x, item.y, burstHue, getImpactTier(), {
          light: ['粉碎'],
          heavy: ['碾碎！', '清掉！'],
          critical: ['彻底清空！', '爆破！'],
        });
        playWorryBreak();
        pulseWrap('strong');
        vibrate(20);
        state.worriesCleared += 1;
        worryCountEl.textContent = state.worriesCleared;
        overlayTipEl.textContent = '烦恼已清除，继续！';
        showToast(`已粉碎：${item.text}`);
        advanceDailyChallenge(1, 'worry');
        evaluateAchievements();
        spawnWorry();
        return;
      }
    }
  } else if (state.mode === 'woodfish') {
    if (hitWoodfish(x, y)) {
      state.woodfishScale = 0.93;
      state.woodfishGlow = 1;
      state.woodfishHits += 1;
      addScore(6);
      playWoodfish();
      const woodHue = random(32, 56);
      applyImpactFx(x, y, woodHue, state.woodfishHits % 8 === 0 ? 'heavy' : getImpactTier(), {
        light: ['咚'],
        heavy: ['咚——', '稳住'],
        critical: ['咚！！', '入定！'],
      });
      pulseWrap('soft');
      vibrate(15);
      overlayTipEl.textContent = state.woodfishHits % 8 === 0 ? '心静自然凉，再来两下' : '咚——';
      showToast(pick(woodfishLines));
      calmTextEl.textContent = pick(['敲一下，脑袋就没那么吵了。', '先别急，节奏回来一点了。', '木鱼不解决问题，但能先稳住你。']);
      advanceDailyChallenge(1, 'woodfish');
      evaluateAchievements();
    }
  }
}

function update() {
  if (state.paused) return;
  const now = performance.now();
  if (state.combo > 0 && now - state.lastHitAt > 1200) {
    const brokenCombo = state.combo;
    state.combo = 0;
    comboEl.textContent = '0';
    state.comboFeverActive = false;
    showComboBreak(brokenCombo);
  }

  if (state.mode === 'bubble') {
    if (now - state.lastSpawnAt > 420 && state.bubbles.length < 15) {
      spawnBubble();
      state.lastSpawnAt = now;
    }
    state.bubbles.forEach(b => {
      b.y -= b.vy;
      b.x += b.drift;
      b.wobble += 0.03;
      if (state.combo >= 6 && Math.random() > 0.72) {
        createTrail(b.x, b.y, b.hue, b.r * 0.9, 0.05 + Math.min(state.combo, 12) * 0.006);
      }
      if (b.y + b.r < -10) {
        b.y = canvas.clientHeight + random(20, 70);
        b.x = random(60, canvas.clientWidth - 60);
      }
    });
  } else if (state.mode === 'worry') {
    if (now - state.lastSpawnAt > 900 && state.worries.length < 10) {
      spawnWorry();
      state.lastSpawnAt = now;
    }
    state.worries.forEach(item => {
      item.x += item.vx;
      item.y += item.vy;
      if (item.x < 70 || item.x > canvas.clientWidth - 70) item.vx *= -1;
      if (item.y < 70 || item.y > canvas.clientHeight - 70) item.vy *= -1;
    });
  } else if (state.mode === 'squish') {
    state.blobs.forEach(blob => {
      if (!blob.grabbed) {
        blob.vx += (blob.homeX - blob.x) * 0.03;
        blob.vy += (blob.homeY - blob.y) * 0.03;
        blob.vx *= 0.92;
        blob.vy *= 0.92;
        blob.x += blob.vx;
        blob.y += blob.vy;
        blob.stretchX += (1 - blob.stretchX) * 0.12;
        blob.stretchY += (1 - blob.stretchY) * 0.12;
      }
    });
  } else if (state.mode === 'sketch') {
    if (now - state.lastSpawnAt > 1000 && state.sketchTargets.length < 7) {
      spawnSketchTarget();
      state.lastSpawnAt = now;
    }
    state.sketchTargets.forEach(target => {
      target.x += target.vx;
      target.y += target.vy;
      target.twinkle += 0.04;
      if (target.x < 70 || target.x > canvas.clientWidth - 70) target.vx *= -1;
      if (target.y < 70 || target.y > canvas.clientHeight - 70) target.vy *= -1;
    });
  }

  state.woodfishScale += (1 - state.woodfishScale) * 0.15;
  state.woodfishGlow *= 0.92;
  state.flash *= 0.88;
  state.comboPulse *= 0.9;
  state.cameraKick *= 0.86;
  state.backgroundShift *= 0.92;
  state.transition *= 0.88;
  state.comboFever *= state.comboFeverActive ? 0.985 : 0.94;

  state.particles = state.particles.filter(p => p.life > 0);
  state.particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy = p.vy * 0.98 + p.gravity;
    p.life -= 1;
    p.rot += p.spin;
  });

  state.rings = state.rings.filter(r => r.life > 0);
  state.rings.forEach(r => {
    r.r += 4.2;
    r.width *= 0.96;
    r.life -= 1;
  });

  state.hitTexts = state.hitTexts.filter(item => item.life > 0);
  state.hitTexts.forEach(item => {
    item.y -= item.vy;
    item.life -= 1;
  });

  state.trails = state.trails.filter(item => item.life > 0);
  state.trails.forEach(item => {
    item.size *= 1.035;
    item.life -= 1;
  });

  state.ribbons = state.ribbons.filter(item => item.life > 0);
  state.ribbons.forEach(item => {
    item.life -= 1;
  });
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawBackground() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const fever = Math.min(state.comboFever, 1);
  if (state.mode === 'sketch') {
    const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
    nightGrad.addColorStop(0, '#101a3b');
    nightGrad.addColorStop(0.56, '#1b2957');
    nightGrad.addColorStop(1, '#263b70');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.92;
    for (let i = 0; i < 18; i++) {
      const px = ((i * 97) % w) + 24 + Math.sin(performance.now() * 0.0005 + i) * 6;
      const py = ((i * 53) % h) * 0.72 + 28 + (i % 4) * 26;
      const pulse = 1 + Math.sin(performance.now() * 0.003 + i) * 0.12;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(178, 214, 255, 0.72)';
      ctx.beginPath();
      ctx.arc(px, py, (i % 3 === 0 ? 2.2 : 1.5) * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.16, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, fever > 0.08 ? `rgba(255, ${252 - fever * 32}, ${250 - fever * 52}, 1)` : '#fdfcff');
    grad.addColorStop(1, fever > 0.08 ? `rgba(${232 + fever * 10}, ${244 - fever * 18}, 255, 1)` : '#e8f4ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.fillStyle = i % 2 ? 'rgba(116, 228, 197, 0.12)' : 'rgba(108, 124, 255, 0.08)';
      ctx.arc((w / 6) * i + 40, 60 + (i % 2) * 30, 24 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (state.combo > 1 || state.comboPulse > 0.04) {
    const aura = Math.min(0.18, state.combo * 0.012 + state.comboPulse * 0.1);
    const comboGrad = ctx.createRadialGradient(w / 2, h * 0.55, 20, w / 2, h * 0.55, Math.max(w, h) * 0.7);
    comboGrad.addColorStop(0, state.mode === 'sketch' ? `rgba(144, 214, 255, ${aura})` : `rgba(255, 177, 108, ${aura})`);
    comboGrad.addColorStop(1, state.mode === 'sketch' ? 'rgba(144, 214, 255, 0)' : 'rgba(255, 177, 108, 0)');
    ctx.fillStyle = comboGrad;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.backgroundShift > 0.02) {
    const shift = Math.min(state.backgroundShift, 0.75);
    const shiftGrad = ctx.createLinearGradient(0, h, w, 0);
    if (state.mode === 'sketch') {
      shiftGrad.addColorStop(0, `rgba(133, 205, 255, ${shift * 0.11})`);
      shiftGrad.addColorStop(0.5, `rgba(180, 150, 255, ${shift * 0.1})`);
      shiftGrad.addColorStop(1, `rgba(255, 255, 255, ${shift * 0.06})`);
    } else {
      shiftGrad.addColorStop(0, `rgba(255, 112, 145, ${shift * 0.12})`);
      shiftGrad.addColorStop(0.5, `rgba(255, 190, 90, ${shift * 0.14})`);
      shiftGrad.addColorStop(1, `rgba(108, 124, 255, ${shift * 0.1})`);
    }
    ctx.fillStyle = shiftGrad;
    ctx.fillRect(0, 0, w, h);
  }

  if (fever > 0.08) {
    const feverGrad = ctx.createRadialGradient(w / 2, h * 0.48, 10, w / 2, h * 0.48, Math.max(w, h) * 0.9);
    if (state.mode === 'sketch') {
      feverGrad.addColorStop(0, `rgba(145, 210, 255, ${fever * 0.18})`);
      feverGrad.addColorStop(0.45, `rgba(165, 130, 255, ${fever * 0.1})`);
      feverGrad.addColorStop(1, 'rgba(110, 130, 255, 0)');
    } else {
      feverGrad.addColorStop(0, `rgba(255, 210, 120, ${fever * 0.18})`);
      feverGrad.addColorStop(0.45, `rgba(255, 120, 145, ${fever * 0.09})`);
      feverGrad.addColorStop(1, 'rgba(255, 120, 145, 0)');
    }
    ctx.fillStyle = feverGrad;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.flash > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(state.flash, 0.28)})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawTrails() {
  state.trails.forEach(item => {
    const alpha = (item.life / item.maxLife) * item.alpha;
    const grad = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.size);
    grad.addColorStop(0, `hsla(${item.hue} 95% 68% / ${alpha})`);
    grad.addColorStop(0.55, `hsla(${item.hue} 92% 60% / ${alpha * 0.45})`);
    grad.addColorStop(1, `hsla(${item.hue} 90% 56% / 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRibbons() {
  state.ribbons.forEach(item => {
    const alpha = Math.max(item.life / item.maxLife, 0) * 0.9;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `hsla(${item.hue} 92% 68% / ${alpha})`;
    ctx.lineWidth = item.width * (0.72 + alpha * 0.55);
    ctx.shadowColor = `hsla(${item.hue} 95% 75% / ${alpha})`;
    ctx.shadowBlur = 12 + alpha * 12;
    ctx.beginPath();
    ctx.moveTo(item.x1, item.y1);
    ctx.lineTo(item.x2, item.y2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawSketchTargets() {
  state.sketchTargets.forEach(target => {
    const pulse = 1 + Math.sin(target.twinkle) * 0.08;
    const alpha = 0.8 + Math.sin(target.twinkle * 1.6) * 0.12;
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(target.twinkle * 0.2);
    ctx.shadowColor = `hsla(${target.hue} 95% 75% / ${alpha})`;
    ctx.shadowBlur = 18;
    ctx.fillStyle = `hsla(${target.hue} 95% 72% / ${alpha})`;
    drawStarPath(target.r * 1.15 * pulse, target.r * 0.52 * pulse, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  });
}

function drawBubbles() {
  state.bubbles.forEach(b => {
    const pulse = 1 + Math.sin(b.wobble) * 0.05 + Math.min(state.combo, 14) * 0.004;
    const radius = b.r * pulse;
    const grad = ctx.createRadialGradient(b.x - radius * 0.3, b.y - radius * 0.35, 3, b.x, b.y, radius);
    grad.addColorStop(0, `hsla(${b.hue} 90% 95% / 0.95)`);
    grad.addColorStop(0.55, `hsla(${b.hue} 88% 78% / 0.65)`);
    grad.addColorStop(1, `hsla(${b.hue} 86% 66% / 0.28)`);
    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.58)';
    ctx.arc(b.x, b.y, radius - 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.arc(b.x - radius * 0.35, b.y - radius * 0.35, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawWorries() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  state.worries.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    const grad = ctx.createLinearGradient(-item.w / 2, -item.h / 2, item.w / 2, item.h / 2);
    grad.addColorStop(0, item.tone > 0.5 ? '#ffb5c9' : '#ffe2a8');
    grad.addColorStop(1, item.tone > 0.5 ? '#ff7aa2' : '#ffb36c');
    ctx.fillStyle = grad;
    roundRect(-item.w / 2, -item.h / 2, item.w, item.h, 18);
    ctx.fill();
    ctx.fillStyle = 'rgba(38,50,75,0.9)';
    ctx.font = '700 22px "Microsoft YaHei"';
    ctx.fillText(item.text, 0, 2);
    ctx.restore();
  });
}

function drawBlobs() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  state.blobs.forEach(blob => {
    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.scale(blob.stretchX, blob.stretchY);
    const grad = ctx.createLinearGradient(-blob.r, -blob.r, blob.r, blob.r);
    grad.addColorStop(0, `hsla(${blob.hue} 88% 78% / 1)`);
    grad.addColorStop(1, `hsla(${blob.hue + 26} 88% 62% / 1)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, blob.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-blob.r * 0.28, -blob.r * 0.32, blob.r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22304d';
    ctx.font = `${Math.floor(blob.r * 0.52)}px "Microsoft YaHei"`;
    ctx.fillText(blob.face, 0, 4);
    ctx.restore();
  });
}

function drawWoodfish() {
  const { x, y, width, height } = getWoodfishBounds();
  const s = state.woodfishScale;
  const glow = state.woodfishGlow;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.shadowColor = `rgba(255, 177, 92, ${0.28 + glow * 0.35})`;
  ctx.shadowBlur = 24 + glow * 26;

  const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  grad.addColorStop(0, '#c98a4d');
  grad.addColorStop(0.55, '#9f6530');
  grad.addColorStop(1, '#6b3f18');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(72, 38, 14, 0.55)';
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 217, 170, 0.28)';
  ctx.lineWidth = 6;
  ctx.ellipse(0, 0, width * 0.28, height * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 234, 205, 0.35)';
  ctx.lineWidth = 5;
  ctx.arc(-width * 0.12, -height * 0.08, width * 0.11, Math.PI * 1.1, Math.PI * 1.95);
  ctx.stroke();

  ctx.restore();

  ctx.save();
  ctx.translate(x + width * 0.33, y - height * 0.28);
  ctx.rotate(-0.4 + glow * 0.05);
  ctx.fillStyle = '#7a4b20';
  roundRect(-10, -85, 20, 96, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = '#d6a261';
  ctx.arc(0, -92, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(38,50,75,0.84)';
  ctx.font = '700 18px "Microsoft YaHei"';
  ctx.fillText(`木鱼已敲 ${state.woodfishHits} 下`, x, y + height * 0.95);
}

function drawParticles() {
  state.particles.forEach(p => {
    ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
    ctx.fillStyle = `hsl(${p.hue} 90% 60%)`;
    if (p.shape === 'spark') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size * 0.45, -p.size * 1.5, p.size * 0.9, p.size * 3);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

function drawRings() {
  state.rings.forEach(r => {
    ctx.globalAlpha = Math.max(r.life / r.maxLife, 0) * 0.9;
    ctx.lineWidth = Math.max(r.width, 1.5);
    ctx.strokeStyle = `hsl(${r.hue} 92% 62%)`;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

function drawHitTexts() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  state.hitTexts.forEach(item => {
    const alpha = Math.max(item.life / item.maxLife, 0);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${item.hue} 96% 58%)`;
    ctx.font = `900 ${item.size}px "Microsoft YaHei"`;
    ctx.fillText(item.text, item.x, item.y);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.strokeText(item.text, item.x, item.y);
  });
  ctx.globalAlpha = 1;
}

function drawPointerAura() {
  if (!state.pointer.down) return;
  ctx.beginPath();
  ctx.fillStyle = 'rgba(108,124,255,0.12)';
  ctx.arc(state.pointer.x, state.pointer.y, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawFeverHud() {
  if (state.combo < 10 && state.comboFever < 0.08) return;
  const w = canvas.clientWidth;
  const label = state.combo >= 15 ? 'FEVER' : 'HOT COMBO';
  const alpha = Math.min(0.9, 0.22 + state.comboFever * 0.45);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 38px Arial';
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.strokeStyle = `rgba(255,122,162,${alpha * 0.85})`;
  ctx.lineWidth = 8;
  ctx.strokeText(label, w / 2, 54);
  ctx.fillText(label, w / 2, 54);
  ctx.restore();
}

function drawTransitionOverlay() {
  if (state.transition < 0.02) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const alpha = Math.min(state.transition, 1) * 0.55;
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 34px "Microsoft YaHei"';
  ctx.fillStyle = `rgba(38,50,75,${alpha * 1.1})`;
  ctx.fillText(state.transitionLabel, w / 2, h / 2 - 8);
  ctx.font = '600 16px "Microsoft YaHei"';
  ctx.fillStyle = `rgba(38,50,75,${alpha * 0.85})`;
  ctx.fillText('切换模式中', w / 2, h / 2 + 26);
  ctx.restore();
}

function drawPauseOverlay() {
  if (!state.paused) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 26, 42, 0.28)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 40px "Microsoft YaHei"';
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fillText('已暂停', w / 2, h / 2 - 10);
  ctx.font = '600 16px "Microsoft YaHei"';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText('点“继续”或按 P 恢复', w / 2, h / 2 + 28);
  ctx.restore();
}

function getCameraOffset() {
  if (state.cameraKick < 0.02) return { x: 0, y: 0 };
  const amount = Math.min(state.cameraKick, 2.6);
  return {
    x: Math.sin(performance.now() * 0.06) * amount,
    y: Math.cos(performance.now() * 0.08) * amount * 0.7,
  };
}

function loop() {
  update();
  const camera = getCameraOffset();
  ctx.save();
  ctx.translate(camera.x, camera.y);
  drawBackground();
  drawTrails();
  if (state.mode === 'bubble') drawBubbles();
  else if (state.mode === 'worry') drawWorries();
  else if (state.mode === 'squish') drawBlobs();
  else if (state.mode === 'sketch') {
    drawRibbons();
    drawSketchTargets();
  }
  else drawWoodfish();
  drawParticles();
  drawRings();
  drawHitTexts();
  drawFeverHud();
  drawPointerAura();
  drawTransitionOverlay();
  drawPauseOverlay();
  ctx.restore();
  requestAnimationFrame(loop);
}

const savedSettings = loadSettings();
if (typeof savedSettings.audioEnabled === 'boolean') {
  state.audioEnabled = savedSettings.audioEnabled;
}
if (Array.isArray(savedSettings.visitedModes)) {
  state.visitedModes = new Set(savedSettings.visitedModes.filter(mode => modeMeta[mode]));
}
state.unlockedAchievements = new Set(loadAchievements());
state.runHistory = loadRunHistory();

state.bestScore = loadBestScore();
bestScoreEl.textContent = state.bestScore;
loadDailyChallenge();
renderAchievements();
renderRunHistory();
renderLeaderboard();
updateSoundButton();
updatePauseButton();
evaluateAchievements();

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (event.key === '1') resetRun('bubble');
  if (event.key === '2') resetRun('worry');
  if (event.key === '3') resetRun('squish');
  if (event.key === '4') resetRun('woodfish');
  if (event.key === '5') resetRun('sketch');
  if (event.key === 'Escape' && !summaryModal.classList.contains('hidden')) {
    closeSummary();
  }
  if (event.key.toLowerCase() === 'p') {
    togglePause();
  }
  if (event.key.toLowerCase() === 'm') {
    state.audioEnabled = !state.audioEnabled;
    updateSoundButton();
    saveSettings();
  }
  if (event.code === 'Space' && startScreen.classList.contains('hidden')) {
    event.preventDefault();
    calmBtn.click();
  }
});

setMode(modeMeta[savedSettings.mode] ? savedSettings.mode : 'bubble');
loop();
