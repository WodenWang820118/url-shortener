export class ShortenUrlDto {
  longUrl: string;
}

export class ShortenUrlResponseDto {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
}
