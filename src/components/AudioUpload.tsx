import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';

const lookToWindwardUrl = new URL(
  '../../assets/lookToWindward.mp3',
  import.meta.url
).toString();
const haloOstUrl = new URL(
  '../../assets/haloOST.mp3',
  import.meta.url
).toString();
const evenInArcadia = new URL(
  '../../assets/evenInArcadia.png',
  import.meta.url
).toString();
const neverGonnaGiveYouUp = new URL(
  '../../assets/neverGonnaGiveYouUp.mp3',
  import.meta.url
).toString();
const haloImage = new URL(
  '../../assets/haloLogo.png',
  import.meta.url
).toString();
const question = new URL(
  '../../assets/question.png',
  import.meta.url
).toString();

const AUDIO_SOURCES = [
  {
    source: lookToWindwardUrl,
    alt: 'Look To Windward',
    image: evenInArcadia,
  },
  { source: haloOstUrl, alt: 'Halo OST', image: haloImage },
  { source: neverGonnaGiveYouUp, alt: 'Random song', image: question },
];

export interface AudioUploadProps {
  onFileSelect: (file: File) => void;
}

export const AudioUpload = ({ onFileSelect }: AudioUploadProps) => {
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const initialize = async (e: ChangeEvent<HTMLInputElement> | null) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate that the file is actually an audio file
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
      }
      onFileSelect(file);
    }
  };

  const loadPreset = async (label: string, url: string) => {
    if (loadingPreset) return; // Prevent clicks while loading

    setLoadingPreset(label);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${label}.mp3`, { type: 'audio/mpeg' });
      onFileSelect(file);
    } finally {
      setLoadingPreset(null);
    }
  };

  return (
    <div
      className={
        'absolute flex flex-col h-full justify-center items-start max-w-screen p-2'
      }
    >
      <Card className="max-w-full py-2 md:py-6 gap-y-2 md:gap-y-6">
        <CardHeader className="px-4 md:px-6 text-md mt-2">
          <CardTitle className="mb-3 flex justify-between items-center">
            <div>Add an .mp3 file to visualize</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-2 md:px-6">
          <Label htmlFor="dropzone-file" className={'cursor-pointer'}>
            <Card className="flex p-4 items-center justify-center w-full brightness-[0.95] hover:brightness-[0.90] min-w-[300px] md:min-w-[600px]">
              <div className="text-center w-full">
                <div className="border p-2 rounded-md max-w-min mx-auto">
                  <Upload />
                </div>

                <p className="my-2 text-sm">
                  <span className="font-semibold">
                    Click here to upload an <code>.mp3</code> file
                  </span>
                </p>
              </div>
            </Card>
          </Label>

          <Input
            id="dropzone-file"
            accept="audio/mp3"
            type="file"
            className="hidden"
            onChange={e => {
              initialize(e);
            }}
          />

          <div className="relative mt-2 md:mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or pick one of these
              </span>
            </div>
          </div>

          <div className="flex gap-x-2 md:gap-x-4 max-w-full px-2 pt-2 md:pt-4">
            {AUDIO_SOURCES.map(({ source, alt, image }) => {
              const isLoading = loadingPreset === alt;
              const isAnyLoading = loadingPreset !== null;

              return (
                <div
                  key={alt}
                  onClick={() => !isAnyLoading && loadPreset(alt, source)}
                  className={`relative w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-lg overflow-hidden transition-all ${
                    isAnyLoading
                      ? isLoading
                        ? 'cursor-wait brightness-75'
                        : 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:brightness-[1.15]'
                  }`}
                  style={{
                    pointerEvents: isAnyLoading && !isLoading ? 'none' : 'auto',
                  }}
                  aria-disabled={isAnyLoading && !isLoading}
                >
                  <img
                    src={image}
                    alt={alt}
                    className="w-full h-full object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
