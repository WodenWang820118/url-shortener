import { NestFactory } from '@nestjs/core';
import { ConsumerModule } from './consumer.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ConsumerModule);

  // Enable CORS
  app.enableCors();

  // Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'my-kafka-consumer',
      },
    },
  });

  // Start both HTTP and microservice listeners
  await app.startAllMicroservices();
  const port = process.env['PORT'] || 3002;
  await app.listen(port);

  Logger.log(`🚀 Consumer HTTP server is running on: http://localhost:${port}`);
  Logger.log(`📨 Consumer Kafka microservice is connected`);
}
bootstrap();
