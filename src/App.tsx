import { useCallback, useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gainState, setGainState] = useState<Record<string, GainStateType>>({});

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
      gain = 1, //default gain value
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
        const { helloFromWasm, addInWasm } = await import('@/lib/wasm');
        const msg = await helloFromWasm();
        const sum = await addInWasm(2, 40);
        console.log('WASM initialized:', { msg, sum });
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef!.current!;
      const resizeCanvasToViewport = (canvas: HTMLCanvasElement): void => {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
      };
      const resizeCanvas = () => {
        resizeCanvasToViewport(canvas);
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      visualizeAudio({
        createNewGain,
        canvas,
        createNewAnalyser,
      });

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [createNewAnalyser]);

  return (
    <div className="flex flex-col w-screen h-screen">
      <main className="flex-1 relative">
        <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
          <canvas className="w-full h-full bg-black" ref={canvasRef} />
        </div>
      </main>
    </div>
  );
}

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

type VisualizeAudioProps = {
  createNewAnalyser(props: CreateNewAnalyserProps): AnalyserNode;
  createNewGain(props: CreateNewGainProps): GainStateType;
  canvas: HTMLCanvasElement;
};

export type VisualizationType = 'oscillator' | 'file' | 'microphone';
export type OutputChannelTypes = 'Left' | 'Right';

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

const visualizeAudio = ({
  createNewGain,
  createNewAnalyser,
  canvas,
}: VisualizeAudioProps): void => {
  const audioCtx: AudioContext = new AudioContext();

  const fftSize: number = 32;
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

  const visualizationInitializers = {
    // file: () => {
    //   selectedVisualization.payload?.then((buffer: AudioBuffer) => {
    //     audioCtx.decodeAudioData(
    //       buffer,
    //       audio => {
    //         const audioSource = audioCtx.createBufferSource();
    //         audioSource.buffer = audio;
    //         audioSource.connect(splitter);
    //         audioSource.start();
    //       },
    //       error => console.log(error)
    //     );
    //   });
    // },
    microphone: () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream: MediaStream) => {
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(splitter);
        })
        .catch(err => console.log(err));
    },
    // oscillator: () => {
    //   const leftOscillator: OscillatorNode = createNewOscillator({
    //     audioCtx,
    //     oscillatorName: 'leftOscillator',
    //     oscillatorChannel: 'Left',
    //   }).node;
    //   const rightOscillator: OscillatorNode = createNewOscillator({
    //     audioCtx,
    //     oscillatorName: 'rightOscillator',
    //     oscillatorChannel: 'Right',
    //   }).node;

    //   leftOscillator.connect(leftGainNode);
    //   rightOscillator.connect(rightGainNode);
    //   leftOscillator.start();
    //   rightOscillator.start();
    // },
  };

  visualizationInitializers['microphone']();

  const renderVisualization = (): void => {
    requestAnimationFrame(renderVisualization);
    drawCanvas({ analyserRight, analyserLeft, canvas, fftSize });
  };
  renderVisualization();
};

type DrawCanvasTypes = {
  analyserRight: AnalyserNode;
  analyserLeft: AnalyserNode;
  canvas: HTMLCanvasElement;
  fftSize: number;
  padding?: number;
  gapBetweenBars?: number;
};

const drawCanvas = ({
  analyserRight,
  analyserLeft,
  canvas,
  fftSize,
  padding = 20,
  gapBetweenBars = 3,
}: DrawCanvasTypes): void => {
  const canvasCtx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  const bufferLength = analyserRight.frequencyBinCount;
  const [HEIGHT, WIDTH] = [canvas.height, canvas.width];
  // Width of a single bar
  const barWidth: number =
    (WIDTH - fftSize * (gapBetweenBars / 2) - padding) / bufferLength;
  let barHeightLeft: number;
  let barHeightRight: number;
  canvasCtx!.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx!.fillRect(0, 0, WIDTH, HEIGHT);
  canvasCtx!.font = '300 16px Arial';

  // padding on both (left and right) sides of the bar graph
  let currentHorizontalPosition: number = padding / 2;

  // Holding time and freq data for the left and right channels from the analyserNodes:
  const dataArrayRight: Uint8Array = createDataArray(
    analyserRight,
    'frequency'
  );
  const dataArrayLeft: Uint8Array = createDataArray(analyserLeft, 'frequency');
  const timeDataArrayRight: Uint8Array = createDataArray(analyserRight, 'time');
  const timeDataArrayLeft: Uint8Array = createDataArray(analyserLeft, 'time');

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

  const drawTimeDomainPlot = (): void => {
    for (let i = 0; i < bufferLength; i++) {
      barHeightLeft = timeDataArrayLeft[i];
      barHeightRight = timeDataArrayRight[i];

      canvasCtx!.fillStyle = `rgb(255, 255, 255)`;
      canvasCtx!.fillText('Time domain plot', WIDTH / 2 - 50, HEIGHT / 2 + 50);

      // Green bars for the Right channel
      canvasCtx!.fillStyle = `rgb(50, ${barHeightRight + 100}, 50)`;
      canvasCtx!.fillRect(
        currentHorizontalPosition,
        (HEIGHT - barHeightRight / 2) / 2 + 150,
        barWidth,
        2
      );

      // Blue bars for the Left channel
      canvasCtx!.fillStyle = `rgb(50, 50, ${barHeightLeft + 100})`;
      canvasCtx!.fillRect(
        currentHorizontalPosition,
        HEIGHT / 2 + 150 + barHeightLeft / 4,
        barWidth,
        2
      );

      currentHorizontalPosition += barWidth + gapBetweenBars;
    }
    currentHorizontalPosition = padding / 2;
  };

  const drawAudioLevel = (): void => {
    // Average of all sound intensity values in the data arrays in the Right and Left channels
    const leftAverage = dataArrayLeft.reduce((a, b) => a + b) / bufferLength;
    const rightAverage = dataArrayRight.reduce((a, b) => a + b) / bufferLength;

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

    canvasCtx!.fillStyle = `rgb(50, ${rightAverage + 100}, 50)`;
    canvasCtx!.fillRect(WIDTH / 2, HEIGHT / 2, barWidth, -rightAverage / 2);

    canvasCtx!.fillStyle = `rgb(50, 50, ${leftAverage + 100})`;
    canvasCtx!.fillRect(
      WIDTH / 2 - (barWidth + gapBetweenBars),
      HEIGHT / 2,
      barWidth,
      -leftAverage / 2
    );
  };

  // drawFreqDomainPlot();
  // drawTimeDomainPlot();
  drawAudioLevel();
};

const createDataArray = (
  analyserNode: AnalyserNode,
  domain: 'time' | 'frequency'
): Uint8Array => {
  const array = new Uint8Array(analyserNode.frequencyBinCount);
  if (domain === 'time') {
    analyserNode.getByteTimeDomainData(array);
  } else {
    analyserNode.getByteFrequencyData(array);
  }
  return array;
};

export default App;
