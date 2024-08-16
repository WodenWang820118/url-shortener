import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HdfsModule } from './hdfs/hdfs.module';
import { CassandraModule } from './cassandra/cassandra.module';
import { CassandraService } from './cassandra/cassandra.service';

@Module({
  imports: [
    HdfsModule,
    CassandraModule,
    ClientsModule.register([
      {
        name: 'EXAMPLE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'example-consumer',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'example-consumer-group',
          },
        },
      },
    ]),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService, CassandraService],
})
export class ConsumerModule {}
