// StudyPilot - AI Tutor

const tutorState = {
  messages: [],
  typing: false
};

const TUTOR_RESPONSES = {
  "Explain recursion with a simple example": {
    text: "**Recursion** is when a function solves a problem by calling itself on a smaller version of it.\n\n**Example — factorial:**\n```\nfunction factorial(n) {\n  if (n === 0) return 1;        // base case\n  return n * factorial(n - 1);  // smaller subproblem\n}\nfactorial(5) → 5×4×3×2×1 = 120\n```\n**Three parts every recursion needs:**\n1. **Base case** — stops the chain (n === 0)\n2. **Recursive case** — the problem shrinks each call\n3. **Progress** — each call must move toward the base case\n\n**Where it shows up:** tree traversals, merge sort, divide and conquer, backtracking."
  },
  "What is database normalization?": {
    text: "**Normalization** organises relations to remove redundancy and update anomalies.\n\n**The normal forms:**\n- **1NF** — atomic values, no repeating groups\n- **2NF** — 1NF + no partial dependency on part of a composite key\n- **3NF** — 2NF + no transitive dependency\n- **BCNF** — every determinant is a candidate key\n\n**Example:** `Student(ID, Name, CourseID, CourseName)` has CourseID → CourseName. Split it into `Student(ID, Name, CourseID)` and `Course(ID, CourseName)`.\n\n**Trade-off:** more joins at read time, far fewer inconsistencies at write time."
  },
  "How do OS scheduling algorithms work?": {
    text: "**CPU scheduling** decides which ready process runs next.\n\n| Algorithm | Idea | Starvation |\n|---|---|---|\n| FCFS | Arrival order | No |\n| SJF | Shortest job first | Yes |\n| Round Robin | Fixed time slice | No |\n| Priority | Highest priority first | Yes |\n| MLFQ | Multiple feedback queues | No |\n\n**What to optimise:** average waiting time, turnaround time, CPU utilisation, response time.\n\nSJF gives the lowest average waiting time but needs future knowledge; Round Robin is fair and preemptive; MLFQ approximates SJF without knowing the future."
  },
  "Explain TCP vs UDP differences": {
    text: "**TCP vs UDP:**\n\n| | TCP | UDP |\n|---|---|---|\n| Connection | Handshake | Connectionless |\n| Delivery | Guaranteed, ordered | Best effort |\n| Overhead | Higher | Minimal |\n| Used by | HTTP, SSH, email | DNS, VoIP, games |\n\n**TCP** establishes a session with SYN → SYN+ACK → ACK, then handles retransmission, ordering and flow control.\n\n**Choose UDP** when a late packet is worse than a lost one — live video, voice, real-time games."
  }
};

function tutorPrompts() {
  const keys = new Set(appState.subjects.map(s => s.key));
  const list = [];
  if (keys.has("dsa")) list.push("Explain recursion with a simple example");
  if (keys.has("dbms")) list.push("What is database normalization?");
  if (keys.has("os")) list.push("How do OS scheduling algorithms work?");
  if (keys.has("cn")) list.push("Explain TCP vs UDP differences");
  const weak = appState.subjectsByWeakness()[0];
  if (weak) {
    const topic = appState.weakestTopic(weak);
    if (topic) list.push("Explain " + topic.name + " in " + weak.name + " for my exam");
  }
  if (!list.length) list.push("How should I revise for an exam?", "How do I build a study habit?");
  return list.slice(0, 5);
}

function getAITutorResponse(question) {
  const lower = question.toLowerCase();
  for (const [key, val] of Object.entries(TUTOR_RESPONSES)) {
    const probe = key.toLowerCase().split(" ").slice(0, 3).join(" ");
    if (lower.includes(probe)) return val.text;
  }

  const subjectNames = appState.subjects.map(s => s.name);
  const matched = subjectNames.find(name => lower.includes(name.toLowerCase().split(" ")[0].toLowerCase()));

  return `**${question.replace(/\?+$/, "")}**\n\nHere is how I would approach this in ${matched || "your syllabus"}:\n\n**1. Definition** — write the concept in one sentence, in your own words.\n\n**2. Mechanism** — sketch the steps, diagram or algorithm. If you cannot draw it, you do not know it yet.\n\n**3. Worked example** — solve one small case completely before touching a harder one.\n\n**4. Edge cases** — what breaks it? Empty input, duplicates, worst case?\n\n**5. Active recall** — close your notes and explain it out loud. Then take a practice quiz on that topic.\n\nTell me which part is unclear and I will go deeper.`;
}

