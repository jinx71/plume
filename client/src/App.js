import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Provider order matters: SocketProvider reads auth state, so it sits inside
// AuthProvider; both sit inside the router so navigation hooks are available.
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/u/:username" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="bottom-center"
          autoClose={2500}
          hideProgressBar
          newestOnTop
          closeOnClick
          theme="light"
          toastClassName="!rounded-xl !text-sm"
        />
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
