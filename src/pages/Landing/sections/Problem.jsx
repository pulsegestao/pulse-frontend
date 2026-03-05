import { PackageX, FileX, BarChart2, Banknote, Clock, TrendingDown } from "lucide-react";
import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const pains = [
  { icon: <PackageX size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Produto em falta na hora errada", desc: "Cliente pede, você não tem. Venda perdida, cliente insatisfeito." },
  { icon: <FileX size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Caderno e planilha não bastam", desc: "Anotar tudo na mão é lento, impreciso e impossível de acompanhar." },
  { icon: <BarChart2 size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Sem saber o que está vendendo", desc: "Você não sabe quais produtos giram e quais ficam parados na prateleira." },
  { icon: <Banknote size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Dinheiro parado em estoque errado", desc: "Compra muito do que não vende e deixa de comprar o que esgota rápido." },
  { icon: <Clock size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Tempo desperdiçado em tarefas manuais", desc: "Fazer inventário, calcular, conferir. Isso consome horas que você não tem." },
  { icon: <TrendingDown size={28} color="#FCA5A5" strokeWidth={1.5} />, title: "Falta de controle nas vendas do dia", desc: "Não tem um caixa organizado. Fica difícil saber se o dia foi bom ou ruim." },
];

const Problem = () => {
  const [ref, visible] = useInView();

  return (
    <section id="problema" style={{ background: C.graphite, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `${C.blue}15`, zIndex: 0 }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }} ref={ref}>
        <div className={`fade-up ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", background: "#EF444422", color: "#FCA5A5", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            O problema real
          </div>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Gerenciar estoque<br />no improviso custa caro.
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
            Todo pequeno empreendedor já passou por isso. E continua perdendo dinheiro sem perceber.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {pains.map((p, i) => (
            <div key={i} className={`fade-up d${Math.min(i + 1, 6)} ${visible ? "visible" : ""}`}
              style={{ background: "#FFFFFF08", border: "1px solid #FFFFFF12", borderRadius: 16, padding: 28, transition: "background 0.2s, border-color 0.2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FFFFFF12"; e.currentTarget.style.borderColor = "#FFFFFF25"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF08"; e.currentTarget.style.borderColor = "#FFFFFF12"; }}>
              <div style={{ marginBottom: 14, display: "flex" }}>{p.icon}</div>
              <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
