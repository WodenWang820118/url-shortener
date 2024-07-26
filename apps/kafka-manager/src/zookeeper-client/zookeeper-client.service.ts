import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import ZooKeeper from 'zookeeper';

@Injectable()
export class ZookeeperClientService implements OnModuleInit, OnModuleDestroy {
  private client: ZooKeeper;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  createClient(timeouts = 5000) {
    return new ZooKeeper({
      connect: 'localhost:2181',
      timeout: timeouts,
      debug_level: ZooKeeper.constants.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false,
    });
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = this.createClient();
      this.client.on('connect', () => {
        console.log('Connected to ZooKeeper');
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('Failed to connect to ZooKeeper', error);
        reject(error);
      });
    });
  }

  private close(): Promise<void> {
    return new Promise((resolve) => {
      this.client.close();
      console.log('Disconnected from ZooKeeper');
      resolve();
    });
  }

  // Add other ZooKeeper-related methods here
  async createNode(path: string, data: Buffer): Promise<string> {
    try {
      const createdPath = await this.client.create(
        path,
        data,
        ZooKeeper.constants.ZOO_EPHEMERAL,
      );
      console.log(`Node created: ${createdPath}`);
      return createdPath;
    } catch (error) {
      console.error(`Failed to create node: ${path}`, error);
      throw error;
    }
  }
}
