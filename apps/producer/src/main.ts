import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(ProducerModule);

  app.connectMicroservice<MicroserviceOptions>({});

  await app.startAllMicroservices();
  await app.listen(9002);
  logger.log('Producer service is listening on port 9002');
}
bootstrap();
