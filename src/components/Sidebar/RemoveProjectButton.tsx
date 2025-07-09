import { Button } from '@chakra-ui/react'

export const RemoveProjectButton = () => {
  return (
    <Button size='xs' colorPalette='red' variant='ghost' onClick={() => alert('Remove project')}>
      🗑️ Remove Current Project
    </Button>
  )
}