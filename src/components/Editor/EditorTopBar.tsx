import { Box, Flex, Spacer, Text } from '@chakra-ui/react'
import { useProjectStore } from '@/store/projectStore'
import {
  ColorModeButton,
  DarkMode,
  LightMode,
  useColorMode,
  useColorModeValue
} from "@/components/ui/color-mode"
import { LLMModelSelect } from './LLMModelSelect'

export const EditorTopBar = ({ filePath }) => {
  const project = useProjectStore(s => s.selectedProject)
  const branch = useProjectStore(s => s.selectedBranch)
  
  const fileName = filePath?.split('/').pop() || 'Untitled.md'

  return (
    <Flex
      align='center'
      justify='space-between'
      p={3}
      borderBottom='1px solid'
      borderColor='gray.200'
      _dark={{ borderColor: 'gray.700', bg: 'gray.900' }}
      bg='gray.50'
      gap={4}
    >
      {/* Left Group */}
      <Flex gap={4} align='center' wrap='wrap'>
        <Text fontWeight='bold' textStyle='sm'>
          📁 {project ? `${project.owner}/${project.repo}` : 'No project'}
        </Text>
        <Text textStyle='sm'>🌿 {branch || 'main'}</Text>
        <Text textStyle='sm'>📝 {fileName}</Text>
        <Flex align='center' gap={2}>
          <Text textStyle='sm'>🤖</Text>
          <LLMModelSelect />
        </Flex>
      </Flex>

      {/* Right-aligned */}
      <ColorModeButton />
    </Flex>
  )
}