const SESSION_KEYS = {
  token: "biunestar_token",
  user: "biunestar_user",
};

const Session = {
  save(token, user) {
    localStorage.setItem(SESSION_KEYS.token, token);
    localStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
  },

  getToken() {
    return localStorage.getItem(SESSION_KEYS.token);
  },

  getUser() {
    const raw = localStorage.getItem(SESSION_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    localStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  clear() {
    localStorage.removeItem(SESSION_KEYS.token);
    localStorage.removeItem(SESSION_KEYS.user);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "index.html";
    }
  },

  logout() {
    this.clear();
    window.location.href = "index.html";
  },
};

async function apiFetch(path, { method = "GET", body = null } = {}) {
  const headers = { Accept: "application/json" };
  const token = Session.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    Session.clear();
    window.location.href = "index.html";
    throw new Error("Sesión expirada");
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    let message = `Error HTTP ${res.status}`;
    const detail = data && data.detail;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((e) => (e.msg || "").replace(/^Value error,\s*/, ""))
        .filter(Boolean)
        .join(" ");
    } else if (detail) {
      message = JSON.stringify(detail);
    }

    throw new Error(message);
  }

  return data;
}