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
      <Flex height="100vh" overflow="hidden" direction="row">
        <ErrorBoundary>
          <Sidebar />
          <RealmProvider>
            <EditorPanel />
          </RealmProvider>
        </ErrorBoundary>
      </Flex>
      <Portal>
        <NotificationProvider />
      </Portal>
    </>
  );
};