function renderAITutor(container) {
  if (!tutorState.messages.length) {
    const names = appState.subjects.slice(0, 3).map(s => s.name).join(", ");
    tutorState.messages = [{
      role: "assistant",
      text: `Hi ${firstName()} — I'm your StudyPilot tutor.\n\nI can walk through concepts${names ? " from " + names : ""}, work through problems, and help you plan revision.\n\nWhat do you want to understand today?`,
      time: now()
    }];
  }

  container.innerHTML = `
    <div class="sp-page sp-page--narrow" style="height:100%">
      <div class="sp-between" style="flex-wrap:wrap;gap:10px">
        <div>
          <h2 class="sp-title">AI tutor</h2>
          <p class="sp-sub">Explanations tied to the subjects you are actually taking.</p>
        </div>
        <span class="sp-badge sp-badge--brand">${icon("sparkles", 13)} Assistant</span>
      </div>

      <div class="tutor-shell">
        <div class="sp-wrap" style="gap:6px;padding-bottom:10px;flex-shrink:0;overflow-x:auto">
          ${tutorPrompts().map(p => `
            <button class="quick-prompt" onclick="sendTutorMessage(${JSON.stringify(p).replace(/"/g, "&quot;")})">${esc(p)}</button>
          `).join("")}
        </div>

        <div class="tutor-log" id="tutor-messages">
          ${tutorState.messages.map(renderTutorMessage).join("")}
        </div>

        <div class="tutor-input-bar">
          <input type="text" id="tutor-input" placeholder="Ask about any concept, problem or exam topic…"
                 onkeydown="if(event.key==='Enter')submitTutorMessage()">
          <button class="sp-btn sp-btn--primary" onclick="submitTutorMessage()">Send</button>
        </div>
      </div>
    </div>
  `;

  scrollTutorBottom();
}

function renderTutorMessage(msg) {
  const isUser = msg.role === "user";
  return `
    <div style="display:flex;${isUser ? "justify-content:flex-end" : ""}">
      ${isUser ? "" : `<div class="chat-avatar">AI</div>`}
      <div class="${isUser ? "chat-bubble-user" : "chat-bubble-assistant"}" style="max-width:80%;padding:12px 15px">
        <div style="font-size:0.85rem;line-height:1.65;${isUser ? "color:#fff" : "color:var(--ink)"}">${formatTutorText(msg.text)}</div>
        <p style="font-size:0.64rem;margin:6px 0 0;text-align:${isUser ? "right" : "left"};color:${isUser ? "rgba(255,255,255,0.72)" : "var(--muted-2)"}">${esc(msg.time || "")}</p>
      </div>
    </div>
  `;
}

function formatTutorText(text) {
  return esc(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code style="background:var(--surface-2);padding:1px 5px;border-radius:5px;font-family:ui-monospace,monospace;font-size:0.85em">$1</code>')
    .replace(/\n/g, "<br>");
}

function sendTutorMessage(text) {
  tutorState.messages.push({ role: "user", text, time: now() });
  renderAITutor(document.getElementById("main-content"));
  pushTutorReply(text);
}

function submitTutorMessage() {
  const input = document.getElementById("tutor-input");
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = "";
  tutorState.messages.push({ role: "user", text, time: now() });
  const log = document.getElementById("tutor-messages");
  if (log) {
    log.insertAdjacentHTML("beforeend", renderTutorMessage({ role: "user", text, time: now() }));
    log.insertAdjacentHTML("beforeend", `
      <div id="typing-indicator" style="display:flex;align-items:center;gap:8px">
        <div class="chat-avatar">AI</div>
        <div class="chat-bubble-assistant" style="padding:12px 16px;display:flex;gap:4px;align-items:center">
          <span class="typing-dot"></span>
          <span class="typing-dot" style="animation-delay:.15s"></span>
          <span class="typing-dot" style="animation-delay:.3s"></span>
        </div>
      </div>
    `);
    scrollTutorBottom();
  }
  pushTutorReply(text);
}

function pushTutorReply(text) {
  setTimeout(() => {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
    const reply = { role: "assistant", text: getAITutorResponse(text), time: now() };
    tutorState.messages.push(reply);
    const log = document.getElementById("tutor-messages");
    if (log) {
      log.insertAdjacentHTML("beforeend", renderTutorMessage(reply));
      scrollTutorBottom();
    }
  }, 700);
}

function scrollTutorBottom() {
  const el = document.getElementById("tutor-messages");
  if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 40);
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
