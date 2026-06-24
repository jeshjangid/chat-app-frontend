import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const isDev = import.meta.env.DEV;
const socketUrl = isDev ? window.location.origin : backendUrl;

axios.defaults.baseURL = isDev ? '' : backendUrl;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        await axios.post('/api/auth/refresh');
        return await axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [socket, setSocket] = useState(null)

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
      query: {
        userId: userData._id,
      },
    })

    newSocket.connect()
    setSocket(newSocket)
    newSocket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds)
    })
  }

  const checkAuthUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/check')
      if (data.success && data.user) {
        setAuthUser(data.user)
        connectSocket(data.user)
      } else {
        setAuthUser(null)
      }
    } catch (error) {
      setAuthUser(null)
    }
  }

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success || data.message) {
        await checkAuthUser();
        toast.success(data.message || 'Logged in successfully')
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      // Ignore logout API errors so the UI still clears local auth state
    } finally {
      setAuthUser(null)
      setOnlineUsers([])
      if (socket?.disconnect) {
        socket.disconnect()
      }
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', body);
      if (data.success) {
        setAuthUser(data.user)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    checkAuthUser()
  }, [])

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    checkAuthUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}