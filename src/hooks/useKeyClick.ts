import { useCallback, useRef } from "react";

export default function useKeyClick() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/spacebar-click-keyboard-199448.mp3');
      audioRef.current.playbackRate = 4.0;
    }
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }, []);

  return play;
}
