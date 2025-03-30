
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wifi } from 'lucide-react';

interface VideoContainerProps {
  title: string;
  stream: MediaStream | null;
  mirror?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  connected?: boolean;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  title,
  stream,
  mirror = false,
  isLoading = false,
  loadingText = 'Loading...',
  connected = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="h-full">
      <CardHeader className="p-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          {connected && <Wifi className="h-4 w-4 text-green-500 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 aspect-video">
        <div className="video-container h-full w-full bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={title === 'You'}
            className={`h-full w-full object-cover ${mirror ? 'mirror' : ''}`}
          />
          
          {isLoading && (
            <div className="connecting-overlay">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-white text-sm">{loadingText}</p>
              </div>
            </div>
          )}
          
          {!isLoading && !stream && (
            <div className="connecting-overlay">
              <p className="text-white text-sm">Waiting to connect...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
