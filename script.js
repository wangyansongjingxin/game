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

const state = {
  mode: 'bubble',
  score: 0,
  combo: 0,
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
  transition: 0,
  transitionLabel: '',
  comboFever: 0,
  comboFeverActive: false,
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
  woodfish: '电子木鱼，专治脑子嗡嗡响。点一下敲一下，给心情一个有节奏的出口。'
};

const worryTexts = ['加班', '堵车', '催回复', '改需求', '早起', '开会', 'KPI', '已读不回', 'bug', '内耗'];
const blobFaces = ['•ᴗ•', '◕‿◕', '╹◡╹', '•ω•', '˶ᵔ ᵕ ᵔ˶'];
const woodfishLines = ['功德+1', '烦恼-1', '别急，先敲一下', '脑壳降温中', '今日心平气和+1'];
const STORAGE_KEY = 'relax-room-best-score-v1';

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
function playWoodfish() {
  beep({ freq: 220, type: 'sine', duration: 0.16, gain: 0.04, slideTo: 190 });
  setTimeout(() => beep({ freq: 440, type: 'triangle', duration: 0.12, gain: 0.018, slideTo: 320 }), 40);
}

function updateSoundButton() {
  soundBtn.textContent = state.audioEnabled ? '🔊 音效开' : '🔇 音效关';
  soundBtn.classList.toggle('off', !state.audioEnabled);
}

function loadBestScore() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return Number.isFinite(saved) ? saved : 0;
  } catch {
    return 0;
  }
}

function updateBestScore() {
  if (state.score <= state.bestScore) return;
  state.bestScore = state.score;
  bestScoreEl.textContent = state.bestScore;
  try {
    localStorage.setItem(STORAGE_KEY, String(state.bestScore));
  } catch {}
  showToast('新的本地最高分！');
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

function setMode(mode) {
  state.mode = mode;
  state.bubbles = [];
  state.worries = [];
  state.blobs = [];
  state.particles = [];
  state.rings = [];
  state.hitTexts = [];
  state.trails = [];
  state.dragBlobId = null;
  state.lastSpawnAt = 0;
  startTransition({ bubble: '气泡狂点', worry: '烦恼粉碎机', squish: '拖拽果冻', woodfish: '电子木鱼' }[mode]);

  const tips = {
    bubble: '点击气泡试试手感',
    worry: '把烦恼一个个点碎',
    squish: '按住果冻拖来拖去',
    woodfish: '专心敲木鱼，别想工作'
  };
  overlayTipEl.textContent = tips[mode];
  modeDescriptionEl.textContent = modeDescriptions[mode];
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  calmTextEl.textContent = {
    bubble: '乱点一会儿也没关系，手先动起来。',
    worry: '把看得见的烦恼先清掉，脑子会轻一点。',
    squish: '不是所有情绪都要讲清楚，有时候甩两下就够了。',
    woodfish: '先让节奏慢下来，别急着和世界较劲。'
  }[mode];

  for (let i = 0; i < 8; i++) {
    if (mode === 'bubble') spawnBubble();
    if (mode === 'worry') spawnWorry();
  }
  if (mode === 'squish') for (let i = 0; i < 5; i++) spawnBlob();
}

function hideStartScreen() {
  startScreen.classList.add('hidden');
}

modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
startBtn.addEventListener('click', () => {
  hideStartScreen();
  playCalmChime();
  setMode('bubble');
});
startWoodfishBtn.addEventListener('click', () => {
  hideStartScreen();
  playCalmChime();
  setMode('woodfish');
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
});

canvas.addEventListener('pointerdown', (event) => {
  state.pointer.down = true;
  Object.assign(state.pointer, pointerPos(event));
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
    }
  }
}

function update() {
  const now = performance.now();
  if (state.combo > 0 && now - state.lastHitAt > 1200) {
    state.combo = 0;
    comboEl.textContent = '0';
    state.comboFeverActive = false;
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
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  const fever = Math.min(state.comboFever, 1);
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

  if (state.combo > 1 || state.comboPulse > 0.04) {
    const aura = Math.min(0.18, state.combo * 0.012 + state.comboPulse * 0.1);
    const comboGrad = ctx.createRadialGradient(w / 2, h * 0.55, 20, w / 2, h * 0.55, Math.max(w, h) * 0.7);
    comboGrad.addColorStop(0, `rgba(255, 177, 108, ${aura})`);
    comboGrad.addColorStop(1, 'rgba(255, 177, 108, 0)');
    ctx.fillStyle = comboGrad;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.backgroundShift > 0.02) {
    const shift = Math.min(state.backgroundShift, 0.75);
    const hotGrad = ctx.createLinearGradient(0, h, w, 0);
    hotGrad.addColorStop(0, `rgba(255, 112, 145, ${shift * 0.12})`);
    hotGrad.addColorStop(0.5, `rgba(255, 190, 90, ${shift * 0.14})`);
    hotGrad.addColorStop(1, `rgba(108, 124, 255, ${shift * 0.1})`);
    ctx.fillStyle = hotGrad;
    ctx.fillRect(0, 0, w, h);
  }

  if (fever > 0.08) {
    const feverGrad = ctx.createRadialGradient(w / 2, h * 0.48, 10, w / 2, h * 0.48, Math.max(w, h) * 0.9);
    feverGrad.addColorStop(0, `rgba(255, 210, 120, ${fever * 0.18})`);
    feverGrad.addColorStop(0.45, `rgba(255, 120, 145, ${fever * 0.09})`);
    feverGrad.addColorStop(1, 'rgba(255, 120, 145, 0)');
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
  else drawWoodfish();
  drawParticles();
  drawRings();
  drawHitTexts();
  drawFeverHud();
  drawPointerAura();
  drawTransitionOverlay();
  ctx.restore();
  requestAnimationFrame(loop);
}

state.bestScore = loadBestScore();
bestScoreEl.textContent = state.bestScore;

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (event.key === '1') setMode('bubble');
  if (event.key === '2') setMode('worry');
  if (event.key === '3') setMode('squish');
  if (event.key === '4') setMode('woodfish');
  if (event.key.toLowerCase() === 'm') {
    state.audioEnabled = !state.audioEnabled;
    updateSoundButton();
  }
  if (event.code === 'Space' && startScreen.classList.contains('hidden')) {
    event.preventDefault();
    calmBtn.click();
  }
});

setMode('bubble');
loop();
