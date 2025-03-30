
import SimplePeer from 'simple-peer';

export class WebRTCHandler {
  peer: SimplePeer.Instance | null = null;
  localStream: MediaStream;
  remoteStreamCallback: (stream: MediaStream) => void;
  peerId: string | null = null;
  
  constructor(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.localStream = localStream;
    this.remoteStreamCallback = onRemoteStream;
  }
  
  initializePeerConnection(peerId: string, initiator: boolean) {
    this.cleanup(); // Clean up any existing peer connection
    this.peerId = peerId;
    
    // Create a new peer connection
    this.peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });
    
    // Set up event handlers
    this.peer.on('signal', (data) => {
      // Send the signaling data to the peer via the signaling server
      const signalData = { to: peerId, data };
      window.socket?.emit('signal', signalData);
    });
    
    this.peer.on('stream', (stream) => {
      // Received remote stream
      this.remoteStreamCallback(stream);
    });
    
    this.peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      this.cleanup();
    });
    
    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.cleanup();
    });
  }
  
  processSignal(data: any) {
    if (this.peer) {
      this.peer.signal(data);
    }
  }
  
  cleanup() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Add the socket to window for global access
declare global {
  interface Window {
    socket: any;
  }
}
