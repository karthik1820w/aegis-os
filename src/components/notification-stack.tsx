import { createContext, useCallback, useContext, useState } from "react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  body?: string;
}

interface NotifCtx {
  push: (n: Omit<Notification, "id">) => void;
}
const Ctx = createContext<NotifCtx>({ push: () => {} });
export const useNotifications = () => useContext(Ctx);

const TYPE_STYLE: Record<Notification["type"], { border: string; text: string; icon: string }> = {
  success: { border: "rgba(46,204,113,0.35)",  text: "#2ECC71", icon: "✓" },
  error:   { border: "rgba(255,7,58,0.45)",    text: "#FF073A", icon: "⚠" },
  warning: { border: "rgba(245,158,11,0.35)",  text: "#F59E0B", icon: "!" },
  info:    { border: "rgba(0,212,255,0.3)",    text: "#00D4FF", icon: "ℹ" },
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const push = useCallback((n: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setNotifs((prev) => [{ ...n, id }, ...prev].slice(0, 5));
    setTimeout(() => setNotifs((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-[212px] z-[800] flex flex-col-reverse gap-2 pointer-events-none">
        {notifs.map((n) => {
          const s = TYPE_STYLE[n.type];
          return (
            <div
              key={n.id}
              className="pointer-events-auto max-w-[280px] rounded-xl bg-[rgba(10,10,20,0.97)] backdrop-blur-xl px-4 py-3 border shadow-2xl"
              style={{ borderColor: s.border, animation: "slideUp 0.25s ease" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[14px] font-bold" style={{ color: s.text }}>{s.icon}</span>
                <div>
                  <div className="text-[11px] font-semibold text-[#E8EAF0]">{n.title}</div>
                  {n.body && <div className="text-[10px] text-[#8892A0] mt-0.5">{n.body}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
