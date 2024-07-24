import { NestFactory } from '@nestjs/core';
import { KafkaManagerModule } from './kafka-manager.module';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    KafkaManagerModule,
  );
  await app.listen();
}
bootstrap();
