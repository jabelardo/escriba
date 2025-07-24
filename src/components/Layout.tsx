"use client";

import { Flex, Portal } from "@radix-ui/themes";
import { Sidebar } from "./Sidebar/Sidebar";
import { EditorPanel } from "./Editor/EditorPanel";
import ErrorBoundary from "./ErrorBoundary";
import { RealmProvider } from "@mdxeditor/editor";

import { NotificationProvider } from "./ui/Notification";

export const Layout = () => {
  return (
    <>
      <ErrorBoundary>
        <Flex height="100vh" overflow="hidden" direction="row">
          <Sidebar />
          <RealmProvider>
            <EditorPanel />
          </RealmProvider>
        </Flex>
        <Portal>
          <NotificationProvider />
        </Portal>
      </ErrorBoundary>
    </>
  );
};
