import type {
  VisualizeAudioProps,
  DrawHaloProps,
  VisualizationType,
  CircularVisualizationParams,
} from '@/types/audio';
import { DEFAULT_VISUALIZATION_PARAMS } from './constants';

// Global visualization parameters that can be updated in real-time
let globalVisualizationParams: CircularVisualizationParams = {
  ...DEFAULT_VISUALIZATION_PARAMS,
};

// Function to update global visualization parameters
export function updateVisualizationParams(
  params: Partial<CircularVisualizationParams>
): void {
  globalVisualizationParams = { ...globalVisualizationParams, ...params };
}

export function visualizeAudio({
  createNewGain,
  createNewAnalyser,
  canvas,
  audioCtxRef,
  wasmModule,
  visualizationType,
  audioBuffer,
}: VisualizeAudioProps): void {
  const audioCtx: AudioContext = new AudioContext();
  audioCtxRef.current = audioCtx;

  // Resume audio context if it's suspended (required by browsers)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const fftSize: number = 2048;
  const analyserRight: AnalyserNode = createNewAnalyser({ audioCtx });
  const analyserLeft: AnalyserNode = createNewAnalyser({ audioCtx });
  const splitter: ChannelSplitterNode = audioCtx.createChannelSplitter(2);
  const merger: ChannelMergerNode = audioCtx.createChannelMerger(2);

  const leftGainNode: GainNode = createNewGain({
    audioCtx,
    gainNodeName: 'leftGainNode',
    gainChannel: 'Left',
  }).node;
  const rightGainNode: GainNode = createNewGain({
    audioCtx,
    gainNodeName: 'rightGainNode',
    gainChannel: 'Right',
  }).node;

  splitter.connect(leftGainNode, 0);
  splitter.connect(rightGainNode, 1);
  leftGainNode.connect(analyserLeft, 0);
  rightGainNode.connect(analyserRight, 0);
  analyserRight.connect(merger, 0, 1);
  analyserLeft.connect(merger, 0, 0);
  merger.connect(audioCtx.destination);

  const visualizationInitializers: Record<VisualizationType, () => void> = {
    file: () => {
      if (audioBuffer) {
        audioCtx.decodeAudioData(
          audioBuffer,
          audio => {
            const audioSource = audioCtx.createBufferSource();
            audioSource.buffer = audio;
            audioSource.connect(splitter);
            audioSource.loop = true; // Loop the audio
            audioSource.start();
          },
          error => console.error('Error decoding audio:', error)
        );
      }
    },
    microphone: () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream: MediaStream) => {
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(splitter);
        })
        .catch(err => console.error('Error accessing microphone:', err));
    },
    oscillator: () => {
      console.log('Oscillator visualization not implemented yet');
    },
  };

  visualizationInitializers[visualizationType]();

  let frameCount = 0;
  const renderVisualization = (): void => {
    requestAnimationFrame(renderVisualization);

    // Use circular visualization instead of the bar chart
    drawHalo({
      analyserRight,
      analyserLeft,
      canvas,
      fftSize,
      wasmModule,
      frameCount,
      params: globalVisualizationParams,
    });

    frameCount++;
  };
  renderVisualization();
}

function createDataArray(
  analyserNode: AnalyserNode,
  domain: 'time' | 'frequency'
): Uint8Array {
  const array = new Uint8Array(analyserNode.frequencyBinCount);
  if (domain === 'time') {
    analyserNode.getByteTimeDomainData(array);
  } else {
    analyserNode.getByteFrequencyData(array);
  }
  return array;
}

