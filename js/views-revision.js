// StudyPilot - Smart Revision (spaced repetition)

const INTERVAL_LABELS = { 1: "1 day", 2: "3 days", 3: "7 days", 4: "14 days" };

function renderSmartRevision(container) {
  const today = todayISO();
  const pending = [...appState.revisionQueue]
    .filter(r => !r.completed)
    .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")));
  const dueToday = pending.filter(r => (r.dueDate || "") <= today);
  const upcoming = pending.filter(r => (r.dueDate || "") > today);

  container.innerHTML = `
    <div class="sp-page sp-page--narrow">
      <div>
        <h2 class="sp-title">Smart revision</h2>
        <p class="sp-sub">Your weakest topics resurface at 1, 3, 7 and 14 day intervals. Rate how it felt and the schedule adapts.</p>
      </div>

      <div class="sp-grid sp-grid--3">
        ${statTile("Due now", `${dueToday.length}`, dueToday.length ? "Start here" : "Queue clear", null)}
        ${statTile("Upcoming", `${upcoming.length}`, "Scheduled reviews", null)}
        ${statTile("Completed", `${appState.revisionQueue.filter(r => r.completed).length}`, "All time", null)}
      </div>

      ${pending.length ? `
        <div class="sp-stack" style="gap:10px">
          ${dueToday.map(r => revisionCard(r, true)).join("")}
          ${upcoming.map(r => revisionCard(r, false)).join("")}
        </div>
      ` : `
        <div class="sp-card">
          ${emptyState("revision", "Nothing due right now",
            appState.revisionQueue.length
              ? "You cleared the whole queue. New cards appear when topics fall behind or you rate something Hard."
              : "Revision cards are created from your weakest topics. Take a quiz or update your syllabus to seed the queue.",
            `<button class="sp-btn sp-btn--primary sp-btn--sm" onclick="navigateTo('quiz')">Take a quiz</button>
             <button class="sp-btn sp-btn--outline sp-btn--sm" onclick="navigateTo('syllabus')">Open syllabus</button>`)}
        </div>
      `}
    </div>
  `;
}

function revisionCard(r, isDue) {
  const subject = appState.subjects.find(s => s.id === r.subjectId);
  return `
    <article class="sp-card" style="${isDue ? "border-color:#FDE68A" : ""}">
      <div class="sp-between" style="align-items:flex-start;gap:12px;margin-bottom:10px">
        <div style="min-width:0">
          <div class="sp-wrap" style="gap:6px;margin-bottom:6px">
            <span class="sp-badge sp-badge--brand">${esc(r.subjectName)}</span>
            <span class="sp-badge ${isDue ? "sp-badge--warn" : ""}">${isDue ? "Due now" : "Due " + formatDate(r.dueDate)}</span>
            <span class="sp-badge">${INTERVAL_LABELS[r.intervalLevel] || "1 day"}</span>
          </div>
          <h4 style="font-size:0.95rem;font-weight:700;color:var(--ink);letter-spacing:-0.01em">${esc(r.topicName)}</h4>
          <p class="sp-muted" style="margin-top:3px">${esc(r.reason)}</p>
        </div>
        ${subject ? `<div class="row-mark" style="background:var(--surface-2);color:var(--muted);font-size:0.7rem">${r.masteryScore}%</div>` : ""}
      </div>
      <div class="sp-wrap" style="gap:6px">
        <button class="sp-btn sp-btn--outline sp-btn--sm" style="flex:1" onclick="rateRevision('${r.id}','Hard')">Hard</button>
        <button class="sp-btn sp-btn--outline sp-btn--sm" style="flex:1" onclick="rateRevision('${r.id}','Medium')">Medium</button>
        <button class="sp-btn sp-btn--primary sp-btn--sm" style="flex:1" onclick="rateRevision('${r.id}','Easy')">Easy</button>
      </div>
    </article>
  `;
}

function rateRevision(id, rating) {
  appState.rateRevision(id, rating);
  const next = rating === "Easy" ? "pushed further out" : rating === "Hard" ? "back to tomorrow" : "scheduled again";
  showToast(`Marked ${rating.toLowerCase()} — review ${next}.`, "info");
  renderSmartRevision(document.getElementById("main-content"));
}
