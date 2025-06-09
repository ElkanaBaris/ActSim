import { Switch, Route } from "wouter";
import { useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TacticalSimulator from "@/pages/tactical-simulator";
import NotFound from "@/pages/not-found";
import { createScenarioSocket } from "./lib/scenarioSocket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TacticalSimulator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = createScenarioSocket();
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
