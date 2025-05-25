// Game Configuration
const CONFIG = {
  modes: {
    easy: { size: 100, speed: 800, name: "Easy" },
    medium: { size: 70, speed: 700, name: "Medium" },
    hard: { size: 50, speed: 600, name: "Hard" },
    expert: { size: 30, speed: 500, name: "Expert" }
  },
  timers: [30, 60, 120, 300]
};

// Game State
const state = {
  score: 0,
  timeLeft: CONFIG.timers[0],
  isRunning: false,
  selectedTime: CONFIG.timers[0],
  currentMode: 'easy',
  intervals: { timer: null, movement: null }
};

// DOM Elements
const elements = {
  target: document.getElementById('target'),
  scoreDisplay: document.getElementById('score'),
  timeDisplay: document.getElementById('time'),
  highScoreDisplay: document.getElementById('high-score'),
  startBtn: document.getElementById('start-btn'),
  stopBtn: document.getElementById('stop-btn'),
  socialShare: document.getElementById('social-share'),
  timerButtons: document.querySelectorAll('.timer-btn'),
  modeButtons: document.querySelectorAll('.mode-btn')
};

// Initialize Game
function init() {
  loadHighScore();
  setupEventListeners();
}

// Game Logic
function startGame() {
  if (state.isRunning) return;
  
  resetGameState();
  state.isRunning = true;
  
  updateUI();
  setupTarget();
  startTimer();
  moveTarget();
}

function stopGame() {
  if (!state.isRunning) return;
  
  cleanupIntervals();
  state.isRunning = false;
  updateUI();
  elements.timeDisplay.textContent = state.selectedTime;
}

function endGame() {
  cleanupIntervals();
  updateHighScore();
  state.isRunning = false;
  updateUI();
  showShareOptions();
}

// Helper Functions
function loadHighScore() {
  elements.highScoreDisplay.textContent = localStorage.getItem('highScore') || 0;
}

function updateHighScore() {
  const currentHighScore = localStorage.getItem('highScore') || 0;
  if (state.score > currentHighScore) {
    localStorage.setItem('highScore', state.score);
    elements.highScoreDisplay.textContent = state.score;
  }
}

function resetGameState() {
  state.score = 0;
  state.timeLeft = state.selectedTime;
}

function cleanupIntervals() {
  clearInterval(state.intervals.timer);
  clearTimeout(state.intervals.movement);
  state.intervals.timer = null;
  state.intervals.movement = null;
}

function updateUI() {
  elements.scoreDisplay.textContent = state.score;
  elements.startBtn.disabled = state.isRunning;
  elements.stopBtn.disabled = !state.isRunning;
  elements.socialShare.style.display = 'none';
  elements.target.style.display = state.isRunning ? 'block' : 'none';
  
  const buttons = [...elements.timerButtons, ...elements.modeButtons];
  buttons.forEach(btn => btn.disabled = state.isRunning);
}

function showShareOptions() {
  elements.socialShare.style.display = 'block';
}

// Game Systems
function setupTarget() {
  const size = CONFIG.modes[state.currentMode].size;
  elements.target.style.width = `${size}px`;
  elements.target.style.height = `${size}px`;
}

function startTimer() {
  state.intervals.timer = setInterval(() => {
    state.timeLeft--;
    elements.timeDisplay.textContent = state.timeLeft;
    
    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

function moveTarget() {
  if (!state.isRunning) return;
  
  const container = document.querySelector('.game-container');
  const { size, speed } = CONFIG.modes[state.currentMode];
  const padding = 20;
  
  const maxX = container.offsetWidth - size - padding;
  const maxY = container.offsetHeight - size - padding;
  
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  
  elements.target.style.transition = `left ${speed}ms ease-out, top ${speed}ms ease-out`;
  elements.target.style.left = `${randomX}px`;
  elements.target.style.top = `${randomY}px`;
  elements.target.style.backgroundColor = getRandomColor();
  
  state.intervals.movement = setTimeout(moveTarget, speed);
}

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Event Handlers
function handleTargetClick() {
  if (!state.isRunning) return;
  
  state.score++;
  elements.scoreDisplay.textContent = state.score;
  
  // Visual feedback
  const scaleValues = { easy: 0.85, medium: 0.8, hard: 0.75, expert: 0.7 };
  elements.target.style.transform = `scale(${scaleValues[state.currentMode]})`;
  setTimeout(() => elements.target.style.transform = 'scale(1)', 100);
  
  // Immediate move in timed modes
  if (CONFIG.modes[state.currentMode].speed > 0) {
    clearTimeout(state.intervals.movement);
    moveTarget();
  }
}

function handleTimerSelect(e) {
  const buttons = e.currentTarget.parentElement.querySelectorAll('button');
  buttons.forEach(btn => btn.classList.remove('active'));
  e.currentTarget.classList.add('active');
  
  state.selectedTime = parseInt(e.currentTarget.dataset.time);
  elements.timeDisplay.textContent = state.selectedTime;
}

function handleModeSelect(e) {
  if (state.isRunning) return;
  
  const buttons = e.currentTarget.parentElement.querySelectorAll('button');
  buttons.forEach(btn => btn.classList.remove('active'));
  e.currentTarget.classList.add('active');
  
  state.currentMode = e.currentTarget.dataset.mode;
}

function handleShare(platform) {
  const text = `I scored ${state.score} clicks in ${state.selectedTime}s on ${CONFIG.modes[state.currentMode].name} mode! Try to beat me!`;
  const url = window.location.href;
  const shareUrl = platform === 'twitter' 
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  
  window.open(shareUrl, '_blank');
}

// Event Listeners
function setupEventListeners() {
  elements.startBtn.addEventListener('click', startGame);
  elements.stopBtn.addEventListener('click', stopGame);
  elements.target.addEventListener('click', handleTargetClick);
  
  elements.timerButtons.forEach(btn => {
    btn.addEventListener('click', handleTimerSelect);
  });
  
  elements.modeButtons.forEach(btn => {
    btn.addEventListener('click', handleModeSelect);
  });
  
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => handleShare(btn.classList.contains('twitter') ? 'twitter' : 'facebook'));
  });
}

// Initialize Game
window.addEventListener('DOMContentLoaded', init);