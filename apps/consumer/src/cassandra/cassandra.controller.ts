import { Controller, Get, Param } from '@nestjs/common';
import { CassandraService } from './cassandra.service';

@Controller('cassandra')
export class CassandraController {
  constructor(private readonly cassandraService: CassandraService) {}

  @Get()
  async getKeyspaces() {
    return await this.cassandraService.getKeyspaces();
  }

  @Get(':keyspace')
  async getTables(@Param('keyspace') keyspace: string) {
    return await this.cassandraService.getTables(keyspace);
  }

  @Get(':keyspace/:table')
  async getTable(
    @Param('keyspace') keyspace: string,
    @Param('table') table: string,
  ) {
    return await this.cassandraService.getTable(keyspace, table);
  }
}
