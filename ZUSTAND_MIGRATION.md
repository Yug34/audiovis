# Zustand Store Migration Guide

## What Was Fixed

### Type Resolution Issues

✅ Created `EngineModule` type in `src/types/engine.d.ts` to properly type the WASM module  
✅ Updated all files to use `EngineModule` instead of `typeof import('engine')`  
✅ Fixed import paths in `audioStore.ts` to use relative imports  
✅ Cleaned up `tsconfig.app.json` to include all of `src/`

### Files Updated

- `src/types/engine.d.ts` - Added `EngineModule` export
- `src/types/audio.ts` - Import and use `EngineModule`
- `src/store/audioStore.ts` - Use relative imports, `EngineModule` type
- `src/hooks/useAudioVisualization.ts` - Use `EngineModule` type
- `tsconfig.app.json` - Simplified includes

## New Zustand Audio Store

### Features

- ✅ **Centralized State** - All audio state in one place
- ✅ **DevTools Support** - Debug with Redux DevTools
- ✅ **State Persistence** - Gain settings saved to localStorage
- ✅ **Optimized Selectors** - Components only re-render when needed
- ✅ **Type Safe** - Full TypeScript support

### Store Structure

```typescript
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
```

## How to Use the Store

### Option 1: Keep Current Hook-Based Approach (Recommended for now)

Your current code works perfectly! The store is available but not required.

### Option 2: Migrate to Zustand (Future Enhancement)

Here's how you would refactor components to use the Zustand store:

#### Example: Simplified App.tsx

```typescript
import { useRef, useCallback } from 'react';
import { useAudioInitialized, useAudioActions } from '@/store';
import {
  AudioCanvas,
  AudioSourceSelector,
  GainControls,
} from '@/components/AudioControls';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioInitialized = useAudioInitialized(); // Direct store access
  const { setAudioInitialized } = useAudioActions();

  // ... rest of component
}
```

#### Example: GainControls with Zustand

```typescript
import { useGainState, useAudioActions, useAudioContext } from '@/store';

export function GainControls() {
  const gainState = useGainState();
  const audioCtx = useAudioContext();
  const { updateGainNode } = useAudioActions();

  const handleGainChange = (channel: 'Left' | 'Right', value: number) => {
    const nodeName = channel === 'Left' ? 'leftGainNode' : 'rightGainNode';
    updateGainNode(nodeName, value);
  };

  return (
    <div>
      {/* Same UI as before */}
      <input
        value={gainState.leftGainNode?.gain ?? 1}
        onChange={(e) => handleGainChange('Left', parseFloat(e.target.value))}
      />
    </div>
  );
}
```

### Benefits of Migration

1. **No Props Drilling**
   - Before: Pass `gainState`, `setGainState`, `audioCtxRef` through multiple components
   - After: Direct access anywhere with `useGainState()`, `useAudioContext()`

2. **State Persistence**
   - Gain settings automatically saved to localStorage
   - Restored on page reload

3. **Better Performance**
   - Components only re-render when their specific data changes
   - Zustand's selector system is optimized

4. **Easier Testing**
   - Mock store state directly
   - No need to wrap components in providers

5. **DevTools**
   - Time-travel debugging
   - State inspection
   - Action logging

## Available Selectors

### State Selectors (Optimized)

```typescript
import {
  useGainState,
  useAudioInitialized,
  useVisualizationType,
  useWasmModule,
  useAudioContext,
} from '@/store';
```

### Action Selectors

```typescript
import { useAudioActions } from '@/store';

const {
  setAudioInitialized,
  setVisualizationType,
  setGainState,
  updateGainNode,
  setAudioContext,
  setWasmModule,
  resetAudioState,
} = useAudioActions();
```

### Full Store Access

```typescript
import { useAudioStore } from '@/store';

// Access everything
const state = useAudioStore();

// Or use selector
const gainState = useAudioStore(state => state.gainState);
```

## Migration Strategy

### Phase 1: Keep Current Implementation ✅ (CURRENT)

- Store is set up but not used
- All current code continues to work
- No breaking changes

### Phase 2: Gradual Migration (Optional)

1. Migrate `GainControls` component first
2. Then migrate `useGainControl` hook
3. Finally migrate `useAudioVisualization` hook
4. Update `App.tsx` last

### Phase 3: Add New Features (Future)

- Preset system for gain settings
- Multiple visualization modes
- Audio recording with state management
- Settings panel with persistence

## Example: Complete Migration

Here's what a fully migrated `useAudioVisualization` hook would look like:

```typescript
import { useCallback, useEffect } from 'react';
import { useAudioStore } from '@/store';
import { visualizeAudio } from '@/lib/audio/visualization';

export function useAudioVisualization() {
  const store = useAudioStore();

  // Initialize WASM on mount
  useEffect(() => {
    (async () => {
      try {
        const { loadEngine } = await import('@/lib/wasm');
        const engine = await loadEngine();
        store.setWasmModule(engine);
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  const startAudio = useCallback(
    async (type: VisualizationType, canvas: HTMLCanvasElement, file?: File) => {
      // Use store state and actions directly
      // No need to manage local state
    },
    [store]
  );

  return { startAudio };
}
```

## Persistence Configuration

Current settings that persist across page reloads:

- ✅ Gain values for left/right channels
- ✅ Last selected visualization type

Note: `audioCtx` and `wasmModule` are not persisted (they're runtime objects).

## Debugging with DevTools

1. Install Redux DevTools browser extension
2. Open DevTools
3. Look for "AudioStore" in the Redux tab
4. See all actions and state changes in real-time!

## When to Migrate?

**Migrate Now If:**

- You want state persistence
- You're adding complex features (presets, recording, etc.)
- You want better performance with large state trees
- You need time-travel debugging

**Keep Current Setup If:**

- Current implementation works well
- You prefer hook-based patterns
- Project is small and simple
- No need for persistence yet

## Recommendation

**For this project:** The current hook-based approach is perfectly fine! The Zustand store is set up and ready when you need it, but there's no pressure to migrate immediately. Consider migrating when:

1. You add a preset system
2. You implement audio recording
3. You need to share state across many components
4. You want undo/redo functionality

The beauty of Zustand is you can adopt it gradually! 🎉
