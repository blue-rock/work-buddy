// ============ POMODORO TIMER ============

let timerInterval = null;
let isRunning = false;
let isBreak = false;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let sessionsCompleted = 0;
let linkedTaskId = null;
const TOTAL_SESSIONS = 4;
const circumference = 2 * Math.PI * 88;

// ---- Persist timer state ----
function saveTimerState() {
  localStorage.setItem('timerState', JSON.stringify({
    timeLeft,
    totalTime,
    isBreak,
    isRunning,
    sessionsCompleted,
    linkedTaskId,
    // Store the wall-clock time so we can calculate elapsed time on reload
    savedAt: Date.now()
  }));
}

function loadTimerState() {
  const saved = localStorage.getItem('timerState');
  if (!saved) return;

  const s = JSON.parse(saved);
  isBreak = s.isBreak || false;
  sessionsCompleted = s.sessionsCompleted || 0;
  totalTime = s.totalTime || 25 * 60;
  linkedTaskId = s.linkedTaskId || null;

  if (s.isRunning && s.savedAt) {
    // Timer was running — subtract elapsed seconds since save
    const elapsedSec = Math.floor((Date.now() - s.savedAt) / 1000);
    timeLeft = s.timeLeft - elapsedSec;

    if (timeLeft <= 0) {
      // Session finished while page was closed
      if (!isBreak && linkedTaskId) {
        const task = todos.find(t => t.id === linkedTaskId);
        if (task) {
          task.pomodoros = (task.pomodoros || 0) + 1;
          saveTodos();
        }
      }
      playNotification();
      switchPhase();
    } else {
      // Resume the timer
      updateTimerLabel();
      updateTimerDisplay();
      startTimer();
    }
  } else {
    // Timer was paused — just restore the position
    timeLeft = s.timeLeft || totalTime;
    updateTimerLabel();
    updateTimerDisplay();
  }
}

function updateTimerLabel() {
  if (isBreak) {
    const isLongBreak = sessionsCompleted > 0 && sessionsCompleted % TOTAL_SESSIONS === 0;
    document.getElementById('timerLabel').textContent = isLongBreak ? 'Long Break' : 'Short Break';
  } else {
    document.getElementById('timerLabel').textContent = 'Work Session';
  }
}

function loadSettings() {
  const saved = localStorage.getItem('pomodoroSettings');
  if (saved) {
    const s = JSON.parse(saved);
    document.getElementById('workMin').value = s.work || 25;
    document.getElementById('breakMin').value = s.break || 5;
    document.getElementById('longBreakMin').value = s.longBreak || 15;
  }
  // Don't call updateSettings() here — loadTimerState will handle restoring
}

function updateSettings() {
  const work = parseInt(document.getElementById('workMin').value) || 25;
  const brk = parseInt(document.getElementById('breakMin').value) || 5;
  const longBrk = parseInt(document.getElementById('longBreakMin').value) || 15;
  localStorage.setItem('pomodoroSettings', JSON.stringify({ work, break: brk, longBreak: longBrk }));

  if (!isRunning) {
    if (!isBreak) {
      totalTime = work * 60;
      timeLeft = totalTime;
    }
    saveTimerState();
    updateTimerDisplay();
  }
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = document.getElementById('timerDisplay');
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress = 1 - (timeLeft / totalTime);
  const offset = circumference * (1 - progress);
  const ring = document.getElementById('progressRing');
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;

  if (isBreak) {
    display.classList.add('break-active');
    ring.classList.add('break-active');
    document.getElementById('bgGlow').classList.add('break-mode');
  } else {
    display.classList.remove('break-active');
    ring.classList.remove('break-active');
    document.getElementById('bgGlow').classList.remove('break-mode');
  }

  document.title = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} - Focus Flow`;

  // Show linked task name
  const linkedEl = document.getElementById('timerLinkedTask');
  if (linkedTaskId) {
    const task = todos.find(t => t.id === linkedTaskId);
    if (task) {
      linkedEl.textContent = task.text;
      linkedEl.style.display = 'block';
    } else {
      linkedEl.style.display = 'none';
      linkedTaskId = null;
    }
  } else {
    linkedEl.style.display = 'none';
  }

  renderSessionDots();
}

function toggleTimer() {
  if (isRunning) pauseTimer();
  else startTimer();
}

function startTimer() {
  isRunning = true;
  document.getElementById('startBtn').textContent = 'Pause';
  saveTimerState();
  timerInterval = setInterval(() => {
    timeLeft--;
    saveTimerState();
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      // Increment pomodoro count for linked task
      if (!isBreak && linkedTaskId) {
        const task = todos.find(t => t.id === linkedTaskId);
        if (task) {
          task.pomodoros = (task.pomodoros || 0) + 1;
          saveTodos();
          renderTodos();
        }
      }
      playNotification();
      switchPhase();
      return;
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  document.getElementById('startBtn').textContent = 'Start';
  saveTimerState();
}

function resetTimer() {
  pauseTimer();
  isBreak = false;
  const work = parseInt(document.getElementById('workMin').value) || 25;
  totalTime = work * 60;
  timeLeft = totalTime;
  document.getElementById('timerLabel').textContent = 'Work Session';
  saveTimerState();
  updateTimerDisplay();
}

function skipPhase() {
  clearInterval(timerInterval);
  isRunning = false;
  switchPhase();
}

function switchPhase() {
  if (!isBreak) {
    sessionsCompleted++;
    const isLongBreak = sessionsCompleted % TOTAL_SESSIONS === 0;
    isBreak = true;
    const breakTime = isLongBreak
      ? parseInt(document.getElementById('longBreakMin').value) || 15
      : parseInt(document.getElementById('breakMin').value) || 5;
    totalTime = breakTime * 60;
    timeLeft = totalTime;
    document.getElementById('timerLabel').textContent = isLongBreak ? 'Long Break' : 'Short Break';
  } else {
    isBreak = false;
    const work = parseInt(document.getElementById('workMin').value) || 25;
    totalTime = work * 60;
    timeLeft = totalTime;
    document.getElementById('timerLabel').textContent = 'Work Session';
  }
  document.getElementById('startBtn').textContent = 'Start';
  isRunning = false;
  saveTimerState();
  updateTimerDisplay();
}

function renderSessionDots() {
  const container = document.getElementById('sessionDots');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_SESSIONS; i++) {
    const dot = document.createElement('div');
    dot.className = 'session-dot' + (i < (sessionsCompleted % TOTAL_SESSIONS) ? ' completed' : '');
    container.appendChild(dot);
  }
}

function linkTaskToTimer(taskId) {
  if (linkedTaskId === taskId) {
    linkedTaskId = null;
  } else {
    linkedTaskId = taskId;
  }
  saveTimerState();
  updateTimerDisplay();
  renderTodos();
}

function playNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.5);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.5);
    });
  } catch (e) {}

  if (Notification.permission === 'granted') {
    new Notification('Focus Flow', {
      body: isBreak ? 'Break is over! Time to focus.' : 'Great work! Time for a break.',
    });
  }
}

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
