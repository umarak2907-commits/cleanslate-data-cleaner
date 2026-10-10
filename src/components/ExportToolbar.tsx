import React, { useState } from 'react';
import { Download, FileSpreadsheet, Copy, Check, Share2, RotateCcw } from 'lucide-react';
import { downloadCsv, downloadExcel } from '../utils/linkProcessor';
import Papa from 'papaparse';

interface ExportToolbarProps {
  headers: string[];
  rows: any[][];
  filename: string;
  onOpenShareModal: () => void;
  onReset: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  headers,
  rows,
  filename,
  onOpenShareModal,
  onReset
}) => {
  const [copiedType, setCopiedType] = useState<'csv' | 'json' | null>(null);

  const handleDownloadCsv = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    downloadCsv(headers, rows, `${baseName}_cleaned.csv`);
  };

  const handleDownloadExcel = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    downloadExcel(headers, rows, `${baseName}_cleaned.xlsx`);
  };

  const handleCopyCsv = () => {
    const fullData = [headers, ...rows];
    const csvString = Papa.unparse(fullData);
    navigator.clipboard.writeText(csvString);
    setCopiedType('csv');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJson = () => {
    const objects = rows.map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
    navigator.clipboard.writeText(JSON.stringify(objects, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">Export Processed Data:</span>
        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download CSV</span>
        </button>
        <button
          onClick={handleDownloadExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Download Excel (.xlsx)</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          {copiedType === 'csv' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">CSV Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy CSV</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyJson}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          {copiedType === 'json' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">JSON Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy JSON</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenShareModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Process Link</span>
        </button>

        <button
          onClick={onReset}
          title="Reset and clean another dataset"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
