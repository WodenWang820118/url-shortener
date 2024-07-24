import { Body, Controller, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: any): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        realm,
      },
      key: heroId,
      value: items,
    };
  }
}
