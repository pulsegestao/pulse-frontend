const FRIENDLY_MAP = {
  "Erro desconhecido":      "Ocorreu um erro inesperado. Tente novamente.",
  "Failed to fetch":        "Sem conexão com o servidor. Verifique sua internet.",
  "Network request failed": "Sem conexão com o servidor. Verifique sua internet.",
  "NetworkError when attempting to fetch resource.":
                            "Sem conexão com o servidor. Verifique sua internet.",
  "Load failed":            "Sem conexão com o servidor. Verifique sua internet.",
};

// Padrões de mensagens técnicas que nunca devem chegar ao usuário
const TECHNICAL_PATTERN =
  /mongo|server error|ECONNREFUSED|timeout|null pointer|panic|stack trace|at Object\.|undefined is not|Cannot read prop/i;

/**
 * Transforma um erro cru (do backend ou de exceções JS) em uma mensagem
 * amigável para o usuário final.
 *
 * Regra: mensagens legíveis do backend passam direto.
 *        Jargão técnico ou erros internos viram genérico.
 */
export function friendlyError(raw) {
  if (!raw || typeof raw !== "string") return "Ocorreu um erro inesperado.";

  if (FRIENDLY_MAP[raw]) return FRIENDLY_MAP[raw];

  if (TECHNICAL_PATTERN.test(raw)) return "Ocorreu um erro inesperado. Tente novamente.";

  return raw;
}
