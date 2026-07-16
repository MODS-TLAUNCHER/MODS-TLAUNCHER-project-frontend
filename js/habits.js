Session.requireAuth();

const MOODS = [
  { value: "Alegre", emoji: "😄" },
  { value: "Tranquilo", emoji: "😌" },
  { value: "Motivado", emoji: "🚀" },
  { value: "Cansado", emoji: "😴" },
  { value: "Estresado", emoji: "😣" },
  { value: "Triste", emoji: "😢" },
  { value: "Ansioso", emoji: "😰" },
  { value: "Neutral", emoji: "😐" },
];

let selectedMood = null;

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function showAlert(message, type = "success") {
  const area = document.getElementById("alertsArea");
  area.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function renderMoodOptions() {
  const container = document.getElementById("moodOptions");
  container.innerHTML = MOODS.map(
    (m) => `
      <button type="button" class="btn btn-outline-secondary mood-option" data-mood="${m.value}">
        ${m.emoji} ${m.value}
      </button>`
  ).join("");

  container.querySelectorAll(".mood-option").forEach((btn) => {
    btn.addEventListener("click", () => selectMood(btn.dataset.mood));
  });
}

function selectMood(mood) {
  selectedMood = mood;
  document.querySelectorAll(".mood-option").forEach((btn) => {
    const isSelected = btn.dataset.mood === mood;
    btn.classList.toggle("btn-primary", isSelected);
    btn.classList.toggle("btn-outline-secondary", !isSelected);
  });
}

function wireSlider(inputId, valueId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(valueId);
  input.addEventListener("input", () => (label.textContent = input.value));
}

function resetForm() {
  document.getElementById("sleepHours").value = 8;
  document.getElementById("sleepValue").textContent = "8";
  document.getElementById("waterIntake").value = 4;
  document.getElementById("waterValue").textContent = "4";
  document.getElementById("activityMinutes").value = 30;
  document.getElementById("activityValue").textContent = "30";
  document.getElementById("comment").value = "";
  document.getElementById("commentCount").textContent = "0";
  selectMood(null);
}

function fillForm(record) {
  document.getElementById("sleepHours").value = record.sleep_hours;
  document.getElementById("sleepValue").textContent = record.sleep_hours;
  document.getElementById("waterIntake").value = record.water_intake;
  document.getElementById("waterValue").textContent = record.water_intake;
  document.getElementById("activityMinutes").value = record.activity_minutes;
  document.getElementById("activityValue").textContent = record.activity_minutes;
  document.getElementById("comment").value = record.comment || "";
  document.getElementById("commentCount").textContent = (record.comment || "").length;
  selectMood(record.mood);
}

async function loadRecordForDate(date) {
  try {
    const records = await apiFetch(`/daily-records/me?start_date=${date}&end_date=${date}`);
    if (records.length > 0) {
      fillForm(records[0]);
      showAlert("Ya tenías un registro para este día — puedes editarlo.", "info");
    } else {
      resetForm();
    }
  } catch (err) {
    console.error(err);
    resetForm();
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!selectedMood) {
    showAlert("Selecciona un estado de ánimo antes de guardar.", "warning");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Guardando...';

  const payload = {
    date: document.getElementById("recordDate").value,
    sleep_hours: Number(document.getElementById("sleepHours").value),
    water_intake: Number(document.getElementById("waterIntake").value),
    activity_minutes: Number(document.getElementById("activityMinutes").value),
    mood: selectedMood,
    comment: document.getElementById("comment").value || null,
  };

  try {
    await apiFetch("/daily-records/me", { method: "POST", body: payload });
    showAlert('¡Registro guardado! <a href="dashboard.html" class="alert-link">Ir al dashboard</a>');
  } catch (err) {
    showAlert(err.message || "No se pudo guardar el registro.", "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-check me-1"></i> Guardar registro';
  }
}

function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  document.getElementById("navUserName").textContent = user.full_name;
  document.getElementById("adminMenuItem").classList.toggle("d-none", user.role_name !== "Administrador");
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("comment").addEventListener("input", (e) => {
  document.getElementById("commentCount").textContent = e.target.value.length;
});
document.getElementById("recordDate").addEventListener("change", (e) => loadRecordForDate(e.target.value));
document.getElementById("habitForm").addEventListener("submit", handleSubmit);

wireSlider("sleepHours", "sleepValue");
wireSlider("waterIntake", "waterValue");
wireSlider("activityMinutes", "activityValue");

renderMoodOptions();
renderNavUser();

const dateInput = document.getElementById("recordDate");
dateInput.max = todayISO();
const urlParams = new URLSearchParams(window.location.search);
const requestedDate = urlParams.get("date");
dateInput.value = requestedDate && requestedDate <= dateInput.max ? requestedDate : todayISO(); 
loadRecordForDate(dateInput.value);