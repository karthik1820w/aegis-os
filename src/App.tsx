import { Layout, useLayout } from "@/components/layout";
import { CommandPalette } from "@/components/command-palette";
import { GlobalSearch } from "@/components/global-search";
import { SettingsPanel } from "@/components/settings-panel";
import { NotificationProvider } from "@/components/notification-stack";
import Dashboard from "@/pages/dashboard";
import Threats from "@/pages/threats";
import IncidentsPage from "@/pages/incidents";
import Identities from "@/pages/identities";
import ApiPosture from "@/pages/api-posture";
import AuditLogs from "@/pages/audit";
import Compliance from "@/pages/compliance";

function PageRouter() {
  const { currentPage } = useLayout();
  switch (currentPage) {
    case "dashboard":  return <Dashboard />;
    case "threats":    return <Threats />;
    case "incidents":  return <IncidentsPage />;
    case "identities": return <Identities />;
    case "api":        return <ApiPosture />;
    case "audit":      return <AuditLogs />;
    case "compliance": return <Compliance />;
    default:           return <Dashboard />;
  }
}

function AppInner() {
  const { isSearch, closeSearch, isSettings, closeSettings } = useLayout();
  return (
    <>
      <PageRouter />
      <CommandPalette />
      {isSearch   && <GlobalSearch  onClose={closeSearch}   />}
      {isSettings && <SettingsPanel onClose={closeSettings} />}
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <Layout>
        <AppInner />
      </Layout>
    </NotificationProvider>
  );
}
