import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { McpServerConfig, ServerStatus } from './types';

const DEFAULT_SERVERS: Record<string, McpServerConfig> = {
  'search-server': {
    command: 'node',
    args: ['C:/Users/BigDSweetz/Desktop/Git/MCP/multi-mcp-repo/search-server/build/index.js'],
    env: {},
    disabled: false,
  },
  'git-server': {
    command: 'docker',
    args: [
      'run',
      '--rm',
      '-i',
      '--mount',
      'type=bind,src=c:/Users/BigDSweetz/Desktop/Git/Remix_chat,dst=/repo',
      'mcp/git',
      '--repository',
      '/repo'
    ],
    disabled: false,
    autoApprove: ['git_create_branch', 'git_diff_staged']
  }
};

interface DbRow {
  name: string;
  config: string;
  status: 'running' | 'stopped' | 'error';
}

export class DbManager {
  private db!: sqlite3.Database;
  private dbPath: string;

  constructor(settingsDir: string) {
    this.dbPath = path.join(settingsDir, 'mcp.db');
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(path.dirname(this.dbPath));
    await this.ensureDatabase();
    await this.initializeDefaultServers();
  }

  private async ensureDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.db.run(`
          CREATE TABLE IF NOT EXISTS servers (
            name TEXT PRIMARY KEY,
            config TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'stopped'
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  private async initializeDefaultServers(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM servers', [], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          const stmt = this.db.prepare('INSERT OR IGNORE INTO servers (name, config, status) VALUES (?, ?, ?)');
          
          Object.entries(DEFAULT_SERVERS).forEach(([name, config]) => {
            stmt.run(name, JSON.stringify(config), 'stopped');
          });

          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  async getAllServers(): Promise<Record<string, McpServerConfig>> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT name, config FROM servers', [], (err, rows: DbRow[]) => {
        if (err) {
          console.error('Failed to get servers:', err);
          resolve(DEFAULT_SERVERS);
          return;
        }

        const servers: Record<string, McpServerConfig> = {};
        rows.forEach(row => {
          servers[row.name] = JSON.parse(row.config);
        });
        resolve(servers);
      });
    });
  }

  async addServer(name: string, config: McpServerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO servers (name, config, status) VALUES (?, ?, ?)',
        [name, JSON.stringify(config), 'stopped'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateServer(name: string, config: Partial<McpServerConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT config FROM servers WHERE name = ?', [name], (err, row: DbRow) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          reject(new Error(`Server "${name}" not found`));
          return;
        }

        const currentConfig = JSON.parse(row.config);
        const updatedConfig = {
          ...currentConfig,
          ...config,
        };

        this.db.run(
          'UPDATE servers SET config = ? WHERE name = ?',
          [JSON.stringify(updatedConfig), name],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
  }

  async deleteServer(name: string): Promise<void> {
    if (name in DEFAULT_SERVERS) {
      throw new Error('Cannot delete default server');
    }

    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM servers WHERE name = ?', [name], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getServerStatus(name: string): Promise<ServerStatus> {
    return new Promise((resolve) => {
      this.db.get('SELECT status FROM servers WHERE name = ?', [name], (err, row: DbRow) => {
        if (err || !row) {
          resolve({
            name,
            status: 'error',
            tools: []
          });
          return;
        }

        resolve({
          name,
          status: row.status,
          tools: []
        });
      });
    });
  }

  async updateServerStatus(name: string, status: 'running' | 'stopped' | 'error'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE servers SET status = ? WHERE name = ?',
        [status, name],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
