import React from "react";
import ReactMarkdown from "react-markdown";
import { SavedIdea } from "./IdeaGenerator";
import { useNavigate } from "react-router";

export default function IdeaLibrary() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = React.useState<SavedIdea[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("idea-favorites");
      if (raw) {
        const parsed = JSON.parse(raw) as SavedIdea[];
        setIdeas(parsed);
        if (parsed.length) setSelectedId(parsed[0].id);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const handleRemove = (id: string) => {
    const next = ideas.filter((i) => i.id !== id);
    setIdeas(next);
    localStorage.setItem("idea-favorites", JSON.stringify(next));
    if (selectedId === id) {
      setSelectedId(next.length ? next[0].id : null);
    }
  };

  const selected = ideas.find((i) => i.id === selectedId) || null;

  return (
    <div className="flex flex-col items-center w-full min-h-screen px-4 py-10 text-white bg-black">
      <div className="flex items-center justify-between w-full max-w-5xl mb-6">
        <h1 className="text-3xl font-bold text-terminal">Saved Ideas</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/idea-generator")}
            className="px-3 py-2 text-sm border rounded border-terminal text-terminal hover:border-gray-600"
          >
            Back to generator
          </button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="w-full max-w-5xl p-6 font-mono text-sm text-gray-300 border rounded border-terminal/50">
          No favorites yet. Generate an idea and save it first.
        </div>
      ) : (
        <div className="flex w-full max-w-5xl gap-4">
          <div className="w-64 p-3 overflow-y-auto border rounded border-terminal/50 max-h-[70vh]">
            <div className="mb-2 text-sm text-gray-400">Titles</div>
            <div className="space-y-2">
              {ideas.map((item) => (
                <button
                  key={item.id}
                  className={`w-full text-left p-2 rounded border ${
                    item.id === selectedId
                      ? "border-terminal bg-terminal/10 text-terminal"
                      : "border-transparent hover:border-terminal/60"
                  }`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="text-sm font-semibold line-clamp-2">{item.idea}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.savedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 border rounded border-terminal/50 min-h-[50vh]">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl font-bold text-terminal">{selected.idea}</h2>
                  <button
                    onClick={() => handleRemove(selected.id)}
                    className="text-sm text-red-400 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Saved {new Date(selected.savedAt).toLocaleString()}
                </div>
                <div className="mt-4 font-mono prose text-white prose-invert prose-headings:font-mono prose-p:font-mono prose-li:font-mono max-w-none">
                  <ReactMarkdown>{selected.description}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="text-gray-400">Select an idea to view details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
