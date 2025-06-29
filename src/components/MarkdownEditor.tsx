'use client'

import React, { useEffect } from 'react'
import ReactMde from "react-mde"
import "react-mde/lib/styles/css/react-mde-toolbar.css"
import "react-mde/lib/styles/css/react-mde.css"
import * as Showdown from "showdown"

import { useMarkdown } from "@/context/MarkdownContext";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
})

interface MarkdownEditorProps {
  isReadOnly?: boolean;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent, isReadOnly }: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write")

  // Dynamically update selectedTab based on isReadOnly
  useEffect(() => {
    setSelectedTab(isReadOnly ? "preview" : "write");
  }, [isReadOnly]);

  return (
    <div>
      <ReactMde
        value={markdownContent}
        onChange={setMarkdownContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        minEditorHeight={600}
        heightUnits="vh"
        readOnly={isReadOnly}
      />
    </div>
  )
}
