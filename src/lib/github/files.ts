import { Octokit } from "@octokit/rest";
import { useProjectStore } from "@/store/projectStore";

export async function fetchProjectFileContent(
  auth: string,
  owner: string,
  repo: string,
  path: string,
  branch = "main",
): Promise<any> {
  const octokit = new Octokit({ auth });
  const res = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  if (!("content" in res.data) || typeof res.data.content !== "string") {
    throw new Error(`Invalid file response for ${path}`);
  }

  const decoded = atob(res.data.content);
  const content = new TextDecoder("utf-8").decode(
    Uint8Array.from([...decoded].map((char) => char.charCodeAt(0))),
  );

  return {
    content: content ?? "",
    sha: res.data.sha,
  };
}

export async function saveProjectFileContent({
  auth,
  owner,
  repo,
  path,
  content,
  message,
  sha,
  branch = "main",
}: {
  auth: string;
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  sha: string;
  branch?: string;
}) {
  const contentEncoded = bytesToBase64(new TextEncoder().encode(content));
  const octokit = new Octokit({ auth });
  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: contentEncoded,
    sha,
  });
  const newSha = result.data.content?.sha;
  if (newSha) {
    useProjectStore.getState().setSelectedFileSha(newSha);
  }
  return result;
}

function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

export async function createProjectFile({
  auth,
  owner,
  repo,
  path,
  content,
  message,
  branch = "main",
}: {
  auth: string;
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
}) {
  const contentEncoded = bytesToBase64(new TextEncoder().encode(content));
  const octokit = new Octokit({ auth });
  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: contentEncoded,
  });
  return result;
}
