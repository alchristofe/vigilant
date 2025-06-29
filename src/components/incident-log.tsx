"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, EyeOff, Users, Smartphone } from "lucide-react";
import type { Incident } from "@/lib/types";

type IncidentLogProps = {
  incidents: Incident[];
};

const getIncidentIcon = (description: string) => {
  const lowerCaseDesc = description.toLowerCase();
  if (lowerCaseDesc.includes("looking away") || lowerCaseDesc.includes("gaze")) {
    return <EyeOff className="h-5 w-5 text-accent shrink-0" />;
  }
  if (lowerCaseDesc.includes("person") || lowerCaseDesc.includes("people")) {
    return <Users className="h-5 w-5 text-accent shrink-0" />;
  }
  if (lowerCaseDesc.includes("phone") || lowerCaseDesc.includes("device")) {
    return <Smartphone className="h-5 w-5 text-accent shrink-0" />;
  }
  return <AlertTriangle className="h-5 w-5 text-accent shrink-0" />;
};

export function IncidentLog({ incidents }: IncidentLogProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Incident Log</CardTitle>
        <CardDescription>Suspicious activities are logged here in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 pt-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-10">
              <Badge variant="secondary">All Clear</Badge>
              <p className="mt-4 text-sm">No suspicious activity detected yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Timestamp</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-[80px]">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id} className="animate-in fade-in-50">
                    <TableCell className="font-medium align-top">
                      {incident.timestamp.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {getIncidentIcon(incident.description)}
                        <span>{incident.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Badge variant={incident.level > 75 ? "destructive" : "secondary"} className={incident.level > 40 && incident.level <= 75 ? "bg-accent hover:bg-accent/80 text-accent-foreground" : ""}>
                        {incident.level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
