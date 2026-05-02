import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useNotifications } from "@/components/notification-stack";
import { downloadCSV } from "@/utils/export";

const API_ENDPOINTS = [
  { id: "EP-001", method: "GET",    path: "/api/users",           auth: "Bearer JWT", risk: "low",      calls24h: 48210,   anomalies: 0,   status: "healthy" },
  { id: "EP-002", method: "POST",   path: "/api/users/search",    auth: "Bearer JWT", risk: "critical", calls24h: 2848,    anomalies: 847, status: "critical" },
  { id: "EP-003", method: "GET",    path: "/api/catalog/items",   auth: "API Key",    risk: "high",     calls24h: 2412847, anomalies: 12,  status: "degraded" },
  { id: "EP-004", method: "POST",   path: "/api/auth/login",      auth: "None",       risk: "critical", calls24h: 62847,   anomalies: 324, status: "critical" },
  { id: "EP-005", method: "DELETE", path: "/api/admin/users/:id", auth: "Bearer JWT", risk: "high",     calls24h: 42,      anomalies: 2,   status: "healthy" },
  { id: "EP-006", method: "GET",    path: "/api/reports/export",  auth: "API Key",    risk: "medium",   calls24h: 1248,    anomalies: 8,   status: "degraded" },
  { id: "EP-007", method: "POST",   path: "/api/webhooks",        auth: "Signature",  risk: "low",      calls24h: 8421,    anomalies: 0,   status: "healthy" },
  { id: "EP-008", method: "GET",    path: "/api/internal/health", auth: "None",       risk: "high",     calls24h: 14400,   anomalies: 0,   status: "degraded" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "#2ECC71", POST: "#00D4FF", PUT: "#F59E0B", DELETE: "#FF073A", PATCH: "#1E6FFF",
};
const RISK_COLOR: Record<string, string> = {
  critical: "#FF073A", high: "#F59E0B", medium: "#00D4FF", low: "#2ECC71",
};
const STATUS_COLOR: Record<string, string> = {
  critical: "#FF073A", degraded: "#F59E0B", healthy: "#2ECC71",
};

const CHART_DATA = [...API_ENDPOINTS]
  .sort((a, b) => b.calls24h - a.calls24h)
  .slice(0, 6)
  .map(ep => ({
    name: ep.path.split("/").slice(-1)[0] || ep.path,
    calls: ep.calls24h,
    anomalies: ep.anomalies,
    risk: ep.risk,
  }));

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(10,10,22,0.97)] border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2 font-mono text-[10px]">
      <div className="text-[#8892A0] mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="text-[#E8EAF0]">{p.name}: <span className="text-[#00D4FF] font-bold">{p.value?.toLocaleString()}</span></div>
      ))}
    </div>
  );
};

