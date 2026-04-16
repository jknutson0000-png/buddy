const STORAGE_KEY = "job-buddy-state-v1";
const DEFAULT_CHECKLIST = [
  "Took pictures?",
  "Got all tools?",
  "Cleaned up?",
  "Customer signed off?",
  "Sent invoice?",
  "Locked door?"
];

const timerPresets = [
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "60 min", seconds: 3600 },
  { label: "90 min", seconds: 5400 }
];

const statusOptions = ["Not Started", "In Progress", "Waiting", "Done", "Follow Up Needed"];

let state = loadState();
let audioContext = null;
let deferredInstallPrompt = null;
let locationWatchId = null;
let lastAlarmSoundAt = 0;
let lastAlarmNoticeAt = 0;
let wakeLock = null;

const jobList = document.getElementById("jobList");
const activeJobView = document.getElementById("activeJobView");
const alarmOverlay = document.getElementById("alarmOverlay");
const checklistModal = document.getElementById("checklistModal");
const installAppButton = document.getElementById("installApp");
const installHelp = document.getElementById("installHelp");
const mobileInstall = document.getElementById("mobileInstall");
const newJobShell = document.getElementById("newJobShell");

document.getElementById("jobForm").addEventListener("submit", addJob);
document.getElementById("enableReminders").addEventListener("click", enableReminders);
document.getElementById("testSound").addEventListener("click", testSound);
installAppButton.addEventListener("click", handleInstallApp);
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("input", handleInput);
document.addEventListener("submit", handlePanelSubmit);

setupMobileApp();
render();
setInterval(tick, 1000);
setInterval(saveState, 5000);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return normalizeState(saved);
    }
  } catch (error) {
    console.warn("Saved data could not be read.", error);
  }

  const starterJob = createJob({
    name: "Sink leak repair",
    customer: "Mina Park",
    address: "18 Oak Lane"
  });
  starterJob.status = "In Progress";
  starterJob.timers = [
    createTimer("Check for drips", 900, true),
    createTimer("Cleanup warning", 600, false)
  ];
  starterJob.notes = "Take before and after photos. Check under the cabinet before leaving.";

  return {
    selectedJobId: starterJob.id,
    activeAlarm: null,
    departureJobId: null,
    currentPosition: null,
    locationMessage: "Location watch is off.",
    jobs: [starterJob]
  };
}

function normalizeState(saved) {
  const jobs = Array.isArray(saved.jobs) ? saved.jobs : [];
  const normalizedJobs = jobs.map((job) => ({
    id: job.id || uid("job"),
    name: job.name || "Untitled job",
    customer: job.customer || "",
    address: job.address || "",
    status: statusOptions.includes(job.status) ? job.status : "Not Started",
    notes: job.notes || "",
    site: {
      lat: Number.isFinite(job.site?.lat) ? job.site.lat : null,
      lng: Number.isFinite(job.site?.lng) ? job.site.lng : null,
      radius: Number.isFinite(job.site?.radius) ? job.site.radius : 150,
      wasInside: typeof job.site?.wasInside === "boolean" ? job.site.wasInside : null
    },
    timers: Array.isArray(job.timers) ? job.timers.map(normalizeTimer) : [],
    checklist: Array.isArray(job.checklist) ? job.checklist.map(normalizeCheck) : makeChecklist()
  }));

  return {
    selectedJobId: normalizedJobs.some((job) => job.id === saved.selectedJobId)
      ? saved.selectedJobId
      : normalizedJobs[0]?.id || null,
    activeAlarm: saved.activeAlarm || null,
    departureJobId: saved.departureJobId || null,
    currentPosition: saved.currentPosition || null,
    locationMessage: saved.locationMessage || "Location watch is off.",
    jobs: normalizedJobs
  };
}

