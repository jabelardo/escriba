import { Octokit } from "@octokit/rest";

export interface FileTreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileTreeNode[];
}

export async function fetchProjectFileTree(
  auth: string,
  owner: string,
  repo: string,
  path = "",
): Promise<FileTreeNode[]> {
  const octokit = new Octokit({ auth });
  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  const entries = Array.isArray(response.data)
    ? response.data
    : [response.data];

  const sortedEntries = entries.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "dir" ? -1 : 1;
  });

  const result: FileTreeNode[] = await Promise.all(
    sortedEntries
      .filter((item) => item.name !== ".gitkeep")
      .map(async (item) => {
        if (item.type === "dir") {
          const children = await fetchProjectFileTree(
            auth,
            owner,
            repo,
            item.path,
          );
          return {
            id: item.path,
            name: item.name,
            type: "folder",
            children,
          };
        } else {
          return {
            id: item.path,
            name: item.name,
            type: "file",
          };
        }
      }),
  );

  return result;
}
