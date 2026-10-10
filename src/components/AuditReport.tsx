import React from 'react';
import { CleaningReport, ColumnMeta } from '../types/data';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Table2, Layers, Cpu } from 'lucide-react';

interface AuditReportProps {
  report: CleaningReport;
  filename: string;
  sourceUrl?: string;
  columnsMeta: ColumnMeta[];
}

export const AuditReport: React.FC<AuditReportProps> = ({
  report,
  filename,
  sourceUrl,
  columnsMeta
}) => {
  const rowDiff = report.rowsBefore - report.rowsAfter;
  const colDiff = report.colsBefore - report.colsAfter;

  return (
    <div className="space-y-6">
      {/* 4-Stat Strip with Tabular Figures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Rows */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Rows</span>
            <Table2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono" data-tabular="true">
              {report.rowsAfter.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">
              {report.rowsBefore.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {rowDiff > 0 ? (
              <span className="text-amber-700 font-medium font-mono">-{rowDiff} rows eliminated</span>
            ) : (
              <span className="text-emerald-700 font-medium">100% rows preserved</span>
            )}
          </p>
        </div>

        {/* Metric 2: Columns */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Columns</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono" data-tabular="true">
              {report.colsAfter}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">
              {report.colsBefore}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {report.renamedHeaders.length > 0 ? (
              <span className="text-blue-700 font-medium">{report.renamedHeaders.length} headers normalized</span>
            ) : (
              <span>Headers valid</span>
            )}
          </p>
        </div>

        {/* Metric 3: Duplicates & Index */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Duplicates & Index</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono" data-tabular="true">
              {report.duplicatesRemoved + report.indexColsRemoved.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">issues resolved</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-mono">{report.duplicatesRemoved}</span> dupes dropped ·{' '}
            <span className="font-mono">{report.indexColsRemoved.length}</span> index cols
          </p>
        </div>

        {/* Metric 4: Execution Speed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Execution Latency</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono" data-tabular="true">
              {report.executionTimeMs}
            </span>
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {report.whitespaceTrimmedCount > 0
              ? `${report.whitespaceTrimmedCount} cells trimmed`
              : 'Zero latency pass'}
          </p>
        </div>
      </div>

      {/* Audit Changelog and Header Renames */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronological Steps */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Pipeline Audit Trail</span>
            <span className="text-xs text-slate-500 font-normal">{report.steps.length} operations</span>
          </h4>

          {report.steps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No modifications were needed. The dataset was already in compliant format.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {report.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{step.label}</span>
                      {step.count > 0 && (
                        <span className="font-mono text-slate-500 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {step.count}
                        </span>
                      )}
                    </div>
                    {step.detail && <p className="text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Header Transformations & Inferred Types */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Column Schema & Inferred Types</span>
            <span className="text-xs text-slate-500 font-normal">{columnsMeta.length} active columns</span>
          </h4>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-2">Original &rarr; Cleaned Header</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Missing</th>
                  <th className="pb-2 text-right">Unique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {columnsMeta.map((col, idx) => {
                  const rename = report.renamedHeaders.find((r) => r.cleaned === col.name);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 pr-2 text-slate-900 font-medium">
                        {rename ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-400 line-through text-[10px]">{rename.original}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                            <span className="text-blue-700 font-semibold">{col.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-800">{col.name}</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-slate-600">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {col.inferredType}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-right text-slate-600" data-tabular="true">
                        {col.missingCount > 0 ? (
                          <span className="text-amber-700">{col.missingCount} ({col.missingPercent}%)</span>
                        ) : (
                          <span className="text-emerald-700">0%</span>
                        )}
                      </td>
                      <td className="py-2 text-right text-slate-600" data-tabular="true">
                        {col.uniqueCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
