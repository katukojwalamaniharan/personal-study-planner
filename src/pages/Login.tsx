import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useToast,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../contexts/AuthContext'

const MotionBox = motion(Box)

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithGoogle, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (currentUser) {
      const from = (location.state as any)?.from?.pathname || '/home'
      navigate(from, { replace: true })
    }
  }, [currentUser, navigate, location])

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to sign in with Google.')
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={20}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Welcome Back
            </Heading>
            <Text fontSize="lg" color="gray.500">
              Sign in to continue your learning journey
            </Text>
          </VStack>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Box
            w="100%"
            p={8}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            bg={bgColor}
            boxShadow="lg"
          >
            <VStack spacing={4}>
              <Button
                w="100%"
                size="lg"
                onClick={handleGoogleSignIn}
                isLoading={loading}
                loadingText="Signing in..."
                leftIcon={<FcGoogle />}
                variant="outline"
                _hover={{
                  bg: 'gray.50',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
              >
                Continue with Google
              </Button>

              <Divider my={4} />

              <Text fontSize="sm" color="gray.500" textAlign="center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </Box>

          <Text>
            Don't have an account?{' '}
            <RouterLink to="/register" style={{ color: 'blue', fontWeight: 'bold' }}>
              Sign Up
            </RouterLink>
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  )
} 