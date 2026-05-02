import { useEffect, useState } from "react";

interface BreachAlertProps {
  onAck: () => void;
  onLockdown: () => void;
}

const ATTACK_CHAIN = [
  { phase: "Initial Access",    tactic: "T1190",  desc: "Exploit Public-Facing App",  time: "-04:12", done: true  },
  { phase: "Execution",         tactic: "T1059",  desc: "Command & Scripting Interp", time: "-03:47", done: true  },
  { phase: "Persistence",       tactic: "T1136",  desc: "Create Account: svc_backup2",time: "-02:31", done: true  },
  { phase: "Priv. Escalation",  tactic: "T1068",  desc: "Exploitation for Priv. Esc", time: "-01:14", done: true  },
  { phase: "C2",                tactic: "T1071",  desc: "App Layer Protocol: Web",     time: "-00:02", done: false },
  { phase: "Exfiltration",      tactic: "T1048",  desc: "Exfil Over Alt. Protocol",   time: "ACTIVE", done: false },
];

const AFFECTED = [
  { host: "PROD-DB-01",    type: "Database",      risk: "#FF073A", crit: true  },
  { host: "NGINX-EDGE-02", type: "Edge Node",     risk: "#FF073A", crit: true  },
  { host: "CORP-DC-01",    type: "Domain Ctrl",   risk: "#F59E0B", crit: false },
  { host: "AUTH-SVC",      type: "Auth Service",  risk: "#F59E0B", crit: false },
];

const COUNTERMEASURES = [
  { action: "C2 traffic null-routed at ISP", status: "done",   time: "0s" },
  { action: "LSASS protection enabled",      status: "done",   time: "1s" },
  { action: "svc_backup2 account suspended", status: "done",   time: "3s" },
  { action: "Forensic snapshot initiated",   status: "active", time: "8s" },
  { action: "SOC team paged (PagerDuty)",    status: "active", time: "9s" },
  { action: "Isolating PROD-DB-01 VLAN",     status: "pending",time: "..."  },
];

