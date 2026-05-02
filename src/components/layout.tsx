import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { LiveEvent, EVENT_POOL } from "@/data/mock";

interface LayoutCtx {
  currentPage: string;
  setPage: (p: string) => void;
  isBreach: boolean;
  triggerBreach: () => void;
  openCmd: () => void;
  isCmd: boolean;
  closeCmd: () => void;
  isSearch: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isSettings: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  liveThreatCount: number;
}
const Ctx = createContext<LayoutCtx>({} as LayoutCtx);
export const useLayout = () => useContext(Ctx);

const SEV_CLASS: Record<string, string> = {
  critical: "border-[rgba(255,7,58,0.3)] bg-[rgba(255,7,58,0.05)]",
  high:     "border-[rgba(245,158,11,0.22)] bg-[rgba(245,158,11,0.03)]",
  medium:   "border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.03)]",
  low:      "border-[rgba(46,204,113,0.18)] bg-[rgba(46,204,113,0.02)]",
  info:     "border-[rgba(255,255,255,0.06)]",
};
const SEV_DOT: Record<string, string> = {
  critical: "#FF073A", high: "#F59E0B", medium: "#00D4FF", low: "#2ECC71", info: "#4A5568",
};
const TYPE_ICON: Record<string, string> = {
  threat: "🎯", blocked_attack: "🛡", audit: "📋", incident: "⚠️", anomaly: "🔍",
};

