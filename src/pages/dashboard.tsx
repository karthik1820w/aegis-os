import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { THREATS, DEFENSE_LAYERS, HONEYPOTS, ThreatSeverity } from "@/data/mock";
import { useLayout } from "@/components/layout";
import { DetailDrawer } from "@/components/detail-drawer";
import { BreachAlert } from "@/components/breach-alert";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { useNotifications } from "@/components/notification-stack";
import { ShieldAlert, Shield, AlertTriangle, Zap } from "lucide-react";

const SEV_COLORS: Record<ThreatSeverity, string> = {
  critical: "#FF073A", high: "#F59E0B", medium: "#00D4FF", low: "#2ECC71",
};

function genPoint(i: number) {
  const t = new Date(Date.now() - i * 30_000);
  return {
    label: t.getHours().toString().padStart(2, "0") + ":" + t.getMinutes().toString().padStart(2, "0") + ":" + t.getSeconds().toString().padStart(2, "0"),
    threats: Math.round(Math.random() * 14 + 1),
    blocked: Math.round(Math.random() * 90 + 40),
    anomalies: Math.round(Math.random() * 8),
  };
}
function genTimeline() {
  return Array.from({ length: 60 }, (_, i) => genPoint(59 - i));
}

interface MapNode { id: string; x: number; y: number; sev: ThreatSeverity; born: number; threat: string }

const MITRE_TACTICS = [
  { id: "TA0001", name: "Initial Access",     hits: 12 },
  { id: "TA0002", name: "Execution",          hits: 8  },
  { id: "TA0003", name: "Persistence",        hits: 6  },
  { id: "TA0004", name: "Priv. Escalation",   hits: 4  },
  { id: "TA0005", name: "Defense Evasion",    hits: 9  },
  { id: "TA0006", name: "Credential Access",  hits: 7  },
  { id: "TA0007", name: "Discovery",          hits: 3  },
  { id: "TA0008", name: "Lateral Movement",   hits: 5  },
  { id: "TA0010", name: "Exfiltration",       hits: 2  },
  { id: "TA0011", name: "C2",                 hits: 11 },
];

