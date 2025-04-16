import { Send } from 'lucide-react';
import React from 'react';

export default function ChatMe() {
  return (
    <div className="relative w-full h-screen"> 
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-16">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="p-2 w-64 h-12 rounded-xl bg-zinc-700 text-white"
          />
          <button className="ml-2 p-2 bg-gray-600 rounded-xl text-white flex items-center justify-center">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
