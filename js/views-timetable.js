// StudyPilot - Timetable builder
// A section the student fills in themselves: school periods, tuition, revision
// blocks. Nothing in here is generated for them.

let ttDay = null;

function ttSelectedDay() {
  return ttDay == null ? new Date().getDay() : ttDay;
}

function ttMinutes(slots) {
  return slots.reduce((a, s) => a + Math.max(0, timeToMinutes(s.end) - timeToMinutes(s.start)), 0);
}

function ttClock(hm) {
  return clockLabel(hm).replace(" AM", "am").replace(" PM", "pm");
}

function ttShortClock(hm) {
  return clockLabel(hm).replace(/ (AM|PM)$/, "");
}

function ttSlotTitle(slot) {
  return slot.label || appState.subjectNameFor(slot.subjectId) || "Study slot";
}

function renderTimetable(container) {
  const today = new Date().getDay();
  const selected = ttSelectedDay();
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const slots = appState.timetableForDay(selected);
  const weekly = appState.timetableWeeklyMinutes();
  const hasAny = appState.timetable.length > 0;
  const plannedHours = Math.round(ttMinutes(slots) / 6) / 10;

  container.innerHTML = `
    <div class="sp-page sp-page--narrow">
      <div class="sp-between" style="align-items:flex-start;flex-wrap:wrap;gap:12px">
        <div>
          <h2 class="sp-title">My timetable</h2>
          <p class="sp-sub">Your own weekly routine — school periods, coaching, revision blocks. Build it the way your week actually runs.</p>
        </div>
        ${hasAny ? `<button class="sp-btn sp-btn--ghost sp-btn--sm" onclick="ttConfirmClearAll()">Clear all</button>` : ""}
      </div>

      <div class="sp-wrap" style="gap:6px">
        ${dayOrder.map(d => {
          const count = appState.timetableForDay(d).length;
          return `
            <button class="tt-day ${d === selected ? "on" : ""}" data-day="${d}" onclick="ttSelectDay(${d})">
              <span class="tt-day-name">${DAY_SHORT[d]}</span>
              <span class="tt-day-count">${count || "–"}</span>
            </button>
          `;
        }).join("")}
      </div>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">${DAY_NAMES[selected]}</h3>
            <p class="sp-card-desc">${slots.length
              ? `${slots.length} slot${slots.length === 1 ? "" : "s"} • ${plannedHours} h scheduled`
              : "Nothing planned yet"}</p>
          </div>
          ${selected === today ? `<span class="sp-badge sp-badge--brand">Today</span>` : `<span class="sp-badge">${DAY_SHORT[selected]}</span>`}
        </div>
        ${slots.length
          ? `<div class="sp-list">${slots.map(ttSlotRow).join("")}</div>
             <div class="sp-row" style="margin-top:14px">
               <button class="sp-btn sp-btn--ghost sp-btn--sm" onclick="ttClearDay(${selected})">Clear ${DAY_SHORT[selected]}</button>
             </div>`
          : emptyState("calendar", "No slots on " + DAY_NAMES[selected],
              "Add your first period below — a class, a tuition batch or a study block.",
              `<button class="sp-btn sp-btn--outline sp-btn--sm" onclick="document.getElementById('tt-label').focus()">Add a slot</button>`)}
      </section>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Add a slot</h3>
            <p class="sp-card-desc">It will be saved to ${DAY_NAMES[selected]}</p>
          </div>
        </div>
        <div class="sp-form-grid">
          <div class="sp-field">
            <label class="sp-label" for="tt-subject">Subject</label>
            <select class="sp-select" id="tt-subject">
              <option value="">Other / break</option>
              ${appState.subjects.map(s => `<option value="${attr(s.id)}">${esc(s.name)}</option>`).join("")}
            </select>
          </div>
          <div class="sp-field">
            <label class="sp-label" for="tt-label">What is it?</label>
            <input class="sp-input" id="tt-label" placeholder="e.g. School period, Tuition, Maths revision">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="tt-start">Starts</label>
            <input class="sp-input" id="tt-start" type="time" value="16:00">
          </div>
          <div class="sp-field">
            <label class="sp-label" for="tt-end">Ends</label>
            <input class="sp-input" id="tt-end" type="time" value="17:30">
          </div>
        </div>
        <div class="sp-row" style="margin-top:16px">
          <button class="sp-btn sp-btn--primary" onclick="ttAddSlot()">${icon("plus", 15)} Add to timetable</button>
        </div>
      </section>

      <section class="sp-card">
        <div class="sp-card-head">
          <div>
            <h3 class="sp-card-title">Your week</h3>
            <p class="sp-card-desc">${hasAny ? `${Math.round(weekly / 6) / 10} hours scheduled across ${appState.timetable.length} slot${appState.timetable.length === 1 ? "" : "s"}` : "Empty — build it day by day"}</p>
          </div>
        </div>
        <div class="tt-week">
          ${dayOrder.map(d => {
            const list = appState.timetableForDay(d);
            return `
              <div class="tt-week-day">
                <div class="tt-week-head">${DAY_SHORT[d]}</div>
                ${list.length
                  ? list.map(s => `
                      <button class="tt-week-slot" onclick="ttSelectDay(${d})" title="${attr(ttSlotTitle(s))}">
                        <span class="tt-week-time">${esc(ttShortClock(s.start))}</span>
                        <span class="tt-week-name">${esc(ttSlotTitle(s))}</span>
                      </button>
                    `).join("")
                  : `<p class="tt-week-empty">—</p>`}
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function ttSlotRow(slot) {
  const subject = appState.subjects.find(s => s.id === slot.subjectId);
  const minutes = Math.max(0, timeToMinutes(slot.end) - timeToMinutes(slot.start));
  return `
    <div class="sp-row-item">
      <div class="row-main">
        <div class="row-mark">${esc(ttShortClock(slot.start))}</div>
        <div class="row-body">
          <div class="row-title">${esc(ttSlotTitle(slot))}</div>
          <div class="row-meta">
            <span>${esc(ttClock(slot.start))} – ${esc(ttClock(slot.end))}</span>
            <span class="row-sep">•</span>
            <span>${minutes} min</span>
            ${subject ? `<span class="row-sep">•</span><span>${esc(subject.name)}</span>` : ""}
          </div>
        </div>
      </div>
      <button class="sp-btn sp-btn--ghost sp-btn--sm" onclick="ttRemoveSlot('${slot.id}')" aria-label="Remove slot">✕</button>
    </div>
  `;
}

function ttRefresh() {
  renderTimetable(document.getElementById("main-content"));
}

function ttSelectDay(day) {
  ttDay = Number(day);
  ttRefresh();
}

function ttAddSlot() {
  const subject = document.getElementById("tt-subject");
  const label = document.getElementById("tt-label");
  const start = document.getElementById("tt-start");
  const end = document.getElementById("tt-end");

  const result = appState.addTimetableSlot({
    day: ttSelectedDay(),
    start: start ? start.value : "",
    end: end ? end.value : "",
    subjectId: subject ? subject.value : "",
    label: label ? label.value : ""
  });

  if (!result.ok) {
    showToast(result.error, "warning");
    return;
  }
  const dayName = DAY_NAMES[ttSelectedDay()];
  ttRefresh();
  showToast("Added to " + dayName + ".");
}

function ttRemoveSlot(id) {
  appState.removeTimetableSlot(id);
  ttRefresh();
  showToast("Slot removed.", "info");
}

function ttClearDay(day) {
  appState.clearTimetableDay(day);
  ttRefresh();
  showToast(DAY_NAMES[day] + " cleared.", "info");
}

function ttConfirmClearAll() {
  showModal(
    "Clear the whole timetable?",
    `<p class="sp-muted" style="line-height:1.6">This removes all ${appState.timetable.length} slots from your week. Your subjects, plan and quiz history stay untouched.</p>`,
    `<button class="sp-btn sp-btn--outline" onclick="closeModal()">Cancel</button>
     <button class="sp-btn sp-btn--danger" onclick="ttClearAllNow()">Clear timetable</button>`
  );
}

function ttClearAllNow() {
  closeModal();
  appState.clearTimetable();
  ttRefresh();
  showToast("Timetable cleared.", "info");
}