function LiveThreatMap({ onNodeClick }: { onNodeClick: (id: string) => void }) {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [pulse, setPulse] = useState<{ x: number; y: number; id: string }[]>([]);

  useEffect(() => {
    const initial: MapNode[] = THREATS.slice(0, 8).map((t) => ({
      id: t.id, x: t.coords[0], y: t.coords[1], sev: t.severity, born: Date.now(), threat: t.type,
    }));
    setNodes(initial);

    const interval = setInterval(() => {
      const sevs: ThreatSeverity[] = ["critical", "high", "medium", "low"];
      const s = sevs[Math.floor(Math.random() * 4)];
      const nx = 50 + Math.random() * 580;
      const ny = 30 + Math.random() * 260;
      const id = Math.random().toString(36).slice(2);
      const pulseId = Math.random().toString(36).slice(2);
      setPulse((prev) => [...prev, { x: nx, y: ny, id: pulseId }]);
      setTimeout(() => setPulse((prev) => prev.filter((p) => p.id !== pulseId)), 1800);
      if (s === "critical" || s === "high") {
        setNodes((prev) => {
          const threat = THREATS[Math.floor(Math.random() * THREATS.length)];
          const newNode: MapNode = { id, x: nx, y: ny, sev: s, born: Date.now(), threat: threat.type };
          return [...prev.slice(-9), newNode];
        });
        setTimeout(() => setNodes((prev) => prev.filter((n) => n.id !== id)), 8000 + Math.random() * 4000);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const HQ = { x: 340, y: 155 };

  return (
    <svg viewBox="0 0 700 320" className="w-full" style={{ display: "block" }}>
      <defs>
        <radialGradient id="hqGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E6FFF" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#1E6FFF" stopOpacity={0} />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[64, 128, 192, 256].map((y) => <line key={y} x1={0} y1={y} x2={700} y2={y} stroke="rgba(0,212,255,0.04)" strokeWidth={0.5} />)}
      {[140, 280, 420, 560].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={320} stroke="rgba(0,212,255,0.04)" strokeWidth={0.5} />)}

      {/* Landmasses */}
      {[
        "M80 80 L190 70 L215 95 L235 135 L225 165 L205 185 L180 178 L158 192 L140 188 L118 202 L100 198 L80 170 L60 160 L50 132 L56 102 Z",
        "M158 212 L192 207 L214 222 L222 262 L217 305 L205 322 L184 327 L164 312 L150 282 L148 252 L155 228 Z",
        "M305 58 L362 53 L382 68 L372 97 L352 102 L332 97 L310 78 Z",
        "M308 112 L362 107 L378 132 L372 182 L363 222 L342 242 L322 238 L300 212 L293 172 L298 132 Z",
        "M390 48 L542 43 L572 72 L583 112 L562 142 L522 157 L492 152 L462 132 L432 122 L402 102 L387 80 Z",
        "M530 167 L582 162 L597 187 L582 212 L557 217 L537 202 Z",
        "M558 237 L612 230 L627 257 L617 282 L587 287 L560 272 Z",
      ].map((d, i) => (
        <path key={i} d={d} fill="rgba(0,212,255,0.05)" stroke="rgba(0,212,255,0.10)" strokeWidth={0.5} />
      ))}

      {/* HQ pulse rings */}
      {[1, 2, 3].map((r) => (
        <circle key={r} cx={HQ.x} cy={HQ.y} r={r * 20} fill="none" stroke="rgba(30,111,255,0.15)" strokeWidth={0.8}>
          <animate attributeName="r" from={r * 20} to={r * 20 + 10} dur={`${1 + r * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from={0.4} to={0} dur={`${1 + r * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Attack vectors */}
      {nodes.map((node, i) => {
        const col = SEV_COLORS[node.sev];
        const mx = (node.x + HQ.x) / 2 + (i % 2 === 0 ? 25 : -25);
        const my = (node.y + HQ.y) / 2 + (i % 3 === 0 ? 18 : -12);
        return (
          <g key={node.id}>
            <path d={`M${node.x} ${node.y} Q${mx} ${my} ${HQ.x} ${HQ.y}`}
              stroke={col} strokeWidth={0.8} fill="none" opacity={0.3} strokeDasharray="5 4">
              <animate attributeName="stroke-dashoffset" from={0} to={36} dur={`${1.4 + i * 0.2}s`} repeatCount="indefinite" />
            </path>
          </g>
        );
      })}

      {/* Pulse ripples on new node spawn */}
      {pulse.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r={4} fill="none" stroke="#FF073A" strokeWidth={1.5} opacity={0.8}>
          <animate attributeName="r" from={4} to={24} dur="1.6s" fill="freeze" />
          <animate attributeName="opacity" from={0.8} to={0} dur="1.6s" fill="freeze" />
        </circle>
      ))}

      {/* Honeypots */}
      {HONEYPOTS.map((hp, i) => (
        <g key={i}>
          <circle cx={hp.coords[0]} cy={hp.coords[1]} r={5} fill="#00D4FF" opacity={0.9} filter="url(#glow)" />
          <circle cx={hp.coords[0]} cy={hp.coords[1]} r={5} fill="none" stroke="#00D4FF" strokeWidth={1}>
            <animate attributeName="r" from={5} to={20} dur="2.2s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
            <animate attributeName="opacity" from={0.7} to={0} dur="2.2s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
          </circle>
          <text x={hp.coords[0] + 8} y={hp.coords[1] + 3} fontSize={7} fill="#00D4FF" fontFamily="JetBrains Mono, monospace">{hp.hits} hits</text>
        </g>
      ))}

      {/* Threat nodes */}
      {nodes.map((node) => {
        const col = SEV_COLORS[node.sev];
        return (
          <g key={node.id} style={{ cursor: "pointer" }} onClick={() => { const t = THREATS.find(t => t.coords[0] === node.x && t.coords[1] === node.y) || THREATS[0]; onNodeClick(t.id); }}>
            <circle cx={node.x} cy={node.y} r={6} fill={col} opacity={0.9} filter="url(#glow)" />
            <circle cx={node.x} cy={node.y} r={6} fill="none" stroke={col} strokeWidth={1.5}>
              <animate attributeName="r" from={6} to={14} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from={0.8} to={0} dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}

      {/* HQ node */}
      <circle cx={HQ.x} cy={HQ.y} r={10} fill="url(#hqGlow)" />
      <circle cx={HQ.x} cy={HQ.y} r={8} fill="#0a0a14" stroke="#1E6FFF" strokeWidth={1.5} />
      <text x={HQ.x} y={HQ.y + 3} textAnchor="middle" fontSize={7} fill="#1E6FFF" fontFamily="JetBrains Mono" fontWeight="bold">HQ</text>

      {/* Legend */}
      <g transform="translate(12, 300)">
        {[["#FF073A", "ATTACK"], ["#2ECC71", "BLOCKED"], ["#00D4FF", "HONEYPOT"], ["#1E6FFF", "HQ"]].map(([c, l], i) => (
          <g key={l} transform={`translate(${i * 85}, 0)`}>
            <circle cx={4} cy={4} r={3} fill={c} />
            <text x={10} y={8} fontSize={8} fill="#4A5568" fontFamily="Inter">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function Dashboard() {
  const { triggerBreach, openCmd } = useLayout();
  const { push: notify } = useNotifications();
  const [drawerThreat, setDrawerThreat] = useState<string | null>(null);
  const [showBreachModal, setShowBreachModal] = useState(false);
  const [timeline, setTimeline] = useState(genTimeline);
  const [scrubX, setScrubX] = useState<number | null>(null);
  const [scrubTime, setScrubTime] = useState("LIVE");
  const [activeThreats, setActiveThreats] = useState(14);
  const [blockedCount, setBlockedCount] = useState(4821);
  const [criticalAlerts, setCriticalAlerts] = useState(3);
  const [healthScore, setHealthScore] = useState(85);
  const [defLayers, setDefLayers] = useState(DEFENSE_LAYERS);
  const trackRef = useRef<HTMLDivElement>(null);
  const blockedDisplay = useAnimatedCounter(blockedCount);
  const healthDisplay  = useAnimatedCounter(healthScore);
  const activeDisplay  = useAnimatedCounter(activeThreats);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeline((prev) => {
        const next = [...prev.slice(1), genPoint(0)];
        return next;
      });
      setBlockedCount((n) => n + Math.round(Math.random() * 4 + 1));
      if (Math.random() > 0.85) {
        const delta = Math.round(Math.random() * 3) - 1;
        setActiveThreats((n) => Math.max(12, Math.min(18, n + delta)));
        if (delta > 0) notify({ type: "error", title: "New threat detected", body: "Active threat count increased" });
      }
      if (Math.random() > 0.9) {
        setHealthScore(80 + Math.round(Math.random() * 14));
      }
      setDefLayers((prev) => prev.map((l) => ({
        ...l,
        score: Math.max(30, Math.min(100, l.score + Math.round(Math.random() * 4 - 2))),
      })));
    }, 2000);
    return () => clearInterval(t);
  }, [notify]);

  const handleSimulateBreach = () => {
    triggerBreach();
    setShowBreachModal(true);
    notify({ type: "error", title: "CRITICAL BREACH", body: "Ransomware C2 detected on PROD-DB-01" });
  };

  const onTrackMove = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubX(pct * 100);
    if (pct > 0.97) { setScrubTime("LIVE"); return; }
    const t = new Date(Date.now() - (1 - pct) * 3_600_000);
    setScrubTime(t.getHours().toString().padStart(2,"0") + ":" + t.getMinutes().toString().padStart(2,"0"));
  }, []);

  const maxHits = Math.max(...MITRE_TACTICS.map((m) => m.hits));

  return (
    <>
      {showBreachModal && (
        <BreachAlert
          onAck={() => { setShowBreachModal(false); notify({ type: "warning", title: "Breach acknowledged", body: "Incident INC-0841 assigned to SOC" }); }}
          onLockdown={() => { setShowBreachModal(false); notify({ type: "error", title: "LOCKDOWN ACTIVE", body: "All external access suspended" }); }}
        />
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-bold tracking-tight">Security Posture Overview</h1>
            <p className="text-[11px] font-mono text-[#8892A0] mt-0.5">
              REAL-TIME TELEMETRY // ADE v3.7 //{" "}
              <span className="text-[#FF073A] font-bold">{activeThreats} ACTIVE THREATS</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSimulateBreach}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(255,7,58,0.35)] bg-[rgba(255,7,58,0.08)] text-[#FF073A] text-[11px] font-semibold hover:bg-[rgba(255,7,58,0.16)] transition-all btn-depress hover:shadow-[0_0_16px_rgba(255,7,58,0.25)]">
              <ShieldAlert size={12} /> Simulate Breach
            </button>
            <button onClick={openCmd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF] text-[11px] font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all btn-depress">
              ⌘K Command
            </button>
          </div>
        </div>

        {/* ── METRICS ── */}
        <div className="grid grid-cols-4 gap-3">
          {/* Health Ring */}
          <div className="glass-card relative rounded-xl p-3">
            <div className="text-[9px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2">SYSTEM HEALTH INDEX</div>
            <div className="flex items-center gap-3">
              <div className="relative w-[80px] h-[80px] flex-shrink-0">
                <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
                  <circle cx={40} cy={40} r={32} fill="none" stroke="url(#hg)" strokeWidth={7} strokeLinecap="round"
                    strokeDasharray={201.1} strokeDashoffset={Math.round(201.1 * (1 - Number(healthDisplay) / 100))}
                    style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                  <defs>
                    <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1E6FFF" />
                      <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-black font-mono text-[#00D4FF]">{healthDisplay}</span>
                  <span className="text-[7px] text-[#4A5568] uppercase">health</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { label: "AUTH", pct: 94, color: "#2ECC71" },
                  { label: "NET",  pct: 78, color: "#00D4FF" },
                  { label: "EDR",  pct: 91, color: "#1E6FFF" },
                  { label: "API",  pct: 67, color: "#F59E0B" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-[#8892A0] w-6">{m.label}</span>
                    <div className="flex-1 h-[2px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                    <span className="text-[9px] font-mono font-semibold w-7 text-right" style={{ color: m.color }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metric cards */}
          {[
            { title: "ACTIVE THREATS",  value: activeDisplay, raw: activeThreats, color: "#FF073A", sub: "↑ 3 in last hour",         icon: <ShieldAlert size={14} />, trending: true },
            { title: "BLOCKED (24H)",   value: blockedDisplay,raw: blockedCount,  color: "#2ECC71", sub: "↑ 12% vs yesterday",       icon: <Shield size={14} />,      trending: false },
            { title: "CRITICAL ALERTS", value: String(criticalAlerts), raw: criticalAlerts, color: "#F59E0B", sub: "2 need immediate action", icon: <AlertTriangle size={14} />, trending: false },
          ].map((m) => (
            <div key={m.title}
              className="glass-card relative rounded-xl p-3 cursor-pointer group transition-all hover:border-[rgba(255,255,255,0.12)]"
              onClick={() => notify({ type: "info", title: m.title, body: m.sub })}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">{m.title}</span>
                <span style={{ color: m.color, opacity: 0.7 }}>{m.icon}</span>
              </div>
              <div className="text-[28px] font-black tracking-tight transition-all duration-700" style={{ color: m.color,
                textShadow: `0 0 20px ${m.color}50` }}>
                {m.value}
              </div>
              <div className="text-[10px] font-mono text-[#8892A0] mt-0.5">{m.sub}</div>
              <div className="flex items-end gap-px h-[18px] mt-2">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{
                    height: `${15 + Math.random() * 85}%`,
                    background: m.color,
                    opacity: i === 13 ? 0.7 : 0.15 + (i / 14) * 0.25,
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAP + ALERTS ── */}
        <div className="grid grid-cols-12 gap-3">
          <div className="glass-card relative rounded-xl col-span-7 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">Global Threat Pulse Map</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-[#2ECC71]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block pulse-sage" /> LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-[#4A5568]">
                <span className="text-[#FF073A]">● {activeThreats} attacks</span>
                <span className="text-[#00D4FF]">● 3 honeypots</span>
              </div>
            </div>
            <div className="p-1.5 bg-[#030307]">
              <LiveThreatMap onNodeClick={setDrawerThreat} />
            </div>
          </div>

          <div className="glass-card relative rounded-xl col-span-5 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">Active Threat Alerts</span>
              <span className="text-[9px] font-mono text-[#4A5568]">{THREATS.filter(t=>t.status==="active").length} active</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {THREATS.filter(t => t.severity === "critical" || t.severity === "high").slice(0, 6).map((t) => (
                <div key={t.id}
                  className={`glass-card relative rounded-lg p-2.5 cursor-pointer transition-all alert-card-${t.severity} group`}
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  onClick={() => setDrawerThreat(t.id)}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                        style={{ color: SEV_COLORS[t.severity], background: SEV_COLORS[t.severity]+"1a", borderColor: SEV_COLORS[t.severity]+"4d" }}>
                        {t.severity.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-semibold truncate">{t.type}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#4A5568] flex-shrink-0">{t.time}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#8892A0]">
                    <span className="text-[#4A5568]">SRC:</span> <span className="text-[#00D4FF]">{t.ip}</span>
                    <span className="text-[#4A5568] ml-2">TGT:</span> {t.target}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-[2px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.riskScore}%`, background: SEV_COLORS[t.severity], boxShadow: `0 0 6px ${SEV_COLORS[t.severity]}` }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: SEV_COLORS[t.severity] }}>RISK {t.riskScore}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); notify({ type: "success", title: `Blocking ${t.ip}`, body: "IP blocked at perimeter firewall" }); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-[rgba(255,7,58,0.35)] bg-[rgba(255,7,58,0.1)] text-[#FF073A] text-[9px] font-semibold hover:bg-[rgba(255,7,58,0.2)] btn-depress">
                      🚫 Block
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDrawerThreat(t.id); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#8892A0] text-[9px] hover:text-[#E8EAF0] btn-depress">
                      Details →
                    </button>
                    {t.severity === "critical" && (
                      <button onClick={(e) => { e.stopPropagation(); notify({ type: "warning", title: "Auto-mitigating", body: t.type }); }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.1)] text-[#00D4FF] text-[9px] font-semibold hover:bg-[rgba(0,212,255,0.18)] btn-depress">
                        <Zap size={9} /> Auto
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TIMELINE + MITRE ── */}
        <div className="grid grid-cols-12 gap-3">
          {/* Live Timeline */}
          <div className="glass-card relative rounded-xl col-span-8 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em]">Network Traffic — Live Feed</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-[#2ECC71]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block animate-pulse" /> streaming
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block bg-[#FF073A]" /> threats</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block bg-[#2ECC71]" /> blocked</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block bg-[#F59E0B]" /> anomalies</span>
                <span className="text-[#00D4FF]">{scrubTime}</span>
              </div>
            </div>
            <div ref={trackRef}
              className="h-[80px] rounded-md overflow-hidden border border-[rgba(255,255,255,0.06)] cursor-crosshair bg-black/30 relative"
              onMouseMove={onTrackMove}
              onMouseLeave={() => { setScrubX(null); setScrubTime("LIVE"); }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF073A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF073A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2ECC71" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="blocked"   stroke="#2ECC71" strokeWidth={1}   fill="url(#gB)" dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="anomalies" stroke="#F59E0B" strokeWidth={1}   fill="url(#gA)" dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="threats"   stroke="#FF073A" strokeWidth={1.5} fill="url(#gT)" dot={false} isAnimationActive={false} />
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 10 }} labelStyle={{ color: "#00D4FF" }} itemStyle={{ color: "#8892A0" }} />
                </AreaChart>
              </ResponsiveContainer>
              {scrubX !== null && (
                <div className="absolute top-0 bottom-0 w-px bg-[#00D4FF] pointer-events-none" style={{ left: `${scrubX}%`, boxShadow: "0 0 8px #00D4FF" }}>
                  <div className="absolute -top-5 left-1 bg-[#0a0a14] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded text-[9px] font-mono text-[#00D4FF]">{scrubTime}</div>
                </div>
              )}
            </div>
          </div>

          {/* MITRE ATT&CK mini */}
          <div className="glass-card relative rounded-xl col-span-4 p-3">
            <div className="text-[10px] font-bold font-mono text-[#8892A0] uppercase tracking-[0.1em] mb-2.5">MITRE ATT&CK — 24H</div>
            <div className="space-y-1.5">
              {MITRE_TACTICS.slice(0, 8).map((t) => {
                const pct = (t.hits / maxHits) * 100;
                const col = t.hits >= 10 ? "#FF073A" : t.hits >= 7 ? "#F59E0B" : t.hits >= 4 ? "#00D4FF" : "#2ECC71";
                return (
                  <div key={t.id} className="flex items-center gap-2 group cursor-pointer" title={t.id}>
                    <span className="text-[9px] font-mono text-[#4A5568] w-[95px] truncate group-hover:text-[#8892A0] transition-colors">{t.name}</span>
                    <div className="flex-1 h-[5px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: col, boxShadow: `0 0 6px ${col}50` }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold w-4 text-right" style={{ color: col }}>{t.hits}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── DEFENSE LAYERS ── */}
        <div>
          <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Defense Layer Status — Live</div>
          <div className="grid grid-cols-4 gap-2">
            {defLayers.map((layer) => {
              const indColor = layer.status === "healthy" ? "#2ECC71" : layer.status === "degraded" ? "#F59E0B" : "#FF073A";
              return (
                <div key={layer.layer}
                  className="glass-card relative rounded-lg p-3 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-all group hover:border-[rgba(255,255,255,0.12)]"
                  onClick={() => notify({ type: layer.status === "healthy" ? "success" : layer.status === "degraded" ? "warning" : "error", title: `L${layer.layer}: ${layer.name}`, body: `Score: ${layer.score} · ${layer.alerts} alert${layer.alerts !== 1 ? "s" : ""}` })}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-[#4A5568]">L{layer.layer}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${layer.status === "critical" ? "layer-critical" : ""}`}
                      style={{ background: indColor, boxShadow: `0 0 6px ${indColor}` }} />
                  </div>
                  <div className="text-[11px] font-semibold truncate mb-1">{layer.name}</div>
                  <div className="flex justify-between text-[9px] font-mono mb-1">
                    <span style={{ color: indColor }}>{layer.score}</span>
                    {layer.alerts > 0 && <span className="text-[#FF073A]">{layer.alerts}⚠</span>}
                  </div>
                  <div className="h-[2px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${layer.score}%`, background: indColor, boxShadow: `0 0 6px ${indColor}40` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DetailDrawer threatId={drawerThreat} onClose={() => setDrawerThreat(null)} />
    </>
  );
}
