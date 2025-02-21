import express from 'express';
import cors from 'cors';
import { ConfigManager } from './config-manager';
import { McpServerConfig } from './types';

export class ApiServer {
  private app: express.Application;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Get all servers
    this.app.get('/api/servers', async (req, res) => {
      try {
        const servers = await this.configManager.getAllServers();
        res.json({ success: true, data: servers });
      } catch (error) {
        console.error('Failed to get servers:', error);
        res.status(500).json({ success: false, error: 'Failed to get servers' });
      }
    });

    // Add new server
    this.app.post('/api/servers', async (req, res) => {
      try {
        const { name, config } = req.body;
        await this.configManager.addServer(name, config);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to add server:', error);
        res.status(500).json({ success: false, error: 'Failed to add server' });
      }
    });

    // Update server
    this.app.put('/api/servers/:name', async (req, res) => {
      try {
        const { name } = req.params;
        const { config } = req.body;
        await this.configManager.updateServer(name, config);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to update server:', error);
        res.status(500).json({ success: false, error: 'Failed to update server' });
      }
    });

    // Delete server
    this.app.delete('/api/servers/:name', async (req, res) => {
      try {
        const { name } = req.params;
        await this.configManager.removeServer(name);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to delete server:', error);
        res.status(500).json({ success: false, error: 'Failed to delete server' });
      }
    });

    // Enable server
    this.app.post('/api/servers/:name/enable', async (req, res) => {
      try {
        const { name } = req.params;
        await this.configManager.enableServer(name);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to enable server:', error);
        res.status(500).json({ success: false, error: 'Failed to enable server' });
      }
    });

    // Disable server
    this.app.post('/api/servers/:name/disable', async (req, res) => {
      try {
        const { name } = req.params;
        await this.configManager.disableServer(name);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to disable server:', error);
        res.status(500).json({ success: false, error: 'Failed to disable server' });
      }
    });

    // Get server status
    this.app.get('/api/servers/:name/status', async (req, res) => {
      try {
        const { name } = req.params;
        const status = await this.configManager.getServerStatus(name);
        res.json({ success: true, data: status });
      } catch (error) {
        console.error('Failed to get server status:', error);
        res.status(500).json({ success: false, error: 'Failed to get server status' });
      }
    });

    // List backups
    this.app.get('/api/backups', async (req, res) => {
      try {
        const backups = await this.configManager.listBackups();
        res.json({ success: true, data: backups });
      } catch (error) {
        console.error('Failed to list backups:', error);
        res.status(500).json({ success: false, error: 'Failed to list backups' });
      }
    });

    // Restore backup
    this.app.post('/api/backups/:name/restore', async (req, res) => {
      try {
        const { name } = req.params;
        await this.configManager.restoreBackup(name);
        res.json({ success: true });
      } catch (error) {
        console.error('Failed to restore backup:', error);
        res.status(500).json({ success: false, error: 'Failed to restore backup' });
      }
    });
  }

  async start(port: number = 3500): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app.listen(port, () => {
        console.log(`MCP Manager API server running on port ${port}`);
        resolve();
      }).on('error', reject);
    });
  }
}
