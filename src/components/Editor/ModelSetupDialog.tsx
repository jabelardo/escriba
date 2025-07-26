import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useProjectStore } from "@/store/projectStore";
import { LLMModelSelect } from "./LLMModelSelect";

export const ModelSetupDialog = () => {
  const temperature =
    useProjectStore((s) => s.selectedProject?.temperature) || 1.0;
  const setTemperature = useProjectStore((s) => s.setTemperature);
  const maxTokens = useProjectStore((s) => s.selectedProject?.maxTokens) || 512;
  const setMaxTokens = useProjectStore((s) => s.setMaxTokens);

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft">Configure Model</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Configure Model</Dialog.Title>
        <Dialog.Description />
        <Flex direction="column" gap="3">
          <Text as="label">Model</Text>
          <LLMModelSelect />

          <Text as="label">Temperature</Text>
          <TextField.Root
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            step={0.1}
            min={0}
            max={1}
          />

          <Text as="label">Max Tokens</Text>
          <TextField.Root
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            step={1}
            min={1}
          />
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
