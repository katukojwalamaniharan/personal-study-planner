import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Text,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Icon,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  List,
  ListItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Tooltip,
  useDisclosure as useDisclosure2,
  Grid,
  Center,
  ButtonGroup,
  IconButton,
  useColorMode,
  Spinner,
  SimpleGrid,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Textarea
} from '@chakra-ui/react';
import { FaPlus, FaFlag, FaSearch, FaSort, FaFilter, FaCalendarAlt, FaClock, FaCheck, FaPlay, FaStop, FaPause, FaBook, FaFire, FaTrash } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Define the Course type
type Course = {
  id: string;
  name: string;
  description: string;
  duration: {
    hours: number;
    minutes: number;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  topics: string[];
  dailyStudyTime: {
    hours: number;
    minutes: number;
  };
  studyDays: string[];
  progress: number;
  lastStudiedDate: string | null;
  streak: number;
  resources: string[];
  relatedCourse: string | null;
  revisionCycles: {
    nextRevisionDate: string;
    cycleNumber: number;
  };
  pomodoroSettings: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  color: string;
  createdAt: any;
  userId: string;
  category: string;
};

// Add new type for daily schedule
type DailySchedule = {
  id: string;
  date: string;
  subjects: {
    subjectId: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
  }[];
  totalStudyTime: number;
  createdAt: any;
  userId: string;
};

// Enhanced types for next-gen scheduling
type TimeSlot = {
  startTime: string;
  endTime: string;
  type: 'study' | 'break' | 'review' | 'exercise' | 'rest';
  subjectId?: string;
  subjectName?: string;
  energyLevel: number;
  focusLevel: number;
  activityType?: string;
};

type EnergyLevel = {
  time: string;
  level: number;
  activity: string;
  recommendedSubjects: string[];
};

type LearningPattern = {
  type: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  optimalTime: string;
  duration: number;
  breakAfter: number;
};

// Add new type for schedule display
type ScheduleDisplay = {
  isVisible: boolean;
  date: string;
  schedule: DailySchedule | null;
};

// Add new type for study session
type StudySession = {
  id: string;
  subjectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'active' | 'paused' | 'completed';
  currentSubject: string;
};

// Add new types for study metrics
type StudyMetrics = {
  totalStudyTime: number;
  completedSubjects: number;
  activeStreak: number;
  lastStudyDate: string | null;
  dailyGoal: number;
  sessionsCompleted: number;
};

// Add new types for subject templates and categories
type SubjectTemplate = {
  id: string;
  name: string;
  category: string;
  defaultHours: number;
  defaultDifficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
};

type SubjectCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

const StudyPlan = () => {
  // All useState hooks
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState({ hours: 1, minutes: 0 });
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [progress, setProgress] = useState(0);
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [relatedCourse, setRelatedCourse] = useState<string | null>(null);
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [scheduleDisplay, setScheduleDisplay] = useState<ScheduleDisplay>({
    isVisible: false,
    date: '',
    schedule: null
  });
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [savedSchedules, setSavedSchedules] = useState<DailySchedule[]>([]);
  const [studyMetrics, setStudyMetrics] = useState<StudyMetrics>({
    totalStudyTime: 0,
    completedSubjects: 0,
    activeStreak: 0,
    lastStudyDate: null,
    dailyGoal: 8 * 60, // 8 hours in minutes
    sessionsCompleted: 0
  });

  // Add new state for wizard and templates
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SubjectTemplate | null>(null);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // All useRef hooks
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // All useDisclosure hooks
  const addCourseModal = useDisclosure();
  const scheduleModal = useDisclosure2();

  // All useContext hooks
  const toast = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const { colorMode } = useColorMode();

  // Constants
  const dailyEnergyLevels: EnergyLevel[] = [
    {
      time: '06:00',
      level: 7,
      activity: 'Morning Exercise',
      recommendedSubjects: ['beginner', 'review']
    },
    {
      time: '08:00',
      level: 9,
      activity: 'Peak Focus',
      recommendedSubjects: ['advanced', 'complex']
    },
    {
      time: '10:00',
      level: 8,
      activity: 'High Energy',
      recommendedSubjects: ['intermediate', 'advanced']
    },
    {
      time: '12:00',
      level: 6,
      activity: 'Post-Lunch',
      recommendedSubjects: ['beginner', 'review']
    },
    {
      time: '14:00',
      level: 7,
      activity: 'Afternoon Focus',
      recommendedSubjects: ['intermediate']
    },
    {
      time: '16:00',
      level: 8,
      activity: 'Evening Energy',
      recommendedSubjects: ['advanced', 'practice']
    },
    {
      time: '18:00',
      level: 6,
      activity: 'Evening Review',
      recommendedSubjects: ['review', 'beginner']
    }
  ];

  const learningPatterns: Record<string, LearningPattern> = {
    theory: {
      type: 'reading',
      optimalTime: '08:00',
      duration: 45,
      breakAfter: 15
    },
    practice: {
      type: 'kinesthetic',
      optimalTime: '14:00',
      duration: 60,
      breakAfter: 20
    },
    review: {
      type: 'visual',
      optimalTime: '18:00',
      duration: 30,
      breakAfter: 10
    }
  };

  // Add predefined templates
  const subjectTemplates: SubjectTemplate[] = [
    {
      id: 'os',
      name: 'Operating Systems',
      category: 'Core',
      defaultHours: 40,
      defaultDifficulty: 'intermediate',
      description: 'Learn OS concepts, processes, memory management, and file systems'
    },
    {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      category: 'Core',
      defaultHours: 60,
      defaultDifficulty: 'intermediate',
      description: 'Master fundamental data structures and algorithms'
    },
    // Add more templates...
  ];

  const categories: SubjectCategory[] = [
    { id: 'core', name: 'Core', color: 'blue', icon: 'FaBook' },
    { id: 'project', name: 'Project', color: 'green', icon: 'FaCode' },
    { id: 'theory', name: 'Theory', color: 'purple', icon: 'FaLightbulb' },
    { id: 'practice', name: 'Practice', color: 'orange', icon: 'FaTools' }
  ];

  // All useEffect hooks
  useEffect(() => {
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }

    console.log('Setting up courses listener for user:', currentUser.uid);
    const q = query(
      collection(db, 'user_study_plans', currentUser.uid, 'courses'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Received courses update');
        const coursesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dailyStudyTime: data.dailyStudyTime || { hours: 0, minutes: 30 },
            streak: data.streak || 0,
            progress: data.progress || 0,
            topics: data.topics || [],
            resources: data.resources || [],
            studyDays: data.studyDays || [],
            pomodoroSettings: data.pomodoroSettings || {
              workDuration: 25,
              breakDuration: 5,
              longBreakDuration: 15,
              sessionsUntilLongBreak: 4
            }
          };
        }) as Course[];
        console.log('Courses data:', coursesData);
        setCourses(coursesData);
        setError(null);
      },
      (error) => {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again.');
      }
    );

    return () => {
      console.log('Cleaning up courses listener');
      unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);

    const q = query(
      collection(db, 'user_study_plans', currentUser.uid, 'schedules'),
      where('date', '==', today),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DailySchedule[];

      setSavedSchedules(schedules);
      
      if (schedules.length > 0) {
        setScheduleDisplay({
          isVisible: true,
          date: schedules[0].date,
          schedule: schedules[0]
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, selectedDate]);

  // Timer effect
  useEffect(() => {
    if (currentSession?.status === 'active' && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSession?.status, isPaused]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddCourse = async () => {
    if (!currentUser) {
      setError('You must be logged in to add a course');
      return;
    }

    if (!newCourse.trim()) {
      setError('Please enter a subject name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const courseData = {
        name: newCourse.trim(),
        description: description.trim() || '',
        duration: duration || { hours: 0, minutes: 0 },
        difficulty: difficulty || 'beginner',
        priority: priority || 'medium',
        startDate: startDate || '',
        endDate: endDate || '',
        topics: topics || [],
        progress: progress || 0,
        lastStudiedDate: null,
        streak: 0,
        resources: resources || [],
        relatedCourse: relatedCourse || null,
        revisionCycles: {
          nextRevisionDate: startDate || new Date().toISOString(),
          cycleNumber: 0
        },
        pomodoroSettings: pomodoroSettings || {
          workDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4
        },
        category: selectedCategory,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(
        collection(db, 'user_study_plans', currentUser.uid, 'courses'),
        courseData
      );

      // Reset form
      setNewCourse('');
      setDescription('');
      setDuration({ hours: 1, minutes: 0 });
      setDifficulty('beginner');
      setPriority('medium');
      setStartDate('');
      setEndDate('');
      setTopics([]);
      setProgress(0);
      setResources([]);
      setRelatedCourse(null);
      setPomodoroSettings({
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4
      });
      addCourseModal.onClose();

      toast({
        title: 'Success',
        description: 'Subject added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error adding course:', error);
      setError(error.message || 'Failed to add subject');
      toast({
        title: 'Error',
        description: error.message || 'Failed to add subject',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (courseId: string, newProgress: number) => {
    if (!currentUser) return;

    try {
      const courseRef = doc(db, 'user_study_plans', currentUser.uid, 'courses', courseId);
      await updateDoc(courseRef, {
        progress: newProgress,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePriority = async (courseId: string, newPriority: 'high' | 'medium' | 'low') => {
    if (!currentUser) return;

    try {
      console.log('Updating course priority:', { courseId, newPriority });
      const courseRef = doc(db, 'user_study_plans', currentUser.uid, 'courses', courseId);
      await updateDoc(courseRef, {
        priority: newPriority,
        updatedAt: serverTimestamp()
      });
      console.log('Priority updated successfully');
    } catch (error: any) {
      console.error('Error updating priority:', error);
      setError(error.message || 'Failed to update priority');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update priority',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!currentUser) return;

    try {
      console.log('Deleting course:', courseId);
      const courseRef = doc(db, 'user_study_plans', currentUser.uid, 'courses', courseId);
      await deleteDoc(courseRef);
      console.log('Course deleted successfully');
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      setError(error.message || 'Failed to delete course');
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Calculate optimal study time with enhanced algorithm
  const calculateOptimalStudyTime = (
    subject: Course,
    currentTime: Date,
    previousSubjects: TimeSlot[]
  ): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const duration = (subject.dailyStudyTime?.hours || 0) * 60 + (subject.dailyStudyTime?.minutes || 30);
    
    // Determine subject type and learning pattern
    const subjectType = determineSubjectType(subject);
    const pattern = learningPatterns[subjectType];
    
    // Calculate optimal start time based on energy levels
    const optimalTimeSlot = findOptimalTimeSlot(subject, currentTime);
    
    // Add warm-up break if needed
    if (previousSubjects.length > 0) {
      slots.push(createBreakSlot(currentTime, 10, 'warm-up'));
      currentTime.setMinutes(currentTime.getMinutes() + 10);
    }

    // Add study slot with energy and focus levels
    const studyEndTime = new Date(currentTime.getTime() + duration * 60000);
    slots.push({
      startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: studyEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'study',
      subjectId: subject.id,
      subjectName: subject.name,
      energyLevel: optimalTimeSlot.level,
      focusLevel: calculateFocusLevel(subject, optimalTimeSlot),
      activityType: subjectType
    });

    // Add active break
    slots.push(createBreakSlot(studyEndTime, pattern.breakAfter, 'active'));

    return slots;
  };

  // Determine subject type based on content and difficulty
  const determineSubjectType = (subject: Course): string => {
    if (subject.difficulty === 'advanced') return 'practice';
    if (subject.difficulty === 'intermediate') return 'theory';
    return 'review';
  };

  // Find optimal time slot based on subject and current time
  const findOptimalTimeSlot = (subject: Course, currentTime: Date): EnergyLevel => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    return dailyEnergyLevels.reduce((optimal: EnergyLevel, current: EnergyLevel) => {
      const currentTimeValue = timeToMinutes(timeString);
      const optimalTimeValue = timeToMinutes(current.time);
      const timeDiff = Math.abs(currentTimeValue - optimalTimeValue);

      if (current.recommendedSubjects.includes(subject.difficulty || 'beginner') &&
          current.level > optimal.level) {
        return current;
      }
      return optimal;
    }, dailyEnergyLevels[0]);
  };

  // Calculate focus level based on subject and time slot
  const calculateFocusLevel = (subject: Course, timeSlot: EnergyLevel): number => {
    const baseFocus = timeSlot.level;
    const difficultyMultiplier = {
      'advanced': 0.8,
      'intermediate': 1,
      'beginner': 1.2
    }[subject.difficulty || 'beginner'];

    return Math.min(10, Math.round(baseFocus * difficultyMultiplier));
  };

  // Create break slot with specific type
  const createBreakSlot = (time: Date, duration: number, type: string): TimeSlot => {
    const endTime = new Date(time.getTime() + duration * 60000);
    return {
      startTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'break',
      energyLevel: 5,
      focusLevel: 3,
      activityType: type
    };
  };

  // Convert time string to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Enhanced schedule generation with next-gen algorithm
  const generateDailySchedule = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Please log in to generate a schedule',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one subject',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingSchedule(true);
    try {
      // Check if a schedule already exists for today
      const existingSchedule = savedSchedules.find(s => s.date === selectedDate);
      if (existingSchedule) {
        // Update existing schedule
        const scheduleRef = doc(db, 'user_study_plans', currentUser.uid, 'schedules', existingSchedule.id);
        await updateDoc(scheduleRef, {
          subjects: [],
          totalStudyTime: 0,
          updatedAt: serverTimestamp()
        });
      }

      console.log('Starting schedule generation...');
      console.log('Selected subjects:', selectedSubjects);

      const selectedCoursesData = courses.filter(course => 
        selectedSubjects.includes(course.id)
      );

      console.log('Selected courses data:', selectedCoursesData);

      if (selectedCoursesData.length === 0) {
        throw new Error('No valid subjects found');
      }

      // Enhanced subject sorting with multiple factors
      const sortedSubjects = [...selectedCoursesData].sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const difficultyWeight = { advanced: 3, intermediate: 2, beginner: 1 };
        
        const aScore = (priorityWeight[a.priority || 'medium'] * 2) + 
                      difficultyWeight[a.difficulty || 'beginner'];
        const bScore = (priorityWeight[b.priority || 'medium'] * 2) + 
                      difficultyWeight[b.difficulty || 'beginner'];
        
        return bScore - aScore;
      });

      console.log('Sorted subjects:', sortedSubjects);

      // Generate schedule starting from 8 AM
      let currentTime = new Date();
      currentTime.setHours(8, 0, 0, 0);

      const scheduleId = Date.now().toString();
      console.log('Generated schedule ID:', scheduleId);

      const schedule: DailySchedule = {
        id: scheduleId,
        date: new Date().toISOString().split('T')[0],
        subjects: [],
        totalStudyTime: 0,
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      };

      let totalStudyTime = 0;

      // Generate schedule for each subject
      for (const subject of sortedSubjects) {
        console.log('Processing subject:', subject.name);
        
        // Calculate duration in minutes with fallback values
        const hours = subject.dailyStudyTime?.hours || 0;
        const minutes = subject.dailyStudyTime?.minutes || 30;
        const duration = (hours * 60) + minutes;
        
        console.log('Subject duration:', duration, 'minutes');

        // Create end time
        const endTime = new Date(currentTime.getTime() + duration * 60000);

        // Add subject to schedule
        schedule.subjects.push({
          subjectId: subject.id,
          name: subject.name,
          startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: duration,
        });

        totalStudyTime += duration;
        
        // Add 15-minute break after each subject
        currentTime = new Date(endTime.getTime() + 15 * 60000);
      }

      schedule.totalStudyTime = totalStudyTime;
      console.log('Generated schedule:', schedule);

      // Save schedule to Firebase with updated collection path
      console.log('Saving schedule to Firebase...');
      const scheduleRef = collection(db, 'user_study_plans', currentUser.uid, 'schedules');
      const docRef = await addDoc(scheduleRef, schedule);
      console.log('Schedule saved with ID:', docRef.id);

      // Update schedule display
      setScheduleDisplay({
        isVisible: true,
        date: schedule.date,
        schedule: schedule
      });

      // Show success message
      toast({
        title: 'Schedule Generated',
        description: `Created schedule with ${sortedSubjects.length} subjects`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error: any) {
      console.error('Error generating schedule:', error);
      if (error.code === 'permission-denied') {
        toast({
          title: 'Permission Error',
          description: 'Please check your Firebase security rules',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to generate schedule. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // Load a saved schedule
  const loadSavedSchedule = (schedule: DailySchedule) => {
    setScheduleDisplay({
      isVisible: true,
      date: schedule.date,
      schedule: schedule
    });
  };

  // Generate enhanced study tips
  const generateEnhancedStudyTips = (subjects: Course[], schedule: DailySchedule): string => {
    const tips: string[] = [];
    
    // Analyze study patterns
    const hasDifficultSubjects = subjects.some(s => s.difficulty === 'advanced');
    const hasMultipleSubjects = subjects.length > 2;
    const totalStudyTime = schedule.totalStudyTime;
    
    // General tips
    if (hasDifficultSubjects) {
      tips.push('📚 Schedule difficult subjects in the morning when your energy is highest.');
    }
    
    if (hasMultipleSubjects) {
      tips.push('⏰ Take regular breaks between subjects to maintain focus.');
    }

    // Time-based tips
    if (totalStudyTime > 240) { // More than 4 hours
      tips.push('🎯 Consider splitting your study sessions across multiple days for better retention.');
    }

    // Subject-specific tips
    subjects.forEach(subject => {
      const difficulty = subject.difficulty || 'beginner';
      const pattern = learningPatterns[determineSubjectType(subject)];
      
      switch (difficulty) {
        case 'advanced':
          tips.push(`🧠 For ${subject.name}, use the ${pattern.type} learning method and take ${pattern.breakAfter}min breaks.`);
          break;
        case 'intermediate':
          tips.push(`📝 Review ${subject.name} materials before starting and practice active recall.`);
          break;
        case 'beginner':
          tips.push(`🌟 Start with ${subject.name} to build confidence and momentum.`);
          break;
      }
    });

    // Add energy management tips
    tips.push('💪 Stay hydrated and take short walks during breaks to maintain energy levels.');
    tips.push('🎵 Consider using background music or white noise for better focus.');

    return tips.join('\n');
  };

  // Start study session
  const startStudySession = (subject: { subjectId: string; name: string }) => {
    if (currentSession) {
      // If there's an active session, stop it first
      stopStudySession();
    }
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      subjectId: subject.subjectId,
      startTime: new Date(),
      duration: 0,
      status: 'active',
      currentSubject: subject.name
    };
    
    setCurrentSession(newSession);
    setElapsedTime(0);
    setIsPaused(false);
  };

  // Pause study session
  const pauseStudySession = () => {
    if (currentSession && currentSession.status === 'active') {
      setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Resume study session
  const resumeStudySession = () => {
    if (currentSession && currentSession.status === 'paused') {
      setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      setIsPaused(false);
    }
  };

  // Stop study session
  const stopStudySession = async () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      
      const completedSession = {
        ...currentSession,
        endTime,
        duration,
        status: 'completed' as const
      };

      // Save session data to Firebase
      if (currentUser) {
        try {
          await addDoc(
            collection(db, 'user_study_plans', currentUser.uid, 'study_sessions'),
            {
              ...completedSession,
              createdAt: serverTimestamp()
            }
          );

          // Update subject progress
          const subjectRef = doc(db, 'user_study_plans', currentUser.uid, 'courses', currentSession.subjectId);
          const subjectDoc = await getDoc(subjectRef);
          if (subjectDoc.exists()) {
            const currentProgress = subjectDoc.data().progress || 0;
            const newProgress = Math.min(100, currentProgress + 5); // Increase progress by 5%
            await updateDoc(subjectRef, { progress: newProgress });
          }
        } catch (error) {
          console.error('Error saving study session:', error);
        }
      }

      setCurrentSession(null);
      setElapsedTime(0);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Modify the date selection handler
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const scheduleForDate = savedSchedules.find(s => s.date === date);
    if (scheduleForDate) {
      setScheduleDisplay({
        isVisible: true,
        date: scheduleForDate.date,
        schedule: scheduleForDate
      });
    } else {
      setScheduleDisplay({
        isVisible: false,
        date: date,
        schedule: null
      });
    }
  };

  // Add useEffect to fetch and calculate study metrics
  useEffect(() => {
    if (!currentUser || !selectedDate) return;

    const fetchStudyMetrics = async () => {
      try {
        // Fetch today's study sessions
        const sessionsQuery = query(
          collection(db, 'user_study_plans', currentUser.uid, 'study_sessions'),
          where('date', '==', selectedDate)
        );
        
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const sessions = sessionsSnapshot.docs.map(doc => doc.data());
        
        // Calculate metrics
        const totalTime = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
        const completed = sessions.filter(s => s.status === 'completed').length;
        
        // Calculate streak
        const streakQuery = query(
          collection(db, 'user_study_plans', currentUser.uid, 'study_sessions'),
          orderBy('date', 'desc'),
          limit(30) // Look at last 30 days
        );
        
        const streakSnapshot = await getDocs(streakQuery);
        const streakData = streakSnapshot.docs.map(doc => doc.data());
        
        let streak = 0;
        let currentDate = new Date(selectedDate);
        
        for (let i = 0; i < streakData.length; i++) {
          const sessionDate = new Date(streakData[i].date);
          if (sessionDate.toDateString() === currentDate.toDateString()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        setStudyMetrics({
          totalStudyTime: totalTime,
          completedSubjects: completed,
          activeStreak: streak,
          lastStudyDate: sessions.length > 0 ? sessions[0].date : null,
          dailyGoal: 8 * 60,
          sessionsCompleted: completed
        });
      } catch (error) {
        console.error('Error fetching study metrics:', error);
      }
    };

    fetchStudyMetrics();
  }, [currentUser, selectedDate, currentSession]);

  // Add drag and drop functionality
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCourses(items);
    // Update priority in Firebase
    items.forEach((course, index) => {
      handleUpdatePriority(course.id, course.priority);
    });
  };

  // Add loading state
  if (authLoading) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Sidebar />
        <Box ml="280px" p={8}>
          <Container maxW="container.xl">
            <Center h="50vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading your study plan...</Text>
              </VStack>
            </Center>
          </Container>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Sidebar />
        <Box ml="280px" p={8}>
          <Container maxW="container.xl">
            <Center h="50vh">
              <VStack spacing={4}>
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    Please sign in to access your study plan.
                  </AlertDescription>
                </Alert>
              </VStack>
            </Center>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Sidebar />
      <Box ml="280px" p={8}>
        <Container maxW="container.xl">
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Study Planner</Tab>
              <Tab>Daily Planner</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between" align="center">
                    <Heading size="lg">Study Planner</Heading>
                    <Button 
                      leftIcon={<FaPlus />} 
                      colorScheme="blue" 
                      onClick={() => {
                        setWizardStep(1);
                        addCourseModal.onOpen();
                      }}
                    >
                      Add Subject
                    </Button>
                  </HStack>

                  {/* Category Filter */}
                  <HStack spacing={4} overflowX="auto" py={2}>
                    <Button
                      size="sm"
                      variant={selectedCategory === 'all' ? 'solid' : 'outline'}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        size="sm"
                        variant={selectedCategory === category.id ? 'solid' : 'outline'}
                        colorScheme={category.color}
                        leftIcon={<Icon as={FaBook} />}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </HStack>

                  {/* Subject Cards Grid */}
                  <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                    {courses
                      .filter(course => selectedCategory === 'all' || course.category === selectedCategory)
                      .map((course) => (
                        <Card
                          key={course.id}
                          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                          transition="all 0.2s"
                          cursor="pointer"
                          bg={useColorModeValue('white', 'gray.800')}
                          borderWidth="1px"
                          borderColor={useColorModeValue('gray.200', 'gray.700')}
                          position="relative"
                        >
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              <HStack justify="space-between">
                                <Tooltip label="Click to edit subject details" placement="top">
                                  <Heading 
                                    size="md" 
                                    fontWeight="600"
                                    onClick={() => {
                                      setNewCourse(course.name);
                                      setDescription(course.description || '');
                                      setDuration(course.duration || { hours: 1, minutes: 0 });
                                      setDifficulty(course.difficulty || 'beginner');
                                      setPriority(course.priority || 'medium');
                                      setSelectedCategory(course.category || 'core');
                                      setTopics(course.topics || []);
                                      addCourseModal.onOpen();
                                    }}
                                    cursor="pointer"
                                    _hover={{ color: 'blue.500' }}
                                  >
                                    {course.name}
                                  </Heading>
                                </Tooltip>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FaSort />}
                                    variant="ghost"
                                    size="sm"
                                  />
                                  <MenuList>
                                    <MenuItem onClick={() => handleUpdatePriority(course.id, 'high')}>
                                      <HStack>
                                        <Icon as={FaFlag} color="red.500" />
                                        <Text>Set High Priority</Text>
                                      </HStack>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleUpdatePriority(course.id, 'medium')}>
                                      <HStack>
                                        <Icon as={FaFlag} color="orange.500" />
                                        <Text>Set Medium Priority</Text>
                                      </HStack>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleUpdatePriority(course.id, 'low')}>
                                      <HStack>
                                        <Icon as={FaFlag} color="green.500" />
                                        <Text>Set Low Priority</Text>
                                      </HStack>
                                    </MenuItem>
                                    <MenuDivider />
                                    <MenuItem 
                                      color="red.500"
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this subject?')) {
                                          handleDeleteCourse(course.id);
                                        }
                                      }}
                                    >
                                      <HStack>
                                        <Icon as={FaTrash} />
                                        <Text>Delete Subject</Text>
                                      </HStack>
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </HStack>

                              <HStack spacing={2}>
                                <Tooltip label={`Difficulty: ${course.difficulty}`}>
                                  <Badge 
                                    colorScheme={course.difficulty === 'advanced' ? 'red' : course.difficulty === 'intermediate' ? 'orange' : 'green'}
                                    variant="subtle"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    {course.difficulty}
                                  </Badge>
                                </Tooltip>
                                <Tooltip label={`Priority: ${course.priority}`}>
                                  <Badge 
                                    colorScheme={getPriorityColor(course.priority)}
                                    variant="subtle"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    {course.priority}
                                  </Badge>
                                </Tooltip>
                                <Tooltip label={`Category: ${course.category}`}>
                                  <Badge 
                                    colorScheme={categories.find(c => c.id === course.category)?.color || 'gray'}
                                    variant="subtle"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    {course.category}
                                  </Badge>
                                </Tooltip>
                              </HStack>

                              <Box>
                                <HStack justify="space-between" mb={1}>
                                  <Tooltip label="Current progress in the subject">
                                    <Text color="gray.500" fontSize="sm" fontWeight="500">Progress</Text>
                                  </Tooltip>
                                  <Text fontSize="sm" fontWeight="600" color={course.progress >= 100 ? 'green.500' : 'gray.700'}>
                                    {course.progress}%
                                  </Text>
                                </HStack>
                                <Box 
                                  position="relative" 
                                  h="4px" 
                                  bg={useColorModeValue('gray.100', 'gray.700')} 
                                  borderRadius="full"
                                  overflow="hidden"
                                >
                                  <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    h="100%"
                                    w={`${course.progress}%`}
                                    bg={course.progress >= 100 ? 'green.500' : 'blue.500'}
                                    transition="width 0.3s ease"
                                    borderRadius="full"
                                  />
                                </Box>
                                <HStack mt={3} spacing={2} justify="center">
                                  <Tooltip label="Decrease progress by 10%">
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => handleUpdateProgress(course.id, Math.max(0, course.progress - 10))}
                                      isDisabled={course.progress <= 0}
                                      _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                                    >
                                      -10%
                                    </Button>
                                  </Tooltip>
                                  <Tooltip label="Increase progress by 10%">
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => handleUpdateProgress(course.id, Math.min(100, course.progress + 10))}
                                      isDisabled={course.progress >= 100}
                                      _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                                    >
                                      +10%
                                    </Button>
                                  </Tooltip>
                                  <Tooltip label="Mark as complete">
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="green"
                                      onClick={() => handleUpdateProgress(course.id, 100)}
                                      isDisabled={course.progress >= 100}
                                      _hover={{ bg: useColorModeValue('green.50', 'green.900') }}
                                    >
                                      Complete
                                    </Button>
                                  </Tooltip>
                                </HStack>
                              </Box>

                              <HStack justify="space-between" pt={2}>
                                <Tooltip label="Estimated study hours">
                                  <VStack align="start" spacing={0}>
                                    <Text color="gray.500" fontSize="xs" fontWeight="500">Estimated Hours</Text>
                                    <Text fontSize="sm" fontWeight="600">
                                      {course.duration?.hours || 0}h {course.duration?.minutes || 0}m
                                    </Text>
                                  </VStack>
                                </Tooltip>
                                <Tooltip label={`${course.streak || 0} days of consistent study`}>
                                  <VStack align="end" spacing={0}>
                                    <Text color="gray.500" fontSize="xs" fontWeight="500">Streak</Text>
                                    <HStack spacing={1}>
                                      <Text fontSize="sm" fontWeight="600">{course.streak || 0} days</Text>
                                      {course.streak > 0 && <Icon as={FaFire} color="orange.500" />}
                                    </HStack>
                                  </VStack>
                                </Tooltip>
                              </HStack>

                              {course.description && (
                                <Box pt={2}>
                                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                    {course.description}
                                  </Text>
                                </Box>
                              )}

                              {course.topics && course.topics.length > 0 && (
                                <Wrap spacing={2}>
                                  {course.topics.map((topic, index) => (
                                    <WrapItem key={index}>
                                      <Tag size="sm" variant="subtle" colorScheme="blue">
                                        {topic}
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                  </Grid>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={8} align="stretch">
                  {/* Header Section */}
                  <HStack justify="space-between" align="center" bg={useColorModeValue('white', 'gray.800')} p={4} borderRadius="lg" shadow="sm">
                    <Heading size="lg">Daily Planner</Heading>
                    <HStack spacing={4}>
                      <Button
                        leftIcon={<FaCalendarAlt />}
                        onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                        variant="outline"
                        size="md"
                      >
                        Today
                      </Button>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        width="200px"
                        size="md"
                      />
                    </HStack>
                  </HStack>

                  {/* Enhanced Stats Section */}
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    {/* Total Study Time Card */}
                    <Card 
                      shadow="lg" 
                      borderRadius="xl" 
                      bg={useColorModeValue('white', 'gray.800')}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.700')}
                      _hover={{ transform: 'translateY(-3px)', shadow: '2xl' }}
                      transition="all 0.3s ease-in-out"
                    >
                      <CardBody p={4}>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FaClock} color="blue.400" boxSize={5} />
                            <Text color="gray.500" fontSize="xs" fontWeight="medium">Actual Study Time</Text>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="extrabold" color={useColorModeValue('gray.800', 'white')}>
                            {Math.floor(studyMetrics.totalStudyTime / 60)}h {studyMetrics.totalStudyTime % 60}m
                          </Text>
                          <Box 
                            position="relative" 
                            h="4px" 
                            bg={useColorModeValue('blue.50', 'blue.900')} 
                            borderRadius="full"
                            overflow="hidden"
                            width="full"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              h="100%"
                              w={`${(studyMetrics.totalStudyTime / studyMetrics.dailyGoal) * 100}%`}
                              bg={studyMetrics.totalStudyTime >= studyMetrics.dailyGoal ? 'green.400' : 'blue.400'}
                              transition="width 0.5s ease-out"
                              borderRadius="full"
                            />
                          </Box>
                          <Text fontSize="xx-small" color="gray.500" fontWeight="medium">
                            {Math.round((studyMetrics.totalStudyTime / studyMetrics.dailyGoal) * 100)}% of daily goal
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Sessions Completed Card */}
                    <Card 
                      shadow="lg" 
                      borderRadius="xl" 
                      bg={useColorModeValue('white', 'gray.800')}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.700')}
                      _hover={{ transform: 'translateY(-3px)', shadow: '2xl' }}
                      transition="all 0.3s ease-in-out"
                    >
                      <CardBody p={4}>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FaCheck} color="green.400" boxSize={5} />
                            <Text color="gray.500" fontSize="xs" fontWeight="medium">Sessions Completed</Text>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="extrabold" color={useColorModeValue('gray.800', 'white')}>
                            {studyMetrics.sessionsCompleted}
                          </Text>
                          <Box 
                            position="relative" 
                            h="4px" 
                            bg={useColorModeValue('green.50', 'green.900')} 
                            borderRadius="full"
                            overflow="hidden"
                            width="full"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              h="100%"
                              w={scheduleDisplay.schedule ? 
                                `${(studyMetrics.sessionsCompleted / scheduleDisplay.schedule.subjects.length) * 100}%` : '0%'}
                              bg="green.400"
                              transition="width 0.5s ease-out"
                              borderRadius="full"
                            />
                          </Box>
                          <Text fontSize="xx-small" color="gray.500" fontWeight="medium">
                            of {scheduleDisplay.schedule ? scheduleDisplay.schedule.subjects.length : 0} planned sessions
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Active Streak Card */}
                    <Card 
                      shadow="lg" 
                      borderRadius="xl" 
                      bg={useColorModeValue('white', 'gray.800')}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.700')}
                      _hover={{ transform: 'translateY(-3px)', shadow: '2xl' }}
                      transition="all 0.3s ease-in-out"
                    >
                      <CardBody p={4}>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FaFire} color="orange.400" boxSize={5} />
                            <Text color="gray.500" fontSize="xs" fontWeight="medium">Active Streak</Text>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="extrabold" color={useColorModeValue('gray.800', 'white')}>
                            {studyMetrics.activeStreak} days
                          </Text>
                          <Box 
                            position="relative" 
                            h="4px" 
                            bg={useColorModeValue('orange.50', 'orange.900')} 
                            borderRadius="full"
                            overflow="hidden"
                            width="full"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              h="100%"
                              w={`${(studyMetrics.activeStreak / 7) * 100}%`}
                              bg="orange.400"
                              transition="width 0.5s ease-out"
                              borderRadius="full"
                            />
                          </Box>
                          <Text fontSize="xx-small" color="gray.500" fontWeight="medium">
                            {studyMetrics.activeStreak >= 7 ? '🔥 Amazing streak!' : 'Keep going!'}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Current Session Card */}
                    <Card 
                      shadow="lg" 
                      borderRadius="xl" 
                      bg={useColorModeValue('white', 'gray.800')}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.700')}
                      _hover={{ transform: 'translateY(-3px)', shadow: '2xl' }}
                      transition="all 0.3s ease-in-out"
                    >
                      <CardBody p={4}>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FaPlay} color="purple.400" boxSize={5} />
                            <Text color="gray.500" fontSize="xs" fontWeight="medium">Current Session</Text>
                          </HStack>
                          {currentSession ? (
                            <>
                              <Text fontSize="lg" fontWeight="bold" noOfLines={1} color={useColorModeValue('gray.800', 'white')}>
                                {currentSession.currentSubject}
                              </Text>
                              <Text fontSize="2xl" fontWeight="extrabold" fontFamily="mono" color="purple.400">
                                {formatTime(elapsedTime)}
                              </Text>
                              <HStack spacing={1}>
                                <Badge colorScheme={currentSession.status === 'active' ? 'green' : 'yellow'} variant="solid" px={2} py={1} borderRadius="full" fontSize="xx-small">
                                  {currentSession.status === 'active' ? 'Active' : 'Paused'}
                                </Badge>
                              </HStack>
                            </>
                          ) : (
                            <VStack align="center" justify="center" h="full" w="full" py={2}>
                              <Icon as={FaPlay} boxSize={8} color="gray.300" />
                              <Text fontSize="xx-small" color="gray.500" textAlign="center">No active session</Text>
                            </VStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </Grid>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                    {/* Left Column - Subject Selection */}
                    <VStack spacing={6} align="stretch">
                      <Card shadow="md" borderRadius="lg">
                        <CardHeader borderBottomWidth="1px" pb={4}>
                          <Heading size="md">Select Subjects for Today</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            {courses.length === 0 ? (
                              <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <AlertTitle>No Subjects Available</AlertTitle>
                                <AlertDescription>
                                  Please add subjects in the Study Planner first.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <>
                                <List spacing={3} width="full">
                                  {courses.map(course => (
                                    <ListItem key={course.id}>
                                      <Checkbox
                                        isChecked={selectedSubjects.includes(course.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedSubjects([...selectedSubjects, course.id]);
                                          } else {
                                            setSelectedSubjects(selectedSubjects.filter(id => id !== course.id));
                                          }
                                        }}
                                        size="lg"
                                        width="full"
                                      >
                                        <HStack justify="space-between" width="full">
                                          <VStack align="start" spacing={0}>
                                            <Text>{course.name}</Text>
                                          </VStack>
                                          <Badge colorScheme={getPriorityColor(course.priority)}>
                                            {course.priority}
                                          </Badge>
                                        </HStack>
                                      </Checkbox>
                                    </ListItem>
                                  ))}
                                </List>

                                <Button 
                                  colorScheme="blue"
                                  leftIcon={<FaCalendarAlt />}
                                  onClick={generateDailySchedule}
                                  isLoading={isGeneratingSchedule}
                                  isDisabled={selectedSubjects.length === 0}
                                  size="lg"
                                  width="full"
                                >
                                  Generate Today's Schedule
                                </Button>
                              </>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>

                    {/* Right Column - Schedule Display */}
                    <Box>
                      {scheduleDisplay.isVisible && scheduleDisplay.schedule ? (
                        <Card shadow="md" borderRadius="lg">
                          <CardHeader borderBottomWidth="1px" pb={4}>
                            <Heading size="md">Today's Schedule</Heading>
                          </CardHeader>
                          <CardBody>
                            <Box 
                              borderLeft="2px solid" 
                              borderColor="blue.200" 
                              pl={6}
                              position="relative"
                            >
                              {scheduleDisplay.schedule.subjects.map((subject, index) => (
                                <Box 
                                  key={subject.subjectId} 
                                  mb={8} 
                                  position="relative"
                                  _before={{
                                    content: '""',
                                    position: 'absolute',
                                    left: '-9px',
                                    top: '4px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: 'full',
                                    bg: 'blue.500',
                                    zIndex: 1
                                  }}
                                >
                                  <HStack 
                                    spacing={4} 
                                    p={4} 
                                    bg={useColorModeValue('white', 'gray.800')}
                                    borderRadius="lg"
                                    shadow="sm"
                                    _hover={{ shadow: 'md' }}
                                    transition="all 0.2s"
                                  >
                                    <VStack align="start" spacing={2} flex={1}>
                                      <HStack>
                                        <Heading size="md">{subject.name}</Heading>
                                      </HStack>
                                      <HStack color="gray.500" fontSize="sm">
                                        <Text>{subject.startTime} - {subject.endTime}</Text>
                                      </HStack>
                                    </VStack>
                                    <HStack>
                                      {currentSession && currentSession.subjectId === subject.subjectId ? (
                                        <HStack spacing={3}>
                                          <Text fontSize="lg" fontWeight="bold" fontFamily="mono" color="blue.500">
                                            {formatTime(elapsedTime)}
                                          </Text>
                                          <ButtonGroup size="md" isAttached>
                                            {currentSession.status === 'active' ? (
                                              <IconButton
                                                aria-label="Pause session"
                                                icon={<FaPause />}
                                                colorScheme="yellow"
                                                onClick={pauseStudySession}
                                              />
                                            ) : (
                                              <IconButton
                                                aria-label="Resume session"
                                                icon={<FaPlay />}
                                                colorScheme="green"
                                                onClick={resumeStudySession}
                                              />
                                            )}
                                            <IconButton
                                              aria-label="Stop session"
                                              icon={<FaStop />}
                                              colorScheme="red"
                                              onClick={stopStudySession}
                                            />
                                          </ButtonGroup>
                                        </HStack>
                                      ) : (
                                        <IconButton
                                          aria-label="Start study session"
                                          icon={<FaPlay />}
                                          colorScheme="green"
                                          size="md"
                                          onClick={() => startStudySession(subject)}
                                          isDisabled={!!currentSession}
                                        />
                                      )}
                                    </HStack>
                                  </HStack>
                                </Box>
                              ))}
                            </Box>
                          </CardBody>
                        </Card>
                      ) : (
                        <Center 
                          h="full" 
                          bg={useColorModeValue('white', 'gray.800')} 
                          borderRadius="lg"
                          p={8}
                          shadow="md"
                        >
                          <VStack spacing={4} color="gray.500">
                            <Icon as={FaCalendarAlt} boxSize={12} />
                            <Text fontSize="lg">Select subjects to generate your study schedule</Text>
                            <Text fontSize="sm" color="gray.400">Choose from your subjects and click "Generate Today's Schedule"</Text>
                          </VStack>
                        </Center>
                      )}
                    </Box>
                  </Grid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>

      {/* Multi-step Wizard Modal */}
      <Modal isOpen={addCourseModal.isOpen} onClose={addCourseModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {wizardStep === 1 ? 'Choose Template' :
             wizardStep === 2 ? 'Subject Details' :
             'Additional Information'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {wizardStep === 1 && (
              <VStack spacing={4} align="stretch">
                <Text>Choose a template or start from scratch</Text>
                <SimpleGrid columns={2} spacing={4}>
                  {subjectTemplates.map(template => (
                    <Card
                      key={template.id}
                      cursor="pointer"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setWizardStep(2);
                      }}
                      _hover={{ shadow: 'md' }}
                    >
                      <CardBody>
                        <VStack align="start" spacing={2}>
                          <Heading size="sm">{template.name}</Heading>
                          <Text fontSize="sm" color="gray.500">{template.description}</Text>
                          <HStack>
                            <Badge>{template.category}</Badge>
                            <Badge>{template.defaultHours}h</Badge>
                            <Badge>{template.defaultDifficulty}</Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                  <Card
                    cursor="pointer"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setWizardStep(2);
                    }}
                    _hover={{ shadow: 'md' }}
                  >
                    <CardBody>
                      <VStack align="center" spacing={2}>
                        <Icon as={FaPlus} boxSize={6} />
                        <Text>Start from scratch</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            )}

            {wizardStep === 2 && (
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Subject Name</FormLabel>
                  <Input
                    placeholder="Enter subject name"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <HStack spacing={2} overflowX="auto">
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        size="sm"
                        variant={selectedCategory === category.id ? 'solid' : 'outline'}
                        colorScheme={category.color}
                        leftIcon={<Icon as={FaBook} />}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Estimated Hours</FormLabel>
                  <NumberInput
                    min={1}
                    max={1000}
                    value={duration.hours}
                    onChange={(_, value) => setDuration(prev => ({ ...prev, hours: value }))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </FormControl>
              </VStack>
            )}

            {wizardStep === 3 && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Enter a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Add a tag"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (newTopic.trim()) {
                          setTopics([...topics, newTopic.trim()]);
                          setNewTopic('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </HStack>
                  <Wrap mt={2}>
                    {topics.map((topic, index) => (
                      <WrapItem key={index}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                        >
                          <TagLabel>{topic}</TagLabel>
                          <TagCloseButton
                            onClick={() => setTopics(topics.filter((_, i) => i !== index))}
                          />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              {wizardStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setWizardStep(wizardStep - 1)}
                >
                  Back
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button
                  colorScheme="blue"
                  onClick={() => setWizardStep(wizardStep + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={handleAddCourse}
                  isLoading={isLoading}
                >
                  Add Subject
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StudyPlan; 