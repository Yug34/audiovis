import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Upload from './AudioUpload';

interface AudioSourceSelectorProps {
  onFileSelect: (file: File) => void;
}

export function AudioSourceSelector({
  onFileSelect,
}: AudioSourceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const loadPreset = async (label: string, url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], `${label}.mp3`, { type: 'audio/mpeg' });
    onFileSelect(file);
  };

  const lookToWindwardUrl = new URL(
    '../../assets/lookToWindward.mp3',
    import.meta.url
  ).toString();
  const haloOstUrl = new URL(
    '../../assets/haloOST.mp3',
    import.meta.url
  ).toString();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="flex flex-col gap-4 items-center">
        <Upload />
        <h2 className="text-2xl mb-4 text-white">Choose Audio Source</h2>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="secondary"
            className="text-xl px-8 py-6 cursor-pointer"
          >
            Upload Audio File
          </Button>

          <Button
            onClick={() => loadPreset('lookToWindward', lookToWindwardUrl)}
            size="lg"
            variant="secondary"
            className="text-xl px-8 py-6 cursor-pointer"
          >
            Load Preset: Look To Windward
          </Button>

          <Button
            onClick={() => loadPreset('haloOST', haloOstUrl)}
            size="lg"
            variant="secondary"
            className="text-xl px-8 py-6 cursor-pointer"
          >
            Load Preset: Halo OST
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
