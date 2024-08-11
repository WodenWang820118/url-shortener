import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          producerOnlyMode: true,
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
})
export class ProducerModule {}
