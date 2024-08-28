import {
  Injectable,
  OnModuleDestroy,
  Logger,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { Admin } from 'kafkajs';

@Injectable()
export class KafkaAdminService
  implements OnModuleDestroy, OnApplicationBootstrap
{
  private admin: Admin;

  constructor(
    private configService: ConfigService,
    @Inject('ADMIN_SERVICE') kafkaClient: ClientKafka,
  ) {
    this.admin = kafkaClient.createClient().admin();
  }

  async onApplicationBootstrap() {
    await this.admin.connect();
    await this.createTopics();
  }

  async onModuleDestroy() {
    await this.admin.disconnect();
  }

  async createTopic(
    topic: string,
    numPartitions = 1,
    replicationFactor = 1,
  ): Promise<void> {
    const topics = await this.admin.listTopics();
    if (!topics.includes(topic)) {
      await this.admin.createTopics({
        topics: [{ topic, numPartitions, replicationFactor }],
      });
      Logger.log(
        `Topic ${topic} created successfully`,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.createTopic.name}`,
      );
    } else {
      Logger.log(
        `Topic ${topic} already exists`,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.createTopic.name}`,
      );
    }
  }

  async createTopics() {
    try {
      Logger.log(
        'Creating default topics...',
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.createTopic.name}`,
      );
      await this.createTopic(
        this.configService.get<string>('KAFKA_TOPIC'),
        this.configService.get<number>('KAFKA_PARTITIONS'),
      );
    } catch (error) {
      Logger.error(
        error,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.createTopic.name}`,
      );
    }
  }

  async getTopics(): Promise<string[]> {
    return this.admin.listTopics();
  }

  async getTopicMetadata(topicName: string) {
    try {
      const topicMetadata = await this.admin.fetchTopicMetadata({
        topics: [topicName],
      });
      const topic = topicMetadata.topics.find((t) => t.name === topicName);

      if (topic) {
        return topic;
      } else {
        throw new Error(`Topic ${topicName} not found`);
      }
    } catch (error) {
      Logger.error(
        error,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.getTopicMetadata.name}`,
      );
    }
  }

  async getTopicPartitionCounts(topicName: string): Promise<number> {
    const topic = await this.getTopicMetadata(topicName);
    return topic.partitions.length;
  }

  async deleteTopic(topic: string): Promise<void> {
    const topics = await this.admin.listTopics();
    if (topics.includes(topic)) {
      await this.admin.deleteTopics({ topics: [topic] });
      Logger.log(
        `Topic ${topic} deleted successfully`,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.deleteTopic.name}`,
      );
    } else {
      Logger.log(
        `Topic ${topic} does not exist`,
        `${KafkaAdminService.name}.${KafkaAdminService.prototype.deleteTopic.name}`,
      );
    }
  }
}
