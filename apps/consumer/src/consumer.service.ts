import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { HdfsService } from './hdfs/hdfs.service';
import { CassandraService } from './cassandra/cassandra.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  // see the corresponding client avaiable in the module.ts file
  constructor(
    @Inject('EXAMPLE_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly hdfsService: HdfsService,
    private readonly cassandraService: CassandraService,
  ) {}

  async onModuleInit() {
    // Need to subscribe to topic
    // so that we can get the response from Kafka microservice
    // The topic will be automatically created if it doesn't exist
    this.kafkaClient.subscribeToResponseOf('example_topic');
    await this.kafkaClient.connect();
  }

  async processMessage(message: any) {
    try {
      const { url_id, original_url } = message;
      const created_at = new Date();

      Logger.log(
        'url_id: ' + url_id,
        ConsumerService.prototype.processMessage.name,
      );
      Logger.log(
        'original_url: ' + original_url,
        ConsumerService.prototype.processMessage.name,
      );
      Logger.log(
        'createdAt: ' + created_at,
        ConsumerService.prototype.processMessage.name,
      );

      await this.cassandraService.execute(
        'INSERT INTO examples.shortened_urls (url_id, original_url, created_at) VALUES (?, ?, ?)',
        [url_id, original_url, created_at],
      );
      return 'Message processed';
    } catch (error) {
      Logger.error('Error processing message', error);
      throw error;
    }
  }
}
