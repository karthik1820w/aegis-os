import { X } from "lucide-react";
import { THREATS, ThreatSeverity } from "@/data/mock";
import { useState } from "react";

const SEV_COLORS: Record<ThreatSeverity, string> = {
  critical: "#FF073A",
  high:     "#F59E0B",
  medium:   "#00D4FF",
  low:      "#2ECC71",
};

interface Props {
  threatId: string | null;
  onClose: () => void;
}

export function DetailDrawer({ threatId, onClose }: Props) {
  const threat = THREATS.find((t) => t.id === threatId);
  const [toast, setToast] = useState<string | null>(null);

  const act = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      <div
        className={`fixed right-0 top-12 bottom-0 w-[360px] bg-[rgba(8,9,18,0.98)] border-l border-[rgba(255,255,255,0.1)] backdrop-blur-3xl z-[400] transition-transform duration-250 overflow-y-auto p-5 ${
          threatId ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transition: "transform 0.25s ease" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#8892A0] hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.08)] transition-all"
        >
          <X size={13} />
        </button>

        {threat ? (
          <>
            <div className="mb-5 pr-8">
              <div className="text-[10px] font-mono text-[#4A5568] mb-1">{threat.id}</div>
              <div className="text-[17px] font-bold leading-snug mb-2">{threat.type}</div>
              <span
                className="inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{
                  color: SEV_COLORS[threat.severity],
                  background: SEV_COLORS[threat.severity] + "1a",
                  borderColor: SEV_COLORS[threat.severity] + "4d",
                }}
              >
                {threat.severity.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: "SOURCE IP", value: threat.ip,                   color: "#00D4FF" },
                { label: "TARGET",    value: threat.target,               color: undefined },
                { label: "STATUS",    value: threat.status.toUpperCase(), color: SEV_COLORS[threat.severity] },
                { label: "RISK SCORE",value: String(threat.riskScore),    color: SEV_COLORS[threat.severity] },
                { label: "REGION",    value: threat.region,               color: undefined },
                { label: "FIRST SEEN",value: threat.time,                 color: undefined },
              ].map((item) => (
                <div key={item.label} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-3">
                  <div className="text-[9px] font-mono text-[#4A5568] mb-1">{item.label}</div>
                  <div
                    className="text-[12px] font-mono font-semibold truncate"
                    style={item.color ? { color: item.color } : { color: "#E8EAF0" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Description</div>
              <p className="text-[11px] text-[#8892A0] leading-relaxed">{threat.description}</p>
            </div>

            <div className="mb-5">
              <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Evidence Log</div>
              <div className="space-y-1.5">
                {threat.evidence.map((ev, i) => (
                  <div key={i} className="bg-black/40 border border-[rgba(0,212,255,0.15)] rounded-lg px-3 py-2 font-mono text-[10px] text-[rgba(0,212,255,0.8)]">
                    {ev}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Automated Remediation</div>
              <div className="flex flex-col gap-2">
                {[
                  { label: `Block IP: ${threat.ip}`,     icon: "🚫", variant: "crimson" },
                  { label: "Auto-Mitigate Threat",        icon: "⚡", variant: "cyan" },
                  { label: "Create Incident Ticket",      icon: "📋", variant: "ghost" },
                  { label: "Deep Packet Inspection",      icon: "🔍", variant: "ghost" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => act(btn.label + " — action queued")}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-md border text-[11px] font-semibold transition-all btn-depress ${
                      btn.variant === "crimson"
                        ? "bg-[rgba(255,7,58,0.1)] border-[rgba(255,7,58,0.3)] text-[#FF073A] hover:bg-[rgba(255,7,58,0.18)]"
                        : btn.variant === "cyan"
                        ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.25)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.18)]"
                        : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-[#8892A0] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#E8EAF0]"
                    }`}
                  >
                    <span>{btn.icon}</span>{btn.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 animate-pulse mt-4">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-48 rounded" />
            <div className="skeleton h-28 w-full rounded mt-4" />
            <div className="skeleton h-20 w-full rounded" />
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 right-[220px] bg-[rgba(10,10,20,0.97)] border border-[rgba(0,212,255,0.3)] text-[#00D4FF] px-4 py-2.5 rounded-lg font-mono text-[12px] z-[2000] shadow-2xl" style={{ animation: "slideUp 0.3s ease" }}>
          {toast}
        </div>
      )}
    </>
  );
}
