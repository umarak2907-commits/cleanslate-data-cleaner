# CleanSlate — Smart Data Cleaner & Link Processor

A high-performance, account-free web application and API to clean, deduplicate, normalize, and process CSV and Excel datasets via links or files in one click.

## 🚀 Live App Links

- **Shared App URL:** [https://ais-pre-qfgkr27xveszxkelucxqhl-534232776939.asia-southeast1.run.app](https://ais-pre-qfgkr27xveszxkelucxqhl-534232776939.asia-southeast1.run.app)
- **Development App URL:** [https://ais-dev-qfgkr27xveszxkelucxqhl-534232776939.asia-southeast1.run.app](https://ais-dev-qfgkr27xveszxkelucxqhl-534232776939.asia-southeast1.run.app)

---

## ⚡ Features

- **Link Processor**: Paste any public data link (Google Sheets, raw CSV, GitHub raw URL, Dropbox, or API endpoints). View/edit links are automatically converted into direct CSV export streams.
- **Deep Link Automation**: Share links like `?url=<URL>&process=all` that immediately fetch, clean, and display the processed dataset.
- **Header Normalization & Collision Resolution**: Converts headers to clean `snake_case`, removes invalid symbols, and indexes duplicate headers (e.g. `City, City` &rarr; `city`, `city_2`).
- **Whitespace & Null Stripping**: Trims leading and trailing spaces across all text cells and standardizes empty values.
- **Duplicate Row Elimination**: Detects and purges duplicate rows while preserving the first verified record.
- **Index Column Removal**: Identifies and drops unwanted artifact index columns (`Unnamed: 0`, `index`, `level_0`).
- **Empty Row & Column Pruning**: Strips fully blank rows and columns.
- **Missing Value Strategies**:
  - Smart Statistical Imputation (Numeric Median / Categorical Mode)
  - Fill with Blank
  - Drop Incomplete Rows
  - Keep Original Values
- **High-Density Data Grid**: Clean tabular figures (`tabular-nums`), live search filter, column type inference badges, and Before vs After toggles.
- **Export Options**: Download as Cleaned CSV (UTF-8 BOM for Excel compatibility) or Excel (.xlsx).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Data Engine**: PapaParse, SheetJS (XLSX), Custom statistical cleaner
- **Backend / Proxy**: Express, Node.js 22, Vite

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd cleanslate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000)

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Built-in Test Endpoints

- `GET /api/sample-messy` — Returns sample CSV with duplicate rows and columns.
- `GET /api/test-duplicates` — Returns sample CSV with 4 intentional duplicate employee records.
- `POST /api/fetch-link` — Server proxy endpoint to bypass CORS when fetching external data links.
