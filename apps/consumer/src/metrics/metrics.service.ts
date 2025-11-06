import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  // Counters
  public readonly kafkaMessagesProcessed: Counter;
  public readonly cassandraQueriesTotal: Counter;
  public readonly cassandraQueryErrors: Counter;
  public readonly hdfsOperationsTotal: Counter;

  // Histograms (for latency measurements)
  public readonly kafkaProcessingDuration: Histogram;
  public readonly cassandraQueryDuration: Histogram;
  public readonly hdfsOperationDuration: Histogram;

  // Gauges
  public readonly cassandraRecordCount: Gauge;

  constructor() {
    // Register counters
    this.kafkaMessagesProcessed = new Counter({
      name: 'kafka_messages_processed_total',
      help: 'Total number of Kafka messages processed',
      labelNames: ['status'],
    });

    this.cassandraQueriesTotal = new Counter({
      name: 'cassandra_queries_total',
      help: 'Total number of Cassandra queries executed',
      labelNames: ['operation', 'status'],
    });

    this.cassandraQueryErrors = new Counter({
      name: 'cassandra_query_errors_total',
      help: 'Total number of Cassandra query errors',
      labelNames: ['operation'],
    });

    this.hdfsOperationsTotal = new Counter({
      name: 'hdfs_operations_total',
      help: 'Total number of HDFS operations',
      labelNames: ['operation', 'status'],
    });

    // Register histograms
    this.kafkaProcessingDuration = new Histogram({
      name: 'kafka_message_processing_duration_seconds',
      help: 'Duration of Kafka message processing',
      labelNames: ['status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    });

    this.cassandraQueryDuration = new Histogram({
      name: 'cassandra_query_duration_seconds',
      help: 'Duration of Cassandra queries',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    this.hdfsOperationDuration = new Histogram({
      name: 'hdfs_operation_duration_seconds',
      help: 'Duration of HDFS operations',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
    });

    // Register gauges
    this.cassandraRecordCount = new Gauge({
      name: 'cassandra_record_count',
      help: 'Current number of records in Cassandra',
    });
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJson() {
    const metrics = await register.getMetricsAsJSON();
    return metrics;
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clearMetrics() {
    register.clear();
  }
}