// Circular frequency domain visualization based on the Rust implementation
export function drawHalo({
  analyserRight,
  analyserLeft,
  canvas,
  frameCount = 0,
  params = DEFAULT_VISUALIZATION_PARAMS,
}: DrawHaloProps): void {
  const canvasCtx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!canvasCtx) return;

  const bufferLength = analyserRight.frequencyBinCount;
  const [HEIGHT, WIDTH] = [canvas.height, canvas.width];
  const {
    stepFactor,
    colorStepFactor,
    opacity,
    radius,
    panSpeed,
    panRadius,
    rotationSpeed,
  } = params;

  // Get frequency data from both channels
  const dataArrayRight: Uint8Array = createDataArray(
    analyserRight,
    'frequency'
  );
  const dataArrayLeft: Uint8Array = createDataArray(analyserLeft, 'frequency');

  // Create temporary canvas for frame persistence
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = WIDTH;
  tempCanvas.height = HEIGHT;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // Save last frame to temporary canvas with step_factor trimmed off
  tempCtx.drawImage(
    canvas,
    WIDTH / stepFactor,
    HEIGHT / stepFactor,
    (WIDTH * (stepFactor - 2)) / stepFactor,
    (HEIGHT * (stepFactor - 2)) / stepFactor,
    0,
    0,
    WIDTH,
    HEIGHT
  );

  // Clear main canvas
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  // Calculate dynamic color based on frame count
  const r = Math.sin(frameCount / colorStepFactor / 5) * 127.5 + 127.5;
  const g = Math.sin(frameCount / colorStepFactor / 3) * 127.5 + 127.5;
  const b = Math.sin(frameCount / colorStepFactor) * 127.5 + 127.5;
  canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;

  // Draw old frame with opacity
  canvasCtx.globalAlpha = opacity;
  canvasCtx.drawImage(tempCanvas, 0, 0);
  canvasCtx.globalAlpha = 1;

  // Calculate frequency range mapping
  let frequencyRange = bufferLength;
  let frequencyOffset = 0;

  if (params.minFrequency !== undefined && params.maxFrequency !== undefined) {
    // Map the file's frequency range to the available FFT bins
    const sampleRate = 44100; // Default sample rate
    const nyquistFreq = sampleRate / 2;
    const binFreqWidth = nyquistFreq / bufferLength;

    // Calculate which bins correspond to our frequency range
    const startBin = Math.floor(params.minFrequency / binFreqWidth);
    const endBin = Math.ceil(params.maxFrequency / binFreqWidth);

    // Ensure we don't exceed buffer bounds
    frequencyOffset = Math.max(0, startBin);
    frequencyRange = Math.min(bufferLength, endBin) - frequencyOffset;
  }

  // Calculate slice width for circular distribution
  const sliceWidth = (2 * Math.PI) / frequencyRange;

  // Calculate panning offset based on frame count for orbiting effect
  const maxPanRadius = Math.min(WIDTH, HEIGHT) * panRadius;

  const centerX = WIDTH / 2 + Math.cos(frameCount * panSpeed) * maxPanRadius;
  const centerY =
    HEIGHT / 2 + Math.sin(frameCount * panSpeed * 0.7) * maxPanRadius * 0.8;

  // Calculate rotation angle based on frame count for spinning effect
  const rotationAngle = frameCount * rotationSpeed;

  // Render new frame with circular distribution
  let theta = 0;
  for (let i = 0; i < frequencyRange; i++) {
    theta += sliceWidth;

    // Add rotation to the theta angle
    const rotatedTheta = theta + rotationAngle;

    // Get the actual buffer index (with frequency offset)
    const bufferIndex = i + frequencyOffset;

    // Use average of left and right channels for amplitude
    const amp =
      (dataArrayLeft[bufferIndex] + dataArrayRight[bufferIndex]) / 2 / 256.0;

    // Calculate radius based on amplitude
    const r = amp * HEIGHT * 0.2 + HEIGHT * 0.09;

    // Convert to Cartesian coordinates with panning center and rotation
    const x = centerX + Math.cos(rotatedTheta) * r;
    const y = centerY + Math.sin(rotatedTheta) * r;

    // Draw circular particle
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
    canvasCtx.fill();
  }
}
