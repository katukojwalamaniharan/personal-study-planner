import { useState } from 'react'
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
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../contexts/AuthContext'

const MotionBox = motion(Box)

export default function Register() {
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      navigate('/home')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google.',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
              Create Account
            </Heading>
            <Text fontSize="lg" color="gray.500">
              Join us to start your learning journey
            </Text>
          </VStack>

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
                leftIcon={<FcGoogle />}
                variant="outline"
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
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: 'blue', fontWeight: 'bold' }}>
              Sign In
            </RouterLink>
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  )
} 