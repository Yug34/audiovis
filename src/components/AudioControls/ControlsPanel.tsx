import { useState } from 'react';
import type { GainStateType, CircularVisualizationParams } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DEFAULT_VISUALIZATION_PARAMS } from '@/lib/audio/constants';
import { updateVisualizationParams } from '@/lib/audio/visualization';

interface ControlsPanelProps {
  gainState: Record<string, GainStateType>;
  onGainChange: (channel: 'Left' | 'Right', value: number) => void;
  onParamsChange: (params: CircularVisualizationParams) => void;
  initialParams?: CircularVisualizationParams;
}

export function ControlsPanel({
  gainState,
  onGainChange,
  onParamsChange,
  initialParams = DEFAULT_VISUALIZATION_PARAMS,
}: ControlsPanelProps) {
  const [open, setOpen] = useState(false);
  const [params, setParams] =
    useState<CircularVisualizationParams>(initialParams);

  const handleParamChange = (
    key: keyof CircularVisualizationParams,
    value: number
  ) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    updateVisualizationParams({ [key]: value });
    onParamsChange(newParams);
  };

  const resetToDefaults = () => {
    setParams(initialParams);
    updateVisualizationParams(initialParams);
    onParamsChange(initialParams);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="absolute top-4 right-4 z-10 cursor-pointer"
        >
          Controls
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-gray-900 text-white border-gray-700"
      >
        <SheetHeader>
          <SheetTitle className="font-bold text-white">
            Audio Controls
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Gain</h3>
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
                  onChange={e =>
                    onGainChange('Left', parseFloat(e.target.value))
                  }
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
                  onChange={e =>
                    onGainChange('Right', parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer slider-green"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div>
            <h3 className="text-lg font-semibold mb-3">Visualization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stepFactor" className="text-gray-300">
                  Step Factor: {params.stepFactor.toFixed(3)}
                </Label>
                <Input
                  id="stepFactor"
                  type="range"
                  min="1.001"
                  max="1.1"
                  step="0.001"
                  value={params.stepFactor}
                  onChange={e =>
                    handleParamChange('stepFactor', parseFloat(e.target.value))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="colorStepFactor" className="text-gray-300">
                  Color Speed: {params.colorStepFactor}
                </Label>
                <Input
                  id="colorStepFactor"
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={params.colorStepFactor}
                  onChange={e =>
                    handleParamChange(
                      'colorStepFactor',
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="opacity" className="text-gray-300">
                  Opacity: {(params.opacity * 100).toFixed(2)}%
                </Label>
                <Input
                  id="opacity"
                  type="range"
                  min="0.95"
                  max="1"
                  step="0.0005"
                  value={params.opacity}
                  onChange={e =>
                    handleParamChange('opacity', parseFloat(e.target.value))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="radius" className="text-gray-300">
                  Particle Size: {params.radius.toFixed(1)}
                </Label>
                <Input
                  id="radius"
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={params.radius}
                  onChange={e =>
                    handleParamChange('radius', parseFloat(e.target.value))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="panSpeed" className="text-gray-300">
                  Pan Speed: {params.panSpeed.toFixed(4)}
                </Label>
                <Input
                  id="panSpeed"
                  type="range"
                  min="0"
                  max="0.01"
                  step="0.0001"
                  value={params.panSpeed}
                  onChange={e =>
                    handleParamChange('panSpeed', parseFloat(e.target.value))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="panRadius" className="text-gray-300">
                  Pan Distance: {(params.panRadius * 100).toFixed(0)}%
                </Label>
                <Input
                  id="panRadius"
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={params.panRadius}
                  onChange={e =>
                    handleParamChange('panRadius', parseFloat(e.target.value))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rotationSpeed" className="text-gray-300">
                  Spin Speed: {params.rotationSpeed.toFixed(4)}
                </Label>
                <Input
                  id="rotationSpeed"
                  type="range"
                  min="0"
                  max="0.05"
                  step="0.001"
                  value={params.rotationSpeed}
                  onChange={e =>
                    handleParamChange(
                      'rotationSpeed',
                      parseFloat(e.target.value)
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <Separator className="my-4 bg-gray-700" />
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="w-full text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
