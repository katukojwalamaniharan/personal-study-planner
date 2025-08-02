import { Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { currentUser } = useAuth()

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading>Welcome to your Dashboard</Heading>
        <Text>
          Hello, {currentUser?.email}! This is your personal study planning space.
        </Text>
        {/* Add more dashboard content here */}
      </VStack>
    </Container>
  )
} 