import { Controller, Post, Body } from '@nestjs/common';
import { KafkaAdminService } from './kafka-admin.service';

@Controller('kafka-admin')
export class KafkaAdminController {
  constructor(private readonly kafkaAdminService: KafkaAdminService) {}

  @Post('create-topic')
  async createTopic(
    @Body('topic') topic: string,
    @Body('numPartitions') numPartitions: number,
    @Body('replicationFactor') replicationFactor: number,
  ) {
    await this.kafkaAdminService.createTopic(
      topic,
      numPartitions,
      replicationFactor,
    );
    return { message: `Topic ${topic} created successfully` };
  }
}
