import { useState, useEffect, useRef } from "react";
import { COMMANDS } from "@/data/mock";
import { useLayout } from "./layout";

export function CommandPalette() {
  const { isCmd, closeCmd, setPage } = useLayout();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.replace("/", "").toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  useEffect(() => {
    if (isCmd) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCmd]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const execCmd = (label: string) => {
    closeCmd();
    const navMap: Record<string, string> = {
      "/dashboard": "dashboard",
      "/threats":   "threats",
      "/incidents": "incidents",
      "/identities":"identities",
      "/api":       "api",
      "/audit":     "audit",
      "/compliance":"compliance",
    };
    if (navMap[label]) { setPage(navMap[label]); return; }
    const messages: Record<string, string> = {
      "/block-ip":        "Enter an IP address to block at the perimeter",
      "/revoke-session":  "Session revoked successfully",
      "/scan-host":       "Deep scan initiated on target host...",
      "/auto-mitigate":   "⚡ Auto-mitigation triggered on active threats",
      "/create-incident": "Incident ticket created in tracking system",
      "/lockdown":        "⚠ LOCKDOWN PROTOCOL INITIATED — All external access suspended",
      "/export-report":   "Threat report exported to /reports/aegis-export.pdf",
      "/refresh-intel":   "Threat intelligence refreshed — 247 new IOCs ingested",
    };
    if (messages[label]) showToast(messages[label]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closeCmd(); return; }
    if (e.key === "ArrowDown") { setSelected((s) => Math.min(s + 1, filtered.length - 1)); return; }
    if (e.key === "ArrowUp")   { setSelected((s) => Math.max(s - 1, 0)); return; }
    if (e.key === "Enter" && filtered[selected]) { execCmd(filtered[selected].label); return; }
  };

  const groups = [...new Set(filtered.map((c) => c.group))];

  if (!isCmd) {
    return toast ? (
      <div className="fixed bottom-5 right-[220px] bg-[rgba(10,10,20,0.97)] border border-[rgba(0,212,255,0.3)] text-[#00D4FF] px-4 py-2.5 rounded-lg font-mono text-[12px] z-[2000] shadow-2xl" style={{ animation: "slideUp 0.3s ease" }}>
        {toast}
      </div>
    ) : null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-start justify-center pt-[18vh]" onClick={closeCmd}>
        <div className="w-[540px] bg-[rgba(10,10,20,0.97)] border border-[rgba(255,255,255,0.12)] rounded-[14px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
            <span className="font-mono text-[16px] text-[#00D4FF] font-bold">/</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
              onKeyDown={handleKey}
              placeholder="Type a command… (block-ip, revoke-session, scan-host)"
              className="flex-1 bg-transparent border-none outline-none text-[#E8EAF0] font-mono text-[14px] font-medium placeholder:text-[#4A5568] caret-[#00D4FF]"
            />
            <span className="text-[10px] text-[#4A5568] font-mono">ESC to close</span>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-2">
            {groups.map((group) => (
              <div key={group}>
                <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] px-2.5 py-2">{group}</div>
                {filtered.filter((c) => c.group === group).map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  return (
                    <div
                      key={cmd.label}
                      onClick={() => execCmd(cmd.label)}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer border transition-all ${
                        selected === globalIdx
                          ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.15)]"
                          : "border-transparent hover:bg-[rgba(255,255,255,0.04)]"
                      }`}
                      onMouseEnter={() => setSelected(globalIdx)}
                    >
                      <div className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[12px] flex-shrink-0">{cmd.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold font-mono text-[#E8EAF0]">{cmd.label}</div>
                        <div className="text-[10px] text-[#8892A0] mt-0.5 truncate">{cmd.desc}</div>
                      </div>
                      {cmd.shortcut && (
                        <div className="text-[10px] font-mono text-[#4A5568] flex-shrink-0">{cmd.shortcut}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-[#4A5568] font-mono text-[11px]">No commands found</div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.05)] flex gap-3 text-[10px] font-mono text-[#4A5568]">
            {[["↑↓", "navigate"], ["↵", "execute"], ["ESC", "close"]].map(([k, v]) => (
              <span key={k}><span className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded mr-1">{k}</span>{v}</span>
            ))}
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-5 right-[220px] bg-[rgba(10,10,20,0.97)] border border-[rgba(0,212,255,0.3)] text-[#00D4FF] px-4 py-2.5 rounded-lg font-mono text-[12px] z-[2000] shadow-2xl" style={{ animation: "slideUp 0.3s ease" }}>
          {toast}
        </div>
      )}
    </>
  );
}
