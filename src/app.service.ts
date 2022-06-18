import { Injectable } from '@nestjs/common';
// import { Octokit } from '@octokit/core';
import { Octokit } from '@octokit/rest';

interface CommitData {
  branchName: string;
  commits: [object?];
}

// const USER = 'cris-munoz';
// const REPO = 'fulltimeforce-nestjs';

@Injectable()
export class AppService {
  getRepoCommitsV0(): any {
    return fetch(
      'https://api.github.com/repos/cris-munoz/fulltimeforce-nestjs/commits/dev',
    )
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

  async getBranches(user: string, repo: string): Promise<any> {
    const octokit = new Octokit();
    const { data } = await octokit.request(
      `GET https://api.github.com/repos/${user}/${repo}/branches`,
    );

    return data;
  }

  async getRepoCommits(user: string, repo: string): Promise<any> {
    const octokit = new Octokit();

    const branches = await this.getBranches(user, repo);
    const commitsData = [];

    for (let i = 0; i < branches.length; i++) {
      const { name } = branches[i];
      const requestParameters = {
        owner: user,
        repo,
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
