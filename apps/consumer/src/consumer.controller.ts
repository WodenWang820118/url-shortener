import { Controller, Logger, Get } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @MessagePattern('example_topic')
  async handleMessage(@Payload() message: any) {
    return await this.consumerService.processMessage(message);
  }

  @Get('health')
  async health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('urls')
  async getAllUrls() {
    return await this.consumerService.getAllUrls();
  }

  @Get('urls/count')
  async getUrlCount() {
    return await this.consumerService.getUrlCount();
  }
}
