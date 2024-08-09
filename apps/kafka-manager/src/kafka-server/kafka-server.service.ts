import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { rmSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class KafkaServerService implements OnModuleInit, OnModuleDestroy {
  private readonly KAFKA_PATH: string;
  private readonly KAFKA_LOGS_PATH: string;
  private readonly KAFKA_SCRIPTS_PATH: string;

  constructor(private configService: ConfigService) {
    this.KAFKA_PATH = this.configService.get<string>('KAFKA_PATH');
    this.KAFKA_LOGS_PATH = this.configService.get<string>('KAFKA_LOGS_PATH');
    this.KAFKA_SCRIPTS_PATH =
      this.configService.get<string>('KAFKA_SCRIPTS_PATH');
  }

  async onModuleInit() {
    await this.cleanupKafkaLogs();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await this.startKafkaBroker();
  }

  async onModuleDestroy() {
    await this.stopKafkaBroker();
  }

  private async startKafkaBroker() {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.KAFKA_PATH}/${this.KAFKA_SCRIPTS_PATH} ${this.KAFKA_PATH}/config/server.properties`,
      );
      if (stderr) {
        Logger.error(`Kafka broker stderr: ${stderr}`);
      }
      Logger.log(`Kafka broker stdout: ${stdout}`);
    } catch (error) {
      Logger.error(`Error starting Kafka broker: ${error.message}`);
      // Consider implementing a retry mechanism here
    }
  }

  private async cleanupKafkaLogs() {
    try {
      rmSync(this.KAFKA_LOGS_PATH, { recursive: true, force: true });
      Logger.log('Kafka logs cleaned up');
    } catch (error) {
      Logger.error(`Error cleaning up Kafka logs: ${error.message}`);
    }
  }

  private async stopKafkaBroker() {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.KAFKA_PATH}/bin/windows/kafka-server-stop.bat`,
      );
      if (stderr) {
        Logger.error(`Kafka broker stderr: ${stderr}`);
      }
      Logger.log(`Kafka broker stdout: ${stdout}`);
    } catch (error) {
      Logger.error(`Error stopping Kafka broker: ${error.message}`);
    }
  }
}
