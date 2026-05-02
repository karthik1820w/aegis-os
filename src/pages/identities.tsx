import { useState, useEffect } from "react";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV } from "@/utils/export";

interface Identity {
  id: string; name: string; email: string; role: string;
  department: string; mfaEnabled: boolean; riskScore: number;
  riskLevel: "critical"|"high"|"medium"|"low";
  lastSeen: string; status: "active"|"suspended"|"locked"|"mfa_exempt";
}

const IDENTITIES: Identity[] = [
  { id:"USR-001", name:"Sarah Liu",    email:"slu@aegis.io",       role:"CISO",          department:"Security",    mfaEnabled:true,  riskScore:12,  riskLevel:"low",      lastSeen:"2m ago",   status:"active" },
  { id:"USR-002", name:"Raj Patel",    email:"rpatel@aegis.io",    role:"SOC Tier2",     department:"Security",    mfaEnabled:true,  riskScore:8,   riskLevel:"low",      lastSeen:"18m ago",  status:"active" },
  { id:"USR-003", name:"Dena Chen",    email:"dchen@aegis.io",     role:"SOC Analyst",   department:"Security",    mfaEnabled:true,  riskScore:19,  riskLevel:"low",      lastSeen:"1h ago",   status:"active" },
  { id:"USR-004", name:"John Smith",   email:"jsmith@company.com", role:"Engineer",      department:"Engineering", mfaEnabled:false, riskScore:78,  riskLevel:"high",     lastSeen:"52m ago",  status:"active" },
  { id:"USR-005", name:"Maria Torres", email:"mtorres@aegis.io",   role:"SOC Tier1",     department:"Security",    mfaEnabled:true,  riskScore:5,   riskLevel:"low",      lastSeen:"3h ago",   status:"active" },
  { id:"USR-006", name:"svc_backup2",  email:"svc@internal",       role:"Service Acct",  department:"INTERNAL",    mfaEnabled:false, riskScore:95,  riskLevel:"critical", lastSeen:"5m ago",   status:"active" },
  { id:"USR-007", name:"Alex Kim",     email:"akim@company.com",   role:"DevOps",        department:"Engineering", mfaEnabled:true,  riskScore:22,  riskLevel:"low",      lastSeen:"6h ago",   status:"active" },
  { id:"USR-008", name:"svc_scanner",  email:"svc@internal",       role:"Service Acct",  department:"INTERNAL",    mfaEnabled:false, riskScore:10,  riskLevel:"low",      lastSeen:"1h ago",   status:"active" },
  { id:"USR-009", name:"Victor Osei",  email:"vosei@company.com",  role:"Finance Mgr",   department:"Finance",     mfaEnabled:false, riskScore:67,  riskLevel:"high",     lastSeen:"12m ago",  status:"active" },
  { id:"USR-010", name:"Luna Park",    email:"lpark@company.com",  role:"HR Director",   department:"HR",          mfaEnabled:true,  riskScore:41,  riskLevel:"medium",   lastSeen:"30m ago",  status:"active" },
  { id:"USR-011", name:"root_ci",      email:"root@ci.internal",   role:"CI/CD Root",    department:"INTERNAL",    mfaEnabled:false, riskScore:99,  riskLevel:"critical", lastSeen:"just now", status:"active" },
  { id:"USR-012", name:"Marcus Webb",  email:"mwebb@company.com",  role:"DBA",           department:"Engineering", mfaEnabled:true,  riskScore:55,  riskLevel:"medium",   lastSeen:"2h ago",   status:"locked" },
];

