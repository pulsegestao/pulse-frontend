const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro desconhecido");
  return json.data;
}

export function registerUser(name, email, password, companyName, companyType, cnpj) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      user: { name, email, password },
      company: { name: companyName, type: companyType, cnpj: cnpj || "" },
    }),
  });
}

export function verifyEmail(token) {
  return request(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function loginUser(email, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
