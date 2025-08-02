import { Box, Flex, Button, Heading, Spacer } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <Box bg="blue.500" px={4} py={4}>
      <Flex maxW="1200px" mx="auto" align="center">
        <Heading as={RouterLink} to="/" size="md" color="white">
          Study Planner
        </Heading>
        <Spacer />
        {currentUser ? (
          <>
            <Button
              as={RouterLink}
              to="/dashboard"
              colorScheme="whiteAlpha"
              mr={4}
            >
              Dashboard
            </Button>
            <Button onClick={handleLogout} colorScheme="whiteAlpha">
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              as={RouterLink}
              to="/login"
              colorScheme="whiteAlpha"
              mr={4}
            >
              Log In
            </Button>
            <Button as={RouterLink} to="/register" colorScheme="whiteAlpha">
              Sign Up
            </Button>
          </>
        )}
      </Flex>
    </Box>
  )
} 