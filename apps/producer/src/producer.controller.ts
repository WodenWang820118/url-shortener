import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ShortenUrlDto, ShortenUrlResponseDto } from './dto/shorten-url.dto';

@Controller()
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('api/shorten')
  async shortenUrl(@Body() dto: ShortenUrlDto): Promise<ShortenUrlResponseDto> {
    return await this.producerService.shortenUrl(dto.longUrl);
  }

  @Post('producer/:topic')
  async sendMessage(@Param('topic') topic: string, @Body() message: any) {
    return await this.producerService.publish(topic, message);
  }
}
