// StudyPilot - App shell, navigation, icons and shared UI helpers

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  if (!appState.profile.onboarded) {
    renderOnboarding();
    return;
  }
  appState.ensureTodayPlan();
  renderShell();
  navigateTo(appState.currentNav || "dashboard");
}

// ---- tiny helpers -------------------------------------------------------

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function attr(value) {
  return esc(value);
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function firstName() {
  return (appState.profile.name || "there").split(" ")[0];
}

const ICONS = {
  dashboard: `<path d="M4 5.5A1.5 1.5 0 015.5 4h4A1.5 1.5 0 0111 5.5v3A1.5 1.5 0 019.5 10h-4A1.5 1.5 0 014 8.5v-3zM13 5.5A1.5 1.5 0 0114.5 4h4A1.5 1.5 0 0120 5.5v7A1.5 1.5 0 0118.5 14h-4A1.5 1.5 0 0113 12.5v-7zM4 14.5A1.5 1.5 0 015.5 13h4A1.5 1.5 0 0111 14.5v4A1.5 1.5 0 019.5 20h-4A1.5 1.5 0 014 18.5v-4zM13 17.5A1.5 1.5 0 0114.5 16h4a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-1z"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>`,
  book: `<path d="M4 5.5A2.5 2.5 0 016.5 3H19v15H6.5A2.5 2.5 0 004 20.5V5.5z"/><path d="M19 18v3H6.5A2.5 2.5 0 014 18.5"/>`,
  bot: `<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5"/>`,
  quiz: `<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2A2.6 2.6 0 0112 7.5c1.5 0 2.6.9 2.6 2.2 0 1.9-2.6 2-2.6 3.8M12 16.6h.01"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>`,
  revision: `<path d="M4 5v5h5"/><path d="M4.6 10a8 8 0 111.9 7.4"/><path d="M12 8.5V12l2.6 1.6"/>`,
  chart: `<path d="M4 20V6M4 20h16"/><path d="M8 16v-4M12.5 16V8M17 16v-6"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.2a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.2a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.2a1.6 1.6 0 00-1.4 1z"/>`,
  sparkles: `<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>`,
  target: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>`,
  zap: `<path d="M13 3L5 14h5l-1 7 8-11h-5l1-7z"/>`,
  play: `<path d="M8 5.5l11 6.5-11 6.5v-13z"/>`,
  check: `<path d="M5 13l4 4L19 7"/>`,
  arrow: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0115 0"/>`,
  bookOpen: `<path d="M12 6.5v13m0-13C10.6 5.6 8.9 5.2 7 5.2S3.9 5.6 2.5 6.5v13c1.4-.9 3.1-1.3 4.5-1.3s3.1.4 5 1.3m0-13c1.4-.9 3.1-1.3 5-1.3s3.1.4 4.5 1.3v13c-1.4-.9-3.1-1.3-4.5-1.3s-3.1.4-5 1.3"/>`,
  chevron: `<path d="M9 6l6 6-6 6"/>`,
  logout: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>`,
  collapse: `<path d="M15 6l-6 6 6 6"/>`,
  expand: `<path d="M9 6l6 6-6 6"/>`,
  menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  grid: `<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 10h18M9 4v16M15 4v16"/>`,
  flame: `<path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3s1.5-1 1-3c-.5-2 0-4.5 0-4.5z"/>`
};

function icon(name, size = 20, strokeWidth = 1.7) {
  const body = ICONS[name] || ICONS.dashboard;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// ---- navigation ---------------------------------------------------------

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: "dashboard", sub: "Your day at a glance" }]
  },
  {
    label: "Study",
    items: [
      { id: "plan", label: "Study Plan", icon: "calendar", sub: "Your week, blocked out" },
      { id: "timetable", label: "Timetable", icon: "grid", sub: "Your own weekly routine" },
      { id: "syllabus", label: "Syllabus", icon: "book", sub: "Subjects, units and topics" },
      { id: "tutor", label: "AI Tutor", icon: "bot", sub: "Ask about any concept" },
      { id: "quiz", label: "Practice Quiz", icon: "quiz", sub: "Active recall with feedback" }
    ]
  },
  {
    label: "Focus",
    items: [
      { id: "timer", label: "Focus Timer", icon: "clock", sub: "Pomodoro deep work" },
      { id: "revision", label: "Smart Revision", icon: "revision", sub: "Spaced repetition queue" }
    ]
  },
  {
    label: "Progress",
    items: [
      { id: "analytics", label: "Analytics", icon: "chart", sub: "Where your hours go" },
      { id: "settings", label: "Settings", icon: "settings", sub: "Profile and preferences" }
    ]
  }
];

