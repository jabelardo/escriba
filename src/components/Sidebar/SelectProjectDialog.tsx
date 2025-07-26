"use client";

import { Dialog, Button, Flex } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { useState } from "react";

export const SelectProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);

  const sorted = [...projects].sort((a, b) => {
    const nameA = `${a.owner}/${a.repo}`.toLowerCase();
    const nameB = `${b.owner}/${b.repo}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <Button
        size="2"
        variant="ghost"
        onClick={() => {
          setOpen(true);
        }}
      >
        Select Project
      </Button>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => {
          setOpen(e);
        }}
      >
        <Dialog.Content>
          <Dialog.Title>Select a Project</Dialog.Title>
          <Dialog.Description />
          <Flex direction="column" gap="3">
            {sorted.map((proj) => (
              <Dialog.Close key={`${proj.owner}/${proj.repo}`}>
                <Button
                  key={`${proj.owner}/${proj.repo}`}
                  variant="ghost"
                  onClick={() => {
                    selectProject(proj);
                    setOpen(false);
                  }}
                >
                  {proj.owner}/{proj.repo}
                </Button>
              </Dialog.Close>
            ))}
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                variant="solid"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
