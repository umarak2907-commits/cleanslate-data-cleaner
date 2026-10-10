import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, Database, ArrowRight } from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/samples';

interface DataSourceTabsProps {
  onFileUpload: (file: File) => void;
  onRawTextSubmit: (text: string, filename: string) => void;
  onSelectSample: (sampleId: string) => void;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
  activeTab: 'link' | 'upload' | 'paste' | 'samples';
  setActiveTab: (tab: 'link' | 'upload' | 'paste' | 'samples') => void;
}

export const DataSourceTabs: React.FC<DataSourceTabsProps> = ({
  onFileUpload,
  onRawTextSubmit,
  onSelectSample,
  onUrlSubmit,
  isLoading,
  activeTab,
  setActiveTab
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [pasteFilename, setPasteFilename] = useState('pasted_data.csv');
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Segmented Tab Headers */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('link')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'link'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Remote Link / URL</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'upload'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File (CSV, XLSX)</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'paste'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Paste Text / CSV</span>
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'samples'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Curated Sample Datasets</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Process Dataset from URL Link</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports Google Sheets (view/edit links are auto-converted to CSV export), GitHub raw files, Dropbox, and web APIs.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (urlInput.trim()) onUrlSubmit(urlInput.trim());
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... or raw CSV link"
                className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {isLoading ? 'Fetching Data...' : 'Fetch & Load Link'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
            }`}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-900">
              Drag and drop your file here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline underline-offset-2">
                browse files
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV, XLSX, XLS, and TSV files up to 50 MB
            </p>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Paste Raw Data</h3>
                <p className="text-xs text-slate-500 mt-0.5">Paste comma-separated, tab-separated, or unformatted spreadsheet rows.</p>
              </div>
              <input
                type="text"
                value={pasteFilename}
                onChange={(e) => setPasteFilename(e.target.value)}
                placeholder="filename.csv"
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono text-slate-700 w-40"
              />
            </div>
            <textarea
              rows={6}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={`Full Name, Age ,Email, City, City,Unnamed: 0\n" Aisha Khan ",20,aisha@example.com,Warangal,Warangal,0\nRahul,21,,Hyderabad,Hyderabad,1`}
              className="w-full p-3 font-mono text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPasteContent('')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pasteContent.trim()) {
                    onRawTextSubmit(pasteContent, pasteFilename);
                  }
                }}
                disabled={!pasteContent.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors"
              >
                Load Pasted Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_DATASETS.map((sample) => (
              <div
                key={sample.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{sample.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3">{sample.description}</p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                  <span className="text-xs font-mono text-slate-400">{sample.filename}</span>
                  <button
                    onClick={() => onSelectSample(sample.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