const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);
const MOBILE_NAV_IDS = ["dashboard", "timetable", "quiz", "timer", "analytics"];

const SIDEBAR_KEY = "studypilot_sidebar_collapsed";

function loadSidebarCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === "true"; } catch { return false; }
}

function saveSidebarCollapsed(v) {
  try { localStorage.setItem(SIDEBAR_KEY, String(v)); } catch {}
}

function toggleSidebar() {
  const el = document.getElementById("sidebar-desktop");
  if (!el) return;
  const collapsed = !el.classList.contains("collapsed");
  el.classList.toggle("collapsed", collapsed);
  saveSidebarCollapsed(collapsed);
  const btn = document.getElementById("sidebar-toggle");
  if (btn) {
    btn.innerHTML = collapsed
      ? `${icon("expand", 17)}<span>Expand</span>`
      : `${icon("collapse", 17)}<span>Collapse</span>`;
    btn.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
  }
  document.querySelectorAll("#sidebar-nav .nav-item").forEach(item => {
    const label = item.dataset.label;
    item.title = collapsed ? label : "";
  });
}

// ---- shell --------------------------------------------------------------

function renderShell() {
  const root = document.getElementById("app");
  if (!root) return;
  const collapsed = loadSidebarCollapsed();
  const p = appState.profile;
  const streak = appState.studyStreak();

  root.innerHTML = `
    <div class="sp-shell">
      <aside class="sidebar-desktop ${collapsed ? "collapsed" : ""}" id="sidebar-desktop">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">${icon("bookOpen", 20)}</div>
          <div class="sidebar-logo-text">
            <h1>StudyPilot</h1>
            <span>Study companion</span>
          </div>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav"></nav>

        <div class="sidebar-foot">
          <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleSidebar()" title="${collapsed ? "Expand sidebar" : "Collapse sidebar"}">
            ${collapsed ? icon("expand", 17) + "<span>Expand</span>" : icon("collapse", 17) + "<span>Collapse</span>"}
          </button>
          <div class="sidebar-user" onclick="navigateTo('settings')" title="Open settings">
            <div class="sidebar-avatar">${esc((p.name || "S").charAt(0).toUpperCase())}</div>
            <div class="sidebar-user-meta">
              <div class="nm">${esc(p.name || "Student")}</div>
              <div class="sub">${esc(studentLine(p))}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-wrap">
        <header class="topbar" id="topbar">
          <div>
            <div class="topbar-title" id="topbar-title">Dashboard</div>
            <div class="topbar-sub" id="topbar-sub">Your day at a glance</div>
          </div>
          <div class="topbar-actions">
            <span class="streak-chip" title="Consecutive study days">${icon("flame", 14)} ${streak} day${streak === 1 ? "" : "s"} streak</span>
            <button class="topbar-avatar" onclick="navigateTo('settings')" title="Settings">${esc((p.name || "S").charAt(0).toUpperCase())}</button>
          </div>
        </header>

        <header class="mobile-header">
          <div class="mobile-brand">
            <span class="mobile-brand-mark">SP</span>
            <span class="mobile-brand-name">StudyPilot</span>
          </div>
          <div class="sp-row">
            <span class="streak-chip" style="padding:4px 9px">${icon("flame", 13)} ${streak}</span>
            <button class="icon-btn" onclick="navigateTo('settings')" aria-label="Settings">${icon("settings", 19)}</button>
          </div>
        </header>

        <main id="main-content" class="main-content"></main>
        <nav class="mobile-bottom-nav" id="mobile-bottom-nav"></nav>
      </div>
    </div>
    <div id="modal-root"></div>
    <div id="toast-container"></div>
  `;

  renderSidebarNav();
  renderMobileBottomNav();
}