function normalizeTimer(timer) {
  return {
    id: timer.id || uid("timer"),
    name: timer.name || "Timer",
    durationSec: Number.isFinite(timer.durationSec) ? timer.durationSec : 600,
    remainingSec: Number.isFinite(timer.remainingSec) ? timer.remainingSec : 600,
    repeat: Boolean(timer.repeat),
    running: Boolean(timer.running),
    nextDueAt: Number.isFinite(timer.nextDueAt) ? timer.nextDueAt : null,
    alarmActive: Boolean(timer.alarmActive),
    alarmStartedAt: Number.isFinite(timer.alarmStartedAt) ? timer.alarmStartedAt : null,
    intensity: Number.isFinite(timer.intensity) ? timer.intensity : 1
  };
}

function normalizeCheck(item) {
  return {
    id: item.id || uid("check"),
    text: item.text || "Checklist item",
    done: Boolean(item.done)
  };
}

function createJob({ name, customer, address }) {
  return {
    id: uid("job"),
    name: name.trim(),
    customer: customer.trim(),
    address: address.trim(),
    status: "Not Started",
    notes: "",
    site: {
      lat: null,
      lng: null,
      radius: 150,
      wasInside: null
    },
    timers: [],
    checklist: makeChecklist()
  };
}

function makeChecklist() {
  return DEFAULT_CHECKLIST.map((text) => ({ id: uid("check"), text, done: false }));
}

function createTimer(name, seconds, repeat) {
  return {
    id: uid("timer"),
    name,
    durationSec: seconds,
    remainingSec: seconds,
    repeat,
    running: false,
    nextDueAt: null,
    alarmActive: false,
    alarmStartedAt: null,
    intensity: 1
  };
}

function uid(prefix) {
  if (crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderJobs();
  renderActiveJob();
  renderAlarm();
  renderDepartureChecklist();
  updateWakeLock();
  saveState();
}

function setupMobileApp() {
  if (window.matchMedia("(max-width: 720px)").matches) {
    newJobShell.removeAttribute("open");
  }

  if (isStandaloneApp()) {
    mobileInstall.classList.add("hidden");
  }

  if (!window.isSecureContext) {
    installHelp.textContent = "Use an HTTPS link for install, location, and phone alerts.";
    installAppButton.textContent = "Needs HTTPS";
    installAppButton.disabled = true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installAppButton.disabled = false;
    installAppButton.textContent = "Install app";
    installHelp.textContent = "This phone can install Job Buddy now.";
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    mobileInstall.classList.add("hidden");
  });

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("Offline app setup failed.", error);
      });
    });
  }
}

async function handleInstallApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return;
  }

  installHelp.textContent = "iPhone: Share, then Add to Home Screen. Android: menu, then Install app.";
  installAppButton.textContent = "Use phone menu";
}

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

async function updateWakeLock() {
  const needsAwake = Boolean(state.activeAlarm)
    || state.jobs.some((job) => job.timers.some((timer) => timer.running));

  if (!("wakeLock" in navigator) || !window.isSecureContext) return;

  if (needsAwake && !wakeLock) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    } catch (error) {
      console.warn("Screen wake lock failed.", error);
    }
  }

  if (!needsAwake && wakeLock) {
    try {
      await wakeLock.release();
    } catch (error) {
      console.warn("Screen wake lock release failed.", error);
    } finally {
      wakeLock = null;
    }
  }
}

function renderJobs() {
  if (!state.jobs.length) {
    jobList.innerHTML = `<p class="small-note">No jobs yet. Add one above.</p>`;
    return;
  }

  jobList.innerHTML = state.jobs
    .map((job) => {
      const isActive = job.id === state.selectedJobId;
      const runningCount = job.timers.filter((timer) => timer.running).length;
      const alarmCount = job.timers.filter((timer) => timer.alarmActive).length;
      const detail = [
        job.customer,
        job.address,
        runningCount ? `${runningCount} timer${runningCount > 1 ? "s" : ""} running` : "",
        alarmCount ? `${alarmCount} alarm${alarmCount > 1 ? "s" : ""}` : ""
      ].filter(Boolean).join(" | ");

      return `
        <button class="job-button ${isActive ? "active" : ""}" type="button" data-action="select-job" data-job-id="${job.id}">
          <strong>${escapeHtml(job.name)}</strong>
          <span>${escapeHtml(detail || "No details yet")}</span>
          <span class="status-pill ${slug(job.status)}">${escapeHtml(job.status)}</span>
        </button>
      `;
    })
    .join("");
}

