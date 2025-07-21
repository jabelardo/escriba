import React, { useState } from "react";
import { Dialog, Flex, Button, TextField, Text } from "@radix-ui/themes";

interface CreateFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (filename: string) => void;
}

export const CreateFileDialog: React.FC<CreateFileDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [filename, setFilename] = useState("");

  const handleCreate = () => {
    if (filename) {
      onCreate(filename);
      setFilename("");
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Create New File</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Enter a name for the new file.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Filename
            </Text>
            <TextField.Root
              value={filename}
              onChange={(e) => {
                setFilename(e.target.value);
              }}
              placeholder="e.g., new-file.txt"
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleCreate}>Create</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
