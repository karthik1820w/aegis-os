import { useState, useEffect } from "react";
import { THREATS, ThreatSeverity } from "@/data/mock";
import { DetailDrawer } from "@/components/detail-drawer";
import { useLayout } from "@/components/layout";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV } from "@/utils/export";

const SEV_COLORS: Record<ThreatSeverity, string> = {
  critical: "#FF073A", high: "#F59E0B", medium: "#00D4FF", low: "#2ECC71",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#FF073A", blocked: "#2ECC71", investigating: "#F59E0B", mitigated: "#8892A0",
};

const MITRE_MATRIX: Record<string, { id: string; name: string; count: number }[]> = {
  "Initial Access":   [{ id:"T1190",name:"Exploit Pub App",count:4 },{ id:"T1566",name:"Phishing",count:3 },{ id:"T1078",name:"Valid Accounts",count:2 },{ id:"T1133",name:"External Remote",count:1 }],
  "Execution":        [{ id:"T1059",name:"Script Interp",count:3 },{ id:"T1204",name:"User Exec",count:2 },{ id:"T1053",name:"Scheduled Task",count:1 },{ id:"T1106",name:"Native API",count:1 }],
  "Persistence":      [{ id:"T1136",name:"Create Account",count:2 },{ id:"T1547",name:"Boot Autostart",count:1 },{ id:"T1037",name:"Boot Init Script",count:1 },{ id:"T1543",name:"System Service",count:0 }],
  "Priv. Escalation": [{ id:"T1068",name:"Exploit Vuln",count:3 },{ id:"T1134",name:"Access Token",count:1 },{ id:"T1548",name:"Abuse Elevation",count:2 },{ id:"T1055",name:"Proc Injection",count:1 }],
  "Defense Evasion":  [{ id:"T1070",name:"Indicator Rmv",count:4 },{ id:"T1027",name:"Obfuscated Files",count:2 },{ id:"T1562",name:"Impair Defenses",count:3 },{ id:"T1036",name:"Masquerading",count:1 }],
  "Credential Access":[{ id:"T1003",name:"OS Cred Dump",count:5 },{ id:"T1552",name:"Unsecured Creds",count:2 },{ id:"T1110",name:"Brute Force",count:4 },{ id:"T1555",name:"Creds PWmgr",count:0 }],
  "Lateral Movement": [{ id:"T1021",name:"Remote Services",count:3 },{ id:"T1550",name:"Alt Auth Material",count:1 },{ id:"T1534",name:"Internal Spear-Ph",count:0 },{ id:"T1080",name:"Taint Shared",count:1 }],
  "C2":               [{ id:"T1071",name:"App Layer Proto",count:6 },{ id:"T1573",name:"Encrypted Channel",count:4 },{ id:"T1572",name:"Proto Tunneling",count:2 },{ id:"T1008",name:"Fallback Channels",count:1 }],
};
const TACTIC_COLS = Object.keys(MITRE_MATRIX);

function heatColor(count: number) {
  if (count === 0) return "rgba(255,255,255,0.03)";
  if (count <= 1) return "rgba(0,212,255,0.12)";
  if (count <= 2) return "rgba(245,158,11,0.18)";
  if (count <= 3) return "rgba(245,158,11,0.28)";
  if (count <= 4) return "rgba(255,7,58,0.22)";
  return "rgba(255,7,58,0.38)";
}
function heatText(count: number) {
  if (count === 0) return "#4A5568";
  if (count <= 2) return "#00D4FF";
  if (count <= 4) return "#F59E0B";
  return "#FF073A";
}
function hoverHeatColor(hov: boolean, count: number) {
  const base = heatColor(count);
  if (!hov) return base;
  if (count === 0) return "rgba(255,255,255,0.07)";
  return base.replace(/[\d.]+\)$/, (m) => String(Math.min(parseFloat(m) * 1.8, 0.7)) + ")");
}

