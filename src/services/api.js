const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function notifySessionExpired() {
  localStorage.removeItem("pulse_token");
  sessionStorage.removeItem("pulse_token");
  window.dispatchEvent(new Event("pulse:session-expired"));
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro desconhecido");
  return json.data;
}

function getToken() {
  return localStorage.getItem("pulse_token") || sessionStorage.getItem("pulse_token") || null;
}

async function authRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) {
    notifySessionExpired();
    throw new Error("Sessão expirada.");
  }
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

export function loginUser(email, password, rememberMe = false) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });
}

export function forgotPassword(email) {
  return request("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return request("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
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

export async function previewNFe(formData) {
  const res = await fetch(`${BASE_URL}/api/v1/inventory/nfe/preview`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (res.status === 401) {
    notifySessionExpired();
    throw new Error("Sessão expirada.");
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro desconhecido");
  return json.data;
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

export function getLowStock() {
  return authRequest("/api/v1/products/low-stock");
}

export function checkEmail(email) {
  return request(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`);
}

export function getMe() {
  return authRequest("/api/v1/users/me");
}

export function updateMe(input) {
  return authRequest("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getCompanySettings() {
  return authRequest("/api/v1/companies/me");
}

export function updateCompanySettings(input) {
  return authRequest("/api/v1/companies/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getCompanyMembers() {
  return authRequest("/api/v1/companies/me/members");
}

export function getNCMCategories() {
  return authRequest("/api/v1/ncm/categories");
}

export function getPaymentIntegrations() {
  return authRequest("/api/v1/integrations/payment");
}

export function savePaymentIntegration(data) {
  return authRequest("/api/v1/integrations/payment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePaymentIntegration(provider) {
  return authRequest(`/api/v1/integrations/payment/${provider}`, {
    method: "DELETE",
  });
}

export function testPaymentIntegration(provider) {
  return authRequest(`/api/v1/integrations/payment/test/${provider}`, {
    method: "POST",
  });
}

export function createPaymentIntent(data) {
  return authRequest("/api/v1/integrations/point/payment-intents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPaymentIntentStatus(id) {
  return authRequest(`/api/v1/integrations/point/payment-intents/${id}`);
}

export function cancelPaymentIntent(id) {
  return authRequest(`/api/v1/integrations/point/payment-intents/${id}`, {
    method: "DELETE",
  });
}

export function registerSale(input) {
  return authRequest("/api/v1/sales/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getDashboardSummary() {
  return authRequest("/api/v1/dashboard/summary");
}

export function getRevenueChart(period = "week") {
  return authRequest(`/api/v1/dashboard/revenue?period=${period}`);
}

export function getTopProducts(period = "week") {
  return authRequest(`/api/v1/dashboard/top-products?period=${period}`);
}

export function getProductReport(period = "month") {
  return authRequest(`/api/v1/reports/products?period=${period}`);
}

export function getPaymentMethods(period = "month") {
  return authRequest(`/api/v1/reports/payment-methods?period=${period}`);
}

export function getDeadStock() {
  return authRequest("/api/v1/reports/dead-stock");
}
export function getInsights({ type, severity, read, limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (type)     params.set("type", type);
  if (severity) params.set("severity", severity);
  if (read !== undefined && read !== null) params.set("read", String(read));
  params.set("limit", limit);
  params.set("offset", offset);
  return authRequest(`/api/v1/insights?${params.toString()}`);
}

export function countUnreadInsights() {
  return authRequest("/api/v1/insights/unread");
}

export function markInsightRead(id) {
  return authRequest(`/api/v1/insights/${id}/read`, { method: "PATCH" });
}

export function markAllInsightsRead() {
  return authRequest("/api/v1/insights/read-all", { method: "PATCH" });
}

export function getNotifications({ type, read, limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (read !== undefined && read !== null) params.set("read", String(read));
  params.set("limit", limit);
  params.set("offset", offset);
  return authRequest(`/api/v1/notifications?${params.toString()}`);
}

export function countUnreadNotifications() {
  return authRequest("/api/v1/notifications/unread");
}

export function markNotificationRead(id) {
  return authRequest(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return authRequest("/api/v1/notifications/read-all", { method: "PATCH" });
}

export function getVelocityRanking(limit = 10) {
  return authRequest(`/api/v1/analytics/velocity?limit=${limit}`);
}

export function getCategoryBreakdown(period = "month") {
  return authRequest(`/api/v1/analytics/categories?period=${period}`);
}

export function searchCustomers(q) {
  return authRequest(`/api/v1/customers/search?q=${encodeURIComponent(q)}`);
}

export function createCustomer(input) {
  return authRequest("/api/v1/customers/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getSalesPrazo(status = "pending") {
  return authRequest(`/api/v1/sales/prazo?status=${status}`);
}

export function receiveSale(id, receivedVia = "confirmed") {
  return authRequest(`/api/v1/sales/${id}/receive`, {
    method: "POST",
    body: JSON.stringify({ received_via: receivedVia }),
  });
}

export function returnSale(id, returnStock = false) {
  return authRequest(`/api/v1/sales/${id}/return`, {
    method: "POST",
    body: JSON.stringify({ return_stock: returnStock }),
  });
}

export function getPrazoReport() {
  return authRequest("/api/v1/reports/prazo");
}

export function getPromotions(status = "") {
  const params = status ? `?status=${status}` : "";
  return authRequest(`/api/v1/promotions/${params}`);
}

export function getActivePromotions() {
  return authRequest("/api/v1/promotions/active");
}

export function createPromotion(input) {
  return authRequest("/api/v1/promotions/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePromotion(id, input) {
  return authRequest(`/api/v1/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deletePromotion(id) {
  return authRequest(`/api/v1/promotions/${id}`, {
    method: "DELETE",
  });
}

export function getCategories() {
  return authRequest("/api/v1/categories");
}

export function evaluateCart(input) {
  return authRequest("/api/v1/promotions/evaluate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
