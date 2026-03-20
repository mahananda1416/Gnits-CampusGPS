import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import CampusNavigator from './CampusNavigator'
import ClassroomOccupancy from './ClassroomOccupancy'
import VideoMonitoring from './VideoMonitoring'
import Login from './Login';
import ProtectedRoute  from './ProtectedRoute';
import { AuthProvider } from './AuthContext';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />}/>
            <Route path="/" element={<HomePage />} />
            <Route path="/navigation" element={
              <ProtectedRoute allowedRoles={["student", "faculty", "admin"]}>
                <CampusNavigator /> 
              </ProtectedRoute>} 
            />

            <Route path="/occupancy" element={
              <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                <ClassroomOccupancy />
              </ProtectedRoute>
              }
            />
            <Route path="/video" element={
              <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                <VideoMonitoring />
              </ProtectedRoute>
            }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App