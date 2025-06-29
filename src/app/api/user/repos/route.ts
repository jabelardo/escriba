
import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.user?.username) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      type: "owner",
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error(error);
    return new Response("Error fetching repositories", { status: 500 });
  }
}
