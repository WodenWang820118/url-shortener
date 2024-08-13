import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { rmSync } from 'fs';

@Injectable()
export class ZookeeperServerService implements OnModuleInit, OnModuleDestroy {
  private readonly KAFKA_PATH: string; // e.g, D:\Apache\kafka_2.13-3.7.1
  private readonly ZOO_KEEPER_SCRIPTS_PATH: string; // e.g., bin\windows\zookeeper-server-start.bat
  private readonly ZOO_KEEPER_LOGS_PATH: string; // e.g., D:\tmp\zookeeper\version-2

  constructor(private configService: ConfigService) {
    this.KAFKA_PATH = this.configService.get<string>('KAFKA_PATH');
    this.ZOO_KEEPER_SCRIPTS_PATH = this.configService.get<string>(
      'ZOO_KEEPER_SCRIPTS_PATH',
    );
    this.ZOO_KEEPER_LOGS_PATH = this.configService.get<string>(
      'ZOO_KEEPER_LOGS_PATH',
    );
  }

  async onModuleInit() {
    await this.cleanupZookeepperLogs();
    this.startZooKeeper();
  }

  async onModuleDestroy() {
    this.stopZooKeeper();
  }

  private startZooKeeper() {
    try {
      const { stdout, stderr } = exec(
        `${this.KAFKA_PATH}/${this.ZOO_KEEPER_SCRIPTS_PATH} ${this.KAFKA_PATH}/config/zookeeper.properties`,
      );
      if (stderr) {
        Logger.error(
          `${JSON.stringify(stderr, null, 2)}`,
          ZookeeperServerService.name,
        );
      }
      Logger.log(
        `${JSON.stringify(stdout, null, 2)}`,
        ZookeeperServerService.name,
      );
    } catch (error) {
      Logger.error(`Error starting ZooKeeper: ${error.message}`);
      // Consider implementing a retry mechanism here
    }
  }

  private async cleanupZookeepperLogs() {
    try {
      rmSync(this.ZOO_KEEPER_LOGS_PATH, { recursive: true, force: true });
      Logger.log(`Zookeeper logs cleaned up`, ZookeeperServerService.name);
    } catch (error) {
      Logger.error(`Error cleaning up Zookeeper logs: ${error.message}`);
    }
  }

  private stopZooKeeper() {
    try {
      const { stdout, stderr } = exec(
        `${this.KAFKA_PATH}/bin/windows/zookeeper-server-stop.bat`,
      );
      if (stderr) {
        Logger.error(`ZooKeeper stderr: ${stderr}`);
      }
      Logger.log(`ZooKeeper stdout: ${stdout}`);
    } catch (error) {
      Logger.error(`Error stopping ZooKeeper: ${error.message}`);
    }
  }
}
