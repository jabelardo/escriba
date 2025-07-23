import { Flex, Text, Button, Dialog, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { Octokit } from "@octokit/rest";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

interface AddExistingProjectProps {
  input: string;
  setInput: (input: string) => void;
  handleAdd: () => void;
  loading: boolean;
  isValidRepoToAdd: (input: string) => boolean;
  openMissingFoldersDialog: boolean;
  setOpenMissingFoldersDialog: (open: boolean) => void;
  missing: string[];
  handleCreateFolders: () => void;
  setMissing: (missing: string[]) => void;
}

const AddExistingProject: React.FC<AddExistingProjectProps> = ({
  input,
  setInput,
  handleAdd,
  loading,
  isValidRepoToAdd,
  openMissingFoldersDialog,
  setOpenMissingFoldersDialog,
  missing,
  handleCreateFolders,
  setMissing,
}) => (
  <Flex gap="3" pt="3">
    <Flex direction="row" gap="3">
      <TextField.Root
        placeholder="owner/repo or GitHub URL"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />

      <Button
        color="teal"
        onClick={handleAdd}
        loading={loading}
        disabled={!isValidRepoToAdd(input) || loading}
      >
        Add Existing Project
      </Button>
    </Flex>
    <Dialog.Root
      open={openMissingFoldersDialog}
      onOpenChange={(e) => {
        setOpenMissingFoldersDialog(e);
      }}
    >
      <Dialog.Content>
        <Dialog.Title>Create missing folders?</Dialog.Title>
        <Dialog.Description />
        <Flex direction="column" gap="3">
          <Text>
            The repository is missing these required folders:{" "}
            <strong>{missing.join(", ")}</strong>.
          </Text>
          <Text mt="2">
            Escriba requires both <code>books/</code> and{" "}
            <code>references/</code> to function. Would you like to create them
            to continue?
          </Text>
        </Flex>
        <Flex gap="3" mt="3" justify="end">
          <Dialog.Close>
            <Button
              variant="outline"
              onClick={() => {
                setOpenMissingFoldersDialog(false);
                setMissing([]);
              }}
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            color="teal"
            ml="3"
            onClick={handleCreateFolders}
            loading={loading}
          >
            Create Folders
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  </Flex>
);

interface CreateProjectProps {
  repoName: string;
  setRepoName: (repoName: string) => void;
  handleCreate: () => void;
  loading: boolean;
  isValidRepoToCreate: (repoName: string) => boolean;
}

const CreateProject: React.FC<CreateProjectProps> = ({
  repoName,
  setRepoName,
  handleCreate,
  loading,
  isValidRepoToCreate,
}) => (
  <Flex gap="3" pt="3">
    <Flex direction="row" gap="3">
      <TextField.Root
        placeholder="New repository name"
        value={repoName}
        onChange={(e) => {
          setRepoName(e.target.value);
        }}
      />
      <Button
        color="teal"
        onClick={handleCreate}
        loading={loading}
        disabled={!isValidRepoToCreate(repoName) || loading}
      >
        Create Project
      </Button>
    </Flex>
  </Flex>
);

const AddOrCreateProjectDialog = () => {
  const token = useAuthStore((s) => s.githubToken);
  const addProject = useProjectStore((s) => s.addProject);
  const projects = useProjectStore((s) => s.projects);
  const { addNotification } = useNotificationStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [openMissingFoldersDialog, setOpenMissingFoldersDialog] =
    useState(false);
  const [repoName, setRepoName] = useState("");

  const octokit = new Octokit({
    auth: token,
  });

  const isValidRepoToAdd = (input: string) => {
    return (
      /^([\w-]+)\/([\w.-]+)$/.test(input.trim()) ||
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/.test(input.trim())
    );
  };

  const isValidRepoToCreate = (repoName: string) => {
    const repo = repoName.trim();
    return /^[\w.-]+$/.test(repo);
  };

  const parseOwnerRepo = (v: string) => {
    const m = v.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (m) {
      return [m[1], m[2]];
    }
    const parts = v.split("/");
    return parts.length === 2 ? [parts[0], parts[1]] : null;
  };

  const checkFolders = async (owner: string, repo: string) => {
    const list = ["books", "references"];
    const missingLocal: string[] = [];
    for (const folder of list) {
      try {
        await octokit.rest.repos.getContent({ owner, repo, path: folder });
      } catch {
        missingLocal.push(folder);
      }
    }
    return missingLocal;
  };

  const createGitkeep = async (owner: string, repo: string, folder: string) => {
    const path = `${folder}/.gitkeep`;
    const message = `chore: ensure ${folder}/ exists`;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: "",
      branch: "main",
    });
  };

  const handleAdd = async () => {
    setLoading(true);

    const pr = parseOwnerRepo(input.trim());
    if (!pr) {
      console.log("Invalid repo format: owner/repo or GitHub URL");
      setLoading(false);
      return;
    }

    const [owner, repo] = pr;

    try {
      await octokit.rest.repos.get({ owner, repo });
    } catch (err: any) {
      console.log("GitHub error:", err);
      const errorMessage = err?.response?.data?.message
        ? err?.response?.data?.message + `: ${owner}/${repo}`
        : "Unknown GitHub error";
      addNotification({
        type: "error",
        title: "Project GitHub read failed",
        message: errorMessage,
      });
      setLoading(false);
      return;
    }

    const missingFolders = await checkFolders(owner, repo);
    if (missingFolders.length > 0) {
      setMissing(missingFolders);
      setOpenMissingFoldersDialog(true);
    } else {
      const normalized = {
        owner: owner.toLowerCase(),
        repo: repo.toLowerCase(),
      };
      const exists = projects.some(
        (p) =>
          p.owner.toLowerCase() === normalized.owner &&
          p.repo.toLowerCase() === normalized.repo,
      );
      if (exists) {
        addNotification({
          type: "warning",
          title: "Project already exists",
          message: `${owner}/${repo} is already registered.`,
        });
      } else {
        addProject({ owner, repo });
        addNotification({
          type: "success",
          title: "Project added",
          message: `${owner}/${repo} has been added successfully.`,
        });
      }

      setInput("");
    }
    setLoading(false);
  };

  const handleCreateFolders = async () => {
    if (!token) {
      return;
    }
    const [owner, repo] = parseOwnerRepo(input.trim())!;
    setLoading(true);
    try {
      for (const f of missing) {
        await createGitkeep(owner, repo, f);
      }
      addProject({ owner, repo });
      addNotification({
        type: "success",
        title: "Folder creation successful",
        message: `Folders ${missing.join(", ")} have been created successfully.`,
      });
      setMissing([]);
      setOpenMissingFoldersDialog(false);
      setInput("");
    } catch (e: any) {
      addNotification({
        type: "error",
        title: "Folder creation failed",
        message: e?.response?.data?.message || e.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      // Get user info to determine repo owner
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const owner = user.login;
      const repo = repoName.trim();

      // Create the repo
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: true,
        auto_init: false,
      });

      // Create .gitkeep in books and references
      for (const folder of ["books", "references"]) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo: repo,
          path: `${folder}/.gitkeep`,
          message: `chore: add ${folder}/ folder`,
          content: "",
          branch: "main",
        });
      }

      addProject({ owner, repo: repo });
      addNotification({
        type: "success",
        title: "Project created",
        message: `${owner}/${repo} has been created and initialized successfully.`,
      });
      setRepoName("");
    } catch (e: any) {
      addNotification({
        type: "error",
        title: "Project creation failed",
        message:
          e?.response?.data?.errors?.[0]?.message ||
          e.message ||
          "Unknown error",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button size="2" variant="ghost">
            + Add / Create Project
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Manage Projects</Dialog.Title>
          <Dialog.Description />
          <Flex direction="column" gap="3">
            <AddExistingProject
              input={input}
              setInput={setInput}
              handleAdd={handleAdd}
              loading={loading}
              isValidRepoToAdd={isValidRepoToAdd}
              openMissingFoldersDialog={openMissingFoldersDialog}
              setOpenMissingFoldersDialog={setOpenMissingFoldersDialog}
              missing={missing}
              handleCreateFolders={handleCreateFolders}
              setMissing={setMissing}
            />
            <CreateProject
              repoName={repoName}
              setRepoName={setRepoName}
              handleCreate={handleCreate}
              loading={loading}
              isValidRepoToCreate={isValidRepoToCreate}
            />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button size="2">Close</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default AddOrCreateProjectDialog;
