import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafkaInstance: Kafka;
  private producer: Producer;

  constructor() {
    this.kafkaInstance = new Kafka({
      clientId: 'producer',
      brokers: ['localhost:9092'],
      connectionTimeout: 3000,
    });

    this.producer = this.kafkaInstance.producer();
  }

  async onModuleInit() {
    // Connect when the module initializes
    await this.producer.connect();
  }

  async onModuleDestroy() {
    // Disconnect when the module is destroyed
    await this.producer.disconnect();
  }

  async publish(topic: string, message: any) {
    // No need to connect here, as we're already connected
    return await this.producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
