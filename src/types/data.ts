export type MissingStrategy = 'keep' | 'fill_blank' | 'drop_rows' | 'median_mode';

export interface CleanOptions {
  normalizeHeaders: boolean;
  trimWhitespace: boolean;
  removeEmptyRows: boolean;
  removeEmptyCols: boolean;
  removeDuplicates: boolean;
  removeIndexColumns: boolean;
  missingStrategy: MissingStrategy;
  autoDetectTypes: boolean;
  outputFormat: 'csv' | 'xlsx';
}

export interface ColumnMeta {
  name: string;
  originalName: string;
  inferredType: 'text' | 'numeric' | 'date' | 'email' | 'boolean';
  missingCount: number;
  missingPercent: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean | null)[];
}

export interface HeaderRename {
  original: string;
  cleaned: string;
}

export interface AuditStep {
  label: string;
  count: number;
  detail?: string;
}

export interface CleaningReport {
  rowsBefore: number;
  rowsAfter: number;
  colsBefore: number;
  colsAfter: number;
  duplicatesRemoved: number;
  emptyRowsRemoved: number;
  emptyColsRemoved: number;
  whitespaceTrimmedCount: number;
  indexColsRemoved: string[];
  renamedHeaders: HeaderRename[];
  missingValuesHandled: number;
  executionTimeMs: number;
  steps: AuditStep[];
}

export interface DatasetState {
  filename: string;
  sourceUrl?: string;
  headersBefore: string[];
  rowsBefore: (string | number | boolean | null)[][];
  headersAfter: string[];
  rowsAfter: (string | number | boolean | null)[][];
  columnsMeta: ColumnMeta[];
  report: CleaningReport | null;
  isProcessing: boolean;
  hasProcessed: boolean;
}
