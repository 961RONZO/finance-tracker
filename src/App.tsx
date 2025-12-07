import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type TransactionScope = "personal" | "business";

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  date: string
  note: string
  scope: TransactionScope
}

const STORAGE_KEY = 'finance-tracker-transactions'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("finance-tracker-transactions");
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Handle older data: default missing scope to "personal"
      return parsed.map((t: any) => ({
        ...t,
        scope: t.scope || "personal"
      }));
    } catch (e) {
      console.error("Failed to parse transactions from localStorage", e);
      return [];
    }
  })
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [viewMode, setViewMode] = useState<"month" | "all">("month")
  const [scopeFilter, setScopeFilter] = useState<"all" | "personal" | "business">("all")

  // Form state
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: 'expense',
    amount: 0,
    category: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    scope: 'personal'
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [customCategory, setCustomCategory] = useState<string>('')

  const CATEGORIES = ['Food', 'Rent', 'Subscriptions', 'Transport', 'Shopping', 'Business', 'Savings', 'Custom']

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "finance-tracker-transactions",
        JSON.stringify(transactions)
      );
    } catch (e) {
      console.error("Failed to save transactions to localStorage", e);
    }
  }, [transactions])

  // Filter transactions by selected month and year or all transactions based on viewMode
  const timeFilteredTransactions = viewMode === "all" 
    ? transactions
    : transactions.filter(t => {
        const transactionDate = new Date(t.date)
        const transactionMonth = transactionDate.getFullYear() + '-' + String(transactionDate.getMonth() + 1).padStart(2, '0')
        const transactionYear = transactionDate.getFullYear().toString()
        return transactionMonth === selectedMonth && transactionYear === selectedYear
      })

  // Apply scope filter
  const filteredTransactions = scopeFilter === "all"
    ? timeFilteredTransactions
    : timeFilteredTransactions.filter(t => t.scope === scopeFilter)

  // Calculate summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpenses

  // Prepare chart data by category
  const categoryData = filteredTransactions.reduce((acc, t) => {
    const key = t.category || 'Uncategorized'
    if (!acc[key]) {
      acc[key] = { name: key, income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      acc[key].income += t.amount
    } else {
      acc[key].expense += t.amount
    }
    return acc
  }, {} as Record<string, { name: string; income: number; expense: number }>)

  const chartData = Object.values(categoryData).map(cat => ({
    name: cat.name,
    income: cat.income,
    expense: cat.expense
  }))

  const pieData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const key = t.category || 'Uncategorized'
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key] += t.amount
      return acc
    }, {} as Record<string, number>)

  const pieChartData = Object.entries(pieData).map(([name, value]) => ({
    name,
    value
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Determine the final category value
    const finalCategory = selectedCategory === 'Custom' 
      ? customCategory.trim() 
      : selectedCategory
    
    if (!finalCategory || formData.amount <= 0) {
      alert('Please fill in all required fields with valid values.')
      return
    }

    const newTransaction: Transaction = {
      ...formData,
      category: finalCategory,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    setTransactions([...transactions, newTransaction])
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
      scope: 'personal'
    })
    setSelectedCategory('')
    setCustomCategory('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.')
      return
    }

    const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Note', 'Scope']
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.amount.toString(),
      t.category,
      t.date,
      t.note,
      t.scope
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate month and year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
      value: `${selectedYear}-${String(month).padStart(2, '0')}`,
      label: new Date(parseInt(selectedYear), i, 1).toLocaleString('default', { month: 'long' })
    }
  })

  return (
    <div className="app">
      <h1>💰 Personal Finance Tracker</h1>

      {/* Add Transaction Form */}
      <div className="section">
        <h2 className="section-title">Add New Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  if (e.target.value !== 'Custom') {
                    setCustomCategory('')
                  }
                }}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {selectedCategory === 'Custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  style={{ marginTop: '8px' }}
                  required={selectedCategory === 'Custom'}
                />
              )}
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Optional note about this transaction"
            />
          </div>
          <div className="form-group">
            <label>Scope *</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  value="personal"
                  checked={formData.scope === 'personal'}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as TransactionScope })}
                  required
                />
                <span>Personal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  value="business"
                  checked={formData.scope === 'business'}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as TransactionScope })}
                  required
                />
                <span>Business</span>
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Transaction</button>
        </form>
      </div>

      {/* Filter Controls */}
      <div className="section">
        <div className="filter-controls">
          <div>
            <label style={{ marginRight: '8px' }}>Year:</label>
            <select value={selectedYear} onChange={(e) => {
              setSelectedYear(e.target.value)
              setSelectedMonth(e.target.value + '-' + selectedMonth.slice(5))
            }} disabled={viewMode === "all"}>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginRight: '8px' }}>Month:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={viewMode === "all"}>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginRight: '8px' }}>Scope:</label>
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as "all" | "personal" | "business")}>
              <option value="all">All scopes</option>
              <option value="personal">Personal only</option>
              <option value="business">Business only</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="btn btn-secondary">Export to CSV</button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="section" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ marginRight: '8px', fontWeight: 600, color: 'var(--text-luxury)' }}>View:</label>
          <button
            onClick={() => setViewMode("month")}
            className={`btn ${viewMode === "month" ? "btn-primary" : "btn-secondary"}`}
            style={{ 
              padding: '10px 20px',
              opacity: viewMode === "month" ? 1 : 0.7
            }}
          >
            This month
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`btn ${viewMode === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ 
              padding: '10px 20px',
              opacity: viewMode === "all" ? 1 : 0.7
            }}
          >
            All time
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary">
        <div className="summary-card income">
          <h3>Total Income</h3>
          <div className="amount">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
          <h3>Total Expenses</h3>
          <div className="amount">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className="summary-card balance">
          <h3>Net Balance</h3>
          <div className="amount">${netBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* Charts */}
      {filteredTransactions.length > 0 && (
        <div className="section">
          <h2 className="section-title">Charts</h2>
          {chartData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#27ae60" name="Income" />
                  <Bar dataKey="expense" fill="#e74c3c" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {pieChartData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="section">
        <h2 className="section-title">Transactions</h2>
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>{viewMode === "month" ? "No transactions found for the selected month." : "No transactions found."}</p>
            <p>Add a transaction to get started!</p>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Scope</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(transaction => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td>
                      <span style={{ 
                        textTransform: 'capitalize',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85em',
                        fontWeight: 500,
                        background: transaction.scope === 'business' 
                          ? 'rgba(139, 92, 246, 0.1)' 
                          : 'rgba(212, 175, 55, 0.1)',
                        color: transaction.scope === 'business' 
                          ? '#7c3aed' 
                          : '#b8941e'
                      }}>
                        {transaction.scope}
                      </span>
                    </td>
                    <td className={transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td>{transaction.note || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App

