import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Link,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaHome,
  FaBook,
  FaCalendarAlt,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaInfoCircle,
} from 'react-icons/fa';

const Sidebar = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/home' },
    { icon: FaBook, label: 'Study Plan', path: '/study-plan' },
    { icon: FaCalendarAlt, label: 'Schedule', path: '/schedule' },
    { icon: FaChartLine, label: 'Progress', path: '/progress' },
    { icon: FaInfoCircle, label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const SidebarContent = () => (
    <VStack
      h="100vh"
      w="280px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      py={8}
      spacing={8}
      position="fixed"
      left={0}
      top={0}
    >
      {/* Logo */}
      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
        StudyPlanner
      </Text>

      {/* Navigation */}
      <VStack spacing={2} w="full" px={4}>
        {menuItems.map((item) => {
          // Hide Schedule and Progress visually only
          if (item.label === 'Schedule' || item.label === 'Progress') {
            return (
              <Box key={item.path} display="none" />
            );
          }
          return (
            <Link
              key={item.path}
              as={RouterLink}
              to={item.path}
              w="full"
              _hover={{ textDecoration: 'none' }}
            >
              <HStack
                w="full"
                p={3}
                borderRadius="lg"
                bg={isActive(item.path) ? 'blue.50' : 'transparent'}
                color={isActive(item.path) ? 'blue.500' : 'gray.600'}
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
              >
                <Icon as={item.icon} />
                <Text>{item.label}</Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* User Profile */}
      <Box w="full" px={4} mt="auto">
        <Menu>
          <MenuButton
            w="full"
            p={3}
            borderRadius="lg"
            _hover={{ bg: hoverBg }}
            transition="all 0.2s"
          >
            <HStack>
              <Avatar
                size="sm"
                name={currentUser?.displayName || 'User'}
                src={currentUser?.photoURL || undefined}
              />
              <Text>{currentUser?.displayName || 'User'}</Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem
              as={RouterLink}
              to="/profile"
              icon={<FaUser />}
            >
              Profile
            </MenuItem>
            <MenuItem icon={<FaCog />}>Settings</MenuItem>
            <MenuItem
              icon={<FaSignOutAlt />}
              onClick={handleSignOut}
              color="red.500"
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </VStack>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        aria-label="Open menu"
        icon={<FaBars />}
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top={4}
        left={4}
        zIndex={1000}
        onClick={onOpen}
      />

      {/* Desktop Sidebar */}
      <Box display={{ base: 'none', md: 'block' }}>
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>StudyPlanner</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar; 