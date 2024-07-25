import { Body, Controller, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send-message')
  sendMessage(@Body() body: { topic: string; message: any }) {
    return this.producerService.sendMessage(body.topic, body.message);
  }

  @MessagePattern('topic-name')
  handleMessage(@Payload() message: any) {
    console.log('Received message:', message);
    // Process the message
  }
}
