import { Controller } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @MessagePattern('topic-name')
  handleMessage(@Payload() message: any) {
    console.log('Received message:', message);
    // Process the message
  }
}
