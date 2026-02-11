import { RollupFunction } from '../types';

/**
 * Mindora Database Rollup & Aggregation Engine
 * Calculates summary metrics for database columns and related records.
 */
export class RollupService {
  /**
   * Aggregate an array of raw values based on the requested rollup function.
   */
  public aggregate(values: any[], fn: RollupFunction): number | string {
    if (!values || values.length === 0) {
      if (fn === 'count') return 0;
      if (fn === 'percent_checked') return 0;
      return 0;
    }

    switch (fn) {
      case 'count':
        return values.filter((v) => v !== null && v !== undefined && v !== '').length;

      case 'count_unique': {
        const unique = new Set(values.filter((v) => v !== null && v !== undefined && v !== ''));
        return unique.size;
      }

      case 'sum': {
        const numbers = this.extractNumbers(values);
        if (numbers.length === 0) return 0;
        const total = numbers.reduce((acc, n) => acc + n, 0);
        return Math.round(total * 100) / 100;
      }

      case 'avg': {
        const numbers = this.extractNumbers(values);
        if (numbers.length === 0) return 0;
        const avg = numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
        return Math.round(avg * 100) / 100;
      }

      case 'min': {
        const numbers = this.extractNumbers(values);
        if (numbers.length === 0) return 0;
        return Math.min(...numbers);
      }

      case 'max': {
        const numbers = this.extractNumbers(values);
        if (numbers.length === 0) return 0;
        return Math.max(...numbers);
      }

      case 'percent_checked': {
        if (values.length === 0) return 0;
        const checked = values.filter((v) => v === true || v === 'true' || v === 1).length;
        const pct = (checked / values.length) * 100;
        return Math.round(pct) + '%';
      }

      default:
        return 0;
    }
  }

  /**
   * Extract valid finite numbers from a heterogeneous value array.
   */
  private extractNumbers(values: any[]): number[] {
    return values
      .map((v) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const parsed = parseFloat(v.replace(/[^0-9.-]/g, ''));
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      })
      .filter((n): n is number => n !== null && isFinite(n));
  }
}

export const rollupService = new RollupService();
