# Personal Finance Tracker

A simple React + TypeScript single-page application for tracking personal income and expenses.

## Features

- ✅ Add income and expense transactions
- ✅ View all transactions in a table
- ✅ Filter transactions by month and year
- ✅ Monthly summary (total income, expenses, net balance)
- ✅ Visual charts (bar chart and pie chart by category)
- ✅ Export all transactions to CSV
- ✅ Data persisted in browser localStorage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Usage

1. **Add a Transaction**: Fill in the form with transaction details (type, amount, category, date, and optional note) and click "Add Transaction".

2. **Filter Transactions**: Use the year and month dropdowns to filter transactions by a specific period.

3. **View Summary**: The summary cards show total income, total expenses, and net balance for the selected month.

4. **View Charts**: 
   - Bar chart shows income vs expenses by category
   - Pie chart shows expense distribution by category

5. **Export Data**: Click "Export to CSV" to download all transactions as a CSV file.

6. **Delete Transactions**: Click the "Delete" button on any transaction row to remove it.

## Data Storage

All data is stored in your browser's localStorage. This means:
- Data persists between sessions
- Data is specific to your browser/device
- Clearing browser data will remove all transactions

## Technologies Used

- React 18
- TypeScript
- Vite
- Recharts (for charts)

