import { CleanOptions, ColumnMeta, CleaningReport, HeaderRename, AuditStep } from '../types/data';

/**
 * Normalizes headers and ensures collision uniqueness.
 * Replicates Python: make_unique_headers
 */
export function makeUniqueHeaders(columns: string[]): { cleaned: string[]; renames: HeaderRename[] } {
  const result: string[] = [];
  const seen: Record<string, number> = {};
  const renames: HeaderRename[] = [];

  columns.forEach((col, index) => {
    const raw = String(col ?? '').trim();
    let name = raw.toLowerCase();
    // Replace whitespace, hyphens, slashes with underscore
    name = name.replace(/[\s\-/]+/g, '_');
    // Remove non-word characters
    name = name.replace(/[^\w]/g, '');
    // Deduplicate underscores and trim
    name = name.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (!name) {
      name = `column_${index + 1}`;
    }

    const count = (seen[name] || 0) + 1;
    seen[name] = count;
    const finalName = count === 1 ? name : `${name}_${count}`;
    result.push(finalName);

    if (raw !== finalName) {
      renames.push({ original: raw, cleaned: finalName });
    }
  });

  return { cleaned: result, renames };
}

/**
 * Checks if a value is considered empty/null
 */
export function isEmptyValue(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (typeof val === 'number' && isNaN(val)) return true;
  return false;
}

/**
 * Check if a string looks like an email
 */
function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/**
 * Check if a string looks like a standard ISO or date string
 */
function isDate(val: string): boolean {
  if (!val || val.length < 8) return false;
  const parsed = Date.parse(val);
  return !isNaN(parsed) && !/^\d+$/.test(val);
}

/**
 * Infer column data types and statistics
 */
export function analyzeColumns(headers: string[], rows: any[][]): ColumnMeta[] {
  const rowCount = rows.length;

  return headers.map((colName, colIdx) => {
    let missingCount = 0;
    const values: any[] = [];
    let numericCount = 0;
    let emailCount = 0;
    let dateCount = 0;
    let boolCount = 0;
    let totalNonEmpty = 0;

    for (let r = 0; r < rowCount; r++) {
      const val = rows[r]?.[colIdx];
      if (isEmptyValue(val)) {
        missingCount++;
      } else {
        totalNonEmpty++;
        values.push(val);
        const strVal = String(val).trim();

        if (typeof val === 'number' || (!isNaN(Number(strVal)) && strVal !== '')) {
          numericCount++;
        }
        if (typeof val === 'boolean' || ['true', 'false', 'yes', 'no'].includes(strVal.toLowerCase())) {
          boolCount++;
        }
        if (isEmail(strVal)) {
          emailCount++;
        }
        if (isDate(strVal)) {
          dateCount++;
        }
      }
    }

    let inferredType: ColumnMeta['inferredType'] = 'text';
    if (totalNonEmpty > 0) {
      if (numericCount / totalNonEmpty > 0.8) {
        inferredType = 'numeric';
      } else if (boolCount / totalNonEmpty > 0.8) {
        inferredType = 'boolean';
      } else if (emailCount / totalNonEmpty > 0.7) {
        inferredType = 'email';
      } else if (dateCount / totalNonEmpty > 0.7) {
        inferredType = 'date';
      }
    }

    const uniqueSet = new Set(values.map(v => String(v)));

    return {
      name: colName,
      originalName: colName,
      inferredType,
      missingCount,
      missingPercent: rowCount > 0 ? Math.round((missingCount / rowCount) * 1000) / 10 : 0,
      uniqueCount: uniqueSet.size,
      sampleValues: values.slice(0, 5)
    };
  });
}

/**
 * The Master CleanSlate Pipeline
 * Executes all data cleaning steps systematically with full audit tracking.
 */
