import { Module } from '@nestjs/common';
import { KafkaAdminController } from './kafka-admin.controller';
import { KafkaAdminService } from './kafka-admin.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.KAFKA,
        options: {
          producerOnlyMode: true,
          client: {
            clientId: 'admin',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [KafkaAdminController],
  providers: [KafkaAdminService],
})
export class KafkaAdminModule {}
