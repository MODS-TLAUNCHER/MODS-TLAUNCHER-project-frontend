const NOTIFIED_KEY = "biunestar_notified_reminders";
const CHECK_INTERVAL_MS = 60 * 1000;

function getNotifiedSet() {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedSet(set) {
  sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

function ensureToastContainer() {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1080";
    document.body.appendChild(container);
  }
  return container;
}

function showReminderToast(message) {
  const container = ensureToastContainer();
  const toastEl = document.createElement("div");
  toastEl.className = "toast align-items-center text-bg-primary border-0";
  toastEl.setAttribute("role", "alert");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fas fa-bell me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toastEl);

  if (window.bootstrap && bootstrap.Toast) {
    const toast = new bootstrap.Toast(toastEl, { delay: 8000 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  } else {
    toastEl.style.display = "block";
    setTimeout(() => toastEl.remove(), 8000);
  }
}

function showReminderNotification(reminder) {
  const body = reminder.message || "Es hora de cuidar tu bienestar.";

  if (window.Notification && Notification.permission === "granted") {
    const notification = new Notification("biUNestar - Recordatorio", {
      body,
      icon: "assets/icon.png",
      tag: `reminder-${reminder.id}`,
    });
    notification.onclick = () => window.focus();
  } else {
    showReminderToast(body);
  }
}

async function checkReminders() {
  if (!Session.isAuthenticated()) return;

  try {
    const reminders = await apiFetch("/reminders/me");
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const todayPrefix = now.toISOString().split("T")[0];

    const notified = getNotifiedSet();
    let changed = false;

    reminders
      .filter((r) => r.active && r.time && r.time.slice(0, 5) === currentHM)
      .forEach((r) => {
        const key = `${todayPrefix}-${r.id}-${currentHM}`;
        if (!notified.has(key)) {
          showReminderNotification(r);
          notified.add(key);
          changed = true;
        }
      });

    if (changed) saveNotifiedSet(notified);
  } catch (err) {
    console.error("No se pudieron revisar los recordatorios:", err);
  }
}

function renderPermissionBanner() {
  const area = document.getElementById("alertsArea");
  if (!area || !window.Notification || Notification.permission !== "default") return;

  const banner = document.createElement("div");
  banner.className = "alert alert-info alert-dismissible fade show";
  banner.innerHTML = `
    <i class="fas fa-bell me-1"></i>
    Activa las notificaciones del navegador para que tus recordatorios te avisen aunque tengas otra pestaña abierta.
    <button type="button" class="btn btn-sm btn-info ms-2" id="enableNotifsBtn">Activar</button>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  area.appendChild(banner);

  document.getElementById("enableNotifsBtn").addEventListener("click", () => {
    Notification.requestPermission().then(() => banner.remove());
  });
}

function initReminderNotifications() {
  if (!Session.isAuthenticated()) return;
  renderPermissionBanner();
  checkReminders();
  setInterval(checkReminders, CHECK_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", initReminderNotifications);