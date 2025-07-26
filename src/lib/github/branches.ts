import { Octokit } from "@octokit/rest";

export async function getBranches(
  auth: string,
  owner: string,
  repo: string,
): Promise<string[]> {
  const octokit = new Octokit({ auth });
  const branches = await octokit.request("GET /repos/{owner}/{repo}/branches", {
    owner,
    repo,
  });
  return branches.data.map((branch: any) => branch.name);
}
