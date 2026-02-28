import { Database, DatabaseRecord } from '../types';

/**
 * RFC-4180 Compliant CSV Serializer & Parser for Mindora Databases
 */
export class CSVService {
  /**
   * Export a database with all columns and records into CSV format.
   */
  public exportDatabase(database: Database, records: DatabaseRecord[]): string {
    const headers = ['Title', ...database.properties.map((p) => p.name)];
    const rows: string[][] = [headers];

    for (const record of records) {
      const row: string[] = [record.title || ''];
      for (const prop of database.properties) {
        const val = record.properties[prop.id];
        if (val === null || val === undefined) {
          row.push('');
        } else if (Array.isArray(val)) {
          row.push(val.join(', '));
        } else if (typeof val === 'object') {
          row.push(JSON.stringify(val));
        } else {
          row.push(String(val));
        }
      }
      rows.push(row);
    }

    return rows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
              return `"${escaped}"`;
            }
            return escaped;
          })
          .join(',')
      )
      .join('\r\n');
  }

  /**
   * Parse a raw CSV string into structured headers and records.
   */
  public parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  }
}

export const csvService = new CSVService();
