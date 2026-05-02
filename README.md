# Aegis-OS — Autonomous Security Platform

A high-fidelity, interactive cybersecurity command center dashboard built with React + TypeScript + Vite + Recharts.

## ✅ Tech Stack
- **React 18** + **TypeScript**
- **Vite 6** (dev server, HMR)
- **Tailwind CSS v4**
- **Recharts** (timeline chart)
- **Framer Motion** (installed, available for extension)
- **Wouter** (routing)
- **No backend required** — all data is local mock data

## 🚀 Running in VS Code

### Prerequisites
- [Node.js 18+](https://nodejs.org) installed
- [VS Code](https://code.visualstudio.com/) installed

### Steps

1. **Open the folder in VS Code**
   ```
   File → Open Folder → select `aegis-os/`
   ```

2. **Open the integrated terminal**
   ```
   Terminal → New Terminal  (or Ctrl+` / Cmd+`)
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - The terminal will show: `➜  Local:   http://localhost:5173/`
   - VS Code may prompt "Open in Browser" — click it, or navigate manually

### Demo Login Credentials
| Role     | Email                       | Password      | Access         |
|----------|-----------------------------|---------------|----------------|
| Admin    | admin@secureops.io          | admin123      | Full access    |
| Engineer | engineer@secureops.io       | engineer123   | Mitigate & manage |
| Analyst  | analyst@secureops.io        | analyst123    | Read-only      |

## 🎯 Features
- **System Health Index** — animated gradient ring (0–100)
- **Global Threat Pulse Map** — SVG world map with animated attack trails, honeypot ripples
- **⌘K Command Palette** — frosted glass, keyboard nav, `/block-ip`, `/revoke-session`, etc.
- **Scrubbable Timeline** — drag across 60-min network traffic chart
- **Breach Pulse Overlay** — full-screen crimson edge glow on critical events
- **Alert Card Hover Glow** — cards scale + glow by severity, reveal remediation buttons
- **Live Event Feed** — real-time simulated security events
- **Detail Drawer** — packet-level data on click
- **7 Pages**: Dashboard, Threats, Incidents, Identity, API, Audit, Compliance

## 📁 Project Structure
```
src/
├── App.tsx               # Router + providers
├── main.tsx              # Entry point
├── index.css             # Aegis theme, keyframes, glassmorphism
├── data/mock.ts          # All mock data & types
├── contexts/
│   └── auth-context.tsx  # Local auth (no backend)
├── hooks/
│   └── use-toast.ts      # Toast notifications
├── components/
│   ├── layout.tsx        # Sidebar, topbar, ⌘K palette, breach overlay
│   └── ui/toaster.tsx    # Toast renderer
└── pages/
    ├── login.tsx
    ├── dashboard.tsx     # Main command center
    ├── threats.tsx
    ├── incidents.tsx
    ├── identities.tsx
    ├── api-posture.tsx
    ├── audit.tsx
    └── compliance.tsx
```

## 🔧 Recommended VS Code Extensions
- **ESLint** — code quality
- **Prettier** — formatting  
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **TypeScript Vue Plugin** (optional)
