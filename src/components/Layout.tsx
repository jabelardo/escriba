import { Box, Flex } from "@chakra-ui/react";
import { Sidebar } from "./Sidebar/Sidebar";
import { EditorPanel } from "./Editor/EditorPanel";

export const Layout = () => {
  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Box flex="1" bg="gray.50" _dark={{ bg: "gray.900" }}>
        <EditorPanel />
      </Box>
    </Flex>
  )
}