function renderActiveJob() {
  const job = getSelectedJob();
  if (!job) {
    activeJobView.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>No job selected.</strong>
          <span>Add a job, then timers and checklists will show here.</span>
        </div>
      </div>
    `;
    return;
  }

  activeJobView.innerHTML = `
    <div class="status-row">
      <div class="job-heading">
        <h2>${escapeHtml(job.name)}</h2>
        <p>${escapeHtml(job.customer || "No customer")} ${job.address ? `| ${escapeHtml(job.address)}` : ""}</p>
      </div>
      <label class="field-label">
        Job state
        <select data-action="status-change" data-job-id="${job.id}">
          ${statusOptions
            .map((status) => `<option value="${escapeAttr(status)}" ${status === job.status ? "selected" : ""}>${escapeHtml(status)}</option>`)
            .join("")}
        </select>
      </label>
    </div>

    <div class="quick-actions">
      <button class="button primary" type="button" data-action="start-first-timer" data-job-id="${job.id}">Start timer</button>
      <button class="button secondary" type="button" data-action="demo-arrive" data-job-id="${job.id}">Arrival alert</button>
      <button class="button secondary" type="button" data-action="demo-leave" data-job-id="${job.id}">Leaving alert</button>
      <button class="button danger" type="button" data-action="delete-job" data-job-id="${job.id}">Delete job</button>
    </div>

    <div class="work-grid">
      <div>
        <section class="work-panel" aria-labelledby="timerHeading">
          <h3 id="timerHeading">Timers</h3>
          <div class="timer-list" id="timerList">
            ${renderTimers(job)}
          </div>
          <details class="panel-drawer">
            <summary>Add timer</summary>
            <form class="timer-form" data-form="timer" data-job-id="${job.id}">
              <label>
                Timer name
                <input name="timerName" autocomplete="off" placeholder="Take progress photos" required />
              </label>
              <label>
                Time
                <select name="timerPreset">
                  ${timerPresets.map((preset) => `<option value="${preset.seconds}">${preset.label}</option>`).join("")}
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label>
                Custom min
                <input name="customMinutes" type="number" min="1" max="720" placeholder="20" />
              </label>
              <label class="checkbox-line">
                <input name="repeat" type="checkbox" />
                Repeat
              </label>
              <button class="button primary" type="submit">Add timer</button>
            </form>
          </details>
        </section>

        <section class="work-panel" aria-labelledby="notesHeading">
          <h3 id="notesHeading">Notes</h3>
          <textarea data-action="notes-change" data-job-id="${job.id}" placeholder="What should you remember for this job?">${escapeHtml(job.notes)}</textarea>
        </section>
      </div>

      <div>
        <section class="work-panel" aria-labelledby="locationHeading">
          <h3 id="locationHeading">Job-site alerts</h3>
          <p class="small-note">Leave this page open for browser location alerts.</p>
          <div class="site-status">
            <strong>${siteLabel(job)}</strong>
            <span>${escapeHtml(state.locationMessage)}</span>
          </div>
          <div class="site-actions">
            <button class="button primary" type="button" data-action="set-site-here" data-job-id="${job.id}">Use my current spot</button>
            <button class="button secondary" type="button" data-action="start-location">Start location watch</button>
          </div>
          <details class="panel-drawer">
            <summary>Site settings</summary>
            <form class="stack" data-form="site" data-job-id="${job.id}">
              <label>
                Address label
                <input name="address" value="${escapeAttr(job.address)}" placeholder="Job site address" />
              </label>
              <label>
                Alert distance in feet
                <input name="radiusFeet" type="number" min="50" max="2000" value="${metersToFeet(job.site.radius)}" />
              </label>
              <button class="button secondary" type="submit">Save site details</button>
            </form>
          </details>
        </section>

        <section class="work-panel" aria-labelledby="checklistHeading">
          <h3 id="checklistHeading">Leaving checklist</h3>
          <ul class="checklist">
            ${renderChecklist(job)}
          </ul>
          <details class="panel-drawer">
            <summary>Edit checklist</summary>
            <form class="button-row" data-form="checklist" data-job-id="${job.id}">
              <label class="sr-only" for="newCheckItem">New checklist item</label>
              <input id="newCheckItem" name="checkItem" autocomplete="off" placeholder="Add one thing to check" required />
              <button class="button primary" type="submit">Add</button>
            </form>
            <div class="checklist-actions">
              <button class="button secondary" type="button" data-action="reset-checklist" data-job-id="${job.id}">Add common list</button>
              <button class="button secondary" type="button" data-action="clear-checklist" data-job-id="${job.id}">Clear checks</button>
            </div>
          </details>
        </section>
      </div>
    </div>
  `;
}

function renderTimers(job) {
  if (!job.timers.length) {
    return `<p class="small-note">No timers yet. Add one above.</p>`;
  }

  return job.timers
    .map((timer) => {
      const percent = 100 - Math.round((timer.remainingSec / timer.durationSec) * 100);
      const clamped = Math.min(100, Math.max(0, percent));
      return `
        <article class="timer-row ${timer.alarmActive ? "alarm" : ""}" data-timer-row="${timer.id}">
          <div class="timer-head">
            <div class="timer-title">
              <strong>${escapeHtml(timer.name)}</strong>
              <span>${timer.repeat ? "Repeats" : "One time"} ${timer.running ? "| Running" : timer.alarmActive ? "| Needs action" : "| Paused"}</span>
            </div>
            <div class="time-left" data-time-left="${timer.id}">${formatTime(timer.remainingSec)}</div>
          </div>
          <div class="timer-bar" aria-hidden="true">
            <div class="timer-fill" data-timer-fill="${timer.id}" style="width: ${clamped}%"></div>
          </div>
          <div class="timer-actions">
            <button class="button primary" type="button" data-action="start-timer" data-job-id="${job.id}" data-timer-id="${timer.id}">${timer.running ? "Pause" : "Start"}</button>
            <button class="button secondary" type="button" data-action="reset-timer" data-job-id="${job.id}" data-timer-id="${timer.id}">Reset</button>
            <button class="button danger" type="button" data-action="delete-timer" data-job-id="${job.id}" data-timer-id="${timer.id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderChecklist(job) {
  if (!job.checklist.length) {
    return `<li class="small-note">No checklist items yet.</li>`;
  }

  return job.checklist
    .map((item) => `
      <li class="check-item">
        <input type="checkbox" data-action="check-toggle" data-job-id="${job.id}" data-check-id="${item.id}" ${item.done ? "checked" : ""} />
        <span>${escapeHtml(item.text)}</span>
        <button class="button danger" type="button" data-action="delete-check" data-job-id="${job.id}" data-check-id="${item.id}">Remove</button>
      </li>
    `)
    .join("");
}

function renderAlarm() {
  const alarm = state.activeAlarm;
  if (!alarm) {
    document.body.classList.remove("alarm-active");
    alarmOverlay.classList.add("hidden");
    alarmOverlay.innerHTML = "";
    return;
  }

  const job = getJob(alarm.jobId);
  if (!job) {
    state.activeAlarm = null;
    renderAlarm();
    return;
  }

  const timer = alarm.timerId ? getTimer(job, alarm.timerId) : null;
  const level = alarm.intensity || 1;
  const title = alarm.type === "arrival"
    ? "You arrived at the job."
    : timer
      ? `${timer.name} is due.`
      : "Reminder due.";
  const body = alarm.type === "arrival"
    ? "Start the job or set a timer before you get pulled away."
    : `${job.name} needs a clear answer now.`;

  document.body.classList.add("alarm-active");
  alarmOverlay.classList.remove("hidden");
  alarmOverlay.innerHTML = `
    <div class="alarm-card">
      <span class="alarm-level">Reminder level ${level}</span>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body)}</p>
      <div class="alarm-actions">
        <button class="button primary" type="button" data-action="alarm-done">Done</button>
        <button class="button secondary" type="button" data-action="alarm-snooze">Snooze 5 min</button>
        <button class="button secondary" type="button" data-action="alarm-help">Need Help</button>
        <button class="button danger" type="button" data-action="alarm-blocked">Blocked</button>
      </div>
    </div>
  `;
}

function renderDepartureChecklist() {
  const job = state.departureJobId ? getJob(state.departureJobId) : null;
  if (!job) {
    checklistModal.classList.add("hidden");
    checklistModal.innerHTML = "";
    return;
  }

  const allDone = job.checklist.length === 0 || job.checklist.every((item) => item.done);
  checklistModal.classList.remove("hidden");
  checklistModal.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">
        <strong>Before you leave</strong>
        <h2>${escapeHtml(job.name)}</h2>
      </div>
      <p>Check each item so you do not have to drive back later.</p>
      <div class="modal-checklist">
        ${job.checklist.length
          ? job.checklist.map((item) => `
            <label class="modal-check">
              <input type="checkbox" data-action="modal-check-toggle" data-job-id="${job.id}" data-check-id="${item.id}" ${item.done ? "checked" : ""} />
              <span>${escapeHtml(item.text)}</span>
            </label>
          `).join("")
          : `<p class="small-note">No checklist items for this job.</p>`}
      </div>
      <div class="button-row">
        <button class="button secondary" type="button" data-action="modal-mark-all" data-job-id="${job.id}">Mark all done</button>
        <button class="button primary" type="button" data-action="modal-finish" ${allDone ? "" : "disabled"}>Finish leaving</button>
        <button class="button danger" type="button" data-action="modal-keep-open">Close for now</button>
      </div>
    </div>
  `;
}

function addJob(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("jobName") || "").trim();
  if (!name) return;

  const job = createJob({
    name,
    customer: String(formData.get("jobCustomer") || ""),
    address: String(formData.get("jobAddress") || "")
  });
  state.jobs.unshift(job);
  state.selectedJobId = job.id;
  form.reset();
  render();
}

function handlePanelSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id === "jobForm") return;

  const kind = form.dataset.form;
  const job = getJob(form.dataset.jobId);
  if (!job) return;
  event.preventDefault();

  if (kind === "timer") {
    const formData = new FormData(form);
    const name = String(formData.get("timerName") || "").trim();
    const preset = String(formData.get("timerPreset") || "");
    const customMinutes = Number(formData.get("customMinutes"));
    const seconds = preset === "custom" ? Math.max(60, Math.round(customMinutes * 60)) : Number(preset);
    if (!name || !Number.isFinite(seconds)) return;
    job.timers.push(createTimer(name, seconds, formData.get("repeat") === "on"));
    form.reset();
    render();
  }

  if (kind === "checklist") {
    const text = String(new FormData(form).get("checkItem") || "").trim();
    if (!text) return;
    job.checklist.push({ id: uid("check"), text, done: false });
    form.reset();
    render();
  }

  if (kind === "site") {
    const formData = new FormData(form);
    job.address = String(formData.get("address") || "").trim();
    const feet = Number(formData.get("radiusFeet"));
    if (Number.isFinite(feet)) {
      job.site.radius = Math.max(15, feetToMeters(feet));
    }
    state.locationMessage = "Job-site details saved.";
    render();
  }
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const job = target.dataset.jobId ? getJob(target.dataset.jobId) : getSelectedJob();
  const timer = job && target.dataset.timerId ? getTimer(job, target.dataset.timerId) : null;
  const check = job && target.dataset.checkId ? getCheck(job, target.dataset.checkId) : null;

  if (action === "select-job" && job) {
    state.selectedJobId = job.id;
    render();
  }

  if (action === "delete-job" && job) {
    state.jobs = state.jobs.filter((item) => item.id !== job.id);
    state.selectedJobId = state.jobs[0]?.id || null;
    if (state.departureJobId === job.id) state.departureJobId = null;
    if (state.activeAlarm?.jobId === job.id) state.activeAlarm = null;
    render();
  }

  if (action === "start-first-timer" && job) {
    const next = job.timers.find((item) => !item.running && !item.alarmActive) || job.timers[0];
    if (next) startTimer(next);
    render();
  }

  if (action === "start-timer" && timer) {
    timer.running ? pauseTimer(timer) : startTimer(timer);
    render();
  }

  if (action === "reset-timer" && timer) {
    resetTimer(timer);
    render();
  }

  if (action === "delete-timer" && job && timer) {
    job.timers = job.timers.filter((item) => item.id !== timer.id);
    if (state.activeAlarm?.timerId === timer.id) state.activeAlarm = findNextAlarm();
    render();
  }

  if (action === "delete-check" && job && check) {
    job.checklist = job.checklist.filter((item) => item.id !== check.id);
    render();
  }

  if (action === "reset-checklist" && job) {
    const existing = new Set(job.checklist.map((item) => item.text.toLowerCase()));
    DEFAULT_CHECKLIST.forEach((text) => {
      if (!existing.has(text.toLowerCase())) {
        job.checklist.push({ id: uid("check"), text, done: false });
      }
    });
    render();
  }

  if (action === "clear-checklist" && job) {
    job.checklist.forEach((item) => {
      item.done = false;
    });
    render();
  }

  if (action === "set-site-here" && job) {
    setSiteHere(job);
  }

  if (action === "start-location") {
    startLocationWatch();
  }

  if (action === "demo-arrive" && job) {
    triggerArrival(job);
  }

  if (action === "demo-leave" && job) {
    triggerDeparture(job);
  }

  if (action.startsWith("alarm-")) {
    resolveAlarm(action.replace("alarm-", ""));
  }

  if (action === "modal-mark-all" && job) {
    job.checklist.forEach((item) => {
      item.done = true;
    });
    render();
  }

  if (action === "modal-finish") {
    state.departureJobId = null;
    render();
  }

  if (action === "modal-keep-open") {
    state.departureJobId = null;
    render();
  }
}

function handleChange(event) {
  const target = event.target;
  const action = target.dataset.action;
  const job = target.dataset.jobId ? getJob(target.dataset.jobId) : null;
  const check = job && target.dataset.checkId ? getCheck(job, target.dataset.checkId) : null;

  if (action === "status-change" && job) {
    job.status = target.value;
    render();
  }

  if ((action === "check-toggle" || action === "modal-check-toggle") && check) {
    check.done = target.checked;
    render();
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.dataset.action !== "notes-change") return;
  const job = getJob(target.dataset.jobId);
  if (!job) return;
  job.notes = target.value;
  saveState();
}

function startTimer(timer) {
  timer.alarmActive = false;
  timer.running = true;
  timer.nextDueAt = Date.now() + Math.max(1, timer.remainingSec) * 1000;
}

function pauseTimer(timer) {
  if (timer.nextDueAt) {
    timer.remainingSec = Math.max(0, Math.ceil((timer.nextDueAt - Date.now()) / 1000));
  }
  timer.running = false;
  timer.nextDueAt = null;
}

function resetTimer(timer) {
  timer.remainingSec = timer.durationSec;
  timer.running = false;
  timer.nextDueAt = null;
  timer.alarmActive = false;
  timer.alarmStartedAt = null;
  timer.intensity = 1;
  if (state.activeAlarm?.timerId === timer.id) {
    state.activeAlarm = findNextAlarm();
  }
}

function tick() {
  const now = Date.now();
  state.jobs.forEach((job) => {
    job.timers.forEach((timer) => {
      if (!timer.running || !timer.nextDueAt) return;
      timer.remainingSec = Math.max(0, Math.ceil((timer.nextDueAt - now) / 1000));
      if (timer.remainingSec <= 0) {
        triggerTimerAlarm(job, timer);
      }
    });
  });

  updateAlarmLoop();
  refreshTimerDisplays();
}

function triggerTimerAlarm(job, timer) {
  timer.running = false;
  timer.nextDueAt = null;
  timer.remainingSec = 0;
  timer.alarmActive = true;
  timer.alarmStartedAt = Date.now();
  timer.intensity = 1;

  if (!state.activeAlarm) {
    state.activeAlarm = {
      type: "timer",
      jobId: job.id,
      timerId: timer.id,
      startedAt: Date.now(),
      intensity: 1
    };
    lastAlarmSoundAt = 0;
    lastAlarmNoticeAt = 0;
    render();
  }
}

function updateAlarmLoop() {
  const alarm = state.activeAlarm;
  if (!alarm) return;

  const elapsed = Date.now() - alarm.startedAt;
  const intensity = Math.min(5, Math.floor(elapsed / 12000) + 1);
  if (alarm.intensity !== intensity) {
    alarm.intensity = intensity;
    const job = getJob(alarm.jobId);
    const timer = job && alarm.timerId ? getTimer(job, alarm.timerId) : null;
    if (timer) timer.intensity = intensity;
    renderAlarm();
  }

  const soundGap = Math.max(1800, 6400 - intensity * 900);
  if (Date.now() - lastAlarmSoundAt > soundGap) {
    playAlarmPattern(intensity);
    lastAlarmSoundAt = Date.now();
  }

  const noticeGap = Math.max(9000, 28000 - intensity * 3500);
  if (Date.now() - lastAlarmNoticeAt > noticeGap) {
    sendNotification(alarm);
    lastAlarmNoticeAt = Date.now();
  }
}

function resolveAlarm(choice) {
  const alarm = state.activeAlarm;
  if (!alarm) return;
  const job = getJob(alarm.jobId);
  const timer = job && alarm.timerId ? getTimer(job, alarm.timerId) : null;

  if (choice === "done" && timer) {
    timer.alarmActive = false;
    timer.alarmStartedAt = null;
    timer.intensity = 1;
    if (timer.repeat) {
      timer.remainingSec = timer.durationSec;
      startTimer(timer);
    } else {
      timer.remainingSec = timer.durationSec;
    }
  }

  if (choice === "snooze" && timer) {
    timer.alarmActive = false;
    timer.alarmStartedAt = null;
    timer.intensity = 1;
    timer.remainingSec = 300;
    startTimer(timer);
  }

  if (choice === "help" && job) {
    job.status = "Follow Up Needed";
    if (timer) resetTimer(timer);
  }

  if (choice === "blocked" && job) {
    job.status = "Waiting";
    if (timer) resetTimer(timer);
  }

  if (alarm.type === "arrival" && job) {
    job.status = "In Progress";
  }

  state.activeAlarm = findNextAlarm();
  render();
}

function findNextAlarm() {
  for (const job of state.jobs) {
    const timer = job.timers.find((item) => item.alarmActive);
    if (timer) {
      return {
        type: "timer",
        jobId: job.id,
        timerId: timer.id,
        startedAt: timer.alarmStartedAt || Date.now(),
        intensity: timer.intensity || 1
      };
    }
  }
  return null;
}

function refreshTimerDisplays() {
  state.jobs.forEach((job) => {
    job.timers.forEach((timer) => {
      const time = document.querySelector(`[data-time-left="${timer.id}"]`);
      const fill = document.querySelector(`[data-timer-fill="${timer.id}"]`);
      const row = document.querySelector(`[data-timer-row="${timer.id}"]`);
      if (time) time.textContent = formatTime(timer.remainingSec);
      if (fill) {
        const percent = 100 - Math.round((timer.remainingSec / timer.durationSec) * 100);
        fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      }
      if (row) row.classList.toggle("alarm", timer.alarmActive);
    });
  });
}

async function enableReminders() {
  await unlockAudio();
  if ("Notification" in window) {
    await Notification.requestPermission();
  }
  playBeep(740, 120, 0);
}

async function testSound() {
  await unlockAudio();
  playAlarmPattern(2);
}

async function unlockAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function playAlarmPattern(intensity) {
  unlockAudio().then(() => {
    const count = Math.min(5, Math.max(1, intensity));
    for (let index = 0; index < count; index += 1) {
      playBeep(720 + index * 90, 140, index * 190);
    }
  }).catch(() => {});

  if ("vibrate" in navigator) {
    navigator.vibrate(Array.from({ length: intensity }, () => [220, 100]).flat());
  }
}

function playBeep(frequency, duration, delay) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  const startAt = audioContext.currentTime + delay / 1000;
  gain.gain.exponentialRampToValueAtTime(0.24, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration / 1000);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration / 1000 + 0.04);
}

function sendNotification(alarm) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const job = getJob(alarm.jobId);
  const timer = job && alarm.timerId ? getTimer(job, alarm.timerId) : null;
  const title = alarm.type === "arrival" ? "You arrived at the job" : "Job Buddy reminder";
  const body = timer ? `${timer.name} is due for ${job.name}.` : `${job?.name || "Your job"} needs attention.`;
  new Notification(title, {
    body,
    tag: "job-buddy-reminder",
    renotify: true
  });
}

function startLocationWatch() {
  if (!("geolocation" in navigator)) {
    state.locationMessage = "This browser does not support location.";
    render();
    return;
  }

  if (locationWatchId !== null) {
    state.locationMessage = "Location watch is already on.";
    render();
    return;
  }

  locationWatchId = navigator.geolocation.watchPosition(
    updatePosition,
    (error) => {
      state.locationMessage = `Location failed: ${error.message}`;
      render();
    },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
  );
  state.locationMessage = "Location watch is on.";
  render();
}

function setSiteHere(job) {
  const usePosition = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    state.currentPosition = { lat: latitude, lng: longitude, accuracy };
    job.site.lat = latitude;
    job.site.lng = longitude;
    job.site.wasInside = true;
    state.locationMessage = "This job site is set to your current spot.";
    render();
  };

  if (state.currentPosition) {
    usePosition({ coords: {
      latitude: state.currentPosition.lat,
      longitude: state.currentPosition.lng,
      accuracy: state.currentPosition.accuracy || 0
    }});
    return;
  }

  if (!("geolocation" in navigator)) {
    state.locationMessage = "This browser does not support location.";
    render();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    usePosition,
    (error) => {
      state.locationMessage = `Location failed: ${error.message}`;
      render();
    },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
  );
}

function updatePosition(position) {
  const { latitude, longitude, accuracy } = position.coords;
  state.currentPosition = { lat: latitude, lng: longitude, accuracy };
  const parts = [`Location updated`, `accuracy about ${metersToFeet(accuracy)} ft`];
  state.locationMessage = parts.join(" | ");

  state.jobs.forEach((job) => {
    if (!Number.isFinite(job.site.lat) || !Number.isFinite(job.site.lng)) return;
    const distance = distanceMeters(latitude, longitude, job.site.lat, job.site.lng);
    const inside = distance <= job.site.radius;

    if (job.site.wasInside === null) {
      job.site.wasInside = inside;
      return;
    }

    if (!job.site.wasInside && inside) {
      triggerArrival(job);
    }

    if (job.site.wasInside && !inside) {
      triggerDeparture(job);
    }

    job.site.wasInside = inside;
  });

  render();
}

function triggerArrival(job) {
  if (!state.activeAlarm) {
    state.activeAlarm = {
      type: "arrival",
      jobId: job.id,
      timerId: null,
      startedAt: Date.now(),
      intensity: 1
    };
    lastAlarmSoundAt = 0;
    lastAlarmNoticeAt = 0;
  }
  state.selectedJobId = job.id;
  render();
}

function triggerDeparture(job) {
  state.selectedJobId = job.id;
  state.departureJobId = job.id;
  job.checklist.forEach((item) => {
    item.done = false;
  });
  render();
}

function getSelectedJob() {
  return getJob(state.selectedJobId);
}

function getJob(id) {
  return state.jobs.find((job) => job.id === id);
}

function getTimer(job, id) {
  return job.timers.find((timer) => timer.id === id);
}

function getCheck(job, id) {
  return job.checklist.find((item) => item.id === id);
}

function siteLabel(job) {
  if (Number.isFinite(job.site.lat) && Number.isFinite(job.site.lng)) {
    return `Site set: ${metersToFeet(job.site.radius)} ft alert distance`;
  }
  return "No exact job-site point set yet.";
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function feetToMeters(feet) {
  return Math.round(feet * 0.3048);
}

function metersToFeet(meters) {
  return Math.round(meters * 3.28084);
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const radius = 6371000;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)
    + Math.cos(phi1) * Math.cos(phi2)
    * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

function slug(value) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
