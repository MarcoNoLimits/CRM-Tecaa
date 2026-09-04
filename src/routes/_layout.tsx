import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { GlobalShell } from '../components/layout/GlobalShell';
import { useAuth } from '../hooks/use-auth';

export default function Layout() {
  // Initialize auth store subscription on layout mount
  useAuth();

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0 ml-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      {/* Global command palette + all drawers + keyboard shortcuts */}
      <GlobalShell />
    </div>
  );
}
