import Loader from "../components/Loader";
import React from "react";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function IdeaGenerator() {
  const [idea, setIdea] = useState("");
  const [description, setDescription] = useState("");
  const [generatedIdea, setGeneratedIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const phrases = [
    "Generating...",
    "Crunching numbers...",
    "Summoning ideas...",
    "Brainstorming...",
    "Thinking deeply...",
    "Looking for inspiration...",
    "Searching for the perfect idea...",
    "Consulting the muses...",
    "Connecting the dots...",
    "Exploring new possibilities...",
    "Unlocking creativity...",
    "Mixing up concepts...",
    "Diving into imagination...",
    "Piecing together inspiration...",
    "Letting thoughts wander...",
    "Sparking innovation...",
    "Dreaming up something new...",
    "Synthesizing insights...",
    "Pondering possibilities...",
    "Inventing the unexpected...",
    "Channeling creative energy...",
  ]

  // DROPDOWN
  const [selectedSize, setSelectedSize] = useState("Small");


  

  const handleGenerate = async () => {
    setIsGenerating(true)
    console.log("Generating idea...")
    const data = await generateIdea(idea, selectedSize)
    const parsed = parseIdeaResponse(data?.idea, data?.description);
    setGeneratedIdea(parsed.idea);
    setDescription(parsed.description);
    
    setIsGenerating(false)
  }

  return (
    <div>
      <h1 className="pt-10 font-mono text-4xl font-bold text-center text-white">Idea Generator</h1>
      <div className="flex flex-col items-center justify-center mt-8">
        <div className="w-full max-w-xl p-6 font-mono bg-black border rounded-lg shadow-lg border-terminal">
          <div className="flex items-center mb-4">
            <span className="mr-2 text-terminal">$</span>
            <input
              type="text"
              placeholder="Enter a topic or keyword for your idea..."
              autoFocus
              className="flex-1 px-2 py-1 text-white placeholder-gray-400 bg-transparent outline-none"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button
              className="px-4 py-2 font-mono border rounded-lg border-terminal text-terminal hover:border-gray-600"
              onClick={handleGenerate}
              disabled={!idea}
            >
              Generate
            </button>
            <select
              className="px-4 py-2 font-mono bg-black border rounded-lg border-terminal text-terminal hover:border-gray-600"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
                <option value="XS">XS</option>

              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>
              {isGenerating ? (
                  <Loader phrases={phrases} />
              ) : (
                  generatedIdea && (
                      <div className="w-full max-w-4xl p-6 mt-4 font-mono bg-black border rounded-lg shadow-lg border-terminal">
                          <h2 className="flex items-center gap-2 mb-2 text-2xl font-bold text-terminal">
                              💡 {generatedIdea}
                          </h2>
                          <div className="font-mono prose text-white prose-invert prose-headings:font-mono prose-p:font-mono prose-li:font-mono max-w-none">
                              <ReactMarkdown>{description}</ReactMarkdown>
                          </div>
                      </div>
                  )
              )}
      </div>
    </div>
  );
}


async function generateIdea(idea: string, size: string) {
  const url = "https://api.tomasp.me/idea-generator"
  const body = {
    "idea": "Project Size: " + size.toUpperCase() + "\n" + "Idea: " + idea
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body)
    })

    const rawJson = await response.json().catch(async () => {
      const fallbackText = await response.text()
      try {
        return JSON.parse(fallbackText)
      } catch {
        return { idea: fallbackText }
      }
    })

    if (rawJson?.result) {
      let innerStr = rawJson.result
      if (typeof innerStr === "string") {
        const fenced = innerStr.match(/```[a-zA-Z]*\n?([\s\S]*?)\n?```/)
        if (fenced?.[1]) innerStr = fenced[1]
      }
      if (typeof innerStr === "string") {
        try {
          const inner = JSON.parse(innerStr)
          if (inner?.idea || inner?.description) {
            return { idea: inner.idea || "Idea", description: inner.description || "" }
          }
        } catch {
          // ignore and fall through
        }
        return { idea: innerStr }
      }
    }

    if (rawJson?.idea) {
      return { idea: rawJson.idea, description: rawJson.description }
    }

    if (typeof rawJson === "string") return { idea: rawJson }

    return { idea: "IDEA: Failed to generate idea. DESCRIPTION: Empty response." }
  } catch (error) {
    console.error("Error generating idea:", error)
    return { idea: "IDEA: Failed to generate idea. DESCRIPTION: Failed to generate idea." }
  }
}

function parseIdeaResponse(rawIdea: string | undefined, rawDescription?: string) {
  if (rawDescription) {
    return {
      idea: (rawIdea || "Idea").trim() || "Idea",
      description: rawDescription.trim() || "No description available",
    }
  }

  if (!rawIdea) {
    return { idea: "Failed to parse idea.", description: "No content returned." }
  }
  // Trim outer quotes if the API wraps the string
  const cleanedFences = rawIdea.trim().replace(/```[a-zA-Z]*\n?([\s\S]*?)\n?```/, "$1");
  const cleaned = cleanedFences.replace(/^"+|"+$/g, "");
  const match = cleaned.match(/IDEA:\s*(.*?)\s*DESCRIPTION:\s*([\s\S]*)/i);
  if (match) {
    const [, idea, description] = match;
    return {
      idea: idea.trim() || "No idea available",
      description: description.trim() || "No description available",
    };
  }
  // Fallback: treat entire string as the description if it doesn't match the pattern
  return {
    idea: "Idea",
    description: cleaned,
  };
}
