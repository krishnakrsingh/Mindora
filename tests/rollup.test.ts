import { describe, it, expect } from 'vitest';
import { rollupService } from '../src/services/rollup';

describe('RollupService Aggregation Engine', () => {
  it('correctly calculates sum, avg, min, and max for numeric values', () => {
    const values = [10, 20, 30, 40, 50];
    expect(rollupService.aggregate(values, 'sum')).toBe(150);
    expect(rollupService.aggregate(values, 'avg')).toBe(30);
    expect(rollupService.aggregate(values, 'min')).toBe(10);
    expect(rollupService.aggregate(values, 'max')).toBe(50);
  });

  it('correctly calculates count and count_unique with missing values', () => {
    const values = ['Engineering', 'Design', 'Engineering', '', null, 'Product'];
    expect(rollupService.aggregate(values, 'count')).toBe(4);
    expect(rollupService.aggregate(values, 'count_unique')).toBe(3);
  });

  it('correctly calculates percent_checked for boolean values', () => {
    const values = [true, false, true, true];
    expect(rollupService.aggregate(values, 'percent_checked')).toBe('75%');
  });

  it('gracefully handles empty arrays without errors', () => {
    expect(rollupService.aggregate([], 'sum')).toBe(0);
    expect(rollupService.aggregate([], 'avg')).toBe(0);
    expect(rollupService.aggregate([], 'count')).toBe(0);
  });
});
