import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LinkHeroBanner } from './components/LinkHeroBanner';
import { DataSourceTabs } from './components/DataSourceTabs';
import { PipelineControls } from './components/PipelineControls';
import { DataGrid } from './components/DataGrid';
import { AuditReport } from './components/AuditReport';
import { ExportToolbar } from './components/ExportToolbar';
import { ShareLinkModal } from './components/ShareLinkModal';
import { CleanOptions, ColumnMeta, CleaningReport } from './types/data';
import { DEFAULT_CLEAN_OPTIONS, cleanDataset, analyzeColumns } from './utils/cleaner';
import {
  fetchDataFromUrl,
  parseCsvString,
  parseExcelBuffer,
  getInitialUrlParams
} from './utils/linkProcessor';
import { SAMPLE_DATASETS } from './data/samples';
import { AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS);
  const [headersBefore, setHeadersBefore] = useState<string[]>([]);
  const [rowsBefore, setRowsBefore] = useState<any[][]>([]);
  const [headersAfter, setHeadersAfter] = useState<string[]>([]);
  const [rowsAfter, setRowsAfter] = useState<any[][]>([]);
  const [columnsMeta, setColumnsMeta] = useState<ColumnMeta[]>([]);
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [filename, setFilename] = useState<string>('sample_messy.csv');
  const [sourceUrl, setSourceUrl] = useState<string>('');

  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'link' | 'upload' | 'paste' | 'samples'>('link');
  const [activeNavSection, setActiveNavSection] = useState<string>('preview');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Run the master cleaning pipeline on current raw data
   */
  const runCleaningPipeline = useCallback(
    (customHeaders?: string[], customRows?: any[][], customOpts?: CleanOptions) => {
      const targetHeaders = customHeaders || headersBefore;
      const targetRows = customRows || rowsBefore;
      const targetOpts = customOpts || options;

      if (!targetHeaders.length || !targetRows.length) {
        setErrorMessage('Load or upload a dataset before running the cleaning pipeline.');
        return;
      }

      setErrorMessage(null);
      try {
        const result = cleanDataset(targetHeaders, targetRows, targetOpts);
        setHeadersAfter(result.headers);
        setRowsAfter(result.rows);
        setReport(result.report);
        setColumnsMeta(result.columnsMeta);
        setHasProcessed(true);
        showToast(`Successfully processed ${result.rows.length} clean rows!`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error occurred while processing dataset.');
      }
    },
    [headersBefore, rowsBefore, options]
  );

  /**
   * Load data from a remote URL link and optionally process immediately
   */
  const handleProcessUrl = async (url: string, autoProcess = true) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSourceUrl(url);

    try {
      const parsed = await fetchDataFromUrl(url);
      setHeadersBefore(parsed.headers);
      setRowsBefore(parsed.rows);
      setFilename(parsed.filename);
      setHasProcessed(false);
      setReport(null);

      const meta = analyzeColumns(parsed.headers, parsed.rows);
      setColumnsMeta(meta);

      if (autoProcess) {
        runCleaningPipeline(parsed.headers, parsed.rows, options);
      } else {
        showToast(`Loaded ${parsed.rowCount} rows from link.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch or parse dataset from link.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load curated sample dataset
   */
  const handleSelectSample = (sampleId: string, autoProcess = true) => {
    const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId) || SAMPLE_DATASETS[0];
    try {
      const parsed = parseCsvString(sample.csvData, sample.filename);
      setHeadersBefore(parsed.headers);
      setRowsBefore(parsed.rows);
      setFilename(parsed.filename);
      setSourceUrl('');
      setHasProcessed(false);
      setReport(null);

      const meta = analyzeColumns(parsed.headers, parsed.rows);
      setColumnsMeta(meta);

      if (autoProcess) {
        runCleaningPipeline(parsed.headers, parsed.rows, options);
      } else {
        showToast(`Loaded sample: ${sample.name}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading sample dataset.');
    }
  };

  /**
   * Handle user file upload
   */
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let parsed;

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        parsed = parseExcelBuffer(buffer, file.name);
      } else {
        const text = await file.text();
        parsed = parseCsvString(text, file.name);
      }

      setHeadersBefore(parsed.headers);
      setRowsBefore(parsed.rows);
      setFilename(parsed.filename);
      setSourceUrl('');
      setHasProcessed(false);
      setReport(null);

      const meta = analyzeColumns(parsed.headers, parsed.rows);
      setColumnsMeta(meta);

      // Auto-process on file upload
      runCleaningPipeline(parsed.headers, parsed.rows, options);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read uploaded file.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle raw text submission
   */
  const handleRawTextSubmit = (text: string, customFilename: string) => {
    try {
      const parsed = parseCsvString(text, customFilename || 'raw_data.csv');
      setHeadersBefore(parsed.headers);
      setRowsBefore(parsed.rows);
      setFilename(parsed.filename);
      setSourceUrl('');
      setHasProcessed(false);
      setReport(null);

      const meta = analyzeColumns(parsed.headers, parsed.rows);
      setColumnsMeta(meta);

      runCleaningPipeline(parsed.headers, parsed.rows, options);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid text format.');
    }
  };

  /**
   * Check URL params on initial load (e.g. ?url=...&process=all or ?sample=...)
   */
  useEffect(() => {
    const params = getInitialUrlParams();

    if (params.url) {
      handleProcessUrl(params.url, params.autoProcess);
    } else if (params.sample) {
      handleSelectSample(params.sample, params.autoProcess);
    } else {
      // Default initial state: load the messy CSV dataset from user prompt
      handleSelectSample('user_messy', true);
    }
  }, []);

  const hasData = headersBefore.length > 0 && rowsBefore.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Navigation complying with Top Bar Contract */}
      <Navbar
        onProcessEverything={() => runCleaningPipeline()}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onExport={() => {
          const el = document.getElementById('export-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        hasData={hasData}
        hasProcessed={hasProcessed}
        activeSection={activeNavSection}
        setActiveSection={setActiveNavSection}
      />

      {/* Hero Banner for Link Processing */}
      <LinkHeroBanner
        onProcessUrl={handleProcessUrl}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        isLoading={isLoading}
        currentUrl={sourceUrl}
        onSelectSample={handleSelectSample}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Quick Processing Feedback Banner */}
        {hasProcessed && report && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Processed successfully in {report.executionTimeMs}ms:</strong> Cleaned{' '}
                <span className="font-mono font-semibold">{report.rowsAfter}</span> of{' '}
                <span className="font-mono">{report.rowsBefore}</span> rows ({report.duplicatesRemoved} dupes removed,{' '}
                {report.emptyRowsRemoved} empty rows dropped, {report.whitespaceTrimmedCount} text cells trimmed).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
              >
                Copy link to process this again &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Data Input Tabs */}
        <section id="input-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Data Sources</h2>
              <p className="text-xs text-slate-500">Provide data via public link, file upload, or direct paste.</p>
            </div>
            {filename && (
              <span className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Active: {filename}
              </span>
            )}
          </div>

          <DataSourceTabs
            onFileUpload={handleFileUpload}
            onRawTextSubmit={handleRawTextSubmit}
            onSelectSample={handleSelectSample}
            onUrlSubmit={(url) => handleProcessUrl(url, true)}
            isLoading={isLoading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </section>

        {/* Section 2: Pipeline Rules & Controls */}
        <section id="pipeline-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Normalization & Cleaning Rules</h2>
              <p className="text-xs text-slate-500">Customizable algorithms for deduplication, whitespace, and headers.</p>
            </div>
          </div>

          <PipelineControls
            options={options}
            setOptions={setOptions}
            onRunPipeline={() => runCleaningPipeline()}
            disabled={!hasData || isLoading}
          />
        </section>

        {/* Section 3: Data Table (Before / After) */}
        <section id="preview-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">3. High-Density Data Grid</h2>
              <p className="text-xs text-slate-500">Inspect raw inputs and validated cleaned outputs.</p>
            </div>
          </div>

          {hasData ? (
            <DataGrid
              headersBefore={headersBefore}
              rowsBefore={rowsBefore}
              headersAfter={headersAfter.length ? headersAfter : headersBefore}
              rowsAfter={rowsAfter.length ? rowsAfter : rowsBefore}
              columnsMeta={columnsMeta}
              hasProcessed={hasProcessed}
              filename={filename}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No data loaded yet. Use a link, upload a file, or select a sample above.
            </div>
          )}
        </section>

        {/* Section 4: Audit Report */}
        {hasProcessed && report && (
          <section id="audit-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">4. Transformation Audit Trail</h2>
                <p className="text-xs text-slate-500">Full audit log of changes made by the automated cleaning pipeline.</p>
              </div>
            </div>

            <AuditReport
              report={report}
              filename={filename}
              sourceUrl={sourceUrl}
              columnsMeta={columnsMeta}
            />
          </section>
        )}

        {/* Section 5: Export & Link Sharing Toolbar */}
        {hasProcessed && (
          <section id="export-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">5. Export & Automation Link</h2>
                <p className="text-xs text-slate-500">Download formatted files or share the automated processing link.</p>
              </div>
            </div>

            <ExportToolbar
              headers={headersAfter}
              rows={rowsAfter}
              filename={filename}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onReset={() => handleSelectSample('user_messy', false)}
            />
          </section>
        )}
      </main>

      {/* Shareable Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentUrl={sourceUrl}
        sampleId={filename.includes('sample_messy') ? 'user_messy' : undefined}
        options={options}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">CleanSlate</span> · Zero-retention client & server data cleaning pipeline.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSelectSample('user_messy', true)}
              className="hover:text-slate-900 transition-colors"
            >
              Reset to Sample
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Processing Link API
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
