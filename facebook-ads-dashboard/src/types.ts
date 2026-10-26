/** Single row from parsed Facebook Ads report (normalized) */
export interface AdRow {
  date: string
  campaignName: string
  adSetName: string
  adName: string
  impressions: number
  clicks: number
  spend: number
  ctr: number
  cpc: number
  cpm: number
  reach?: number
  frequency?: number
  results?: number
  costPerResult?: number
  conversionValue?: number
  /** Purchase ROAS (return on ad spend) */
  purchaseRoas?: number
  /** Results ROAS */
  resultsRoas?: number
  /** Adds to cart */
  addsToCart?: number
  /** Checkouts initiated */
  checkoutsInitiated?: number
  /** Landing page views */
  landingPageViews?: number
  /** Purchases (website purchases) */
  purchases?: number
  /** Cost per purchase */
  costPerPurchase?: number
  /** Video plays at 25% */
  videoPlays25?: number
  /** Video plays at 50% */
  videoPlays50?: number
  /** Video plays at 75% */
  videoPlays75?: number
  /** Video plays at 95% */
  videoPlays95?: number
  /** Video plays at 100% */
  videoPlays100?: number
  /** Unique link clicks */
  uniqueLinkClicks?: number
  /** Outbound clicks */
  outboundClicks?: number
  /** Unique outbound clicks */
  uniqueOutboundClicks?: number
  /** CPC (cost per link click) */
  cpcLink?: number
  /** Cost per unique link click */
  costPerUniqueLinkClick?: number
  /** Optional: Age, Gender, Delivery status for breakdowns */
  age?: string
  gender?: string
  deliveryStatus?: string
}

/** Aggregated metrics for the dashboard */
export interface DashboardMetrics {
  totalSpend: number
  totalImpressions: number
  totalClicks: number
  avgCtr: number
  avgCpc: number
  avgCpm: number
  totalReach: number
  avgFrequency: number
  totalResults: number
  totalConversionValue: number
  roas: number
  costPerResult: number
  totalPurchases: number
  costPerPurchase: number
  totalAddsToCart: number
  totalCheckoutsInitiated: number
  totalLandingPageViews: number
  totalVideoPlays25: number
  totalVideoPlays50: number
  totalVideoPlays75: number
  totalVideoPlays100: number
  totalUniqueLinkClicks: number
  totalOutboundClicks: number
  cartToCheckoutRate: number
  checkoutToPurchaseRate: number
}

/** Insight: good or bad metric for quick action */
export interface MetricInsight {
  type: 'good' | 'bad' | 'neutral'
  label: string
  value: string
  description: string
  suggestion?: string
}

/** Daily/weekly series point for charts */
export interface SeriesPoint {
  date: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  conversions?: number
  conversionValue?: number
  purchases?: number
  addsToCart?: number
  checkoutsInitiated?: number
  landingPageViews?: number
}