const RISK_COLORS: Record<string, string> = {
  critical: "#FF073A", high: "#F59E0B", medium: "#00D4FF", low: "#2ECC71",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#2ECC71", suspended: "#FF073A", locked: "#F59E0B", mfa_exempt: "#F59E0B",
};
const RISK_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export default function Identities() {
  const { push: notify } = useNotifications();
  const [riskFilter, setRiskFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<string | null>(null);
  const [sortMode, setSortMode]         = useState<"risk"|"name">("risk");
  const [liveRisk, setLiveRisk]         = useState<Record<string, number>>({});

  useEffect(() => {
    const init: Record<string, number> = {};
    IDENTITIES.forEach(id => { init[id.id] = id.riskScore; });
    setLiveRisk(init);
    const t = setInterval(() => {
      setLiveRisk(prev => {
        const next = { ...prev };
        IDENTITIES.filter(id => id.riskLevel === "critical" || id.riskLevel === "high").forEach(id => {
          next[id.id] = Math.max(50, Math.min(100, prev[id.id] + Math.round(Math.random() * 6 - 2)));
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = IDENTITIES
    .filter(id => riskFilter === "all" || id.riskLevel === riskFilter)
    .filter(id => statusFilter === "all" || id.status === statusFilter)
    .filter(id => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return id.name.toLowerCase().includes(q) || id.email.toLowerCase().includes(q) ||
        id.role.toLowerCase().includes(q) || id.department.toLowerCase().includes(q);
    })
    .sort((a, b) =>
      sortMode === "risk"
        ? (RISK_ORDER[b.riskLevel] - RISK_ORDER[a.riskLevel]) || ((liveRisk[b.id] ?? b.riskScore) - (liveRisk[a.id] ?? a.riskScore))
        : a.name.localeCompare(b.name)
    );

  const sel = IDENTITIES.find(i => i.id === selected);

  const handleExport = () => {
    downloadCSV("aegis-identities.csv", IDENTITIES.map(id => ({
      id: id.id, name: id.name, email: id.email, role: id.role,
      department: id.department, riskLevel: id.riskLevel,
      riskScore: liveRisk[id.id] ?? id.riskScore, status: id.status,
      mfa: id.mfaEnabled ? "enabled" : "disabled", lastSeen: id.lastSeen,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-identities.csv downloaded" });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight">Identity & Access (ITDR)</h1>
          <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">BEHAVIORAL RISK SCORING // PRIVILEGED MONITORING // ZERO-TRUST ENGINE</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
            📤 Export CSV
          </button>
          <button onClick={() => notify({ type: "info", title: "MFA Audit started", body: "Scanning for MFA-exempt privileged accounts…" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
            🔍 MFA Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"TOTAL IDENTITIES", value:String(IDENTITIES.length),                                    color:"#E8EAF0" },
          { label:"CRITICAL RISK",    value:String(IDENTITIES.filter(i=>i.riskLevel==="critical").length), color:"#FF073A" },
          { label:"MFA DISABLED",     value:String(IDENTITIES.filter(i=>!i.mfaEnabled).length),           color:"#F59E0B" },
          { label:"LOCKED ACCOUNTS",  value:String(IDENTITIES.filter(i=>i.status==="locked").length),     color:"#F59E0B" },
        ].map(m => (
          <div key={m.label} className="glass-card relative rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
            onClick={() => notify({ type:"info", title:m.label, body:m.value })}>
            <div className="text-[9px] font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2">{m.label}</div>
            <div className="text-[28px] font-black" style={{ color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all","critical","high","medium","low"].map(f => (
          <button key={f} onClick={() => setRiskFilter(f)}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border transition-all"
            style={riskFilter === f && f !== "all"
              ? { color: RISK_COLORS[f], background: RISK_COLORS[f]+"18", borderColor: RISK_COLORS[f]+"50" }
              : riskFilter === f
              ? { color:"#00D4FF", background:"rgba(0,212,255,0.12)", borderColor:"rgba(0,212,255,0.3)" }
              : { color:"#8892A0", background:"transparent", borderColor:"rgba(255,255,255,0.08)" }
            }>
            {f.toUpperCase()}
          </button>
        ))}
        <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
        {["all","active","suspended","locked"].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${statusFilter===f ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]" : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:text-[#E8EAF0]"}`}>
            {f.replace("_"," ").toUpperCase()}
          </button>
        ))}
        {(["risk","name"] as const).map(s => (
          <button key={s} onClick={() => setSortMode(s)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${sortMode===s ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.25)] text-[#00D4FF]" : "border-[rgba(255,255,255,0.07)] text-[#4A5568] hover:text-[#8892A0]"}`}>
            Sort: {s}
          </button>
        ))}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-md px-2.5 py-1">
          <svg viewBox="0 0 12 12" fill="none" stroke="#4A5568" strokeWidth={1.5} className="w-3 h-3 flex-shrink-0"><circle cx={5} cy={5} r={3.5}/><path d="M8 8l2 2"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, role…"
            className="bg-transparent border-none outline-none text-[11px] font-mono text-[#E8EAF0] placeholder:text-[#4A5568] w-32 caret-[#00D4FF]" />
          {search && <button onClick={() => setSearch("")} className="text-[#4A5568] hover:text-[#8892A0] text-[9px]">✕</button>}
        </div>
        <span className="ml-auto text-[10px] font-mono text-[#4A5568]">{filtered.length} identities</span>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: sel ? "1fr 280px" : "1fr" }}>
        {/* Table */}
        <div className="glass-card relative rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {["IDENTITY","ROLE / DEPT","RISK","SCORE","MFA","STATUS","LAST SEEN","ACTION"].map(h => (
                  <th key={h} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(id => {
                const risk = liveRisk[id.id] ?? id.riskScore;
                return (
                  <tr key={id.id} onClick={() => setSelected(id.id === selected ? null : id.id)}
                    className={`cursor-pointer transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0 ${selected===id.id ? "bg-[rgba(0,212,255,0.04)]" : "hover:bg-[rgba(255,255,255,0.02)]"}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                          style={{ background:`linear-gradient(135deg, ${RISK_COLORS[id.riskLevel]}, ${RISK_COLORS[id.riskLevel]}70)` }}>
                          {id.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <div className="font-semibold text-[11px]">{id.name}</div>
                          <div className="text-[9px] font-mono text-[#4A5568]">{id.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[#8892A0]">{id.role}</div>
                      <div className="text-[9px] font-mono text-[#4A5568]">{id.department}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color:RISK_COLORS[id.riskLevel], background:RISK_COLORS[id.riskLevel]+"1a", borderColor:RISK_COLORS[id.riskLevel]+"4d" }}>
                        {id.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-[3px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width:`${risk}%`, background:RISK_COLORS[id.riskLevel] }} />
                        </div>
                        <span className="font-mono font-bold text-[10px] transition-all" style={{ color:RISK_COLORS[id.riskLevel] }}>{risk}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[9px] font-mono font-bold ${id.mfaEnabled ? "text-[#2ECC71]" : "text-[#FF073A]"}`}>
                        {id.mfaEnabled ? "✓ ON" : "✗ OFF"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[9px] font-mono font-semibold uppercase" style={{ color:STATUS_COLORS[id.status]||"#8892A0" }}>{id.status.replace("_"," ")}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[#4A5568]">{id.lastSeen}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {id.riskLevel==="critical" && (
                          <button onClick={e => { e.stopPropagation(); notify({ type:"error", title:"Suspended", body:`${id.name} (${id.id})` }); }}
                            className="px-2 py-0.5 rounded border border-[rgba(255,7,58,0.3)] bg-[rgba(255,7,58,0.1)] text-[#FF073A] text-[9px] font-semibold hover:bg-[rgba(255,7,58,0.2)] btn-depress">
                            Suspend
                          </button>
                        )}
                        {!id.mfaEnabled && (
                          <button onClick={e => { e.stopPropagation(); notify({ type:"warning", title:"MFA enforced", body:`${id.name} — enrollment email sent` }); }}
                            className="px-2 py-0.5 rounded border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-[#F59E0B] text-[9px] font-semibold hover:bg-[rgba(245,158,11,0.2)] btn-depress">
                            Enroll MFA
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); setSelected(id.id===selected?null:id.id); }}
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
        </div>

        {/* Detail panel */}
        {sel && (
          <div className="glass-card relative rounded-xl p-4 space-y-4 self-start">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#4A5568]">Identity Profile</span>
              <button onClick={() => setSelected(null)} className="text-[#4A5568] hover:text-[#8892A0] text-[11px]">✕</button>
            </div>
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black text-white"
                style={{ background:`linear-gradient(135deg, ${RISK_COLORS[sel.riskLevel]}, ${RISK_COLORS[sel.riskLevel]}80)`, boxShadow:`0 0 20px ${RISK_COLORS[sel.riskLevel]}40` }}>
                {sel.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="text-center">
                <div className="text-[14px] font-bold">{sel.name}</div>
                <div className="text-[10px] font-mono text-[#00D4FF]">{sel.email}</div>
                <div className="text-[9px] font-mono text-[#4A5568] mt-0.5">{sel.role} · {sel.department}</div>
              </div>
              <div className="text-[28px] font-black font-mono" style={{ color:RISK_COLORS[sel.riskLevel] }}>
                {liveRisk[sel.id] ?? sel.riskScore}
                <span className="text-[12px] font-normal ml-1 text-[#4A5568]">/ 100</span>
              </div>
            </div>
            <div className="space-y-2 text-[10px] font-mono border-t border-[rgba(255,255,255,0.06)] pt-3">
              {[
                ["Risk Level", sel.riskLevel.toUpperCase()],
                ["Status",     sel.status.replace("_"," ").toUpperCase()],
                ["MFA",        sel.mfaEnabled ? "ENABLED ✓" : "DISABLED ✗"],
                ["Department", sel.department],
                ["Last Seen",  sel.lastSeen],
                ["ID",         sel.id],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#4A5568]">{k}</span>
                  <span className="text-[#E8EAF0] font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              {[
                { label:"Reset Password",   fn:() => notify({ type:"info",    title:"Password reset",  body:sel.email }) },
                { label:"Revoke Sessions",  fn:() => notify({ type:"warning", title:"Sessions revoked",body:sel.name  }) },
                { label:"Review Access",    fn:() => notify({ type:"info",    title:"Access review",   body:sel.role  }) },
                { label:"Suspend Account",  fn:() => notify({ type:"error",   title:"Suspended",       body:sel.name  }) },
                { label:"Force MFA Enroll", fn:() => notify({ type:"warning", title:"MFA enrollment",  body:sel.email }) },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[10px] font-mono text-[#8892A0] hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.06)] btn-depress text-left transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
