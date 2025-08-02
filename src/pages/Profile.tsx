import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  useColorModeValue,
  Divider,
  Grid,
  GridItem,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Progress,
  Tooltip,
  Image,
  AspectRatio,
  Alert,
  AlertIcon,
  SimpleGrid,
  Flex,
  Center,
  Spinner,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaCamera, FaEdit, FaSave, FaTimes, FaCheck, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getUserBadges,
  BADGES,
  checkAndAwardProfileBadges
} from '../config/firebase';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Profile = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;
    const requiredFields = [
      'fullName',
      'fieldOfStudy',
      'institution',
      'currentSemester',
      'photoURL'
    ];
    const completedFields = requiredFields.filter(field => {
      if (field === 'photoURL') {
        return profile[field] || currentUser?.photoURL;
      }
      return profile[field] && profile[field].trim() !== '';
    });
    return (completedFields.length / requiredFields.length) * 100;
  };

  // Robust profile loader
  const loadProfile = async () => {
    if (!currentUser) {
      setError('No user logged in');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [userProfile, badges] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserBadges(currentUser.uid)
      ]);
      if (!userProfile) {
        throw new Error('Profile not found or could not be created.');
      }
      setProfile(userProfile);
      setEditedProfile(userProfile);
      setUserBadges(badges);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile. Please try again.');
      toast({
        title: 'Error loading profile',
        description: err?.message || 'Please try refreshing the page',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, [currentUser]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, or GIF)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const requiredFields = ['fullName', 'fieldOfStudy', 'institution', 'currentSemester'];
      const missingFields = requiredFields.filter(field => !editedProfile[field]?.trim());
      if (missingFields.length > 0) {
        toast({
          title: 'Missing required fields',
          description: `Please fill in: ${missingFields.join(', ')}`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      const updatedProfile = await updateUserProfile(currentUser.uid, editedProfile);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      await checkAndAwardProfileBadges(currentUser.uid, updatedProfile);
      const badges = await getUserBadges(currentUser.uid);
      setUserBadges(badges);
      toast({
        title: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile. Please try again.');
      toast({
        title: 'Error updating profile',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage || !currentUser) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const downloadURL = await uploadProfileImage(
        currentUser.uid,
        selectedImage,
        (progress) => setUploadProgress(progress)
      );
      const updatedProfile = await updateUserProfile(currentUser.uid, {
        ...editedProfile,
        photoURL: downloadURL
      });
      await checkAndAwardProfileBadges(currentUser.uid, updatedProfile);
      const badges = await getUserBadges(currentUser.uid);
      setUserBadges(badges);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      toast({
        title: 'Profile picture updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image. Please try again.');
      toast({
        title: 'Error uploading image',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Sidebar />
        <Box ml="280px" p={8}>
          <Container maxW="container.xl">
            <Center>
              <Spinner size="xl" color="blue.500" />
            </Center>
          </Container>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Sidebar />
        <Box ml="280px" p={8}>
          <Container maxW="container.xl">
            <Alert status="error" variant="solid" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <AlertTitle>Error loading profile</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={loadProfile}
                >
                  Retry
                </Button>
              </VStack>
            </Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Sidebar />
      <Box ml="280px" p={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* Profile Completion Progress */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                p={6}
                bg={bgColor}
                shadow="base"
                rounded="xl"
                border="1px"
                borderColor={borderColor}
              >
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Profile Completion</Heading>
                    <Badge colorScheme={profileCompletion === 100 ? 'green' : 'blue'}>
                      {Math.round(profileCompletion)}%
                    </Badge>
                  </HStack>
                  <Progress
                    value={profileCompletion}
                    colorScheme={profileCompletion === 100 ? 'green' : 'blue'}
                    size="lg"
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500">
                    Complete your profile to unlock all features
                  </Text>
                </VStack>
              </Box>
            </MotionBox>

            {/* Achievements Section */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box
                p={6}
                bg={bgColor}
                shadow="base"
                rounded="xl"
                border="1px"
                borderColor={borderColor}
              >
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <FaTrophy color="#ECC94B" />
                    <Heading size="md">Achievements</Heading>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    {Object.values(BADGES).map((badge) => (
                      <Tooltip
                        key={badge.id}
                        label={badge.description}
                        placement="top"
                      >
                        <Box
                          p={4}
                          bg={userBadges.includes(badge.id) ? `${badge.color}.50` : 'gray.50'}
                          borderRadius="lg"
                          border="1px"
                          borderColor={userBadges.includes(badge.id) ? `${badge.color}.200` : 'gray.200'}
                          opacity={userBadges.includes(badge.id) ? 1 : 0.5}
                          transition="all 0.2s"
                          _hover={{ transform: 'translateY(-2px)' }}
                        >
                          <VStack spacing={2}>
                            <Text fontSize="2xl">{badge.icon}</Text>
                            <Text
                              fontWeight="bold"
                              color={userBadges.includes(badge.id) ? `${badge.color}.600` : 'gray.500'}
                            >
                              {badge.name}
                            </Text>
                          </VStack>
                        </Box>
                      </Tooltip>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Box>
            </MotionBox>

            {/* Profile Header */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                p={8}
                bg={bgColor}
                shadow="base"
                rounded="xl"
                border="1px"
                borderColor={borderColor}
              >
                <Grid templateColumns="repeat(12, 1fr)" gap={8}>
                  {/* Profile Picture */}
                  <GridItem colSpan={{ base: 12, md: 4 }}>
                    <VStack spacing={4}>
                      <Box position="relative">
                        <Avatar
                          size="2xl"
                          name={profile?.fullName}
                          src={profile?.photoURL || currentUser?.photoURL}
                        />
                        <IconButton
                          aria-label="Change profile picture"
                          icon={<FaCamera />}
                          size="sm"
                          colorScheme="blue"
                          rounded="full"
                          position="absolute"
                          bottom="0"
                          right="0"
                          onClick={onOpen}
                        />
                      </Box>
                      <Text fontSize="xl" fontWeight="bold" color={textColor}>
                        {profile?.fullName}
                      </Text>
                      <Badge colorScheme="blue" fontSize="sm">
                        {profile?.fieldOfStudy}
                      </Badge>
                    </VStack>
                  </GridItem>

                  {/* Profile Information */}
                  <GridItem colSpan={{ base: 12, md: 8 }}>
                    <VStack align="stretch" spacing={6}>
                      <HStack justify="space-between">
                        <Heading size="md">Profile Information</Heading>
                        <IconButton
                          aria-label="Edit profile"
                          icon={isEditing ? <FaTimes /> : <FaEdit />}
                          onClick={() => setIsEditing(!isEditing)}
                          colorScheme={isEditing ? 'red' : 'blue'}
                        />
                      </HStack>
                      <Divider />
                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <FormControl>
                          <FormLabel>Full Name</FormLabel>
                          {isEditing ? (
                            <Input
                              value={editedProfile?.fullName || ''}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                            />
                          ) : (
                            <Text>{profile?.fullName}</Text>
                          )}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Text>{currentUser?.email}</Text>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Field of Study</FormLabel>
                          {isEditing ? (
                            <Input
                              value={editedProfile?.fieldOfStudy || ''}
                              onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                            />
                          ) : (
                            <Text>{profile?.fieldOfStudy}</Text>
                          )}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Institution</FormLabel>
                          {isEditing ? (
                            <Input
                              value={editedProfile?.institution || ''}
                              onChange={(e) => handleInputChange('institution', e.target.value)}
                            />
                          ) : (
                            <Text>{profile?.institution}</Text>
                          )}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Current Semester</FormLabel>
                          {isEditing ? (
                            <Input
                              value={editedProfile?.currentSemester || ''}
                              onChange={(e) => handleInputChange('currentSemester', e.target.value)}
                            />
                          ) : (
                            <Text>{profile?.currentSemester}</Text>
                          )}
                        </FormControl>
                      </Grid>
                      {isEditing && (
                        <Button
                          leftIcon={<FaSave />}
                          colorScheme="blue"
                          onClick={handleSaveProfile}
                          isLoading={isLoading}
                        >
                          Save Changes
                        </Button>
                      )}
                    </VStack>
                  </GridItem>
                </Grid>
              </Box>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Image Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Profile Picture</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {imagePreview ? (
                <AspectRatio ratio={1} w="200px">
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    borderRadius="full"
                    objectFit="cover"
                  />
                </AspectRatio>
              ) : (
                <Avatar size="2xl" src={profile?.photoURL || currentUser?.photoURL} />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                display="none"
                id="image-upload"
              />
              <Button
                as="label"
                htmlFor="image-upload"
                leftIcon={<FaCamera />}
                colorScheme="blue"
                cursor="pointer"
                isLoading={isUploading}
              >
                Choose Image
              </Button>
              {isUploading && (
                <VStack w="full" spacing={2}>
                  <Progress value={uploadProgress} w="full" />
                  <Text fontSize="sm" color="gray.500">
                    Uploading... {Math.round(uploadProgress)}%
                  </Text>
                </VStack>
              )}
              <Alert status="info" fontSize="sm">
                <AlertIcon />
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveImage}
              isLoading={isUploading}
              leftIcon={<FaCheck />}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile; 