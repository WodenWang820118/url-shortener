import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
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

  @Get('topics')
  async getTopics() {
    return this.kafkaAdminService.getTopics();
  }

  // FIXME: delete topic will cause seed broker to crash and can't be recovered
  @Delete('delete-topic')
  async deleteTopic(@Body('topic') topic: string) {
    await this.kafkaAdminService.deleteTopic(topic);
    return { message: `Topic ${topic} deleted successfully` };
  }
}
