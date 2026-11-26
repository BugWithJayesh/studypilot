// StudyPilot - Onboarding
// A new student answers a short set of questions. Their answers generate the
// syllabus, today's plan, revision queue, insights and quiz pool.

let obStep = 0;
let obDraft = null;
let obCustomCounter = 0;

const OB_STEPS = [
  { key: "you", label: "About you" },
  { key: "subjects", label: "Your subjects" },
  { key: "confidence", label: "Confidence check" },
  { key: "time", label: "Time & goal" },
  { key: "rhythm", label: "Study rhythm" },
  { key: "review", label: "Review" }
];

const BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Data Science & AI",
  "Other"
];

function freshDraft() {
  obStep = 0;
  obCustomCounter = 0;
  obDraft = {
    name: "",
    stage: "school",
    className: "10",
    stream: "pcm",
    degree: "btech",
    college: "",
    branch: "Computer Science & Engineering",
    semester: "",
    goal: "exam",
    examDate: "",
    subjectKeys: [],
    customSubjects: [],
    confidence: {},
    hours: 3,
    sessionsPerDay: 3,
    pomodoro: 25,
    studyDays: [1, 2, 3, 4, 5]
  };
  obDraft.subjectKeys = courseSubjectKeys(obDraft);
  obDraft.subjectKeys.forEach(k => { obDraft.confidence[k] = 3; });
}

