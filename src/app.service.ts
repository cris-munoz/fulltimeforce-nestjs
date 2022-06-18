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

  /** get all branches from the specified repository (https://api.github.com/repos/${user}/${repo})
   * @param {string=} user - username of the github account.
   * @param {string=} repo - name of the github repository.
   */
  async getBranches(user: string, repo: string): Promise<BranchResponse> {
    try {
      const octokit = new Octokit(); // instantiate the client without auth, since is a public repo
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
  async getRepoCommits(user: string, repo: string): Promise<[CommitData?]> {
    try {
      const octokit = new Octokit();

      const branches = await this.getBranches(user, repo); // get all branches from repo

      if (!branches.success) throw new Error(branches.message);

      const commitsData: [CommitData?] = []; // initialize array to store commits data

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

        const commitDataAux: CommitData = {
          // add the name of the current branch
          branchName: name,
          commits: [],
        };
        data.forEach((element) => {
          // add every commit to commits array
          commitDataAux.commits.push(element.commit);
        });
        commitsData.push(commitDataAux); // add the newly created object to response array
      }

      return commitsData;
    } catch (err) {
      return err.stack;
    }
  }
}
