import { describe, it, expect } from 'vitest';
import { csvService } from '../src/services/csv';
import { Database, DatabaseRecord } from '../src/types';

describe('CSVService Serializer & Parser', () => {
  const mockDb: Database = {
    id: 'db-1',
    workspaceId: 'ws-1',
    title: 'Sprint Backlog',
    properties: [
      { id: 'status', name: 'Status', type: 'status' },
      { id: 'priority', name: 'Priority', type: 'select' },
      { id: 'points', name: 'Story Points', type: 'number' },
    ],
    views: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockRecords: DatabaseRecord[] = [
    {
      id: 'rec-1',
      databaseId: 'db-1',
      title: 'Auth Flow, OAuth2',
      properties: { status: 'Done', priority: 'High', points: 5 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'rec-2',
      databaseId: 'db-1',
      title: 'Database Rollups',
      properties: { status: 'In Progress', priority: 'Medium', points: 8 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  it('exports database records to valid CSV with escaped commas', () => {
    const csv = csvService.exportDatabase(mockDb, mockRecords);
    expect(csv).toContain('Title,Status,Priority,Story Points');
    expect(csv).toContain('"Auth Flow, OAuth2",Done,High,5');
    expect(csv).toContain('Database Rollups,In Progress,Medium,8');
  });

  it('correctly parses raw CSV string into rows and headers', () => {
    const raw = 'Title,Status,Score\r\nTask 1,Done,10\r\n"Task 2, Special",Pending,20';
    const parsed = csvService.parseCSV(raw);
    expect(parsed.headers).toEqual(['Title', 'Status', 'Score']);
    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[0].Title).toBe('Task 1');
    expect(parsed.rows[1].Title).toBe('Task 2, Special');
    expect(parsed.rows[1].Score).toBe('20');
  });
});
