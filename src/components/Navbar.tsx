import React from 'react';
import { Sparkles, Share2, FileDown } from 'lucide-react';

interface NavbarProps {
  onProcessEverything: () => void;
  onOpenShareModal: () => void;
  onExport: () => void;
  hasData: boolean;
  hasProcessed: boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onProcessEverything,
  onOpenShareModal,
  onExport,
  hasData,
  hasProcessed,
  activeSection,
  setActiveSection
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            onClick={(e) => {
              if (window.location.search) {
                // allow clean reset if needed
              }
            }}
          >
            CleanSlate
          </a>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
            Smart Data Cleaner & Link Processor
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveSection('input')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'input' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveSection('pipeline')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'pipeline' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Pipeline Rules
          </button>
          <button
            onClick={() => setActiveSection('preview')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'preview' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Data Table
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'audit' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Audit Report
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenShareModal}
            title="Create a shareable link that automatically processes this dataset"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Processing Link</span>
          </button>

          {hasProcessed ? (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Clean Data</span>
            </button>
          ) : (
            <button
              onClick={onProcessEverything}
              disabled={!hasData}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm ${
                hasData
                  ? 'text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Process Everything</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
