
import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { projectName } = await req.json();

  if (!session || !session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const octokit = new Octokit({
    auth: session.accessToken,
  });

  try {

    console.log("Session user username:", session.user?.username);
    
    const repo = await octokit.repos.createForAuthenticatedUser({
      name: `${projectName}`,
      private: true,
    });

    console.log("Session user username:", session.user?.username);
    console.log("Repo name:", repo.data.name);

    await octokit.repos.createOrUpdateFileContents({
      owner: session.user?.username as string,
      repo: repo.data.name,
      path: "books/.gitkeep",
      message: "Initial commit",
      content: "",
    });

    console.log("Session user username:", session.user?.username);
    console.log("Repo name:", repo.data.name); 

    await octokit.repos.createOrUpdateFileContents({
      owner: session.user?.username as string,
      repo: repo.data.name,
      path: "references/.gitkeep",
      message: "Initial commit",
      content: "",
    });

    return NextResponse.json(repo.data);
  } catch (error) {
    console.error(error);
    return new Response("Error creating repository", { status: 500 });
  }
}
