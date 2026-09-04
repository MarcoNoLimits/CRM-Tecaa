import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';
import type { User, Session } from '@supabase/supabase-js';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
    });
  });

  it('initializes with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('updates user and session correctly', () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' } as User;
    const mockSession = { user: mockUser, access_token: 'token-abc' } as Session;

    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).toBe(mockSession);
    expect(useAuthStore.getState().user).toBe(mockUser);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setSession(null);
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
