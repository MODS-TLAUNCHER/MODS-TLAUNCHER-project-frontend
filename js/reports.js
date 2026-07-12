Session.requireAuth();

let chartInstance = null;

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function renderTable(reports) {
  const tbody = document.getElementById("reportsBody");

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Aún no tienes reportes generados.</td></tr>`;
    return;
  }

  tbody.innerHTML = reports
    .map(
      (r) => `
      <tr>
        <td>Semana ${r.week}</td>
        <td>${r.year}</td>
        <td>${r.avg_sleep_hours ?? "--"} h</td>
        <td>${r.avg_water_intake ?? "--"} vasos</td>
        <td>${r.avg_activity_minutes ?? "--"} min</td>
      </tr>`
    )
    .join("");
}

function renderChart(reports) {
  const chronological = [...reports].sort((a, b) => a.year - b.year || a.week - b.week);
  const labels = chronological.map((r) => `S${r.week}-${r.year}`);

  const ctx = document.getElementById("reportsChart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Sueño (h)",
          data: chronological.map((r) => r.avg_sleep_hours),
          borderColor: "#4361ee",
          backgroundColor: "#4361ee",
          tension: 0.3,
        },
        {
          label: "Agua (vasos)",
          data: chronological.map((r) => r.avg_water_intake),
          borderColor: "#4cc9f0",
          backgroundColor: "#4cc9f0",
          tension: 0.3,
        },
        {
          label: "Actividad (min)",
          data: chronological.map((r) => r.avg_activity_minutes),
          borderColor: "#2a9d8f",
          backgroundColor: "#2a9d8f",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

async function loadReports() {
  try {
    const reports = await apiFetch("/reports/me");
    renderTable([...reports].sort((a, b) => b.year - a.year || b.week - a.week));
    renderChart(reports);
  } catch (err) {
    showAlert(err.message || "No se pudieron cargar los reportes.", "danger");
  }
}

async function handleGenerate(event) {
  event.preventDefault();

  const referenceDate = document.getElementById("referenceDate").value || null;
  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generando...';

  try {
    await apiFetch("/reports/me/generate-weekly", {
      method: "POST",
      body: { reference_date: referenceDate },
    });
    showAlert("Reporte generado/actualizado correctamente.");
    await loadReports();
  } catch (err) {
    showAlert(err.message || "No se pudo generar el reporte.", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sync me-1"></i> Generar / actualizar';
  }
}

function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  document.getElementById("navUserName").textContent = user.full_name;
  document.getElementById("adminMenuItem").classList.toggle("d-none", user.role_name !== "Administrador");
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("generateForm").addEventListener("submit", handleGenerate);

renderNavUser();
loadReports();