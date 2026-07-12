function showLoginStatus(message, type = "danger") {
  const el = document.getElementById("loginStatus");
  el.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${message}</div>`;
}

async function handleCredentialResponse(response) {
  showLoginStatus("Verificando con el servidor...", "info");
  try {
    const data = await apiFetch("/auth/google", {
      method: "POST",
      body: { id_token: response.credential },
    });

    Session.save(data.access_token, data.user);

    if (data.profile_incomplete) {
      showLoginStatus(
        "¡Bienvenido! Vamos a completar tu perfil (carrera, meta, etc).",
        "success"
      );
    }

    window.location.href = "dashboard.html";
  } catch (err) {
    showLoginStatus(err.message || "No se pudo iniciar sesión.");
  }
}

function initGoogleSignIn() {
  if (!window.google || !google.accounts || !google.accounts.id) {
    setTimeout(initGoogleSignIn, 200);
    return;
  }

  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
    auto_select: false,
  });

  google.accounts.id.renderButton(document.getElementById("googleButtonContainer"), {
    type: "standard",
    size: "large",
    text: "signin_with",
  });
}

if (Session.isAuthenticated()) {
  window.location.href = "dashboard.html";
} else {
  window.addEventListener("load", initGoogleSignIn);
}
