// hdfs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HdfsService {
  constructor(private httpService: HttpService) {}

  private baseUrl = 'http://localhost:9870/webhdfs/v1/home/guanxinwang';

  async writeFile(path: string, data: any) {
    Logger.log(`Writing to HDFS: ${path}`);
    Logger.log(JSON.stringify(data));
    const url = `${this.baseUrl}${path}?op=CREATE&overwrite=true`;

    // First, send a PUT request to create the file
    const response = await firstValueFrom(
      this.httpService.put(url, null, {
        maxRedirects: 0,
        validateStatus: (status) => status === 307,
      }),
    );

    // Get the redirect URL
    const responseeUrl = response.headers.location;
    const dataNodeUrl = this.replaceHostname(responseeUrl, 'localhost');
    Logger.log(dataNodeUrl);

    // Send the actual data to the DataNode
    await firstValueFrom(
      this.httpService.put(dataNodeUrl, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    );
  }

  async readFile(path: string): Promise<string> {
    const url = `${this.baseUrl}${path}?op=OPEN`;
    const response = await firstValueFrom(
      this.httpService.get(url, { responseType: 'text' }),
    );
    return response.data;
  }

  async appendToFile(path: string, data: string): Promise<void> {
    const url = `${this.baseUrl}${path}?op=APPEND`;

    // First, send a POST request to get the redirect
    const response = await firstValueFrom(
      this.httpService.post(url, null, {
        maxRedirects: 0,
        validateStatus: (status) => status === 307,
      }),
    );

    // Get the redirect URL
    const dataNodeUrl = response.headers.location;

    // Send the actual data to append to the DataNode
    await firstValueFrom(
      this.httpService.post(dataNodeUrl, data, {
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    );
  }

  private replaceHostname(url: string, newHostname: string) {
    const parsedUrl = new URL(url);
    parsedUrl.hostname = newHostname;
    return parsedUrl.toString();
  }
}
