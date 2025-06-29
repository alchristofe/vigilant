"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuspicionMeterProps = {
  level: number;
};

export function SuspicionMeter({ level }: SuspicionMeterProps) {
  const getProgressColorClass = () => {
    if (level > 75) return "bg-destructive";
    if (level > 40) return "bg-accent";
    return "bg-primary";
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Overall Suspicion Level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Progress value={level} className="h-4" indicatorClassName={getProgressColorClass()} />
          <span className="text-2xl font-bold min-w-[5rem] text-right text-foreground">{Math.round(level)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
