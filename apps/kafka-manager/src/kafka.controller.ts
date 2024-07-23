import { Controller, Get } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Get('start-kafka')
  startKafka() {
    this.kafkaService.startKafkaBroker();
    return 'Starting Kafka broker...';
  }

  @Get('stop-kafka')
  stopKafka() {
    this.kafkaService.stopKafkaBroker();
    return 'Stopping Kafka broker...';
  }

  @Get('start-zookeeper')
  startZookeeper() {
    this.kafkaService.startZooKeeper();
    return 'Starting Zookeeper';
  }

  @Get('stop-zookeeper')
  stopZookeeper() {
    this.kafkaService.stopZooKeeper();
    return 'Stopping Zookeeper';
  }
}
