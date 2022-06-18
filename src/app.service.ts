import { Injectable } from '@nestjs/common';
// import { Octokit } from '@octokit/core';
import { Octokit } from '@octokit/rest';

interface CommitData {
  branchName: string;
  commits: [object?];
}
const REPO_COMMITS_URL =
  'https://api.github.com/repos/cris-munoz/fulltimeforce-nestjs/commits/dev';

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

    const branches = await this.getBranches();
    const commitsData = [];

    for (let i = 0; i < branches.length; i++) {
      const { name } = branches[i];
      const requestParameters = {
        owner: 'cris-munoz',
        repo: 'fulltimeforce-nestjs',
        sha: name,
      };

      const commitList = await octokit.repos.listCommits(requestParameters);

      const { data } = commitList;

      const commitDataAux: CommitData = {
        branchName: name,
        commits: [],
      };
      data.forEach((element) => {
        commitDataAux.commits.push(element.commit);
      });
      commitsData.push(commitDataAux);
    }

    return commitsData;
  }
}
