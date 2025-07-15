import { Button } from '@radix-ui/themes'

export const RemoveProjectButton = () => {
  return (
    <Button size='2' color='red' variant='ghost' onClick={() => alert('Remove project')}>
      🗑️ Remove Current Project
    </Button>
  )
}