Session.requireAuth();

const MOOD_EMOJI = {
  Alegre: "😄",
  Tranquilo: "😌",
  Motivado: "🚀",
  Cansado: "😴",
  Estresado: "😣",
  Triste: "😢",
  Ansioso: "😰",
  Neutral: "😐",
};

function showAlert(message, type = "warning", opts = {}) {
  const area = document.getElementById("alertsArea");
  const div = document.createElement("div");
  div.className = `alert alert-${type} alert-dismissible fade show`;
  div.innerHTML = `${message}${
    opts.dismissible === false ? "" : '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>'
  }`;
  area.appendChild(div);
}

function formatToday() {
  const today = new Date();
  const formatted = today.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

async function loadUser() {
  const cached = Session.getUser();
  if (cached) renderUser(cached);

  try {
    const user = await apiFetch("/auth/me");
    Session.setUser(user);
    renderUser(user);
  } catch (err) {
    console.error(err);
  }
}

function renderUser(user) {
  document.getElementById("navUserName").textContent = user.full_name;
  document.getElementById("welcomeName").textContent = user.full_name.split(" ")[0];

  const isAdmin = user.role_name === "Administrador";
  document.getElementById("navAdminBadge").classList.toggle("d-none", !isAdmin);
  document.getElementById("adminMenuItem").classList.toggle("d-none", !isAdmin);

  if (!user.career || !user.goal) {
    showAlert(
      'Tu perfil está incompleto. <a href="profile.html" class="alert-link">Complétalo</a> para sacarle mejor provecho a biUNestar.',
      "info"
    );
  }
}

async function loadWeeklyAverages() {
  try {
    const data = await apiFetch("/daily-records/me/weekly-averages");
    document.getElementById("avgSleep").textContent = data.avg_sleep_hours ?? "--";
    document.getElementById("avgWater").textContent = data.avg_water_intake ?? "--";
    document.getElementById("avgActivity").textContent = data.avg_activity_minutes ?? "--";
    document.getElementById("daysLogged").textContent = data.days_logged;

    const pct = Math.round((data.days_logged / 7) * 100);
    document.getElementById("daysLoggedBar").style.width = `${pct}%`;
  } catch (err) {
    console.error(err);
  }
}

async function loadToday() {
  const card = document.getElementById("todayCard");
  try {
    const record = await apiFetch("/daily-records/me/today");
    const emoji = MOOD_EMOJI[record.mood] || "";
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h6 class="text-muted mb-2">Registro de hoy</h6>
          <span class="badge text-bg-light mood-badge">${emoji} ${record.mood}</span>
          <div class="mt-3">
            <i class="fas fa-moon me-1 text-primary"></i> ${record.sleep_hours} h de sueño &nbsp;·&nbsp;
            <i class="fas fa-glass-water me-1 text-info"></i> ${record.water_intake} vasos de agua &nbsp;·&nbsp;
            <i class="fas fa-person-running me-1 text-success"></i> ${record.activity_minutes} min de actividad
          </div>
          ${record.comment ? `<p class="text-muted mt-2 mb-0">"${record.comment}"</p>` : ""}
        </div>
        <a href="habits.html" class="btn btn-outline-primary btn-sm">Editar registro de hoy</a>
      </div>
    `;
  } catch (err) {
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h6 class="text-muted mb-1">Aún no has registrado tus hábitos de hoy</h6>
          <p class="mb-0 text-muted">Tómate un minuto para anotar cómo va tu día.</p>
        </div>
        <a href="habits.html" class="btn btn-primary btn-sm">
          <i class="fas fa-plus-circle me-1"></i> Registrar hoy
        </a>
      </div>
    `;
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("todayDate").textContent = formatToday();

loadUser();
loadWeeklyAverages();
loadToday();
