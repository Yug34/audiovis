import { forwardRef, useEffect } from 'react';

interface AudioCanvasProps {
  audioInitialized: boolean;
}

export const AudioCanvas = forwardRef<HTMLCanvasElement, AudioCanvasProps>(
  ({ audioInitialized }, ref) => {
    useEffect(() => {
      if (ref && 'current' in ref && ref.current && audioInitialized) {
        const canvas = ref.current;

        const resizeCanvasToViewport = (canvas: HTMLCanvasElement): void => {
          canvas.height = window.innerHeight;
          canvas.width = window.innerWidth;
        };

        const resizeCanvas = () => {
          resizeCanvasToViewport(canvas);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }, [audioInitialized, ref]);

    return <canvas className="w-full h-full bg-black" ref={ref} />;
  }
);

AudioCanvas.displayName = 'AudioCanvas';