function renderOnboarding() {
  if (!obDraft) freshDraft();
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = `
    <div class="ob-shell">
      <aside class="ob-brand">
        <div>
          <div class="ob-brand-mark">
            <span class="mark">${icon("book", 20)}</span>
            StudyPilot
          </div>
          <div class="ob-steps">
            ${OB_STEPS.map((s, i) => `
              <div class="ob-step ${i === obStep ? "on" : ""} ${i < obStep ? "done" : ""}">
                <span class="ob-step-index">${i < obStep ? "✓" : i + 1}</span>
                <span>${s.label}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div>
          <h2>Your study space, built around you.</h2>
          <p>No demo data, no guesswork. Six quick questions and StudyPilot builds the plan, revision queue and practice questions that fit your class or course — from class 5 to graduation.</p>
        </div>
      </aside>

      <div class="ob-main">
        <div class="ob-card" id="ob-card">
          <div class="ob-mobile-brand">
            <span class="mobile-brand-mark">${icon("book", 16)}</span>
            <span>StudyPilot</span>
          </div>
          ${renderObStep()}
        </div>
      </div>
    </div>
  `;

  const firstField = root.querySelector("#ob-name");
  if (firstField) firstField.focus();
}

function renderObStep() {
  const progress = `
    <div class="ob-progress">
      ${OB_STEPS.map((_, i) => `<span class="${i <= obStep ? "on" : ""}"></span>`).join("")}
    </div>
  `;

  const nav = (nextLabel, canSkipBack = true) => `
    <div class="ob-nav">
      ${obStep > 0 && canSkipBack
        ? `<button class="sp-btn sp-btn--ghost" onclick="obBack()">← Back</button>`
        : `<span class="ob-count">Step ${obStep + 1} of ${OB_STEPS.length}</span>`}
      <button class="sp-btn sp-btn--primary" onclick="obNext()">${nextLabel} →</button>
    </div>
    <div id="ob-error" style="display:none;margin-top:12px;font-size:0.78rem;color:var(--bad-ink);font-weight:600"></div>
  `;

  if (obStep === 0) {
    const isSchool = obDraft.stage === "school";
    const cls = classNumber(obDraft.className);
    return `
      ${progress}
      <h1 class="ob-question">First, who are we studying with?</h1>
      <p class="ob-help">Class 5 to graduation. Pick your course and everything else — subjects, plan, quizzes — is built for it. This only lives in your browser.</p>
      <div class="ob-body sp-form-grid">
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-name">Your name</label>
          <input class="sp-input" id="ob-name" placeholder="e.g. Aarav Sharma" value="${esc(obDraft.name)}" oninput="obDraft.name=this.value">
        </div>
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-course">Class or course</label>
          <select class="sp-select" id="ob-course" onchange="obSetCourse(this.value)">
            <optgroup label="School — class 5 to 12">
              ${SCHOOL_CLASSES.map(c => `
                <option value="school:${c}" ${isSchool && String(obDraft.className) === c ? "selected" : ""}>Class ${c}</option>
              `).join("")}
            </optgroup>
            <optgroup label="Graduation">
              ${DEGREES.map(d => `
                <option value="college:${d.key}" ${!isSchool && obDraft.degree === d.key ? "selected" : ""}>${esc(d.label)}</option>
              `).join("")}
            </optgroup>
          </select>
        </div>
        ${isSchool && cls >= 11 ? `
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-stream">Stream</label>
          <select class="sp-select" id="ob-stream" onchange="obDraft.stream=this.value;obSyncSubjects();renderObStep_Refresh()">
            ${STREAMS.map(s => `
              <option value="${s.key}" ${obDraft.stream === s.key ? "selected" : ""}>${esc(s.label)} — ${esc(s.detail)}</option>
            `).join("")}
          </select>
          <span class="sp-hint">Your subjects are picked automatically — you can change them on the next step.</span>
        </div>` : ""}
        ${!isSchool ? `
        <div class="sp-field">
          <label class="sp-label" for="ob-branch">Branch / specialisation</label>
          <select class="sp-select" id="ob-branch" onchange="obDraft.branch=this.value">
            ${BRANCHES.map(b => `<option value="${b}" ${obDraft.branch === b ? "selected" : ""}>${b}</option>`).join("")}
          </select>
        </div>
        <div class="sp-field">
          <label class="sp-label" for="ob-semester">Semester</label>
          <input class="sp-input" id="ob-semester" type="number" min="1" max="12" placeholder="e.g. 5" value="${esc(obDraft.semester)}" oninput="obDraft.semester=this.value">
        </div>` : ""}
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-college">${isSchool ? "School name" : "College or university"} <span style="font-weight:500;color:var(--muted-2)">(optional)</span></label>
          <input class="sp-input" id="ob-college" placeholder="${isSchool ? "e.g. Delhi Public School" : "e.g. NIT Trichy"}" value="${esc(obDraft.college)}" oninput="obDraft.college=this.value">
        </div>
      </div>
      ${nav("Continue")}
    `;
  }

  if (obStep === 1) {
    const chosen = new Set(obDraft.subjectKeys);
    const pool = courseSubjectKeys(obDraft).map(k => findCatalogSubject(k)).filter(Boolean);
    return `
      ${progress}
      <h1 class="ob-question">Which subjects are you studying?</h1>
      <p class="ob-help">${esc(courseLabel(obDraft))} — these are picked to match your course. Tap any subject to add or remove it, and add anything missing below.</p>
      <div class="ob-body">
        <div class="ob-subject-grid">
          ${pool.map(s => `
            <button class="ob-subject ${chosen.has(s.key) ? "on" : ""}" onclick="obToggleSubject('${s.key}')">
              <span class="ob-subject-mark" style="background:${s.color}">${subjectInitials(s.name)}</span>
              <span style="min-width:0">
                <span class="ob-subject-name" style="display:block">${s.name}</span>
                <span class="ob-subject-code">${s.code} • ${s.chapters.length} units</span>
              </span>
            </button>
          `).join("")}
        </div>

        ${obDraft.customSubjects.length ? `
          <div class="sp-wrap" style="margin-top:14px">
            ${obDraft.customSubjects.map((c, i) => `
              <span class="sp-chip on">
                ${esc(c.name)}
                <button onclick="obRemoveCustom('${c.key}')" style="border:none;background:none;cursor:pointer;color:var(--brand-ink);font-size:0.9rem;line-height:1;padding:0">×</button>
              </span>
            `).join("")}
          </div>
        ` : ""}

        <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)">
          <label class="sp-label" for="ob-custom-name">Subject not listed?</label>
          <div class="sp-row" style="margin-top:6px">
            <input class="sp-input" id="ob-custom-name" placeholder="Subject name" onkeydown="if(event.key==='Enter'){event.preventDefault();obAddCustomSubject()}">
            <input class="sp-input" id="ob-custom-code" placeholder="Code" style="max-width:110px" onkeydown="if(event.key==='Enter'){event.preventDefault();obAddCustomSubject()}">
            <button class="sp-btn sp-btn--outline" onclick="obAddCustomSubject()">Add</button>
          </div>
        </div>
      </div>
      ${nav("Continue")}
    `;
  }

  if (obStep === 2) {
    const list = obSelectedSubjects();
    return `
      ${progress}
      <h1 class="ob-question">How confident do you feel in each subject?</h1>
      <p class="ob-help">Be honest — this sets your starting mastery, decides what goes into revision first, and shapes your insights. You can change any topic later in the syllabus.</p>
      <div class="ob-body">
        ${list.length ? list.map(s => {
          const level = obDraft.confidence[s.key] || 3;
          return `
            <div class="ob-conf-row">
              <div class="ob-conf-name">
                ${esc(s.name)}
                <div style="font-size:0.68rem;font-weight:500;color:var(--muted-2)">${confidenceLabel(level)}</div>
              </div>
              <div>
                <div class="ob-levels">
                  ${CONFIDENCE_LEVELS.map(c => `
                    <button class="ob-level ${c.level === level ? "on" : ""}" title="${c.short}" onclick="obSetConfidence('${s.key}',${c.level})">${c.level}</button>
                  `).join("")}
                </div>
                <div class="ob-level-caption" style="width:180px">
                  <span>Struggling</span>
                  <span>Mastered</span>
                </div>
              </div>
            </div>
          `;
        }).join("") : `<p class="sp-muted">Pick at least one subject to set confidence.</p>`}
      </div>
      ${nav("Continue")}
    `;
  }

  if (obStep === 3) {
    return `
      ${progress}
      <h1 class="ob-question">What are you working towards?</h1>
      <p class="ob-help">Deadlines change how the plan prioritises practice over revision.</p>
      <div class="ob-body sp-form-grid">
        <div class="sp-field">
          <label class="sp-label" for="ob-goal">Main goal</label>
          <select class="sp-select" id="ob-goal" onchange="obDraft.goal=this.value">
            ${[
              ["exam", "Upcoming exam"],
              ["term", "Term or board exams"],
              ["entrance", "Entrance exam"],
              ["skills", "Build real skills"],
              ["habit", "Build a daily habit"]
            ].map(([v, label]) => `<option value="${v}" ${obDraft.goal === v ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </div>
        <div class="sp-field">
          <label class="sp-label" for="ob-exam">Next exam date <span style="font-weight:500;color:var(--muted-2)">(optional)</span></label>
          <input class="sp-input" id="ob-exam" type="date" value="${esc(obDraft.examDate)}" onchange="obDraft.examDate=this.value">
        </div>
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-hours">How many hours can you realistically study per day?</label>
          <div class="sp-row">
            <input type="range" id="ob-hours" min="1" max="10" step="0.5" value="${obDraft.hours}" style="flex:1;accent-color:var(--brand)" oninput="obDraft.hours=parseFloat(this.value);document.getElementById('ob-hours-value').textContent=this.value+' h'">
            <span class="sp-badge sp-badge--brand" id="ob-hours-value" style="min-width:58px;justify-content:center">${obDraft.hours} h</span>
          </div>
          <span class="sp-hint">Be realistic. A plan you can keep beats an ambitious one you abandon in a week.</span>
        </div>
        <div class="sp-field" style="grid-column:1/-1">
          <label class="sp-label" for="ob-sessions">How many study sessions per day?</label>
          <select class="sp-select" id="ob-sessions" onchange="obDraft.sessionsPerDay=parseInt(this.value)">
            ${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${obDraft.sessionsPerDay === n ? "selected" : ""}>${n} session${n > 1 ? "s" : ""}</option>`).join("")}
          </select>
        </div>
      </div>
      ${nav("Continue")}
    `;
  }

  if (obStep === 4) {
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndexes = [1, 2, 3, 4, 5, 6, 0];
    const minutes = clamp(Math.round(((obDraft.hours * 60) / obDraft.sessionsPerDay) / 15) * 15, 20, 90);
    return `
      ${progress}
      <h1 class="ob-question">How do you like to study?</h1>
      <p class="ob-help">We will shape each session block around this rhythm.</p>
      <div class="ob-body">
        <label class="sp-label">Focus block length</label>
        <div class="sp-wrap" style="margin-top:6px">
          ${[15, 25, 45, 50].map(m => `
            <button class="sp-chip ${obDraft.pomodoro === m ? "on" : ""}" onclick="obDraft.pomodoro=${m};renderObStep_Refresh()">${m} min</button>
          `).join("")}
        </div>
        <div class="ob-cta-note">
          ${icon("clock", 15)}
          <span>Your plan uses <strong>${obDraft.sessionsPerDay} session${obDraft.sessionsPerDay > 1 ? "s" : ""} of ~${minutes} min</strong> per day, with ${obDraft.pomodoro}-minute focus blocks.</span>
        </div>

        <label class="sp-label" style="margin-top:20px;display:block">Study days</label>
        <div class="sp-wrap" style="margin-top:6px">
          ${dayIndexes.map((d, i) => `
            <button class="sp-chip ${obDraft.studyDays.includes(d) ? "on" : ""}" onclick="obToggleDay(${d})">${dayLabels[i]}</button>
          `).join("")}
        </div>
      </div>
      ${nav("Continue")}
    `;
  }

  // Review
  const list = obSelectedSubjects();
  const avgConfidence = list.length
    ? (list.reduce((a, s) => a + (obDraft.confidence[s.key] || 3), 0) / list.length)
    : 3;
  const examText = obDraft.examDate ? formatDate(obDraft.examDate) : "No deadline set";

  return `
    ${progress}
    <h1 class="ob-question">Ready — here is your setup</h1>
    <p class="ob-help">Everything below comes from your answers. You can edit all of it later in Settings.</p>
    <div class="ob-body">
      <div class="ob-summary">
        <div class="ob-summary-row"><span>Student</span><span>${esc(obDraft.name || "Student")}</span></div>
        <div class="ob-summary-row"><span>Course</span><span>${esc(courseLabel(obDraft))}</span></div>
        ${obDraft.college ? `<div class="ob-summary-row"><span>${obDraft.stage === "school" ? "School" : "College"}</span><span>${esc(obDraft.college)}</span></div>` : ""}
        <div class="ob-summary-row"><span>Subjects</span><span>${list.length} selected</span></div>
        <div class="ob-summary-row"><span>Overall confidence</span><span>${confidenceLabel(Math.round(avgConfidence))}</span></div>
        <div class="ob-summary-row"><span>Daily target</span><span>${obDraft.hours} h • ${obDraft.sessionsPerDay} session${obDraft.sessionsPerDay > 1 ? "s" : ""}</span></div>
        <div class="ob-summary-row"><span>Focus block</span><span>${obDraft.pomodoro} min</span></div>
        <div class="ob-summary-row"><span>Deadline</span><span>${examText}</span></div>
      </div>
      <div class="ob-cta-note">
        ${icon("sparkles", 15)}
        <span>We will build ${list.length} syllabus${list.length === 1 ? "" : "s"}, a first study day, ${Math.min(6, list.length * 3)} revision card${Math.min(6, list.length * 3) === 1 ? "" : "s"} and a practice question pool — all empty of anything you did not give us.</span>
      </div>
    </div>
    <div class="ob-nav">
      <button class="sp-btn sp-btn--ghost" onclick="obBack()">← Back</button>
      <button class="sp-btn sp-btn--primary" onclick="obFinish()">Build my study plan →</button>
    </div>
    <div id="ob-error" style="display:none;margin-top:12px;font-size:0.78rem;color:var(--bad-ink);font-weight:600"></div>
  `;
}

function obSelectedSubjects() {
  const catalog = (obDraft.subjectKeys || [])
    .map(k => findCatalogSubject(k))
    .filter(Boolean)
    .map(s => ({ key: s.key, name: s.name, code: s.code, color: s.color }));
  const custom = (obDraft.customSubjects || [])
    .map(c => ({ key: c.key, name: c.name, code: c.code || "ELECTIVE", color: "#64748B" }));
  return [...catalog, ...custom];
}

function renderObStep_Refresh() {
  const card = document.getElementById("ob-card");
  if (card) card.innerHTML = `<div class="ob-mobile-brand"><span class="mobile-brand-mark">${icon("book", 16)}</span><span>StudyPilot</span></div>` + renderObStep();
}

function obShowError(message) {
  const el = document.getElementById("ob-error");
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function obClearError() {
  const el = document.getElementById("ob-error");
  if (el) el.style.display = "none";
}

function obToggleSubject(key) {
  const idx = obDraft.subjectKeys.indexOf(key);
  if (idx >= 0) obDraft.subjectKeys.splice(idx, 1);
  else {
    obDraft.subjectKeys.push(key);
    if (!obDraft.confidence[key]) obDraft.confidence[key] = 3;
  }
  obClearError();
  renderObStep_Refresh();
}

function obAddCustomSubject() {
  const nameEl = document.getElementById("ob-custom-name");
  const codeEl = document.getElementById("ob-custom-code");
  const name = (nameEl && nameEl.value || "").trim();
  if (!name) return;
  const key = "custom-" + (++obCustomCounter);
  obDraft.customSubjects.push({ key, name, code: (codeEl && codeEl.value || "").trim() });
  obDraft.confidence[key] = 3;
  renderObStep_Refresh();
}

function obRemoveCustom(key) {
  obDraft.customSubjects = obDraft.customSubjects.filter(c => c.key !== key);
  delete obDraft.confidence[key];
  renderObStep_Refresh();
}

function obSetConfidence(key, level) {
  obDraft.confidence[key] = level;
  renderObStep_Refresh();
}

function obToggleDay(day) {
  const idx = obDraft.studyDays.indexOf(day);
  if (idx >= 0) obDraft.studyDays.splice(idx, 1);
  else obDraft.studyDays.push(day);
  renderObStep_Refresh();
}

function obCaptureTextInputs() {
  const name = document.getElementById("ob-name");
  const college = document.getElementById("ob-college");
  const semester = document.getElementById("ob-semester");
  const branch = document.getElementById("ob-branch");
  const stream = document.getElementById("ob-stream");
  const exam = document.getElementById("ob-exam");
  if (name) obDraft.name = name.value.trim();
  if (college) obDraft.college = college.value.trim();
  if (semester) obDraft.semester = semester.value.trim();
  if (branch) obDraft.branch = branch.value;
  if (stream) obDraft.stream = stream.value;
  if (exam) obDraft.examDate = exam.value;
}

// Rebuild the selected subjects from the chosen class / stream / degree.
function obSyncSubjects() {
  const keys = courseSubjectKeys(obDraft);
  obDraft.subjectKeys = keys;
  obDraft.confidence = {};
  keys.forEach(k => { obDraft.confidence[k] = 3; });
}

function obSetCourse(value) {
  obCaptureTextInputs();
  const parts = String(value || "").split(":");
  const stage = parts[0] === "college" ? "college" : "school";
  const detail = parts[1] || "";
  obDraft.stage = stage;
  if (stage === "school") {
    obDraft.className = detail || "10";
    if (classNumber(detail) >= 11 && !obDraft.stream) obDraft.stream = "pcm";
  } else {
    obDraft.degree = detail || "btech";
  }
  obSyncSubjects();
  obClearError();
  renderObStep_Refresh();
}

function obNext() {
  obCaptureTextInputs();

  if (obStep === 0) {
    if (!obDraft.name) return obShowError("Please enter your name so the app knows what to call you.");
    if (obDraft.stage === "school" && !obDraft.className) return obShowError("Pick your class to get the right subjects.");
    if (obDraft.stage === "college" && !obDraft.degree) return obShowError("Pick your degree course.");
  }
  if (obStep === 1) {
    if (!obDraft.subjectKeys.length && !obDraft.customSubjects.length) {
      return obShowError("Select at least one subject — your plan is built from them.");
    }
  }
  if (obStep === 3) {
    if (!(obDraft.hours > 0)) return obShowError("Pick a daily study target.");
  }
  if (obStep === 4) {
    if (!obDraft.studyDays.length) return obShowError("Choose at least one study day.");
  }

  obClearError();
  obStep = Math.min(OB_STEPS.length - 1, obStep + 1);
  renderObStep_Refresh();
  const card = document.getElementById("ob-card");
  if (card) card.scrollTop = 0;
  window.scrollTo(0, 0);
}

function obBack() {
  obCaptureTextInputs();
  obClearError();
  obStep = Math.max(0, obStep - 1);
  renderObStep_Refresh();
  window.scrollTo(0, 0);
}

function obFinish() {
  appState.completeOnboarding({ ...obDraft });
  obDraft = null;
  renderShell();
  navigateTo("dashboard");
  showToast("Your study space is ready, " + appState.profile.name.split(" ")[0] + ".");
}
