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

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(isoStr) {
  const [year, month, day] = isoStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
}

function showAlert(message, type = "danger") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function setRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  document.getElementById("startDate").value = isoDate(start);
  document.getElementById("endDate").value = isoDate(end);
}

async function loadHistory(event) {
  if (event) event.preventDefault();

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const tbody = document.getElementById("historyBody");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Cargando...</td></tr>`;

  try {
    const records = await apiFetch(`/daily-records/me?start_date=${startDate}&end_date=${endDate}`);

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay registros en este rango.</td></tr>`;
      return;
    }

    // Más reciente primero.
    records.sort((a, b) => (a.date < b.date ? 1 : -1));

    tbody.innerHTML = records
      .map(
        (r) => `
        <tr>
          <td>${formatDisplayDate(r.date)}</td>
          <td><span class="badge text-bg-light mood-badge">${MOOD_EMOJI[r.mood] || ""} ${r.mood || "-"}</span></td>
          <td>${r.sleep_hours} h</td>
          <td>${r.water_intake} vasos</td>
          <td>${r.activity_minutes} min</td>
          <td class="text-muted small">${r.comment ? r.comment : "—"}</td>
          <td class="text-end">
            <a href="habits.html?date=${r.date}" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-pen"></i>
            </a>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    showAlert(err.message || "No se pudo cargar el historial.");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Error al cargar.</td></tr>`;
  }
}

function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  document.getElementById("navUserName").textContent = user.full_name;
  document.getElementById("adminMenuItem").classList.toggle("d-none", user.role_name !== "Administrador");
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("rangeForm").addEventListener("submit", loadHistory);
document.querySelectorAll("[data-range]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setRange(Number(btn.dataset.range));
    loadHistory();
  });
});

renderNavUser();
setRange(7);
loadHistory();