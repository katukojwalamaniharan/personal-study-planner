import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw6gqAR6HiHcIFJds0fvaz100RV9r8w3A",
  authDomain: "personal-study-planner-46ac0.firebaseapp.com",
  projectId: "personal-study-planner-46ac0",
  storageBucket: "personal-study-planner-46ac0.appspot.com",
  messagingSenderId: "847323680583",
  appId: "1:847323680583:web:dc1fd92e844da778660662",
  measurementId: "G-HQ63790Z7H"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_STUDY_PLANS: 'user_study_plans',
  USER_GOALS: 'user_goals',
  USER_PROGRESS: 'user_progress',
  TESTIMONIALS: 'testimonials',
  USER_BADGES: 'user_badges'
};

// Badge definitions
export const BADGES = {
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Complete your profile with all required information',
    icon: '🎯',
    color: 'green'
  },
  PROFILE_PICTURE: {
    id: 'profile_picture',
    name: 'Picture Perfect',
    description: 'Add a profile picture',
    icon: '📸',
    color: 'blue'
  },
  STUDY_PLAN: {
    id: 'study_plan',
    name: 'Study Strategist',
    description: 'Create your first study plan',
    icon: '📚',
    color: 'purple'
  },
  GOALS_SET: {
    id: 'goals_set',
    name: 'Goal Getter',
    description: 'Set your first learning goals',
    icon: '🎯',
    color: 'orange'
  }
};

