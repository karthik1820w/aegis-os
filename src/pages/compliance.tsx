import { useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV, downloadJSON } from "@/utils/export";

const FRAMEWORKS = [
  { id: "SOC2",     name: "SOC 2 Type II",      score: 87, controls: 64,  passing: 56, failing: 5, pending: 3,  lastAudit: "2024-12-01", color: "#1E6FFF" },
  { id: "ISO27001", name: "ISO 27001:2022",      score: 91, controls: 93,  passing: 85, failing: 4, pending: 4,  lastAudit: "2024-11-15", color: "#2ECC71" },
  { id: "PCIDSS",   name: "PCI DSS v4.0",        score: 74, controls: 12,  passing: 9,  failing: 2, pending: 1,  lastAudit: "2025-01-10", color: "#F59E0B" },
  { id: "NIST",     name: "NIST CSF 2.0",        score: 83, controls: 108, passing: 90, failing: 8, pending: 10, lastAudit: "2024-10-20", color: "#00D4FF" },
  { id: "GDPR",     name: "GDPR",                score: 78, controls: 42,  passing: 33, failing: 6, pending: 3,  lastAudit: "2025-02-01", color: "#F59E0B" },
  { id: "HIPAA",    name: "HIPAA Security Rule",  score: 95, controls: 54,  passing: 51, failing: 1, pending: 2,  lastAudit: "2024-09-15", color: "#2ECC71" },
];

const CONTROLS = [
  { id: "CC6.1", framework: "SOC2",     name: "Logical Access Controls",       status: "passing", owner: "S. Liu",     dueDate: "—" },
  { id: "CC6.2", framework: "SOC2",     name: "New User Registration",          status: "passing", owner: "R. Patel",   dueDate: "—" },
  { id: "CC6.3", framework: "SOC2",     name: "Privileged Access Removal",      status: "failing", owner: "Unassigned", dueDate: "2025-05-15" },
  { id: "CC7.1", framework: "SOC2",     name: "System Monitoring",             status: "passing", owner: "D. Chen",    dueDate: "—" },
  { id: "CC7.2", framework: "SOC2",     name: "Incident Response",             status: "pending", owner: "M. Torres",  dueDate: "2025-05-30" },
  { id: "A.9.1", framework: "ISO27001", name: "Access Control Policy",        status: "passing", owner: "S. Liu",     dueDate: "—" },
  { id: "A.9.4", framework: "ISO27001", name: "System & App Access Ctrl",     status: "failing", owner: "R. Patel",   dueDate: "2025-05-20" },
  { id: "1.1",   framework: "PCIDSS",   name: "Network Security Controls",     status: "failing", owner: "D. Chen",    dueDate: "2025-06-01" },
  { id: "PR.AC", framework: "NIST",     name: "Identity Management & Access",  status: "passing", owner: "M. Torres",  dueDate: "—" },
  { id: "DE.CM", framework: "NIST",     name: "Continuous Monitoring",         status: "pending", owner: "S. Liu",     dueDate: "2025-06-15" },
];

const STATUS_COLOR: Record<string, string> = { passing: "#2ECC71", failing: "#FF073A", pending: "#F59E0B" };

const ScoreGauge = ({ score, color, size = 80 }: { score: number; color: string; size?: number }) => {
  const data = [{ value: score, fill: color }];
  const r = size / 2;
  const circ = 2 * Math.PI * (r - 10);
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={r} cy={r} r={r - 10} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        <circle cx={r} cy={r} r={r - 10} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease", filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-black font-mono" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
};

