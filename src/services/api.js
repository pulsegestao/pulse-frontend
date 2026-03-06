const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
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

function getToken() {
  return localStorage.getItem("pulse_token");
}

function authRequest(path, options = {}) {
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export function getProducts() {
  return authRequest("/api/v1/products/");
}

export function updateStock(productId, input) {
  return authRequest(`/api/v1/products/${productId}/stock`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function previewNFe(formData) {
  return fetch(`${BASE_URL}/api/v1/inventory/nfe/preview`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  }).then(async (res) => {
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro desconhecido");
    return json.data;
  });
}

export function confirmNFe(items) {
  return authRequest("/api/v1/inventory/nfe/confirm", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export function createProduct(input) {
  return authRequest("/api/v1/products/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(productId, input) {
  return authRequest(`/api/v1/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function checkEmail(email) {
  return request(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`);
}
