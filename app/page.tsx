import { ControlPanel } from "@/components/ControlPanel";
import { TopBar } from "@/components/TopBar";
import { Viewport } from "@/components/Viewport";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-studio-bg text-studio-text">
      <TopBar />
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:h-[calc(100vh-56px)] lg:grid-cols-[minmax(0,1fr)_360px]">
        <Viewport />
        <ControlPanel />
      </div>
    </main>
  );
}
