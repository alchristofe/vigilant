"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { detectSuspiciousActivity } from "@/ai/flows/detect-suspicious-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { DetectSuspiciousActivityOutput } from "@/ai/flows/detect-suspicious-activity";
import { Camera, CameraOff, Loader2 } from "lucide-react";

type WebcamMonitorProps = {
  onIncident: (incident: Omit<DetectSuspiciousActivityOutput, 'isSuspicious'>) => void;
};

const MONITORING_INTERVAL = 5000; // 5 seconds

export function WebcamMonitor({ onIncident }: WebcamMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(true);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (isMounted.current) {
      setIsMonitoring(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopMonitoring();
    };
  }, [stopMonitoring]);

  const startMonitoring = async () => {
    setError(null);
    setIsLoading(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current && isMounted.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted.current) {
              setIsMonitoring(true);
              setIsLoading(false);
            }
          };
        } else {
            // If component unmounted while waiting for stream, stop the tracks
            stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        if (isMounted.current) {
            console.error("Error accessing webcam:", err);
            const errorMessage = "Could not access webcam. Please check permissions.";
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Webcam Error",
              description: errorMessage,
            });
            setIsLoading(false);
        }
      }
    } else {
      if (isMounted.current) {
        const errorMessage = "Your browser does not support webcam access.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: errorMessage,
        });
        setIsLoading(false);
      }
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    if (videoRef.current?.readyState === 4 && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/jpeg");
        try {
          const result = await detectSuspiciousActivity({ webcamFeedDataUri: dataUri });
          if (result.isSuspicious && isMounted.current) {
            onIncident(result);
          }
        } catch (e) {
          console.error("AI analysis failed:", e);
        }
      }
    }
  }, [onIncident]);

  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(captureAndAnalyze, MONITORING_INTERVAL);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMonitoring, captureAndAnalyze]);

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0 relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!isMonitoring && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
            {error ? (
              <>
                <CameraOff className="w-16 h-16 text-destructive mb-4" />
                <p className="text-destructive font-semibold">{error}</p>
                <Button variant="outline" className="mt-4" onClick={startMonitoring} disabled={isLoading}>
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <Camera className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-xl font-bold font-headline mb-2">Webcam Monitoring</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Click start to begin proctoring. Your webcam will be used to detect suspicious activity.
                </p>
                <Button size="lg" onClick={startMonitoring} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Requesting Camera...' : 'Start Monitoring'}
                </Button>
              </>
            )}
          </div>
        )}
         {isMonitoring && (
          <div className="absolute bottom-4 left-4">
            <Button size="sm" variant="destructive" onClick={stopMonitoring} className="shadow-md">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Monitoring
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
