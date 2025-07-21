"use client";

import {
  Flex,
  Heading,
  Text,
  Separator,
  Button,
  Dialog,
} from "@radix-ui/themes";

import { RemoveProjectButton } from "./RemoveProjectButton";
import { SelectProjectDialog } from "./SelectProjectDialog";
import { SettingsPanel } from "../Settings/SettingsPanel";
import AddOrCreateProjectDialog from "./AddOrCreateProjectDialog";
import { ProjectTree } from "./ProjectTree";

const SettingsDialog = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button size="2" variant="ghost">
          🛠️ Settings
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="640px">
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Description />
        <SettingsPanel />
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button size="2">Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export const Sidebar = () => {
  return (
    <Flex
      width="280px"
      p="4"
      height="100%"
      align="start"
      gap="4"
      direction="column"
    >
      <Heading size="6">📚 Escriba</Heading>

      <Text mt="4">★ Project:</Text>
      <AddOrCreateProjectDialog />
      <SelectProjectDialog />
      <RemoveProjectButton />
      <Separator />
      <Text mt="4">📝 Files:</Text>
      <ProjectTree />
      <Separator />
      <SettingsDialog />
      <Button
        size="2"
        variant="ghost"
        onClick={() => {
          alert("Logout");
        }}
      >
        🔒 Logout
      </Button>
    </Flex>
  );
};
