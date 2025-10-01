import { useState } from 'react';
import type { GainStateType, CircularVisualizationParams } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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

export const ControlsPanel = ({
  gainState,
  onGainChange,
  onParamsChange,
  initialParams = DEFAULT_VISUALIZATION_PARAMS,
}: ControlsPanelProps) => {
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
                <Slider
                  min={0}
                  max={2}
                  step={0.01}
                  value={[gainState.leftGainNode?.gain ?? 1]}
                  onValueChange={v => onGainChange('Left', v[0])}
                  className="mt-1"
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
                <Slider
                  min={0}
                  max={2}
                  step={0.01}
                  value={[gainState.rightGainNode?.gain ?? 1]}
                  onValueChange={v => onGainChange('Right', v[0])}
                  className="mt-1"
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
                <Slider
                  min={1.001}
                  max={1.1}
                  step={0.001}
                  value={[params.stepFactor]}
                  onValueChange={v => handleParamChange('stepFactor', v[0])}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="colorStepFactor" className="text-gray-300">
                  Color Speed: {params.colorStepFactor}
                </Label>
                <Slider
                  min={10}
                  max={500}
                  step={10}
                  value={[params.colorStepFactor]}
                  onValueChange={v =>
                    handleParamChange('colorStepFactor', v[0])
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="opacity" className="text-gray-300">
                  Opacity: {(params.opacity * 100).toFixed(2)}%
                </Label>
                <Slider
                  min={0.95}
                  max={1}
                  step={0.0005}
                  value={[params.opacity]}
                  onValueChange={v => handleParamChange('opacity', v[0])}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="radius" className="text-gray-300">
                  Particle Size: {params.radius.toFixed(1)}
                </Label>
                <Slider
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={[params.radius]}
                  onValueChange={v => handleParamChange('radius', v[0])}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="panSpeed" className="text-gray-300">
                  Pan Speed: {params.panSpeed.toFixed(4)}
                </Label>
                <Slider
                  min={0}
                  max={0.01}
                  step={0.0001}
                  value={[params.panSpeed]}
                  onValueChange={v => handleParamChange('panSpeed', v[0])}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="panRadius" className="text-gray-300">
                  Pan Distance: {(params.panRadius * 100).toFixed(0)}%
                </Label>
                <Slider
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[params.panRadius]}
                  onValueChange={v => handleParamChange('panRadius', v[0])}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rotationSpeed" className="text-gray-300">
                  Spin Speed: {params.rotationSpeed.toFixed(4)}
                </Label>
                <Slider
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={[params.rotationSpeed]}
                  onValueChange={v => handleParamChange('rotationSpeed', v[0])}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator className="my-4 bg-gray-700" />
            <Button
              variant="secondary"
              onClick={resetToDefaults}
              className="w-full cursor-pointer"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
