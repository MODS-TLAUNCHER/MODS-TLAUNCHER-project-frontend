Session.requireAuth();

function showAlert(message, type = "success") {
  document.getElementById("alertsArea").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function fillForm(user) {
  document.getElementById("institutionalEmail").value = user.institutional_email;
  document.getElementById("fullName").value = user.full_name || "";
  document.getElementById("career").value = user.career || "";
  document.getElementById("credits").value = user.credits ?? 0;
  document.getElementById("alternativeEmail").value = user.alternative_email || "";
  document.getElementById("goal").value = user.goal || "";

  const stressInput = document.getElementById("stressLevel");
  stressInput.value = user.stress_level || 3;
  document.getElementById("stressValue").textContent = user.stress_level || "-";
}

async function loadProfile() {
  try {
    const user = await apiFetch("/auth/me");
    Session.setUser(user);
    fillForm(user);
    document.getElementById("navUserName").textContent = user.full_name;
    document.getElementById("adminMenuItem").classList.toggle("d-none", user.role_name !== "Administrador");
  } catch (err) {
    showAlert(err.message || "No se pudo cargar tu perfil.", "danger");
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const user = Session.getUser();
  const payload = {
    full_name: document.getElementById("fullName").value,
    career: document.getElementById("career").value || null,
    credits: Number(document.getElementById("credits").value) || 0,
    alternative_email: document.getElementById("alternativeEmail").value || null,
    goal: document.getElementById("goal").value || null,
    stress_level: Number(document.getElementById("stressLevel").value),
  };

  const btn = document.getElementById("profileSubmitBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Guardando...';

  try {
    const updated = await apiFetch(`/users/${user.id}`, { method: "PATCH", body: payload });
    Session.setUser(updated);
    fillForm(updated);
    showAlert('¡Perfil actualizado! <a href="dashboard.html" class="alert-link">Ir al dashboard</a>');
  } catch (err) {
    showAlert(err.message || "No se pudo guardar el perfil.", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check me-1"></i> Guardar cambios';
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => Session.logout());
document.getElementById("profileForm").addEventListener("submit", handleSubmit);
document.getElementById("stressLevel").addEventListener("input", (e) => {
  document.getElementById("stressValue").textContent = e.target.value;
});

loadProfile();