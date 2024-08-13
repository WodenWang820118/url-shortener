import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
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

  @Get('topic-metadata/:topicName')
  async getTopicMetadata(@Param('topicName') topicName: string) {
    return this.kafkaAdminService.getTopicMetadata(topicName);
  }

  @Get('topic-partition-counts/:topicName')
  async getTopicPartitionCounts(@Param('topicName') topicName: string) {
    return await this.kafkaAdminService.getTopicPartitionCounts(topicName);
  }

  // FIXME: delete topic will cause seed broker to crash and can't be recovered
  @Delete('delete-topic')
  async deleteTopic(@Body('topic') topic: string) {
    await this.kafkaAdminService.deleteTopic(topic);
    return { message: `Topic ${topic} deleted successfully` };
  }
}
