const TOKEN_KEY = "pulse_token";
const PROFILE_CACHE_KEY = "pulse_profile_cache";

export function saveToken(token, remember) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_CACHE_KEY);
}

export function isAuthenticated() {
  return !!(localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY));
}

export function getProfile() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const cache = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
    return {
      userName:    cache.userName    ?? payload.user_name    ?? "",
      companyName: cache.companyName ?? payload.company_name ?? "",
      role:        payload.role ?? "",
    };
  } catch {
    return null;
  }
}

export function updateProfileCache(data) {
  const current = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ ...current, ...data }));
  window.dispatchEvent(new CustomEvent("pulse:profile-updated"));
}
