const API_BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Backend server is not running on http://localhost:5000");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return data;
}

export function signup(payload) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return request("/me");
}

export function getBirthdays() {
  return request("/birthdays");
}

export function createBirthday(payload) {
  return request("/birthdays", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteBirthday(id) {
  return request(`/birthdays/${id}`, {
    method: "DELETE",
  });
}