function LivePanel() {
  const [events, setEvents] = useState<(LiveEvent & { new?: boolean })[]>([]);
  const idxRef = useRef(0);
  const { triggerBreach } = useLayout();
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const seed: (LiveEvent & { new?: boolean })[] = [];
    for (let i = 0; i < 10; i++) {
      const ev = EVENT_POOL[idxRef.current % EVENT_POOL.length];
      idxRef.current++;
      seed.unshift({ ...ev, id: Math.random().toString(36).slice(2) });
    }
    setEvents(seed);

    const interval = setInterval(() => {
      const ev = EVENT_POOL[idxRef.current % EVENT_POOL.length];
      idxRef.current++;
      const newEv = { ...ev, id: Math.random().toString(36).slice(2), new: true };
      setEvents((prev) => [newEv, ...prev].slice(0, 35));
      setEventCount((n) => n + 1);
      if (ev.severity === "critical") triggerBreach();
      setTimeout(() => setEvents((prev) => prev.map((e) => e.id === newEv.id ? { ...e, new: false } : e)), 500);
    }, 2600 + Math.random() * 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[200px] flex-shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[#070710] flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between flex-shrink-0 bg-[rgba(0,0,0,0.3)]">
        <span className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em]">Live Events</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] pulse-sage" />
          <span className="text-[9px] font-mono text-[#2ECC71]">{eventCount > 0 ? `+${eventCount}` : "LIVE"}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {events.map((ev) => {
          const dot = SEV_DOT[String(ev.severity)] || "#4A5568";
          return (
            <div key={ev.id}
              className={`px-2 py-1.5 rounded-md border text-[10px] font-mono leading-relaxed transition-all cursor-pointer hover:brightness-110 ${SEV_CLASS[String(ev.severity)] || "border-[rgba(255,255,255,0.05)]"} ${ev.new ? "live-event-new" : ""}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: dot, boxShadow: `0 0 4px ${dot}` }} />
                <span className="text-[8px] text-[#4A5568] uppercase tracking-wide truncate">{TYPE_ICON[ev.type] || "•"} {ev.type.replace("_", " ")}</span>
              </div>
              <div className="text-[#E8EAF0] font-medium text-[10px] leading-tight">{ev.title}</div>
              <div className="text-[8px] text-[#4A5568] mt-0.5 flex items-center justify-between">
                <span className="text-[#00D4FF] truncate">{ev.ip}</span>
                <span className="ml-1 flex-shrink-0">now</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",        pip: false, section: "Core" },
  { id: "threats",     label: "Threat Detection",  pip: true,  section: "Core" },
  { id: "incidents",   label: "Incidents",         pip: false, section: "Core" },
  { id: "identities",  label: "Identity & Access", pip: false, section: "Intelligence" },
  { id: "api",         label: "API Posture",        pip: false, section: "Intelligence" },
  { id: "audit",       label: "Audit Logs",        pip: false, section: "Operations" },
  { id: "compliance",  label: "Compliance",        pip: false, section: "Operations" },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard:  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>,
  threats:    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 1L10 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H6L8 1Z"/></svg>,
  incidents:  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 2L14 13H2L8 2Z"/><rect x="7.5" y="7" width="1" height="3"/><rect x="7.5" y="11" width="1" height="1"/></svg>,
  identities: <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  api:        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M5 8h6M8 5v6"/></svg>,
  audit:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M3 3h10v10H3z"/><path d="M5 6h6M5 9h4"/></svg>,
  compliance: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M4 8l2.5 2.5L12 5"/><path d="M8 1L10 3H14v4l-6 8L2 7V3h4L8 1Z"/></svg>,
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [currentPage, setPage] = useState("dashboard");
  const [isBreach, setIsBreach] = useState(false);
  const [isCmd, setIsCmd] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isSettings, setIsSettings] = useState(false);
  const breachTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [clock, setClock] = useState("");
  const [liveThreatCount, setLiveThreatCount] = useState(14);
  const gKeyRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveThreatCount(n => Math.max(10, Math.min(20, n + Math.round(Math.random() * 3 - 1))));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const triggerBreach = useCallback(() => {
    setIsBreach(true);
    if (breachTimerRef.current) clearTimeout(breachTimerRef.current);
    breachTimerRef.current = setTimeout(() => setIsBreach(false), 6200);
  }, []);

  const openCmd    = useCallback(() => setIsCmd(true), []);
  const closeCmd   = useCallback(() => setIsCmd(false), []);
  const openSearch = useCallback(() => setIsSearch(true), []);
  const closeSearch= useCallback(() => setIsSearch(false), []);
  const openSettings = useCallback(() => setIsSettings(true), []);
  const closeSettings= useCallback(() => setIsSettings(false), []);

  useEffect(() => {
    const NAV_MAP: Record<string, string> = {
      d: "dashboard", t: "threats", i: "incidents",
      u: "identities", a: "audit", c: "compliance", p: "api",
    };
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";

      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); openCmd(); return; }
      if ((e.ctrlKey) && e.key === "/") { e.preventDefault(); openSearch(); return; }
      if (e.key === "Escape") { closeCmd(); closeSearch(); closeSettings(); return; }

      if (inInput) return;

      if (e.key === "?" || e.key === "/") { openSettings(); return; }

      if (e.key === "g" || e.key === "G") {
        gKeyRef.current = true;
        if (gTimerRef.current) clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => { gKeyRef.current = false; }, 1200);
        return;
      }

      if (gKeyRef.current && NAV_MAP[e.key.toLowerCase()]) {
        e.preventDefault();
        gKeyRef.current = false;
        if (gTimerRef.current) clearTimeout(gTimerRef.current);
        setPage(NAV_MAP[e.key.toLowerCase()]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openCmd, openSearch, closeCmd, closeSearch, closeSettings]);

  const sections = [...new Set(NAV_ITEMS.map((n) => n.section))];

  return (
    <Ctx.Provider value={{ currentPage, setPage, isBreach, triggerBreach, openCmd, isCmd, closeCmd, isSearch, openSearch, closeSearch, isSettings, openSettings, closeSettings, liveThreatCount }}>
      {/* Breach border overlay */}
      <div className={`fixed inset-0 pointer-events-none z-[9999] border-2 transition-all duration-300 ${isBreach ? "breach-overlay-active" : "border-transparent"}`} />

      <div className="h-full grid grid-cols-[200px_1fr_200px] grid-rows-[48px_1fr] overflow-hidden">
        {/* Topbar */}
        <header className="col-span-3 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,10,0.98)] backdrop-blur-xl z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#1E6FFF] to-[#00D4FF] flex items-center justify-center text-[13px] font-black text-white font-mono shadow-[0_0_12px_rgba(0,212,255,0.4)]">A</div>
            <span className="text-[13px] font-bold tracking-[0.05em]">AEGIS-OS</span>
            <span className="text-[10px] font-mono text-[#00D4FF] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] px-1.5 py-0.5 rounded">v3.7.1</span>
            {isBreach && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#FF073A] bg-[rgba(255,7,58,0.1)] border border-[rgba(255,7,58,0.3)] px-2 py-0.5 rounded animate-pulse">
                ⚠ BREACH ACTIVE
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] text-[#4A5568] tracking-[0.06em]">
            {clock} &nbsp;·&nbsp; US-EAST-1 &nbsp;·&nbsp; PROD-CTRL-01
          </div>
          <div className="flex items-center gap-2">
            {/* Global search */}
            <button onClick={openSearch} title="Global Search (Ctrl+/)"
              className="flex items-center gap-1.5 text-[10px] font-mono text-[#4A5568] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-2.5 py-1 rounded hover:bg-[rgba(255,255,255,0.07)] hover:text-[#8892A0] hover:border-[rgba(255,255,255,0.18)] transition-all">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                <circle cx={5.5} cy={5.5} r={4}/><path d="M9 9l2.5 2.5"/>
              </svg>
              <span className="hidden xl:inline">Search</span>
            </button>
            {/* Command palette */}
            <button onClick={openCmd} title="Command Palette (⌘K)"
              className="text-[10px] font-mono text-[#4A5568] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] px-2 py-1 rounded cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:text-[#8892A0] hover:border-[rgba(255,255,255,0.2)] transition-all">
              ⌘K
            </button>
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] pulse-sage" />
              <span className="text-[11px] text-[#8892A0] font-mono">NOMINAL</span>
            </div>
            {/* Settings */}
            <button onClick={openSettings} title="Settings (?)"
              className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#4A5568] hover:text-[#8892A0] hover:bg-[rgba(255,255,255,0.08)] transition-all">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-3.5 h-3.5">
                <circle cx={8} cy={8} r={2.5}/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M3.1 12.9l1.1-1.1M11.8 4.2l1.1-1.1"/>
              </svg>
            </button>
            {/* User */}
            <div className="flex items-center gap-2 text-[11px] text-[#8892A0] font-mono cursor-pointer hover:text-[#E8EAF0] transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E6FFF] to-[#00D4FF] flex items-center justify-center text-[9px] font-bold text-white">SL</div>
              <span className="hidden xl:inline">slu@aegis.io</span>
              <span className="text-[9px] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF] px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <nav className="border-r border-[rgba(255,255,255,0.06)] bg-[#070710] px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {sections.map((section) => (
            <div key={section}>
              <div className="text-[9px] font-bold font-mono text-[#4A5568] uppercase tracking-[0.12em] px-2.5 py-2 mt-1">{section}</div>
              {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md text-[12px] transition-all cursor-pointer text-left ${
                    currentPage === item.id
                      ? "bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border border-[rgba(0,212,255,0.18)] shadow-[0_0_12px_rgba(0,212,255,0.06)_inset]"
                      : "text-[#8892A0] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#E8EAF0] border border-transparent"
                  }`}>
                  <span className="opacity-70">{NAV_ICONS[item.id]}</span>
                  <span>{item.label}</span>
                  {item.id === "threats" && (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold text-[#FF073A]">{liveThreatCount}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF073A] shadow-[0_0_6px_#FF073A] alert-pip" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E6FFF] to-[#00D4FF] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.3)]">SL</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold truncate">Sarah Liu</div>
                <div className="text-[9px] font-mono text-[#00D4FF]">ADMIN</div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] pulse-sage flex-shrink-0" />
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="overflow-y-auto bg-[#050508]">
          {children}
        </main>

        {/* Live panel */}
        <LivePanel />
      </div>
    </Ctx.Provider>
  );
}
