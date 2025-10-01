import { useCallback, useRef, useState, useEffect } from 'react';
import type {
  VisualizationType,
  GainStateType,
  CreateNewAnalyserProps,
  CreateNewGainProps,
} from '@/types/audio';
import type { EngineModule } from '@/types/engine';
import { visualizeAudio } from '@/lib/audio/visualization';

export function useAudioVisualization() {
  const [gainState, setGainState] = useState<Record<string, GainStateType>>({});
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const wasmModuleRef = useRef<EngineModule | null>(null);

  const createNewAnalyser = useCallback(
    ({ audioCtx, fftSize = 32 }: CreateNewAnalyserProps): AnalyserNode => {
      const newAnalyser: AnalyserNode = audioCtx.createAnalyser();
      newAnalyser.fftSize = fftSize;
      return newAnalyser;
    },
    []
  );

  const createNewGain = useCallback(
    ({
      audioCtx,
      gainNodeName,
      gainChannel,
      gain = 1,
    }: CreateNewGainProps): GainStateType => {
      const newGain: GainNode = audioCtx.createGain();
      newGain.gain.setValueAtTime(gain, audioCtx.currentTime);

      const gainInfo = {
        node: newGain,
        gain: gain,
        gainChannel: gainChannel,
      };

      setGainState(prevState => {
        return {
          ...prevState,
          [gainNodeName]: gainInfo,
        };
      });

      return gainInfo;
    },
    []
  );

  useEffect(() => {
    // Initialize WASM module
    (async () => {
      try {
        const { loadEngine } = await import('@/lib/wasm');
        const engine = await loadEngine();
        wasmModuleRef.current = engine;
        console.log('WASM initialized with audio visualization functions');
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  const startAudio = useCallback(
    async (
      type: VisualizationType,
      canvas: HTMLCanvasElement,
      audioFile: File
    ) => {
      try {
        let audioBuffer: ArrayBuffer | undefined;

        audioBuffer = await audioFile.arrayBuffer();

        visualizeAudio({
          createNewGain,
          canvas,
          createNewAnalyser,
          audioCtxRef,
          wasmModule: wasmModuleRef.current,
          visualizationType: type,
          audioBuffer,
        });
        setAudioInitialized(true);
        setVisualizationType(type);
      } catch (err) {
        console.error('Failed to initialize audio:', err);
      }
    },
    [createNewGain, createNewAnalyser]
  );

  return {
    gainState,
    setGainState,
    audioInitialized,
    visualizationType,
    audioCtxRef,
    startAudio,
  };
}
