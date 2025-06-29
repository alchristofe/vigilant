"use client";

import { useState } from "react";
import { WebcamMonitor } from "@/components/webcam-monitor";
import { IncidentLog } from "@/components/incident-log";
import { SuspicionMeter } from "@/components/suspicion-meter";
import { Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Incident } from "@/lib/types";
import type { DetectSuspiciousActivityOutput } from "@/ai/flows/detect-suspicious-activity";

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overallSuspicion, setOverallSuspicion] = useState(0);

  const handleNewIncident = (incidentData: Omit<DetectSuspiciousActivityOutput, 'isSuspicious'>) => {
    const newIncident: Incident = {
      id: new Date().toISOString() + Math.random(), // simple unique id
      timestamp: new Date(),
      description: incidentData.activityDescription,
      level: incidentData.suspicionLevel,
    };
    
    setIncidents((prevIncidents) => {
      const updatedIncidents = [newIncident, ...prevIncidents];

      // Recalculate overall suspicion level
      const totalLevel = updatedIncidents.reduce((sum, inc) => sum + inc.level, 0);
      const newOverallSuspicion = updatedIncidents.length > 0 ? totalLevel / updatedIncidents.length : 0;
      setOverallSuspicion(newOverallSuspicion);

      return updatedIncidents;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 border-b shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary w-8 h-8"/>
            <h1 className="text-2xl font-bold font-headline">Vigilance</h1>
          </div>
          <div>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/firebase/studio-extra-sauce" aria-label="Github Repository" target="_blank" rel="noopener noreferrer">
                <Github />
              </a>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
          <div className="lg:col-span-3 flex flex-col gap-8">
            <WebcamMonitor onIncident={handleNewIncident} />
            <SuspicionMeter level={overallSuspicion} />
          </div>
          <div className="lg:col-span-2 min-h-[400px] lg:min-h-0">
            <IncidentLog incidents={incidents} />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t shrink-0">
        Powered by AI. For demonstration purposes only.
      </footer>
    </div>
  );
}