export function cleanDataset(
  rawHeaders: string[],
  rawRows: any[][],
  options: CleanOptions
): {
  headers: string[];
  rows: any[][];
  report: CleaningReport;
  columnsMeta: ColumnMeta[];
} {
  const startTime = performance.now();
  const rowsBefore = rawRows.length;
  const colsBefore = rawHeaders.length;

  const steps: AuditStep[] = [];
  let currentHeaders = [...rawHeaders];
  let currentRows = rawRows.map(row => [...row]);

  // 1. Column Header Normalization
  let renamedHeaders: HeaderRename[] = [];
  if (options.normalizeHeaders) {
    const { cleaned, renames } = makeUniqueHeaders(currentHeaders);
    currentHeaders = cleaned;
    renamedHeaders = renames;
    if (renames.length > 0) {
      steps.push({
        label: 'Normalized column names & resolved collisions',
        count: renames.length,
        detail: `Renamed ${renames.length} headers to snake_case and indexed duplicates.`
      });
    }
  }

  // 2. Trim whitespace in text cells & nullify empty strings
  let whitespaceTrimmedCount = 0;
  if (options.trimWhitespace) {
    currentRows = currentRows.map(row => {
      return row.map(cell => {
        if (typeof cell === 'string') {
          const trimmed = cell.trim();
          if (trimmed !== cell) {
            whitespaceTrimmedCount++;
          }
          return trimmed === '' ? null : trimmed;
        }
        return cell;
      });
    });

    if (whitespaceTrimmedCount > 0) {
      steps.push({
        label: 'Trimmed text whitespace & converted empty cells',
        count: whitespaceTrimmedCount,
        detail: `Stripped leading/trailing spaces across ${whitespaceTrimmedCount} cells.`
      });
    }
  }

  // 3. Remove index columns (e.g. Unnamed: 0, index, level_0)
  const indexColsRemoved: string[] = [];
  if (options.removeIndexColumns) {
    const keptIndices: number[] = [];
    currentHeaders.forEach((col, idx) => {
      const lower = String(col).trim().toLowerCase();
      const isIndex = /^unnamed(?::\s*\d+)?$/.test(lower) || ['index', 'level_0', 'row_id', 'unnamed_0'].includes(lower);
      if (isIndex) {
        indexColsRemoved.push(col);
      } else {
        keptIndices.push(idx);
      }
    });

    if (indexColsRemoved.length > 0 && keptIndices.length > 0) {
      currentHeaders = keptIndices.map(i => currentHeaders[i]);
      currentRows = currentRows.map(row => keptIndices.map(i => row[i]));
      steps.push({
        label: 'Removed accidental index/unnamed columns',
        count: indexColsRemoved.length,
        detail: `Dropped columns: ${indexColsRemoved.join(', ')}`
      });
    }
  }

  // 4. Remove fully empty rows & fully empty columns
  let emptyRowsRemoved = 0;
  let emptyColsRemoved = 0;
  if (options.removeEmptyRows) {
    const prevRowCount = currentRows.length;
    currentRows = currentRows.filter(row => {
      const allEmpty = row.every(cell => isEmptyValue(cell));
      return !allEmpty;
    });
    emptyRowsRemoved = prevRowCount - currentRows.length;
    if (emptyRowsRemoved > 0) {
      steps.push({
        label: 'Removed fully empty rows',
        count: emptyRowsRemoved,
        detail: `Purged ${emptyRowsRemoved} rows containing zero data values.`
      });
    }
  }

  if (options.removeEmptyCols && currentHeaders.length > 0) {
    const nonEmptyColIndices: number[] = [];
    currentHeaders.forEach((_, colIdx) => {
      const hasValue = currentRows.some(row => !isEmptyValue(row[colIdx]));
      if (hasValue) {
        nonEmptyColIndices.push(colIdx);
      } else {
        emptyColsRemoved++;
      }
    });

    if (emptyColsRemoved > 0 && nonEmptyColIndices.length > 0) {
      currentHeaders = nonEmptyColIndices.map(i => currentHeaders[i]);
      currentRows = currentRows.map(row => nonEmptyColIndices.map(i => row[i]));
      steps.push({
        label: 'Removed fully empty columns',
        count: emptyColsRemoved,
        detail: `Dropped ${emptyColsRemoved} columns with 100% missing values.`
      });
    }
  }

  // 5. Remove exact duplicate rows
  let duplicatesRemoved = 0;
  if (options.removeDuplicates) {
    const seenRows = new Set<string>();
    const uniqueRows: any[][] = [];

    currentRows.forEach(row => {
      // Serialize row using JSON
      const serialized = JSON.stringify(row);
      if (!seenRows.has(serialized)) {
        seenRows.add(serialized);
        uniqueRows.push(row);
      } else {
        duplicatesRemoved++;
      }
    });

    currentRows = uniqueRows;
    if (duplicatesRemoved > 0) {
      steps.push({
        label: 'Removed duplicate rows',
        count: duplicatesRemoved,
        detail: `Eliminated ${duplicatesRemoved} redundant records, keeping first occurrences.`
      });
    }
  }

  // 6. Missing Value Strategy
  let missingValuesHandled = 0;
  if (options.missingStrategy === 'drop_rows') {
    const beforeDrop = currentRows.length;
    currentRows = currentRows.filter(row => !row.some(cell => isEmptyValue(cell)));
    missingValuesHandled = beforeDrop - currentRows.length;
    if (missingValuesHandled > 0) {
      steps.push({
        label: 'Dropped rows containing missing values',
        count: missingValuesHandled,
        detail: `Removed ${missingValuesHandled} incomplete rows.`
      });
    }
  } else if (options.missingStrategy === 'fill_blank') {
    currentRows = currentRows.map(row => {
      return row.map(cell => {
        if (isEmptyValue(cell)) {
          missingValuesHandled++;
          return '';
        }
        return cell;
      });
    });
    if (missingValuesHandled > 0) {
      steps.push({
        label: 'Filled missing values with blank strings',
        count: missingValuesHandled,
        detail: `Standardized ${missingValuesHandled} null cells.`
      });
    }
  } else if (options.missingStrategy === 'median_mode') {
    // Calculate medians for numeric and modes for text
    const colImputes: (number | string | null)[] = currentHeaders.map((_, colIdx) => {
      const nonNulls = currentRows
        .map(r => r[colIdx])
        .filter(v => !isEmptyValue(v));

      if (nonNulls.length === 0) return null;

      const isNumeric = nonNulls.every(v => typeof v === 'number' || !isNaN(Number(v)));
      if (isNumeric) {
        const nums = nonNulls.map(v => Number(v)).sort((a, b) => a - b);
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 !== 0 ? nums[mid] : Math.round(((nums[mid - 1] + nums[mid]) / 2) * 100) / 100;
      } else {
        // Mode (most frequent)
        const counts: Record<string, number> = {};
        let topVal = nonNulls[0];
        let maxCount = 0;
        nonNulls.forEach(val => {
          const str = String(val);
          counts[str] = (counts[str] || 0) + 1;
          if (counts[str] > maxCount) {
            maxCount = counts[str];
            topVal = val;
          }
        });
        return topVal;
      }
    });

    currentRows = currentRows.map(row => {
      return row.map((cell, colIdx) => {
        if (isEmptyValue(cell) && colImputes[colIdx] !== null) {
          missingValuesHandled++;
          return colImputes[colIdx];
        }
        return cell;
      });
    });

    if (missingValuesHandled > 0) {
      steps.push({
        label: 'Smart Imputation (Numeric Median / Text Mode)',
        count: missingValuesHandled,
        detail: `Imputed ${missingValuesHandled} empty cells using distribution statistics.`
      });
    }
  }

  const endTime = performance.now();
  const executionTimeMs = Math.max(1, Math.round(endTime - startTime));

  const report: CleaningReport = {
    rowsBefore,
    rowsAfter: currentRows.length,
    colsBefore,
    colsAfter: currentHeaders.length,
    duplicatesRemoved,
    emptyRowsRemoved,
    emptyColsRemoved,
    whitespaceTrimmedCount,
    indexColsRemoved,
    renamedHeaders,
    missingValuesHandled,
    executionTimeMs,
    steps
  };

  const columnsMeta = analyzeColumns(currentHeaders, currentRows);

  return {
    headers: currentHeaders,
    rows: currentRows,
    report,
    columnsMeta
  };
}

/**
 * Default preset options for CleanSlate
 */
export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  normalizeHeaders: true,
  trimWhitespace: true,
  removeEmptyRows: true,
  removeEmptyCols: true,
  removeDuplicates: true,
  removeIndexColumns: true,
  missingStrategy: 'keep',
  autoDetectTypes: true,
  outputFormat: 'csv'
};
