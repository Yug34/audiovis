import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CanvasState {
  strValue: string;
  saveStrValue: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set, get) => ({
    strValue: '',
    saveStrValue: () => {
      console.log('saveStrValue', get().strValue);
    },
  }))
);

// Auto-save middleware - save state whenever strValue changes
let saveTimeout: NodeJS.Timeout | null = null;
// Save after 1 second of inactivity
const DEBOUNCE_DELAY = 1000;

useCanvasStore.subscribe(
  state => ({
    strValue: state.strValue,
  }),
  (current, previous) => {
    // Only save if strValue actually changed
    if (previous && current.strValue !== previous.strValue) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(() => {
        useCanvasStore.getState().saveStrValue();
      }, DEBOUNCE_DELAY);
    }
  }
);
