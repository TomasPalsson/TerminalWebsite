'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Send } from 'lucide-react';
import TypingAnimation from '../components/TypingAnimation';
import React from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string };

const API_ENDPOINT =
  'https://d53i8riosh.execute-api.eu-west-1.amazonaws.com/default/chat';

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
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-100">
      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-4 pb-28 space-y-6 flex flex-col"
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
            className="font-mono text-base text-left mr-auto w-6 h-4"
          />
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
        className="fixed inset-x-0 bottom-0 pb-6 px-4 flex justify-center"
      >
        <div
          className="w-full max-w-2xl flex items-end rounded-lg bg-neutral-800/80 backdrop-blur
            ring-1 ring-neutral-700 focus-within:ring-2 focus-within:ring-neutral-500 transition"
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
            className="flex-1 bg-transparent resize-none overflow-hidden
              py-3 pl-4 pr-12 font-mono placeholder-neutral-400 outline-none"
          />

          <button
            type="submit"
            className="grid place-items-center h-10 w-10 m-1 rounded-md
              hover:bg-neutral-700 active:scale-95 transition"
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
  const url = new URL(API_ENDPOINT);
  url.searchParams.append('chat', prompt);
  if (session) url.searchParams.append('session', session);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { reply: data.reply ?? JSON.stringify(data), session: data.session };
}
