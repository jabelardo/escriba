import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo,
    });
    return NextResponse.json(branches);
  } catch (error) {
    console.error(error);
    return new Response("Error fetching branches", { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = await context.params;
  const session = await getServerSession(authOptions);
  const { newBranchName, baseBranch } = await req.json();

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    // Get the SHA of the base branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });
    const baseBranchSha = refData.object.sha;

    // Create the new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: baseBranchSha,
    });

    return NextResponse.json({ success: true, message: `Branch ${newBranchName} created.` });
  } catch (error) {
    console.error(error);
    return new Response("Error creating branch", { status: 500 });
  }
}
