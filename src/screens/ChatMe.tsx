'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Send } from 'lucide-react';
import TypingAnimation from '../components/TypingAnimation';
import React from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string };

const API_ENDPOINT =
  'https://api.tomasp.me/chat';

export default function ChatMe() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { role: 'user', content: text }]);

  const pushAssistant = (text: string) =>
    setMessages((m) => [...m, { role: 'assistant', content: text }]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    pushUser(text);
    setIsTyping(true);

    try {
      const { reply, session } = await callAI(text, sessionRef.current);
      if (!sessionRef.current && session) sessionRef.current = session;
      pushAssistant(reply);
      // no more setIsTyping(false) here
    } catch (err) {
      console.error(err);
      pushAssistant('❌ error talking to the model');
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
<div className='flex justify-center px-6 py-4 font-mono text-center text-neutral-400'>
  <p>Be aware this is a chat bot and so can make mistakes :)</p>
</div>
      <div
        ref={scrollRef}
        className="flex flex-col flex-1 px-6 pt-4 space-y-6 overflow-y-auto pb-28"
      >
        {messages.map(({ role, content }, i) => {
          const baseCls =
            'font-mono text-base leading-relaxed max-w-[65ch]';
          const align =
            role === 'assistant'
              ? 'text-left mr-auto'
              : 'text-right ml-auto';

          const isLast = i === messages.length - 1;
          if (role === 'assistant' && isTyping && isLast) {
            return (
              <TypingAnimation
                key={i}
                text={content}
                speed={10}
                className={`${baseCls} ${align}`}
                onFinished={() => setIsTyping(false)}
              />
            );
          }

          return (
            <p
              key={i}
              className={`${baseCls} ${align} whitespace-pre-wrap break-words`}
            >
              {content}
            </p>
          );
        })}

        {/* tiny cursor while waiting for reply */}
        {isTyping && (
          <TypingAnimation
            text=""
            className="w-6 h-4 mr-auto font-mono text-base text-left"
          />
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
        className="fixed inset-x-0 bottom-0 flex justify-center px-4 pb-6"
      >
        <div
          className="flex items-end w-full max-w-2xl transition rounded-lg bg-neutral-800/80 backdrop-blur ring-1 ring-neutral-700 focus-within:ring-2 focus-within:ring-neutral-500"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type something…"
            className="flex-1 py-3 pl-4 pr-12 overflow-hidden font-mono bg-transparent outline-none resize-none placeholder-neutral-400"
          />

          <button
            type="submit"
            className="grid w-10 h-10 m-1 transition rounded-md place-items-center hover:bg-neutral-700 active:scale-95"
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
}

async function callAI(
  prompt: string,
  session: string | null,
): Promise<{ reply: string; session?: string }> {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat: prompt,
      session: session,
    }),
  });
  console.log('callAI', prompt, session, res.status);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { reply: data.reply ?? JSON.stringify(data), session: data.session };
}
