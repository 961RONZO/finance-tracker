import type { AdRow, DashboardMetrics, MetricInsight, SeriesPoint } from './types'

export function computeMetrics(rows: AdRow[]): DashboardMetrics {
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0)
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totalReach = rows.reduce((s, r) => s + (r.reach ?? 0), 0)
  const totalResults = rows.reduce((s, r) => s + (r.results ?? 0), 0)
  const totalConversionValue = rows.reduce((s, r) => s + (r.conversionValue ?? 0), 0)
  const totalPurchases = rows.reduce((s, r) => s + (r.purchases ?? 0), 0)
  const totalAddsToCart = rows.reduce((s, r) => s + (r.addsToCart ?? 0), 0)
  const totalCheckoutsInitiated = rows.reduce((s, r) => s + (r.checkoutsInitiated ?? 0), 0)
  const totalLandingPageViews = rows.reduce((s, r) => s + (r.landingPageViews ?? 0), 0)
  const totalVideoPlays25 = rows.reduce((s, r) => s + (r.videoPlays25 ?? 0), 0)
  const totalVideoPlays50 = rows.reduce((s, r) => s + (r.videoPlays50 ?? 0), 0)
  const totalVideoPlays75 = rows.reduce((s, r) => s + (r.videoPlays75 ?? 0), 0)
  const totalVideoPlays100 = rows.reduce((s, r) => s + (r.videoPlays100 ?? 0), 0)
  const totalUniqueLinkClicks = rows.reduce((s, r) => s + (r.uniqueLinkClicks ?? 0), 0)
  const totalOutboundClicks = rows.reduce((s, r) => s + (r.outboundClicks ?? 0), 0)

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
  const roas = totalSpend > 0 ? totalConversionValue / totalSpend : 0
  const costPerResult = totalResults > 0 ? totalSpend / totalResults : 0
  const costPerPurchase = totalPurchases > 0 ? totalSpend / totalPurchases : 0

  const totalFrequency = rows.reduce((s, r) => s + (r.frequency ?? 0), 0)
  const countWithFrequency = rows.filter((r) => r.reach != null && r.reach > 0).length
  const avgFrequency = countWithFrequency > 0 ? totalFrequency / countWithFrequency : 0

  const cartToCheckoutRate =
    totalAddsToCart > 0 ? (totalCheckoutsInitiated / totalAddsToCart) * 100 : 0
  const checkoutToPurchaseRate =
    totalCheckoutsInitiated > 0 ? (totalPurchases / totalCheckoutsInitiated) * 100 : 0

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    avgCtr,
    avgCpc,
    avgCpm,
    totalReach,
    avgFrequency,
    totalResults,
    totalConversionValue,
    roas,
    costPerResult,
    totalPurchases,
    costPerPurchase,
    totalAddsToCart,
    totalCheckoutsInitiated,
    totalLandingPageViews,
    totalVideoPlays25,
    totalVideoPlays50,
    totalVideoPlays75,
    totalVideoPlays100,
    totalUniqueLinkClicks,
    totalOutboundClicks,
    cartToCheckoutRate,
    checkoutToPurchaseRate,
  }
}

