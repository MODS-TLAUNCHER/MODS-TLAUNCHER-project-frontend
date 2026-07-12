Session.requireAuth();

let reminderModal;

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function formatTime(t) {
  return t ? t.slice(0, 5) : "";
}

function renderReminders(reminders) {
  const tbody = document.getElementById("remindersBody");

  if (reminders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No tienes recordatorios todavía.</td></tr>`;
    return;
  }

  tbody.innerHTML = reminders
    .map(
      (r) => `
      <tr>
        <td>${formatTime(r.time)}</td>
        <td>${r.message || "<span class='text-muted'>Sin mensaje</span>"}</td>
        <td>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input toggle-active" type="checkbox" data-id="${r.id}" ${r.active ? "checked" : ""} />
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${r.id}" data-time="${r.time}"
            data-message="${(r.message || "").replace(/"/g, "&quot;")}" data-active="${r.active}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${r.id}">
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
    btn.addEventListener("click", () => deleteReminder(btn.dataset.id));
  });
}

async function loadReminders() {
  try {
    const reminders = await apiFetch("/reminders/me");
    renderReminders(reminders);
  } catch (err) {
    showAlert(err.message || "No se pudieron cargar los recordatorios.", "danger");
  }
}

async function toggleActive(id, active) {
  try {
    await apiFetch(`/reminders/me/${id}`, { method: "PATCH", body: { active } });
  } catch (err) {
    showAlert(err.message || "No se pudo actualizar el recordatorio.", "danger");
    loadReminders(); 
  }
}

async function deleteReminder(id) {
  if (!confirm("¿Eliminar este recordatorio?")) return;
  try {
    await apiFetch(`/reminders/me/${id}`, { method: "DELETE" });
    showAlert("Recordatorio eliminado.");
    loadReminders();
  } catch (err) {
    showAlert(err.message || "No se pudo eliminar el recordatorio.", "danger");
  }
}

function openCreateModal() {
  document.getElementById("reminderModalTitle").textContent = "Nuevo recordatorio";
  document.getElementById("reminderId").value = "";
  document.getElementById("reminderTime").value = "";
  document.getElementById("reminderMessage").value = "";
  document.getElementById("reminderActive").checked = true;
}

function openEditModal(data) {
  document.getElementById("reminderModalTitle").textContent = "Editar recordatorio";
  document.getElementById("reminderId").value = data.id;
  document.getElementById("reminderTime").value = formatTime(data.time);
  document.getElementById("reminderMessage").value = data.message === "undefined" ? "" : data.message;
  document.getElementById("reminderActive").checked = data.active === "true";
  reminderModal.show();
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = document.getElementById("reminderId").value;
  const payload = {
    time: document.getElementById("reminderTime").value,
    message: document.getElementById("reminderMessage").value || null,
    active: document.getElementById("reminderActive").checked,
  };

  const btn = document.getElementById("reminderSubmitBtn");
  btn.disabled = true;

  try {
    if (id) {
      await apiFetch(`/reminders/me/${id}`, { method: "PATCH", body: payload });
      showAlert("Recordatorio actualizado.");
    } else {
      await apiFetch("/reminders/me", { method: "POST", body: payload });
      showAlert("Recordatorio creado.");
    }
    reminderModal.hide();
    loadReminders();
  } catch (err) {
    showAlert(err.message || "No se pudo guardar el recordatorio.", "danger");
  } finally {
    btn.disabled = false;
  }
}

function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  document.getElementById("navUserName").textContent = user.full_name;
  document.getElementById("adminMenuItem").classList.toggle("d-none", user.role_name !== "Administrador");
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("newReminderBtn").addEventListener("click", openCreateModal);
document.getElementById("reminderForm").addEventListener("submit", handleSubmit);

reminderModal = new bootstrap.Modal(document.getElementById("reminderModal"));

renderNavUser();
loadReminders();