

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
    const url = new URL(req.url);
    const ref = url.searchParams.get("ref") || undefined;

    console.log(`Fetching content for: owner=${owner}, repo=${repo}, path=${filePath}, ref=${ref}`);

    const { data } = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: filePath,
      ref: ref,
    });

    if (Array.isArray(data)) {
      // If data is an array, it means it's a directory listing
      return NextResponse.json(data);
    } else if ("content" in data && data.content !== undefined) {
      // If data is an object with content, it's a file (even if content is empty string)
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return NextResponse.json({ content, sha: data.sha });
    } else {
      // Log the data when content is not found for debugging
      console.error("Unexpected data format for file content:", data);
      return new Response("File content not found or unsupported type", { status: 404 });
    }
  } catch (error: unknown) {
    console.error("Error fetching file content:", error);
    if (error.status === 404) {
      return new Response("File not found in repository", { status: 404 });
    }
    return new Response("Error fetching file content", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: { owner: string; repo: string; path: string[] } }
) {
  const { owner, repo, path } = await context.params;
  const session = await getServerSession(authOptions);
  const { content, sha, message, directPush, branch: targetBranch } = await req.json();

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const filePath = path.join("/");

    if (directPush) {
      // Direct push to the specified branch or default branch
      const branchToPush = targetBranch || (await octokit.repos.get({ owner, repo })).data.default_branch;

      const saveResponse = await octokit.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
        path: filePath,
        message: message || `Update ${filePath}`,
        content: Buffer.from(content).toString("base64"),
        sha: sha,
        branch: branchToPush,
      });
      const updatedSha = saveResponse.data.content?.sha
      return NextResponse.json({ success: true, message: "File updated directly.", sha: updatedSha });
    } else {
      // Existing logic: Create a new branch and a pull request
      const { data: repoData } = await octokit.repos.get({
        owner: owner,
        repo: repo,
      });
      const defaultBranch = repoData.default_branch;

      const { data: refData } = await octokit.git.getRef({
        owner: owner,
        repo: repo,
        ref: `heads/${defaultBranch}`,
      });
      const latestCommitSha = refData.object.sha;

      const newBranchName = `update-${Date.now()}`;
      await octokit.git.createRef({
        owner: owner,
        repo: repo,
        ref: `refs/heads/${newBranchName}`,
        sha: latestCommitSha,
      });

      await octokit.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
        path: filePath,
        message: message || `Update ${filePath}`,
        content: Buffer.from(content).toString("base64"),
        sha: sha,
        branch: newBranchName,
      });

      const { data: pullRequest } = await octokit.pulls.create({
        owner: owner,
        repo: repo,
        title: message || `Update ${filePath}`,
        head: newBranchName,
        base: defaultBranch,
        body: `Changes for ${filePath}`,
      });

      return NextResponse.json(pullRequest);
    }
  } catch (error) {
    console.error(error);
    return new Response("Error updating file content", { status: 500 });
  }
}

