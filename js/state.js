// StudyPilot - Application State
// A student starts with an empty study space. Onboarding questions build
// the subjects, plan, revision queue and quiz pool — nothing is pre-filled.

const STORAGE_KEY = "studypilot_v2";
const STORAGE_VERSION = 3;
const INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14 };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SESSION_SLOTS = ["8:30 AM", "10:30 AM", "12:30 PM", "3:00 PM", "5:00 PM", "7:00 PM", "9:00 PM"];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function addDaysISO(days) {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function timeToMinutes(hm) {
  const parts = String(hm || "0:0").split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function clockLabel(hm) {
  const total = timeToMinutes(hm);
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
}

function emptyProfile() {
  return {
    onboarded: false,
    name: "",
    stage: "college",
    className: "",
    stream: "",
    degree: "",
    college: "",
    branch: "",
    semester: null,
    goal: "exam",
    examDate: null,
    targetHoursPerDay: 3,
    sessionsPerDay: 3,
    studyDays: [1, 2, 3, 4, 5],
    pomodoroMinutes: 25,
    confidence: {},
    createdAt: null
  };
}

class StudyPilotState {
  constructor() {
    this.currentNav = "dashboard";
    this.activeSyllabusSubject = null;
    this.profile = emptyProfile();
    this.subjects = [];
    this.todaySessions = [];
    this.revisionQueue = [];
    this.recommendations = [];
    this.quizQuestions = [];
    this.quizHistory = [];
    this.focusLog = [];
    this.timetable = [];
    this.timerSettings = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, notifications: true };
    this.load();
  }

  // ---- persistence ------------------------------------------------------

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || data.version !== STORAGE_VERSION) return;
      this.currentNav = data.currentNav || "dashboard";
      this.activeSyllabusSubject = data.activeSyllabusSubject || null;
      this.profile = { ...emptyProfile(), ...(data.profile || {}) };
      this.subjects = (data.subjects || []).map(sub => this.normalizeSubject(sub));
      this.todaySessions = (data.todaySessions || []).map(s => ({ ...s }));
      this.revisionQueue = (data.revisionQueue || []).map(r => ({ ...r }));
      this.recommendations = (data.recommendations || []).map(r => ({ ...r }));
      this.quizQuestions = (data.quizQuestions || []).map(q => ({ ...q }));
      this.quizHistory = (data.quizHistory || []).map(h => ({ ...h }));
      this.focusLog = (data.focusLog || []).map(f => ({ ...f }));
      this.timetable = (data.timetable || []).map(t => ({ ...t }));
      if (data.timerSettings) this.timerSettings = { ...this.timerSettings, ...data.timerSettings };
      if (this.profile.onboarded) {
        this.profile.pomodoroMinutes = this.profile.pomodoroMinutes || this.timerSettings.focusMinutes || 25;
      }
    } catch (e) {
      this.resetAll();
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        currentNav: this.currentNav,
        activeSyllabusSubject: this.activeSyllabusSubject,
        profile: this.profile,
        subjects: this.subjects,
        todaySessions: this.todaySessions,
        revisionQueue: this.revisionQueue,
        recommendations: this.recommendations,
        quizQuestions: this.quizQuestions,
        quizHistory: this.quizHistory,
        focusLog: this.focusLog,
        timetable: this.timetable,
        timerSettings: this.timerSettings
      }));
    } catch (e) { /* storage unavailable — state stays in memory */ }
  }

  resetAll() {
    this.currentNav = "dashboard";
    this.activeSyllabusSubject = null;
    this.profile = emptyProfile();
    this.subjects = [];
    this.todaySessions = [];
    this.revisionQueue = [];
    this.recommendations = [];
    this.quizQuestions = [];
    this.quizHistory = [];
    this.focusLog = [];
    this.timetable = [];
    this.timerSettings = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, notifications: true };
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  normalizeSubject(sub) {
    return {
      id: sub.id,
      key: sub.key,
      name: sub.name,
      code: sub.code,
      color: sub.color,
      custom: !!sub.custom,
      examDate: sub.examDate || null,
      credits: sub.credits || 4,
      hoursPerWeek: sub.hoursPerWeek || 5,
      confidence: sub.confidence || 3,
      chapters: (sub.chapters || []).map(ch => {
        const topics = (ch.topics || []).map(t => ({
          id: t.id,
          name: t.name,
          difficulty: t.difficulty || "Medium",
          importance: t.importance || "Medium",
          completed: !!t.completed,
          mastery: t.mastery != null ? t.mastery : 0
        }));
        return {
          id: ch.id,
          name: ch.name,
          topics,
          mastery: ch.mastery != null ? ch.mastery : this.chapterMastery(topics),
          estimatedHours: ch.estimatedHours || 2
        };
      })
    };
  }

  // ---- onboarding -------------------------------------------------------

  completeOnboarding(draft) {
    const studyDays = (draft.studyDays && draft.studyDays.length) ? [...draft.studyDays].sort() : [1, 2, 3, 4, 5];

    this.profile = {
      ...emptyProfile(),
      onboarded: true,
      name: (draft.name || "Student").trim(),
      stage: draft.stage === "school" ? "school" : "college",
      className: draft.stage === "school" ? String(draft.className || "") : "",
      stream: draft.stage === "school" ? String(draft.stream || "") : "",
      degree: draft.stage === "college" ? String(draft.degree || "") : "",
      college: (draft.college || "").trim(),
      branch: (draft.branch || "").trim(),
      semester: draft.semester ? Number(draft.semester) : null,
      goal: draft.goal || "exam",
      examDate: draft.examDate || null,
      targetHoursPerDay: Number(draft.hours) || 3,
      sessionsPerDay: Number(draft.sessionsPerDay) || 3,
      studyDays,
      pomodoroMinutes: Number(draft.pomodoro) || 25,
      confidence: { ...(draft.confidence || {}) },
      createdAt: new Date().toISOString()
    };

    this.timerSettings = {
      ...this.timerSettings,
      focusMinutes: this.profile.pomodoroMinutes,
      shortBreakMinutes: this.profile.pomodoroMinutes >= 45 ? 10 : 5,
      longBreakMinutes: this.profile.pomodoroMinutes >= 45 ? 20 : 15
    };

    this.subjects = this.buildSubjects(draft);
    this.quizQuestions = questionsForSubjectKeys(this.subjects.filter(s => !s.custom).map(s => s.key));
    this.revisionQueue = this.buildRevisionQueue();
    this.recommendations = this.buildRecommendations();
    this.todaySessions = this.buildTodayPlan();
    this.currentNav = "dashboard";
    this.activeSyllabusSubject = this.subjects[0] ? this.subjects[0].id : null;
    this.quizHistory = [];
    this.focusLog = [];
    this.save();
  }

  buildSubjects(draft) {
    const chosen = (draft.subjectKeys || [])
      .map(key => findCatalogSubject(key))
      .filter(Boolean);

    const list = chosen.map(cat => {
      const level = (draft.confidence && draft.confidence[cat.key]) || 3;
      const seed = confidenceSeed(level);
      return this.normalizeSubject({
        id: "sub-" + cat.key,
        key: cat.key,
        name: cat.name,
        code: cat.code,
        color: cat.color,
        custom: false,
        examDate: draft.examDate || null,
        confidence: level,
        hoursPerWeek: this.hoursForSubject(),
        chapters: cat.chapters.map((ch, ci) => ({
          id: cat.key + "-ch-" + ci,
          name: ch.name,
          estimatedHours: 2,
          topics: ch.topics.map((title, ti) => {
            const jitter = ((ci * 7 + ti * 5) % 13) - 6;
            const mastery = clamp(seed + jitter, 4, 98);
            return {
              id: cat.key + "-ch-" + ci + "-t-" + ti,
              name: title,
              difficulty: ti === 2 ? "Hard" : ti === 1 ? "Medium" : "Easy",
              importance: ti === 1 ? "High" : "Medium",
              completed: mastery >= 75,
              mastery
            };
          })
        }))
      });
    });

    (draft.customSubjects || []).forEach((custom, i) => {
      const name = (custom && custom.name ? custom.name : "").trim();
      if (!name) return;
      const key = "custom-" + i;
      const level = (draft.confidence && draft.confidence[key]) || 3;
      const seed = confidenceSeed(level);
      list.push(this.normalizeSubject({
        id: "sub-" + key,
        key,
        name,
        code: (custom.code || "ELECTIVE").toUpperCase(),
        color: "#64748B",
        custom: true,
        examDate: draft.examDate || null,
        confidence: level,
        hoursPerWeek: this.hoursForSubject(),
        chapters: CUSTOM_SUBJECT_TEMPLATE.chapters.map((ch, ci) => ({
          id: key + "-ch-" + ci,
          name: ch.name,
          estimatedHours: 2,
          topics: ch.topics.map((title, ti) => {
            const jitter = ((ci * 7 + ti * 5) % 13) - 6;
            const mastery = clamp(seed + jitter, 4, 98);
            return {
              id: key + "-ch-" + ci + "-t-" + ti,
              name: title,
              difficulty: ti === 2 ? "Hard" : ti === 1 ? "Medium" : "Easy",
              importance: "Medium",
              completed: mastery >= 75,
              mastery
            };
          })
        }))
      }));
    });

    return list;
  }

  hoursForSubject() {
    const n = Math.max(1, this.profile.sessionsPerDay || 3);
    return Math.max(2, Math.round((this.profile.targetHoursPerDay || 3) * 7 / n));
  }

  // ---- derived helpers --------------------------------------------------

  sessionMinutes() {
    const perDay = this.profile.targetHoursPerDay || 3;
    const count = Math.max(1, this.profile.sessionsPerDay || 3);
    return clamp(Math.round((perDay * 60 / count) / 15) * 15, 20, 90);
  }

  weakestTopic(subject) {
    if (!subject || !subject.chapters.length) return null;
    let best = null;
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        if (!best || (t.mastery || 0) < (best.mastery || 0)) best = t;
      }
    }
    return best;
  }

  subjectsByWeakness() {
    return [...this.subjects].sort((a, b) => this.calculateSubjectProgress(a.id) - this.calculateSubjectProgress(b.id));
  }

  buildTodayPlan(dateISO = todayISO()) {
    if (!this.subjects.length) return [];
    const count = clamp(this.profile.sessionsPerDay || 3, 1, SESSION_SLOTS.length);
    const minutes = this.sessionMinutes();
    const ordered = this.subjectsByWeakness();

    return Array.from({ length: count }, (_, i) => {
      const subject = ordered[i % ordered.length];
      const topic = this.weakestTopic(subject);
      const type = i === 0 ? "Study" : i % 3 === 2 ? "Review" : "Practice";
      return {
        id: "sess-" + dateISO + "-" + i,
        subjectId: subject.id,
        subjectName: subject.name,
        topicName: topic ? topic.name : "",
        title: topic ? topic.name : subject.name,
        time: SESSION_SLOTS[i] || SESSION_SLOTS[SESSION_SLOTS.length - 1],
        type,
        durationMinutes: minutes,
        priority: i === 0 ? "High" : "Medium",
        completed: false,
        scheduledDate: dateISO
      };
    });
  }

  buildRevisionQueue() {
    const flat = [];
    this.subjects.forEach(sub => {
      sub.chapters.forEach(ch => {
        ch.topics.forEach(t => {
          flat.push({ subject: sub, chapter: ch, topic: t });
        });
      });
    });
    flat.sort((a, b) => (a.topic.mastery || 0) - (b.topic.mastery || 0));

    return flat.slice(0, 6).map((entry, i) => ({
      id: "rev-" + entry.topic.id,
      subjectId: entry.subject.id,
      subjectName: entry.subject.name,
      topicName: entry.topic.name,
      reason: entry.topic.mastery < 40
        ? "Rated low confidence in your subject check"
        : "Weakest topic in " + entry.chapter.name,
      intervalLevel: 1 + (i % 3),
      dueDate: i < 2 ? todayISO() : addDaysISO(i - 1),
      masteryScore: entry.topic.mastery || 0,
      completed: false
    }));
  }

  buildRecommendations() {
    const recs = [];
    const weak = this.subjectsByWeakness()[0];

    if (weak) {
      const topic = this.weakestTopic(weak);
      recs.push({
        id: "rec-weak",
        icon: "target",
        tag: "Focus first",
        title: weak.name + " needs the most attention",
        description: "Your confidence check put this subject at " +
          this.calculateSubjectProgress(weak.id) + "% progress. Start with " +
          (topic ? topic.name : "the first chapter") + ".",
        actionText: "Open quiz",
        actionType: "quiz",
        subjectId: weak.id
      });
    }

    if (this.profile.examDate) {
      const days = Math.max(0, Math.ceil((new Date(this.profile.examDate) - new Date(todayISO())) / 86400000));
      recs.push({
        id: "rec-exam",
        icon: "clock",
        tag: "Deadline",
        title: days === 0 ? "Exam is today" : days + " day" + (days === 1 ? "" : "s") + " until your exam",
        description: days > 7
          ? "You have room to work through topics in depth. Keep two sessions a day on your weakest subject."
          : "Switch to active recall: practice questions and revision cards beat re-reading at this stage.",
        actionText: "View study plan",
        actionType: "plan"
      });
    }

    const best = this.subjectsByWeakness()[this.subjects.length - 1];
    if (best && this.subjects.length > 1) {
      recs.push({
        id: "rec-strong",
        icon: "zap",
        tag: "Keep sharp",
        title: "Protect your strength in " + best.name,
        description: "This is your strongest subject. One short revision session a week keeps it from fading.",
        actionText: "Open revision",
        actionType: "revision"
      });
    }

    return recs;
  }

  // ---- computed ---------------------------------------------------------

  chapterMastery(topics) {
    if (!topics.length) return 0;
    return Math.round(topics.reduce((a, t) => a + (t.mastery || 0), 0) / topics.length);
  }

  calculateSubjectProgress(subjectId) {
    const sub = this.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters.length) return 0;
    const sum = sub.chapters.reduce((a, ch) => a + (ch.mastery || 0), 0);
    return Math.round(sum / sub.chapters.length);
  }

  calculateOverallProgress() {
    if (!this.subjects.length) return 0;
    const sum = this.subjects.reduce((a, s) => a + this.calculateSubjectProgress(s.id), 0);
    return Math.round(sum / this.subjects.length);
  }

  hoursToday() {
    const today = todayISO();
    const minutes = this.focusLog
      .filter(f => f.date === today)
      .reduce((a, f) => a + (f.minutes || 0), 0);
    return Math.round((minutes / 60) * 10) / 10;
  }

  totalHours() {
    const minutes = this.focusLog.reduce((a, f) => a + (f.minutes || 0), 0);
    return Math.round((minutes / 60) * 10) / 10;
  }

  weeklyStats() {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const iso = addDaysISO(-i);
      const minutes = this.focusLog
        .filter(f => f.date === iso)
        .reduce((a, f) => a + (f.minutes || 0), 0);
      out.push({
        date: iso,
        day: DAY_SHORT[new Date(iso + "T00:00:00").getDay()],
        hours: Math.round((minutes / 60) * 10) / 10,
        target: this.profile.targetHoursPerDay || 3
      });
    }
    return out;
  }

  studyStreak() {
    const days = new Set(this.focusLog.map(f => f.date));
    if (!days.size) return 0;
    let streak = 0;
    let cursor = todayISO();
    // A streak still counts if today has not been studied yet.
    if (!days.has(cursor)) cursor = addDaysISO(-1);
    while (days.has(cursor)) {
      streak++;
      cursor = new Date(new Date(cursor + "T00:00:00").getTime() - 86400000).toISOString().split("T")[0];
    }
    return streak;
  }

  weeklyConsistency() {
    const stats = this.weeklyStats();
    const active = stats.filter(s => s.hours > 0).length;
    return Math.round((active / 7) * 100);
  }

  dueRevisionCount() {
    const today = todayISO();
    return this.revisionQueue.filter(r => !r.completed && (r.dueDate || "") <= today).length;
  }

  pendingSessions() {
    return this.todaySessions.filter(s => !s.completed).length;
  }

  nextExam() {
    const dates = this.subjects.map(s => s.examDate).filter(Boolean);
    if (this.profile.examDate) dates.push(this.profile.examDate);
    if (!dates.length) return null;
    const sorted = [...new Set(dates)].sort();
    const upcoming = sorted.find(d => d >= todayISO());
    return upcoming || sorted[sorted.length - 1];
  }

  daysToExam() {
    const exam = this.nextExam();
    if (!exam) return null;
    return Math.max(0, Math.ceil((new Date(exam) - new Date(todayISO())) / 86400000));
  }

  hasStudyData() {
    return this.focusLog.length > 0 || this.quizHistory.length > 0;
  }

  // ---- plan maintenance -------------------------------------------------

  ensureTodayPlan() {
    if (!this.profile.onboarded || !this.subjects.length) return;
    const today = todayISO();
    const fresh = this.todaySessions.every(s => s.scheduledDate === today);
    if (!fresh || !this.todaySessions.length) {
      this.todaySessions = this.buildTodayPlan(today);
      this.save();
    }
  }

  regenerateTodayPlan() {
    this.todaySessions = this.buildTodayPlan();
    this.recommendations = this.buildRecommendations();
    this.save();
  }

  planForWeekday(weekday) {
    const today = new Date().getDay();
    if (weekday === today) {
      this.ensureTodayPlan();
      return this.todaySessions;
    }
    if (!(this.profile.studyDays || []).includes(weekday)) return [];
    return this.buildDayPreview(weekday);
  }

  buildDayPreview(weekday) {
    if (!this.subjects.length) return [];
    const ordered = this.subjectsByWeakness();
    const count = clamp(this.profile.sessionsPerDay || 3, 1, SESSION_SLOTS.length);
    const minutes = this.sessionMinutes();
    return Array.from({ length: count }, (_, i) => {
      const subject = ordered[(weekday + i) % ordered.length];
      const topic = this.weakestTopic(subject);
      return {
        id: "preview-" + weekday + "-" + i,
        subjectId: subject.id,
        subjectName: subject.name,
        topicName: topic ? topic.name : "",
        title: topic ? topic.name : subject.name,
        time: SESSION_SLOTS[i],
        type: i === 0 ? "Study" : i % 3 === 2 ? "Review" : "Practice",
        durationMinutes: minutes,
        completed: false,
        preview: true,
        scheduledDate: null
      };
    });
  }

  // ---- mutations --------------------------------------------------------

  recordStudy(minutes, subjectId) {
    if (!minutes) return;
    this.focusLog.push({ date: todayISO(), minutes, subjectId: subjectId || null });
  }

  completeSession(id) {
    const sess = this.todaySessions.find(s => s.id === id);
    if (!sess || sess.completed) return;
    sess.completed = true;
    this.recordStudy(sess.durationMinutes, sess.subjectId);
    this.save();
  }

  logFocusSession(minutes, subjectId) {
    this.recordStudy(minutes, subjectId || null);
    this.todaySessions.unshift({
      id: "timer-" + Date.now(),
      subjectId: subjectId || null,
      subjectName: subjectId ? (this.subjects.find(s => s.id === subjectId) || {}).name || "Focus" : "Focus timer",
      topicName: "Pomodoro session",
      title: "Pomodoro session",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: "Focus",
      durationMinutes: minutes,
      priority: "High",
      completed: true,
      scheduledDate: todayISO()
    });
    this.save();
  }

  markRevisionCompleted(id) {
    const r = this.revisionQueue.find(x => x.id === id);
    if (r) { r.completed = true; this.save(); }
  }

  rateRevision(id, rating) {
    const r = this.revisionQueue.find(x => x.id === id);
    if (!r) return;
    let level = r.intervalLevel || 1;
    if (rating === "Easy") level = Math.min(4, level + 1);
    else if (rating === "Hard") level = 1;
    r.intervalLevel = level;
    r.dueDate = addDaysISO(INTERVAL_DAYS[level] || 1);
    r.completed = true;
    this.save();
  }

  setTopicMastery(subjectId, chapterId, topicId, mastery) {
    const sub = this.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const topic = ch.topics.find(t => t.id === topicId);
    if (!topic) return;
    topic.mastery = mastery;
    topic.completed = mastery >= 70;
    ch.mastery = this.chapterMastery(ch.topics);
    this.recommendations = this.buildRecommendations();
    this.save();
  }

  addQuizResult(result) {
    this.quizHistory.unshift(result);
    this.save();
  }

  // ---- timetable --------------------------------------------------------

  timetableForDay(day) {
    return this.timetable
      .filter(s => Number(s.day) === Number(day))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }

  todayTimetable() {
    return this.timetableForDay(new Date().getDay());
  }

  timetableWeeklyMinutes() {
    return this.timetable.reduce((a, s) => a + Math.max(0, timeToMinutes(s.end) - timeToMinutes(s.start)), 0);
  }

  subjectNameFor(id) {
    const sub = this.subjects.find(s => s.id === id);
    return sub ? sub.name : "";
  }

  addTimetableSlot({ day, start, end, subjectId, label }) {
    const d = Number(day);
    if (isNaN(d) || d < 0 || d > 6) return { ok: false, error: "Choose a day first." };
    if (!start || !end) return { ok: false, error: "Add both a start and an end time." };
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      return { ok: false, error: "The end time has to be after the start time." };
    }
    const clash = this.timetableForDay(d).some(s =>
      timeToMinutes(start) < timeToMinutes(s.end) && timeToMinutes(s.start) < timeToMinutes(end)
    );
    if (clash) return { ok: false, error: "That time overlaps a slot you already have on this day." };

    this.timetable.push({
      id: "slot-" + Date.now() + "-" + Math.round(Math.random() * 999),
      day: d,
      start,
      end,
      subjectId: subjectId || null,
      label: (label || "").trim()
    });
    this.timetable.sort((a, b) => Number(a.day) - Number(b.day) || timeToMinutes(a.start) - timeToMinutes(b.start));
    this.save();
    return { ok: true };
  }

  removeTimetableSlot(id) {
    this.timetable = this.timetable.filter(s => s.id !== id);
    this.save();
  }

  clearTimetableDay(day) {
    this.timetable = this.timetable.filter(s => Number(s.day) !== Number(day));
    this.save();
  }

  clearTimetable() {
    this.timetable = [];
    this.save();
  }
}

const appState = new StudyPilotState();
