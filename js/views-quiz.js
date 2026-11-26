// StudyPilot - Practice Quiz
// Question pools are built from the subjects chosen during onboarding.

const quizState = {
  active: false,
  finished: false,
  currentIndex: 0,
  selectedOption: null,
  showResult: false,
  answers: [],
  subject: "all",
  questions: [],
  score: 0,
  startedAt: null
};

function quizPool(subjectKey) {
  if (!subjectKey || subjectKey === "all") return appState.quizQuestions;
  return appState.quizQuestions.filter(q => q.key === subjectKey);
}

function renderPracticeQuiz(container) {
  if (quizState.finished) return renderQuizResults(container);
  if (quizState.active) return renderQuizActive(container);
  renderQuizLobby(container);
}

function renderQuizLobby(container) {
  const total = appState.quizQuestions.length;
  const history = appState.quizHistory || [];

  if (!total) {
    container.innerHTML = `
      <div class="sp-page sp-page--narrow">
        <div>
          <h2 class="sp-title">Practice quiz</h2>
          <p class="sp-sub">Active recall with instant explanations.</p>
        </div>
        <div class="sp-card">
          ${emptyState("quiz", "No practice questions yet",
            "Your selected subjects do not have questions in the built-in bank. Add a catalog subject in Settings, or ask the AI tutor to explain a topic instead.",
            `<button class="sp-btn sp-btn--primary sp-btn--sm" onclick="navigateTo('settings')">Edit subjects</button>
             <button class="sp-btn sp-btn--outline sp-btn--sm" onclick="navigateTo('tutor')">Open AI tutor</button>`)}
        </div>
      </div>`;
    return;
  }

  const selected = quizState.subject;
  const subjectsWithQuestions = appState.subjects.filter(s => quizPool(s.key).length > 0);
  const withoutQuestions = appState.subjects.filter(s => quizPool(s.key).length === 0);

  container.innerHTML = `
    <div class="sp-page sp-page--narrow">
      <div>
        <h2 class="sp-title">Practice quiz</h2>
        <p class="sp-sub">${total} questions across ${subjectsWithQuestions.length} of your subjects, with explanations after every answer.</p>
      </div>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Start a session</h3>
            <p class="sp-card-desc">${Math.min(10, total)} questions • multiple choice • instant feedback</p>
          </div>
        </div>

        <div class="sp-grid sp-grid--2" style="margin-bottom:18px">
          <button class="sp-card sp-card--soft" onclick="selectQuizSubject('all')"
            style="text-align:left;cursor:pointer;padding:14px;border:1px solid ${selected === "all" ? "var(--brand)" : "var(--line)"};background:${selected === "all" ? "var(--brand-soft)" : "var(--surface-2)"}">
            <p style="font-size:0.82rem;font-weight:700;color:var(--ink)">All subjects</p>
            <p class="sp-tiny" style="margin-top:2px">${total} questions to draw from</p>
          </button>
          ${subjectsWithQuestions.map(sub => {
            const count = quizPool(sub.key).length;
            const on = selected === sub.key;
            return `
              <button class="sp-card sp-card--soft" onclick="selectQuizSubject('${sub.key}')"
                style="text-align:left;cursor:pointer;padding:14px;border:1px solid ${on ? "var(--brand)" : "var(--line)"};background:${on ? "var(--brand-soft)" : "var(--surface-2)"}">
                <p style="font-size:0.82rem;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub.name)}</p>
                <p class="sp-tiny" style="margin-top:2px">${count} question${count === 1 ? "" : "s"}</p>
              </button>
            `;
          }).join("")}
        </div>

        ${withoutQuestions.length ? `<p class="sp-hint" style="margin-bottom:14px">No question bank for: ${withoutQuestions.map(s => esc(s.name)).join(", ")}. Their topics still power your plan and revision.</p>` : ""}

        <button class="sp-btn sp-btn--primary sp-btn--block" onclick="startQuiz()">${icon("play", 15)} Start quiz</button>
      </section>

      ${history.length ? `
        <section class="sp-card">
          <div class="sp-card-head">
            <h3 class="sp-card-title">Recent results</h3>
            <button class="sp-link" onclick="navigateTo('analytics')">Analytics →</button>
          </div>
          <div class="sp-list">
            ${history.slice(0, 5).map(h => {
              const tone = h.percentage >= 80 ? "sp-badge--ok" : h.percentage >= 60 ? "sp-badge--warn" : "sp-badge--bad";
              return `
                <div class="sp-row-item">
                  <div class="row-main">
                    <div class="row-mark" style="background:var(--surface-2);color:var(--muted);font-size:0.68rem">${h.correct}/${h.totalQuestions}</div>
                    <div class="row-body">
                      <div class="row-title">${esc(h.subject)}</div>
                      <div class="row-meta">${esc(h.date)} • ${h.totalQuestions} questions</div>
                    </div>
                  </div>
                  <span class="sp-badge ${tone}">${h.percentage}%</span>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      ` : `
        <div class="sp-card">
          ${emptyState("chart", "No quiz history yet", "Finish one session and your scores start showing up in analytics.", "")}
        </div>
      `}
    </div>
  `;
}

function selectQuizSubject(key) {
  quizState.subject = key;
  renderPracticeQuiz(document.getElementById("main-content"));
}

function startQuiz() {
  const pool = quizPool(quizState.subject);
  if (!pool.length) {
    showToast("No questions available for that subject yet.", "warning");
    return;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
  quizState.questions = shuffled;
  quizState.active = true;
  quizState.finished = false;
  quizState.currentIndex = 0;
  quizState.answers = [];
  quizState.selectedOption = null;
  quizState.showResult = false;
  quizState.score = 0;
  quizState.startedAt = Date.now();
  renderPracticeQuiz(document.getElementById("main-content"));
}

function renderQuizActive(container) {
  const q = quizState.questions[quizState.currentIndex];
  if (!q) { finishQuiz(); return; }
  const subject = appState.subjects.find(s => s.key === q.key);
  const progress = Math.round((quizState.currentIndex / quizState.questions.length) * 100);

  container.innerHTML = `
    <div class="sp-page sp-page--tight">
      <div class="sp-between">
        <span class="sp-muted">Question ${quizState.currentIndex + 1} of ${quizState.questions.length}</span>
        <span class="sp-badge sp-badge--brand">${esc(subject ? subject.name : "Mixed")}</span>
      </div>
      ${progressBar(progress)}

      <section class="sp-card">
        <p class="sp-eyebrow" style="margin-bottom:8px">${esc(q.topic || "General")} • ${esc(q.difficulty || "Medium")}</p>
        <h3 style="font-size:1.05rem;font-weight:600;line-height:1.5;color:var(--ink);letter-spacing:-0.01em">${esc(q.question)}</h3>
      </section>

      <div class="sp-stack" style="gap:8px">
        ${q.options.map((opt, i) => {
          let cls = "quiz-option";
          if (quizState.showResult) {
            cls += " is-locked";
            if (i === q.correctIndex) cls += " is-correct";
            else if (i === quizState.selectedOption) cls += " is-wrong";
          } else if (quizState.selectedOption === i) {
            cls += " is-selected";
          }
          return `
            <button class="${cls}" onclick="${quizState.showResult ? "" : `selectQuizOption(${i})`}">
              <span class="quiz-key">${String.fromCharCode(65 + i)}</span>
              <span style="flex:1">${esc(opt)}</span>
              ${quizState.showResult && i === q.correctIndex ? `<span style="color:var(--ok-ink);font-weight:700">✓</span>` : ""}
              ${quizState.showResult && i === quizState.selectedOption && i !== q.correctIndex ? `<span style="color:var(--bad-ink);font-weight:700">✕</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

      ${quizState.showResult ? `
        <div style="padding:15px 16px;border-radius:var(--r-md);background:${quizState.selectedOption === q.correctIndex ? "var(--ok-soft)" : "var(--warn-soft)"};border:1px solid ${quizState.selectedOption === q.correctIndex ? "#BBF7D0" : "#FDE68A"}">
          <p style="font-size:0.74rem;font-weight:700;color:${quizState.selectedOption === q.correctIndex ? "var(--ok-ink)" : "var(--warn-ink)"};margin-bottom:4px">
            ${quizState.selectedOption === q.correctIndex ? "Correct" : "Not quite"}
          </p>
          <p style="font-size:0.82rem;color:var(--ink-2);line-height:1.6">${esc(q.explanation)}</p>
        </div>
        <button class="sp-btn sp-btn--primary sp-btn--block" onclick="nextQuizQuestion()">
          ${quizState.currentIndex + 1 >= quizState.questions.length ? "See results" : "Next question →"}
        </button>
      ` : `
        <button class="sp-btn sp-btn--primary sp-btn--block" ${quizState.selectedOption === null ? "disabled" : ""} onclick="submitQuizAnswer()">Submit answer</button>
      `}
    </div>
  `;
}

function selectQuizOption(i) {
  if (quizState.showResult) return;
  quizState.selectedOption = i;
  renderQuizActive(document.getElementById("main-content"));
}

function submitQuizAnswer() {
  if (quizState.selectedOption === null) return;
  const q = quizState.questions[quizState.currentIndex];
  const correct = quizState.selectedOption === q.correctIndex;
  if (correct) quizState.score++;
  quizState.answers.push({ questionId: q.id, selected: quizState.selectedOption, correct, topic: q.topic, key: q.key });
  quizState.showResult = true;
  renderQuizActive(document.getElementById("main-content"));
}

function nextQuizQuestion() {
  quizState.currentIndex++;
  quizState.selectedOption = null;
  quizState.showResult = false;
  if (quizState.currentIndex >= quizState.questions.length) finishQuiz();
  else renderQuizActive(document.getElementById("main-content"));
}

function finishQuiz() {
  quizState.active = false;
  quizState.finished = true;
  const pct = Math.round((quizState.score / Math.max(1, quizState.questions.length)) * 100);
  const subjectLabel = quizState.subject === "all"
    ? "All subjects"
    : ((appState.subjects.find(s => s.key === quizState.subject) || {}).name || "Mixed");

  appState.addQuizResult({
    id: "qh-" + Date.now(),
    subject: subjectLabel,
    correct: quizState.score,
    totalQuestions: quizState.questions.length,
    percentage: pct,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  });

  renderQuizResults(document.getElementById("main-content"));
}

function renderQuizResults(container) {
  const total = Math.max(1, quizState.questions.length);
  const pct = Math.round((quizState.score / total) * 100);
  const tone = pct >= 80 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--bad)";
  const title = pct >= 80 ? "Strong session" : pct >= 60 ? "Getting there" : "Worth another pass";
  const wrong = quizState.answers.filter(a => !a.correct);

  const weakestTopic = wrong.length ? wrong[0].topic : null;

  container.innerHTML = `
    <div class="sp-page sp-page--tight">
      <section class="sp-card" style="text-align:center">
        <div class="score-ring" style="background:${pct >= 80 ? "var(--ok-soft)" : pct >= 60 ? "var(--warn-soft)" : "var(--bad-soft)"};color:${tone}">
          ${pct}%
        </div>
        <h2 class="sp-title">${title}</h2>
        <p class="sp-sub">You got ${quizState.score} of ${total} correct.</p>

        <div class="sp-grid sp-grid--3" style="margin:20px 0">
          <div class="sp-stat" style="align-items:center"><span class="sp-stat-label">Correct</span><div class="sp-stat-value" style="color:var(--ok)">${quizState.score}</div></div>
          <div class="sp-stat" style="align-items:center"><span class="sp-stat-label">Wrong</span><div class="sp-stat-value" style="color:var(--bad)">${total - quizState.score}</div></div>
          <div class="sp-stat" style="align-items:center"><span class="sp-stat-label">Questions</span><div class="sp-stat-value">${total}</div></div>
        </div>

        ${weakestTopic ? `<p class="sp-muted" style="margin-bottom:16px">Revise <strong style="color:var(--ink)">${esc(weakestTopic)}</strong> before your next session.</p>` : ""}

        <div class="sp-wrap" style="justify-content:center">
          <button class="sp-btn sp-btn--primary" onclick="retakeQuiz()">Try again</button>
          <button class="sp-btn sp-btn--outline" onclick="quizState.finished=false;quizState.active=false;renderPracticeQuiz(document.getElementById('main-content'))">Change subject</button>
          <button class="sp-btn sp-btn--ghost" onclick="navigateTo('analytics')">Analytics</button>
        </div>
      </section>

      <section class="sp-card">
        <div class="sp-card-head">
          <h3 class="sp-card-title">Answer review</h3>
        </div>
        <div class="sp-list">
          ${quizState.answers.map((ans, i) => {
            const q = quizState.questions[i];
            if (!q) return "";
            return `
              <div class="sp-row-item">
                <div class="row-main">
                  <div class="row-mark" style="background:${ans.correct ? "var(--ok-soft)" : "var(--bad-soft)"};color:${ans.correct ? "var(--ok-ink)" : "var(--bad-ink)"}">${ans.correct ? "✓" : "✕"}</div>
                  <div class="row-body">
                    <div class="row-title" style="white-space:normal">${esc(q.question.length > 90 ? q.question.slice(0, 90) + "…" : q.question)}</div>
                    <div class="row-meta">${esc(q.topic || "")}</div>
                  </div>
                </div>
                <span class="sp-badge ${ans.correct ? "sp-badge--ok" : "sp-badge--bad"}">${ans.correct ? "Correct" : "Wrong"}</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function retakeQuiz() {
  quizState.finished = false;
  startQuiz();
}
