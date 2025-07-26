"use client";

import { Dialog, Button, Flex, Select } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { useEffect, useState } from "react";
import { getBranches } from "@/lib/github/branches";
import { useAuthStore } from "@/store/authStore";

export const SelectProjectDialog = () => {
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);
  const setSelectedBranch = useProjectStore((s) => s.setSelectedBranch);
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const selectedBranch = useProjectStore((s) => s.selectedBranch);
  const token = useAuthStore((s) => s.githubToken);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranchLocal, setSelectedBranchLocal] = useState<string>("");

  useEffect(() => {
    if (selectedProject && token) {
      getBranches(token, selectedProject.owner, selectedProject.repo).then(
        (branches) => {
          setBranches(branches);
          if (branches.includes(selectedBranch || "main")) {
            setSelectedBranchLocal(selectedBranch || "main");
          } else if (branches.length > 0) {
            setSelectedBranchLocal(branches[0]);
          }
        },
      );
    }
  }, [selectedProject, selectedBranch, token]);

  const sortedProjects = [...projects].sort((a, b) => {
    const nameA = `${a.owner}/${a.repo}`.toLowerCase();
    const nameB = `${b.owner}/${b.repo}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleProjectChange = (projectString: string) => {
    const [owner, repo] = projectString.split("/");
    const project = projects.find((p) => p.owner === owner && p.repo === repo);
    if (project) {
      selectProject(project);
    }
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranchLocal(branch);
  };

  const handleConfirm = () => {
    if (selectedProject) {
      setSelectedBranch(selectedBranchLocal);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button size="2" variant="ghost">
          Select Project and Branch
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Select a Project and Branch</Dialog.Title>
        <Dialog.Description />
        <Flex direction="column" gap="3">
          <Select.Root
            onValueChange={handleProjectChange}
            defaultValue={
              selectedProject
                ? `${selectedProject.owner}/${selectedProject.repo}`
                : ""
            }
          >
            <Select.Trigger placeholder="Select a project…" />
            <Select.Content>
              {sortedProjects.map((proj) => (
                <Select.Item
                  key={`${proj.owner}/${proj.repo}`}
                  value={`${proj.owner}/${proj.repo}`}
                >
                  {proj.owner}/{proj.repo}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          {selectedProject && (
            <Select.Root
              onValueChange={handleBranchChange}
              value={selectedBranchLocal}
            >
              <Select.Trigger placeholder="Select a branch…" />
              <Select.Content>
                {branches.map((branch) => (
                  <Select.Item key={branch} value={branch}>
                    {branch}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="outline" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleConfirm}>Confirm</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
