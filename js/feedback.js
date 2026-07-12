Session.requireAuth();

let isAdmin = false;

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function categoryBadgeClass(category) {
  if (category === "Reporte de error") return "text-bg-danger";
  if (category === "Sugerencia") return "text-bg-info";
  return "text-bg-secondary";
}

function renderMyFeedback(items) {
  const tbody = document.getElementById("myFeedbackBody");

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">Aún no has enviado retroalimentación.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map(
      (f) => `
      <tr>
        <td>${formatDate(f.created_at)}</td>
        <td><span class="badge ${categoryBadgeClass(f.category)}">${f.category}</span></td>
        <td>${f.message}</td>
      </tr>`
    )
    .join("");
}

async function loadMyFeedback() {
  try {
    const items = await apiFetch("/feedback/me");
    renderMyFeedback([...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (err) {
    showAlert(err.message || "No se pudo cargar tu retroalimentación.", "danger");
  }
}

async function loadAllFeedback() {
  const tbody = document.getElementById("allFeedbackBody");

  try {
    const [items, users] = await Promise.all([apiFetch("/feedback"), apiFetch("/users")]);
    const nameById = Object.fromEntries(users.map((u) => [u.id, u.full_name]));

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay retroalimentación registrada.</td></tr>`;
      return;
    }

    const sorted = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    tbody.innerHTML = sorted
      .map(
        (f) => `
        <tr>
          <td>${formatDate(f.created_at)}</td>
          <td>${nameById[f.user_id] || `Usuario #${f.user_id}`}</td>
          <td><span class="badge ${categoryBadgeClass(f.category)}">${f.category}</span></td>
          <td>${f.message}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Error al cargar.</td></tr>`;
    console.error(err);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    category: document.getElementById("feedbackCategory").value,
    message: document.getElementById("feedbackMessage").value,
  };

  const btn = document.getElementById("feedbackSubmitBtn");
  btn.disabled = true;

  try {
    await apiFetch("/feedback/me", { method: "POST", body: payload });
    showAlert("¡Gracias por tu retroalimentación!");
    document.getElementById("feedbackForm").reset();
    loadMyFeedback();
    if (isAdmin) loadAllFeedback();
  } catch (err) {
    showAlert(err.message || "No se pudo enviar la retroalimentación.", "warning");
  } finally {
    btn.disabled = false;
  }
}

function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  document.getElementById("navUserName").textContent = user.full_name;

  isAdmin = user.role_name === "Administrador";
  document.getElementById("adminMenuItem").classList.toggle("d-none", !isAdmin);
  document.getElementById("adminSection").classList.toggle("d-none", !isAdmin);

  if (isAdmin) {
    document.getElementById("myHistoryTitle").textContent = "Tu historial (como estudiante)";
    loadAllFeedback();
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("feedbackForm").addEventListener("submit", handleSubmit);

renderNavUser();
loadMyFeedback();