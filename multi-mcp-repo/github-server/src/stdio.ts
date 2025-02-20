import { Transport } from './types';
import { createInterface } from 'readline';

export class StdioServerTransport implements Transport {
  private readline: ReturnType<typeof createInterface>;

  constructor() {
    this.readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
  }

  async connect(): Promise<void> {
    this.readline.on('line', (line) => {
      try {
        const message = JSON.parse(line);
        // Handle incoming messages
        console.error('Received:', message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  async close(): Promise<void> {
    this.readline.close();
  }

  send(message: any): void {
    console.log(JSON.stringify(message));
  }
}
