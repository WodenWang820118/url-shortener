import { Module } from '@nestjs/common';
import { ZookeeperServerService } from './zookeeper-server.service';

@Module({
  imports: [],
  providers: [ZookeeperServerService],
  exports: [ZookeeperServerService],
})
export class ZookeeperServerModule {}
