

import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { owner: string; repo: string; path: string[] } }
) {
  const { owner, repo, path } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const filePath = path.join("/");
    const { data } = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: filePath,
    });

    if ("content" in data && data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return NextResponse.json({ content, sha: data.sha });
    } else {
      return new Response("File content not found", { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return new Response("Error fetching file content", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: { owner: string; repo: string; path: string[] } }
) {
  const { owner, repo, path } = await context.params;
  const session = await getServerSession(authOptions);
  const { content, sha, message } = await req.json();

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const filePath = path.join("/");

    // Get the default branch
    const { data: repoData } = await octokit.repos.get({
      owner: owner,
      repo: repo,
    });
    const defaultBranch = repoData.default_branch;

    // Get the latest commit SHA of the default branch
    const { data: refData } = await octokit.git.getRef({
      owner: owner,
      repo: repo,
      ref: `heads/${defaultBranch}`,
    });
    const latestCommitSha = refData.object.sha;

    // Create a new branch
    const newBranchName = `update-${Date.now()}`;
    await octokit.git.createRef({
      owner: owner,
      repo: repo,
      ref: `refs/heads/${newBranchName}`,
      sha: latestCommitSha,
    });

    // Update the file content in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: filePath,
      message: message || `Update ${filePath}`,
      content: Buffer.from(content).toString("base64"),
      sha: sha,
      branch: newBranchName,
    });

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner: owner,
      repo: repo,
      title: message || `Update ${filePath}`,
      head: newBranchName,
      base: defaultBranch,
      body: `Changes for ${filePath}`,
    });

    return NextResponse.json(pullRequest);
  } catch (error) {
    console.error(error);
    return new Response("Error updating file content", { status: 500 });
  }
}

