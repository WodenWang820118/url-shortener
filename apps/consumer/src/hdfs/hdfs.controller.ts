// hdfs.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HdfsService } from './hdfs.service';

@Controller('hdfs')
export class HdfsController {
  constructor(private readonly hdfsService: HdfsService) {}

  @Post('write')
  async writeToHdfs(@Body() body: { path: string; data: string }) {
    await this.hdfsService.writeFile(body.path, body.data);
    return { message: 'File written successfully' };
  }

  @Get('read/:path')
  async readFromHdfs(@Param('path') path: string) {
    const data = await this.hdfsService.readFile(path);
    return { data };
  }

  @Post('append')
  async appendToHdfs(@Body() body: { path: string; data: string }) {
    await this.hdfsService.appendToFile(body.path, body.data);
    return { message: 'Data appended successfully' };
  }
}
