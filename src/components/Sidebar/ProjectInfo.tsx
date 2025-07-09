import { Box, Text } from '@chakra-ui/react'

export const ProjectInfo = () => {
  return (
    <Box>
      <Text fontWeight='bold'>Project: test-repo</Text>
      <Text textStyle='sm'>Branch: main</Text>
    </Box>
  )
}