import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ProducerService implements OnModuleInit {
  // see the corresponding client avaiable in the module.ts file
  constructor(
    @Inject('HERO_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Need to subscribe to topic
    // so that we can get the response from Kafka microservice
    this.kafkaClient.subscribeToResponseOf('hero.kill.dragon');
    await this.kafkaClient.connect();
  }

  // sendMessage(message: any) {
  //   return this.kafkaClient.send('hero.kill.dragon', message);
  // }
}
