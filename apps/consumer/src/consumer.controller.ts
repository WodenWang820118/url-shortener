import { Controller, Logger } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @MessagePattern('example_topic')
  async handleMessage(@Payload() message: any) {
    return await this.consumerService.processMessage(message);
  }
}