// One-line description of the student: "Class 9 • PCB", "B.Tech • Sem 5"…
function studentLine(profile) {
  const p = profile || {};
  if (p.stage === "school") return courseLabel(p);
  const degree = degreeLabel(p.degree);
  if (degree && degree !== "Other degree") return courseLabel(p);
  const branch = shortBranch(p.branch);
  const sem = p.semester ? "Sem " + p.semester : "";
  const line = [branch, sem].filter(Boolean).join(" • ");
  return line || "Graduation";
}

function shortBranch(branch) {
  if (!branch) return "Student";
  const map = {
    "Computer Science & Engineering": "CSE",
    "Information Technology": "IT",
    "Electronics & Communication": "ECE",
    "Electrical Engineering": "EEE",
    "Mechanical Engineering": "MECH",
    "Civil Engineering": "CIVIL",
    "Data Science & AI": "DS/AI"
  };
  return map[branch] || branch.split(" ").map(w => w[0]).join("").slice(0, 5).toUpperCase();
}

function renderSidebarNav() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;
  nav.innerHTML = NAV_GROUPS.map(group => `
    <div class="nav-group">${group.label}</div>
    ${group.items.map(item => `
      <button onclick="navigateTo('${item.id}')" class="nav-item ${appState.currentNav === item.id ? "active" : ""}"
              data-nav="${item.id}" data-label="${item.label}" title="">
        ${icon(item.icon, 19)}
        <span>${item.label}</span>
      </button>
    `).join("")}
  `).join("");
}

function renderMobileBottomNav() {
  const nav = document.getElementById("mobile-bottom-nav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.filter(i => MOBILE_NAV_IDS.includes(i.id)).map(item => {
    const active = appState.currentNav === item.id;
    return `
      <button onclick="navigateTo('${item.id}')" class="mobile-bottom-item ${active ? "active" : ""}" data-nav="${item.id}">
        ${icon(item.icon, 21)}
        <span>${item.label.split(" ")[0]}</span>
      </button>
    `;
  }).join("");
}

function navigateTo(navId) {
  const item = NAV_ITEMS.find(n => n.id === navId) || NAV_ITEMS[0];
  appState.currentNav = item.id;
  appState.save();

  document.querySelectorAll("[data-nav]").forEach(el => {
    el.classList.toggle("active", el.dataset.nav === item.id);
  });

  const titleEl = document.getElementById("topbar-title");
  const subEl = document.getElementById("topbar-sub");
  if (titleEl) titleEl.textContent = item.label;
  if (subEl) subEl.textContent = item.sub;

  const c = document.getElementById("main-content");
  if (!c) return;
  c.scrollTop = 0;

  const views = {
    dashboard: renderDashboard,
    plan: renderStudyPlan,
    timetable: renderTimetable,
    syllabus: renderSyllabus,
    tutor: renderAITutor,
    quiz: renderPracticeQuiz,
    timer: renderFocusTimer,
    revision: renderSmartRevision,
    analytics: renderAnalytics,
    settings: renderSettings
  };

  (views[item.id] || renderDashboard)(c);
}

// ---- toast --------------------------------------------------------------

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const colors = { success: "#34D399", error: "#FB7185", info: "#818CF8", warning: "#FBBF24" };
  const toast = document.createElement("div");
  toast.className = "apple-toast";
  toast.innerHTML = `
    <span style="width:7px;height:7px;border-radius:50%;background:${colors[type] || colors.success};flex-shrink:0"></span>
    <span style="flex:1">${esc(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity .25s ease, transform .25s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 260);
  }, 3000);
}

// ---- modal --------------------------------------------------------------

function showModal(title, contentHtml, footerHtml = "") {
  const root = document.getElementById("modal-root");
  if (!root) return;
  root.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
        <div class="sp-between" style="margin-bottom:16px">
          <h2 class="sp-title sp-title--sm">${esc(title)}</h2>
          <button class="icon-btn" onclick="closeModal()" aria-label="Close">${icon("plus", 18).replace('<path d="M12 5v14M5 12h14"/>', '<path d="M6 6l12 12M18 6L6 18"/>')}</button>
        </div>
        ${contentHtml}
        ${footerHtml ? `<div class="sp-row" style="margin-top:20px;justify-content:flex-end">${footerHtml}</div>` : ""}
      </div>
    </div>
  `;
}

function closeModal() {
  const root = document.getElementById("modal-root");
  if (root) root.innerHTML = "";
}
