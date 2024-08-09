import { Module } from '@nestjs/common';
import { KafkaServerService } from './kafka-server.service';

@Module({
  imports: [],
  providers: [KafkaServerService],
  exports: [KafkaServerService],
})
export class KafkaServerModule {}
