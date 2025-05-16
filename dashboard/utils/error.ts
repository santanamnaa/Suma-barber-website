import type { DashboardErrorType } from '../types/dashboard';

export class DashboardError extends Error {
  constructor(
    public type: DashboardErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(`${type} ERROR: ${message}`);
    this.name = 'DashboardError';
  }
} 