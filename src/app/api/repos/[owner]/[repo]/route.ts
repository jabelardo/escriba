
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
    const { data } = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: "",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return new Response("Error fetching repository contents", { status: 500 });
  }
}
