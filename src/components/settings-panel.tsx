import { useState } from "react";
import { X } from "lucide-react";

interface Props { onClose: () => void; }

const TOGGLE_SETTINGS = [
  { key: "criticalAlerts",    label: "Critical threat alerts",      color: "#FF073A" },
  { key: "highAlerts",        label: "High severity alerts",        color: "#F59E0B" },
  { key: "mediumAlerts",      label: "Medium severity alerts",      color: "#00D4FF" },
  { key: "lowAlerts",         label: "Low severity alerts",         color: "#2ECC71" },
  { key: "breachSimulation",  label: "Breach simulation events",    color: "#FF073A" },
  { key: "auditEvents",       label: "Audit log notifications",     color: "#8892A0" },
  { key: "autoMitigate",      label: "Autonomous response engine",  color: "#00D4FF" },
  { key: "siem",              label: "SIEM event forwarding",       color: "#1E6FFF" },
];

export function SettingsPanel({ onClose }: Props) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    criticalAlerts: true, highAlerts: true, mediumAlerts: false,
    lowAlerts: false, breachSimulation: true, auditEvents: false,
    autoMitigate: true, siem: true,
  });
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [retention, setRetention] = useState(90);
  const [scanInterval, setScanInterval] = useState(15);
  const [accent, setAccent] = useState("cyan");
  const [saved, setSaved] = useState(false);

  const toggle = (k: string) => setToggles(p => ({ ...p, [k]: !p[k] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const ACCENTS = [
    { id: "cyan",   color: "#00D4FF", label: "Cyber Cyan"  },
    { id: "cobalt", color: "#1E6FFF", label: "Cobalt"      },
    { id: "sage",   color: "#2ECC71", label: "Sage"        },
    { id: "amber",  color: "#F59E0B", label: "Amber"       },
    { id: "rose",   color: "#FF073A", label: "Crimson"     },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[850] flex items-center justify-end" onClick={onClose}>
      <div className="h-full w-[360px] bg-[rgba(7,8,17,0.99)] border-l border-[rgba(255,255,255,0.09)] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideInRight 0.22s cubic-bezier(.4,0,.2,1)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)] sticky top-0 bg-[rgba(7,8,17,0.99)] z-10 flex-shrink-0">
          <div>
            <div className="text-[14px] font-bold">Settings</div>
            <div className="text-[10px] font-mono text-[#4A5568] mt-0.5">AEGIS-OS CONFIGURATION</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#8892A0] hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.06)] transition-all">
            <X size={13} />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-6 overflow-y-auto">

          {/* Notifications */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">Notification Preferences</div>
            <div className="space-y-2.5">
              {TOGGLE_SETTINGS.map(({ key, label, color }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[11px] text-[#8892A0]">{label}</span>
                  </div>
                  <button onClick={() => toggle(key)}
                    className={`w-8 h-[18px] rounded-full transition-all duration-200 relative flex-shrink-0 ${toggles[key] ? "bg-[#00D4FF]" : "bg-[rgba(255,255,255,0.1)]"}`}>
                    <div className="absolute top-[3px] w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{ left: toggles[key] ? "calc(100% - 15px)" : "3px" }} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Threshold */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">Auto-Block Risk Threshold</div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#8892A0]">Block IPs scoring ≥</span>
                <span className="font-bold text-[13px]" style={{ color: riskThreshold >= 80 ? "#FF073A" : riskThreshold >= 60 ? "#F59E0B" : "#2ECC71" }}>{riskThreshold}</span>
              </div>
              <input type="range" min={10} max={100} value={riskThreshold} onChange={e => setRiskThreshold(+e.target.value)}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right,#00D4FF ${riskThreshold}%,rgba(255,255,255,0.1) ${riskThreshold}%)` }} />
              <div className="flex justify-between text-[8px] font-mono text-[#4A5568]">
                <span>10 (block most)</span><span>55</span><span>100 (none)</span>
              </div>
            </div>
          </section>

          {/* Scan Interval */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">Deep Scan Interval</div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#8892A0]">Scan every</span>
                <span className="text-[#00D4FF] font-bold">{scanInterval} min</span>
              </div>
              <input type="range" min={1} max={60} value={scanInterval} onChange={e => setScanInterval(+e.target.value)}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right,#1E6FFF ${(scanInterval/60)*100}%,rgba(255,255,255,0.1) ${(scanInterval/60)*100}%)` }} />
            </div>
          </section>

          {/* Log Retention */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">Log Retention</div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#8892A0]">Retain audit logs</span>
                <span className="text-[#1E6FFF] font-bold">{retention} days</span>
              </div>
              <input type="range" min={7} max={365} value={retention} onChange={e => setRetention(+e.target.value)}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right,#1E6FFF ${(retention/365)*100}%,rgba(255,255,255,0.1) ${(retention/365)*100}%)` }} />
              <div className="flex justify-between text-[8px] font-mono text-[#4A5568]">
                <span>7d</span><span>90d</span><span>1y</span>
              </div>
            </div>
          </section>

          {/* Accent Color */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">UI Accent Color</div>
            <div className="flex gap-2.5 flex-wrap">
              {ACCENTS.map(({ id, color, label }) => (
                <button key={id} onClick={() => setAccent(id)} title={label}
                  className="flex flex-col items-center gap-1 group">
                  <div className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{ background: color, borderColor: accent === id ? "white" : "transparent", boxShadow: accent === id ? `0 0 12px ${color}80` : "none" }} />
                  <span className="text-[8px] font-mono text-[#4A5568] group-hover:text-[#8892A0] transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Keyboard Shortcuts reference */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">Keyboard Shortcuts</div>
            <div className="space-y-1.5">
              {[
                ["⌘K",     "Command palette"],
                ["Ctrl /",  "Global search"],
                ["G then D","Dashboard"],
                ["G then T","Threat detection"],
                ["G then I","Incidents"],
                ["G then U","Identity & Access"],
                ["G then A","Audit logs"],
                ["?",       "Show shortcut help"],
                ["ESC",     "Close overlays"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#8892A0]">{desc}</span>
                  <span className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded text-[#4A5568]">{key}</span>
                </div>
              ))}
            </div>
          </section>

          {/* System Info */}
          <section>
            <div className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.12em] mb-3">System</div>
            <div className="space-y-1.5">
              {[
                ["Version",  "AEGIS-OS v3.7.1"],
                ["Build",    "2026.05.02-prod"],
                ["Node",     "PROD-CTRL-01"],
                ["Region",   "US-EAST-1"],
                ["License",  "Enterprise — Active"],
                ["DB",       "PostgreSQL 15.2 (RDS)"],
                ["Uptime",   "14d 6h 22m"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#4A5568]">{k}</span>
                  <span className="text-[#8892A0]">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(7,8,17,0.99)] space-y-2">
          <button onClick={save}
            className={`w-full py-2.5 rounded-lg font-semibold text-[12px] transition-all btn-depress border ${
              saved
                ? "border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.1)] text-[#2ECC71]"
                : "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.16)]"
            }`}>
            {saved ? "✓ Configuration Saved" : "Save Configuration"}
          </button>
          <button onClick={onClose}
            className="w-full py-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#4A5568] text-[11px] font-mono hover:text-[#8892A0] hover:border-[rgba(255,255,255,0.12)] transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
