// StudyPilot - Focus Timer (Pomodoro)

const timerState = {
  mode: "focus",
  running: false,
  remaining: 25 * 60,
  interval: null,
  zen: false,
  ready: false,
  subjectId: ""
};

function timerModeList() {
  const ts = appState.timerSettings || {};
  return [
    { id: "focus", label: "Focus", minutes: ts.focusMinutes || 25 },
    { id: "shortBreak", label: "Short break", minutes: ts.shortBreakMinutes || 5 },
    { id: "longBreak", label: "Long break", minutes: ts.longBreakMinutes || 15 }
  ];
}

function timerModeMinutes(mode) {
  const found = timerModeList().find(m => m.id === mode);
  return found ? found.minutes : 25;
}

function renderFocusTimer(container) {
  if (!timerState.ready) {
    timerState.remaining = timerModeMinutes(timerState.mode) * 60;
    timerState.ready = true;
  }
  if (timerState.running && !timerState.interval) startTick();

  const modes = timerModeList();
  const activeMode = modes.find(m => m.id === timerState.mode) || modes[0];
  const total = Math.max(1, activeMode.minutes * 60);
  const mins = Math.floor(timerState.remaining / 60);
  const secs = timerState.remaining % 60;
  const fraction = clamp(timerState.remaining / total, 0, 1);
  const circumference = 691;
  const todayMinutes = Math.round(appState.hoursToday() * 60);

  container.innerHTML = `
    <div class="sp-page sp-page--narrow" style="align-items:center;text-align:center">
      <div style="width:100%">
        <h2 class="sp-title">Focus timer</h2>
        <p class="sp-sub">${appState.profile.pomodoroMinutes}-minute blocks, built for deep work.</p>
      </div>

      <div class="timer-tabs">
        ${modes.map(m => `
          <button class="timer-tab ${timerState.mode === m.id ? "on" : ""}" onclick="timerSetMode('${m.id}')">
            ${m.label} · ${m.minutes}m
          </button>
        `).join("")}
      </div>

      <div class="timer-face">
        <svg viewBox="0 0 240 240">
          <circle class="timer-track" cx="120" cy="120" r="110"></circle>
          <circle class="timer-fill" cx="120" cy="120" r="110"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference * (1 - fraction)}"></circle>
        </svg>
        <div>
          <div class="timer-time" id="timer-display">${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}</div>
          <div class="timer-mode">${timerState.running ? "In progress" : timerState.remaining === 0 ? "Complete" : activeMode.label}</div>
        </div>
      </div>

      ${appState.subjects.length ? `
        <div style="margin-bottom:18px">
          <select class="sp-select" id="timer-subject" onchange="timerState.subjectId=this.value" style="max-width:280px;margin:0 auto">
            <option value="">Log to: no specific subject</option>
            ${appState.subjects.map(s => `<option value="${s.id}" ${timerState.subjectId === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}
          </select>
        </div>
      ` : ""}

      <div class="sp-wrap" style="justify-content:center;margin-bottom:10px">
        <button class="sp-btn sp-btn--primary" style="padding:13px 32px" onclick="timerToggle()">
          ${icon("play", 16)} ${timerState.running ? "Pause" : "Start"}
        </button>
        <button class="sp-btn sp-btn--outline" style="padding:13px 22px" onclick="timerReset()">Reset</button>
      </div>
      <div class="sp-wrap" style="justify-content:center">
        <button class="sp-btn sp-btn--ghost sp-btn--sm" onclick="timerToggleZen()">${timerState.zen ? "Exit Zen" : "Zen Mode"}</button>
        <button class="sp-btn sp-btn--ghost sp-btn--sm" onclick="navigateTo('analytics')">View stats</button>
      </div>

      <div class="sp-grid sp-grid--2" style="width:100%;margin-top:22px">
        <div class="sp-stat" style="align-items:center">
          <span class="sp-stat-label">Focused today</span>
          <div class="sp-stat-value">${Math.floor(todayMinutes / 60)}<small>h ${todayMinutes % 60}m</small></div>
        </div>
        <div class="sp-stat" style="align-items:center">
          <span class="sp-stat-label">Streak</span>
          <div class="sp-stat-value">${appState.studyStreak()}<small> days</small></div>
        </div>
      </div>
    </div>
    <div id="timer-zen-overlay"></div>
  `;

  if (timerState.zen) openZen();
}

function startTick() {
  if (timerState.interval) clearInterval(timerState.interval);
  timerState.interval = setInterval(() => {
    if (!timerState.running) return;
    timerState.remaining--;
    if (timerState.remaining <= 0) {
      timerState.remaining = 0;
      timerState.running = false;
      clearInterval(timerState.interval);
      timerState.interval = null;
      onSessionComplete();
      renderFocusTimer(document.getElementById("main-content"));
      return;
    }
    updateDisplay();
  }, 1000);
}

function updateDisplay() {
  const mins = Math.floor(timerState.remaining / 60);
  const secs = timerState.remaining % 60;
  const text = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  const main = document.getElementById("timer-display");
  if (main) main.textContent = text;
  const zenTime = document.querySelector("#timer-zen-overlay .zen-time");
  if (zenTime) zenTime.textContent = text;
}

function timerToggle() {
  timerState.running = !timerState.running;
  if (timerState.running) startTick();
  else if (timerState.interval) { clearInterval(timerState.interval); timerState.interval = null; }
  renderFocusTimer(document.getElementById("main-content"));
}

function timerReset() {
  if (timerState.interval) { clearInterval(timerState.interval); timerState.interval = null; }
  timerState.running = false;
  timerState.remaining = timerModeMinutes(timerState.mode) * 60;
  renderFocusTimer(document.getElementById("main-content"));
}

function timerSetMode(mode) {
  if (timerState.interval) { clearInterval(timerState.interval); timerState.interval = null; }
  timerState.running = false;
  timerState.mode = mode;
  timerState.remaining = timerModeMinutes(mode) * 60;
  timerState.zen = false;
  renderFocusTimer(document.getElementById("main-content"));
}

function onSessionComplete() {
  if (timerState.mode !== "focus") {
    showToast("Break over — ready to focus?", "info");
    return;
  }
  const minutes = timerModeMinutes("focus");
  const select = document.getElementById("timer-subject");
  const subjectId = (select && select.value) || timerState.subjectId || "";
  appState.logFocusSession(minutes, subjectId);
  showToast(`${minutes} minutes logged. Streak is now ${appState.studyStreak()} days.`);
}

function timerToggleZen() {
  timerState.zen = !timerState.zen;
  if (timerState.zen) openZen();
  else closeZen();
  renderFocusTimer(document.getElementById("main-content"));
}

function closeZen() {
  const overlay = document.getElementById("timer-zen-overlay");
  if (overlay) { overlay.className = ""; overlay.innerHTML = ""; }
  document.body.style.overflow = "";
}

function openZen() {
  const overlay = document.getElementById("timer-zen-overlay");
  if (!overlay) return;
  const activeMode = timerModeList().find(m => m.id === timerState.mode) || timerModeList()[0];
  const mins = Math.floor(timerState.remaining / 60);
  const secs = timerState.remaining % 60;
  overlay.className = "zen-active";
  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px">
      <span style="font-size:0.72rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(199,210,254,0.75)">${activeMode.label} session</span>
      <div class="zen-time" style="margin:8px 0 26px">${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}</div>
      <div class="sp-wrap" style="justify-content:center">
        <button class="sp-btn sp-btn--white" style="padding:13px 30px" onclick="timerToggle()">${timerState.running ? "Pause" : "Start"}</button>
        <button class="sp-btn sp-btn--on-dark" style="padding:13px 24px" onclick="timerToggleZen()">Exit Zen</button>
      </div>
    </div>
  `;
  document.body.style.overflow = "hidden";
}

// Pause and close zen when moving to another view
const _navigateTo = window.navigateTo;
window.navigateTo = function (navId) {
  if (timerState.interval) { clearInterval(timerState.interval); timerState.interval = null; }
  timerState.running = false;
  timerState.zen = false;
  const overlay = document.getElementById("timer-zen-overlay");
  if (overlay) { overlay.className = ""; overlay.innerHTML = ""; }
  document.body.style.overflow = "";
  _navigateTo(navId);
};
