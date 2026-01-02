'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import React from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string; time_taken: string };

const API_ENDPOINT = 'https://wms5kwgviazs3ja6lnvngmovee0qqtuh.lambda-url.eu-west-1.on.aws/';

export default function ChatMe() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { role: 'user', content: text, time_taken: '0s' }]);

  const pushAssistant = (text: string, time_taken: string) =>
    setMessages((m) => [...m, { role: 'assistant', content: text, time_taken }]);


  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    pushUser(text);
    try {
      const start = performance.now();
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: text, session: sessionRef.current }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = '';
      let buffer = '';

      // add placeholder assistant message
      setMessages((m) => [...m, { role: 'assistant', content: '', time_taken: '...' }]);

      const updateAssistant = (content: string) => {
        setMessages((m) => {
          const next = [...m];
          const idx = next.findIndex((msg, i) => msg.role === 'assistant' && i === next.length - 1);
          if (idx !== -1) {
            next[idx] = { ...next[idx], content };
          }
          return next;
        });
      };

      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: !done });

          // strip and handle any JSON tokens embedded in stream
          const jsonRegex = /\{[^}]*\}/g;
          let jsonMatch;
          while ((jsonMatch = jsonRegex.exec(buffer)) !== null) {
            try {
              const obj = JSON.parse(jsonMatch[0]);
              if (!sessionRef.current && obj.sessionId && typeof obj.sessionId === 'string') {
                sessionRef.current = obj.sessionId;
              }
              if (obj.done) done = true;
            } catch {
              // ignore bad json
            }
          }
          buffer = buffer.replace(jsonRegex, '');

          // handle event: done markers
          if (buffer.includes('event: done')) {
            done = true;
            buffer = buffer.replace('event: done', '');
          }

          // process data: chunks
          const dataRegex = /data:\s*([^\n]*)/g;
          let lastIdx = 0;
          let dataMatch;
          while ((dataMatch = dataRegex.exec(buffer)) !== null) {
            lastIdx = dataRegex.lastIndex;
            const addition = dataMatch[1]?.replace(/^"+|"+$/g, '');
            if (!addition || addition === '[DONE]') continue;
            assistantContent += addition;
            updateAssistant(assistantContent);
          }
          // keep any trailing partial after the last processed match
          buffer = buffer.slice(lastIdx);
        }
      }

      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setMessages((m) => {
        const next = [...m];
        const idx = next.findIndex((msg, i) => msg.role === 'assistant' && i === next.length - 1);
        if (idx !== -1) {
          next[idx] = { ...next[idx], time_taken: `${elapsed}s` };
        }
        return next;
      });
    } catch (err) {
      console.error(err);
      pushAssistant('Error talking to the model', '0s');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      <div className="relative w-full max-w-5xl px-4 pt-6 mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wide text-terminal">
              <Sparkles size={14} />
              AI Chat
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-500 max-w-2xl">
              LLM responses may be imperfect.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col flex-1 w-full max-w-5xl px-4 mx-auto mt-6 space-y-6 overflow-y-auto scrollbar-hide pb-32"
      >
        {messages.map(({ role, content, time_taken }, i) => {
          const isUser = role === 'user';
          const bubble =
            'inline-flex items-start gap-3 px-4 py-3 max-w-3xl rounded-lg border shadow-sm backdrop-blur';
          const base =
            isUser
              ? `${bubble} border-terminal/60 bg-terminal/10 text-terminal ml-auto`
              : `${bubble} border-neutral-700 bg-neutral-900 text-neutral-100 mr-auto`;

          return (
            <div key={i} className={base}>
              {isUser ? (
                <User className="w-4 h-4 text-terminal shrink-0 mt-0.5" />
              ) : (
                <Bot className="w-4 h-4 text-terminal shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {content}
                </p>
                {!isUser && (
                  <span className="mt-1 text-xs text-neutral-500">{time_taken}</span>
                )}
              </div>
            </div>
          );
        })}

      </div>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
        className="fixed inset-x-0 bottom-0 flex justify-center px-4 pb-6"
      >
        <div className="flex items-center w-full max-w-3xl transition rounded-lg bg-neutral-900/90 backdrop-blur ring-1 ring-terminal/40 focus-within:ring-2 focus-within:ring-terminal/70 shadow-[0_0_24px_rgba(34,197,94,0.08)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask about my work, projects, or stack..."
            className="flex-1 py-3 pl-4 pr-12 overflow-hidden font-mono bg-transparent outline-none resize-none placeholder-neutral-500 text-neutral-50 align-middle leading-tight"
          />
          <button
            type="submit"
            className="grid w-12 h-12 m-2 text-terminal transition rounded-md place-items-center hover:bg-terminal/10 active:scale-95"
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
): Promise<{ reply: string; session?: string; time_taken: number }> {
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

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    reply: data.reply ?? JSON.stringify(data),
    session: data.session,
    time_taken: data.time_taken ?? 0
  };
}
