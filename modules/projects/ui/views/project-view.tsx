"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/lib/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { CesiumWrapper } from "@/app/dashboard/components/CesiumWrapper";
import type { Position } from "@/app/dashboard/types/position";
import { oceanPoints } from "@/app/dashboard/data/ocean-points";
import { PdfUpload } from "../components/pdf-upload";
import { ContactInformation } from "../components/contact-information";
import { WorkflowTracker } from "../components/workflow-tracker";

type TabCategory = "REPORT ANALYSIS" | "README.TXT" | "CONTACT INFORMATION";

interface Props {
    projectId:  string;
}

export const ProjectView =({projectId} : Props)=> {
    const [activateFragment, setActivateFragment] = useState<Fragment | null>(null);
    const [activeTab, setActiveTab] = useState<TabCategory>("README.TXT");
    
    // Ocean points across Indian and Pacific Ocean
    const positions = oceanPoints;

    const tabs: TabCategory[] = ["REPORT ANALYSIS", "README.TXT", "CONTACT INFORMATION"];

    const renderTabContent = () => {
        switch (activeTab) {
            case "REPORT ANALYSIS":
                return (
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <PdfUpload projectId={projectId} />
                    </div>
                );
            case "README.TXT":
                return (
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <WorkflowTracker />
                    </div>
                );
            case "CONTACT INFORMATION":
                return (
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <ContactInformation projectId={projectId} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
      <div className="h-screen bg-[#6c6c6c] font-bold">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={65}
            minSize={50}
            className="flex flex-col min-h-0"
          >
            <Suspense fallback={<p>Loading project</p>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
            <Suspense fallback={<p>Loading....</p>}>
              <MessagesContainer
                projectId={projectId}
                activateFragment={activateFragment}
                setActivateFragment={setActivateFragment}
              />
            </Suspense>
          </ResizablePanel>
          <ResizableHandle className="hover:bg-primary transition-colors" />
          <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col bg-white">
            {/* Tab Header */}
            <div className="flex border-b border-black shrink-0">
              {tabs.map((tab, index) => (
                <div key={tab} className="flex">
                  {index > 0 && (
                    <div className="w-px bg-black" />
                  )}
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-bold transition-colors shrink-0 whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              {renderTabContent()}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
}