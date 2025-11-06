# Backend Integration Guide

This guide shows how to integrate the frontend with the producer backend service.

## Overview

The frontend expects the producer service to provide an API endpoint for URL shortening:

- **Endpoint**: `POST /api/shorten`
- **Port**: 3000
- **Content-Type**: `application/json`

## Required Producer Endpoint

### Request

```typescript
POST http://localhost:3000/api/shorten

Body:
{
  "longUrl": "https://example.com/very-long-url"
}
```

### Response

```typescript
{
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-11-06T03:00:00.000Z"
}
```

## Example NestJS Implementation

Here's how to implement the endpoint in the producer service:

### 1. Create DTO (Data Transfer Objects)

```typescript
// apps/producer/src/dto/shorten-url.dto.ts

export class ShortenUrlDto {
  longUrl: string;
}

export class ShortenUrlResponseDto {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
}
```

### 2. Add Controller Method

```typescript
// apps/producer/src/producer.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ShortenUrlDto, ShortenUrlResponseDto } from './dto/shorten-url.dto';

@Controller('api')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('shorten')
  async shortenUrl(@Body() dto: ShortenUrlDto): Promise<ShortenUrlResponseDto> {
    return await this.producerService.shortenUrl(dto.longUrl);
  }
}
```

### 3. Add Service Logic

```typescript
// apps/producer/src/producer.service.ts

import { Injectable } from '@nestjs/common';
import { ShortenUrlResponseDto } from './dto/shorten-url.dto';

@Injectable()
export class ProducerService {
  /**
   * Generate a short code for the URL
   * This is a simple example - in production, you'd want:
   * - Check for existing URLs in the database
   * - Use a proper hash function (MD5, SHA256)
   * - Handle collisions
   * - Store in Cassandra/database
   */
  private generateShortCode(url: string): string {
    // Simple random code generator for demo
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async shortenUrl(longUrl: string): Promise<ShortenUrlResponseDto> {
    // Generate short code
    const shortCode = this.generateShortCode(longUrl);

    // TODO: Store in Cassandra database
    // await this.cassandraService.saveUrl(shortCode, longUrl);

    // TODO: Publish to Kafka for async processing
    // await this.kafkaService.publish('url-shortened', { shortCode, longUrl });

    return {
      shortUrl: `http://localhost:3000/${shortCode}`,
      shortCode,
      originalUrl: longUrl,
      createdAt: new Date().toISOString(),
    };
  }
}
```

### 4. Enable CORS

Add CORS configuration to allow frontend requests:

```typescript
// apps/producer/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

## Advanced Implementation Ideas

### 1. Hash-Based Short Codes

```typescript
import { createHash } from 'crypto';

private generateShortCode(url: string): string {
  const hash = createHash('md5').update(url).digest('hex');
  return hash.substring(0, 6); // Take first 6 characters
}
```

### 2. Database Storage (Cassandra)

```typescript
async shortenUrl(longUrl: string): Promise<ShortenUrlResponseDto> {
  // Check if URL already exists
  const existing = await this.cassandraService.findByUrl(longUrl);
  if (existing) {
    return this.formatResponse(existing);
  }

  // Generate and save new short code
  const shortCode = this.generateShortCode(longUrl);
  await this.cassandraService.saveUrl({
    shortCode,
    originalUrl: longUrl,
    createdAt: new Date(),
  });

  return this.formatResponse({ shortCode, originalUrl: longUrl });
}
```

### 3. Kafka Integration

```typescript
async shortenUrl(longUrl: string): Promise<ShortenUrlResponseDto> {
  const shortCode = this.generateShortCode(longUrl);

  // Publish to Kafka for async processing
  await this.kafkaProducer.send({
    topic: 'url-shortened',
    messages: [
      {
        value: JSON.stringify({
          shortCode,
          originalUrl: longUrl,
          createdAt: new Date().toISOString(),
        }),
      },
    ],
  });

  return {
    shortUrl: `http://localhost:3000/${shortCode}`,
    shortCode,
    originalUrl: longUrl,
    createdAt: new Date().toISOString(),
  };
}
```

### 4. Redirect Endpoint

Add a redirect endpoint to handle shortened URLs:

```typescript
@Controller()
export class ProducerController {
  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const url = await this.producerService.getOriginalUrl(shortCode);

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return res.redirect(url);
  }
}
```

## Testing the Integration

### 1. Manual Testing with cURL

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com/very-long-url"}'
```

### 2. Test from Frontend

1. Start the producer service: `pnpm run dev:producer`
2. Start the frontend: `pnpm run dev:frontend`
3. Open `http://localhost:4200`
4. Enter a long URL and click "Shorten URL"

### 3. Test Redirect

After shortening a URL:

```bash
curl -L http://localhost:3000/abc123
# Should redirect to the original URL
```

## Error Handling

Add proper error handling in the producer:

```typescript
@Post('shorten')
async shortenUrl(@Body() dto: ShortenUrlDto): Promise<ShortenUrlResponseDto> {
  try {
    // Validate URL format
    new URL(dto.longUrl);

    return await this.producerService.shortenUrl(dto.longUrl);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new BadRequestException('Invalid URL format');
    }
    throw new InternalServerErrorException('Failed to shorten URL');
  }
}
```

## Environment Configuration

Create a `.env` file for the producer:

```env
PORT=3000
FRONTEND_URL=http://localhost:4200
BASE_URL=http://localhost:3000

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=url-shortened

# Cassandra
CASSANDRA_CONTACT_POINTS=localhost
CASSANDRA_PORT=9042
CASSANDRA_KEYSPACE=url_shortener
```

## Next Steps

1. Implement the `/api/shorten` endpoint in the producer service
2. Add Cassandra database storage
3. Integrate Kafka for async processing
4. Add the redirect endpoint (GET /:shortCode)
5. Test the full flow
6. Add analytics tracking
7. Implement rate limiting
8. Add URL validation and sanitization

## Complete Flow

```
User (Frontend)
  ↓
  1. Enter long URL
  ↓
  2. POST /api/shorten
  ↓
Producer Service
  ↓
  3. Generate short code
  ↓
  4. Save to Cassandra
  ↓
  5. Publish to Kafka
  ↓
Consumer Service
  ↓
  6. Process analytics
  ↓
  7. Store in HDFS
  ↓
Frontend
  ↓
  8. Display short URL + QR code
```

## Troubleshooting

### CORS Issues

- Ensure CORS is enabled in the producer
- Check that the frontend URL matches the CORS origin

### Connection Refused

- Verify producer is running on port 3000
- Check firewall settings
- Ensure no other service is using port 3000

### Invalid Response

- Check producer endpoint returns correct JSON structure
- Verify response includes all required fields
- Check for proper error handling
