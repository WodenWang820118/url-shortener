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
export class KafkaServerService implements OnModuleInit, OnModuleDestroy {
  private readonly KAFKA_PATH: string; //e.g., D:\Apache\kafka_2.13-3.7.1
  private readonly KAFKA_LOGS_PATH: string; // e.g., D:\tmp\kafka-logs
  private readonly KAFKA_SCRIPTS_PATH: string; // e.g., bin\windows\kafka-server-start.bat

  constructor(private configService: ConfigService) {
    this.KAFKA_PATH = this.configService.get<string>('KAFKA_PATH');
    this.KAFKA_LOGS_PATH = this.configService.get<string>('KAFKA_LOGS_PATH');
    this.KAFKA_SCRIPTS_PATH =
      this.configService.get<string>('KAFKA_SCRIPTS_PATH');
  }

  async onModuleInit() {
    await this.cleanupKafkaLogs();
    await new Promise((resolve) => setTimeout(resolve, 4000));
    this.startKafkaBroker();
  }

  async onModuleDestroy() {
    this.stopKafkaBroker();
  }

  private startKafkaBroker() {
    try {
      try {
        const { stdout, stderr } = exec(
          `${this.KAFKA_PATH}/${this.KAFKA_SCRIPTS_PATH} ${this.KAFKA_PATH}/config/server.properties`,
        );
        if (stderr) {
          Logger.error(
            `${JSON.stringify(stderr, null, 2)}`,
            KafkaServerService.name,
          );
        }
        Logger.log(
          `${JSON.stringify(stdout, null, 2)}`,
          KafkaServerService.name,
        );
      } catch (error) {
        Logger.error(`Error starting Kafka broker: ${error.message}`);
        // Consider implementing a retry mechanism here
      }
    } catch (error) {
      console.error(`Error starting Kafka broker: ${error.message}`);
    }
  }

  private async cleanupKafkaLogs() {
    try {
      rmSync(this.KAFKA_LOGS_PATH, { recursive: true, force: true });
      Logger.log('Kafka logs cleaned up', KafkaServerService.name);
    } catch (error) {
      Logger.error(`Error cleaning up Kafka logs: ${error.message}`);
    }
  }

  private stopKafkaBroker() {
    try {
      const { stdout, stderr } = exec(
        `${this.KAFKA_PATH}/bin/windows/kafka-server-stop.bat`,
      );
      if (stderr) {
        Logger.error(`Kafka broker stderr: ${JSON.stringify(stderr, null, 2)}`);
      }
      Logger.log(`Kafka broker stdout: ${JSON.stringify(stdout, null, 2)}`);
    } catch (error) {
      Logger.error(`Error stopping Kafka broker: ${error.message}`);
    }
  }
}
