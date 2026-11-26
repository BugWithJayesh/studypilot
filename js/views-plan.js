// StudyPilot - Study Plan

let planDay = null;

function renderStudyPlan(container) {
  const todayIdx = new Date().getDay();
  const selected = planDay == null ? todayIdx : planDay;
  const days = [1, 2, 3, 4, 5, 6, 0];
  const studyDays = appState.profile.studyDays || [];
  const sessions = appState.planForWeekday(selected);
  const plannedMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);

  container.innerHTML = `
    <div class="sp-page sp-page--narrow">
      <div class="sp-between" style="align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <h2 class="sp-title">Study plan</h2>
          <p class="sp-sub">${appState.profile.sessionsPerDay} session${appState.profile.sessionsPerDay === 1 ? "" : "s"} a day on your ${studyDays.length} study day${studyDays.length === 1 ? "" : "s"}, weakest subjects first.</p>
        </div>
        <button class="sp-btn sp-btn--outline" onclick="regeneratePlan()">${icon("revision", 15)} Rebuild today</button>
      </div>

      <div class="sp-wrap" style="gap:6px">
        ${days.map(d => {
          const isActive = d === selected;
          const isStudyDay = studyDays.includes(d);
          return `
            <button onclick="selectPlanDay(${d})"
              style="padding:8px 14px;border-radius:var(--r-pill);font-size:0.78rem;font-weight:600;cursor:pointer;
                     border:1px solid ${isActive ? "var(--brand)" : "var(--line)"};
                     background:${isActive ? "var(--brand)" : "var(--surface)"};
                     color:${isActive ? "#fff" : isStudyDay ? "var(--ink-2)" : "var(--muted-2)"};
                     opacity:${isStudyDay || isActive ? 1 : 0.55}">
              ${DAY_SHORT[d]}${d === todayIdx ? " · Today" : ""}
            </button>
          `;
        }).join("")}
      </div>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">${DAY_NAMES[selected]}</h3>
            <p class="sp-card-desc">${sessions.length} session${sessions.length === 1 ? "" : "s"} • ${Math.round(plannedMinutes / 6) / 10} h planned</p>
          </div>
          ${selected === todayIdx ? `<span class="sp-badge sp-badge--brand">Today</span>` : `<span class="sp-badge">Preview</span>`}
        </div>
        ${sessions.length
          ? `<div class="sp-list">${sessions.map(planRow).join("")}</div>`
          : emptyState("calendar", "Rest day",
              "You have not scheduled study on " + DAY_NAMES[selected] + ". Pick another day, or add it in Settings → Study rhythm.",
              `<button class="sp-btn sp-btn--outline sp-btn--sm" onclick="navigateTo('settings')">Edit study days</button>`)}
      </section>

      ${selected !== todayIdx && sessions.length ? `
        <div class="sp-card sp-card--soft">
          <p class="sp-muted">This is a preview generated from your subjects and session settings. It becomes your live plan on that day.</p>
        </div>
      ` : ""}

      <section class="sp-card">
        <div class="sp-card-head">
          <h3 class="sp-card-title">Weekly load</h3>
        </div>
        <div class="sp-grid sp-grid--3">
          ${appState.subjects.map(sub => {
            const prog = appState.calculateSubjectProgress(sub.id);
            return `
              <div style="padding:14px;border-radius:var(--r-md);border:1px solid var(--line-2);background:var(--surface-2)">
                <div class="sp-between" style="margin-bottom:7px">
                  <span style="font-size:0.79rem;font-weight:600;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub.name)}</span>
                  <span class="sp-tiny sp-num" style="font-weight:700;color:var(--brand)">${prog}%</span>
                </div>
                ${progressBar(prog)}
                <p class="sp-tiny" style="margin-top:7px">${sub.chapters.length} units • ${sub.hoursPerWeek}h / week</p>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function planRow(sess) {
  const done = sess.completed;
  const timeLabel = (sess.time || "").replace(/\s?(AM|PM)$/i, "");
  return `
    <div class="sp-row-item ${done ? "is-done" : ""}">
      <div class="row-main">
        <div class="row-mark ${done ? "is-done" : ""}">${done ? "✓" : esc(timeLabel)}</div>
        <div class="row-body">
          <div class="row-title">${esc(sess.title || sess.subjectName)}</div>
          <div class="row-meta">
            <span>${esc(sess.subjectName || "")}</span>
            <span class="row-sep">•</span>
            <span>${sess.durationMinutes} min</span>
            <span class="row-sep">•</span>
            <span>${esc(sess.type)}</span>
          </div>
        </div>
      </div>
      ${sess.preview
        ? `<span class="sp-badge">Planned</span>`
        : done
          ? `<span class="sp-badge sp-badge--ok">Completed</span>`
          : `<button class="sp-btn sp-btn--outline sp-btn--sm" onclick="completeDashSession('${sess.id}')">Mark done</button>`}
    </div>
  `;
}

function selectPlanDay(weekday) {
  planDay = weekday;
  renderStudyPlan(document.getElementById("main-content"));
}

function regeneratePlan() {
  appState.regenerateTodayPlan();
  showToast("Today's plan rebuilt.");
  renderStudyPlan(document.getElementById("main-content"));
}
