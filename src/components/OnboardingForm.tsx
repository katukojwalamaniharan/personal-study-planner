import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  useToast,
  Progress,
  Textarea,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createUserProfile } from '../config/firebase'

const MotionBox = motion(Box)

interface UserProfile {
  fullName: string
  dateOfBirth: string
  educationLevel: string
  fieldOfStudy: string
  institution: string
  graduationYear: string
  goals: string
  interests: string
}

export default function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    dateOfBirth: '',
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    graduationYear: '',
    goals: '',
    interests: '',
  })

  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      // Store user profile in Firestore using the helper function
      await createUserProfile(currentUser.uid, {
        ...profile,
        email: currentUser.email,
        createdAt: new Date().toISOString(),
        onboardingCompleted: true
      })

      toast({
        title: 'Profile created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate('/home')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="fullName"
                value={profile.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Date of Birth</FormLabel>
              <Input
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={handleInputChange}
              />
            </FormControl>
          </VStack>
        )
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Education Level</FormLabel>
              <Select
                name="educationLevel"
                value={profile.educationLevel}
                onChange={handleInputChange}
                placeholder="Select your education level"
              >
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="phd">PhD</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Field of Study</FormLabel>
              <Input
                name="fieldOfStudy"
                value={profile.fieldOfStudy}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Medicine, etc."
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Institution</FormLabel>
              <Input
                name="institution"
                value={profile.institution}
                onChange={handleInputChange}
                placeholder="Enter your institution name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Expected Graduation Year</FormLabel>
              <Input
                name="graduationYear"
                type="number"
                value={profile.graduationYear}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
              />
            </FormControl>
          </VStack>
        )
      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>What are your study goals?</FormLabel>
              <Textarea
                name="goals"
                value={profile.goals}
                onChange={handleInputChange}
                placeholder="Tell us about your academic and career goals..."
                rows={4}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>What are your interests?</FormLabel>
              <Textarea
                name="interests"
                value={profile.interests}
                onChange={handleInputChange}
                placeholder="Share your interests and hobbies..."
                rows={4}
              />
            </FormControl>
          </VStack>
        )
      default:
        return null
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
            <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Welcome to Study Planner!
            </Heading>
            <Text fontSize="lg" color="gray.500">
              Let's get to know you better
            </Text>
          </VStack>

          <Progress value={(step / 3) * 100} size="sm" colorScheme="blue" w="100%" />

          <Box
            w="100%"
            p={8}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            bg="white"
            boxShadow="lg"
          >
            {renderStep()}

            <VStack spacing={4} mt={8}>
              {step > 1 && (
                <Button
                  w="100%"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  w="100%"
                  colorScheme="blue"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  w="100%"
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={loading}
                  loadingText="Saving..."
                >
                  Complete Profile
                </Button>
              )}
            </VStack>
          </Box>
        </VStack>
      </MotionBox>
    </Container>
  )
} 