export function BreachAlert({ onAck, onLockdown }: BreachAlertProps) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [cmStates, setCmStates] = useState(COUNTERMEASURES.map(() => false));
  const [activeChain, setActiveChain] = useState(-1);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const chainIntervals = ATTACK_CHAIN.map((_, i) =>
      setTimeout(() => setActiveChain(i), 200 + i * 180)
    );
    const cmIntervals = COUNTERMEASURES.map((_, i) =>
      setTimeout(() => setCmStates((prev) => { const next = [...prev]; next[i] = true; return next; }), 400 + i * 350)
    );

    let cd = 30;
    const cdTimer = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) clearInterval(cdTimer);
    }, 1000);

    return () => {
      chainIntervals.forEach(clearTimeout);
      cmIntervals.forEach(clearTimeout);
      clearInterval(cdTimer);
    };
  }, []);

  const handleLockdown = () => {
    setLocked(true);
    setTimeout(() => { onLockdown(); }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-[9000] flex items-center justify-center transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF073A] to-transparent opacity-60"
          style={{ animation: "scanLine 2.5s linear infinite", top: 0 }} />
      </div>
      <style>{`
        @keyframes scanLine { 0%{top:0} 100%{top:100%} }
        @keyframes alarmPulse { 0%,100%{opacity:1;text-shadow:0 0 20px #FF073A} 50%{opacity:0.6;text-shadow:0 0 40px #FF073A,0 0 80px #FF073A} }
        @keyframes borderCrawl { 0%{box-shadow:0 0 0 2px rgba(255,7,58,0.8),0 0 40px rgba(255,7,58,0.2)} 50%{box-shadow:0 0 0 2px rgba(255,7,58,1),0 0 80px rgba(255,7,58,0.4)} 100%{box-shadow:0 0 0 2px rgba(255,7,58,0.8),0 0 40px rgba(255,7,58,0.2)} }
        @keyframes chainAppear { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div
        className={`w-[820px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[rgba(8,4,8,0.98)] transition-all duration-500 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        style={{ animation: "borderCrawl 2s ease-in-out infinite" }}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-[rgba(255,7,58,0.3)] bg-gradient-to-r from-[rgba(255,7,58,0.12)] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-[#FF073A] flex items-center justify-center" style={{ animation: "borderCrawl 1s ease-in-out infinite" }}>
                  <svg viewBox="0 0 24 24" fill="#FF073A" className="w-7 h-7">
                    <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2zm-1 7h2v6h-2V9zm0 7h2v2h-2v-2z"/>
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-full bg-[#FF073A] opacity-20 blur-md" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#FF073A] uppercase tracking-[0.2em] mb-0.5">⚠ CRITICAL SECURITY INCIDENT</div>
                <div className="text-[22px] font-black text-[#FF073A] tracking-tight" style={{ animation: "alarmPulse 1.5s ease-in-out infinite" }}>
                  ACTIVE BREACH DETECTED
                </div>
                <div className="text-[11px] font-mono text-[#8892A0] mt-0.5">Ransomware C2 Beacon // PROD-DB-01 // APT Attribution: RansomHub</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#4A5568]">AUTO-LOCKDOWN IN</div>
              <div className="text-[32px] font-black font-mono" style={{ color: countdown <= 10 ? "#FF073A" : "#F59E0B" }}>{countdown}s</div>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Attack Chain */}
          <div className="col-span-2">
            <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-3">MITRE ATT&CK Kill Chain</div>
            <div className="flex items-start gap-0 overflow-x-auto">
              {ATTACK_CHAIN.map((step, i) => (
                <div key={i} className="flex items-start flex-shrink-0" style={{ opacity: i <= activeChain ? 1 : 0.15, transition: "opacity 0.3s" }}>
                  <div className={`w-[120px] rounded-lg p-2.5 border ${!step.done ? "border-[rgba(255,7,58,0.4)] bg-[rgba(255,7,58,0.08)]" : "border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.06)]"}`}
                    style={{ animation: i <= activeChain ? "chainAppear 0.3s ease" : "none" }}>
                    <div className={`text-[9px] font-mono font-bold mb-1 ${step.done ? "text-[#F59E0B]" : "text-[#FF073A]"}`}>{step.tactic}</div>
                    <div className="text-[10px] font-semibold text-[#E8EAF0] leading-tight">{step.phase}</div>
                    <div className="text-[9px] text-[#8892A0] mt-1 leading-tight">{step.desc}</div>
                    <div className={`text-[9px] font-mono mt-1.5 font-bold ${step.done ? "text-[#F59E0B]" : "text-[#FF073A]"}`}>{step.time}</div>
                  </div>
                  {i < ATTACK_CHAIN.length - 1 && (
                    <div className="flex items-center mt-3 mx-px">
                      <div className="h-px w-4 flex-shrink-0" style={{ background: i < activeChain ? "#F59E0B" : "rgba(255,255,255,0.1)" }} />
                      <svg width={8} height={8} viewBox="0 0 8 8" fill={i < activeChain ? "#F59E0B" : "rgba(255,255,255,0.1)"}>
                        <path d="M0 1l6 3-6 3V1z"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Affected Systems */}
          <div>
            <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Blast Radius — Affected Assets</div>
            <div className="space-y-2">
              {AFFECTED.map((sys) => (
                <div key={sys.host} className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sys.crit ? "animate-pulse" : ""}`} style={{ background: sys.risk, boxShadow: `0 0 8px ${sys.risk}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono font-semibold text-[#E8EAF0]">{sys.host}</div>
                    <div className="text-[9px] text-[#4A5568]">{sys.type}</div>
                  </div>
                  <div className="text-[9px] font-mono font-bold" style={{ color: sys.risk }}>{sys.crit ? "COMPROMISED" : "AT RISK"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Countermeasures */}
          <div>
            <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] mb-2">Autonomous Response Engine</div>
            <div className="space-y-1.5">
              {COUNTERMEASURES.map((cm, i) => {
                const vis = cmStates[i];
                return (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-500 ${vis ? (cm.status === "done" ? "border-[rgba(46,204,113,0.25)] bg-[rgba(46,204,113,0.04)]" : cm.status === "active" ? "border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.04)]" : "border-[rgba(255,255,255,0.06)]") : "border-[rgba(255,255,255,0.04)]"}`}
                    style={{ opacity: vis ? 1 : 0.3 }}>
                    <div className="flex-shrink-0 w-4 text-center">
                      {cm.status === "done"
                        ? <span className="text-[#2ECC71] text-[11px]">✓</span>
                        : cm.status === "active"
                        ? <span className="inline-block w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
                        : <span className="text-[#4A5568] text-[9px]">○</span>}
                    </div>
                    <div className="flex-1 text-[10px] font-mono" style={{ color: cm.status === "done" ? "#2ECC71" : cm.status === "active" ? "#00D4FF" : "#4A5568" }}>
                      {cm.action}
                    </div>
                    <div className="text-[9px] font-mono text-[#4A5568] flex-shrink-0">{cm.time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handleLockdown}
            disabled={locked}
            className={`flex-1 py-3 rounded-xl font-black text-[13px] tracking-[0.08em] border-2 transition-all btn-depress ${locked ? "opacity-50 cursor-not-allowed border-[rgba(255,7,58,0.3)] text-[rgba(255,7,58,0.5)]" : "border-[#FF073A] text-[#FF073A] bg-[rgba(255,7,58,0.1)] hover:bg-[rgba(255,7,58,0.2)] hover:shadow-[0_0_24px_rgba(255,7,58,0.4)]"}`}
            style={{ animation: locked ? "none" : "borderCrawl 1.5s ease-in-out infinite" }}
          >
            {locked ? "🔒 LOCKDOWN INITIATED..." : "🔒 ENGAGE LOCKDOWN PROTOCOL"}
          </button>
          <button
            onClick={onAck}
            className="px-6 py-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[#8892A0] font-semibold text-[13px] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#E8EAF0] transition-all btn-depress"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
