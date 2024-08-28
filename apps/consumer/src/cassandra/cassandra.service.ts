import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Client, types } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({
      contactPoints: ['localhost'],
      localDataCenter: 'datacenter1',
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
      Logger.log('Connected to Cassandra', CassandraService.name);
    } catch (error) {
      Logger.error(
        `Failed to connect to Cassandra: ${error.message}`,
        `${CassandraService.name}.${CassandraService.prototype.onModuleInit.name}`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.shutdown();
  }

  private async connect() {
    await this.client.connect();
    const query =
      "CREATE KEYSPACE IF NOT EXISTS examples WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3' }";
    await this.execute(query);
    const createTableQuery =
      'CREATE TABLE IF NOT EXISTS examples.shortened_urls ( \
          url_id text PRIMARY KEY, \
          original_url text, \
          created_at timestamp \
      );';
    await this.execute(createTableQuery);
  }

  async execute(query: string, params?: any[]): Promise<types.ResultSet> {
    try {
      return await this.client.execute(query, params, { prepare: true });
    } catch (error) {
      Logger.error(
        `Query execution error: ${error.message}`,
        `${CassandraService.name}.${CassandraService.prototype.execute.name}`,
      );
      throw error;
    }
  }

  async getKeyspaces(): Promise<types.ResultSet> {
    const query = 'SELECT keyspace_name FROM system_schema.keyspaces';
    return this.execute(query);
  }

  async getTables(keyspace: string): Promise<types.ResultSet> {
    const query =
      'SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?';
    return this.execute(query, [keyspace]);
  }

  async getTable(keyspace: string, table: string): Promise<types.ResultSet> {
    const query = `SELECT * FROM ${keyspace}.${table}`;
    return this.execute(query);
  }
}
