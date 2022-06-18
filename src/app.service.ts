import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

interface CommitData {
  branchName: string;
  commits: [object?];
}

interface BranchResponse {
  success: boolean;
  message: string;
  data: [BranchData?];
}

interface BranchData {
  name: string;
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

  async getBranches(user: string, repo: string): Promise<BranchResponse> {
    try {
      const octokit = new Octokit();
      const { data } = await octokit.request(
        `GET https://api.github.com/repos/${user}/${repo}/branches`,
      );

      if (!data) {
        return { success: false, message: 'failed to get branches', data: [] };
      }
      return {
        success: true,
        message: 'operation successfully completed',
        data,
      };
    } catch (err) {
      return { success: false, message: err.message, data: [] };
    }
  }

  async getRepoCommits(user: string, repo: string): Promise<[CommitData?]> {
    try {
      const octokit = new Octokit();

      const branches = await this.getBranches(user, repo);

      if (!branches.success) throw new Error(branches.message);

      const commitsData: [CommitData?] = [];

      const { data: branchData } = branches;
      for (let i = 0; i < branchData.length; i++) {
        const name = branchData[i].name;
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
    } catch (err) {
      return err.stack;
    }
  }
}
