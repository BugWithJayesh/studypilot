// StudyPilot - Analytics

function renderAnalytics(container) {
  const stats = appState.weeklyStats();
  const totalHours = appState.totalHours();
  const todayHours = appState.hoursToday();
  const target = appState.profile.targetHoursPerDay || 3;
  const progress = appState.calculateOverallProgress();
  const streak = appState.studyStreak();
  const consistency = appState.weeklyConsistency();
  const hasData = appState.hasStudyData();

  const history = [...appState.quizHistory]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const weak = appState.subjects
    .flatMap(sub => sub.chapters.flatMap(ch => ch.topics.map(t => ({
      subject: sub.name,
      topic: t.name,
      mastery: t.mastery || 0,
      color: sub.color
    }))))
    .filter(t => t.mastery < 70)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 6);

  container.innerHTML = `
    <div class="sp-page">
      <div>
        <h2 class="sp-title">Analytics</h2>
        <p class="sp-sub">Everything here is measured from your own sessions, quizzes and syllabus.</p>
      </div>

      <div class="sp-grid sp-grid--4">
        ${statTile("Total focused", `${totalHours}<small>h</small>`, totalHours ? "Across all sessions" : "No sessions logged yet", null)}
        ${statTile("Today", `${todayHours}<small>h / ${target}h</small>`, `${Math.round((todayHours / target) * 100)}% of target`, (todayHours / target) * 100)}
        ${statTile("Syllabus", `${progress}<small>%</small>`, "Overall mastery", progress)}
        ${statTile("Consistency", `${consistency}<small>%</small>`, streak ? `${streak} day streak` : "Study to build a streak", consistency)}
      </div>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Last 7 days</h3>
            <p class="sp-card-desc">Focused hours against your ${target}h daily target</p>
          </div>
          ${hasData ? "" : `<span class="sp-badge">No data yet</span>`}
        </div>
        <div class="chart-wrap">
          <svg id="analytics-weekly-chart" width="100%" height="190" viewBox="0 0 500 190" preserveAspectRatio="none" role="img" aria-label="Weekly study hours"></svg>
          ${hasData ? "" : `
            <div class="chart-empty-note">
              <p>Your weekly chart fills in as you complete sessions. Nothing is pre-filled.</p>
              <button class="sp-btn sp-btn--outline sp-btn--sm" onclick="navigateTo('timer')">Start a focus session</button>
            </div>
          `}
        </div>
      </section>

      <div class="sp-grid sp-grid--2">
        <section class="sp-card">
          <div class="sp-card-head">
            <h3 class="sp-card-title">Subject mastery</h3>
          </div>
          ${appState.subjects.length
            ? appState.subjects.map(s => `
                <div style="margin-bottom:13px">
                  <div class="sp-between" style="margin-bottom:5px">
                    <span style="font-size:0.8rem;font-weight:600;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.name)}</span>
                    <span class="sp-tiny sp-num" style="font-weight:600">${appState.calculateSubjectProgress(s.id)}%</span>
                  </div>
                  ${progressBar(appState.calculateSubjectProgress(s.id))}
                </div>
              `).join("")
            : `<p class="sp-muted">No subjects yet.</p>`}
        </section>

        <section class="sp-card">
          <div class="sp-card-head">
            <h3 class="sp-card-title">Quiz performance</h3>
            ${history.length ? `<button class="sp-link" onclick="navigateTo('quiz')">Practice →</button>` : ""}
          </div>
          ${history.length
            ? `<div class="sp-list">${history.map(h => `
                <div class="sp-row-item">
                  <div class="row-main">
                    <div class="row-mark" style="background:${h.percentage >= 80 ? "var(--ok-soft)" : h.percentage >= 60 ? "var(--warn-soft)" : "var(--bad-soft)"};color:${h.percentage >= 80 ? "var(--ok-ink)" : h.percentage >= 60 ? "var(--warn-ink)" : "var(--bad-ink)"};font-size:0.68rem">${h.percentage}%</div>
                    <div class="row-body">
                      <div class="row-title">${esc(h.subject)}</div>
                      <div class="row-meta">${esc(h.date)} • ${h.correct}/${h.totalQuestions} correct</div>
                    </div>
                  </div>
                </div>
              `).join("")}</div>`
            : emptyState("quiz", "No quiz results yet", "Take your first practice quiz and your scores appear here.", `<button class="sp-btn sp-btn--outline sp-btn--sm" onclick="navigateTo('quiz')">Open quiz</button>`)}
        </section>
      </div>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Topics that need work</h3>
            <p class="sp-card-desc">Below 70% mastery, weakest first</p>
          </div>
          ${weak.length ? `<button class="sp-link" onclick="navigateTo('revision')">Revise →</button>` : ""}
        </div>
        ${weak.length
          ? `<div class="sp-list">${weak.map(w => `
              <div class="sp-row-item">
                <div class="row-main">
                  <div class="row-mark" style="background:var(--surface-2);color:var(--bad-ink);font-size:0.68rem">${w.mastery}%</div>
                  <div class="row-body">
                    <div class="row-title">${esc(w.topic)}</div>
                    <div class="row-meta">${esc(w.subject)}</div>
                  </div>
                </div>
                <span class="sp-badge sp-badge--bad" style="flex-shrink:0">${w.mastery}%</span>
              </div>
            `).join("")}</div>`
          : emptyState("target", "No weak topics", "Everything in your syllabus is at 70% mastery or above. Keep it warm with revision.", "")}
      </section>
    </div>
  `;

  drawWeeklyChart();
}

