import { Injectable } from '@nestjs/common';

const REPO_COMMITS_URL =
  'https://api.github.com/repos/cris-munoz/fulltimeforce-nestjs/commits';
@Injectable()
export class AppService {
  getRepoCommits(): any {
    return fetch(REPO_COMMITS_URL)
      .then((response) => response.json())
      .then((response) => {
        return response;
      });
  }
}
