import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

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
  const initialize = async (e: ChangeEvent<HTMLInputElement> | null) => {
    const file = e?.target?.files?.[0];
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

  return (
    <div className={'absolute flex flex-col h-full justify-center items-start'}>
      <Card>
        <CardHeader>
          <CardTitle className="mb-3 flex justify-between items-center">
            <div>Add an audio to visualize</div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Label htmlFor="dropzone-file" className={'cursor-pointer'}>
            <Card className="flex p-4 items-center justify-center w-full brightness-[0.95] hover:brightness-[0.90] min-w-[300px] md:min-w-[600px]">
              <div className="text-center w-full">
                <div className="border p-2 rounded-md max-w-min mx-auto">
                  <Upload />
                </div>

                <p className="my-2 text-sm">
                  <span className="font-semibold">
                    Click here to upload an audio file
                  </span>
                </p>
              </div>
            </Card>
          </Label>

          <Input
            id="dropzone-file"
            accept="audio/*"
            type="file"
            className="hidden"
            onChange={e => {
              initialize(e);
            }}
          />

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or pick one of these
              </span>
            </div>
          </div>

          <div className="flex gap-x-4 max-w-full px-2 pt-4">
            {AUDIO_SOURCES.map(({ source, alt, image }) => (
              <img
                src={image}
                key={alt}
                onClick={() => loadPreset(alt, source)}
                className={
                  'max-w-[200px] rounded-lg cursor-pointer hover:brightness-[1.15]'
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
