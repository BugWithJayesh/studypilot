// StudyPilot - Syllabus

const openChapters = new Set();

function renderSyllabus(container) {
  if (!appState.subjects.length) {
    container.innerHTML = `
      <div class="sp-page sp-page--narrow">
        <h2 class="sp-title">Syllabus</h2>
        ${`<div class="sp-card">${emptyState("book", "No subjects yet", "Your syllabus is built from the subjects you pick during setup.", `<button class="sp-btn sp-btn--primary sp-btn--sm" onclick="navigateTo('settings')">Edit subjects</button>`)}</div>`}
      </div>`;
    return;
  }

  const activeId = appState.activeSyllabusSubject && appState.subjects.some(s => s.id === appState.activeSyllabusSubject)
    ? appState.activeSyllabusSubject
    : appState.subjects[0].id;
  const active = appState.subjects.find(s => s.id === activeId);
  const activeProgress = appState.calculateSubjectProgress(activeId);
  const topicCount = active.chapters.reduce((a, c) => a + c.topics.length, 0);
  const masteredCount = active.chapters.reduce((a, c) => a + c.topics.filter(t => t.mastery >= 70).length, 0);
  const exam = active.examDate || appState.nextExam();

  container.innerHTML = `
    <div class="sp-page">
      <div>
        <h2 class="sp-title">Syllabus</h2>
        <p class="sp-sub">Track what you have actually learned. Mastery feeds your plan, revision queue and analytics.</p>
      </div>

      <div class="syllabus-grid">
        <div class="sp-stack" style="gap:10px">
          <div class="sp-card" style="padding:12px">
            <p class="sp-eyebrow" style="padding:0 6px 6px">Subjects</p>
            ${appState.subjects.map(sub => {
              const prog = appState.calculateSubjectProgress(sub.id);
              const isActive = sub.id === activeId;
              return `
                <button class="subject-tab ${isActive ? "on" : ""}" onclick="selectSyllabusSubject('${sub.id}')">
                  <div class="sp-between" style="margin-bottom:5px;gap:8px">
                    <span class="sp-row" style="gap:7px;min-width:0">
                      <span class="sp-dot" style="background:${sub.color}"></span>
                      <span style="font-size:0.8rem;font-weight:${isActive ? "700" : "600"};color:${isActive ? "var(--brand-ink)" : "var(--ink-2)"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub.shortName || sub.name)}</span>
                    </span>
                    <span class="sp-tiny sp-num" style="font-weight:700">${prog}%</span>
                  </div>
                  ${progressBar(prog)}
                </button>
              `;
            }).join("")}
          </div>
          <button class="sp-btn sp-btn--primary sp-btn--block" onclick="navigateTo('quiz')">${icon("quiz", 15)} Practice this syllabus</button>
        </div>

        <div class="sp-stack">
          <section class="sp-card">
            <div class="sp-between" style="align-items:flex-start;gap:12px">
              <div style="min-width:0">
                <h3 class="sp-title sp-title--sm">${esc(active.name)}</h3>
                <p class="sp-sub">${esc(active.code)} • ${active.credits} credits${exam ? " • Exam " + formatDate(exam) : ""}</p>
              </div>
              <div style="text-align:right">
                <div class="sp-num" style="font-size:1.5rem;font-weight:700;color:var(--brand);line-height:1">${activeProgress}%</div>
                <p class="sp-tiny">mastery</p>
              </div>
            </div>
            <div style="margin-top:14px">${progressBar(activeProgress)}</div>
            <div class="sp-wrap" style="margin-top:14px;gap:6px">
              <span class="sp-badge sp-badge--brand">${confidenceLabel(active.confidence)}</span>
              <span class="sp-badge">${masteredCount}/${topicCount} topics solid</span>
              <span class="sp-badge">${active.chapters.length} units</span>
            </div>
          </section>

          ${active.chapters.map(ch => {
            const isOpen = openChapters.has(ch.id);
            return `
              <section class="sp-card sp-card--flush">
                <button class="chapter-toggle" onclick="toggleChapter('${ch.id}')">
                  <div class="sp-row" style="min-width:0">
                    <div class="row-mark" style="background:${ch.mastery >= 70 ? "var(--ok-soft)" : "var(--brand-soft)"};color:${ch.mastery >= 70 ? "var(--ok-ink)" : "var(--brand-ink)"};font-size:0.68rem">${ch.mastery}%</div>
                    <div style="min-width:0">
                      <div class="row-title">${esc(ch.name)}</div>
                      <div class="row-meta">${ch.topics.length} topics • ${ch.estimatedHours}h estimated</div>
                    </div>
                  </div>
                  <span style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                    ${urgencyBadge(ch.mastery)}
                    <span style="color:var(--muted-2);transform:rotate(${isOpen ? "90" : "0"}deg);transition:transform .18s ease;display:flex">${icon("chevron", 16)}</span>
                  </span>
                </button>
                <div class="chapter-body ${isOpen ? "open" : ""}" id="chapter-body-${ch.id}">
                  ${ch.topics.map(topic => {
                    const done = topic.mastery >= 70;
                    return `
                      <div class="topic-row" onclick="toggleTopicMastery('${active.id}','${ch.id}','${topic.id}')">
                        <div class="sp-row" style="gap:10px;min-width:0">
                          <div class="topic-check ${done ? "on" : ""}">${done ? "✓" : ""}</div>
                          <span style="font-size:0.81rem;color:${done ? "var(--muted-2)" : "var(--ink-2)"};${done ? "text-decoration:line-through" : ""};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(topic.name)}</span>
                        </div>
                        <div class="sp-row" style="gap:5px;flex-shrink:0">
                          <span class="sp-tiny sp-num">${topic.mastery}%</span>
                          <span class="sp-badge ${topic.difficulty === "Easy" ? "sp-badge--ok" : topic.difficulty === "Hard" ? "sp-badge--bad" : "sp-badge--warn"}">${esc(topic.difficulty)}</span>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </section>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function selectSyllabusSubject(id) {
  appState.activeSyllabusSubject = id;
  appState.save();
  renderSyllabus(document.getElementById("main-content"));
}

function toggleChapter(chapterId) {
  const body = document.getElementById("chapter-body-" + chapterId);
  if (!body) return;
  if (openChapters.has(chapterId)) openChapters.delete(chapterId);
  else openChapters.add(chapterId);
  body.classList.toggle("open", openChapters.has(chapterId));
  const chevron = body.previousElementSibling && body.previousElementSibling.querySelector("span[style*='rotate']");
  if (chevron) chevron.style.transform = `rotate(${openChapters.has(chapterId) ? 90 : 0}deg)`;
}

function toggleTopicMastery(subjectId, chapterId, topicId) {
  const subject = appState.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const chapter = subject.chapters.find(c => c.id === chapterId);
  if (!chapter) return;
  const topic = chapter.topics.find(t => t.id === topicId);
  if (!topic) return;

  openChapters.add(chapterId);
  const next = topic.mastery >= 70 ? 12 : 100;
  appState.setTopicMastery(subjectId, chapterId, topicId, next);
  showToast(next === 100 ? "Topic marked as solid." : "Topic moved back to weak.");
  renderSyllabus(document.getElementById("main-content"));
}
