// StudyPilot - Dashboard

// ---- shared section helpers (used by every view) ------------------------

function emptyState(iconName, title, text, actionsHtml = "") {
  return `
    <div class="sp-empty">
      <div class="sp-empty-icon">${icon(iconName, 24)}</div>
      <h4>${esc(title)}</h4>
      <p>${text}</p>
      ${actionsHtml ? `<div class="sp-empty-actions">${actionsHtml}</div>` : ""}
    </div>
  `;
}

function progressBar(percent, tone = "") {
  const p = clamp(Math.round(percent) || 0, 0, 100);
  return `<div class="sp-progress ${tone}"><div style="width:${p}%"></div></div>`;
}

function statTile(label, value, note, barPercent) {
  return `
    <div class="sp-stat">
      <span class="sp-stat-label">${esc(label)}</span>
      <div class="sp-stat-value">${value}</div>
      ${barPercent != null ? progressBar(barPercent) : ""}
      <span class="sp-stat-note">${note}</span>
    </div>
  `;
}

function urgencyBadge(percent) {
  if (percent >= 80) return `<span class="sp-badge sp-badge--ok">Mastered</span>`;
  if (percent >= 55) return `<span class="sp-badge sp-badge--brand">On track</span>`;
  if (percent >= 30) return `<span class="sp-badge sp-badge--warn">Needs work</span>`;
  return `<span class="sp-badge sp-badge--bad">Weak</span>`;
}

// ---- dashboard ----------------------------------------------------------

