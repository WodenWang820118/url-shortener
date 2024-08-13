import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { ZookeeperServerModule } from './zookeeper-server/zookeeper-server.module';
import { KafkaServerModule } from './kafka-server/kafka-server.module';
import { KafkaAdminModule } from './kafka-admin/kafka-admin.module';

@Module({
  imports: [
    ZookeeperServerModule,
    KafkaServerModule,
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
