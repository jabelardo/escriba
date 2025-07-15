import { Flex, Text } from '@radix-ui/themes'
import { useProjectStore } from '@/store/projectStore'
import { LLMModelSelect } from './LLMModelSelect'
import { ThemeToggleButton } from '../ui/ThemeToggleButton'

interface EditorTopBarProps {
  filePath?: string
}

export const EditorTopBar = ({ filePath  }: EditorTopBarProps) => {
  const project = useProjectStore(s => s.selectedProject)
  const branch = useProjectStore(s => s.selectedBranch)
  
  const fileName = filePath?.split('/').pop() || 'Untitled.md'

  return (
    <Flex
      align='center'
      justify="between"
      p="3"
      gap="4"
    >
      {/* Left Group */}
      <Flex gap="4" align='center' wrap='wrap'>
        <Text size="2">
          📁 {project ? `${project.owner}/${project.repo}` : 'No project'}
        </Text>
        <Text size="2">🌿 {branch || 'main'}</Text>
        <Text size="2">📝 {fileName}</Text>
        <Flex align='center' gap="2">
          <Text size="2">🤖</Text>
          <LLMModelSelect />
        </Flex>
      </Flex>

      {/* Right-aligned */}
      <ThemeToggleButton />
    </Flex>
  )
}