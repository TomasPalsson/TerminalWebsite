import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";

export default function UrlShortener() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState("");
  const [showCopied, setShowCopied] = useState(false);

  const phrases = [
    "Shortening URL...",
    "Creating magic link...",
    "Compressing URL...",
    "Making it tiny...",
    "Almost there...",
    "Processing...",
    "Generating short link...",
    "Optimizing...",
  ];


  // Check slug availability when customSlug changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!customSlug) {
        setSlugAvailable(null);
        setSlugError("");
        return;
      }

      setIsChecking(true);
      setSlugError("");
      try {
        const slug = customSlug.trim();
        const response = await fetch(`https://t0mas.io/check/${encodeURIComponent(slug)}`);
        const data = await response.json();
        setSlugAvailable(data.available);
      } catch (err) {
        setSlugError("Failed to check slug availability");
        setSlugAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [customSlug]);

  const handleShorten = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const trimmedUrl = url.trim();
      const trimmedSlug = customSlug.trim();

      const response = await fetch("https://t0mas.io/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
          id: trimmedSlug || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to shorten URL");
      }

      setShortenedUrl(`${data.shortUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="pt-10 text-center font-mono text-4xl font-bold text-white">
        URL Shortener
      </h1>
      <div className="mt-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl rounded-lg border border-terminal bg-black p-6 font-mono shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-terminal">$</span>
              <input
                type="url"
                placeholder="Enter URL to shorten..."
                className="flex-1 bg-transparent px-2 py-1 text-white placeholder-gray-400 outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <span className="mr-2 text-terminal">$</span>
                <input
                  type="text"
                  placeholder="Custom slug (optional)..."
                  className="flex-1 bg-transparent px-2 py-1 text-white placeholder-gray-400 outline-none"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
              </div>
              {isChecking ? (
                <span className="text-sm text-terminal">Checking availability...</span>
              ) : slugAvailable !== null && customSlug && (
                <span className={`${slugAvailable ? 'text-green-500' : 'text-red-500'} text-sm`}>
                  {slugAvailable ? '✓ Slug is available' : '✗ Slug is not available'}
                </span>
              )}
              {slugError && (
                <span className="text-sm text-red-500">{slugError}</span>
              )}
            </div>
            <button
              className="rounded-lg border border-terminal px-4 py-2 font-mono text-terminal hover:border-gray-600 disabled:opacity-50"
              onClick={handleShorten}
              disabled={!url || isGenerating || (customSlug !== "" && slugAvailable === false)}
            >
              Shorten
            </button>
          </div>
        </div>

        {isGenerating ? (
          <Loader phrases={phrases} />
        ) : (
          shortenedUrl && (
            <div className="mt-4 w-full max-w-xl rounded-lg border border-terminal bg-black p-6 font-mono shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-terminal">Shortened URL:</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shortenedUrl}
                  className="flex-1 bg-transparent px-2 py-1 text-white outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-terminal px-4 py-2 font-mono text-terminal hover:border-gray-600"
                >
                  {showCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )
        )}

        {error && (
          <div className="mt-4 w-full max-w-xl rounded-lg border border-red-500 bg-black p-4 font-mono text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 
