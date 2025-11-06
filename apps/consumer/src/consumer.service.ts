import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { HdfsService } from './hdfs/hdfs.service';
import { CassandraService } from './cassandra/cassandra.service';
import { MetricsService } from './metrics/metrics.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  // see the corresponding client available in the module.ts file
  constructor(
    @Inject('EXAMPLE_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly hdfsService: HdfsService,
    private readonly cassandraService: CassandraService,
    private readonly metricsService: MetricsService,
  ) {}

  async onModuleInit() {
    // need to subscribe to a topic
    // so that we can get the response from the Kafka microservice
    // the topic will be automatically created if it doesn't exist
    this.kafkaClient.subscribeToResponseOf('example_topic');
    await this.kafkaClient.connect();
  }

  async processMessage(message: any) {
    const endTimer = this.metricsService.kafkaProcessingDuration.startTimer();

    try {
      const { url_id, original_url } = message;
      const created_at = new Date();

      Logger.log(
        'url_id: ' + url_id,
        `${ConsumerService.name}.${ConsumerService.prototype.processMessage.name}`,
      );
      Logger.log(
        'original_url: ' + original_url,
        `${ConsumerService.name}.${ConsumerService.prototype.processMessage.name}`,
      );
      Logger.log(
        'createdAt: ' + created_at,
        `${ConsumerService.name}.${ConsumerService.prototype.processMessage.name}`,
      );

      const queryEndTimer =
        this.metricsService.cassandraQueryDuration.startTimer({
          operation: 'insert',
        });

      await this.cassandraService.execute(
        'INSERT INTO examples.shortened_urls (url_id, original_url, created_at) VALUES (?, ?, ?)',
        [url_id, original_url, created_at],
      );

      queryEndTimer();
      this.metricsService.cassandraQueriesTotal.inc({
        operation: 'insert',
        status: 'success',
      });

      Logger.log(
        `Successfully saved to Cassandra: ${url_id} -> ${original_url}`,
        `${ConsumerService.name}.${ConsumerService.prototype.processMessage.name}`,
      );

      this.metricsService.kafkaMessagesProcessed.inc({ status: 'success' });
      endTimer({ status: 'success' });

      return 'Message processed';
    } catch (error) {
      Logger.error(
        error,
        `${ConsumerService.name}.${ConsumerService.prototype.processMessage.name}`,
      );

      this.metricsService.kafkaMessagesProcessed.inc({ status: 'error' });
      this.metricsService.cassandraQueryErrors.inc({ operation: 'insert' });
      endTimer({ status: 'error' });

      throw error;
    }
  }

  async getAllUrls() {
    const queryEndTimer = this.metricsService.cassandraQueryDuration.startTimer(
      { operation: 'select_all' },
    );

    try {
      const result = await this.cassandraService.execute(
        'SELECT * FROM examples.shortened_urls',
      );

      queryEndTimer();
      this.metricsService.cassandraQueriesTotal.inc({
        operation: 'select_all',
        status: 'success',
      });

      return {
        count: result.rowLength,
        urls: result.rows.map((row) => ({
          url_id: row.url_id,
          original_url: row.original_url,
          created_at: row.created_at,
        })),
      };
    } catch (error) {
      queryEndTimer();
      this.metricsService.cassandraQueryErrors.inc({ operation: 'select_all' });

      Logger.error(
        error,
        `${ConsumerService.name}.${ConsumerService.prototype.getAllUrls.name}`,
      );
      throw error;
    }
  }

  async getUrlCount() {
    const queryEndTimer = this.metricsService.cassandraQueryDuration.startTimer(
      { operation: 'count' },
    );

    try {
      const result = await this.cassandraService.execute(
        'SELECT COUNT(*) as count FROM examples.shortened_urls',
      );

      queryEndTimer();
      this.metricsService.cassandraQueriesTotal.inc({
        operation: 'count',
        status: 'success',
      });

      const count = result.first()?.count?.toNumber() || 0;

      // Update the gauge with current count
      this.metricsService.cassandraRecordCount.set(count);

      return { count };
    } catch (error) {
      queryEndTimer();
      this.metricsService.cassandraQueryErrors.inc({ operation: 'count' });

      Logger.error(
        error,
        `${ConsumerService.name}.${ConsumerService.prototype.getUrlCount.name}`,
      );
      throw error;
    }
  }
}
