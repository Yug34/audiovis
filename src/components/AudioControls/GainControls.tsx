import type { GainStateType } from '@/types/audio';

interface GainControlsProps {
  gainState: Record<string, GainStateType>;
  onGainChange: (channel: 'Left' | 'Right', value: number) => void;
}

export const GainControls = ({
  gainState,
  onGainChange,
}: GainControlsProps) => {
  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm p-6 rounded-lg border border-white/20">
      <h3 className="text-white text-lg font-semibold mb-4">Gain Controls</h3>
      <div className="flex flex-col gap-4 min-w-[200px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-blue-400 text-sm font-medium">
              Left Channel
            </label>
            <span className="text-white text-sm">
              {gainState.leftGainNode?.gain.toFixed(2) ?? '1.00'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={gainState.leftGainNode?.gain ?? 1}
            onChange={e => onGainChange('Left', parseFloat(e.target.value))}
            className="w-full h-2 bg-blue-900/50 rounded-lg appearance-none cursor-pointer slider-blue"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-green-400 text-sm font-medium">
              Right Channel
            </label>
            <span className="text-white text-sm">
              {gainState.rightGainNode?.gain.toFixed(2) ?? '1.00'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={gainState.rightGainNode?.gain ?? 1}
            onChange={e => onGainChange('Right', parseFloat(e.target.value))}
            className="w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer slider-green"
          />
        </div>
      </div>
    </div>
  );
};
