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
    <div className="fixed top-0 left-0 z-50 flex items-center gap-2 px-2 py-2 bg-zinc-800 w-full">
      <Link to="/">
        <button className="w-3 h-3 rounded-full bg-red-500">
          <X className="w-3 h-3 stroke-5" />
        </button>
      </Link>

      <span className="w-3 h-3 rounded-full bg-yellow-400" />

      <button
        className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center"
        onClick={handleToggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize2 className="w-2 h-2 stroke-5" />
        ) : (
          <Maximize2 className="w-2 h-2 stroke-5" />
        )}
      </button>

      <span className="font-mono text-gray-300 font-bold absolute left-1/2 -translate-x-1/2">
        tomasp.is
      </span>

      <Link to="/chat">
        <button className="pt-0 pb-0 pr-1 pl-1 text-gray-300 hover:bg-zinc-700 rounded-md absolute right-0 top-0 mr-2 mt-2">
          <MessageCircleCode />
        </button>
      </Link>
    </div>
  );
}
