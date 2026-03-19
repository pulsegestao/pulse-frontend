export function isSafeLink(link) {
  if (!link || typeof link !== "string") return false;
  if (link.startsWith("//") || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(link)) return false;
  return link.startsWith("/");
}
