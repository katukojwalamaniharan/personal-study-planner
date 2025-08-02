import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import StudyPlan from './pages/StudyPlan'
import About from './pages/About'
import IntroPage from './pages/IntroPage'
import theme from './theme'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/login" element={
            <ChakraProvider theme={theme}>
              <ColorModeScript initialColorMode={theme.config.initialColorMode} />
              <Login />
            </ChakraProvider>
          } />
          <Route path="/register" element={
            <ChakraProvider theme={theme}>
              <ColorModeScript initialColorMode={theme.config.initialColorMode} />
              <Register />
            </ChakraProvider>
          } />
          <Route
            path="/home"
            element={
              <ChakraProvider theme={theme}>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              </ChakraProvider>
            }
          />
          <Route
            path="/profile"
            element={
              <ChakraProvider theme={theme}>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              </ChakraProvider>
            }
          />
          <Route
            path="/study-plan"
            element={
              <ChakraProvider theme={theme}>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <PrivateRoute>
                  <StudyPlan />
                </PrivateRoute>
              </ChakraProvider>
            }
          />
          <Route path="/about" element={
            <ChakraProvider theme={theme}>
              <ColorModeScript initialColorMode={theme.config.initialColorMode} />
              <About />
            </ChakraProvider>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App 