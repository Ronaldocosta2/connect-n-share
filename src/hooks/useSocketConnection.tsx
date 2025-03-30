
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/use-toast';

export const useSocketConnection = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });
    
    // Store socket in window for global access
    window.socket = socketInstance;
    
    setSocket(socketInstance);
    
    // Set up event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
      setConnected(true);
      
      // Automatically emit ready event when connected
      socketInstance.emit('ready');
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the server. Please try again later."
      });
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setConnected(false);
      toast({
        variant: "destructive",
        title: "Disconnected",
        description: "You've been disconnected from the server. Trying to reconnect..."
      });
    });
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
      window.socket = null;
    };
  }, [url, toast]);
  
  return { socket, connected };
};
