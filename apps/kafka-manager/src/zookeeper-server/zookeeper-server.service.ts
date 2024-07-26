import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ZookeeperServerService implements OnModuleInit, OnModuleDestroy {
  private readonly KAFKA_PATH: string;
  private readonly ZOO_KEEPER_SCRIPTS_PATH: string;
  private readonly ZOO_KEEPER_LOGS_PATH: string;

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
    await this.startZooKeeper();
  }

  async onModuleDestroy() {
    await this.stopZooKeeper();
  }

  private async startZooKeeper() {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.KAFKA_PATH}/${this.ZOO_KEEPER_SCRIPTS_PATH} ${this.KAFKA_PATH}/config/zookeeper.properties`,
      );
      if (stderr) {
        Logger.error(`ZooKeeper stderr: ${stderr}`);
      }
      Logger.log(`ZooKeeper stdout: ${stdout}`);
    } catch (error) {
      Logger.error(`Error starting ZooKeeper: ${error.message}`);
      // Consider implementing a retry mechanism here
    }
  }

  private async cleanupZookeepperLogs() {
    try {
      const { stdout, stderr } = await execAsync(
        `if exist "${this.ZOO_KEEPER_LOGS_PATH}\\*" (for /d %i in ("${this.ZOO_KEEPER_LOGS_PATH}\\*") do @rmdir /s /q "%i" & del /q "${this.ZOO_KEEPER_LOGS_PATH}\\*")`,
      );
      if (stderr) {
        Logger.error(`Zookeeper logs cleanup stderr: ${stderr}`);
      }
      Logger.log(`Zookeeper logs cleanup successfully: ${stdout}`);
    } catch (error) {
      Logger.error(`Error cleaning up Zookeeper logs: ${error.message}`);
    }
  }

  private async stopZooKeeper() {
    try {
      const { stdout, stderr } = await execAsync(
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
