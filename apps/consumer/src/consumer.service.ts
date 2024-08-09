import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ConsumerService implements OnModuleInit {
  // see the corresponding client avaiable in the module.ts file
  constructor(
    @Inject('EXAMPLE_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Need to subscribe to topic
    // so that we can get the response from Kafka microservice
    this.kafkaClient.subscribeToResponseOf('example_topic');
    await this.kafkaClient.connect();
    Logger.log('Connected to Kafka');
  }

  async processMessage(message: any) {
    try {
      Logger.log('Processing message:', message);
      // Process the message
      return 'Message processed';
    } catch (error) {
      Logger.error('Error processing message', error);
      throw error;
    }
  }
}
