import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Producer } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;

  constructor(
    @Inject('PRODUCER_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.producer = this.kafkaClient.createClient().producer();
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