export default function ApiPosture() {
  const { push: notify } = useNotifications();
  const [liveCalls, setLiveCalls] = useState<Record<string, number>>({});

  useEffect(() => {
    const init: Record<string, number> = {};
    API_ENDPOINTS.forEach(ep => { init[ep.id] = ep.calls24h; });
    setLiveCalls(init);
    const t = setInterval(() => {
      setLiveCalls(prev => {
        const next = { ...prev };
        API_ENDPOINTS.forEach(ep => {
          next[ep.id] = prev[ep.id] + Math.round(Math.random() * 8 + 1);
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const handleExport = () => {
    downloadCSV("aegis-api-posture.csv", API_ENDPOINTS.map(ep => ({
      id: ep.id, method: ep.method, path: ep.path, auth: ep.auth,
      risk: ep.risk, calls24h: liveCalls[ep.id] ?? ep.calls24h,
      anomalies: ep.anomalies, status: ep.status,
    })));
    notify({ type: "success", title: "Export complete", body: "aegis-api-posture.csv downloaded" });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight">API Posture</h1>
          <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">API INVENTORY // RISK SCORING // ANOMALY DETECTION // LIVE CALL COUNTER</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.08)] text-[#2ECC71] text-[11px] font-semibold hover:bg-[rgba(46,204,113,0.15)] transition-all btn-depress">
            📤 Export CSV
          </button>
          <button onClick={() => notify({ type: "info", title: "API Discovery", body: "Scanning network for undocumented endpoints…" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
            🔍 Discover APIs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "TOTAL ENDPOINTS", value: "347",   color: "#E8EAF0" },
          { label: "UNAUTHENTICATED", value: "12",    color: "#FF073A" },
          { label: "HIGH RISK",       value: "28",    color: "#F59E0B" },
          { label: "ANOMALIES (24H)", value: "1,193", color: "#00D4FF" },
        ].map((m) => (
          <div key={m.label} className="glass-card relative rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all"
            onClick={() => notify({ type: "info", title: m.label, body: m.value })}>
            <div className="text-[9px] font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2">{m.label}</div>
            <div className="text-[28px] font-black" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart — call volume */}
      <div className="glass-card relative rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">Endpoint Call Volume — Top 6 (24h)</span>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#2ECC71]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block animate-pulse" /> live
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#4A5568", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#4A5568", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="calls" radius={[3,3,0,0]} name="calls">
              {CHART_DATA.map((entry, i) => (
                <Cell key={i} fill={RISK_COLOR[entry.risk] || "#00D4FF"} fillOpacity={0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-3 mt-1 text-[9px] font-mono text-[#4A5568]">
          {Object.entries(RISK_COLOR).map(([k,v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: v }} />{k}
            </span>
          ))}
        </div>
      </div>

      {/* Endpoint Table */}
      <div className="glass-card relative rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">API Inventory — Monitored Endpoints</span>
          <span className="text-[10px] font-mono text-[#4A5568]">Showing {API_ENDPOINTS.length} of 347</span>
        </div>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {["METHOD", "ENDPOINT", "AUTH", "RISK", "CALLS 24H", "ANOMALIES", "STATUS", "ACTION"].map((h) => (
                <th key={h} className="text-[9px] font-mono font-bold text-[#4A5568] uppercase tracking-[0.1em] px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {API_ENDPOINTS.map((ep) => (
              <tr key={ep.id} className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0"
                onClick={() => notify({ type: ep.risk === "critical" ? "error" : "info", title: ep.path, body: `${ep.method} · ${ep.auth} · ${(liveCalls[ep.id] ?? ep.calls24h).toLocaleString()} calls` })}>
                <td className="px-3 py-2.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: METHOD_COLOR[ep.method] || "#8892A0", background: (METHOD_COLOR[ep.method] || "#8892A0") + "1a" }}>
                    {ep.method}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[#00D4FF]">{ep.path}</td>
                <td className="px-3 py-2.5 font-mono text-[#8892A0]">
                  <span className={ep.auth === "None" ? "text-[#FF073A] font-semibold" : ""}>{ep.auth}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color: RISK_COLOR[ep.risk], background: RISK_COLOR[ep.risk] + "1a", borderColor: RISK_COLOR[ep.risk] + "4d" }}>
                    {ep.risk.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[#E8EAF0] transition-all duration-500">
                  {(liveCalls[ep.id] ?? ep.calls24h).toLocaleString()}
                  <span className="text-[8px] text-[#2ECC71] ml-1">↑</span>
                </td>
                <td className="px-3 py-2.5 font-mono" style={{ color: ep.anomalies > 0 ? "#F59E0B" : "#4A5568" }}>
                  {ep.anomalies > 0 ? `⚠ ${ep.anomalies}` : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[ep.status], boxShadow: `0 0 5px ${STATUS_COLOR[ep.status]}` }} />
                    <span className="text-[9px] font-mono font-semibold uppercase" style={{ color: STATUS_COLOR[ep.status] }}>{ep.status}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    {ep.anomalies > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); notify({ type: "warning", title: "Rate limiting applied", body: ep.path }); }}
                        className="px-2 py-0.5 rounded border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#F59E0B] text-[9px] font-semibold hover:bg-[rgba(245,158,11,0.15)] btn-depress">
                        Rate Limit
                      </button>
                    )}
                    {ep.auth === "None" && (
                      <button onClick={(e) => { e.stopPropagation(); notify({ type: "error", title: "Auth required", body: `Adding JWT auth to ${ep.path}` }); }}
                        className="px-2 py-0.5 rounded border border-[rgba(255,7,58,0.3)] bg-[rgba(255,7,58,0.08)] text-[#FF073A] text-[9px] font-semibold hover:bg-[rgba(255,7,58,0.15)] btn-depress">
                        Secure
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); notify({ type: "info", title: "Scanning", body: ep.path }); }}
                      className="px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#8892A0] text-[9px] hover:text-[#E8EAF0] btn-depress">
                      Scan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