/** Build time series by date for charts */
export function buildTimeSeries(rows: AdRow[]): SeriesPoint[] {
  const byDate: Record<string, AdRow[]> = {}
  for (const r of rows) {
    const d = r.date || 'Unknown'
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(r)
  }

  return Object.entries(byDate)
    .map(([date, list]) => {
      const spend = list.reduce((s, r) => s + r.spend, 0)
      const impressions = list.reduce((s, r) => s + r.impressions, 0)
      const clicks = list.reduce((s, r) => s + r.clicks, 0)
      const conversions = list.reduce((s, r) => s + (r.results ?? 0), 0)
      const conversionValue = list.reduce((s, r) => s + (r.conversionValue ?? 0), 0)
      const purchases = list.reduce((s, r) => s + (r.purchases ?? 0), 0)
      const addsToCart = list.reduce((s, r) => s + (r.addsToCart ?? 0), 0)
      const checkoutsInitiated = list.reduce((s, r) => s + (r.checkoutsInitiated ?? 0), 0)
      const landingPageViews = list.reduce((s, r) => s + (r.landingPageViews ?? 0), 0)
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      const cpc = clicks > 0 ? spend / clicks : 0
      return {
        date,
        spend,
        impressions,
        clicks,
        ctr,
        cpc,
        conversions,
        conversionValue,
        purchases,
        addsToCart,
        checkoutsInitiated,
        landingPageViews,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Build campaign-level breakdown */
export function buildCampaignBreakdown(
  rows: AdRow[]
): { name: string; spend: number; conversions: number; conversionValue: number; purchases: number }[] {
  const byCampaign: Record<
    string,
    { spend: number; conversions: number; conversionValue: number; purchases: number }
  > = {}
  for (const r of rows) {
    const name = r.campaignName || 'Unnamed'
    if (!byCampaign[name]) {
      byCampaign[name] = { spend: 0, conversions: 0, conversionValue: 0, purchases: 0 }
    }
    byCampaign[name].spend += r.spend
    byCampaign[name].conversions += r.results ?? 0
    byCampaign[name].conversionValue += r.conversionValue ?? 0
    byCampaign[name].purchases += r.purchases ?? 0
  }
  return Object.entries(byCampaign).map(([name, data]) => ({
    name,
    spend: data.spend,
    conversions: data.conversions,
    conversionValue: data.conversionValue,
    purchases: data.purchases,
  }))
}

/** Generate insights (good/bad metrics) from metrics and thresholds */
export function generateInsights(
  metrics: DashboardMetrics,
  options: {
    goodCtrMin?: number
    badCpcMax?: number
    goodRoasMin?: number
    badCpmMax?: number
  } = {}
): MetricInsight[] {
  const {
    goodCtrMin = 1.5,
    badCpcMax = 2,
    goodRoasMin = 2,
    badCpmMax = 50,
  } = options

  const insights: MetricInsight[] = []

  if (metrics.avgCtr >= goodCtrMin) {
    insights.push({
      type: 'good',
      label: 'CTR',
      value: `${metrics.avgCtr.toFixed(2)}%`,
      description: 'Click-through rate is above target.',
      suggestion: 'Consider scaling winning ads or audiences.',
    })
  } else if (metrics.avgCtr > 0 && metrics.avgCtr < 0.5) {
    insights.push({
      type: 'bad',
      label: 'CTR',
      value: `${metrics.avgCtr.toFixed(2)}%`,
      description: 'Low click-through rate.',
      suggestion: 'Test new creatives, audiences, or placements; pause underperforming ads.',
    })
  }

  if (metrics.avgCpc > 0) {
    if (metrics.avgCpc <= badCpcMax) {
      insights.push({
        type: 'good',
        label: 'CPC',
        value: `$${metrics.avgCpc.toFixed(2)}`,
        description: 'Cost per click is in a healthy range.',
      })
    } else {
      insights.push({
        type: 'bad',
        label: 'CPC',
        value: `$${metrics.avgCpc.toFixed(2)}`,
        description: 'High cost per click.',
        suggestion: 'Refine targeting, test cheaper placements, or improve ad relevance.',
      })
    }
  }

  if (metrics.avgCpm > 0) {
    if (metrics.avgCpm > badCpmMax) {
      insights.push({
        type: 'bad',
        label: 'CPM',
        value: `$${metrics.avgCpm.toFixed(2)}`,
        description: 'Cost per 1,000 impressions is high.',
        suggestion: 'Narrow audience or test different creative formats.',
      })
    }
  }

  if (metrics.totalConversionValue > 0 && metrics.totalSpend > 0) {
    if (metrics.roas >= goodRoasMin) {
      insights.push({
        type: 'good',
        label: 'ROAS',
        value: `${metrics.roas.toFixed(2)}x`,
        description: 'Return on ad spend is strong.',
        suggestion: 'Scale budget on best-performing campaigns.',
      })
    } else if (metrics.roas < 1) {
      insights.push({
        type: 'bad',
        label: 'ROAS',
        value: `${metrics.roas.toFixed(2)}x`,
        description: 'Spend is higher than conversion value.',
        suggestion: 'Pause or reduce underperforming campaigns; optimize for conversions.',
      })
    }
  }

  if (metrics.totalSpend > 0 && metrics.totalClicks === 0) {
    insights.push({
      type: 'bad',
      label: 'Clicks',
      value: '0',
      description: 'No clicks despite spend.',
      suggestion: 'Review targeting and creative; consider different objectives or placements.',
    })
  }

  if (metrics.totalPurchases > 0) {
    insights.push({
      type: 'good',
      label: 'Purchases',
      value: metrics.totalPurchases.toLocaleString(),
      description: `Total website purchases. Cost per purchase: $${metrics.costPerPurchase.toFixed(2)}`,
    })
  }

  if (metrics.totalAddsToCart > 0) {
    if (metrics.cartToCheckoutRate < 20) {
      insights.push({
        type: 'bad',
        label: 'Cart → Checkout',
        value: `${metrics.cartToCheckoutRate.toFixed(1)}%`,
        description: 'Low rate from add to cart to checkout.',
        suggestion: 'Simplify checkout flow; check shipping and payment friction.',
      })
    }
  }

  if (metrics.totalCheckoutsInitiated > 0 && metrics.checkoutToPurchaseRate < 50) {
    insights.push({
      type: 'bad',
      label: 'Checkout → Purchase',
      value: `${metrics.checkoutToPurchaseRate.toFixed(1)}%`,
      description: 'Many checkouts not converting to purchases.',
      suggestion: 'Reduce checkout abandonment (trust badges, guest checkout, retargeting).',
    })
  }

  if (metrics.totalReach > 0) {
    insights.push({
      type: 'neutral',
      label: 'Reach',
      value: metrics.totalReach.toLocaleString(),
      description: `Unique accounts reached. Avg frequency: ${metrics.avgFrequency.toFixed(2)}x`,
    })
  }

  return insights
}
