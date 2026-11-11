import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../src/services/storage';

describe('StorageService', () => {
  it('loads seed workspace and initial pages', () => {
    const ws = storage.getActiveWorkspace();
    expect(ws).toBeDefined();
    expect(ws.name).toContain('Mindora');

    const pages = storage.getPages();
    expect(pages.length).toBeGreaterThanOrEqual(4);
    expect(pages.some((p) => p.title === 'Welcome to Mindora')).toBe(true);
  });

  it('creates, updates, and deletes pages', () => {
    const newPage = storage.createPage('Test Note', 'Initial content with #testing tag');
    expect(newPage.id).toBeDefined();
    expect(newPage.title).toBe('Test Note');

    const updated = storage.updatePage(newPage.id, {
      title: 'Updated Test Note',
      content: 'Updated content #production',
    });
    expect(updated?.title).toBe('Updated Test Note');
    expect(updated?.tags).toContain('production');

    storage.deletePage(newPage.id);
    const found = storage.getPage(newPage.id);
    expect(found).toBeUndefined();
  });

  it('handles database records and properties', () => {
    const databases = storage.getDatabases();
    expect(databases.length).toBeGreaterThanOrEqual(1);

    const db = databases[0];
    const record = storage.createRecord(db.id, 'New Initiative Item');
    expect(record.title).toBe('New Initiative Item');

    storage.updateRecord(record.id, {
      properties: { 'prop-status': 'Completed' },
    });
    const records = storage.getRecords(db.id);
    const updatedRec = records.find((r) => r.id === record.id);
    expect(updatedRec?.properties['prop-status']).toBe('Completed');

    storage.deleteRecord(record.id);
  });

  it('parses Obsidian markdown vault note with YAML frontmatter', () => {
    const mdContent = `---
title: "Imported Architecture Note"
tags: [systems, reactive, offline]
---

# Imported Architecture

This is imported from Obsidian with [[Welcome to Mindora]] link.
`;

    const imported = storage.importVaultMarkdown('imported-note.md', mdContent);
    expect(imported.title).toBe('Imported Architecture Note');
    expect(imported.tags).toContain('systems');
    expect(imported.tags).toContain('reactive');
    expect(imported.content).toContain('This is imported from Obsidian');

    storage.deletePage(imported.id);
  });

  it('exports workspace bundle to structured JSON', () => {
    const jsonStr = storage.exportWorkspaceData();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.workspace).toBeDefined();
    expect(Array.isArray(parsed.pages)).toBe(true);
    expect(Array.isArray(parsed.databases)).toBe(true);
  });

  it('guarantees zero secret API key leakage in exports and general storage state', () => {
    storage.updateAISettings({
      apiKey: 'secret-test-key-12345',
      persistKey: false,
    });

    // 1. Export workspace bundle must NOT contain the secret key
    const exportedJson = storage.exportWorkspaceData();
    expect(exportedJson).not.toContain('secret-test-key-12345');

    // 2. Local storage state must NOT contain the secret key
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mindora_v1_state');
      if (stored) {
        expect(stored).not.toContain('secret-test-key-12345');
      }
    }

    // 3. AISettings returns the key for authorized active app runtime
    const settings = storage.getAISettings();
    expect(settings.apiKey).toBe('secret-test-key-12345');

    // Cleanup
    storage.updateAISettings({ apiKey: '' });
  });
});

