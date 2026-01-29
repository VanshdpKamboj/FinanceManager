import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import { useSelector } from "react-redux";
import { Error } from "./pages/Error";

function App() {
  const {token} = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public routes - redirect to home if already logged in */}
      <Route 
        path="/register" 
        element={!token ? <Register /> : <Navigate to="/home" replace />} 
      />
      <Route 
        path="/login" 
        element={!token ? <Login /> : <Navigate to="/home" replace />} 
      />
      
      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      
      {/* Default route */}
      <Route path="/" element={<Navigate to={token ? "/home" : "/login"} replace />} />
      
      {/* Catch all - redirect based on auth state */}
      <Route path="/*" element={<Error />} />
    </Routes>
  );
}

export default App;
