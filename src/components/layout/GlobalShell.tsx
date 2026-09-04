import { useEffect } from 'react';
import { useUIStore } from '../../stores/ui-store';
import { CommandPalette } from '../ui/command';
import { ContactDrawer } from '../contacts/contact-drawer';
import { CompanyDrawer } from '../companies/company-drawer';
import { DealPanel } from '../pipeline/deal-panel';
import { TaskDrawer } from '../tasks/task-drawer';
import { LogActivityDialog } from '../activities/log-activity-dialog';

/**
 * GlobalShell — mounts once in the app layout.
 * Handles:
 *  1. Global keyboard shortcuts (Cmd+K, c, d, t, Escape)
 *  2. The command palette portal
 *  3. All create/edit drawers
 */
export function GlobalShell() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    activeDrawer,
    drawerEntityId,
    openDrawer,
    closeDrawer,
  } = useUIStore();

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Cmd/Ctrl+K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Only fire shortcut keys when NOT in an input
      if (isInput) return;

      // c → new contact
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        openDrawer('contact');
        return;
      }
      // d → new deal
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        openDrawer('deal');
        return;
      }
      // t → new task
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        openDrawer('task');
        return;
      }
      // a → log activity
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        openDrawer('activity');
        return;
      }

      // Escape — close any open drawer / palette
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (activeDrawer) {
          closeDrawer();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, activeDrawer, setCommandPaletteOpen, openDrawer, closeDrawer]);

  return (
    <>
      {/* Command palette */}
      <CommandPalette />

      {/* Contact drawer */}
      <ContactDrawer
        open={activeDrawer === 'contact'}
        onClose={closeDrawer}
        entityId={drawerEntityId}
      />

      {/* Company drawer */}
      <CompanyDrawer
        open={activeDrawer === 'company'}
        onClose={closeDrawer}
        entityId={drawerEntityId}
      />

      {/* Deal panel */}
      <DealPanel
        open={activeDrawer === 'deal'}
        onClose={closeDrawer}
        entityId={drawerEntityId}
      />

      {/* Task drawer */}
      <TaskDrawer
        open={activeDrawer === 'task'}
        onClose={closeDrawer}
      />

      {/* Log activity drawer */}
      <LogActivityDialog
        open={activeDrawer === 'activity'}
        onClose={closeDrawer}
      />
    </>
  );
}
