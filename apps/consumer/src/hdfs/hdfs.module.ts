import { Module } from '@nestjs/common';
import { HdfsController } from './hdfs.controller';
import { HdfsService } from './hdfs.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [HdfsController],
  providers: [HdfsService],
  exports: [HdfsService],
})
export class HdfsModule {}
