'use client'

import { Flex } from "@radix-ui/themes";
import { Sidebar } from "./Sidebar/Sidebar";
import { EditorPanel } from "./Editor/EditorPanel";
import ErrorBoundary from "./ErrorBoundary";
import { RealmProvider } from "@mdxeditor/editor";

export const Layout = () => {
    return (
      <Flex height="100vh" overflow="hidden" direction="row">
        <ErrorBoundary>
        <Sidebar />
        <RealmProvider>
          <EditorPanel />
        </RealmProvider>
        </ErrorBoundary>
      </Flex>
    )
  }