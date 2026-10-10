import React, { useState } from 'react';
import { Link2, Sparkles, Share2, ArrowRight, Check, Loader2 } from 'lucide-react';
import { DEMO_URLS } from '../data/samples';

interface LinkHeroBannerProps {
  onProcessUrl: (url: string) => Promise<void>;
  onOpenShareModal: () => void;
  isLoading: boolean;
  currentUrl?: string;
  onSelectSample: (sampleId: string) => void;
}

export const LinkHeroBanner: React.FC<LinkHeroBannerProps> = ({
  onProcessUrl,
  onOpenShareModal,
  isLoading,
  currentUrl = '',
  onSelectSample
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onProcessUrl(urlInput.trim());
    }
  };

  const handleCopyCurrentLink = () => {
    let linkToCopy = window.location.href;
    if (urlInput.trim()) {
      const u = new URL(window.location.origin + window.location.pathname);
      u.searchParams.set('url', urlInput.trim());
      u.searchParams.set('process', 'all');
      linkToCopy = u.toString();
    }
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        {/* Editorial headline with text-wrap: balance */}
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
            Universal Data Normalization Pipeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
            Process and clean data with a single link
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto" style={{ textWrap: 'balance' }}>
            Paste any Google Sheet, raw CSV, or table URL to deduplicate records, strip whitespace, resolve duplicate headers, and repair missing values in one click.
          </p>
        </div>

        {/* The Link Processor Search Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="relative flex-1 flex items-center min-w-0">
              <Link2 className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste data URL (e.g. Google Sheet, raw CSV, GitHub, API endpoint)..."
                className="w-full py-2.5 px-1 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                required
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="px-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process Everything</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Demo Links & Duplicate Test URL */}
        <div className="pt-2 space-y-2">
          {/* Dedicated Duplicate URL Testing Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="font-semibold text-amber-800">🧪 Test Duplicate URL:</span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-950">
              /api/test-duplicates
            </span>
            <button
              type="button"
              onClick={() => {
                setUrlInput('/api/test-duplicates');
                onProcessUrl('/api/test-duplicates');
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition-colors shadow-2xs whitespace-nowrap"
            >
              ⚡ Run Test on Duplicate URL
            </button>
            <button
              type="button"
              onClick={() => {
                const fullUrl = window.location.origin + '/api/test-duplicates';
                navigator.clipboard.writeText(fullUrl);
                setUrlInput(fullUrl);
              }}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-medium rounded-md transition-colors whitespace-nowrap"
            >
              Copy Full URL
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
            <span className="text-slate-500 font-medium">Other presets:</span>
            {DEMO_URLS.filter(d => d.url !== '/api/test-duplicates').map((demo) => (
              <button
                key={demo.url}
                type="button"
                onClick={() => {
                  setUrlInput(demo.url);
                  onProcessUrl(demo.url);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md transition-colors whitespace-nowrap hover:border-slate-300"
              >
                {demo.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onSelectSample('user_messy')}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium rounded-md transition-colors whitespace-nowrap"
            >
              Sample Messy Dataset
            </button>
          </div>
        </div>

        {/* Shareable Link Trigger */}
        <div className="pt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <button
            type="button"
            onClick={handleCopyCurrentLink}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium underline underline-offset-4 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Processing link copied to clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Make a shareable link to process everything</span>
              </>
            )}
          </button>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <button
            type="button"
            onClick={onOpenShareModal}
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            View cURL / Webhook API commands
          </button>
        </div>
      </div>
    </div>
  );
};
