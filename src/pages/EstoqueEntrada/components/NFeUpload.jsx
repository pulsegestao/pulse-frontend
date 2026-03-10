import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import C from "../../../theme/colors";

const NFeUpload = ({ onFile, loading }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    onFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setFileName(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {!fileName ? (
        <div
          onClick={() => !loading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? C.blue : C.border}`,
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            cursor: loading ? "not-allowed" : "pointer",
            background: dragging ? C.bluePale : C.surface,
            transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: C.bluePale,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Upload size={24} color={C.blue} strokeWidth={2} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: "0 0 6px" }}>
            Arraste o arquivo XML aqui
          </p>
          <p style={{ fontSize: 13, color: C.mid, margin: "0 0 16px" }}>
            ou clique para selecionar (.xml da NF-e ou NFC-e)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xml"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <span style={{
            display: "inline-block",
            padding: "8px 20px", borderRadius: 8,
            background: C.blue, color: "white",
            fontSize: 13, fontWeight: 600,
          }}>
            Selecionar arquivo
          </span>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, background: C.surface,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: C.bluePale,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <FileText size={20} color={C.blue} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 14, color: C.graphite, fontWeight: 600, flex: 1 }}>{fileName}</span>
          {!loading && (
            <button onClick={handleClear} style={{
              border: "none", background: "none", cursor: "pointer",
              display: "flex", padding: 4,
            }}>
              <X size={16} color={C.mid} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NFeUpload;
