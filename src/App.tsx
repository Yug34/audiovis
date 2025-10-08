import { useRef, useCallback } from 'react';
import { useAudioVisualization, useGainControl } from '@/hooks';

import { AudioUpload } from '@/components/AudioUpload';
import { AudioCanvas } from '@/components/AudioCanvas';
import { ControlsPanel } from '@/components/ControlsPanel';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gainState, setGainState, audioInitialized, audioCtxRef, startAudio } =
    useAudioVisualization();

  const { handleGainChange } = useGainControl(
    gainState,
    setGainState,
    audioCtxRef
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (canvasRef.current) {
        startAudio('file', canvasRef.current, file);
      }
    },
    [startAudio]
  );

  return (
    <div className="flex flex-col w-screen h-screen">
      <main className="flex-1 relative">
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
          <AudioCanvas ref={canvasRef} audioInitialized={audioInitialized} />

          {!audioInitialized && <AudioUpload onFileSelect={handleFileSelect} />}

          {audioInitialized && (
            <ControlsPanel
              gainState={gainState}
              onGainChange={handleGainChange}
              onParamsChange={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
