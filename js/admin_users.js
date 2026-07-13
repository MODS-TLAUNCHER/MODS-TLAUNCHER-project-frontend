Session.requireAuth();

let editUserModal;

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function renderUsers(users) {
  const tbody = document.getElementById("usersBody");

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay usuarios.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map(
      (u) => `
      <tr>
        <td>${u.full_name}</td>
        <td>${u.institutional_email}</td>
        <td>${u.career || "<span class='text-muted'>—</span>"}</td>
        <td><span class="badge text-bg-light">${u.role_name || "—"}</span></td>
        <td>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input toggle-active" type="checkbox" data-id="${u.id}" ${u.active ? "checked" : ""} />
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${u.id}" data-name="${u.full_name}"
            data-career="${u.career || ""}" data-credits="${u.credits ?? 0}" data-active="${u.active}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${u.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`
    )
    .join("");

  tbody.querySelectorAll(".toggle-active").forEach((el) => {
    el.addEventListener("change", () => toggleActive(el.dataset.id, el.checked));
  });
  tbody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset));
  });
  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteUser(btn.dataset.id));
  });
}

async function loadUsers() {
  try {
    const users = await apiFetch("/users");
    renderUsers(users);
  } catch (err) {
    showAlert(err.message || "No se pudo cargar la lista de usuarios.", "danger");
  }
}

async function toggleActive(id, active) {
  try {
    await apiFetch(`/users/${id}`, { method: "PATCH", body: { active } });
  } catch (err) {
    showAlert(err.message || "No se pudo actualizar el estado.", "danger");
    loadUsers();
  }
}

async function deleteUser(id) {
  if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
  try {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    showAlert("Usuario eliminado.");
    loadUsers();
  } catch (err) {
    showAlert(err.message || "No se pudo eliminar el usuario.", "danger");
  }
}

function openEditModal(data) {
  document.getElementById("editUserId").value = data.id;
  document.getElementById("editFullName").value = data.name;
  document.getElementById("editCareer").value = data.career;
  document.getElementById("editCredits").value = data.credits;
  document.getElementById("editActive").checked = data.active === "true";
  editUserModal.show();
}

async function handleEditSubmit(event) {
  event.preventDefault();

  const id = document.getElementById("editUserId").value;
  const payload = {
    full_name: document.getElementById("editFullName").value,
    career: document.getElementById("editCareer").value || null,
    credits: Number(document.getElementById("editCredits").value) || 0,
    active: document.getElementById("editActive").checked,
  };

  const btn = document.getElementById("editUserSubmitBtn");
  btn.disabled = true;

  try {
    await apiFetch(`/users/${id}`, { method: "PATCH", body: payload });
    showAlert("Usuario actualizado.");
    editUserModal.hide();
    loadUsers();
  } catch (err) {
    showAlert(err.message || "No se pudo guardar los cambios.", "danger");
  } finally {
    btn.disabled = false;
  }
}

async function guardAdminAndInit() {
  try {
    const user = await apiFetch("/auth/me");
    Session.setUser(user);
    document.getElementById("navUserName").textContent = user.full_name;

    if (user.role_name !== "Administrador") {
      // No es admin: esta página no le corresponde.
      window.location.href = "dashboard.html";
      return;
    }

    editUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));
    document.getElementById("editUserForm").addEventListener("submit", handleEditSubmit);
    loadUsers();
  } catch (err) {
    console.error(err);
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());

guardAdminAndInit();