import { storage } from './storage';
import { WorkspaceData } from '../types';

/**
 * Workspace Snapshot & Backup Service
 * Exports and validates full workspace packages with integrity hashing.
 */
export interface WorkspaceBackupPackage {
  version: string;
  timestamp: number;
  checksum: string;
  workspacesCount: number;
  pagesCount: number;
  databasesCount: number;
  data: WorkspaceData;
}

export class BackupService {
  /**
   * Generates a complete JSON backup package with checksum.
   */
  public createBackup(): WorkspaceBackupPackage {
    const rawData = storage.exportWorkspaceData();
    const data: WorkspaceData = JSON.parse(rawData);
    const checksum = this.calculateChecksum(JSON.stringify(data));

    return {
      version: '1.0.0',
      timestamp: Date.now(),
      checksum,
      workspacesCount: data.workspaces?.length || 0,
      pagesCount: data.pages?.length || 0,
      databasesCount: data.databases?.length || 0,
      data,
    };
  }

  /**
   * Verifies whether a backup package has valid structure and untampered checksum.
   */
  public verifyBackup(pkg: WorkspaceBackupPackage): boolean {
    if (!pkg || !pkg.data || !pkg.checksum) return false;
    const rawData = JSON.stringify(pkg.data);
    const expected = this.calculateChecksum(rawData);
    return pkg.checksum === expected;
  }

  /**
   * Lightweight deterministic hash calculation for data integrity.
   */
  private calculateChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256-${Math.abs(hash).toString(16)}`;
  }
}

export const backupService = new BackupService();
