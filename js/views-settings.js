// StudyPilot - Settings

function renderSettings(container) {
  const p = appState.profile;
  const ts = appState.timerSettings;
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const isSchool = p.stage === "school";
  const needsStream = isSchool && classNumber(p.className) >= 11;

  container.innerHTML = `
    <div class="sp-page sp-page--tight">
      <div>
        <h2 class="sp-title">Settings</h2>
        <p class="sp-sub">Everything StudyPilot knows about you lives in this browser only.</p>
      </div>

      <section class="sp-card">
        <div class="sp-card-head"><h3 class="sp-card-title">Profile</h3></div>
        <div class="sp-form-grid">
          <div class="sp-field" style="grid-column:1/-1">
            <label class="sp-label" for="setting-name">Name</label>
            <input class="sp-input" id="setting-name" value="${attr(p.name)}">
          </div>
          <div class="sp-field" style="grid-column:1/-1">
            <label class="sp-label" for="setting-course">Class or course</label>
            <select class="sp-select" id="setting-course" onchange="settingSetCourse(this.value)">
              <optgroup label="School — class 5 to 12">
                ${SCHOOL_CLASSES.map(c => `<option value="school:${c}" ${isSchool && String(p.className) === c ? "selected" : ""}>Class ${c}</option>`).join("")}
              </optgroup>
              <optgroup label="Graduation">
                ${DEGREES.map(d => `<option value="college:${d.key}" ${!isSchool && p.degree === d.key ? "selected" : ""}>${esc(d.label)}</option>`).join("")}
              </optgroup>
            </select>
          </div>
          ${needsStream ? `
          <div class="sp-field" style="grid-column:1/-1">
            <label class="sp-label" for="setting-stream">Stream</label>
            <select class="sp-select" id="setting-stream" onchange="settingStreamChanged(this.value)">
              ${STREAMS.map(s => `<option value="${s.key}" ${p.stream === s.key ? "selected" : ""}>${esc(s.label)} — ${esc(s.detail)}</option>`).join("")}
            </select>
          </div>` : ""}
          ${!isSchool ? `
          <div class="sp-field">
            <label class="sp-label" for="setting-branch">Branch / specialisation</label>
            <select class="sp-select" id="setting-branch">
              ${BRANCHES.map(b => `<option value="${attr(b)}" ${p.branch === b ? "selected" : ""}>${esc(b)}</option>`).join("")}
            </select>
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-semester">Semester</label>
            <input class="sp-input" id="setting-semester" type="number" min="1" max="12" value="${p.semester || ""}">
          </div>` : ""}
          <div class="sp-field" style="grid-column:1/-1">
            <label class="sp-label" for="setting-college">${isSchool ? "School name" : "College or university"}</label>
            <input class="sp-input" id="setting-college" value="${attr(p.college)}" placeholder="Optional">
          </div>
        </div>
        <p class="sp-hint" style="margin-top:12px">Your subjects were picked during setup. Changing your class or course updates the label only — use <strong>Reset All Data</strong> below to rebuild the subjects for a new course.</p>
      </section>

      <section class="sp-card">
        <div class="sp-card-head"><h3 class="sp-card-title">Study goals</h3></div>
        <div class="sp-form-grid">
          <div class="sp-field">
            <label class="sp-label" for="setting-target">Daily target (hours)</label>
            <input class="sp-input" id="setting-target" type="number" step="0.5" min="0.5" max="16" value="${p.targetHoursPerDay}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-sessions">Sessions per day</label>
            <select class="sp-select" id="setting-sessions">
              ${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${p.sessionsPerDay === n ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-exam">Next exam date</label>
            <input class="sp-input" id="setting-exam" type="date" value="${p.examDate || ""}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-focusMinutes">Focus block (minutes)</label>
            <input class="sp-input" id="setting-focusMinutes" type="number" min="5" max="120" step="5" value="${ts.focusMinutes}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-shortBreakMinutes">Short break</label>
            <input class="sp-input" id="setting-shortBreakMinutes" type="number" min="1" max="30" value="${ts.shortBreakMinutes}">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="setting-longBreakMinutes">Long break</label>
            <input class="sp-input" id="setting-longBreakMinutes" type="number" min="1" max="60" value="${ts.longBreakMinutes}">
          </div>
        </div>

        <div style="margin-top:16px">
          <label class="sp-label">Study days</label>
          <div class="sp-wrap" style="margin-top:6px" id="setting-days">
            ${dayOrder.map(d => `
              <button class="sp-chip ${(p.studyDays || []).includes(d) ? "on" : ""}" data-day="${d}" onclick="this.classList.toggle('on')">${DAY_SHORT[d]}</button>
            `).join("")}
          </div>
        </div>

        <div class="sp-switch-row" style="margin-top:16px">
          <input id="setting-notifications" type="checkbox" ${ts.notifications ? "checked" : ""}>
          <label for="setting-notifications">Session reminders</label>
        </div>

        <div class="sp-row" style="margin-top:18px">
          <button class="sp-btn sp-btn--primary" onclick="saveSettings()">Save Profile</button>
          <span class="sp-hint">A new plan is generated for today when your goals change.</span>
        </div>
      </section>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Your subjects</h3>
            <p class="sp-card-desc">${esc(courseLabel(p))} — mastery and revision are tied to them</p>
          </div>
        </div>
        <div class="sp-wrap">
          ${appState.subjects.map(s => `<span class="sp-badge sp-badge--brand">${esc(s.name)}</span>`).join("") || `<span class="sp-muted">No subjects yet.</span>`}
        </div>
      </section>

      <section class="sp-card" style="border-color:#FECACA;background:var(--bad-soft)">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title" style="color:var(--bad-ink)">Start over</h3>
            <p class="sp-card-desc" style="color:#9F1239">Clears your subjects, plan, timetable, sessions and quiz history, then asks the setup questions again.</p>
          </div>
        </div>
        <button class="sp-btn sp-btn--danger" onclick="confirmReset()">Reset All Data</button>
      </section>
    </div>
  `;
}

