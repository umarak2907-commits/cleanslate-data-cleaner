export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  filename: string;
  csvData: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'user_messy',
    name: 'Sample Messy CSV (User Dataset)',
    description: 'Contains whitespace padding, duplicate names, missing email, duplicate City column, and Unnamed: 0 index column.',
    filename: 'sample_messy.csv',
    csvData: `Full Name, Age ,Email, City, City,Unnamed: 0
" Aisha Khan ",20,aisha@example.com,Warangal,Warangal,0
Rahul,21,,Hyderabad,Hyderabad,1
" Aisha Khan ",20,aisha@example.com,Warangal,Warangal,0
Meera,,meera@example.com, Warangal ,Warangal,3
,, , , ,4`
  },
  {
    id: 'ecommerce_leads',
    name: 'E-Commerce Customer Leads',
    description: 'Messy CRM export with duplicate customer entries, whitespace in phone numbers, empty rows, and unformatted headings.',
    filename: 'customers_export_raw.csv',
    csvData: `Client Name  ,  Contact Email , Phone Number, Status , Status, Country , Index_ID
  Lucas Silva  , lucas@company.org , +1 555-0192 , Active , Active , Brazil , 101
Elena Rostova , elena@techcorp.io ,  +44 20 7946 , Pending , Pending , UK , 102
  Lucas Silva  , lucas@company.org , +1 555-0192 , Active , Active , Brazil , 101
David Chen , , +86 10 6554 , Inactive , Inactive , China , 104
,,,,, , 105
  Fatima Al-Mansoor , fatima@gulf.ae ,  , Active , Active , UAE , 106
Elena Rostova , elena@techcorp.io ,  +44 20 7946 , Pending , Pending , UK , 102
Marcus Vance , marcus@vance.com , +1 555-8831 ,  ,  , USA , 108`
  },
  {
    id: 'finance_ledger',
    name: 'Financial Ledger Transactions',
    description: 'Raw accounts report with duplicate transaction IDs, blank memo lines, and trailing spaces in currency amounts.',
    filename: 'financial_ledger_q3.csv',
    csvData: `Transaction ID , Date , Description , Amount , Amount , Category , unnamed: 0
TXN-9081 , 2026-08-01 , Server Hosting AWS , -420.50 , -420.50 , Infrastructure , 1
TXN-9082 , 2026-08-02 , Client Retainer Acme , 3500.00 , 3500.00 , Revenue , 2
TXN-9081 , 2026-08-01 , Server Hosting AWS , -420.50 , -420.50 , Infrastructure , 1
TXN-9083 , 2026-08-03 , Office Supplies Staples , -84.20 , -84.20 , Office , 4
, , , , , , 5
TXN-9084 , 2026-08-05 , , 1200.00 , 1200.00 , Consulting , 6
TXN-9085 , 2026-08-08 , Software Subscriptions , -199.00 , -199.00 , SaaS , 7`
  }
];

export const DEMO_URLS = [
  {
    label: '⚡ Test Duplicate URL (/api/test-duplicates)',
    url: '/api/test-duplicates'
  },
  {
    label: 'CleanSlate Sample CSV (Local Link)',
    url: '/api/sample-messy'
  },
  {
    label: 'World Bank Population Sample (GitHub Raw)',
    url: 'https://raw.githubusercontent.com/datasets/population/master/data/population.csv'
  },
  {
    label: 'Google Sheet Public CSV Demo',
    url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv'
  }
];
