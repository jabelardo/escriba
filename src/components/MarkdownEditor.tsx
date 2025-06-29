'use client'

import React, { useEffect } from 'react'
import ReactMde from "react-mde"
import * as Showdown from "showdown"
import 'react-mde/lib/styles/css/react-mde-all.css';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
})

interface MarkdownEditorProps {
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
}

export default function MarkdownEditor({ markdownContent, setMarkdownContent }: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write")

  
  const getEditorHeight = () => {
    // Adjust this offset based on your layout (e.g., header, footer, padding)
    const offset = 150;
    const editorHeight = window.innerHeight - offset;
    return editorHeight;
  };

  const [editorHeight, setEditorHeight] = React.useState(getEditorHeight());

  useEffect(() => {
    const calculateEditorHeight = () => {
      setEditorHeight(getEditorHeight());
    };

    // Set initial height
    calculateEditorHeight();

    // Add event listener for window resize
    window.addEventListener('resize', calculateEditorHeight);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', calculateEditorHeight);
    };
  }, []);

  return (
      <ReactMde
        value={markdownContent}
        onChange={setMarkdownContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        initialEditorHeight={editorHeight}
        minEditorHeight={editorHeight}
        minPreviewHeight={editorHeight}
        maxEditorHeight={editorHeight}
      />
  )
}