function readSetting(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}

function captureSettingsForm() {
  const p = appState.profile;
  const name = readSetting("setting-name");
  const college = readSetting("setting-college");
  const branch = readSetting("setting-branch");
  const semester = readSetting("setting-semester");
  if (name && name.trim()) p.name = name.trim();
  if (college != null) p.college = college.trim();
  if (branch) p.branch = branch;
  if (semester) p.semester = parseInt(semester, 10) || p.semester;
}

function settingSetCourse(value) {
  captureSettingsForm();
  const parts = String(value || "").split(":");
  const stage = parts[0] === "college" ? "college" : "school";
  const p = appState.profile;
  p.stage = stage;
  if (stage === "school") {
    p.className = parts[1] || "10";
    if (classNumber(p.className) >= 11 && !p.stream) p.stream = "pcm";
    p.degree = "";
    p.semester = null;
  } else {
    p.degree = parts[1] || "btech";
    p.className = "";
    p.stream = "";
  }
  appState.save();
  renderSettings(document.getElementById("main-content"));
}

function settingStreamChanged(key) {
  captureSettingsForm();
  appState.profile.stream = key;
  appState.save();
  renderSettings(document.getElementById("main-content"));
}

function saveSettings() {
  captureSettingsForm();

  const p = appState.profile;
  const target = readSetting("setting-target");
  const sessions = readSetting("setting-sessions");
  const exam = readSetting("setting-exam");
  const focus = readSetting("setting-focusMinutes");
  const shortB = readSetting("setting-shortBreakMinutes");
  const longB = readSetting("setting-longBreakMinutes");
  const notif = document.getElementById("setting-notifications");

  if (target) p.targetHoursPerDay = Math.max(0.5, parseFloat(target) || p.targetHoursPerDay);
  if (sessions) p.sessionsPerDay = clamp(parseInt(sessions, 10) || 3, 1, 5);
  p.examDate = exam || null;
  if (focus) appState.timerSettings.focusMinutes = clamp(parseInt(focus, 10) || 25, 5, 120);
  if (shortB) appState.timerSettings.shortBreakMinutes = clamp(parseInt(shortB, 10) || 5, 1, 30);
  if (longB) appState.timerSettings.longBreakMinutes = clamp(parseInt(longB, 10) || 15, 1, 60);
  p.pomodoroMinutes = appState.timerSettings.focusMinutes;
  if (notif) appState.timerSettings.notifications = notif.checked;

  const days = [...document.querySelectorAll("#setting-days .sp-chip.on")].map(el => parseInt(el.dataset.day, 10));
  p.studyDays = days.length ? days.sort() : [1, 2, 3, 4, 5];

  appState.regenerateTodayPlan();
  appState.save();

  timerState.ready = false;
  timerState.remaining = appState.timerSettings.focusMinutes * 60;

  renderShell();
  navigateTo("settings");
  showToast("Settings saved.");
}

function confirmReset() {
  showModal(
    "Reset everything?",
    `<p class="sp-muted" style="line-height:1.6">This deletes your subjects, plan, timetable, focus log and quiz history, then restarts the setup questions. It cannot be undone.</p>`,
    `<button class="sp-btn sp-btn--outline" onclick="closeModal()">Cancel</button>
     <button class="sp-btn sp-btn--danger" onclick="resetEverything()">Reset</button>`
  );
}

function resetEverything() {
  closeModal();
  appState.resetAll();
  timerState.ready = false;
  timerState.active = false;
  quizState.active = false;
  quizState.finished = false;
  ttDay = null;
  freshDraft();
  renderOnboarding();
  showToast("Everything cleared. Let's set up again.", "info");
}
