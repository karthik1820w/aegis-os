import { useState } from "react";
import { INCIDENTS } from "@/data/mock";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV } from "@/utils/export";

const PRIORITY_COLOR: Record<string, string> = {
  P1: "#FF073A", P2: "#F59E0B", P3: "#00D4FF", P4: "#8892A0",
};
const STATUS_COLOR: Record<string, string> = {
  open: "#FF073A", in_progress: "#F59E0B", resolved: "#2ECC71", closed: "#4A5568",
};

const TIMELINE_EVENTS: { incId: string; time: string; actor: string; action: string; type: "create"|"update"|"escalate"|"resolve"|"comment"|"assign" }[] = [
  { incId:"INC-0841", time:"2m ago",   actor:"AEGIS-ENGINE", action:"Incident auto-created from threat THR-001 (Ransomware C2 Beacon)", type:"create" },
  { incId:"INC-0841", time:"2m ago",   actor:"S. Liu",       action:"Assigned to self — starting investigation", type:"assign" },
  { incId:"INC-0841", time:"1m ago",   actor:"AEGIS-ENGINE", action:"C2 traffic null-routed at upstream ISP", type:"update" },
  { incId:"INC-0841", time:"30s ago",  actor:"S. Liu",       action:"PROD-DB-01 VLAN isolation initiated", type:"escalate" },
  { incId:"INC-0840", time:"34m ago",  actor:"AEGIS-ENGINE", action:"Zero-day exploit detected on NGINX-EDGE-02 (CVE-2024-3094)", type:"create" },
  { incId:"INC-0840", time:"33m ago",  actor:"R. Patel",     action:"Incident acknowledged and in progress", type:"assign" },
  { incId:"INC-0840", time:"20m ago",  actor:"R. Patel",     action:"Shellcode injection confirmed in nginx worker PID 1847", type:"comment" },
  { incId:"INC-0840", time:"12m ago",  actor:"R. Patel",     action:"Patch applied — CVE-2024-3094 mitigated on NGINX-EDGE-02", type:"update" },
  { incId:"INC-0839", time:"1h ago",   actor:"AEGIS-ENGINE", action:"Credential stuffing — 103 accounts compromised", type:"create" },
  { incId:"INC-0839", time:"59m ago",  actor:"D. Chen",      action:"Forced password reset for all 103 affected accounts", type:"update" },
  { incId:"INC-0839", time:"45m ago",  actor:"D. Chen",      action:"MFA enforcement enabled for affected user pool", type:"update" },
  { incId:"INC-0838", time:"2h ago",   actor:"AEGIS-ENGINE", action:"Lateral movement detected via SMB — CORP-DC-01 targeted", type:"create" },
  { incId:"INC-0838", time:"1h 45m ago",actor:"M. Torres",   action:"Compromised host 10.0.14.22 quarantined", type:"escalate" },
  { incId:"INC-0838", time:"30m ago",  actor:"M. Torres",    action:"Mimikatz artifacts removed — forensic snapshot captured", type:"comment" },
  { incId:"INC-0835", time:"6h ago",   actor:"AEGIS-ENGINE", action:"DDoS volumetric attack detected — 48 Gbps peak", type:"create" },
  { incId:"INC-0835", time:"5h 45m ago",actor:"R. Patel",    action:"Scrubbing center engaged — traffic being cleaned", type:"update" },
  { incId:"INC-0835", time:"5h ago",   actor:"R. Patel",     action:"Attack mitigated — 99.1% traffic cleaned", type:"resolve" },
];

const TYPE_ICON: Record<string, string> = {
  create: "🔴", update: "🔵", escalate: "🟡", resolve: "🟢", comment: "💬", assign: "👤",
};
const TYPE_COLOR: Record<string, string> = {
  create: "#FF073A", update: "#00D4FF", escalate: "#F59E0B", resolve: "#2ECC71", comment: "#8892A0", assign: "#1E6FFF",
};

