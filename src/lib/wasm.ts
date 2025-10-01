let initPromise: Promise<typeof import('engine')> | null = null;

export async function loadEngine() {
  if (!initPromise) {
    console.log('Loading WASM module...');
    try {
      const wasmModule = await import('engine');
      console.log('WASM module imported:', wasmModule);
      console.log('Available exports:', Object.keys(wasmModule));

      console.log('Initializing WASM module...');
      const initResult = await wasmModule.default();
      console.log('WASM module initialized, result:', initResult);

      initPromise = Promise.resolve(wasmModule);
    } catch (error) {
      console.error('Error loading WASM module:', error);
      throw error;
    }
  }
  return initPromise;
}

export async function helloFromWasm(): Promise<string> {
  const mod = await loadEngine();
  return mod.hello();
}

export async function addInWasm(a: number, b: number): Promise<number> {
  const mod = await loadEngine();
  return mod.add(a, b);
}

export async function greetFromWasm(name: string): Promise<void> {
  const mod = await loadEngine();
  console.log('WASM module loaded:', mod);
  console.log('greet function:', mod.greet);
  if (typeof mod.greet !== 'function') {
    throw new Error('greet function is not available on WASM module');
  }
  return mod.greet(name);
}

// Audio Visualization Functions

export async function calculateBarWidth(
  canvasWidth: number,
  fftSize: number,
  gapBetweenBars: number,
  padding: number,
  bufferLength: number
): Promise<number> {
  const mod = await loadEngine();
  return mod.calculate_bar_width(
    canvasWidth,
    fftSize,
    gapBetweenBars,
    padding,
    bufferLength
  );
}

export async function calculateAverage(data: Uint8Array): Promise<number> {
  const mod = await loadEngine();
  return mod.calculate_average(data);
}

export async function calculateFreqColor(
  barHeight: number,
  isRightChannel: boolean
): Promise<number> {
  const mod = await loadEngine();
  return mod.calculate_freq_color(barHeight, isRightChannel);
}

export async function calculateLevelColor(
  average: number,
  isRightChannel: boolean
): Promise<number> {
  const mod = await loadEngine();
  return mod.calculate_level_color(average, isRightChannel);
}

export async function processAudioData(
  canvasWidth: number,
  canvasHeight: number,
  fftSize: number,
  gapBetweenBars: number,
  padding: number,
  bufferLength: number,
  dataLeft: Uint8Array,
  dataRight: Uint8Array
): Promise<Float64Array> {
  const mod = await loadEngine();
  return mod.process_audio_data(
    canvasWidth,
    canvasHeight,
    fftSize,
    gapBetweenBars,
    padding,
    bufferLength,
    dataLeft,
    dataRight
  );
}

// Helper to convert packed RGB u32 to CSS rgb string
export function rgbToString(packedRgb: number): string {
  const r = (packedRgb >> 16) & 0xff;
  const g = (packedRgb >> 8) & 0xff;
  const b = packedRgb & 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}
