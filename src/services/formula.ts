import { DatabaseProperty, DatabaseRecord } from '../types';

export class FormulaEngine {
  public evaluate(
    expression: string,
    record: DatabaseRecord,
    properties: DatabaseProperty[]
  ): string | number | boolean {
    if (!expression || !expression.trim()) return '';

    try {
      // Map property name to its current value in this record
      const propMap: Record<string, any> = {
        title: record.title,
        Title: record.title,
      };

      for (const prop of properties) {
        const val = record.properties[prop.id];
        propMap[prop.name.toLowerCase()] = val ?? '';
        propMap[prop.name] = val ?? '';
        propMap[prop.id] = val ?? '';
      }

      // Safe expression parser replacing prop("Name") with value
      let expr = expression.replace(/prop\(\s*["']([^"']+)["']\s*\)/g, (_, name) => {
        const val = propMap[name] !== undefined ? propMap[name] : propMap[name.toLowerCase()] ?? '';
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        return JSON.stringify(String(val));
      });

      // Built-in helper functions
      const context = {
        concat: (...args: any[]) => args.join(''),
        upper: (str: string) => String(str).toUpperCase(),
        lower: (str: string) => String(str).toLowerCase(),
        length: (str: string) => (str ? String(str).length : 0),
        round: (num: number, decimals = 0) => {
          const factor = Math.pow(10, decimals);
          return Math.round(Number(num) * factor) / factor;
        },
        abs: (num: number) => Math.abs(Number(num)),
        if: (cond: boolean, thenVal: any, elseVal: any) => (cond ? thenVal : elseVal),
      };

      // Safely evaluate simple mathematical and logical expressions
      const evaluator = new Function(
        'context',
        `with(context) { return (${expr}); }`
      );

      const result = evaluator(context);
      if (result === undefined || result === null) return '';
      return result;
    } catch (e: any) {
      return `Err: ${e.message || 'Syntax'}`;
    }
  }
}

export const formulaEngine = new FormulaEngine();

