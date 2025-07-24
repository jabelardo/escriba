import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";

export const RemoveProjectButton = () => {
  const project = useProjectStore((s) => s.selectedProject);
  const removeProject = useProjectStore((s) => s.removeProject);

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button size="2" color="red" variant="ghost" disabled={!project}>
          🗑️ Remove Current Project
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Remove Current Project</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This project will no longer be accessible unless you
          re-add it.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={() => {
                if (project) {removeProject(project);}
              }}
            >
              Remove Current Project
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
