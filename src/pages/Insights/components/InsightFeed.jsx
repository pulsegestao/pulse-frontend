import { useState, useEffect, useCallback } from "react";
import { Loader2, Inbox } from "lucide-react";
import C from "../../../theme/colors";
import { getInsights } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";
import InsightCard from "./InsightCard";

const PAGE_SIZE = 10;

const TABS = [
  { label: "Todos",     severity: null,       read: null  },
  { label: "Não lidos", severity: null,       read: false },
  { label: "Crítico",   severity: "critical", read: null  },
  { label: "Alto",      severity: "high",     read: null  },
  { label: "Médio",     severity: "medium",   read: null  },
  { label: "Baixo",     severity: "low",      read: null  },
];

const TYPE_OPTIONS = [
  { value: "",                 label: "Todos os tipos"   },
  { value: "sales_drop",       label: "Queda de vendas"  },
  { value: "sales_spike",      label: "Pico de vendas"   },
  { value: "dead_stock",       label: "Estoque parado"   },
  { value: "trending",         label: "Em alta"          },
  { value: "low_stock",        label: "Estoque baixo"    },
  { value: "abnormal_revenue", label: "Receita anormal"  },
];

const InsightFeed = ({ onInsightRead }) => {
  const [tabIdx, setTabIdx]   = useState(0);
  const [typeFilter, setType] = useState("");
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [offset, setOffset]   = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const tab = TABS[tabIdx];

  const load = useCallback(async (off = 0, append = false) => {
    if (off === 0) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const res = await getInsights({
        severity: tab.severity || undefined,
        read:     tab.read,
        type:     typeFilter || undefined,
        limit:    PAGE_SIZE,
        offset:   off,
      });
      const incoming = res.data ?? [];
      setItems(prev => append ? [...prev, ...incoming] : incoming);
      setTotal(res.total ?? 0);
      setOffset(off);
    } catch (err) {
      setError(friendlyError(err.message) || "Falha ao carregar pulsos.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab.severity, tab.read, typeFilter]);

  useEffect(() => { load(0, false); }, [load]);

  const handleRead = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
    onInsightRead?.();
  };

  const remaining = total - (offset + PAGE_SIZE);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <Loader2 size={24} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (error) return <WidgetError message={error} onRetry={() => load(0)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={{
        background: C.surface,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {/* Tabs de severidade */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TABS.map((t, i) => {
            const active = i === tabIdx;
            return (
              <button
                key={t.label}
                onClick={() => setTabIdx(i)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: active ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                  background: active ? C.bluePale : "transparent",
                  color: active ? C.blue : C.mid,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown de tipo */}
        <select
          value={typeFilter}
          onChange={e => setType(e.target.value)}
          style={{
            padding: "7px 10px",
            borderRadius: 8,
            border: `1.5px solid ${C.border}`,
            background: C.surface,
            color: C.graphite,
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
            maxWidth: 220,
          }}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Lista com scroll interno */}
      <div style={{
        maxHeight: 580,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingRight: 4,
      }}>
        {items.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "48px 24px", gap: 10,
            background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
          }}>
            <Inbox size={32} color={C.mid} strokeWidth={1.5} />
            <p style={{ fontSize: 14, color: C.mid, margin: 0, fontWeight: 600 }}>
              Nenhum pulso encontrado
            </p>
            <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
              Tente mudar os filtros ou aguarde o próximo ciclo.
            </p>
          </div>
        ) : (
          <>
            {items.map(ins => (
              <InsightCard key={ins.id} insight={ins} onRead={handleRead} />
            ))}

            {remaining > 0 && (
              <button
                onClick={() => load(offset + PAGE_SIZE, true)}
                disabled={loadingMore}
                style={{
                  width: "100%", padding: "11px 16px",
                  borderRadius: 10, border: `1px solid ${C.border}`,
                  background: C.surface, color: C.mid,
                  fontSize: 13, fontWeight: 600,
                  cursor: loadingMore ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  flexShrink: 0,
                }}
              >
                {loadingMore
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Carregando...</>
                  : `Carregar mais (${remaining} restantes)`
                }
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InsightFeed;