export default function IncidentsPage() {
  const { push: notify } = useNotifications();
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"list"|"timeline">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newIncModal, setNewIncModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("P2");

  const inc = INCIDENTS.find((i) => i.id === selected);
  const filteredInc = statusFilter === "all" ? INCIDENTS : INCIDENTS.filter(i => i.status === statusFilter || i.priority === statusFilter);

  const timelineForInc = selected ? TIMELINE_EVENTS.filter(e => e.incId === selected) : TIMELINE_EVENTS;

  const handleExport = () => {
    downloadCSV("aegis-incidents.csv", INCIDENTS.map(i => ({
      id: i.id, priority: i.priority, title: i.title,
      status: i.status, assignee: i.assignee, created: i.created, updated: i.updated,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-incidents.csv downloaded" });
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    notify({ type: "error", title: `${newPriority} incident created`, body: newTitle });
    setNewIncModal(false);
    setNewTitle("");
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-bold tracking-tight">Incident Management</h1>
            <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">P1–P4 TRACKING // SLA MONITORING // MTTR: 2.4H</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
              📤 Export CSV
            </button>
            <button onClick={() => setNewIncModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(255,7,58,0.3)] bg-[rgba(255,7,58,0.08)] text-[#FF073A] text-[11px] font-semibold hover:bg-[rgba(255,7,58,0.15)] transition-all btn-depress">
              + New Incident
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "OPEN",          value: String(INCIDENTS.filter(i=>i.status==="open").length),        color: "#FF073A" },
            { label: "IN PROGRESS",   value: String(INCIDENTS.filter(i=>i.status==="in_progress").length), color: "#F59E0B" },
            { label: "RESOLVED (7D)", value: String(INCIDENTS.filter(i=>i.status==="resolved").length),    color: "#2ECC71" },
            { label: "MTTR",          value: "2.4h",                                                       color: "#00D4FF" },
          ].map((m) => (
            <div key={m.label} className="glass-card relative rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
              onClick={() => notify({ type: "info", title: m.label, body: m.value })}>
              <div className="text-[9px] font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2">{m.label}</div>
              <div className="text-[28px] font-black" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2">
          {[["list","Incident List"],["timeline","Event Timeline"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t as "list"|"timeline")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
                tab === t
                  ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                  : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:border-[rgba(255,255,255,0.15)] hover:text-[#E8EAF0]"
              }`}>{label}</button>
          ))}
          {tab === "list" && (
            <div className="flex gap-1.5 ml-2">
              {["all","open","in_progress","resolved","closed","P1","P2","P3"].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border transition-all ${
                    statusFilter === f
                      ? "bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                      : "bg-transparent border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:text-[#E8EAF0]"
                  }`}>{f.replace("_"," ").toUpperCase()}</button>
              ))}
            </div>
          )}
          {tab === "timeline" && selected && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[10px] font-mono text-[#4A5568]">Showing events for</span>
              <span className="text-[10px] font-mono text-[#00D4FF] font-bold">{selected}</span>
              <button onClick={() => setSelected(null)} className="text-[9px] text-[#4A5568] hover:text-[#8892A0] font-mono">✕ All</button>
            </div>
          )}
        </div>

        {tab === "list" ? (
          <>
            <div className="glass-card relative rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    {["ID", "PRIORITY", "TITLE", "STATUS", "ASSIGNED", "CREATED", "ACTION"].map((h) => (
                      <th key={h} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInc.map((i) => (
                    <tr key={i.id} onClick={() => setSelected(i.id === selected ? null : i.id)}
                      className={`cursor-pointer transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0 ${selected === i.id ? "bg-[rgba(0,212,255,0.04)]" : "hover:bg-[rgba(255,255,255,0.02)]"}`}>
                      <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{i.id}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color: PRIORITY_COLOR[i.priority], background: PRIORITY_COLOR[i.priority] + "1a", borderColor: PRIORITY_COLOR[i.priority] + "4d" }}>
                          {i.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#E8EAF0] font-medium max-w-[200px] truncate">{i.title}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full" style={{ background: STATUS_COLOR[i.status], boxShadow: `0 0 4px ${STATUS_COLOR[i.status]}` }} />
                          <span className="text-[9px] font-mono font-semibold uppercase" style={{ color: STATUS_COLOR[i.status] }}>{i.status.replace("_"," ")}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#8892A0]">{i.assignee}</td>
                      <td className="px-3 py-2.5 font-mono text-[#4A5568]">{i.created}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); notify({ type: "info", title: "Assigned", body: `${i.id} assigned to on-call engineer` }); }}
                            className="px-2 py-0.5 rounded border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[9px] font-semibold hover:bg-[rgba(0,212,255,0.15)] btn-depress">
                            Assign
                          </button>
                          {i.status !== "resolved" && i.status !== "closed" && (
                            <button onClick={(e) => { e.stopPropagation(); notify({ type: "success", title: "Resolved", body: `${i.id} marked as resolved` }); }}
                              className="px-2 py-0.5 rounded border border-[rgba(46,204,113,0.25)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[9px] font-semibold hover:bg-[rgba(46,204,113,0.15)] btn-depress">
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {inc && (
              <div className="glass-card relative rounded-xl p-4 border border-[rgba(0,212,255,0.15)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#00D4FF]">{inc.id}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color: PRIORITY_COLOR[inc.priority], background: PRIORITY_COLOR[inc.priority] + "1a", borderColor: PRIORITY_COLOR[inc.priority] + "4d" }}>{inc.priority}</span>
                    <span className="text-[9px] font-mono font-semibold uppercase" style={{ color: STATUS_COLOR[inc.status] }}>{inc.status.replace("_"," ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setTab("timeline")} className="text-[10px] font-mono text-[#00D4FF] hover:text-[#00D4FF] opacity-70 hover:opacity-100 transition-opacity">View Timeline →</button>
                    <button onClick={() => setSelected(null)} className="text-[#4A5568] hover:text-[#8892A0] text-[11px]">✕</button>
                  </div>
                </div>
                <h3 className="text-[14px] font-semibold mb-2">{inc.title}</h3>
                <div className="grid grid-cols-3 gap-3 text-[10px] font-mono mb-4">
                  <div><span className="text-[#4A5568]">Assignee: </span><span className="text-[#E8EAF0]">{inc.assignee}</span></div>
                  <div><span className="text-[#4A5568]">Created: </span><span className="text-[#E8EAF0]">{inc.created}</span></div>
                  <div><span className="text-[#4A5568]">Updated: </span><span className="text-[#E8EAF0]">{inc.updated}</span></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["Escalate to P1", "Add Comment", "Link Threat", "Page On-Call", "Export PDF"].map((action) => (
                    <button key={action} onClick={() => notify({ type: "info", title: action, body: inc.id })}
                      className="px-3 py-1.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#8892A0] text-[11px] hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.07)] btn-depress">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Timeline Tab */
          <div className="glass-card relative rounded-xl p-4">
            <div className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-4">
              {selected ? `Event Timeline — ${selected}` : "All Incident Events — Chronological"}
            </div>
            <div className="relative pl-5">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]" />

              {timelineForInc.map((ev, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-[#050508] flex items-center justify-center"
                    style={{ background: TYPE_COLOR[ev.type], boxShadow: `0 0 8px ${TYPE_COLOR[ev.type]}60` }} />

                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2.5 hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px]">{TYPE_ICON[ev.type]}</span>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wide" style={{ color: TYPE_COLOR[ev.type] }}>{ev.type}</span>
                        <span className="text-[9px] font-mono text-[#00D4FF] font-semibold">{ev.incId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-[#4A5568]">{ev.time}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#E8EAF0] leading-snug">{ev.action}</div>
                    <div className="text-[9px] font-mono text-[#4A5568] mt-1">by <span className="text-[#8892A0]">{ev.actor}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick filter by incident */}
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.1em] mb-2">Filter by incident</div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSelected(null)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border transition-all ${!selected ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)] text-[#00D4FF]" : "border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:text-[#E8EAF0]"}`}>
                  ALL
                </button>
                {[...new Set(TIMELINE_EVENTS.map(e => e.incId))].map(id => (
                  <button key={id} onClick={() => setSelected(id === selected ? null : id)}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border transition-all ${selected === id ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)] text-[#00D4FF]" : "border-[rgba(255,255,255,0.08)] text-[#8892A0] hover:text-[#E8EAF0]"}`}>
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Incident Modal */}
      {newIncModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[900] flex items-center justify-center" onClick={() => setNewIncModal(false)}>
          <div className="w-[440px] bg-[rgba(10,10,20,0.98)] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-[14px] font-bold mb-1">Create New Incident</div>
            <div className="text-[10px] font-mono text-[#4A5568] mb-5">Automatically linked to SIEM and PagerDuty</div>

            <div className="space-y-4">
              <div>
                <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.1em] mb-1.5">Incident Title</div>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="Brief description of the incident…"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-[12px] font-mono text-[#E8EAF0] placeholder:text-[#4A5568] outline-none focus:border-[rgba(0,212,255,0.3)] caret-[#00D4FF] transition-colors" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#4A5568] uppercase tracking-[0.1em] mb-1.5">Priority</div>
                <div className="flex gap-2">
                  {["P1","P2","P3","P4"].map(p => (
                    <button key={p} onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2 rounded-lg border text-[11px] font-mono font-bold transition-all ${newPriority === p ? "border-current" : "border-[rgba(255,255,255,0.08)] text-[#4A5568] hover:text-[#8892A0]"}`}
                      style={newPriority === p ? { color: PRIORITY_COLOR[p], background: PRIORITY_COLOR[p]+"18", borderColor: PRIORITY_COLOR[p]+"60" } : {}}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleCreate}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(255,7,58,0.4)] bg-[rgba(255,7,58,0.1)] text-[#FF073A] text-[12px] font-semibold hover:bg-[rgba(255,7,58,0.18)] transition-all btn-depress">
                Create {newPriority} Incident
              </button>
              <button onClick={() => setNewIncModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#8892A0] text-[12px] hover:text-[#E8EAF0] btn-depress">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
