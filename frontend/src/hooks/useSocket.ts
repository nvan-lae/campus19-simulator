import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext'; 

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth(); // <--- Getting token from your existing Context

  useEffect(() => {
    // Don't connect if we are not logged in
    if (!token) return;

    // 1. Initialize connection
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${token}`, // Matches the Backend Gateway logic
      },
      withCredentials: true,
      autoConnect: true,
    });

    // 2. Listen for connection success
    newSocket.on('connect', () => {
      console.log('🟢 Socket Connected! ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Socket Error:', err.message);
    });

    // 3. Save instance
    setSocket(newSocket);

    // 4. Cleanup on unmount (or logout)
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return socket;
};