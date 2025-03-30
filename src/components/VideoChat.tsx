
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { VideoContainer } from './VideoContainer';
import { WebRTCHandler } from '@/lib/webrtc';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { Video, RefreshCw, Loader2 } from 'lucide-react';

const VideoChat: React.FC = () => {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const webRTCRef = useRef<WebRTCHandler | null>(null);
  
  const { socket, connected: socketConnected } = useSocketConnection('https://random-chat-backend.onrender.com');

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          }, 
          audio: true 
        });
        
        setLocalStream(stream);
        setInitialized(true);
        
        // Initialize the WebRTC handler
        webRTCRef.current = new WebRTCHandler(stream, handleRemoteStream);
        
      } catch (err) {
        console.error('Error accessing media devices:', err);
        toast({
          variant: "destructive",
          title: "Camera Access Error",
          description: "Please allow camera and microphone access to use this app."
        });
      }
    };

    initializeMedia();

    return () => {
      // Clean up media streams when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (webRTCRef.current) {
        webRTCRef.current.cleanup();
      }
    };
  }, [toast]);

  useEffect(() => {
    if (!socket || !webRTCRef.current || !initialized) return;

    // Handle match event
    socket.on('match', ({ peerId }) => {
      console.log('Matched with peer:', peerId);
      setConnecting(true);
      
      // Create and initialize peer connection
      webRTCRef.current?.initializePeerConnection(peerId, true);
    });

    // Handle signal event 
    socket.on('signal', ({ from, data }) => {
      console.log('Received signal from:', from);
      
      // If we haven't initialized a peer connection yet, create one
      if (!webRTCRef.current?.peer && initialized) {
        webRTCRef.current?.initializePeerConnection(from, false);
      }
      
      // Process the signaling data
      webRTCRef.current?.processSignal(data);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('match');
      socket.off('signal');
    };
  }, [socket, initialized]);

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
    setConnecting(false);
    setConnected(true);
    
    toast({
      title: "Connected!",
      description: "You are now chatting with a random person."
    });
  };

  const handleFindNewPeer = () => {
    // Reset connection state
    setConnected(false);
    setConnecting(true);
    setRemoteStream(null);
    
    // Clean up previous peer connection
    webRTCRef.current?.cleanup();
    
    // Tell the server we're ready for a new match
    if (socket) {
      socket.emit('ready');
      
      toast({
        title: "Finding someone new...",
        description: "Please wait while we connect you."
      });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl gap-6 p-4">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Local Video */}
        <div className="w-full md:w-1/2">
          <VideoContainer 
            title="You" 
            stream={localStream} 
            mirror={true} 
            isLoading={!initialized} 
            loadingText="Initializing camera..." 
          />
        </div>
        
        {/* Remote Video */}
        <div className="w-full md:w-1/2">
          <VideoContainer 
            title="Stranger" 
            stream={remoteStream} 
            isLoading={connecting} 
            loadingText="Connecting..." 
            connected={connected} 
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-4 mt-4">
        <Button 
          size="lg"
          variant={socketConnected ? "default" : "secondary"}
          onClick={handleFindNewPeer}
          disabled={!socketConnected || !initialized || connecting}
          className="gap-2"
        >
          {connecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : connected ? (
            <>
              <RefreshCw className="h-5 w-5" />
              Next Person
            </>
          ) : (
            <>
              <Video className="h-5 w-5" />
              Start Chatting
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
