import { ApiServer } from './api-server';
import { ConfigManager } from './config-manager';
import path from 'path';
import os from 'os';

async function main() {
  // Get settings path from environment or use default
  const settingsPath = process.env.SETTINGS_PATH || path.join(
    os.homedir(),
    '.config',
    'mcp',
    'settings.json'
  );

  const backupDir = process.env.BACKUP_DIR || path.join(
    path.dirname(settingsPath),
    'backups'
  );

  const port = parseInt(process.env.PORT || '3500', 10);

  console.log('Starting MCP Manager with configuration:');
  console.log(`- Settings path: ${settingsPath}`);
  console.log(`- Backup directory: ${backupDir}`);
  console.log(`- Port: ${port}`);

  const configManager = new ConfigManager(settingsPath, backupDir);
  await configManager.initialize();

  const apiServer = new ApiServer(configManager);
  await apiServer.start(port);

  process.on('SIGINT', async () => {
    console.log('\nShutting down MCP Manager...');
    await configManager.close();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Failed to start MCP Manager:', error);
  process.exit(1);
});
