import React, { useState } from 'react';
import { X, Check, Copy, Link as LinkIcon, Terminal, Globe, Sparkles } from 'lucide-react';
import { CleanOptions } from '../types/data';
import { generateProcessLink, generateCurlCommand } from '../utils/linkProcessor';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  sampleId?: string;
  options: CleanOptions;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  sampleId,
  options
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(currentUrl || '');

  if (!isOpen) return null;

  const targetUrl = customUrlInput.trim() || currentUrl || (sampleId ? '' : '/api/sample-messy');

  const shareableUrl = generateProcessLink({
    url: targetUrl || undefined,
    sampleId: !targetUrl && sampleId ? sampleId : undefined,
    options,
    autoProcess: true
  });

  const curlCommand = generateCurlCommand(targetUrl || 'https://example.com/dataset.csv', options.missingStrategy);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Link to Process Everything</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          <div>
            <p className="text-slate-700 leading-relaxed">
              This link encodes your automated cleaning pipeline and target data source. Opening this link will immediately load the data, execute all cleaning rules, and display the processed dataset ready for export.
            </p>
          </div>

          {/* Target Data URL Input if customizing */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Data Source URL
            </label>
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/... or raw CSV"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
            />
          </div>

          {/* Generated Shareable Link */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shareable Direct Processing URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 break-all select-all max-h-20 overflow-y-auto">
                {shareableUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Parameter <code className="font-mono text-slate-600">process=all</code> triggers instant normalization and deduplication.
            </p>
          </div>

          {/* Terminal / cURL Webhook Command */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-slate-500" />
                <span>cURL / Automation Command</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Link works across browsers without account signup
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
