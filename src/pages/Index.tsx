
import VideoChat from "@/components/VideoChat";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl w-full mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">RandomChat</h1>
          <p className="text-muted-foreground mb-6">Connect with random people around the world</p>
        </header>
        
        <Card className="shadow-lg border-accent/20">
          <CardContent className="p-4">
            <VideoChat />
          </CardContent>
        </Card>
        
        <footer className="mt-6 text-center text-muted-foreground text-sm">
          <p>By using this service, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">© {new Date().getFullYear()} RandomChat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
