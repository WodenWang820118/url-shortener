import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);

  app.connectMicroservice<MicroserviceOptions>({});

  await app.startAllMicroservices();
  await app.listen(9002);
}
bootstrap();
