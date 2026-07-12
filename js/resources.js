Session.requireAuth();

let resourceModal;
let isAdmin = false;

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderResources(resources) {
  const grid = document.getElementById("resourcesGrid");

  if (resources.length === 0) {
    grid.innerHTML = `<p class="text-muted">Todavía no hay recursos de apoyo publicados.</p>`;
    return;
  }

  grid.innerHTML = resources
    .map((r) => {
      const icon = r.type === "Enlace" ? "fa-link" : "fa-newspaper";
      const adminButtons = isAdmin
        ? `
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${r.id}"
            data-title="${escapeHtml(r.title)}" data-type="${r.type}"
            data-url="${escapeHtml(r.url)}" data-description="${escapeHtml(r.description)}">
            <i class="fas fa-pen"></i> Editar
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${r.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>`
        : "";

      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card stat-card h-100">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center mb-2">
                <div class="icon-circle bg-primary text-white me-2"><i class="fas ${icon}"></i></div>
                <span class="badge text-bg-light">${r.type || ""}</span>
              </div>
              <h6 class="fw-semibold">${escapeHtml(r.title)}</h6>
              <p class="text-muted small flex-grow-1">${escapeHtml(r.description) || ""}</p>
              ${
                r.url
                  ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary">
                       Ver recurso <i class="fas fa-arrow-up-right-from-square ms-1"></i>
                     </a>`
                  : ""
              }
              ${adminButtons}
            </div>
          </div>
        </div>`;
    })
    .join("");

  grid.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset));
  });
  grid.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteResource(btn.dataset.id));
  });
}

async function loadResources() {
  try {
    const resources = await apiFetch("/resources");
    renderResources(resources);
  } catch (err) {
    showAlert(err.message || "No se pudieron cargar los recursos.", "danger");
  }
}

async function deleteResource(id) {
  if (!confirm("¿Eliminar este recurso?")) return;
  try {
    await apiFetch(`/resources/${id}`, { method: "DELETE" });
    showAlert("Recurso eliminado.");
    loadResources();
  } catch (err) {
    showAlert(err.message || "No se pudo eliminar el recurso.", "danger");
  }
}

function openCreateModal() {
  document.getElementById("resourceModalTitle").textContent = "Nuevo recurso";
  document.getElementById("resourceId").value = "";
  document.getElementById("resourceTitle").value = "";
  document.getElementById("resourceType").value = "Articulo";
  document.getElementById("resourceUrl").value = "";
  document.getElementById("resourceDescription").value = "";
}

function openEditModal(data) {
  document.getElementById("resourceModalTitle").textContent = "Editar recurso";
  document.getElementById("resourceId").value = data.id;
  document.getElementById("resourceTitle").value = data.title === "undefined" ? "" : data.title;
  document.getElementById("resourceType").value = data.type;
  document.getElementById("resourceUrl").value = data.url === "undefined" ? "" : data.url;
  document.getElementById("resourceDescription").value = data.description === "undefined" ? "" : data.description;
  resourceModal.show();
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = document.getElementById("resourceId").value;
  const payload = {
    title: document.getElementById("resourceTitle").value,
    type: document.getElementById("resourceType").value,
    url: document.getElementById("resourceUrl").value || null,
    description: document.getElementById("resourceDescription").value || null,
  };

  const btn = document.getElementById("resourceSubmitBtn");
  btn.disabled = true;

  try {
    if (id) {
      await apiFetch(`/resources/${id}`, { method: "PATCH", body: payload });
      showAlert("Recurso actualizado.");
    } else {
      await apiFetch("/resources", { method: "POST", body: payload });
      showAlert("Recurso creado.");
    }
    resourceModal.hide();
    loadResources();
  } catch (err) {
    showAlert(err.message || "No se pudo guardar el recurso.", "danger");
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
  document.getElementById("newResourceBtn").classList.toggle("d-none", !isAdmin);
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("newResourceBtn").addEventListener("click", openCreateModal);
document.getElementById("resourceForm").addEventListener("submit", handleSubmit);

resourceModal = new bootstrap.Modal(document.getElementById("resourceModal"));

renderNavUser();
loadResources();