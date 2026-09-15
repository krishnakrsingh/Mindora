import { describe, it, expect } from 'vitest';
import { formulaEngine } from '../src/services/formula';
import { DatabaseProperty, DatabaseRecord } from '../src/types';

describe('FormulaEngine', () => {
  const properties: DatabaseProperty[] = [
    { id: 'prop-price', name: 'Price', type: 'number' },
    { id: 'prop-qty', name: 'Quantity', type: 'number' },
    { id: 'prop-status', name: 'Status', type: 'status' },
  ];

  const record: DatabaseRecord = {
    id: 'rec-test',
    databaseId: 'db-test',
    title: 'Product Alpha',
    properties: {
      'prop-price': 25,
      'prop-qty': 4,
      'prop-status': 'Completed',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('evaluates arithmetic expressions with property values', () => {
    const result = formulaEngine.evaluate('prop("Price") * prop("Quantity")', record, properties);
    expect(result).toBe(100);
  });

  it('evaluates conditional ternary logic', () => {
    const result = formulaEngine.evaluate(
      'prop("Status") === "Completed" ? "Done" : "Pending"',
      record,
      properties
    );
    expect(result).toBe('Done');
  });

  it('evaluates built-in string and math functions', () => {
    const resUpper = formulaEngine.evaluate('upper(prop("Title"))', record, properties);
    expect(resUpper).toBe('PRODUCT ALPHA');

    const resConcat = formulaEngine.evaluate('concat(prop("Title"), " [", prop("Status"), "]")', record, properties);
    expect(resConcat).toBe('Product Alpha [Completed]');
  });
});
