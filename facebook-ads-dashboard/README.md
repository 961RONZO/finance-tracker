# Facebook Ads Dashboard

Upload a Facebook Ads report CSV and see **metrics**, **charts**, and **actionable insights** to stay profitable.

## Features

- **CSV upload** – Export your report from Facebook Ads Manager (Campaign, Ad Set, or Ad level) as CSV and upload it.
- **Summary metrics** – Total spend, impressions, clicks, CTR, CPC, CPM, conversion value, ROAS, cost per result.
- **Charts** – Spend and clicks over time; spend by campaign; conversion value by campaign (pie).
- **Insights & quick actions** – Automatically highlights metrics that are performing well (green) or need attention (red), with short suggestions.
- **Data preview** – First 50 rows in a table.

## How to get your CSV from Facebook

1. Go to [Facebook Ads Manager](https://business.facebook.com/adsmanager).
2. Select the campaigns/date range you want.
3. Click **Reports** → **Export table data** (or use the export option in your report view).
4. Choose **CSV** and download.
5. Upload the file in this app.

## Supported columns

The parser tries to recognize common column names (case-insensitive), including:

- **Date** – Reporting starts, Start date, Day
- **Campaign** – Campaign name
- **Ad set** – Ad set name
- **Ad** – Ad name
- **Impressions**, **Clicks**, **Link Clicks**, **Spend**, **Amount Spent**
- **CTR**, **CPC**, **CPM**, **Reach**, **Frequency**
- **Results**, **Conversions**, **Cost per result**, **Purchase conversion value**, etc.

If your export uses different headers, the app may still work if they are similar; otherwise you can rename columns in the CSV to match.

## Run locally

```bash
cd facebook-ads-dashboard
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`) and upload your CSV.

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18, TypeScript, Vite
- Recharts for charts
- PapaParse for CSV parsing