export default function Threats() {
  const { openCmd } = useLayout();
  const { push: notify } = useNotifications();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [drawerThreat, setDrawerThreat] = useState<string | null>(null);
  const [liveRisk, setLiveRisk] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"list" | "matrix">("list");
  const [hovered, setHovered] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<"riskScore" | "time" | "severity">("riskScore");
  const [sortAsc, setSortAsc] = useState(false);

  const SEV_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const filtered = THREATS
    .filter(t => filter === "all" || t.severity === filter || t.status === filter)
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return t.type.toLowerCase().includes(q) || t.ip.includes(q) ||
        t.id.toLowerCase().includes(q) || t.target.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortCol === "riskScore") return sortAsc ? (liveRisk[a.id] ?? a.riskScore) - (liveRisk[b.id] ?? b.riskScore) : (liveRisk[b.id] ?? b.riskScore) - (liveRisk[a.id] ?? a.riskScore);
      if (sortCol === "severity")  return sortAsc ? SEV_ORDER[a.severity] - SEV_ORDER[b.severity] : SEV_ORDER[b.severity] - SEV_ORDER[a.severity];
      return 0;
    });

  useEffect(() => {
    const init: Record<string, number> = {};
    THREATS.forEach((t) => { init[t.id] = t.riskScore; });
    setLiveRisk(init);
    const interval = setInterval(() => {
      setLiveRisk((prev) => {
        const next = { ...prev };
        THREATS.filter(t => t.status === "active").forEach((t) => {
          next[t.id] = Math.max(50, Math.min(100, (prev[t.id] || t.riskScore) + Math.round(Math.random() * 6 - 2)));
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(false); }
  };

  const handleExport = () => {
    downloadCSV("aegis-threats.csv", THREATS.map(t => ({
      id: t.id, type: t.type, severity: t.severity, ip: t.ip,
      target: t.target, status: t.status, riskScore: liveRisk[t.id] ?? t.riskScore,
      region: t.region, time: t.time,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-threats.csv downloaded" });
  };

  return (
    <>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-bold tracking-tight">Threat Detection (ITDR)</h1>
            <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">BEHAVIORAL ANOMALIES // AUTONOMOUS CORRELATION ENGINE // MITRE ATT&CK MAPPED</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
              📤 Export CSV
            </button>
            <button onClick={openCmd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
              ⌘K Quick Mitigate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TOTAL MONITORED", value: "247",  color: "#E8EAF0" },
            { label: "CRITICAL",        value: String(THREATS.filter(t=>t.severity==="critical").length), color: "#FF073A" },
            { label: "HIGH",            value: String(THREATS.filter(t=>t.severity==="high").length),    color: "#F59E0B" },
            { label: "MITIGATED (24H)", value: "192",  color: "#2ECC71" },
          ].map((m) => (
            <div key={m.label} className="glass-card relative rounded-xl p-3 cursor-pointer hover:brightness-110 transition-all"
              onClick={() => notify({ type: "info", title: m.label, body: `Current value: ${m.value}` })}>
              <div className="text-[9px] font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-1.5">{m.label}</div>
              <div className="text-[28px] font-black" style={{ color: m.color, textShadow: `0 0 20px ${m.color}40` }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tab + Search row */}
        <div className="flex items-center gap-2 flex-wrap">
          {[["list","Threat List"],["matrix","MITRE ATT&CK Matrix"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t as "list"|"matrix")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
                tab === t
                  ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                  : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:border-[rgba(255,255,255,0.15)] hover:text-[#E8EAF0]"
              }`}>{label}</button>
          ))}

          {tab === "list" && (
            <>
              {/* Search input */}
              <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-md px-2.5 py-1 ml-1">
                <svg viewBox="0 0 12 12" fill="none" stroke="#4A5568" strokeWidth={1.5} className="w-3 h-3 flex-shrink-0">
                  <circle cx={5} cy={5} r={3.5}/><path d="M8 8l2 2"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search IP, type, target…"
                  className="bg-transparent border-none outline-none text-[11px] font-mono text-[#E8EAF0] placeholder:text-[#4A5568] w-40 caret-[#00D4FF]" />
                {search && <button onClick={() => setSearch("")} className="text-[#4A5568] hover:text-[#8892A0] text-[9px]">✕</button>}
              </div>
              {/* Filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {["all","critical","high","medium","low","active","blocked","investigating"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border transition-all ${
                      filter === f
                        ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                        : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:text-[#E8EAF0]"
                    }`}>{f.toUpperCase()}</button>
                ))}
              </div>
              <span className="ml-auto text-[10px] font-mono text-[#4A5568] self-center">{filtered.length} shown</span>
            </>
          )}
        </div>

        {tab === "list" ? (
          <div className="glass-card relative rounded-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-14 text-center font-mono text-[11px] text-[#4A5568]">
                No threats match "<span className="text-[#8892A0]">{search}</span>"
              </div>
            ) : (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    {[
                      { h: "ID",         sortable: false },
                      { h: "SEVERITY",   sortable: true,  col: "severity" as const },
                      { h: "TYPE",       sortable: false },
                      { h: "SOURCE IP",  sortable: false },
                      { h: "TARGET",     sortable: false },
                      { h: "STATUS",     sortable: false },
                      { h: "RISK",       sortable: true,  col: "riskScore" as const },
                      { h: "TIME",       sortable: false },
                      { h: "ACTION",     sortable: false },
                    ].map(({ h, sortable, col }) => (
                      <th key={h}
                        className={`text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left whitespace-nowrap ${sortable ? "cursor-pointer hover:text-[#8892A0] select-none" : ""}`}
                        onClick={() => sortable && col && handleSort(col)}>
                        {h}{sortable && col && sortCol === col ? (sortAsc ? " ↑" : " ↓") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const live = liveRisk[t.id] ?? t.riskScore;
                    return (
                      <tr key={t.id} onClick={() => setDrawerThreat(t.id)}
                        className={`cursor-pointer transition-all border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.025)] ${t.status==="active" && t.severity==="critical" ? "bg-[rgba(255,7,58,0.02)]":""}`}>
                        <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{t.id}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                            style={{ color: SEV_COLORS[t.severity], background: SEV_COLORS[t.severity]+"1a", borderColor: SEV_COLORS[t.severity]+"4d" }}>
                            {t.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#E8EAF0] font-medium max-w-[150px] truncate">{t.type}</td>
                        <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{t.ip}</td>
                        <td className="px-3 py-2.5 font-mono text-[#8892A0]">{t.target}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full" style={{ background: STATUS_COLORS[t.status], boxShadow: `0 0 4px ${STATUS_COLORS[t.status]}` }} />
                            <span className="text-[9px] font-mono font-semibold" style={{ color: STATUS_COLORS[t.status] }}>{t.status.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-[3px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${live}%`, background: SEV_COLORS[t.severity] }} />
                            </div>
                            <span className="font-mono font-bold text-[10px] transition-all duration-700" style={{ color: SEV_COLORS[t.severity] }}>{live}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[#4A5568]">{t.time}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); notify({ type: "success", title: `Blocking ${t.ip}`, body: "IP null-routed at perimeter" }); }}
                              className="px-2 py-0.5 rounded border border-[rgba(255,7,58,0.3)] bg-[rgba(255,7,58,0.1)] text-[#FF073A] text-[9px] font-semibold hover:bg-[rgba(255,7,58,0.2)] btn-depress">
                              Block
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDrawerThreat(t.id); }}
                              className="px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#8892A0] text-[9px] hover:text-[#E8EAF0] btn-depress">
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="glass-card relative rounded-xl overflow-auto p-4">
            <div className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-3">
              MITRE ATT&CK Enterprise — Active Coverage Heatmap
            </div>
            <div className="overflow-x-auto">
              <table className="border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    {TACTIC_COLS.map((col) => (
                      <th key={col} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.06em] px-2 py-2 text-center whitespace-nowrap border-b border-[rgba(255,255,255,0.06)]"
                        style={{ width: 92 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0,1,2,3].map((row) => (
                    <tr key={row}>
                      {TACTIC_COLS.map((col) => {
                        const tech = MITRE_MATRIX[col][row];
                        const hid = `${col}-${row}`;
                        return (
                          <td key={col} className="p-1">
                            <div
                              className="rounded-md px-1.5 py-1.5 text-center border cursor-pointer transition-all"
                              style={{
                                background: hoverHeatColor(hovered === hid, tech.count),
                                borderColor: hovered === hid ? heatText(tech.count) + "60" : "rgba(255,255,255,0.06)",
                                minHeight: 44,
                                transform: hovered === hid ? "scale(1.05)" : "scale(1)",
                                boxShadow: hovered === hid ? `0 0 14px ${heatText(tech.count)}30` : "none",
                              }}
                              onMouseEnter={() => setHovered(hid)}
                              onMouseLeave={() => setHovered(null)}
                              onClick={() => notify({ type: tech.count > 0 ? "warning" : "info", title: tech.id, body: `${tech.name} — ${tech.count} detection${tech.count !== 1 ? "s" : ""}` })}
                            >
                              <div className="text-[8px] font-mono font-bold mb-0.5" style={{ color: heatText(tech.count) }}>{tech.id}</div>
                              <div className="text-[9px] font-medium text-[#8892A0] leading-tight truncate">{tech.name}</div>
                              {tech.count > 0 && (
                                <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: heatText(tech.count) }}>×{tech.count}</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[9px] font-mono text-[#4A5568]">
              <span>Heat intensity →</span>
              {[
                { label: "0 hits",   color: "rgba(255,255,255,0.06)" },
                { label: "1–2 hits", color: "rgba(0,212,255,0.18)"   },
                { label: "3–4 hits", color: "rgba(245,158,11,0.28)"  },
                { label: "5+ hits",  color: "rgba(255,7,58,0.38)"    },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-[rgba(255,255,255,0.1)]" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <DetailDrawer threatId={drawerThreat} onClose={() => setDrawerThreat(null)} />
    </>
  );
}
