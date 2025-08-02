import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function IntroPage() {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-600">📖 StudyPlanner</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/about" className="hover:text-purple-500">About</Link>
            <button
              type="button"
              className="hover:text-purple-500 focus:outline-none"
              onClick={() => setShowContact(true)}
            >
              Contact
            </button>
          </nav>
          <button
            onClick={handleGetStartedClick}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="text-center py-24 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-block bg-white p-4 rounded-full shadow mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-3xl">📘</span>
        </motion.div>
        <h1 className="text-5xl font-bold text-purple-700 mb-4">StudyPlanner</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your study routine with structured learning, progress tracking, and habit building.
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/learn-more"
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
          >
            Learn More
          </Link>
          <Link
            to="/demo"
            className="bg-white text-purple-700 px-6 py-3 border border-purple-600 rounded hover:bg-purple-100 transition"
          >
            View Demo
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="bg-white py-20 px-4 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">Organized Planning</h3>
            <p className="text-gray-600">Transform chaotic study sessions into structured, goal-oriented learning plans.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Visualize your learning journey with detailed analytics and streak counters.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Daily Focus</h3>
            <p className="text-gray-600">Stay motivated with daily planning views and habit-building features.</p>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Routine?</h2>
        <p className="mb-8 text-lg">
          Join thousands of students who are already achieving their academic goals with StudyPlanner.
        </p>
        <Link
          to="/our-story"
          className="bg-white text-blue-700 px-6 py-3 rounded hover:bg-blue-100 transition"
        >
          Discover Our Story →
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-sm text-gray-600">
        <div className="mb-2">
          <span className="font-semibold text-purple-600">📖 StudyPlanner</span>
        </div>
        <p>Made with 💙 by students for students</p>
        <div className="mt-2 flex justify-center gap-6">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        {/* Contact Details */}
        <div className="mt-6 flex flex-col items-center gap-2 text-gray-700">
          <div>
            <span className="font-semibold">Phone:</span> 
            <a href="tel:+919550684413" className="text-blue-600 hover:underline mr-2">+91 9550684413</a>
            <a href="tel:+919949790140" className="text-blue-600 hover:underline">+91 9949790140</a>
          </div>
          <div>
            <span className="font-semibold">Email:</span> 
            <a href="mailto:katukojwalamaniharanchary@gmail.com" className="text-blue-600 hover:underline">katukojwalamaniharanchary@gmail.com</a>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowContact(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-700">Contact Details</h2>
            <div className="mb-2">
              <span className="font-semibold">Phone:</span><br />
              <a href="tel:+919550684413" className="text-blue-600 hover:underline mr-2">+91 9550684413</a>
              <a href="tel:+919949790140" className="text-blue-600 hover:underline">+91 9949790140</a>
            </div>
            <div>
              <span className="font-semibold">Email:</span><br />
              <a href="mailto:katukojwalamaniharanchary@gmail.com" className="text-blue-600 hover:underline">katukojwalamaniharanchary@gmail.com</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
