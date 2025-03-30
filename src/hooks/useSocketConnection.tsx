
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/use-toast';

export const useSocketConnection = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize socket connection with more robust connection options
    const socketInstance = io(url, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'], // Try both transports
      upgrade: true
    });
    
    // Store socket in window for global access
    window.socket = socketInstance;
    
    setSocket(socketInstance);
    
    // Set up event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
      setConnected(true);
      
      toast({
        title: "Connected to server",
        description: "You can now start chatting with other users."
      });
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the server. Retrying..."
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
  
  // Add a function to emit ready event
  const emitReady = useCallback((preferences: any) => {
    if (socket && connected) {
      console.log('Emitting ready event with preferences:', preferences);
      socket.emit('ready', { preferences });
      return true;
    }
    
    toast({
      variant: "destructive",
      title: "Not Connected",
      description: "Cannot search while disconnected from the server."
    });
    return false;
  }, [socket, connected, toast]);
  
  return { socket, connected, emitReady };
};
