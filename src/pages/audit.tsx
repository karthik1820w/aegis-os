import { useState, useEffect } from "react";
import { AUDIT_EVENTS } from "@/data/mock";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV, downloadJSON } from "@/utils/export";

const RESULT_COLOR: Record<string, string> = {
  success: "#2ECC71", failure: "#FF073A", warning: "#F59E0B",
};
const RESULT_ICON: Record<string, string> = {
  success: "✓", failure: "✗", warning: "⚠",
};

const LIVE_ACTORS = ["AEGIS-ENGINE","admin@aegis.io","slu@aegis.io","DLP-ENGINE","SCANNER","CERTBOT"];
const LIVE_ACTIONS = [
  "Threat auto-blocked at perimeter",
  "User session validated",
  "Firewall rule evaluated",
  "Deep scan completed",
  "Certificate rotation check",
  "API key validated",
  "Threat intelligence updated",
];

export default function AuditLogs() {
  const { push: notify } = useNotifications();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [liveEvents, setLiveEvents] = useState(AUDIT_EVENTS);
  const [totalCount, setTotalCount] = useState(48291);

  useEffect(() => {
    const t = setInterval(() => {
      setTotalCount(n => n + Math.round(Math.random() * 12 + 3));
      if (Math.random() > 0.65) {
        const results: ("success"|"failure"|"warning")[] = ["success","success","success","warning","failure"];
        const result = results[Math.floor(Math.random() * results.length)];
        const actor = LIVE_ACTORS[Math.floor(Math.random() * LIVE_ACTORS.length)];
        const action = LIVE_ACTIONS[Math.floor(Math.random() * LIVE_ACTIONS.length)];
        const newEv = {
          id: `AUD-${4422 + Math.floor(Math.random() * 100)}`,
          action, actor,
          resource: ["FW-EDGE-01","IAM","API-GW","SIEM","K8S"][Math.floor(Math.random() * 5)],
          ip: ["10.0.1.5","system","10.0.14.22","internal"][Math.floor(Math.random() * 4)],
          result, time: "just now",
        };
        setLiveEvents(prev => [newEv, ...prev].slice(0, 30));
      }
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const filtered = liveEvents.filter(e => {
    if (filter !== "all" && e.result !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) ||
      e.resource.toLowerCase().includes(q) || e.ip.includes(q) || e.id.toLowerCase().includes(q);
  });

  const handleExportCSV = () => {
    downloadCSV("aegis-audit.csv", liveEvents.map(e => ({
      id: e.id, result: e.result, action: e.action,
      actor: e.actor, resource: e.resource, ip: e.ip, time: e.time,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-audit.csv downloaded" });
  };

  const handleExportJSON = () => {
    downloadJSON("aegis-audit.json", { exportedAt: new Date().toISOString(), events: liveEvents });
    notify({ type: "success", title: "JSON export complete", body: "aegis-audit.json downloaded" });
  };

  const handleSIEM = () => {
    notify({ type: "info", title: "SIEM Export", body: "Streaming 48,291 events to Splunk SIEM…" });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight">Audit Logs</h1>
          <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">IMMUTABLE LOG TRAIL // COMPLIANCE READY // SIEM INTEGRATED // LIVE STREAM</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
            📤 CSV
          </button>
          <button onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
            📄 JSON
          </button>
          <button onClick={handleSIEM}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#F59E0B] text-[11px] font-semibold hover:bg-[rgba(245,158,11,0.15)] transition-all btn-depress">
            📡 SIEM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "TOTAL EVENTS (24H)",  value: totalCount.toLocaleString(), color: "#E8EAF0", live: true },
          { label: "FAILURES",             value: String(liveEvents.filter(e=>e.result==="failure").length), color: "#FF073A", live: false },
          { label: "WARNINGS",             value: String(liveEvents.filter(e=>e.result==="warning").length), color: "#F59E0B", live: false },
          { label: "PRIVILEGED ACTIONS",   value: "247",                                                     color: "#00D4FF", live: false },
        ].map((m) => (
          <div key={m.label} className="glass-card relative rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
            onClick={() => notify({ type: "info", title: m.label, body: m.value })}>
            <div className="text-[9px] font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2 flex items-center gap-1.5">
              {m.label}
              {m.live && <div className="w-1 h-1 rounded-full bg-[#2ECC71] animate-pulse" />}
            </div>
            <div className="text-[28px] font-black transition-all duration-500" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "success", "failure", "warning"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold border transition-all ${
              filter === f
                ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:border-[rgba(255,255,255,0.15)] hover:text-[#E8EAF0]"
            }`}>{f.toUpperCase()}
          </button>
        ))}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-md px-2.5 py-1 ml-1">
          <svg viewBox="0 0 12 12" fill="none" stroke="#4A5568" strokeWidth={1.5} className="w-3 h-3 flex-shrink-0">
            <circle cx={5} cy={5} r={3.5}/><path d="M8 8l2 2"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actor, action, IP…"
            className="bg-transparent border-none outline-none text-[11px] font-mono text-[#E8EAF0] placeholder:text-[#4A5568] w-36 caret-[#00D4FF]" />
          {search && <button onClick={() => setSearch("")} className="text-[#4A5568] hover:text-[#8892A0] text-[9px]">✕</button>}
        </div>
        <span className="ml-auto text-[10px] font-mono text-[#4A5568]">{filtered.length} events</span>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#2ECC71]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" /> streaming
        </div>
      </div>

      <div className="glass-card relative rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {["ID", "RESULT", "ACTION", "ACTOR", "RESOURCE", "SOURCE IP", "TIME"].map((h) => (
                <th key={h} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, i) => (
              <tr key={ev.id + i}
                className={`hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0 cursor-pointer ${ev.time === "just now" ? "live-event-new" : ""}`}
                onClick={() => notify({ type: ev.result === "failure" ? "error" : ev.result === "warning" ? "warning" : "success", title: ev.action, body: `${ev.id} · ${ev.actor}` })}>
                <td className="px-3 py-2.5 font-mono text-[#4A5568]">{ev.id}</td>
                <td className="px-3 py-2.5">
                  <span className="text-[9px] font-mono font-bold" style={{ color: RESULT_COLOR[ev.result] }}>
                    {RESULT_ICON[ev.result]} {ev.result.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#E8EAF0] font-medium max-w-[200px] truncate">{ev.action}</td>
                <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{ev.actor}</td>
                <td className="px-3 py-2.5 font-mono text-[#8892A0]">{ev.resource}</td>
                <td className="px-3 py-2.5 font-mono text-[#8892A0]">{ev.ip}</td>
                <td className="px-3 py-2.5 font-mono text-[#4A5568]">{ev.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
