import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CoreState {
  intValue: number;
  saveIntValue: () => void;
  setIntValue: (value: number) => void;
}

export const coreStore = create<CoreState>()(
  subscribeWithSelector((set: any, get: any) => ({
    intValue: 1,
    saveIntValue: () => {
      console.log('saveIntValue', get().intValue);
    },
    setIntValue: (value: number) => {
      set({ intValue: value });
    },
  }))
);

// Auto-save middleware - save state whenever strValue changes
let saveTimeout: NodeJS.Timeout | null = null;
// Save after 1 second of inactivity
const DEBOUNCE_DELAY = 1000;

coreStore.subscribe(
  (state: CoreState) => state.intValue,
  (current: number, previous: number) => {
    // Only save if intValue actually changed
    if (previous !== undefined && current !== previous) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(() => {
        coreStore.getState().saveIntValue();
      }, DEBOUNCE_DELAY);
    }
  }
);
