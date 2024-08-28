import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { KafkaAdminModule } from './kafka-admin/kafka-admin.module';

@Module({
  imports: [
    KafkaAdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join('../', '../.env'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class KafkaManagerModule {}
