import { Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class ProducerService {
  private kafka: Kafka;
  private producer: any;

  async writeEvents(topicName: string, message: string) {
    try {
      await this.producer.send({
        topic: topicName,
        messages: [{ value: message }],
      });
      Logger.log(`Message sent to topic ${topicName}: ${message}`);
    } catch (error) {
      Logger.error(`Error sending message to Kafka: ${error.message}`);
    }
  }
}
