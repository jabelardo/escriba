import { Octokit } from "@octokit/rest";

export async function getBranches(
  auth: string,
  owner: string,
  repo: string,
): Promise<string[]> {
  const octokit = new Octokit({ auth });
  const branches = await octokit.repos.listBranches({
    owner,
    repo,
  });
  return branches.data.map((branch: { name: string }) => branch.name);
}
