import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @Render('index')
  async root(): Promise<any> {
    const githubData = await this.appService.getRepoCommits(
      process.env.GIT_USER,
      process.env.GIT_REPO,
    );
    return { githubData: JSON.stringify(githubData) };
  }
}
