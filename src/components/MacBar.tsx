import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, MessageCircleCode, X } from 'lucide-react';
import { Link } from 'react-router';

type MacBarProps = {
  fullscreenRef: React.RefObject<HTMLDivElement>;
};

export default function MacBar({ fullscreenRef }: MacBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep track of fullscreen state
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    const elem = fullscreenRef.current;

    if (!document.fullscreenElement && elem?.requestFullscreen) {
      elem.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center w-full gap-2 px-2 py-1 bg-zinc-800">
      <Link to="/">
        <button className="w-3 h-3 bg-red-500 rounded-full">
          <X className="w-3 h-3 stroke-5" />
        </button>
      </Link>

      <span className="w-3 h-3 bg-yellow-400 rounded-full" />

      <button
        className="flex items-center justify-center w-3 h-3 bg-green-500 rounded-full"
        onClick={handleToggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize2 className="w-2 h-2 stroke-5" />
        ) : (
          <Maximize2 className="w-2 h-2 stroke-5" />
        )}
      </button>

      <span className="absolute font-mono font-bold text-gray-300 -translate-x-1/2 left-1/2">
        tomasp.me
      </span>

    </div>
  );
}
