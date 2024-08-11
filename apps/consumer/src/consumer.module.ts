import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
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
  providers: [ConsumerService],
})
export class ConsumerModule {}