function drawWeeklyChart() {
  const svg = document.getElementById("analytics-weekly-chart");
  if (!svg) return;
  const data = appState.weeklyStats();
  const width = 500;
  const height = 190;
  const top = 12;
  const bottom = 28;
  const plotH = height - top - bottom;
  const max = Math.max(appState.profile.targetHoursPerDay || 3, ...data.map(d => d.hours || 0), 1);
  const slot = width / data.length;
  const barW = Math.min(34, slot * 0.46);
  const targetY = top + plotH - (Math.min(appState.profile.targetHoursPerDay || 3, max) / max) * plotH;

  svg.innerHTML = "";

  // target guide
  const guide = document.createElementNS("http://www.w3.org/2000/svg", "line");
  guide.setAttribute("x1", "0");
  guide.setAttribute("x2", String(width));
  guide.setAttribute("y1", String(targetY));
  guide.setAttribute("y2", String(targetY));
  guide.setAttribute("stroke", "#DDE1EE");
  guide.setAttribute("stroke-dasharray", "4 4");
  svg.appendChild(guide);

  data.forEach((d, i) => {
    const cx = slot * i + slot / 2;
    const x = cx - barW / 2;

    // background column (also keeps the chart legible with no data)
    const track = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    track.setAttribute("x", String(x));
    track.setAttribute("y", String(top));
    track.setAttribute("width", String(barW));
    track.setAttribute("height", String(plotH));
    track.setAttribute("rx", "5");
    track.setAttribute("fill", "#F3F5FA");
    svg.appendChild(track);

    if ((d.hours || 0) > 0) {
      const h = Math.max(4, (d.hours / max) * plotH);
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bar.setAttribute("x", String(x));
      bar.setAttribute("y", String(top + plotH - h));
      bar.setAttribute("width", String(barW));
      bar.setAttribute("height", String(h));
      bar.setAttribute("rx", "5");
      bar.setAttribute("fill", d.hours >= (appState.profile.targetHoursPerDay || 3) ? "#4F46E5" : "#A5B4FC");
      svg.appendChild(bar);

      const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
      value.setAttribute("x", String(cx));
      value.setAttribute("y", String(top + plotH - h - 6));
      value.setAttribute("text-anchor", "middle");
      value.setAttribute("font-size", "10");
      value.setAttribute("font-weight", "700");
      value.setAttribute("fill", "#4F46E5");
      value.textContent = String(d.hours);
      svg.appendChild(value);
    }

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(cx));
    label.setAttribute("y", String(height - 8));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", "#94A3B8");
    label.textContent = d.day;
    svg.appendChild(label);
  });
}
