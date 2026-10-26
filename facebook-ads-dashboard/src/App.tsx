import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { parseFacebookAdCsv } from './csvParser'
import {
  computeMetrics,
  buildTimeSeries,
  buildCampaignBreakdown,
  generateInsights,
} from './metrics'
import type { AdRow, MetricInsight } from './types'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function App() {
  const [rawRows, setRawRows] = useState<AdRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result)
        const rows = parseFacebookAdCsv(text)
        setRawRows(rows)
        if (rows.length === 0) setParseError('No rows found in CSV. Check column headers.')
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV')
        setRawRows([])
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const metrics = useMemo(() => computeMetrics(rawRows), [rawRows])
  const timeSeries = useMemo(() => buildTimeSeries(rawRows), [rawRows])
  const campaignBreakdown = useMemo(() => buildCampaignBreakdown(rawRows), [rawRows])
  const insights = useMemo(() => generateInsights(metrics), [metrics])

  const hasData = rawRows.length > 0

  return (
    <div className="app">
      <header className="header">
        <h1>Facebook Ads Dashboard</h1>
        <p className="subtitle">Upload your ad report CSV to see metrics, charts, and actionable insights</p>
      </header>

      <section className="section upload-section">
        <h2 className="section-title">Upload report</h2>
        <label className="upload-label">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="upload-input"
          />
          <span className="upload-button">Choose CSV file</span>
          {fileName && <span className="upload-filename">{fileName}</span>}
        </label>
        {parseError && <p className="error">{parseError}</p>}
      </section>

      {!hasData && (
        <section className="section empty-state">
          <p>Export your Facebook Ads report as CSV (Campaign, Ad Set, or Ad level) and upload it above.</p>
          <p>Common columns: Date, Campaign name, Impressions, Clicks, Spend, CTR, CPC, CPM, Results, etc.</p>
        </section>
      )}

      {hasData && (
        <>
          {/* Summary metrics */}
          <section className="section">
            <h2 className="section-title">Summary</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Total spend</span>
                <span className="metric-value">{formatCurrency(metrics.totalSpend)}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Impressions</span>
                <span className="metric-value">{metrics.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Reach</span>
                <span className="metric-value">{metrics.totalReach.toLocaleString()}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg frequency</span>
                <span className="metric-value">{metrics.avgFrequency.toFixed(2)}x</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Clicks</span>
                <span className="metric-value">{metrics.totalClicks.toLocaleString()}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Unique link clicks</span>
                <span className="metric-value">{metrics.totalUniqueLinkClicks.toLocaleString()}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg CTR</span>
                <span className="metric-value">{metrics.avgCtr.toFixed(2)}%</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg CPC</span>
                <span className="metric-value">{formatCurrency(metrics.avgCpc)}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Avg CPM</span>
                <span className="metric-value">{formatCurrency(metrics.avgCpm)}</span>
              </div>
              {metrics.totalConversionValue > 0 && (
                <>
                  <div className="metric-card">
                    <span className="metric-label">Conversion value</span>
                    <span className="metric-value">{formatCurrency(metrics.totalConversionValue)}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">ROAS</span>
                    <span className="metric-value">{metrics.roas.toFixed(2)}x</span>
                  </div>
                </>
              )}
              {metrics.totalResults > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Cost per result</span>
                  <span className="metric-value">{formatCurrency(metrics.costPerResult)}</span>
                </div>
              )}
              {metrics.totalPurchases > 0 && (
                <>
                  <div className="metric-card">
                    <span className="metric-label">Purchases</span>
                    <span className="metric-value">{metrics.totalPurchases.toLocaleString()}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Cost per purchase</span>
                    <span className="metric-value">{formatCurrency(metrics.costPerPurchase)}</span>
                  </div>
                </>
              )}
              {metrics.totalAddsToCart > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Adds to cart</span>
                  <span className="metric-value">{metrics.totalAddsToCart.toLocaleString()}</span>
                </div>
              )}
              {metrics.totalCheckoutsInitiated > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Checkouts initiated</span>
                  <span className="metric-value">{metrics.totalCheckoutsInitiated.toLocaleString()}</span>
                </div>
              )}
              {metrics.totalLandingPageViews > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Landing page views</span>
                  <span className="metric-value">{metrics.totalLandingPageViews.toLocaleString()}</span>
                </div>
              )}
              {(metrics.totalVideoPlays25 > 0 || metrics.totalVideoPlays100 > 0) && (
                <>
                  <div className="metric-card">
                    <span className="metric-label">Video 25%</span>
                    <span className="metric-value">{metrics.totalVideoPlays25.toLocaleString()}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Video 100%</span>
                    <span className="metric-value">{metrics.totalVideoPlays100.toLocaleString()}</span>
                  </div>
                </>
              )}
              {metrics.totalAddsToCart > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Cart → Checkout rate</span>
                  <span className="metric-value">{metrics.cartToCheckoutRate.toFixed(1)}%</span>
                </div>
              )}
              {metrics.totalCheckoutsInitiated > 0 && (
                <div className="metric-card">
                  <span className="metric-label">Checkout → Purchase rate</span>
                  <span className="metric-value">{metrics.checkoutToPurchaseRate.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </section>

          {/* Funnel */}
          {(metrics.totalAddsToCart > 0 || metrics.totalCheckoutsInitiated > 0 || metrics.totalPurchases > 0) && (
            <section className="section">
              <h2 className="section-title">Conversion funnel</h2>
              <div className="funnel-row">
                {metrics.totalLandingPageViews > 0 && (
                  <div className="funnel-step">
                    <span className="funnel-value">{metrics.totalLandingPageViews.toLocaleString()}</span>
                    <span className="funnel-label">Landing page views</span>
                  </div>
                )}
                {metrics.totalAddsToCart > 0 && (
                  <div className="funnel-step">
                    <span className="funnel-value">{metrics.totalAddsToCart.toLocaleString()}</span>
                    <span className="funnel-label">Adds to cart</span>
                  </div>
                )}
                {metrics.totalCheckoutsInitiated > 0 && (
                  <div className="funnel-step">
                    <span className="funnel-value">{metrics.totalCheckoutsInitiated.toLocaleString()}</span>
                    <span className="funnel-label">Checkouts initiated</span>
                  </div>
                )}
                {metrics.totalPurchases > 0 && (
                  <div className="funnel-step">
                    <span className="funnel-value">{metrics.totalPurchases.toLocaleString()}</span>
                    <span className="funnel-label">Purchases</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Insights / Quick actions */}
          {insights.length > 0 && (
            <section className="section insights-section">
              <h2 className="section-title">Insights & quick actions</h2>
              <div className="insights-grid">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {/* Charts */}
          <section className="section">
            <h2 className="section-title">Charts</h2>

            {timeSeries.length > 0 && (
              <div className="chart-block">
                <h3 className="chart-title">Spend & results over time</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name.includes('spend') || name.includes('value') ? formatCurrency(value) : value
                        }
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="spend"
                        name="Spend"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="clicks"
                        name="Clicks"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                      {timeSeries.some((d) => (d.conversionValue ?? 0) > 0) && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="conversionValue"
                          name="Conversion value"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                      {timeSeries.some((d) => (d.purchases ?? 0) > 0) && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="purchases"
                          name="Purchases"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {campaignBreakdown.length > 0 && (
              <>
                <div className="chart-block">
                  <h3 className="chart-title">Spend by campaign</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={campaignBreakdown} layout="vertical" margin={{ left: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="spend" name="Spend" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {campaignBreakdown.some((c) => c.purchases > 0) && (
                  <div className="chart-block">
                    <h3 className="chart-title">Purchases by campaign</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={campaignBreakdown.filter((c) => c.purchases > 0)}
                          layout="vertical"
                          margin={{ left: 120 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="purchases" name="Purchases" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}

            {campaignBreakdown.length > 0 && campaignBreakdown.some((c) => c.conversionValue > 0) && (
              <div className="chart-block">
                <h3 className="chart-title">Conversion value by campaign</h3>
                <div className="chart-container pie-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={campaignBreakdown.filter((c) => c.conversionValue > 0)}
                        dataKey="conversionValue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {campaignBreakdown.filter((c) => c.conversionValue > 0).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>

          {/* Data table (optional, first 50 rows) */}
          <section className="section">
            <h2 className="section-title">Data preview (first 50 rows)</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Campaign</th>
                    <th>Impressions</th>
                    <th>Reach</th>
                    <th>Clicks</th>
                    <th>Spend</th>
                    <th>CTR %</th>
                    <th>CPC</th>
                    <th>Purchases</th>
                    <th>Conv. value</th>
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      <td>{row.date}</td>
                      <td title={row.campaignName}>{row.campaignName.slice(0, 30)}{row.campaignName.length > 30 ? '…' : ''}</td>
                      <td>{row.impressions.toLocaleString()}</td>
                      <td>{(row.reach ?? 0).toLocaleString()}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{formatCurrency(row.spend)}</td>
                      <td>{row.ctr.toFixed(2)}%</td>
                      <td>{formatCurrency(row.cpc)}</td>
                      <td>{(row.purchases ?? row.results ?? 0).toLocaleString()}</td>
                      <td>{row.conversionValue != null ? formatCurrency(row.conversionValue) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function InsightCard({ insight }: { insight: MetricInsight }) {
  const isGood = insight.type === 'good'
  const isBad = insight.type === 'bad'
  return (
    <div className={`insight-card ${isGood ? 'insight-good' : isBad ? 'insight-bad' : 'insight-neutral'}`}>
      <div className="insight-header">
        <span className="insight-label">{insight.label}</span>
        <span className="insight-value">{insight.value}</span>
      </div>
      <p className="insight-desc">{insight.description}</p>
      {insight.suggestion && <p className="insight-suggestion">{insight.suggestion}</p>}
    </div>
  )
}

export default App
