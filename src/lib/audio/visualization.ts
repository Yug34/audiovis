import type {
  VisualizeAudioProps,
  DrawCanvasProps,
  VisualizationType,
  CircularVisualizationParams,
} from '@/types/audio';

// Global visualization parameters that can be updated in real-time
let globalVisualizationParams: CircularVisualizationParams = {
  stepFactor: 1.01,
  colorStepFactor: 100,
  opacity: 0.85,
  radius: 2,
  panSpeed: 0.004,
  panRadius: 0.15,
  rotationSpeed: 0.01,
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
    drawCircularVisualization({
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

export function drawCanvas({
  analyserRight,
  analyserLeft,
  canvas,
  fftSize,
  padding = 20,
  gapBetweenBars = 3,
  wasmModule,
}: DrawCanvasProps): void {
  const canvasCtx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  const bufferLength = analyserRight.frequencyBinCount;
  const [HEIGHT, WIDTH] = [canvas.height, canvas.width];

  // Holding freq data for the left and right channels from the analyserNodes:
  const dataArrayRight: Uint8Array = createDataArray(
    analyserRight,
    'frequency'
  );
  const dataArrayLeft: Uint8Array = createDataArray(analyserLeft, 'frequency');

  // Time domain data - available if needed for time domain plots
  // const timeDataArrayRight: Uint8Array = createDataArray(analyserRight, 'time');
  // const timeDataArrayLeft: Uint8Array = createDataArray(analyserLeft, 'time');

  // Use WASM to calculate bar width and averages
  let barWidth: number;
  let leftAverage: number;
  let rightAverage: number;

  if (wasmModule) {
    // Calculate using Rust
    barWidth = wasmModule.calculate_bar_width(
      WIDTH,
      fftSize,
      gapBetweenBars,
      padding,
      bufferLength
    );
    leftAverage = wasmModule.calculate_average(dataArrayLeft);
    rightAverage = wasmModule.calculate_average(dataArrayRight);
  } else {
    // Fallback to JavaScript calculations
    barWidth =
      (WIDTH - fftSize * (gapBetweenBars / 2) - padding) / bufferLength;
    leftAverage = dataArrayLeft.reduce((a, b) => a + b) / bufferLength;
    rightAverage = dataArrayRight.reduce((a, b) => a + b) / bufferLength;
  }

  let barHeightLeft: number;
  let barHeightRight: number;
  canvasCtx!.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx!.fillRect(0, 0, WIDTH, HEIGHT);
  canvasCtx!.font = '300 16px Arial';

  // padding on both (left and right) sides of the bar graph
  let currentHorizontalPosition: number = padding / 2;

  const drawFreqDomainPlot = (): void => {
    for (let i = 0; i < bufferLength; i++) {
      barHeightLeft = dataArrayLeft[i];
      barHeightRight = dataArrayRight[i];

      // Green bars for the Right channel
      canvasCtx!.fillStyle = `rgb(50, ${barHeightRight + 100}, 50)`;
      canvasCtx!.fillRect(
        currentHorizontalPosition,
        (HEIGHT - barHeightRight / 2) / 2 - 200,
        barWidth,
        barHeightRight / 4
      );

      // Blue bars for the Left channel
      canvasCtx!.fillStyle = `rgb(50, 50, ${barHeightLeft + 100})`;
      canvasCtx!.fillRect(
        currentHorizontalPosition,
        HEIGHT / 2 - 200,
        barWidth,
        barHeightLeft / 4
      );

      canvasCtx!.fillStyle = `rgb(255, 255, 255)`;
      canvasCtx!.fillText('Freq. domain plot', WIDTH / 2 - 50, HEIGHT / 4 - 50);

      canvasCtx!.fillText(
        `${barHeightLeft}`,
        currentHorizontalPosition + barWidth / 2,
        (HEIGHT + barHeightLeft / 2) / 2 - (200 - 20)
      );

      currentHorizontalPosition += barWidth + gapBetweenBars;
    }
    currentHorizontalPosition = padding / 2;
  };

  // Time domain plot - available but not currently used
  // const drawTimeDomainPlot = (): void => {
  //   for (let i = 0; i < bufferLength; i++) {
  //     barHeightLeft = timeDataArrayLeft[i];
  //     barHeightRight = timeDataArrayRight[i];
  //     canvasCtx!.fillStyle = `rgb(255, 255, 255)`;
  //     canvasCtx!.fillText('Time domain plot', WIDTH / 2 - 50, HEIGHT / 2 + 50);
  //     // Green bars for the Right channel
  //     canvasCtx!.fillStyle = `rgb(50, ${barHeightRight + 100}, 50)`;
  //     canvasCtx!.fillRect(
  //       currentHorizontalPosition,
  //       (HEIGHT - barHeightRight / 2) / 2 + 150,
  //       barWidth,
  //       2
  //     );
  //     // Blue bars for the Left channel
  //     canvasCtx!.fillStyle = `rgb(50, 50, ${barHeightLeft + 100})`;
  //     canvasCtx!.fillRect(
  //       currentHorizontalPosition,
  //       HEIGHT / 2 + 150 + barHeightLeft / 4,
  //       barWidth,
  //       2
  //     );
  //     currentHorizontalPosition += barWidth + gapBetweenBars;
  //   }
  //   currentHorizontalPosition = padding / 2;
  // };

  const drawAudioLevel = (): void => {
    // Helper function to convert packed RGB to CSS string
    const rgbToString = (packedRgb: number): string => {
      const r = (packedRgb >> 16) & 0xff;
      const g = (packedRgb >> 8) & 0xff;
      const b = packedRgb & 0xff;
      return `rgb(${r}, ${g}, ${b})`;
    };

    canvasCtx!.fillStyle = `rgb(255, 255, 255)`;
    canvasCtx!.fillText('Audio Levels', WIDTH / 2 - 40, HEIGHT / 2 - 100);

    canvasCtx!.fillRect(
      WIDTH / 2 - barWidth - gapBetweenBars,
      HEIGHT / 2,
      2 * barWidth + gapBetweenBars,
      3
    );

    canvasCtx!.fillText(
      `${Math.round(leftAverage)}`,
      WIDTH / 2 - barWidth,
      HEIGHT / 2 - leftAverage / 2 - 20
    );

    // Use WASM for color calculations if available
    if (wasmModule) {
      const rightColor = wasmModule.calculate_level_color(rightAverage, true);
      const leftColor = wasmModule.calculate_level_color(leftAverage, false);

      canvasCtx!.fillStyle = rgbToString(rightColor);
      canvasCtx!.fillRect(WIDTH / 2, HEIGHT / 2, barWidth, -rightAverage / 2);

      canvasCtx!.fillStyle = rgbToString(leftColor);
      canvasCtx!.fillRect(
        WIDTH / 2 - (barWidth + gapBetweenBars),
        HEIGHT / 2,
        barWidth,
        -leftAverage / 2
      );
    } else {
      // Fallback to JavaScript
      canvasCtx!.fillStyle = `rgb(50, ${rightAverage + 100}, 50)`;
      canvasCtx!.fillRect(WIDTH / 2, HEIGHT / 2, barWidth, -rightAverage / 2);

      canvasCtx!.fillStyle = `rgb(50, 50, ${leftAverage + 100})`;
      canvasCtx!.fillRect(
        WIDTH / 2 - (barWidth + gapBetweenBars),
        HEIGHT / 2,
        barWidth,
        -leftAverage / 2
      );
    }
  };

  drawFreqDomainPlot();
  // drawTimeDomainPlot();
  drawAudioLevel();
}

// Circular frequency domain visualization based on the Rust implementation
export function drawCircularVisualization({
  analyserRight,
  analyserLeft,
  canvas,
  frameCount = 0,
  params = {
    stepFactor: 1.01,
    colorStepFactor: 100,
    opacity: 0.85,
    radius: 2,
    panSpeed: 0.004,
    panRadius: 0.15,
    rotationSpeed: 0.01,
  },
}: DrawCanvasProps & {
  frameCount?: number;
  params?: CircularVisualizationParams;
}): void {
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

  // Calculate slice width for circular distribution
  const sliceWidth = (2 * Math.PI) / bufferLength;

  // Calculate panning offset based on frame count for orbiting effect
  const maxPanRadius = Math.min(WIDTH, HEIGHT) * panRadius;

  const centerX = WIDTH / 2 + Math.cos(frameCount * panSpeed) * maxPanRadius;
  const centerY =
    HEIGHT / 2 + Math.sin(frameCount * panSpeed * 0.7) * maxPanRadius * 0.8;

  // Calculate rotation angle based on frame count for spinning effect
  const rotationAngle = frameCount * rotationSpeed;

  // Render new frame with circular distribution
  let theta = 0;
  for (let i = 0; i < bufferLength; i++) {
    theta += sliceWidth;

    // Add rotation to the theta angle
    const rotatedTheta = theta + rotationAngle;

    // Use average of left and right channels for amplitude
    const amp = (dataArrayLeft[i] + dataArrayRight[i]) / 2 / 256.0;

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
