import { Module } from '@nestjs/common';
import { CassandraService } from './cassandra.service';
import { CassandraController } from './cassandra.controller';

@Module({
  controllers: [CassandraController],
  providers: [CassandraService],
  exports: [CassandraService],
})
export class CassandraModule {}
