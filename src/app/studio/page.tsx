"use client";

import React, { useState, useEffect } from "react";
import StudioHeader from "@/components/studio/StudioHeader";
import ProjectConfig from "@/components/studio/ProjectConfig";
import PipelineStatus from "@/components/studio/PipelineStatus";
import StoryboardEditor from "@/components/studio/StoryboardEditor";
import VideoPreviewModal from "@/components/studio/VideoPreviewModal";
import AnalyticsDashboard from "@/components/studio/AnalyticsDashboard";
import NewProjectModal from "@/components/studio/NewProjectModal";
import { DarkChannel } from "@/lib/youtube/channel-manager";
import { INITIAL_DEMO_SCENES } from "@/lib/constants";
import { SceneItem, VideoFormat, Language } from "@/lib/types";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"STUDIO" | "ANALYTICS">("STUDIO");
  const [studioStep, setStudioStep] = useState<"CONFIG" | "PROCESSING" | "STORYBOARD">("CONFIG");
  const [currentPipelineStage, setCurrentPipelineStage] = useState(1);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [topicTitle, setTopicTitle] = useState("O Mistério Inexplicável do Voo MH370");
  const [scenes, setScenes] = useState<SceneItem[]>(INITIAL_DEMO_SCENES);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<DarkChannel | null>(null);
  const [projectResetKey, setProjectResetKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [configuredDuration, setConfiguredDuration] = useState(10);

  // Minutes and concurrent renders state
  const [availableMinutes, setAvailableMinutes] = useState(184.5);
  const maxMinutes = 195.0; // Creator tier
  const [concurrentRenders, setConcurrentRenders] = useState(0);

  // Simulated 8-stage pipeline progression
  useEffect(() => {
    if (studioStep !== "PROCESSING") return;

    setConcurrentRenders(1);
    const interval = setInterval(() => {
      setPipelineProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStudioStep("STORYBOARD");
          setConcurrentRenders(0);
          setAvailableMinutes((m) => Math.max(0, m - configuredDuration));
          return 100;
        }

        const next = prev + 5;
        const stageIndex = Math.min(8, Math.max(1, Math.ceil((next / 100) * 8)));
        setCurrentPipelineStage(stageIndex);
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [studioStep, configuredDuration]);

  const handleStartPipeline = async (config: {
    topic: string;
    format: VideoFormat;
    language: Language;
    voiceId: string;
    customScript?: string;
    targetDuration: number;
    visualStyle?: "AI_GENERATED" | "STOCK_4K";
  }) => {
    setConfiguredDuration(config.targetDuration || 10);
    setTopicTitle(config.topic);
    setPipelineProgress(5);
    setCurrentPipelineStage(1);
    setStudioStep("PROCESSING");
    setIsNewProjectModalOpen(false);

    try {
      const res = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          targetDurationMinutes: config.targetDuration,
          visualStyle: config.visualStyle || "STOCK_4K",
        }),
      });
      const data = await res.json();
      if (data.success && data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes);
        if (data.title) setTopicTitle(data.title);
      }
    } catch (e) {
      console.error("Erro ao chamar API de roteiro:", e);
    }
  };

  const handleUpdateScene = (sceneId: string, updatedFields: Partial<SceneItem>) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, ...updatedFields } : s))
    );
  };

  const handleNewProject = () => {
    setActiveTab("STUDIO");
    setStudioStep("CONFIG");
    setPipelineProgress(0);
    setCurrentPipelineStage(1);
    setIsNewProjectModalOpen(true);
    setProjectResetKey((prev) => prev + 1);
    setToastMessage("✨ Pronto para criar um novo projeto!");

    // Suporte a foco e rolagem imediata se o usuário preferir usar a página
    setTimeout(() => {
      const input = document.getElementById("project-topic-input");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
      }
    }, 150);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Studio Fixed Header with Balances */}
      <StudioHeader
        availableMinutes={availableMinutes}
        maxMinutes={maxMinutes}
        concurrentRenders={concurrentRenders}
        maxConcurrentRenders={1}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeChannel={activeChannel}
        onChannelChanged={(channel) => setActiveChannel(channel)}
        onNewProject={handleNewProject}
        onMinutesRecharged={(newM) => setAvailableMinutes(newM)}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-24 sm:pb-8">
        {activeTab === "ANALYTICS" ? (
          <AnalyticsDashboard
            activeChannel={activeChannel}
            onNewProject={handleNewProject}
          />
        ) : (
          <>
            {studioStep === "CONFIG" && (
              <ProjectConfig
                onStartPipeline={handleStartPipeline}
                isProcessing={false}
                resetKey={projectResetKey}
                activeChannel={activeChannel}
              />
            )}

            {studioStep === "PROCESSING" && (
              <PipelineStatus
                currentStage={currentPipelineStage}
                progressPercentage={pipelineProgress}
                onComplete={() => setStudioStep("STORYBOARD")}
                topicTitle={topicTitle}
                scenes={scenes}
              />
            )}

            {studioStep === "STORYBOARD" && (
              <StoryboardEditor
                scenes={scenes}
                onUpdateScene={handleUpdateScene}
                onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
                onOpenYouTubePublishModal={() => {
                  setIsPreviewModalOpen(true);
                  setIsYouTubeModalOpen(true);
                }}
                topicTitle={topicTitle}
                onNewProject={handleNewProject}
              />
            )}
          </>
        )}
      </main>

      {/* Video Preview & YouTube Publish Modal */}
      <VideoPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        topicTitle={topicTitle}
        scenes={scenes}
        isPublishingToYouTube={isYouTubeModalOpen}
      />

      {/* New Project Quick Creation Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleStartPipeline}
        initialTopic=""
        activeChannel={activeChannel}
      />

      {/* Toast Notification Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] px-4 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-2xl border border-brand-400/40 animate-fadeIn flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
