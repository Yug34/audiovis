# Project Structure

This document describes the organization and architecture of the audio visualization application.

## Overview

The application is a real-time audio visualization tool that uses WebAssembly (Rust) for performance-critical calculations and React for the UI. It supports both microphone input and audio file playback with separate gain controls for left and right audio channels.

## Directory Structure

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── AudioControls/               # Audio-specific UI components
│       ├── index.ts                 # Barrel export
│       ├── AudioCanvas.tsx          # Canvas component with auto-resize
│       ├── AudioSourceSelector.tsx  # Initial audio source selection UI
│       └── GainControls.tsx         # Channel gain control sliders
│
├── hooks/                           # Custom React hooks
│   ├── index.ts                     # Barrel export
│   ├── useAudioVisualization.ts     # Main audio visualization hook
│   └── useGainControl.ts            # Gain control management hook
│
├── lib/
│   ├── audio/                       # Audio processing modules
│   │   └── visualization.ts         # Canvas drawing and audio graph setup
│   ├── wasm.ts                      # WebAssembly wrapper functions
│   └── utils.ts                     # General utilities
│
├── types/                           # TypeScript type definitions
│   ├── index.ts                     # Barrel export
│   ├── audio.ts                     # Audio-related types
│   └── engine.d.ts                  # WASM module type definitions
│
├── App.tsx                          # Main application component (simplified)
├── main.tsx                         # Application entry point
└── index.css                        # Global styles and Tailwind config

engine/
├── src/
│   └── lib.rs                       # Rust audio calculation functions
├── engine/pkg/                      # Compiled WASM output
└── Cargo.toml                       # Rust dependencies
```

## Architecture Principles

### 1. Separation of Concerns

- **UI Components**: Handle only presentation and user interaction
- **Hooks**: Manage state and side effects
- **Lib modules**: Contain pure logic and calculations
- **Types**: Centralized type definitions

### 2. Component Organization

#### `App.tsx` (56 lines)

The main component is now lean and focused on composition:

- Initializes hooks
- Handles user interactions
- Composes UI components
- No direct audio or canvas manipulation

#### Custom Hooks

**`useAudioVisualization`**

- Manages audio context initialization
- Loads WASM module
- Creates audio analyzers and gain nodes
- Provides `startAudio` function for different input types

**`useGainControl`**

- Encapsulates gain adjustment logic
- Updates both Web Audio API and React state
- Provides clean `handleGainChange` function

#### UI Components

**`AudioCanvas`**

- Self-contained canvas with auto-resize logic
- Uses `forwardRef` to expose canvas element
- Handles window resize events

**`AudioSourceSelector`**

- Initial UI for choosing audio source
- Handles both microphone and file input
- Manages file input element

**`GainControls`**

- Real-time gain sliders for each channel
- Color-coded (blue=left, green=right)
- Displays numeric values

### 3. Audio Processing Pipeline

```
Audio Source (Mic/File)
    ↓
ChannelSplitter (2 channels)
    ↓
GainNodes (Left & Right) ← User Controls
    ↓
AnalyserNodes (Left & Right)
    ↓
ChannelMerger
    ↓
AudioContext.destination
```

### 4. WebAssembly Integration

Rust functions in `engine/src/lib.rs`:

- `calculate_bar_width()` - Compute visualization bar dimensions
- `calculate_average()` - Calculate audio level averages
- `calculate_level_color()` - Generate RGB colors for visualization
- `process_audio_data()` - Batch process audio data

TypeScript wrappers in `src/lib/wasm.ts`:

- Async wrappers for all Rust functions
- Helper functions for data conversion
- Module initialization and caching

### 5. Type Safety

All audio-related types are centralized in `src/types/audio.ts`:

- `VisualizationType` - Audio source types
- `GainStateType` - Gain node state structure
- `CreateNewGainProps` - Gain creation parameters
- And more...

## Data Flow

1. **Initialization**

   ```
   App.tsx → useAudioVisualization → WASM module loads
   ```

2. **Audio Start**

   ```
   User clicks → AudioSourceSelector → startAudio() → visualizeAudio()
   → Creates audio graph → Starts render loop
   ```

3. **Visualization Loop**

   ```
   requestAnimationFrame → drawCanvas() → WASM calculations
   → Canvas drawing → repeat
   ```

4. **Gain Control**
   ```
   User adjusts slider → handleGainChange() → Updates Web Audio API
   → Updates React state → UI reflects change
   ```

## Benefits of This Structure

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Pure functions and isolated logic are easier to test
3. **Reusability**: Components and hooks can be used elsewhere
4. **Scalability**: Easy to add new features without touching existing code
5. **Performance**: WASM calculations are isolated and optimized
6. **Type Safety**: Centralized types prevent errors
7. **Developer Experience**: Clear imports and logical organization

## Adding New Features

### To add a new visualization mode:

1. Add type to `VisualizationType` in `types/audio.ts`
2. Add handler in `visualizationInitializers` in `lib/audio/visualization.ts`
3. Update UI in `AudioSourceSelector.tsx` if needed

### To add a new audio effect:

1. Create new hook in `hooks/`
2. Add Rust calculation if needed in `engine/src/lib.rs`
3. Create UI component in `components/AudioControls/`
4. Wire up in `App.tsx`

### To add new WASM functions:

1. Add function to `engine/src/lib.rs`
2. Rebuild WASM: `cd engine && wasm-pack build --target web`
3. Add TypeScript wrapper in `lib/wasm.ts`
4. Update `types/engine.d.ts` if needed
5. Use in visualization or hooks

## Performance Considerations

- WASM calculations run in the render loop (60fps)
- Canvas operations are batched
- Audio processing happens in Web Audio API thread
- React state updates are minimized during animation
- No unnecessary re-renders due to proper memoization

## Future Improvements

- [ ] Add unit tests for hooks and utilities
- [ ] Add Storybook for component documentation
- [ ] Implement oscillator mode
- [ ] Add more visualization types (waveform, spectrogram)
- [ ] Add audio recording functionality
- [ ] Implement preset system for gain settings
- [ ] Add keyboard shortcuts
