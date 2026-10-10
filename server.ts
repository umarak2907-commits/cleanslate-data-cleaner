import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_MESSY_CSV = `Full Name, Age ,Email, City, City,Unnamed: 0
" Aisha Khan ",20,aisha@example.com,Warangal,Warangal,0
Rahul,21,,Hyderabad,Hyderabad,1
" Aisha Khan ",20,aisha@example.com,Warangal,Warangal,0
Meera,,meera@example.com, Warangal ,Warangal,3
,, , , ,4`;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'CleanSlate Smart Data Cleaner & Link Processor' });
  });

  // Provide sample messy CSV endpoint
  app.get('/api/sample-messy', (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_messy.csv"');
    res.send(SAMPLE_MESSY_CSV);
  });

  // Dedicated test endpoint with obvious duplicate rows for testing
  const DUPLICATE_TEST_CSV = `Employee ID, Employee Name , Department , Department, Location , Salary , Unnamed: 0
EMP-101,  Sarah Connor  , Engineering , Engineering , Los Angeles , 95000 , 0
EMP-102, John Doe , Marketing , Marketing , Chicago , 72000 , 1
EMP-101,  Sarah Connor  , Engineering , Engineering , Los Angeles , 95000 , 0
EMP-103,  Alex Rivera  , Operations , Operations , New York , 81000 , 3
EMP-101,  Sarah Connor  , Engineering , Engineering , Los Angeles , 95000 , 0
EMP-102, John Doe , Marketing , Marketing , Chicago , 72000 , 1
EMP-104, Priya Patel , Engineering , Engineering , San Francisco , 105000 , 6
EMP-103,  Alex Rivera  , Operations , Operations , New York , 81000 , 3
, , , , , , 8
EMP-105, Marcus Aurelius , Executive , Executive , Rome , 140000 , 9`;

  app.get('/api/test-duplicates', (req, res) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(DUPLICATE_TEST_CSV);
  });

  // Proxy endpoint to fetch remote data links and bypass CORS
  app.post('/api/fetch-link', async (req, res) => {
    try {
      let { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      url = url.trim();

      // Convert Google Sheets URL to CSV export format
      if (url.includes('docs.google.com/spreadsheets')) {
        const docIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (docIdMatch) {
          const docId = docIdMatch[1];
          const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
          const gid = gidMatch ? gidMatch[1] : '0';
          url = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
        }
      }

      // Convert GitHub blob URL to raw URL
      if (url.includes('github.com') && url.includes('/blob/')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      // Convert Dropbox share links to direct download
      if (url.includes('dropbox.com')) {
        url = url.replace(/[?&]dl=0/, '?dl=1');
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CleanSlate-DataProcessor/1.0',
          'Accept': 'text/csv, application/json, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*'
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Failed to fetch remote link: ${response.status} ${response.statusText}`
        });
      }

      const contentType = response.headers.get('content-type') || '';
      
      // If binary (like xlsx)
      if (contentType.includes('spreadsheet') || contentType.includes('excel') || url.endsWith('.xlsx') || url.endsWith('.xls')) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.json({
          ok: true,
          type: 'binary',
          contentType,
          base64: buffer.toString('base64'),
          url
        });
      }

      const text = await response.text();
      return res.json({
        ok: true,
        type: 'text',
        contentType,
        data: text,
        url
      });
    } catch (err: any) {
      console.error('Fetch link error:', err);
      return res.status(500).json({
        error: `Could not fetch data from link: ${err.message || 'Unknown network error'}`
      });
    }
  });

  // Setup Vite in middleware mode for dev or serve dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CleanSlate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
