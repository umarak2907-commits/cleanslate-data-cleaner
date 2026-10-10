import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CleanOptions } from '../types/data';
import { SAMPLE_DATASETS } from '../data/samples';

export interface ParsedDataResult {
  headers: string[];
  rows: any[][];
  filename: string;
  sourceUrl?: string;
  rowCount: number;
  colCount: number;
}

/**
 * Normalizes URL into direct raw download/export format
 */
export function normalizeDataUrl(inputUrl: string): string {
  let url = inputUrl.trim();

  // 1. Google Sheets -> CSV Export Link
  if (url.includes('docs.google.com/spreadsheets')) {
    const docIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (docIdMatch) {
      const docId = docIdMatch[1];
      const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
    }
  }

  // 2. GitHub Blob -> Raw link
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // 3. Dropbox share links -> dl=1
  if (url.includes('dropbox.com')) {
    if (url.includes('?dl=0')) {
      return url.replace('?dl=0', '?dl=1');
    }
    if (!url.includes('dl=')) {
      return url + (url.includes('?') ? '&dl=1' : '?dl=1');
    }
  }

  return url;
}

/**
 * Parse CSV string into headers and rows
 */
export function parseCsvString(csvText: string, filename = 'dataset.csv', sourceUrl?: string): ParsedDataResult {
  const result = Papa.parse<any[]>(csvText, {
    skipEmptyLines: false,
    header: false,
    dynamicTyping: true
  });

  if (!result.data || result.data.length === 0) {
    throw new Error('The parsed file contains no data rows.');
  }

  const rawHeaders = (result.data[0] || []).map((h, i) => String(h ?? `col_${i + 1}`));
  const rawRows = result.data.slice(1);

  return {
    headers: rawHeaders,
    rows: rawRows,
    filename,
    sourceUrl,
    rowCount: rawRows.length,
    colCount: rawHeaders.length
  };
}

/**
 * Parse ArrayBuffer from Excel XLSX/XLS file
 */
export function parseExcelBuffer(buffer: ArrayBuffer, filename = 'spreadsheet.xlsx', sourceUrl?: string): ParsedDataResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Workbook contains no sheets.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  if (!rows || rows.length === 0) {
    throw new Error('The worksheet contains no data rows.');
  }

  const rawHeaders = (rows[0] || []).map((h, i) => String(h ?? `col_${i + 1}`));
  const rawRows = rows.slice(1);

  return {
    headers: rawHeaders,
    rows: rawRows,
    filename,
    sourceUrl,
    rowCount: rawRows.length,
    colCount: rawHeaders.length
  };
}

/**
 * Fetches data from a remote URL.
 * Attempts server-side proxy first, falls back to direct fetch + CORS proxy.
 */
export async function fetchDataFromUrl(inputUrl: string): Promise<ParsedDataResult> {
  const normalizedUrl = normalizeDataUrl(inputUrl);

  // Extract a clean filename from URL
  let inferredFilename = 'remote_data.csv';
  try {
    const urlObj = new URL(normalizedUrl);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    if (last && (last.endsWith('.csv') || last.endsWith('.xlsx') || last.endsWith('.tsv'))) {
      inferredFilename = last;
    }
  } catch {
    // fallback
  }

  // 1. Try our server-side proxy endpoint first (if server is running)
  try {
    const res = await fetch('/api/fetch-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalizedUrl })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.type === 'binary' && data.base64) {
        const binaryString = atob(data.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return parseExcelBuffer(bytes.buffer, inferredFilename, normalizedUrl);
      } else if (data.data) {
        return parseCsvString(data.data, inferredFilename, normalizedUrl);
      }
    }
  } catch (err) {
    console.warn('Backend proxy fetch failed, falling back to direct fetch', err);
  }

  // 2. Direct browser fetch
  try {
    const directRes = await fetch(normalizedUrl, {
      headers: { 'Accept': 'text/csv, text/plain, */*' }
    });

    if (directRes.ok) {
      const contentType = directRes.headers.get('content-type') || '';
      if (contentType.includes('spreadsheet') || contentType.includes('excel') || normalizedUrl.endsWith('.xlsx')) {
        const buf = await directRes.arrayBuffer();
        return parseExcelBuffer(buf, inferredFilename, normalizedUrl);
      }
      const text = await directRes.text();
      return parseCsvString(text, inferredFilename, normalizedUrl);
    }
  } catch (err) {
    console.warn('Direct fetch failed, falling back to public CORS proxy', err);
  }

  // 3. Fallback through allorigins public CORS proxy
  try {
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
    const proxyRes = await fetch(corsProxyUrl);
    if (!proxyRes.ok) {
      throw new Error(`CORS proxy returned status ${proxyRes.status}`);
    }
    const text = await proxyRes.text();
    return parseCsvString(text, inferredFilename, normalizedUrl);
  } catch (finalErr: any) {
    throw new Error(`Failed to fetch link: ${finalErr.message || 'Network blocked or invalid URL'}`);
  }
}

/**
 * Generate a shareable URL to process data with one click
 */
export function generateProcessLink(params: {
  url?: string;
  sampleId?: string;
  options?: Partial<CleanOptions>;
  autoProcess?: boolean;
}): string {
  const currentOrigin = window.location.origin;
  const urlObj = new URL(window.location.pathname, currentOrigin);

  if (params.url) {
    urlObj.searchParams.set('url', params.url);
  }
  if (params.sampleId) {
    urlObj.searchParams.set('sample', params.sampleId);
  }
  if (params.autoProcess !== false) {
    urlObj.searchParams.set('process', 'all');
  }

  if (params.options?.missingStrategy && params.options.missingStrategy !== 'keep') {
    urlObj.searchParams.set('missing', params.options.missingStrategy);
  }

  return urlObj.toString();
}

/**
 * Generate a ready-to-run cURL command for API or terminal
 */
export function generateCurlCommand(url: string, missingStrategy: string = 'keep'): string {
  const origin = window.location.origin;
  return `curl -X POST "${origin}/api/fetch-link" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "${url}", "missingStrategy": "${missingStrategy}"}'`;
}

/**
 * Parse initial URL parameters on page load
 */
export function getInitialUrlParams(): {
  url: string | null;
  sample: string | null;
  autoProcess: boolean;
  missingStrategy: string | null;
} {
  if (typeof window === 'undefined') {
    return { url: null, sample: null, autoProcess: false, missingStrategy: null };
  }

  const params = new URLSearchParams(window.location.search);
  const url = params.get('url');
  const sample = params.get('sample');
  const process = params.get('process');
  const missingStrategy = params.get('missing');

  return {
    url: url ? decodeURIComponent(url) : null,
    sample: sample || null,
    autoProcess: process === 'all' || process === 'true' || process === '1',
    missingStrategy: missingStrategy || null
  };
}

/**
 * Export cleaned dataset to CSV and trigger browser download
 */
export function downloadCsv(headers: string[], rows: any[][], filename: string = 'cleaned_data.csv') {
  const fullData = [headers, ...rows];
  const csv = Papa.unparse(fullData);
  // Add UTF-8 BOM so Microsoft Excel handles special characters cleanly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export cleaned dataset to Excel (.xlsx) and trigger download
 */
export function downloadExcel(headers: string[], rows: any[][], filename: string = 'cleaned_data.xlsx') {
  const fullData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
