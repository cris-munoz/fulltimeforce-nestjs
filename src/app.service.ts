import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

interface Commit {
  branchName: string;
  author: string;
  date: string;
  message: string;
}

interface BranchResponse {
  success: boolean;
  message: string;
  data: [BranchData?];
}

interface BranchData {
  name: string;
}

class MyOctokit {
  static instance: Octokit;

  private constructor() {
    console.log('constructor not implemented!');
  }

  public static getInstance(): Octokit {
    if (!MyOctokit.instance) {
      MyOctokit.instance = new Octokit({ auth: process.env.AUTH_TOKEN });
    }
    return MyOctokit.instance;
  }
}

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

  /** get all branches from the specified repository (https://api.github.com/repos/${user}/${repo})
   * @param {string=} user - username of the github account.
   * @param {string=} repo - name of the github repository.
   */
  async getBranches(user: string, repo: string): Promise<BranchResponse> {
    try {
      const octokit = MyOctokit.getInstance();
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

  /** get all the commits from the specified repository (https://api.github.com/repos/${user}/${repo})
   * @param {string=} user - username of the github account.
   * @param {string=} repo - name of the github repository.
   */
  async getRepoCommits(user: string, repo: string): Promise<[Commit?]> {
    try {
      const octokit = MyOctokit.getInstance();

      const branches = await this.getBranches(user, repo); // get all branches from repo

      if (!branches.success) throw new Error(branches.message);

      const commitArray: [Commit?] = []; // initialize array to store commits data

      const { data: branchData } = branches;
      for (let i = 0; i < branchData.length; i++) {
        //iterate through all branches to find commits data
        const { name } = branchData[i];
        const requestParameters = {
          owner: user,
          repo,
          sha: name,
        };

        const commitList = await octokit.repos.listCommits(requestParameters); //get all commits from current branch

        const { data } = commitList;

        data.forEach((element) => {
          // add every commit to commits array
          const commitData: Commit = {
            branchName: name,
            date: element.commit.committer.date,
            author: element.commit.committer.name,
            message: element.commit.message,
          };
          commitArray.push(commitData); // add the newly created object to response array
        });
      }

      return commitArray;
    } catch (err) {
      return err.stack;
    }
  }
}
