'use client'

import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor'
import { EditorTopBar } from './EditorTopBar'

import '@mdxeditor/editor/style.css'

export const EditorPanel = () => {
  const selectedFile = useProjectStore(s => s.selectedFile)
  const setSelectedFile = useProjectStore(s => s.setSelectedFile)

  // TEMPORARY: this will eventually load from GitHub
  const [value, setValue] = useState<string>('# Welcome to Escriba\n\nThis is your test document.')

  return (
    <Flex direction='column' h='100%' overflow='hidden'>
      <EditorTopBar
        filePath={selectedFile}
      />
      <Box flex='1' overflow='auto' p={2}>
        <MDXEditor
          markdown={value}
          onChange={setValue}
          plugins={[headingsPlugin()]}
        />
      </Box>
    </Flex>
  )
}