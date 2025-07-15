'use client'

import { Flex } from "@radix-ui/themes";
import { Sidebar } from "./Sidebar/Sidebar";
import { EditorPanel } from "./Editor/EditorPanel";

export const Layout = () => {
    return (
      <Flex height="100vh" overflow="hidden" direction="row">
        <Sidebar />
        <EditorPanel />
      </Flex>
    )
  }