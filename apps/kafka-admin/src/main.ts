import { NestFactory } from '@nestjs/core';
import { KafkaAdminModule } from './kafka-admin.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(KafkaAdminModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'example-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(9000);
}
bootstrap();
