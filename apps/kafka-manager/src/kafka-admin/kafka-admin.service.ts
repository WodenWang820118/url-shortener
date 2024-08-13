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
    await new Promise((resolve) => setTimeout(resolve, 3000));
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
      console.log(`Topic ${topic} created successfully`);
    } else {
      console.log(`Topic ${topic} already exists`);
    }
  }

  async createTopics() {
    try {
      Logger.log('Creating topics...');
      await this.admin.connect();
      await this.admin.createTopics({
        topics: [
          {
            topic: this.configService.get<string>('KAFKA_TOPIC'),
            numPartitions: this.configService.get<number>('KAFKA_PARTITIONS'),
            replicationFactor: 1,
          },
        ],
      });
      console.log('Topics created successfully');
    } catch (error) {
      console.error('Error creating topics:', error);
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
        `Error getting partition count for topic ${topicName}:`,
        error,
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
      console.log(`Topic ${topic} deleted successfully`);
    } else {
      console.log(`Topic ${topic} does not exist`);
    }
  }
}
