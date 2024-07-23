import { Injectable, Logger } from '@nestjs/common';
import { exec, fork, spawn } from 'child_process';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class KafkaService {
  private readonly KAFKA_PATH = this.configService.get<string>('KAFKA_PATH');
  private readonly ZOO_KEEPER_PATH =
    this.configService.get<string>('ZOO_KEEPER_PATH');
  private kafkaProcess: any;

  constructor(private configService: ConfigService) {}

  startZooKeeper() {
    exec(
      `${this.KAFKA_PATH}/bin/windows/zookeeper-server-start.bat ${this.KAFKA_PATH}/config/zookeeper.properties`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error starting ZooKeeper: ${error.message}`);
          return;
        }
        if (stderr) {
          Logger.error(`ZooKeeper stderr: ${stderr}`);
          return;
        }
        Logger.log(`ZooKeeper stdout: ${stdout}`);
      },
    );
  }

  stopZooKeeper() {
    exec(
      `${this.KAFKA_PATH}/bin/windows/zookeeper-server-stop.bat`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error stopping ZooKeeper: ${error.message}`);
          return;
        }
        if (stderr) {
          Logger.error(`ZooKeeper stderr: ${stderr}`);
          return;
        }
        Logger.log(`ZooKeeper stdout: ${stdout}`);
      },
    );
  }

  startKafkaBroker() {
    exec(
      `${this.KAFKA_PATH}/bin/windows/kafka-server-start.bat ${this.KAFKA_PATH}/config/server.properties`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error starting Kafka broker: ${error.message}`);
          return;
        }
        if (stderr) {
          Logger.error(`Kafka broker stderr: ${stderr}`);
          return;
        }
        Logger.log(`Kafka broker stdout: ${stdout}`);
      },
    );
  }

  stopKafkaBroker() {
    exec(
      `${this.KAFKA_PATH}/bin/windows/kafka-server-stop.bat`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error stopping Kafka broker: ${error.message}`);
          return;
        }
        if (stderr) {
          Logger.error(`Kafka broker stderr: ${stderr}`);
          return;
        }
        Logger.log(`Kafka broker stdout: ${stdout}`);
      },
    );
  }

  createTopic(topicName: string) {
    exec(
      `${this.KAFKA_PATH}/bin/kafka-topics.sh --create --topic ${topicName} --bootstrap-server localhost:9092`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error starting Kafka broker: ${error.message}`);
          return;
        }
        if (stderr) {
          Logger.error(`Kafka broker stderr: ${stderr}`);
          return;
        }
        Logger.log(`Kafka broker stdout: ${stdout}`);
      },
    );
  }
}
