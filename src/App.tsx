import { useRef, useCallback } from 'react';
import { useAudioVisualization, useGainControl } from '@/hooks';
import {
  AudioCanvas,
  AudioSourceSelector,
  GainControls,
  VisualizationControls,
} from '@/components/AudioControls';

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

          {!audioInitialized && (
            <AudioSourceSelector onFileSelect={handleFileSelect} />
          )}

          {audioInitialized && (
            <div className="absolute top-4 left-4 right-4 flex gap-4">
              <GainControls
                gainState={gainState}
                onGainChange={handleGainChange}
              />
              <VisualizationControls onParamsChange={() => {}} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
