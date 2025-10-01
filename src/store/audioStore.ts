import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { GainStateType, VisualizationType } from '../types/audio';
import type { EngineModule } from '../types/engine';

interface AudioStore {
  // State
  audioInitialized: boolean;
  visualizationType: VisualizationType | null;
  gainState: Record<string, GainStateType>;
  audioCtx: AudioContext | null;
  wasmModule: EngineModule | null;

  // Actions
  setAudioInitialized: (initialized: boolean) => void;
  setVisualizationType: (type: VisualizationType | null) => void;
  setGainState: (gainState: Record<string, GainStateType>) => void;
  updateGainNode: (nodeName: string, gain: number) => void;
  setAudioContext: (ctx: AudioContext | null) => void;
  setWasmModule: (module: EngineModule | null) => void;
  resetAudioState: () => void;
}

const initialState = {
  audioInitialized: false,
  visualizationType: null,
  gainState: {},
  audioCtx: null,
  wasmModule: null,
};

export const useAudioStore = create<AudioStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialState,

        setAudioInitialized: (initialized: boolean) => {
          set({ audioInitialized: initialized }, false, 'setAudioInitialized');
        },

        setVisualizationType: (type: VisualizationType | null) => {
          set({ visualizationType: type }, false, 'setVisualizationType');
        },

        setGainState: (gainState: Record<string, GainStateType>) => {
          set({ gainState }, false, 'setGainState');
        },

        updateGainNode: (nodeName: string, gain: number) => {
          const currentGainState = get().gainState;
          const gainNode = currentGainState[nodeName];

          if (gainNode && get().audioCtx) {
            gainNode.node.gain.setValueAtTime(
              gain,
              get().audioCtx!.currentTime
            );
            set(
              {
                gainState: {
                  ...currentGainState,
                  [nodeName]: {
                    ...gainNode,
                    gain,
                  },
                },
              },
              false,
              'updateGainNode'
            );
          }
        },

        setAudioContext: (ctx: AudioContext | null) => {
          set({ audioCtx: ctx }, false, 'setAudioContext');
        },

        setWasmModule: (module: EngineModule | null) => {
          set({ wasmModule: module }, false, 'setWasmModule');
        },

        resetAudioState: () => {
          set(initialState, false, 'resetAudioState');
        },
      })),
      {
        name: 'audio-storage',
        // Only persist user preferences, not runtime objects
        partialize: state => ({
          visualizationType: state.visualizationType,
          gainState: Object.entries(state.gainState).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [key]: {
                gain: value.gain,
                gainChannel: value.gainChannel,
              },
            }),
            {} as Record<string, Omit<GainStateType, 'node'>>
          ),
        }),
      }
    ),
    { name: 'AudioStore' }
  )
);

// Selectors for optimal performance
export const useGainState = () => useAudioStore(state => state.gainState);
export const useAudioInitialized = () =>
  useAudioStore(state => state.audioInitialized);
export const useVisualizationType = () =>
  useAudioStore(state => state.visualizationType);
export const useWasmModule = () => useAudioStore(state => state.wasmModule);
export const useAudioContext = () => useAudioStore(state => state.audioCtx);

// Action selectors
export const useAudioActions = () =>
  useAudioStore(state => ({
    setAudioInitialized: state.setAudioInitialized,
    setVisualizationType: state.setVisualizationType,
    setGainState: state.setGainState,
    updateGainNode: state.updateGainNode,
    setAudioContext: state.setAudioContext,
    setWasmModule: state.setWasmModule,
    resetAudioState: state.resetAudioState,
  }));
