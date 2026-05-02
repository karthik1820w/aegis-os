import { useState, useEffect, useRef } from "react";
import { THREATS, INCIDENTS, AUDIT_EVENTS } from "@/data/mock";
import { useLayout } from "./layout";

type Result = {
  type: "threat" | "incident" | "audit";
  id: string;
  title: string;
  subtitle: string;
  page: string;
};

const QUICK = ["Ransomware", "SQL Injection", "Lateral Movement", "THR-001", "INC-0841", "jsmith", "185.220"];

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const { setPage } = useLayout();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 40); }, []);

  const q = query.trim().toLowerCase();
  const results: Result[] = q.length < 2 ? [] : [
    ...THREATS.filter(t =>
      t.type.toLowerCase().includes(q) || t.ip.includes(q) ||
      t.id.toLowerCase().includes(q) || t.target.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q)
    ).slice(0, 5).map(t => ({
      type: "threat" as const, id: t.id,
      title: t.type, subtitle: `${t.id} · ${t.ip} · ${t.severity.toUpperCase()} · RISK ${t.riskScore}`,
      page: "threats",
    })),
    ...INCIDENTS.filter(i =>
      i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) ||
      i.assignee.toLowerCase().includes(q)
    ).slice(0, 3).map(i => ({
      type: "incident" as const, id: i.id,
      title: i.title, subtitle: `${i.id} · ${i.priority} · ${i.status.replace("_", " ")} · ${i.assignee}`,
      page: "incidents",
    })),
    ...AUDIT_EVENTS.filter(a =>
      a.action.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q) ||
      a.resource.toLowerCase().includes(q) || a.ip.includes(q)
    ).slice(0, 2).map(a => ({
      type: "audit" as const, id: a.id,
      title: a.action, subtitle: `${a.id} · ${a.actor} · ${a.result.toUpperCase()}`,
      page: "audit",
    })),
  ];

  const TYPE_COLOR: Record<string, string> = { threat: "#FF073A", incident: "#F59E0B", audit: "#00D4FF" };
  const TYPE_ICON: Record<string, string> = { threat: "🎯", incident: "⚠️", audit: "📋" };

  const go = (r: Result) => { setPage(r.page); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) go(results[selected]);
  };

  return (
    <div className="fixed inset-0 bg-black/72 backdrop-blur-sm z-[1100] flex items-start justify-center pt-[13vh]" onClick={onClose}>
      <div className="w-[600px] bg-[rgba(9,10,20,0.98)] border border-[rgba(255,255,255,0.12)] rounded-[14px] overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.9)]" onClick={e => e.stopPropagation()}>
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
          <svg viewBox="0 0 16 16" fill="none" stroke="#4A5568" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
            <circle cx={6.5} cy={6.5} r={4.5}/><path d="M10 10l3 3"/>
          </svg>
          <input ref={inputRef} value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            placeholder="Search threats, incidents, IPs, actors, resources…"
            className="flex-1 bg-transparent border-none outline-none text-[#E8EAF0] font-mono text-[13px] placeholder:text-[#4A5568] caret-[#00D4FF]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#4A5568] hover:text-[#8892A0] text-[11px] font-mono transition-colors">✕ clear</button>
          )}
          <span className="text-[10px] text-[#4A5568] font-mono flex-shrink-0">ESC</span>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="max-h-[380px] overflow-y-auto p-2">
            {results.map((r, i) => (
              <div key={r.id} onClick={() => go(r)} onMouseEnter={() => setSelected(i)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all ${
                  selected === i ? "bg-[rgba(0,212,255,0.07)] border-[rgba(0,212,255,0.18)]" : "border-transparent hover:bg-[rgba(255,255,255,0.03)]"
                }`}>
                <span className="text-[15px] flex-shrink-0">{TYPE_ICON[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[#E8EAF0] truncate">{r.title}</div>
                  <div className="text-[10px] font-mono text-[#4A5568] mt-0.5 truncate">{r.subtitle}</div>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: TYPE_COLOR[r.type], background: TYPE_COLOR[r.type] + "20" }}>
                  {r.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        ) : q.length >= 2 ? (
          <div className="py-12 text-center font-mono text-[11px] text-[#4A5568]">No results for "<span className="text-[#8892A0]">{query}</span>"</div>
        ) : (
          <div className="py-5 px-4">
            <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.1em] mb-3">Quick Search</div>
            <div className="flex flex-wrap gap-2">
              {QUICK.map(hint => (
                <button key={hint} onClick={() => setQuery(hint)}
                  className="px-2.5 py-1 rounded-md border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-[10px] font-mono text-[#8892A0] hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] transition-all">
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-3 text-[10px] font-mono text-[#4A5568]">
          {[["↑↓","navigate"],["↵","open"],["ESC","close"]].map(([k,v]) => (
            <span key={k}><span className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded mr-1">{k}</span>{v}</span>
          ))}
          {results.length > 0 && <span className="ml-auto text-[#4A5568]">{results.length} result{results.length !== 1 ? "s" : ""}</span>}
        </div>
      </div>
    </div>
  );
}
