import { Body, Controller, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('write-event')
  async writeEvent(@Body() body: { topic: string; message: string }) {
    await this.producerService.writeEvents(body.topic, body.message);
    return { success: true, message: 'Event written to Kafka' };
  }
}
