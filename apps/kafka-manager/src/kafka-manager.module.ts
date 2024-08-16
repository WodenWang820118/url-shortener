import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { KafkaAdminModule } from './kafka-admin/kafka-admin.module';

@Module({
  imports: [
    KafkaAdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join('../', '../.env'),
    }),
    TerminusModule,
  ],
  controllers: [],
  providers: [],
})
export class KafkaManagerModule {}
