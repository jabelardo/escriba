import { Box, Flex, Text, Input, Button, Spacer } from '@chakra-ui/react';
import { useState } from 'react';
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export const EditorPanel = () => {
  const [value, setValue] = useState<string>('# Welcome to Escriba\n\nThis is your test document.');
  const [filename, setFilename] = useState('intro.md');

  return (
    <Flex direction='column' h='100%'>
      {/* Toolbar */}
      <Flex align='center' p={2} bg='gray.200' _dark={{ bg: 'gray.700' }} gap={2}>
        <Text fontWeight='bold'>File:</Text>
        <Input value={filename} onChange={(e) => setFilename(e.target.value)} size='sm' />
        <Spacer />
        <Button size='sm' colorScheme='teal'>Save</Button>
      </Flex>

      {/* Editor */}
      <Box flex='1' overflow='auto' p={2}>
        <MDXEditor markdown={value} plugins={[headingsPlugin()]} />
      </Box>
    </Flex>
  )
}
