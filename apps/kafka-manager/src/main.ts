import { NestFactory } from '@nestjs/core';
import { KafkaModule } from './kafka.module';

async function bootstrap() {
  const app = await NestFactory.create(KafkaModule);
  await app.listen(9000);
}
bootstrap();
