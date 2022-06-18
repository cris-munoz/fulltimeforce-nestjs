import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getRepoCommits(): Promise<any> {
    return this.appService.getRepoCommits(process.env.USER, process.env.REPO);
  }
}
