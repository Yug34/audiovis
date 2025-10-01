import { useCallback } from 'react';
import type { GainStateType, OutputChannelTypes } from '@/types/audio';

export function useGainControl(
  gainState: Record<string, GainStateType>,
  setGainState: React.Dispatch<
    React.SetStateAction<Record<string, GainStateType>>
  >,
  audioCtxRef: React.MutableRefObject<AudioContext | null>
) {
  const handleGainChange = useCallback(
    (channel: OutputChannelTypes, value: number) => {
      const gainNodeName =
        channel === 'Left' ? 'leftGainNode' : 'rightGainNode';
      const gainNode = gainState[gainNodeName];

      if (gainNode && audioCtxRef.current) {
        gainNode.node.gain.setValueAtTime(
          value,
          audioCtxRef.current.currentTime
        );
        setGainState(prevState => ({
          ...prevState,
          [gainNodeName]: {
            ...gainNode,
            gain: value,
          },
        }));
      }
    },
    [gainState, audioCtxRef, setGainState]
  );

  return { handleGainChange };
}
