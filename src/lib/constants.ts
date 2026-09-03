// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
  CONTACTS_DETAIL: '/contacts/:id',
  COMPANIES: '/companies',
  COMPANIES_DETAIL: '/companies/:id',
  PIPELINE: '/pipeline',
  ACTIVITIES: '/activities',
  TASKS: '/tasks',
  SETTINGS: '/settings',
} as const;

// Status enums
export const CONTACT_STATUSES = ['active', 'inactive', 'lead', 'archived'] as const;
export const DEAL_STATUSES = ['backlog', 'in_progress', 'done', 'cancelled'] as const;
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note'] as const;
export const TASK_PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', ctrlKey: true, metaKey: true },
  NEW_CONTACT: { key: 'c', altKey: true },
  NEW_DEAL: { key: 'd', altKey: true },
  NEW_TASK: { key: 't', altKey: true },
} as const;
