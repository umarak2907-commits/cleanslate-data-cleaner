import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { ColumnMeta } from '../types/data';

interface DataGridProps {
  headersBefore: string[];
  rowsBefore: any[][];
  headersAfter: string[];
  rowsAfter: any[][];
  columnsMeta: ColumnMeta[];
  hasProcessed: boolean;
  filename: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  headersBefore,
  rowsBefore,
  headersAfter,
  rowsAfter,
  columnsMeta,
  hasProcessed,
  filename
}) => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Active dataset according to view mode
  const activeHeaders = (!hasProcessed || viewMode === 'before') ? headersBefore : headersAfter;
  const activeRows = (!hasProcessed || viewMode === 'before') ? rowsBefore : rowsAfter;

  // Filtered rows by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeRows;
    const q = searchQuery.toLowerCase();
    return activeRows.filter(row => {
      return row.some(cell => {
        if (cell === null || cell === undefined) return false;
        return String(cell).toLowerCase().includes(q);
      });
    });
  }, [activeRows, searchQuery]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const isNumericColumn = (colIdx: number) => {
    const meta = columnsMeta[colIdx];
    return meta?.inferredType === 'numeric';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {/* Segmented View Mode Toggles */}
          {hasProcessed ? (
            <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-lg">
              <button
                type="button"
                onClick={() => { setViewMode('after'); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'after'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cleaned Output ({rowsAfter.length})
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('before'); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'before'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original Raw ({rowsBefore.length})
              </button>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-700">
              Raw Data Preview ({rowsBefore.length} rows, {headersBefore.length} columns)
            </div>
          )}

          <span className="hidden md:inline-block text-xs font-mono text-slate-400">
            {filename}
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search table rows..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* High-density Tabular Grid */}
      <div className="overflow-x-auto flex-1 max-h-[600px] relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-mono text-[11px] text-slate-400 w-12 text-center border-r border-slate-200">
                #
              </th>
              {activeHeaders.map((header, colIdx) => (
                <th
                  key={colIdx}
                  className={`py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200 last:border-r-0 whitespace-nowrap ${
                    isNumericColumn(colIdx) ? 'text-right' : 'text-left'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px]">{header}</span>
                    {hasProcessed && columnsMeta[colIdx] && (
                      <span className="text-[10px] font-normal text-slate-400 bg-white px-1 py-0.5 rounded border border-slate-200">
                        {columnsMeta[colIdx].inferredType}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={activeHeaders.length + 1}
                  className="py-12 text-center text-xs text-slate-500"
                >
                  No matching rows found. Try adjusting your search query.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rIdx) => {
                const globalIndex = startIndex + rIdx + 1;
                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-blue-50/40 transition-colors h-9"
                  >
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-400 text-center border-r border-slate-100 select-none bg-slate-50/30">
                      {globalIndex}
                    </td>
                    {activeHeaders.map((_, cIdx) => {
                      const cellValue = row[cIdx];
                      const isEmpty = cellValue === null || cellValue === undefined || cellValue === '';
                      const isNum = typeof cellValue === 'number' || (isNumericColumn(cIdx) && !isEmpty);

                      return (
                        <td
                          key={cIdx}
                          className={`py-2 px-3 border-r border-slate-100 last:border-r-0 truncate max-w-xs ${
                            isNum ? 'text-right font-mono tabular-nums' : 'text-left'
                          }`}
                        >
                          {isEmpty ? (
                            <span className="text-slate-300 italic text-[11px] select-none font-sans">
                              (empty)
                            </span>
                          ) : (
                            <span className="text-slate-800">
                              {String(cellValue)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-semibold text-slate-900 font-mono">
            {totalRows > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalRows)}
          </span>
          <span>of</span>
          <span className="font-semibold text-slate-900 font-mono">{totalRows}</span>
          <span>rows</span>

          <span className="text-slate-300 mx-1">|</span>

          <label className="flex items-center gap-1.5 text-slate-500">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
