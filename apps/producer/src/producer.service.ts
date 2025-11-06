import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { ShortenUrlResponseDto } from './dto/shorten-url.dto';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly producer: Producer;

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

  /**
   * Generate a short code for the URL
   */
  private generateShortCode(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Shorten a URL and publish to Kafka
   */
  async shortenUrl(longUrl: string): Promise<ShortenUrlResponseDto> {
    const shortCode = this.generateShortCode();
    const createdAt = new Date().toISOString();

    // Prepare the message to publish to Kafka
    // Using url_id and original_url to match consumer expectations
    const message = {
      url_id: shortCode,
      original_url: longUrl,
      created_at: createdAt,
    };

    // Publish to Kafka (using the topic from env or default)
    await this.publish(process.env['KAFKA_TOPIC'] || 'example_topic', message);

    // Return the response
    return {
      shortUrl: `http://localhost:3000/${shortCode}`,
      shortCode,
      originalUrl: longUrl,
      createdAt,
    };
  }

  async publish(topic: string, message: any) {
    // No need to connect here, as we're already connected
    return await this.producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
