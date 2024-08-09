import { Module } from '@nestjs/common';
import { KafkaAdminController } from './kafka-admin.controller';
import { KafkaAdminService } from './kafka-admin.service';

@Module({
  imports: [],
  controllers: [KafkaAdminController],
  providers: [KafkaAdminService],
})
export class KafkaAdminModule {}
