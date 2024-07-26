import { Controller, Param, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post(':message')
  sendMessage(@Param() name: string) {
    return this.producerService.publish(name);
  }
}
