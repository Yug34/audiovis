import type { EngineModule } from './engine';

export type VisualizationType = 'oscillator' | 'file' | 'microphone';
export type OutputChannelTypes = 'Left' | 'Right';

export type OscillatorStateType = {
  node: OscillatorNode;
  frequency: number;
  oscillatorChannel: OutputChannelTypes;
};

export type GainStateType = {
  node: GainNode;
  gain: number;
  gainChannel: OutputChannelTypes;
};

export type CreateNewGainProps = {
  audioCtx: AudioContext;
  gainNodeName: string;
  gainChannel: OutputChannelTypes;
  gain?: number;
};

export type CreateNewOscillatorProps = {
  audioCtx: AudioContext;
  oscillatorName: string;
  oscillatorChannel: OutputChannelTypes;
  frequency?: number;
};

export type CreateNewAnalyserProps = {
  audioCtx: AudioContext;
  fftSize?: number;
};

export type VisualizeAudioProps = {
  createNewAnalyser(props: CreateNewAnalyserProps): AnalyserNode;
  createNewGain(props: CreateNewGainProps): GainStateType;
  canvas: HTMLCanvasElement;
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
  wasmModule: EngineModule | null;
  visualizationType: VisualizationType;
  audioBuffer?: ArrayBuffer;
};

export type DrawHaloProps = {
  analyserRight: AnalyserNode;
  analyserLeft: AnalyserNode;
  canvas: HTMLCanvasElement;
  fftSize: number;
  padding?: number;
  gapBetweenBars?: number;
  wasmModule: EngineModule | null;
  frameCount?: number;
  params?: CircularVisualizationParams;
};

export type CircularVisualizationParams = {
  stepFactor: number;
  colorStepFactor: number;
  opacity: number;
  radius: number;
  panSpeed: number;
  panRadius: number;
  rotationSpeed: number;
};
