import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { KafkaServerService } from './kafka-server/kafka-server.service';
import { ZookeeperClientService } from './zookeeper-client/zookeeper-client.service';
import { ZookeeperServerService } from './zookeeper-server/zookeeper-server.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join('../', '../.env'),
    }),
    TerminusModule,
  ],
  controllers: [],
  providers: [
    ZookeeperServerService,
    KafkaServerService,
    ZookeeperClientService,
  ],
})
export class KafkaManagerModule {}
