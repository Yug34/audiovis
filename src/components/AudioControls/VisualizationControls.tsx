import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { CircularVisualizationParams } from '@/types/audio';
import { updateVisualizationParams } from '@/lib/audio/visualization';
import { DEFAULT_VISUALIZATION_PARAMS } from '@/lib/audio/constants';

interface VisualizationControlsProps {
  onParamsChange: (params: CircularVisualizationParams) => void;
  initialParams?: CircularVisualizationParams;
}

export const VisualizationControls = ({
  onParamsChange,
  initialParams = DEFAULT_VISUALIZATION_PARAMS,
}: VisualizationControlsProps) => {
  const [params, setParams] =
    useState<CircularVisualizationParams>(initialParams);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onParamsChange(params);
  }, [params, onParamsChange]);

  const handleParamChange = (
    key: keyof CircularVisualizationParams,
    value: number
  ) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    updateVisualizationParams({ [key]: value });
  };

  const resetToDefaults = () => {
    setParams(initialParams);
    updateVisualizationParams(initialParams);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">
          Visualization Controls
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-300 border-gray-600 hover:bg-gray-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <Separator className="bg-gray-700" />

          {/* Parameter Controls */}
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
                  handleParamChange('colorStepFactor', parseInt(e.target.value))
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
                  handleParamChange('rotationSpeed', parseFloat(e.target.value))
                }
                className="mt-1"
              />
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full text-gray-300 border-gray-600 hover:bg-gray-800"
          >
            Reset to Defaults
          </Button>
        </div>
      )}
    </div>
  );
};