// Default values for user data
const DEFAULT_USER_PROFILE = {
  fullName: '',
  currentSemester: '',
  fieldOfStudy: '',
  institution: '',
  photoURL: '',
  goals: [],
  interests: [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

const DEFAULT_USER_PROGRESS = {
  completedTasks: 0,
  totalTasks: 0,
  level: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

// Helper function to create or update user profile
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    console.log('Creating user profile for:', userId);
    
    // Create main user document
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      email: userData.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active'
    });
    console.log('User document created');

    // Create user profile document
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    await setDoc(profileRef, {
      fullName: userData.fullName,
      dateOfBirth: userData.dateOfBirth,
      educationLevel: userData.educationLevel,
      fieldOfStudy: userData.fieldOfStudy,
      institution: userData.institution,
      graduationYear: userData.graduationYear,
      goals: userData.goals,
      interests: userData.interests,
      onboardingCompleted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('User profile document created');

    // Create initial study plan
    const studyPlanRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId);
    const studyPlanData = {
      currentSemester: '1',
      totalSemesters: '8',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      courses: [] // Initialize empty courses array
    };
    await setDoc(studyPlanRef, studyPlanData);
    console.log('Study plan document created with data:', studyPlanData);

    // Create initial goals document
    const goalsRef = doc(db, COLLECTIONS.USER_GOALS, userId);
    await setDoc(goalsRef, {
      shortTermGoals: [],
      longTermGoals: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Goals document created');

    // Create initial progress document
    const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, userId);
    await setDoc(progressRef, {
      completedTasks: 0,
      totalTasks: 0,
      lastUpdated: serverTimestamp()
    });
    console.log('Progress document created');

    console.log('All user documents created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Helper function to get user profile with error handling
export const getUserProfile = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Fetching profile for user:', userId);
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      console.log('Profile found:', profileDoc.data());
      return {
        ...DEFAULT_USER_PROFILE,
        ...profileDoc.data(),
        id: profileDoc.id
      };
    }
    
    console.log('Creating new profile for user:', userId);
    // If no profile exists, create one with default values
    const newProfile = {
      ...DEFAULT_USER_PROFILE,
      id: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(profileRef, newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error('Failed to load user profile');
  }
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updateData: any) => {
  try {
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      // If profile doesn't exist, create it
      await setDoc(profileRef, {
        ...DEFAULT_USER_PROFILE,
        ...updateData,
        id: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update existing profile
      await updateDoc(profileRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    }
    
    // Get the updated profile
    const updatedDoc = await getDoc(profileRef);
    return updatedDoc.data();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error; // Throw error to handle it in the component
  }
};

// Helper function to get user study plan
export const getUserStudyPlan = async (userId: string) => {
  try {
    console.log('Fetching study plan for user:', userId);
    const studyPlanRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId);
    const studyPlanDoc = await getDoc(studyPlanRef);
    
    if (studyPlanDoc.exists()) {
      console.log('Study plan found:', studyPlanDoc.data());
      return studyPlanDoc.data();
    }
    
    console.log('No study plan found, creating new one');
    // If no study plan exists, create one with default values
    const newStudyPlan = {
      currentSemester: '1',
      totalSemesters: '8',
      courses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(studyPlanRef, newStudyPlan);
    console.log('New study plan created:', newStudyPlan);
    
    // Create the courses subcollection
    const coursesRef = collection(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses');
    console.log('Created courses subcollection');
    
    return newStudyPlan;
  } catch (error) {
    console.error('Error getting user study plan:', error);
    throw error;
  }
};

// Helper function to get user goals
export const getUserGoals = async (userId: string) => {
  try {
    const goalsRef = doc(db, COLLECTIONS.USER_GOALS, userId);
    const goalsDoc = await getDoc(goalsRef);
    if (goalsDoc.exists()) {
      return goalsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

// Helper function to get user progress with error handling
export const getUserProgress = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log('Fetching progress for user:', userId);
    const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      console.log('Progress found:', progressDoc.data());
      return progressDoc.data();
    }
    
    console.log('Creating new progress for user:', userId);
    // If no progress exists, create one with default values
    const newProgress = {
      ...DEFAULT_USER_PROGRESS,
      id: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(progressRef, newProgress);
    return newProgress;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    throw new Error('Failed to load user progress');
  }
};

// Helper function to check if user exists
export const checkUserExists = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// Helper function to get featured testimonials with error handling
export const getFeaturedTestimonials = async () => {
  try {
    console.log('Fetching featured testimonials');
    const testimonialsRef = collection(db, COLLECTIONS.TESTIMONIALS);
    const q = query(testimonialsRef, where('featured', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No testimonials found, initializing defaults');
      // If no testimonials exist, initialize with default ones
      await initializeTestimonials();
      return [
        {
          id: '1',
          userName: "Sarah Johnson",
          userRole: "Computer Science Student",
          userPhoto: "https://bit.ly/sarah-johnson",
          content: "This study planner has completely transformed how I manage my coursework. The progress tracking and goal setting features are amazing!",
          rating: 5
        }
      ];
    }
    
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Found testimonials:', testimonials);
    return testimonials;
  } catch (error) {
    console.error('Error in getFeaturedTestimonials:', error);
    return [];
  }
};

// Helper function to add a testimonial
export const addTestimonial = async (userId: string, testimonialData: any) => {
  try {
    const testimonialRef = doc(collection(db, COLLECTIONS.TESTIMONIALS));
    await setDoc(testimonialRef, {
      userId,
      ...testimonialData,
      createdAt: serverTimestamp(),
      featured: false,
      status: 'pending'
    });
    console.log('Testimonial added successfully');
  } catch (error) {
    console.error('Error adding testimonial:', error);
    throw error;
  }
};

// Initialize test testimonials
export const initializeTestimonials = async () => {
  const testTestimonials = [
    {
      userName: "Sarah Johnson",
      userRole: "Computer Science Student",
      userPhoto: "https://bit.ly/sarah-johnson",
      content: "This study planner has completely transformed how I manage my coursework. The progress tracking and goal setting features are amazing!",
      rating: 5,
      featured: true,
      status: "approved"
    },
    {
      userName: "Michael Chen",
      userRole: "Engineering Student",
      userPhoto: "https://bit.ly/michael-chen",
      content: "The personalized study plans and progress tracking have helped me stay on top of my assignments. Highly recommended!",
      rating: 5,
      featured: true,
      status: "approved"
    },
    {
      userName: "Emma Wilson",
      userRole: "Medical Student",
      userPhoto: "https://bit.ly/emma-wilson",
      content: "As a medical student, staying organized is crucial. This app has been a game-changer for my study routine.",
      rating: 5,
      featured: true,
      status: "approved"
    }
  ];

  try {
    for (const testimonial of testTestimonials) {
      const testimonialRef = doc(collection(db, COLLECTIONS.TESTIMONIALS));
      await setDoc(testimonialRef, {
        ...testimonial,
        createdAt: serverTimestamp()
      });
    }
    console.log('Test testimonials initialized successfully');
  } catch (error) {
    console.error('Error initializing testimonials:', error);
  }
};

// Helper function to upload image to Firebase Storage
export const uploadProfileImage = async (userId: string, file: File, onProgress: (progress: number) => void) => {
  try {
    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile_images/${userId}/${fileName}`);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error;
  }
};

// Helper function to award badges
export const awardBadge = async (userId: string, badgeId: string) => {
  try {
    const badgeRef = doc(db, COLLECTIONS.USER_BADGES, userId);
    const badgeDoc = await getDoc(badgeRef);
    
    if (!badgeDoc.exists()) {
      await setDoc(badgeRef, {
        badges: [badgeId],
        updatedAt: serverTimestamp()
      });
    } else {
      const currentBadges = badgeDoc.data().badges || [];
      if (!currentBadges.includes(badgeId)) {
        await updateDoc(badgeRef, {
          badges: [...currentBadges, badgeId],
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// Helper function to get user badges
export const getUserBadges = async (userId: string) => {
  try {
    const badgeRef = doc(db, COLLECTIONS.USER_BADGES, userId);
    const badgeDoc = await getDoc(badgeRef);
    
    if (badgeDoc.exists()) {
      return badgeDoc.data().badges || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
};

// Helper function to check and award profile completion badge
export const checkAndAwardProfileBadges = async (userId: string, profile: any) => {
  try {
    const requiredFields = ['fullName', 'fieldOfStudy', 'institution', 'currentSemester', 'photoURL'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'photoURL') {
        return profile?.[field] || profile?.photoURL;
      }
      return profile?.[field] && profile[field].trim() !== '';
    });

    // Award profile picture badge
    if (profile?.photoURL) {
      await awardBadge(userId, BADGES.PROFILE_PICTURE.id);
    }

    // Award profile completion badge
    if (completedFields.length === requiredFields.length) {
      await awardBadge(userId, BADGES.PROFILE_COMPLETE.id);
    }
  } catch (error) {
    console.error('Error checking profile badges:', error);
  }
};

// Study Plan Firestore helpers (Courses)
export const getCourses = async (userId: string) => {
  if (!userId) throw new Error('User ID is required.');
  try {
    const coursesRef = collection(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses');
    const q = query(coursesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw new Error('Failed to fetch courses.');
  }
};

export const addCourse = async (userId: string, courseData: any) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseData?.name) throw new Error('Course name is required.');
  
  try {
    console.log('Adding course for user:', userId, 'with data:', courseData);
    
    // First, ensure the study plan document exists
    const studyPlanRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId);
    const studyPlanDoc = await getDoc(studyPlanRef);
    
    if (!studyPlanDoc.exists()) {
      console.log('Study plan document does not exist, creating it first');
      await setDoc(studyPlanRef, {
        currentSemester: '1',
        totalSemesters: '8',
        courses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // Now add the course
    const coursesRef = collection(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses');
    const docRef = await addDoc(coursesRef, {
      name: courseData.name,
      progress: courseData.progress || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Course added successfully with ID:', docRef.id);
    
    // Update the study plan document to include the new course
    await updateDoc(studyPlanRef, {
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding course:', error);
    throw new Error('Failed to add course. Please try again.');
  }
};

export const updateCourse = async (userId: string, courseId: string, updateData: any) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseId) throw new Error('Course ID is required.');
  try {
    const courseRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId);
    await updateDoc(courseRef, { ...updateData, updatedAt: new Date() });
  } catch (error) {
    console.error('Error updating course:', error);
    throw new Error('Failed to update course.');
  }
};

export const deleteCourse = async (userId: string, courseId: string) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseId) throw new Error('Course ID is required.');
  try {
    const courseRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId);
    await deleteDoc(courseRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course.');
  }
};

// Study Plan Firestore helpers (Tasks)

export const getTasks = (userId: string, courseId: string, onTasksUpdate: (tasks: any[]) => void, onError: (error: any) => void) => {
  if (!userId) {
    onError(new Error('User ID is required.'));
    return () => {};
  }
  if (!courseId) {
    onTasksUpdate([]); // No course selected, return empty tasks
    return () => {};
  }
  try {
    const tasksRef = collection(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId, 'tasks');
    const q = query(tasksRef, orderBy('dueDate', 'asc')); // Order tasks by due date

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to Date object if needed
          dueDate: doc.data().dueDate?.toDate() || null,
          createdAt: doc.data().createdAt?.toDate() || null,
          updatedAt: doc.data().updatedAt?.toDate() || null,
        }));
        onTasksUpdate(fetchedTasks);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        onError(new Error('Failed to fetch tasks.'));
      }
    );

    return unsubscribe; // Return the unsubscribe function

  } catch (error) {
    console.error('Error setting up tasks listener:', error);
    onError(new Error('Failed to setup tasks listener.'));
    return () => {};
  }
};

export const addTask = async (userId: string, courseId: string, taskData: any) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseId) throw new Error('Course ID is required.');
  if (!taskData?.name) throw new Error('Task name is required.');

  try {
    const tasksRef = collection(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      completed: taskData.completed || false, // Ensure completed is boolean, defaults to false
      createdAt: taskData.createdAt || new Date(),
      updatedAt: new Date(),
      // Convert Date object to Firestore Timestamp before sending
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null, // Assuming dueDate is a Date object or null
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error('Failed to add task.');
  }
};

export const updateTask = async (userId: string, courseId: string, taskId: string, updateData: any) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseId) throw new Error('Course ID is required.');
  if (!taskId) throw new Error('Task ID is required.');

  try {
    const taskRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: new Date(),
      // Convert Date object to Firestore Timestamp before sending
      dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task.');
  }
};

export const deleteTask = async (userId: string, courseId: string, taskId: string) => {
  if (!userId) throw new Error('User ID is required.');
  if (!courseId) throw new Error('Course ID is required.');
  if (!taskId) throw new Error('Task ID is required.');

  try {
    const taskRef = doc(db, COLLECTIONS.USER_STUDY_PLANS, userId, 'courses', courseId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task.');
  }
};

// Export instances
export { auth, googleProvider, db, storage };
export default app; 