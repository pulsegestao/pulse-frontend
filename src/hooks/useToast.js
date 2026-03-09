function dispatchToast(type, message) {
  window.dispatchEvent(new CustomEvent("pulse:toast", { detail: { type, message } }));
}

export function useToast() {
  return {
    success: (message) => dispatchToast("success", message),
    error:   (message) => dispatchToast("error",   message),
    warning: (message) => dispatchToast("warning", message),
    info:    (message) => dispatchToast("info",    message),
  };
}
