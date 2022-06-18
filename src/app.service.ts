import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/core';

const REPO_COMMITS_URL =
  'https://api.github.com/repos/cris-munoz/fulltimeforce-nestjs/commits';

const REPO_BRANCHES_URL =
  'https://api.github.com/repos/cris-munoz/fulltimeforce-nestjs/branches';

@Injectable()
export class AppService {
  getRepoCommitsV0(): any {
    return fetch(REPO_COMMITS_URL)
      .then((response) => response.json())
      .then((response) => {
        const formatResponse = [];
        response.forEach((res, index) => {
          const isEven = index % 2 === 1;
          const commit = `aaa<p style="color:${
            isEven ? '#FF0000' : '#00FF00'
          }";>${JSON.stringify(res.commit)}</p>`;
          formatResponse.push(commit);
        });
        return formatResponse.toString();
      });
  }

  async getBranches(): Promise<any> {
    const octokit = new Octokit();
    const { data } = await octokit.request(`GET ${REPO_BRANCHES_URL}`);

    return data;
  }

  async getRepoCommits(): Promise<any> {
    const octokit = new Octokit();
    const { data } = await octokit.request(`GET ${REPO_COMMITS_URL}`);

    const branches = await this.getBranches();
    console.log(
      '🚀 ~ file: app.service.ts ~ line 40 ~ AppService ~ getRepoCommits ~ branches',
      branches,
    );

    const formatResponse = [];
    data.forEach((res, index) => {
      const isEven = index % 2 === 1;
      const commit = `<p style="color:${
        isEven ? '#FF0000' : '#00FF00'
      }";>${JSON.stringify(res.commit)}</p>`;
      formatResponse.push(commit);
    });
    return formatResponse.toString();
  }
}
