import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post(':topic')
  async sendMessage(@Param('topic') topic: string, @Body() message: any) {
    return await this.producerService.publish(topic, message);
  }
}
