"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "pending" | "running" | "success" | "error";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface Props {
  executionId?: string | null;
}

const DEFAULT_STEPS: Step[] = [
  { id: "extract_pdf", title: "Extract from PDF" },
  { id: "determine_crime", title: "Determine Crime Type" },
  { id: "choose_lawyer", title: "Choose Lawyer" },
  { id: "email_user", title: "Email User" },
];

export function WorkflowTracker({ executionId = null }: Props) {
  const steps = useMemo(() => DEFAULT_STEPS, []);
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    () => steps.reduce((acc, s) => { acc[s.id] = "pending"; return acc; }, {} as Record<string, Status>)
  );
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});

  // Helper to update one step
  const setStep = (id: string, status: Status, data?: any) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setTimestamps((prev) => ({ ...prev, [id]: new Date().toLocaleTimeString() }));
  };

  // Expose a simple global hook so you can push events from your n8n wiring later
  useEffect(() => {
    (window as any).vaibeeUpdateWorkflow = (payload: { node: string; status: Status; data?: any }) => {
      const { node, status } = payload || {}; 
      if (!node) return;
      if (!(["pending","running","success","error"] as const).includes(status as Status)) return;
      setStep(node, status);
    };
    return () => {
      try { delete (window as any).vaibeeUpdateWorkflow; } catch {}
    };
  }, []);

  const renderBadge = (status: Status) => {
    switch (status) {
      case "running":
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-black text-white">RUNNING</span>;
      case "success":
        return <span className="px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: "#1EA887", color: "white" }}>DONE</span>;
      case "error":
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-red-600 text-white">ERROR</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-white text-black border border-black">PENDING</span>;
    }
  };

  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl font-bold mb-2">Workflow Progress</h2>
      <p className="text-sm font-normal mb-6">
        Track your n8n nodes in real time. Use
        {" "}
        <code>
          {"window.vaibeeUpdateWorkflow("}
          {"{"}{" node: \"determine_crime\", status: \"running\" "}{"}"}
          {")"}
        </code>
        {" "}
        to push updates.
      </p>

      <div className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const status = statuses[step.id] as Status;
          const isActive = status === "running" || status === "success";
          return (
            <div key={step.id} className="flex items-stretch">
              {/* Connector line */}
              <div className="flex flex-col items-center mr-3">
                <div className={`w-3 h-3 border border-black ${isActive ? "bg-black" : "bg-white"}`} />
                {index < steps.length - 1 && (
                  <div className="w-[2px] flex-1 bg-black" />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 border-2 border-black bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-base">{step.title}</div>
                  {renderBadge(status)}
                </div>
                {timestamps[step.id] && (
                  <div className="text-xs font-normal text-gray-600 mt-1">{timestamps[step.id]}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