export default function Compliance() {
  const { push: notify } = useNotifications();
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview"|"controls">("overview");

  const visibleControls = selected ? CONTROLS.filter(c => c.framework === selected) : CONTROLS;
  const overallScore = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);

  const handleExport = () => {
    downloadCSV("aegis-compliance.csv", CONTROLS.map(c => ({
      id: c.id, framework: c.framework, name: c.name,
      status: c.status, owner: c.owner, dueDate: c.dueDate,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-compliance.csv downloaded" });
  };

  const handleReport = () => {
    downloadJSON("aegis-compliance-report.json", {
      generatedAt: new Date().toISOString(),
      overallScore,
      frameworks: FRAMEWORKS,
      controls: CONTROLS,
    });
    notify({ type: "success", title: "Report generated", body: "aegis-compliance-report.json downloaded" });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight">Compliance</h1>
          <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">CONTINUOUS COMPLIANCE MONITORING // 6 ACTIVE FRAMEWORKS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
            📤 Export CSV
          </button>
          <button onClick={handleReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
            📋 Generate Report
          </button>
        </div>
      </div>

      {/* Overall score + RadialBar */}
      <div className="grid grid-cols-12 gap-3">
        {/* Radial chart */}
        <div className="col-span-5 glass-card relative rounded-xl p-4">
          <div className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-3">Overall Compliance Score</div>
          <div className="flex items-center gap-6">
            <ScoreGauge score={overallScore} color={overallScore >= 90 ? "#2ECC71" : overallScore >= 75 ? "#F59E0B" : "#FF073A"} size={100} />
            <div className="flex-1 space-y-2">
              {FRAMEWORKS.map(fw => (
                <div key={fw.id} className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setSelected(fw.id === selected ? null : fw.id)}>
                  <span className="text-[9px] font-mono text-[#4A5568] w-[52px] flex-shrink-0">{fw.id}</span>
                  <div className="flex-1 h-[5px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
                      style={{ width: `${fw.score}%`, background: fw.color }} />
                  </div>
                  <span className="text-[9px] font-mono font-bold w-8 text-right flex-shrink-0" style={{ color: fw.color }}>{fw.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Framework gauge grid */}
        <div className="col-span-7 glass-card relative rounded-xl p-4">
          <div className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-3">Framework Scores</div>
          <div className="grid grid-cols-3 gap-3">
            {FRAMEWORKS.map(fw => {
              const scoreColor = fw.score >= 90 ? "#2ECC71" : fw.score >= 75 ? "#F59E0B" : "#FF073A";
              return (
                <div key={fw.id}
                  onClick={() => setSelected(fw.id === selected ? null : fw.id)}
                  className={`rounded-xl p-3 cursor-pointer border transition-all flex flex-col items-center gap-1 hover:brightness-110 ${selected === fw.id ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.05)]" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"}`}>
                  <ScoreGauge score={fw.score} color={scoreColor} size={60} />
                  <div className="text-[9px] font-mono font-bold text-[#8892A0]">{fw.id}</div>
                  <div className="flex gap-2 text-[8px] font-mono">
                    <span className="text-[#2ECC71]">{fw.passing}✓</span>
                    <span className="text-[#FF073A]">{fw.failing}✗</span>
                    <span className="text-[#F59E0B]">{fw.pending}○</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2">
        {[["overview","Framework Overview"],["controls","Control Inventory"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as "overview"|"controls")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
              tab === t
                ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:border-[rgba(255,255,255,0.15)] hover:text-[#E8EAF0]"
            }`}>{label}</button>
        ))}
        {selected && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-[10px] font-mono text-[#4A5568]">Filtered to</span>
            <span className="text-[10px] font-mono text-[#00D4FF] font-bold">{selected}</span>
            <button onClick={() => setSelected(null)} className="text-[9px] text-[#4A5568] hover:text-[#8892A0] font-mono">✕ Clear</button>
          </div>
        )}
      </div>

      {tab === "overview" ? (
        <div className="grid grid-cols-3 gap-3">
          {FRAMEWORKS.map((fw) => {
            const scoreColor = fw.score >= 90 ? "#2ECC71" : fw.score >= 75 ? "#F59E0B" : "#FF073A";
            return (
              <div key={fw.id}
                onClick={() => setSelected(fw.id === selected ? null : fw.id)}
                className={`glass-card relative rounded-xl p-4 cursor-pointer transition-all ${selected === fw.id ? "border border-[rgba(0,212,255,0.25)]" : "border border-transparent hover:border-[rgba(255,255,255,0.1)]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase">{fw.id}</span>
                  <span className="text-[18px] font-black font-mono" style={{ color: scoreColor }}>{fw.score}%</span>
                </div>
                <div className="text-[12px] font-semibold mb-2">{fw.name}</div>
                <div className="h-[3px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${fw.score}%`, background: scoreColor, boxShadow: `0 0 8px ${scoreColor}50` }} />
                </div>
                <div className="grid grid-cols-3 text-center text-[10px] font-mono">
                  <div><div className="text-[#2ECC71] font-bold">{fw.passing}</div><div className="text-[#4A5568]">pass</div></div>
                  <div><div className="text-[#FF073A] font-bold">{fw.failing}</div><div className="text-[#4A5568]">fail</div></div>
                  <div><div className="text-[#F59E0B] font-bold">{fw.pending}</div><div className="text-[#4A5568]">pend</div></div>
                </div>
                <div className="text-[9px] font-mono text-[#4A5568] mt-2 flex justify-between">
                  <span>Last audit: {fw.lastAudit}</span>
                  <span>{fw.controls} controls</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card relative rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">
              Control Inventory{selected ? ` — ${selected}` : ""}
            </span>
            <span className="text-[10px] font-mono text-[#4A5568]">{visibleControls.length} controls</span>
          </div>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {["ID","FRAMEWORK","CONTROL NAME","STATUS","OWNER","DUE DATE","ACTION"].map((h) => (
                  <th key={h} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleControls.map((ctrl) => (
                <tr key={ctrl.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0 cursor-pointer"
                  onClick={() => notify({ type: ctrl.status === "failing" ? "error" : ctrl.status === "pending" ? "warning" : "success", title: ctrl.id, body: ctrl.name })}>
                  <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{ctrl.id}</td>
                  <td className="px-3 py-2.5 font-mono text-[#4A5568]">{ctrl.framework}</td>
                  <td className="px-3 py-2.5 text-[#E8EAF0] font-medium">{ctrl.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color: STATUS_COLOR[ctrl.status], background: STATUS_COLOR[ctrl.status]+"1a", borderColor: STATUS_COLOR[ctrl.status]+"4d" }}>
                      {ctrl.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[#8892A0]">{ctrl.owner}</td>
                  <td className="px-3 py-2.5 font-mono" style={{ color: ctrl.dueDate !== "—" ? "#F59E0B" : "#4A5568" }}>{ctrl.dueDate}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {ctrl.status === "failing" && (
                        <button onClick={(e) => { e.stopPropagation(); notify({ type: "info", title: "Remediation created", body: ctrl.id }); }}
                          className="px-2 py-0.5 rounded border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[9px] font-semibold hover:bg-[rgba(0,212,255,0.15)] btn-depress">
                          Remediate
                        </button>
                      )}
                      {ctrl.status === "pending" && (
                        <button onClick={(e) => { e.stopPropagation(); notify({ type: "success", title: "Evidence submitted", body: ctrl.id }); }}
                          className="px-2 py-0.5 rounded border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] text-[#F59E0B] text-[9px] font-semibold hover:bg-[rgba(245,158,11,0.15)] btn-depress">
                          Submit Evidence
                        </button>
                      )}
                      {ctrl.status === "passing" && (
                        <span className="text-[9px] font-mono text-[#2ECC71]">✓ Compliant</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
