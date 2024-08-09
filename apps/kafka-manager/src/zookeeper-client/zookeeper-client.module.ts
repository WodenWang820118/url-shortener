import { Module } from '@nestjs/common';
import { ZookeeperClientService } from './zookeeper-client.service';

@Module({
  imports: [],
  providers: [ZookeeperClientService],
  exports: [ZookeeperClientService],
})
export class ZookeeperClientModule {}
