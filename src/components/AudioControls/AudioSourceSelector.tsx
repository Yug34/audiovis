import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface AudioSourceSelectorProps {
  onMicrophoneStart: () => void;
  onFileSelect: (file: File) => void;
}

export function AudioSourceSelector({
  onMicrophoneStart,
  onFileSelect,
}: AudioSourceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="flex flex-col gap-4 items-center">
        <h2 className="text-2xl mb-4 text-white">Choose Audio Source</h2>
        <div className="flex gap-4">
          <Button
            onClick={onMicrophoneStart}
            variant="secondary"
            size="lg"
            className="text-xl px-8 py-6"
          >
            Use Microphone
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="secondary"
            className="text-xl px-8 py-6"
          >
            Upload Audio File
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
