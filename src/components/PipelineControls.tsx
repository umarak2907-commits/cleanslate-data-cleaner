import React from 'react';
import { CleanOptions, MissingStrategy } from '../types/data';
import { Sliders, Sparkles, Check } from 'lucide-react';

interface PipelineControlsProps {
  options: CleanOptions;
  setOptions: React.Dispatch<React.SetStateAction<CleanOptions>>;
  onRunPipeline: () => void;
  disabled: boolean;
}

export const PipelineControls: React.FC<PipelineControlsProps> = ({
  options,
  setOptions,
  onRunPipeline,
  disabled
}) => {
  const updateOption = <K extends keyof CleanOptions>(key: K, val: CleanOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: val }));
  };

  const applyPreset = (preset: 'standard' | 'strict' | 'minimal') => {
    if (preset === 'standard') {
      setOptions({
        normalizeHeaders: true,
        trimWhitespace: true,
        removeEmptyRows: true,
        removeEmptyCols: true,
        removeDuplicates: true,
        removeIndexColumns: true,
        missingStrategy: 'keep',
        autoDetectTypes: true,
        outputFormat: 'csv'
      });
    } else if (preset === 'strict') {
      setOptions({
        normalizeHeaders: true,
        trimWhitespace: true,
        removeEmptyRows: true,
        removeEmptyCols: true,
        removeDuplicates: true,
        removeIndexColumns: true,
        missingStrategy: 'drop_rows',
        autoDetectTypes: true,
        outputFormat: 'csv'
      });
    } else if (preset === 'minimal') {
      setOptions({
        normalizeHeaders: true,
        trimWhitespace: true,
        removeEmptyRows: true,
        removeEmptyCols: false,
        removeDuplicates: false,
        removeIndexColumns: false,
        missingStrategy: 'keep',
        autoDetectTypes: false,
        outputFormat: 'csv'
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Automated Pipeline Rules</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure how CleanSlate cleans and standardizes your dataset when processing.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <span className="text-[11px] font-medium text-slate-500 px-2">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white shadow-xs rounded-md transition-colors"
          >
            Recommended
          </button>
          <button
            type="button"
            onClick={() => applyPreset('strict')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-md transition-colors"
          >
            Drop Incomplete
          </button>
          <button
            type="button"
            onClick={() => applyPreset('minimal')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-md transition-colors"
          >
            Minimal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5">
        {/* Rule 1: Header Normalization */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.normalizeHeaders}
            onChange={(e) => updateOption('normalizeHeaders', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Normalize Column Headers
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Converts to clean snake_case, strips symbols, and indexes duplicate headers (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">city</code> &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">city_2</code>).
            </p>
          </div>
        </label>

        {/* Rule 2: Trim Whitespace */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.trimWhitespace}
            onChange={(e) => updateOption('trimWhitespace', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Trim Text Whitespace
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Removes accidental leading and trailing spaces from all text cells. Converts blank strings to nulls.
            </p>
          </div>
        </label>

        {/* Rule 3: Deduplicate Rows */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.removeDuplicates}
            onChange={(e) => updateOption('removeDuplicates', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Remove Duplicate Rows
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Detects identical row values across all columns and keeps only the first verified record.
            </p>
          </div>
        </label>

        {/* Rule 4: Remove Empty Rows */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.removeEmptyRows}
            onChange={(e) => updateOption('removeEmptyRows', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Remove Fully Empty Rows
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Filters out blank rows where every cell contains empty values or spaces.
            </p>
          </div>
        </label>

        {/* Rule 5: Remove Empty Columns */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.removeEmptyCols}
            onChange={(e) => updateOption('removeEmptyCols', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Remove Empty Columns
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Prunes columns that contain 100% missing values across all rows.
            </p>
          </div>
        </label>

        {/* Rule 6: Drop Index Columns */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={options.removeIndexColumns}
            onChange={(e) => updateOption('removeIndexColumns', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Drop Accidental Index Columns
            </span>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              Detects and removes pandas/spreadsheet artifact columns like <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">Unnamed: 0</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">index</code>.
            </p>
          </div>
        </label>
      </div>

      {/* Missing Value Strategy Selection */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Missing Value Strategy
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose how empty or missing cells should be resolved.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'keep', label: 'Keep as Empty', desc: 'Preserve null values' },
              { id: 'median_mode', label: 'Smart Impute', desc: 'Median numeric / Mode text' },
              { id: 'fill_blank', label: 'Fill with Blank', desc: 'Standardize to empty string' },
              { id: 'drop_rows', label: 'Drop Incomplete', desc: 'Delete rows with nulls' }
            ].map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => updateOption('missingStrategy', strategy.id as MissingStrategy)}
                className={`p-2.5 text-left rounded-lg border transition-all ${
                  options.missingStrategy === strategy.id
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{strategy.label}</span>
                  {options.missingStrategy === strategy.id && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{strategy.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Changes will apply automatically when processing runs.
        </span>
        <button
          onClick={onRunPipeline}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply Pipeline Now</span>
        </button>
      </div>
    </div>
  );
};
