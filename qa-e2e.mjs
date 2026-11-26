import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";

const failures = [];
const base = pathToFileURL(path.resolve("index.html")).href;

const test = (name, fn) => Promise.resolve().then(fn).then(
  () => console.log("PASS", name),
  e => { failures.push(name); console.log("FAIL", name, e.message); }
);

async function completeOnboarding(page, name = "QA Tester") {
  await page.waitForSelector("#ob-name", { timeout: 5000 });
  await page.fill("#ob-name", name);
  await page.click('button:has-text("Continue")');

  await page.waitForSelector(".ob-subject");
  // Class 10 is preselected, so its subjects are already picked.
  await page.click('button:has-text("Continue")');

  await page.waitForSelector(".ob-level");
  await page.click('button:has-text("Continue")');

  await page.waitForSelector("#ob-goal");
  await page.waitForSelector("#ob-hours");
  await page.click('button:has-text("Continue")');

  await page.waitForSelector('button:has-text("45 min")');
  await page.click('button:has-text("Continue")');

  await page.waitForSelector('button:has-text("Build my study plan")');
  await page.click('button:has-text("Build my study plan")');
  await page.waitForSelector("#main-content", { timeout: 5000 });
  await page.waitForTimeout(300);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(e.message));

  await test("page loads without console errors", async () => {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    if (errors.length) throw new Error(errors.join(" | "));
  });

  await test("new student sees onboarding, not pre-filled data", async () => {
    const wizard = await page.locator("#ob-name").isVisible();
    if (!wizard) throw new Error("onboarding wizard did not render");
    const shell = await page.locator("#main-content").count();
    if (shell !== 0) throw new Error("app shell rendered before onboarding");
  });

  await test("onboarding builds the study space", async () => {
    await completeOnboarding(page, "QA Tester");
    const navs = await page.locator("#sidebar-nav .nav-item").count();
    if (navs !== 10) throw new Error(`expected 10 nav destinations, got ${navs}`);
    const hero = await page.locator(".sp-hero h1").textContent();
    if (!hero.includes("QA")) throw new Error("dashboard did not greet the student: " + hero);
    const info = await page.evaluate(() => ({ subjects: appState.subjects.length, stage: appState.profile.stage, cls: appState.profile.className }));
    if (info.subjects < 4) throw new Error("subjects were not built from the answer: " + info.subjects);
    if (info.stage !== "school" || info.cls !== "10") throw new Error("class was not stored: " + JSON.stringify(info));
    const chip = await page.locator(".sp-hero-chips").textContent();
    if (!chip.includes("Class 10")) throw new Error("hero does not show the class: " + chip);
  });

  await test("navigates to all 10 destinations", async () => {
    const dests = ["dashboard", "plan", "timetable", "syllabus", "tutor", "quiz", "timer", "revision", "analytics", "settings"];
    for (const d of dests) {
      await page.click(`#sidebar-nav button[data-nav="${d}"]`);
      await page.waitForTimeout(250);
      const active = await page.$eval(`#sidebar-nav button[data-nav="${d}"]`, el => el.classList.contains("active")).catch(() => false);
      if (!active) throw new Error(`${d} nav item is not active`);
      const content = await page.locator("#main-content").textContent();
      if (!content.trim()) throw new Error(`${d} rendered empty content`);
    }
  });

  await test("sidebar collapse persists", async () => {
    await page.click("#sidebar-toggle");
    await page.waitForTimeout(300);
    const collapsed = await page.$eval("#sidebar-desktop", el => el.classList.contains("collapsed"));
    if (!collapsed) throw new Error("sidebar did not collapse");
    const stored = await page.evaluate(() => localStorage.getItem("studypilot_sidebar_collapsed"));
    if (stored !== "true") throw new Error("collapse state was not saved");
    await page.click("#sidebar-toggle");
    await page.waitForTimeout(250);
  });

  await test("timer start/pause/reset", async () => {
    await page.click('#sidebar-nav button[data-nav="timer"]');
    await page.waitForTimeout(250);
    await page.click('button:has-text("Start")');
    await page.waitForTimeout(1100);
    const pause = await page.locator('button:has-text("Pause")').isVisible();
    if (!pause) throw new Error("timer did not start");
    await page.click('button:has-text("Reset")');
    await page.waitForTimeout(250);
    const start = await page.locator('button:has-text("Start")').isVisible();
    if (!start) throw new Error("timer did not reset");
  });

  await test("timer zen mode", async () => {
    await page.click('button:has-text("Zen Mode")');
    await page.waitForTimeout(300);
    const zen = await page.locator("#timer-zen-overlay.zen-active").isVisible();
    if (!zen) throw new Error("zen overlay did not appear");
    await page.locator("#timer-zen-overlay").locator('button:has-text("Exit Zen")').click();
    await page.waitForTimeout(300);
    const gone = await page.locator("#timer-zen-overlay.zen-active").isVisible().catch(() => false);
    if (gone) throw new Error("zen did not exit");
  });

  await test("quiz runs end to end", async () => {
    await page.click('#sidebar-nav button[data-nav="quiz"]');
    await page.waitForTimeout(250);
    await page.click('button:has-text("Start quiz")');
    await page.waitForTimeout(300);

    for (let i = 0; i < 12; i++) {
      await page.locator(".quiz-option").first().click();
      await page.click('button:has-text("Submit answer")');
      await page.waitForTimeout(120);
      const seeResults = page.locator('button:has-text("See results")');
      if (await seeResults.isVisible().catch(() => false)) {
        await seeResults.click();
        break;
      }
      await page.locator('button:has-text("Next question")').click();
      await page.waitForTimeout(120);
    }

    await page.waitForSelector(".score-ring", { timeout: 4000 });
    const pct = await page.locator(".score-ring").textContent();
    if (!/%/.test(pct)) throw new Error("results screen did not show a score");
  });

  await test("revision rating moves the card forward", async () => {
    await page.click('#sidebar-nav button[data-nav="revision"]');
    await page.waitForTimeout(250);
    const before = await page.locator(".sp-badge--warn").count();
    if (!before) throw new Error("no due revision cards were generated");
    await page.locator('button:has-text("Easy")').first().click();
    await page.waitForTimeout(300);
    const after = await page.locator(".sp-badge--warn").count();
    if (after >= before) throw new Error("rating did not change the due date");
  });

  await test("analytics renders chart with empty-safe tracks", async () => {
    await page.click('#sidebar-nav button[data-nav="analytics"]');
    await page.waitForTimeout(300);
    const bars = await page.locator("#analytics-weekly-chart rect").count();
    if (bars === 0) throw new Error("analytics chart has no bars");
  });

  await test("settings save persists", async () => {
    await page.click('#sidebar-nav button[data-nav="settings"]');
    await page.waitForTimeout(250);
    await page.fill("#setting-name", "QA Tester");
    await page.click('button:has-text("Save Profile")');
    await page.waitForTimeout(400);
    const name = await page.inputValue("#setting-name");
    if (name !== "QA Tester") throw new Error("settings save did not persist: " + name);
  });

  await test("timetable builder saves and persists a slot", async () => {
    await page.click('#sidebar-nav button[data-nav="timetable"]');
    await page.waitForTimeout(300);
    await page.fill("#tt-label", "School period");
    await page.fill("#tt-start", "09:00");
    await page.fill("#tt-end", "10:30");
    await page.click('button:has-text("Add to timetable")');
    await page.waitForTimeout(300);

    const saved = await page.evaluate(() => appState.timetable.length);
    if (saved !== 1) throw new Error("slot was not saved: " + saved);

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => appState.timetable.length);
    if (after !== 1) throw new Error("timetable did not survive a refresh: " + after);
    await page.click('#sidebar-nav button[data-nav="timetable"]');
    await page.waitForTimeout(300);
    const text = await page.locator("#main-content").textContent();
    if (!text.includes("School period")) throw new Error("saved slot is not shown on the page");
  });

  await test("settings switches from school to graduation", async () => {
    await page.click('#sidebar-nav button[data-nav="settings"]');
    await page.waitForTimeout(300);
    await page.selectOption("#setting-course", "college:btech");
    await page.waitForTimeout(300);
    const p = await page.evaluate(() => ({ stage: appState.profile.stage, degree: appState.profile.degree }));
    if (p.stage !== "college" || p.degree !== "btech") throw new Error("course switch failed: " + JSON.stringify(p));
    const hasSemester = await page.locator("#setting-semester").count();
    if (!hasSemester) throw new Error("semester field missing for a degree course");
    await page.selectOption("#setting-course", "school:10");
    await page.waitForTimeout(300);
  });

  await test("state survives a refresh without re-onboarding", async () => {
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const wizard = await page.locator("#ob-name").count();
    if (wizard !== 0) throw new Error("onboarding repeated after refresh");
    await page.click('#sidebar-nav button[data-nav="settings"]');
    await page.waitForTimeout(300);
    const name = await page.inputValue("#setting-name");
    if (name !== "QA Tester") throw new Error("localStorage did not persist name: " + name);
  });

  await test("mobile responsive layout", async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(350);
    const bottomNav = await page.locator(".mobile-bottom-nav").isVisible();
    if (!bottomNav) throw new Error("mobile bottom nav not rendered");
    const sidebar = await page.locator("#sidebar-desktop").isVisible();
    if (sidebar) throw new Error("desktop sidebar should be hidden on mobile");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(250);
  });

  await test("reset clears data and returns to onboarding", async () => {
    await page.click('#sidebar-nav button[data-nav="settings"]');
    await page.waitForTimeout(250);
    await page.click('button:has-text("Reset All Data")');
    await page.waitForTimeout(250);
    await page.locator('.modal-content button:has-text("Reset")').click();
    await page.waitForSelector("#ob-name", { timeout: 4000 });
    const stored = await page.evaluate(() => localStorage.getItem("studypilot_v2"));
    if (stored) throw new Error("storage was not cleared on reset");
  });

  await test("no runtime errors during the run", async () => {
    if (errors.length) throw new Error(errors.join(" | "));
  });

  await browser.close();

  console.log(failures.length ? `\n${failures.length} FAILURE(S): ${failures.join(", ")}` : "\nALL QA TESTS PASSED");
  process.exit(failures.length ? 1 : 0);
})();
