import { describe, it, expect } from 'vitest';
import { backupService } from '../src/services/backup';

describe('BackupService Workspace Snapshots', () => {
  it('creates full backup package with valid metadata and non-empty pages', () => {
    const backup = backupService.createBackup();
    expect(backup.version).toBe('1.0.0');
    expect(backup.timestamp).toBeGreaterThan(0);
    expect(backup.checksum).toMatch(/^sha256-[0-9a-f]+$/);
    expect(backup.pagesCount).toBeGreaterThan(0);
    expect(backup.data.pages.length).toBeGreaterThan(0);
  });

  it('verifies integrity of untampered backup packages', () => {
    const backup = backupService.createBackup();
    const isValid = backupService.verifyBackup(backup);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or corrupted backup packages', () => {
    const backup = backupService.createBackup();
    const tampered = {
      ...backup,
      checksum: 'sha256-invalidhash000',
    };
    expect(backupService.verifyBackup(tampered)).toBe(false);
  });
});