function renderDashboard(container) {
  appState.ensureTodayPlan();
  const p = appState.profile;
  const progress = appState.calculateOverallProgress();
  const hoursToday = appState.hoursToday();
  const target = p.targetHoursPerDay || 3;
  const streak = appState.studyStreak();
  const due = appState.dueRevisionCount();
  const days = appState.daysToExam();
  const sessions = appState.todaySessions;
  const pending = sessions.filter(s => !s.completed).length;
  const todaySlots = appState.todayTimetable();

  const examChip = days == null
    ? "No deadline set"
    : days === 0 ? "Exam is today" : days + " day" + (days === 1 ? "" : "s") + " to exam";

  container.innerHTML = `
    <div class="sp-page">
      <section class="sp-hero">
        <div>
          <div class="sp-hero-chips">
            <span class="hero-chip">${esc(studentLine(p))}</span>
            ${p.college ? `<span class="hero-chip">${esc(p.college)}</span>` : ""}
            <span class="hero-chip">${esc(examChip)}</span>
          </div>
          <h1>${greeting()}, ${esc(firstName())}</h1>
          <p>${pending > 0
            ? `You have <strong>${pending}</strong> session${pending === 1 ? "" : "s"} left today — about ${Math.round(pending * appState.sessionMinutes() / 6) / 10} hours of focused work.`
            : sessions.length
              ? "Every session for today is done. Anything you do now is a bonus."
              : "Nothing is scheduled yet today. Build a session block and start with your weakest subject."}</p>
          <div class="sp-hero-actions">
            <button class="sp-btn sp-btn--white" onclick="navigateTo('timer')">${icon("play", 15)} Start focus session</button>
            <button class="sp-btn sp-btn--on-dark" onclick="navigateTo('quiz')">Practice quiz</button>
          </div>
        </div>
        <div class="sp-ring">
          <svg viewBox="0 0 120 120">
            <circle class="sp-ring-track" cx="60" cy="60" r="52"></circle>
            <circle class="sp-ring-fill" cx="60" cy="60" r="52"
              stroke-dasharray="327" stroke-dashoffset="${327 - (327 * clamp(progress, 0, 100)) / 100}"></circle>
          </svg>
          <div class="sp-ring-label">
            <strong>${progress}%</strong>
            <span>syllabus</span>
          </div>
        </div>
      </section>

      <div class="sp-grid sp-grid--4">
        ${statTile("Syllabus progress", `${progress}<small>%</small>`, `${appState.subjects.length} subject${appState.subjects.length === 1 ? "" : "s"} tracked`, progress)}
        ${statTile("Focus today", `${hoursToday}<small>h / ${target}h</small>`, `${Math.round((hoursToday / target) * 100)}% of your daily target`, (hoursToday / target) * 100)}
        ${statTile("Study streak", `${streak}<small> day${streak === 1 ? "" : "s"}</small>`, streak ? "Keep the chain alive" : "Complete a session to start", null)}
        ${statTile("Revisions due", `${due}<small> card${due === 1 ? "" : "s"}</small>`, due ? "Spaced repetition queue" : "Nothing due right now", null)}
      </div>

      <div class="sp-cols">
        <div class="sp-stack">
          <section class="sp-card">
            <div class="sp-card-head">
              <div>
                <h3 class="sp-card-title">Today's study plan</h3>
                <p class="sp-card-desc">Built around your ${p.sessionsPerDay} daily session${p.sessionsPerDay === 1 ? "" : "s"}, weakest subjects first</p>
              </div>
              <button class="sp-link" onclick="navigateTo('plan')">Open plan →</button>
            </div>
            ${sessions.length
              ? `<div class="sp-list">${sessions.map(sessionRow).join("")}</div>`
              : emptyState("calendar", "No sessions today",
                  "Your plan covers " + (p.studyDays || []).length + " study days a week. Build today's block to get started.",
                  `<button class="sp-btn sp-btn--primary sp-btn--sm" onclick="regeneratePlanFromDashboard()">Build today's plan</button>`)}
          </section>

          <section class="sp-card">
            <div class="sp-card-head">
              <div>
                <h3 class="sp-card-title">Subject progress</h3>
                <p class="sp-card-desc">Mastery across the units in your syllabus</p>
              </div>
              <button class="sp-link" onclick="navigateTo('syllabus')">Manage →</button>
            </div>
            ${appState.subjects.length
              ? appState.subjects.map(sub => {
                  const prog = appState.calculateSubjectProgress(sub.id);
                  return `
                    <div style="margin-bottom:13px">
                      <div class="sp-between" style="margin-bottom:5px">
                        <span class="sp-row" style="gap:8px;min-width:0">
                          <span class="sp-dot" style="background:${sub.color}"></span>
                          <span style="font-size:0.8rem;font-weight:600;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub.name)}</span>
                        </span>
                        <span class="sp-tiny sp-num" style="font-weight:600">${prog}%</span>
                      </div>
                      ${progressBar(prog)}
                    </div>
                  `;
                }).join("")
              : emptyState("book", "No subjects yet", "Add subjects in settings to start tracking your syllabus.")}
          </section>
        </div>

        <div class="sp-stack">
          ${todaySlots.length ? `
          <section class="sp-card">
            <div class="sp-card-head">
              <div>
                <h3 class="sp-card-title">Today's timetable</h3>
                <p class="sp-card-desc">${todaySlots.length} slot${todaySlots.length === 1 ? "" : "s"} from your own routine</p>
              </div>
              <button class="sp-link" onclick="navigateTo('timetable')">Edit →</button>
            </div>
            <div class="sp-list">
              ${todaySlots.map(slot => `
                <div class="sp-row-item">
                  <div class="row-main">
                    <div class="row-mark">${esc(ttShortClock(slot.start))}</div>
                    <div class="row-body">
                      <div class="row-title">${esc(ttSlotTitle(slot))}</div>
                      <div class="row-meta">
                        <span>${esc(ttClock(slot.start))} – ${esc(ttClock(slot.end))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </section>` : ""}

          <section class="sp-card sp-card--dark">
            <div class="sp-between" style="margin-bottom:16px">
              <span class="sp-eyebrow" style="color:rgba(199,210,254,0.9)">Pomodoro focus</span>
              <span class="sp-badge" style="background:rgba(255,255,255,0.16);color:#fff;border-color:rgba(255,255,255,0.2)">${p.pomodoroMinutes} min</span>
            </div>
            <div style="text-align:center;padding:14px 0 20px">
              <div class="sp-num" style="font-size:2.9rem;font-weight:700;letter-spacing:-0.04em;line-height:1">${p.pomodoroMinutes}:00</div>
              <p style="font-size:0.74rem;color:rgba(199,210,254,0.8);margin-top:6px">One block of deep work</p>
            </div>
            <button class="sp-btn sp-btn--white sp-btn--block" onclick="navigateTo('timer')">${icon("play", 15)} Open focus timer</button>
          </section>

          <section class="sp-card">
            <div class="sp-card-head">
              <div>
                <h3 class="sp-card-title">Insights</h3>
                <p class="sp-card-desc">From your confidence check and progress</p>
              </div>
            </div>
            ${appState.recommendations.length
              ? `<div class="sp-stack" style="gap:10px">${appState.recommendations.map(rec => `
                  <div style="padding:12px 14px;border-radius:var(--r-md);background:var(--brand-soft);border:1px solid var(--brand-line)">
                    <span class="sp-eyebrow" style="color:var(--brand-ink)">${esc(rec.tag)}</span>
                    <h4 style="font-size:0.83rem;font-weight:700;color:var(--ink);margin:3px 0 3px">${esc(rec.title)}</h4>
                    <p style="font-size:0.75rem;color:var(--muted);line-height:1.55">${esc(rec.description)}</p>
                    ${rec.actionType ? `<button class="sp-link" style="margin-top:6px" onclick="runRecommendation('${rec.actionType}')">${esc(rec.actionText || "Open")} →</button>` : ""}
                  </div>
                `).join("")}</div>`
              : `<p class="sp-muted">Insights appear as you study.</p>`}
          </section>
        </div>
      </div>
    </div>
  `;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function sessionRow(sess) {
  const done = sess.completed;
  const timeLabel = (sess.time || "").replace(/\s?(AM|PM)$/i, "");
  return `
    <div class="sp-row-item ${done ? "is-done" : ""}">
      <div class="row-main">
        <div class="row-mark ${done ? "is-done" : ""}">${done ? "✓" : esc(timeLabel)}</div>
        <div class="row-body">
          <div class="row-title">${esc(sess.title || sess.subjectName)}</div>
          <div class="row-meta">
            <span>${esc(sess.time || "")}</span>
            <span class="row-sep">•</span>
            <span>${sess.durationMinutes} min</span>
            <span class="row-sep">•</span>
            <span>${esc(sess.type || "Study")}</span>
          </div>
        </div>
      </div>
      ${done
        ? `<span class="sp-badge sp-badge--ok">Done</span>`
        : `<button class="sp-btn sp-btn--outline sp-btn--sm" onclick="completeDashSession('${sess.id}')">Mark done</button>`}
    </div>
  `;
}

function completeDashSession(id) {
  appState.completeSession(id);
  showToast("Session logged. Nice work.");
  renderDashboard(document.getElementById("main-content"));
}

function regeneratePlanFromDashboard() {
  appState.regenerateTodayPlan();
  showToast("Plan built for today.");
  renderDashboard(document.getElementById("main-content"));
}

function runRecommendation(type) {
  if (type === "quiz") navigateTo("quiz");
  else if (type === "plan") navigateTo("plan");
  else if (type === "revision") navigateTo("revision");
  else navigateTo("dashboard");
}
