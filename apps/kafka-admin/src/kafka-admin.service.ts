import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class KafkaAdminService implements OnModuleInit, OnModuleDestroy {
  private admin: Admin;

  constructor() {
    const kafka = new Kafka({
      clientId: 'kafka-admin',
      brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
      connectionTimeout: 3000, // 3 seconds
      requestTimeout: 30000, // 30 seconds
    });
    this.admin = kafka.admin({
      retry: {
        retries: 10,
        maxRetryTime: 3000,
      },
    });
  }

  async onModuleInit() {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await this.admin.connect();
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

  async getTopics(): Promise<string[]> {
    return this.admin.listTopics();
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
