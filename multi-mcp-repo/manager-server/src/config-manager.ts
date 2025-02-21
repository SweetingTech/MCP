import { McpServerConfig, ServerStatus } from './types';
import { DbManager } from './db-manager';
import path from 'path';
import fs from 'fs-extra';

export class ConfigManager {
  private dbManager: DbManager;
  private settingsPath: string;
  private backupDir: string;

  constructor(settingsPath: string, backupDir: string) {
    this.settingsPath = settingsPath;
    this.backupDir = backupDir;
    this.dbManager = new DbManager(path.dirname(settingsPath));
  }

  async initialize(): Promise<void> {
    await this.dbManager.initialize();
  }

  async getAllServers(): Promise<Record<string, McpServerConfig>> {
    return this.dbManager.getAllServers();
  }

  async addServer(name: string, config: McpServerConfig): Promise<void> {
    await this.dbManager.addServer(name, config);
  }

  async updateServer(name: string, config: Partial<McpServerConfig>): Promise<void> {
    await this.dbManager.updateServer(name, config);
  }

  async removeServer(name: string): Promise<void> {
    await this.dbManager.deleteServer(name);
  }

  async enableServer(name: string): Promise<void> {
    await this.dbManager.updateServerStatus(name, 'running');
  }

  async disableServer(name: string): Promise<void> {
    await this.dbManager.updateServerStatus(name, 'stopped');
  }

  async getServerStatus(name: string): Promise<ServerStatus> {
    return this.dbManager.getServerStatus(name);
  }

  async listBackups(): Promise<string[]> {
    try {
      await fs.ensureDir(this.backupDir);
      const files = await fs.readdir(this.backupDir);
      return files.filter(f => f.startsWith('settings-') && f.endsWith('.json'));
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  async restoreBackup(backupName: string): Promise<void> {
    const backupPath = path.join(this.backupDir, backupName);
    try {
      if (!await fs.pathExists(backupPath)) {
        throw new Error(`Backup "${backupName}" does not exist`);
      }

      // Read the backup file
      const backupData = await fs.readJson(backupPath);
      
      // Clear existing servers
      await this.dbManager.close();
      await fs.remove(this.dbManager['dbPath']);
      
      // Reinitialize database
      this.dbManager = new DbManager(path.dirname(this.settingsPath));
      await this.dbManager.initialize();

      // Restore servers from backup
      for (const [name, config] of Object.entries(backupData.mcpServers)) {
        await this.dbManager.addServer(name, config as McpServerConfig);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.dbManager.close();
  }
}
