
'use client'

import React from 'react'
import ReactMde from "react-mde"
import "react-mde/lib/styles/css/react-mde-toolbar.css"
import "react-mde/lib/styles/css/react-mde.css"
import * as Showdown from "showdown"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
})

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">(
    "write"
  )

  return (
    <ReactMde
      value={value}
      onChange={onChange}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      generateMarkdownPreview={(markdown) =>
        Promise.resolve(converter.makeHtml(markdown))
      }
      minEditorHeight={600}
      heightUnits="vh"
    />
  )
}
