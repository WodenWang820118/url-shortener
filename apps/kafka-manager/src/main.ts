import { NestFactory } from '@nestjs/core';
import { KafkaManagerModule } from './kafka-manager.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(KafkaManagerModule);
  app.connectMicroservice<MicroserviceOptions>({});
  await app.listen(9000);
}
bootstrap();
