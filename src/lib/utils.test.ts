import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency, getDueDateStatus } from './utils';
import { addDays, subDays } from 'date-fns';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('bg-primary', 'text-secondary')).toBe('bg-primary text-secondary');
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'is-true', false && 'is-false')).toBe('base is-true');
    });
  });

  describe('formatDate', () => {
    it('returns em dash for null or undefined', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('formats a date string correctly', () => {
      const date = new Date(2026, 0, 15);
      expect(formatDate(date)).toBe('Jan 15, 2026');
    });
  });

  describe('formatCurrency', () => {
    it('returns em dash for null or undefined', () => {
      expect(formatCurrency(null)).toBe('—');
      expect(formatCurrency(undefined)).toBe('—');
    });

    it('formats positive currency amounts without cents', () => {
      expect(formatCurrency(48000)).toBe('$48,000');
      expect(formatCurrency(1500)).toBe('$1,500');
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('getDueDateStatus', () => {
    it('returns null for empty date', () => {
      expect(getDueDateStatus(null)).toBeNull();
      expect(getDueDateStatus(undefined)).toBeNull();
    });

    it('returns overdue for past dates', () => {
      const past = subDays(new Date(), 2).toISOString();
      expect(getDueDateStatus(past)).toBe('overdue');
    });

    it('returns today for current day', () => {
      const today = new Date().toISOString();
      expect(getDueDateStatus(today)).toBe('today');
    });

    it('returns tomorrow for next day', () => {
      const tomorrow = addDays(new Date(), 1).toISOString();
      expect(getDueDateStatus(tomorrow)).toBe('tomorrow');
    });

    it('returns upcoming for dates in future', () => {
      const future = addDays(new Date(), 5).toISOString();
      expect(getDueDateStatus(future)).toBe('upcoming');
    });
  });
});
